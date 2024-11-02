import { levelData as configLevelData } from "../../config/config";

export class Magic {
    constructor(configObj) {
        this.configObj = configObj
    }

    initialize() {
        this.gridStartXPos = this.configObj.percentOfWidth(0.175);
        this.initGridStartYPos = 368;
        this.gapBetweenObj = 81;

        this.totalRows = 7;
        this.totalCols = 7;
        this.starCounter = 0;
        this.groupFormed = 0;
        this.gameTimeCounter = 0;
        this.gridStartYPos = this.initGridStartYPos;
        this.index = 0;
        this.randomNoContainer = new Array(7);
        for (let i = 0; i < 7; i++) {
            this.randomNoContainer[i] = new Array(7);
        }
        this.scoreMultiplier = 30;
        this.currentLevel = this.configObj.levelNo;
        this.currentLevelData = configLevelData[this.configObj.levelNo];
        this.configObj.levelClear = false;
        this.powerUpActivated = false;
        this.levelTarget = this.currentLevelData.targetScore;
        this.newTimer = null;
        this.killAnimationComplete = false;
        this.horizontalMatchedMonsterArray = new Array();
        this.lineArr = new Array();
        this.verticalMatchedMonsterArray = new Array();
        this.selectedMatchesArr = new Array();
        this.swapperMatchesArr = new Array();
        this.automatedMatchedArray = new Array();
        this.removedPos = new Array();
        this.monsterContainer = new Array();
        //        this.objYPositionContainer = new Array();
        this.hintArray = new Array();
        this.matchesFound = false;
        this.monsterAnimIndex;
        this.MonsterState = "moving";
        this.mouseDownX = this.mouseDownY = 0;
        this.mouseUpX = this.mouseUpY = 0;
        this.thresHold = 20;
        this.containerSize;
        this.selectedMonster = null;
        this.swapperMonster = null;
        this.selectedMonsterPos;
        this.swapperMonsterPos;
        this.totalPositionUpdateCounter = 0;
        this.tweenAnimationCounter = 0;
        this.endDropAnimCounter = 0;
        this.destroyAnimation = 0;
        this.destroyAnimationComplete = 0;
        this.hintLoopEvent;
        this.powerUpData = {};
        this.powerUpUsedFlag = null;
        this.scoreId = -1;
        this.monsterFrenzyAnimFlag = false;
        this.startHintTimer = true;
    }

    preload() {

    }

    async create() {
        this.game.inputEnabled = true;
        if (false || !!document.documentMode) {
            this.game.stage.disableVisibilityChange = true;
        }

        this.initialize();
        this.blankStarArr = new Array();
        this.textAnimation = false;
        this.score = 0;
        this.hintTimer = 0;
        this.total_moves_left = this.currentLevelData.moves;
        this.jellyBrakedArray = new Array();
        this.jellyContianer = new Array();
        this.jellyBreakContianer = new Array();
        this.powUpMonster = new Array();
        this.unlockMonsterArr = new Array();
        this.configObj.currLevelStatus = {
            "levelStarted": true,
            "levelCleared": false
        };
        await this.configObj.gameState.updateData({ curr_level_status: this.configObj.currLevelStatus });

        this.jellyCount = this.currentLevelData.jelly.length;

        //      Audio
        this.new_spawnSound = this.game.add.audio("new_spawn");
        this.resetPos_sound = this.game.add.audio("wrong_move");
        this.swipe_sound = this.game.add.audio("swipe");
        this.bg_sound = this.game.add.audio('bg_sound');
        this.no_more_moves = this.game.add.audio('no_more_moves');
        this.powermonster = this.game.add.audio('powermonster');
        this.jellybreak = this.game.add.audio('jellybreak');
        this.punch = this.game.add.audio("punch");
        this.configObj.playAudio(this.bg_sound, true);
        //       Mouse Move callback
        this.game.input.mouse.mouseMoveCallback = this.mouseMoveCallBack.bind(this);
        this.game.input.touch.touchMoveCallback = this.mouseMoveCallBack.bind(this);
        //let powerUpData = JSON.parse(localStorage.getItem('powerUpCount'));
        let powerUpData = this.configObj.availablePowerUp;
        this.inGameTutorial = false;

        this.diffFactorForPlacement = 65;
        this.backGroundImg1 = this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "Game_background_mbl");
        this.game.inputEnabled = true;
        this.blockLayer = this.game.add.group();
        this.blockLayer.z = 0;
        this.MonsterLayer = this.game.add.group();
        this.MonsterLayer.z = 1;
        this.effectLayer = this.game.add.group();
        this.effectLayer.z = 2;
        this.tint_Bg = this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "tint_background");
        this.tint_Bg.visible = false;
        this.jellyLayer = this.game.add.group();
        this.jellyLayer.z = 4;
        this.tutLayer = this.game.add.group();
        this.tutLayer.z = 5;
        this.tint_Bg.scale.y = 1.5;
        this.tutLayer.add(this.tint_Bg);
        this.footerLayer = this.game.add.group();
        this.footerLayer.z = 3;
        this.footer = this.game.add.sprite(-50, 995, "footer");
        this.footerLayer.add(this.footer);
        this.hud_BGLayer = this.game.add.sprite(85, 0, "hud_BGLayer");
        this.footerLayer.add(this.hud_BGLayer);
        this.progressBar = this.game.add.sprite(25, 21, "spriteAtlas1", "progress_bar.png");
        this.progressBar.anchor.setTo(0.5, 0.5);
        this.footerLayer.add(this.progressBar);
        this.headerImg = this.game.add.sprite(-19, -78, "header");
        this.footerLayer.add(this.headerImg);
        this.blankStarLayer = this.game.add.group();
        this.blankStarLayer.z = 6;
        for (let i = 1; i < 4; i++) {
            let xDiff = 55 * i;
            let blank = this.game.add.sprite(this.progressBar.x + this.progressBar.width / 2 + xDiff, 50, "spriteAtlas1", "inGameBlankStar.png");
            blank.anchor.setTo(0.5, 0.5);
            this.blankStarArr.push(blank);
            this.footerLayer.add(this.blankStarArr[this.blankStarArr.length - 1]);
        }
        this.levelMovesText = this.game.add.text(35, 750 + 270, this.configObj.languageData["levelInfo"]["levelMoves"] + "\n" + this.total_moves_left, {
            font: "32px londrina",
            fill: "#e9f4ff",
            align: "center",
            lineSpacing: -10
        });
        this.footerLayer.add(this.levelMovesText);
        this.settingBtn = this.game.add.button(569, 10, "spriteAtlas", this.showSettings, this);
        this.settingBtn.frameName = "mbl_settings.png";
        this.footerLayer.add(this.settingBtn);
        this.footerLayer.add(this.game.add.text(13, 10, this.configObj.languageData["levelInfo"]["title"] + "\n" + this.currentLevel, { font: "25px londrina", fill: "#e9f4ff", align: "center" }));
        this.game.add.text(365, 10, "Target " + this.levelTarget, { font: "32px londrina", fill: "#FFDC4E", align: "center" });
        this.levelScoreText = this.game.add.text(538, 750 + 270, this.configObj.languageData["levelInfo"]["levelScore"] + " \n" + this.score, { font: "35px londrina", fill: "#e9f4ff", align: "center" });
        this.universalPowerBtn = this.game.add.button(205, 769 + 270, "universalPowerUp", this.powerUpUsed.bind(this, 'wand'), this, 0, 0, 1, 0);
        let style = { font: "24px londrina", fill: "#f5a3ff", align: "center" };
        this.universalPowerUpCount = this.game.add.text(207, 765 + 270, "" + powerUpData["universal"], style);
        this.universalPowerUpCount.anchor.setTo(0.5, 0.5);
        this.ringPowerBtn = this.game.add.button(303, 768 + 270, "powerUpRing", this.powerUpUsed.bind(this, 'ring'), this, 0, 0, 1, 0);
        this.ringPowerUpCount = this.game.add.text(297, 765 + 270, "" + powerUpData["powerUpRing"], style);
        this.ringPowerUpCount.anchor.setTo(0.5, 0.5);
        this.extraMovesBtn = this.game.add.button(387, 768 + 270, "addMoreMoves", this.powerUpUsed.bind(this, 'extramoves'), this, 0, 0, 1, 0);
        this.extraMovesPowerUpCount = this.game.add.text(387, 765 + 270, "" + powerUpData["addMoreMoves"], style);
        this.extraMovesPowerUpCount.anchor.setTo(0.5, 0.5);

        let inGameTut = this.game.add.group();
        let tutBg = this.game.add.sprite(this.configObj.percentOfWidth(0), 315, "spriteAtlas", "bg_ingame_tut.png");
        inGameTut.add(tutBg);

        let tutText = this.game.add.text(this.configObj.percentOfWidth(0.465), 420, "" + this.configObj.languageData["levelStartText"][this.configObj.levelNo - 1], { font: "32px londrina", fill: "#a26829", align: "center" });
        inGameTut.add(tutText);
        tutText.anchor.setTo(0.5, 0.5);
        this.tutLayer.add(inGameTut);
        inGameTut.x = -this.configObj.percentOfWidth(1.7);
        let tutTween = this.game.add.tween(inGameTut).to({ x: this.configObj.percentOfWidth(0.03) }, 300, Phaser.Easing.Back.Out, true, 800);
        tutTween.onComplete.add(() => {
            let tween1 = this.game.add.tween(inGameTut).to({ x: this.configObj.percentOfWidth(1) }, 300, Phaser.Easing.Back.In, true, 1300);
            tween1.onComplete.add(() => {
                this.inGameTutorial = true;
                inGameTut.destroy();
                this.MonsterState = "stady";
            });
        });

        this.generateRandomNo();
        this.gameTimerEvent = this.game.time.events.loop(Phaser.Timer.SECOND / 2, this.gameTimer, this);
    }

    async gameTimer() {
        this.gameTimeCounter++;
        if (this.gameTimeCounter == 1) {
            await this.automatedChecking();
        }
        if (!this.configObj.levelClear) {
            if (this.monsterAnimIndex != undefined && this.monsterContainer[this.monsterAnimIndex] != undefined && this.monsterContainer[this.monsterAnimIndex].type != "universal" && this.gameTimeCounter % 4 == 0) {
                this.monsterContainer[this.monsterAnimIndex].animations.stop(true, false);
            }
            let index = Math.floor(Math.random() * 48);
            if (index != this.monsterAnimIndex && this.gameTimeCounter % 4 == 0 && this.monsterContainer[index] != undefined && this.monsterContainer[index].monsterType != "block") {
                this.monsterContainer[index].play('blinkEyes', 1.5, true);
                this.monsterAnimIndex = index;
            }

            if (this.startHintTimer) {
                this.hintTimer++;
                if (this.hintTimer % 10 == 0 && this.startHintTimer) {
                    this.hintArray.splice(0, this.hintArray.length);
                    await this.showHint();
                    this.startHintTimer = false;
                }
            }
        }
    }

    generateRandomNo() {
        this.setButtonState(true);
        for (let i = 0; i < this.totalRows; i++) {
            for (let j = 0; j < this.totalCols; j++) {
                this.randomNoContainer[i][j] = Math.floor(Math.random() * 6);
            }
        }
        this.verifyContainer();
    }

    verifyContainer() {
        for (let i = 0; i < this.totalRows; i++) {
            for (let j = 0; j < this.totalCols; j++) {
                if ((j + 1) < this.totalRows && this.randomNoContainer[i][j] == this.randomNoContainer[i][j + 1]) {
                    if ((j + 2) < this.totalRows && this.randomNoContainer[i][j + 1] == this.randomNoContainer[i][j + 2]) {
                        this.randomNoContainer[i][j + 2] = this.replaceValue(this.randomNoContainer[i][j + 2]);
                    }
                }
                if ((i + 1) < this.totalCols && this.randomNoContainer[i][j] == this.randomNoContainer[i + 1][j]) {
                    if ((i + 2) < this.totalCols && this.randomNoContainer[i + 1][j] == this.randomNoContainer[i + 2][j]) {
                        this.randomNoContainer[i + 2][j] = this.replaceValue(this.randomNoContainer[i + 2][j]);
                    }
                }
            }
        }
        this.generateMonsters();
    }
    
    generateMonsters() {
        if (this.inGameTutorial) {
            this.MonsterState = " stady";
        }
        let xPos = this.gridStartXPos;
        for (let i = 0; i < this.totalRows; i++) {
            for (let j = 0; j < this.totalCols; j++) {
                if (this.currentLevelData.block.indexOf(this.index) != -1) {
                    this.monsterContainer[this.index] = this.game.add.sprite(xPos, this.gridStartYPos, "spriteAtlas1", "block_box.png");
                    this.blockLayer.add(this.monsterContainer[this.index]);
                    this.monsterContainer[this.index].imageId = 7;
                    this.monsterContainer[this.index].anchor.setTo(1, 1);
                    this.monsterContainer[this.index].monsterType = "block";
                }
                else if (this.powUpMonster.length > 0 && this.powUpMonster.hasOwnProperty(this.index)) {
                    if (this.powUpMonster[this.index].monsterType == "super") {
                        this.monsterContainer[this.index] = this.game.add.sprite(xPos, 10, 'super' + this.powUpMonster[this.index].imageId);
                        this.MonsterLayer.add(this.monsterContainer[this.index]);
                        this.monsterContainer[this.index].loadTexture('super' + this.powUpMonster[this.index].imageId, 0);
                        this.monsterContainer[this.index].animations.add('blinkEyes');
                        this.monsterContainer[this.index].imageId = this.powUpMonster[this.index].imageId;
                        //               combination - Type -> 3 - Normal, 4 - superMonster, 5 - universalMonster, Block
                        this.monsterContainer[this.index].monsterType = "super";
                    }
                    else {
                        this.monsterContainer[this.index] = this.game.add.sprite(xPos, 10, "universal");
                        this.monsterContainer[this.index].imageId = 6;
                        this.monsterContainer[this.index].monsterType = "universal";

                    }
                    this.monsterContainer[this.index].anchor.setTo(1, 1);
                    this.monsterContainer[this.index].inputEnabled = true;
                    this.monsterContainer[this.index].events.onInputDown.add(this.mouseDownCallBack.bind(this, this.monsterContainer[this.index]), this);
                    this.monsterContainer[this.index].events.onInputUp.add(this.mouseUpCallBack.bind(this, this.monsterContainer[this.index]), this);
                }
                else {
                    let temp = this.randomNoContainer[i][j];
                    this.monsterContainer[this.index] = this.game.add.sprite(xPos, 10, 'monster' + temp);
                    this.MonsterLayer.add(this.monsterContainer[this.index]);
                    this.monsterContainer[this.index].loadTexture('monster' + temp, 0);
                    this.monsterContainer[this.index].animations.add('blinkEyes');
                    this.monsterContainer[this.index].imageId = temp;
                    this.monsterContainer[this.index].anchor.setTo(1, 1);
                    this.monsterContainer[this.index].inputEnabled = true;
                    this.monsterContainer[this.index].events.onInputDown.add(this.mouseDownCallBack.bind(this, this.monsterContainer[this.index]), this);
                    this.monsterContainer[this.index].events.onInputUp.add(this.mouseUpCallBack.bind(this, this.monsterContainer[this.index]), this);
                    //               combination - Type -> 3 - Normal, 4 - superMonster, 5 - universalMonster, Block
                    this.monsterContainer[this.index].monsterType = "normal";
                }
                this.configObj.objYPositionContainer.push(this.gridStartYPos);
                xPos += this.gapBetweenObj;
                this.index++;
            }
            this.gridStartYPos += this.gapBetweenObj;
            xPos = this.gridStartXPos;
        }
        this.powUpMonster.splice(0, this.powUpMonster.length);
        this.containerSize = this.monsterContainer.length;
        if (this.currentLevelData.jelly.length > 0 && this.jellyContianer.length == 0) {
            for (let i = 0; i < this.currentLevelData.jelly.length; i++) {
                this.jellyContianer[i] = this.game.add.sprite(this.monsterContainer[this.currentLevelData.jelly[i]].x, this.configObj.objYPositionContainer[this.currentLevelData.jelly[i]], "spriteAtlas1", "jelly.png");
                this.jellyContianer[i].anchor.setTo(1, 1);
                this.jellyLayer.add(this.jellyContianer[i]);

                this.jellyBreakContianer[i] = this.game.add.sprite(this.monsterContainer[this.currentLevelData.jelly[i]].x, this.configObj.objYPositionContainer[this.currentLevelData.jelly[i]], 'jelly_animation');
                this.jellyBreakContianer[i].anchor.setTo(0.6, 0.63);
                this.jellyBreakContianer[i].loadTexture('jelly_animation', 0);
                this.jellyBreakContianer[i].animations.add('jelly_animation');
                this.jellyBreakContianer[i].visible = false;
                this.jellyLayer.add(this.jellyBreakContianer[i]);
            }
        }
        this.startDropAnim();
    }

    startDropAnim() {
        let dropAnim, dropAnim1, dropAnim2, dropAnim3;
        for (let i = 0; i < this.containerSize; i++) {
            if (this.monsterContainer[i].monsterType != "block") {
                dropAnim = this.game.add.tween(this.monsterContainer[i]).to({ y: this.configObj.objYPositionContainer[i] }, 300, Phaser.Easing.Sinusoidal.In);
                dropAnim1 = this.game.add.tween(this.monsterContainer[i].scale).to({ x: 1, y: 0.8 }, 120, Phaser.Easing.Sinusoidal.In);
                dropAnim2 = this.game.add.tween(this.monsterContainer[i].scale).to({ x: 1, y: 1.2 }, 120, Phaser.Easing.Sinusoidal.In);
                dropAnim3 = this.game.add.tween(this.monsterContainer[i].scale).to({ x: 1, y: 1 }, 120, Phaser.Easing.Sinusoidal.In);

                dropAnim.chain(dropAnim1);
                dropAnim1.chain(dropAnim2);
                dropAnim2.chain(dropAnim3);
                dropAnim.start();
            }
        }
    }

    async endDropAnim() {
        this.endDropAnimCounter = 0;
        this.startHintTimer = false;
        this.MonsterState = "moving";
        for (let i = this.containerSize - 1; i >= 0; i--) {
            if (this.monsterContainer[i].monsterType != "block") {
                let tween = this.game.add.tween(this.monsterContainer[i]).to({ y: this.configObj.objYPositionContainer[i] + 800 }, 400, null, true, (this.containerSize - i) * 20);

                tween.onComplete.add(async () => {
                    this.endDropAnimCounter++;
                    if (this.endDropAnimCounter == this.containerSize - this.currentLevelData.block.length - 2) {
                        for (let i = 0; i < this.containerSize; i++) {
                            this.monsterContainer[i].destroy();
                        }
                        this.monsterContainer.splice(0, this.containerSize);
                        this.configObj.currentLevelScore = this.score;
                        this.configObj.levelClear = (this.jellyCount == 0 && this.score >= this.levelTarget) ? true : false;
                        let levelInfo = this.configObj.getLevelInfo(this.currentLevel - 1);
                        if (!this.configObj.levelClear && levelInfo == null) {
                            await this.configObj.addItems(this.currentLevel, 0, this.configObj.currentLevelScore, this.configObj.levelClear, this.configObj.currentLevelScore);
                        }

                        if (this.total_moves_left == 0) {
                            this.bg_sound.stop();
                            this.bg_sound = null;
                            this.setButtonState(false);
                            let starCount;
                            if (this.configObj.levelClear) {
                                starCount = Math.floor(this.configObj.currentLevelScore / this.currentLevelData.targetScore);
                                if (starCount > 3)
                                    starCount = 3;
                                if (levelInfo == null) {
                                    await this.configObj.addItems(this.currentLevel, starCount, this.configObj.currentLevelScore, this.configObj.levelClear, this.configObj.currentLevelScore);
                                }
                                else {
                                    if (this.configObj.currentLevelScore > levelInfo.score) {
                                        let totalScore = this.configObj.currentLevelScore + levelInfo.totalScore;
                                        let obj = {
                                            "number": this.currentLevel,
                                            "stars": starCount,
                                            "score": this.configObj.currentLevelScore,
                                            "level_cleared": this.configObj.levelClear,
                                            "total_score": totalScore || 0
                                        };
                                        this.configObj.oldLevelData[this.currentLevel - 1] = obj;
                                        await this.configObj.gameState.pushLevel(this.configObj.oldLevelData[this.currentLevel - 1]);
                                    }
                                }
                            }
                            let monsterUnlocked = await this.checkforMonsterUnlock();
                            if (!monsterUnlocked) {
                                if (this.configObj.levelNo == 50 && this.configObj.levelClear) {
                                    this.game.tweens.removeAll();
                                    this.game.state.start('GameOver');
                                }

                                else {
                                    if (!this.configObj.levelClear && levelInfo != null && this.configObj.currentLevelScore > levelInfo.score) {
                                        let totalScore = this.configObj.currentLevelScore + levelInfo.totalScore;
                                        let obj = {
                                            "number": this.currentLevel,
                                            "stars": starCount,
                                            "score": this.configObj.currentLevelScore,
                                            "level_cleared": this.configObj.levelClear,
                                            "total_score": totalScore || 0
                                        };
                                        this.configObj.oldLevelData[this.currentLevel - 1] = obj;
                                        await this.configObj.gameState.pushLevel(this.configObj.oldLevelData[this.currentLevel - 1]);
                                    }
                                    this.game.tweens.removeAll();
                                    this.game.state.start('LevelUp');
                                }
                            }
                        }
                        else {
                            this.setButtonState(false);
                            this.gridStartYPos = this.initGridStartYPos;
                            this.game.time.events.remove(this.hintLoopEvent);
                            this.game.tweens.removeAll();
                            this.initialize();
                            this.generateRandomNo();
                        }
                    }
                });
            }
        }
    }

    closePopUpUnlock(container) {
        this.close_Unlockbtn.inputEnabled = false;
        this.setButtonState(true);
        let anim = this.game.add.tween(container.scale).to({ x: 0.5, y: 0.5 }, 400, Phaser.Easing.Back.In, true);
        this.game.add.tween(container.position).to({ x: 0, y: 0 }, 400, Phaser.Easing.Back.In, true);
        anim.onComplete.add(() => {
            container.destroy(true);
            if (this.configObj.levelClear) {
                if (this.bg_sound) {
                    this.bg_sound.stop();
                    this.bg_sound = null;
                }
                if (this.configObj.levelNo == 50) {
                    this.game.tweens.removeAll();
                    this.game.state.start('GameOver');
                }
                else {
                    this.game.tweens.removeAll();
                    this.game.state.start('LevelUp');
                }
            }
        });
    }

    replaceValue(val) {
        let temp = Math.floor(Math.random() * 6);
        while (temp == val) {
            temp = Math.floor(Math.random() * 6);
        }
        return temp;
    }

    mouseMoveCallBack() {
        if (this.selectedMonster != null && this.MonsterState != "moving") {
            this.selectedMonsterPos = this.monsterContainer.indexOf(this.selectedMonster);
            let rowNo = Math.floor(this.selectedMonsterPos / this.totalRows);
            let colNo = this.selectedMonsterPos % this.totalCols;
            let xDiff = this.mouseDownX - this.mouseUpX;
            let yDiff = this.mouseDownY - this.mouseUpY;
            if (this.MonsterState == "stady" && (this.mouseDownX != this.mouseUpX || this.mouseDownY != this.mouseUpY)) {
                xDiff = Math.abs(this.mouseDownX - this.game.input.activePointer.x);
                yDiff = Math.abs(this.mouseDownY - this.game.input.activePointer.y);
                if (this.mouseDownX > 0 || this.mouseDownY > 0) {

                    //         Direction Left/Right
                    if (xDiff > yDiff && xDiff >= this.thresHold) {
                        //                Left Direction
                        if (this.mouseDownX > this.game.input.activePointer.x) {
                            if (colNo - 1 >= 0) {
                                this.swapMonsters("left", this.selectedMonsterPos);
                            }
                        }
                        else {
                            //                    Right direction
                            if (colNo + 1 < this.totalCols) {
                                this.swapMonsters("right", this.selectedMonsterPos);
                            }
                        }
                        this.mouseDownX = this.mouseDownY = 0;
                    }
                    //          Direction Up/Down
                    else if (yDiff >= this.thresHold) {

                        if (this.mouseDownY > this.game.input.activePointer.y) {
                            //                  Upward Direction
                            if (rowNo - 1 >= 0) {
                                this.swapMonsters("up", this.selectedMonsterPos);
                            }
                        }
                        else {
                            //                    Downward Direction
                            if (rowNo + 1 < this.totalRows) {
                                this.swapMonsters("down", this.selectedMonsterPos);
                            }
                        }
                        this.mouseDownX = this.mouseDownY = 0;
                    }
                }
            }
            else {
                this.selectedMonster = null;
                this.startHintTimer = true;
            }
        }
    }

    async mouseDownCallBack(obj) {
        this.game.time.events.remove(this.hintLoopEvent);
        this.startHintTimer = false;
        if (this.MonsterState == "stady" && obj.monsterType != "block") {
            if (this.inGameTutorial && !this.textAnimation && this.hintArray.length > 0) {
                this.game.tweens.removeAll();
            }

            for (let i = 0; i < this.hintArray.length; i++) {
                let tempIndex = this.hintArray[i];
                this.monsterContainer[tempIndex].scale.y = 1;
                this.monsterContainer[tempIndex].y = this.configObj.objYPositionContainer[tempIndex];
            }
            this.hintArray.splice(0, this.hintArray.length);
            this.hintTimer = 0;
            this.matchesFound = false;
            this.selectedMonster = obj;
            this.mouseDownX = this.game.input.activePointer.x;
            this.mouseDownY = this.game.input.activePointer.y;
        }
        if (this.powerUpUsedFlag != "addMoreMoves" && this.selectedMonster != null) {
            let tempArr = new Array();
            if (this.powerUpUsedFlag == "universal" && this.selectedMonster.monsterType != "universal") {
                this.MonsterState = "moving";
                this.universalPowerBtn.freezeFrames = false;
                this.universalPowerBtn.setFrames(0, 0, 1, 0);
                let pos = this.monsterContainer.indexOf(this.selectedMonster);
                let type = this.monsterContainer[pos].monsterType;
                let imgId = this.monsterContainer[pos].imageId;
                this.scoreId = imgId;
                this.monsterContainer[pos].destroy();
                this.monsterContainer[pos] = this.game.add.sprite(this.selectedMonster.x, this.selectedMonster.y, "universal");
                this.monsterContainer[pos].imageId = imgId;
                this.monsterContainer[pos].monsterType = type;
                this.monsterContainer[pos].anchor.setTo(1, 1);
                this.monsterFrenzyAnim(pos, imgId);
                this.selectedMonster = null;
                this.powerUpUsedFlag = null;
                let count = await this.configObj.updatePowerUp('universal');
                if (count >= 0) {
                    this.universalPowerUpCount.text = "" + count;
                }
            } else if (this.powerUpUsedFlag == "powerUpRing" && this.selectedMonster.monsterType != "universal") {
                this.MonsterState = "moving";
                this.ringPowerBtn.freezeFrames = false;
                this.ringPowerBtn.setFrames(0, 0, 1, 0);
                this.ringImg = this.game.add.sprite(this.selectedMonster.x - 70, this.selectedMonster.y - 70, "spriteAtlas", "powerUpRing.png");
                let ringAnim = this.game.add.tween(this.ringImg.scale).to({ x: 2, y: 2 }, 350, Phaser.Easing.Bounce.Out);
                let ringAnim1 = this.game.add.tween(this.ringImg.scale).to({ x: 1.2, y: 1.2 }, 350, Phaser.Easing.Bounce.Out);
                ringAnim.chain(ringAnim1);
                ringAnim.start();
                this.scoreId = this.selectedMonster.imageId;
                this.powerUpUsedFlag = null;
                ringAnim1.onComplete.add(() => {
                    this.configObj.playAudio(this.punch, false);
                    this.ringImg.destroy();
                    let pos = this.monsterContainer.indexOf(this.selectedMonster);
                    if (this.selectedMonster.monsterType == "super") {
                        this.configObj.playAudio(this.powermonster, false);
                        this.addHorizontalEffect(this.selectedMonster, this.selectedMonster.imageId);
                        this.addVerticalEffect(this.selectedMonster, this.selectedMonster.imageId);
                        this.addStarsHorizontal(this.selectedMonster.x, this.selectedMonster.y - 40, this.selectedMonster.imageId);
                        this.scoreId = this.selectedMonster.imageId;
                        this.powerUpActivated = true;
                        this.scoreMultiplier = 20;
                        let rowStartPos = Math.floor(pos / 7) * this.totalRows;
                        let rowEndPos = rowStartPos + this.totalRows;
                        tempArr.push(this.selectedMonster);
                        for (let m = rowStartPos; m < rowEndPos; m++) {
                            if (this.monsterContainer[m].monsterType != "block") {
                                tempArr.push(this.monsterContainer[m]);
                            }
                        }
                        let colPos = this.monsterContainer.indexOf(this.selectedMonster) % 7;
                        for (let m = colPos; m < this.containerSize; m += 7) {
                            if (this.monsterContainer[m].monsterType != "block")
                                tempArr.push(this.monsterContainer[m]);
                        }
                    }
                    else {
                        tempArr.push(this.selectedMonster);
                    }
                    this.clearMatchedElements(tempArr);
                    this.selectedMonster = null;
                    this.powerUpUsedFlag = null;
                });
                let count = await this.configObj.updatePowerUp('powerUpRing');
                if (count >= 0) {
                    this.ringPowerUpCount.text = "" + count;
                }
            } else if (this.selectedMonster.monsterType == "universal" && this.powerUpActivated) {
                this.selectedMonster = null;
                this.powerUpUsedFlag = null;
                this.powerUpActivated = false;
                tempArr.splice(0, tempArr.length);
                this.ringPowerBtn.freezeFrames = false;
                this.universalPowerBtn.freezeFrames = false;
                this.universalPowerBtn.setFrames(0, 0, 1, 0);
                this.ringPowerBtn.setFrames(0, 0, 1, 0);
                this.setButtonState(true);
            }
        }
    }

    mouseUpCallBack() {
        this.mouseUpX = this.game.input.activePointer.x;
        this.mouseUpY = this.game.input.activePointer.y;
    }

    swapMonsters(direction, index) {
        switch (direction) {
            case "left":
                this.swapperMonster = this.monsterContainer[index - 1];
                this.swapperMonsterPos = index - 1;
                break;

            case "right":
                this.swapperMonster = this.monsterContainer[index + 1];
                this.swapperMonsterPos = index + 1;
                break;

            case "up":
                this.swapperMonster = this.monsterContainer[index - this.totalRows];
                this.swapperMonsterPos = index - this.totalRows;
                break;

            case "down":
                this.swapperMonster = this.monsterContainer[index + this.totalRows];
                this.swapperMonsterPos = index + this.totalRows;
                break;
        }
        this.changePosition(this.selectedMonster, index, this.swapperMonster, this.swapperMonsterPos);
    }

    changePosition(obj1, obj1Index, obj2, obj2Index) {

        if (this.MonsterState == "stady" && (obj1.monsterType != "block" && obj2.monsterType != "block")) {
            this.configObj.playAudio(this.swipe_sound);
            this.MonsterState = "moving";
            this.game.add.tween(obj1).to({ x: obj2.x, y: this.configObj.objYPositionContainer[obj2Index] }, 180, null, true);
            let tween = this.game.add.tween(obj2).to({ x: obj1.x, y: this.configObj.objYPositionContainer[obj1Index] }, 180, null, true);
            let temp = obj1;
            this.monsterContainer[this.selectedMonsterPos] = obj2;
            this.monsterContainer[this.swapperMonsterPos] = temp;
            this.selectedMonsterPos = this.monsterContainer.indexOf(this.selectedMonster);
            this.swapperMonsterPos = this.monsterContainer.indexOf(this.swapperMonster);
            tween.onComplete.add(() => {
                if (this.selectedMonster.monsterType != "universal" && this.swapperMonster.monsterType != "universal") {
                    this.checkforMatches();
                }
                else if (this.selectedMonster.monsterType == "universal" && this.swapperMonster.monsterType == "universal") {
                    this.resetPosition(this.selectedMonster, this.swapperMonster);
                }
                else {
                    this.powerUpActivated = true;
                    this.deleteSameType(obj1, obj2);
                }
            }, this);
        }
    }

    resetPosition(obj1, obj2) {
        this.selectedMonster = null;
        this.configObj.playAudio(this.resetPos_sound);
        this.game.add.tween(obj1).to({ x: obj2.x, y: obj2.y }, 180, null, true);
        let tween = this.game.add.tween(obj2).to({ x: obj1.x, y: obj1.y }, 180, null, true);
        let temp = obj1;
        this.monsterContainer[this.selectedMonsterPos] = obj2;
        this.monsterContainer[this.swapperMonsterPos] = temp;
        this.selectedMonsterPos = this.monsterContainer.indexOf(this.selectedMonster);
        this.swapperMonsterPos = this.monsterContainer.indexOf(this.swapperMonster);

        tween.onComplete.add(() => {
            this.MonsterState = "stady";
            this.hintTimer = 0;
            this.startHintTimer = true;
        });
    }

    checkforMatches() {
        let matches = new Array();
        let selId = this.selectedMonster.imageId;
        let selIndex = this.selectedMonsterPos;
        let selRowNo = Math.floor(selIndex / 7);
        let selColNo = selIndex % 7;
        let swapperId = this.swapperMonster.imageId;
        let swapperIndex = this.swapperMonsterPos;
        let swapperRowNo = Math.floor(swapperIndex / this.totalCols);
        let swapperColNo = swapperIndex % this.totalCols;

        //       Horizontal  Matches for monster
        this.checkHorizontalValuesInGrid(this.selectedMonster, selId, selColNo, selRowNo, selIndex, this.selectedMatchesArr);
        this.checkHorizontalValuesInGrid(this.swapperMonster, swapperId, swapperColNo, swapperRowNo, swapperIndex, this.swapperMatchesArr);

        if (this.horizontalMatchedMonsterArray.length >= 3) {
            matches = this.horizontalMatchedMonsterArray;
        }
        //       Vertical Matches for Monster
        this.checkVerticalValuesInGrid(this.selectedMonster, selId, selColNo, selRowNo, selIndex, this.selectedMatchesArr);
        this.checkVerticalValuesInGrid(this.swapperMonster, swapperId, swapperColNo, swapperRowNo, swapperIndex, this.swapperMatchesArr);
        if (this.selectedMatchesArr.length >= 4) {
            this.checkforPowerUp(this.selectedMatchesArr, this.selectedMonsterPos, this.selectedMatchesArr[0].imageId);
        }
        if (this.swapperMatchesArr.length >= 4) {
            this.checkforPowerUp(this.swapperMatchesArr, this.swapperMonsterPos, this.swapperMatchesArr[0].imageId);
        }
        if (this.verticalMatchedMonsterArray.length >= 3) {
            matches = matches.concat(this.verticalMatchedMonsterArray);
        }
        if (matches.length >= 3) {
            this.clearMatchedElements(matches);
            this.updateMoves();
        }
        if (this.verticalMatchedMonsterArray.length < 3 && this.horizontalMatchedMonsterArray.length < 3 && this.matchesFound == false) {
            this.resetPosition(this.selectedMonster, this.swapperMonster);
            this.horizontalMatchedMonsterArray.splice(0, this.horizontalMatchedMonsterArray.length);
            this.selectedMatchesArr.splice(0, this.selectedMatchesArr.length);
            this.swapperMatchesArr.splice(0, this.swapperMatchesArr.length);
            this.verticalMatchedMonsterArray.splice(0, this.verticalMatchedMonsterArray.length);
            return;
        }
    }

    deleteSameType(obj1, obj2) {
        this.scoreMultiplier = 90;
        let universalMonster, swapperMonster;
        let matchesArr = new Array();
        let superMatches = new Array();
        if (obj1.monsterType == "universal") {
            universalMonster = obj1;
            swapperMonster = obj2;
        }
        else {
            universalMonster = obj2;
            swapperMonster = obj1;
        }
        matchesArr.push(universalMonster);
        for (let i = 0; i < this.containerSize; i++) {
            if (swapperMonster.imageId == this.monsterContainer[i].imageId) {
                if (this.monsterContainer[i].monsterType == "super") {
                    this.configObj.playAudio(this.powermonster, false);
                    this.addHorizontalEffect(this.monsterContainer[i], this.monsterContainer[i].imageId);
                    this.addVerticalEffect(this.monsterContainer[i], this.monsterContainer[i].imageId);
                    this.addStarsHorizontal(this.monsterContainer[i].x, this.monsterContainer[i].y - 40, this.monsterContainer[i].imageId);
                    this.powerUpActivated = true;
                    this.scoreMultiplier = 20;
                    let rowStartPos = Math.floor(i / 7) * this.totalRows;
                    let rowEndPos = rowStartPos + this.totalRows;
                    for (let m = rowStartPos; m < rowEndPos; m++) {
                        if (this.monsterContainer[m].monsterType != "block") {
                            superMatches.push(this.monsterContainer[m]);
                        }
                    }
                    let colPos = i % 7;
                    for (let m = colPos; m < this.containerSize; m += 7) {
                        if (this.monsterContainer[m].monsterType != "block")
                            superMatches.push(this.monsterContainer[m]);
                    }
                }
                if (superMatches.indexOf(this.monsterContainer[i]) == -1 && matchesArr.indexOf(this.monsterContainer[i]) == -1) {
                    matchesArr.push(this.monsterContainer[i]);
                }
            }
        }
        this.scoreId = swapperMonster.imageId;
        this.drawElectricEffect(matchesArr, this.scoreId);
        this.updateMoves();
        let finalClear = matchesArr.concat(superMatches);
        this.clearMatchedElements(finalClear);
    }

    drawElectricEffect(matchesArr, imgId) {
        this.lineArr.splice(0, this.lineArr.length);
        let colorCode = ["#9b4a1c", "#25acad", "#ffa30d", "#fa6100", "#6b7c90", "#d32959"];
        this.colorCode = colorCode[imgId];
        let bmd = this.game.add.bitmapData(this.game.width, this.game.height);
        for (let i = 1; i < matchesArr.length; i++) {
            bmd.context.beginPath();
            bmd.context.moveTo(matchesArr[0].x - 40, matchesArr[0].y - 30);
            bmd.context.lineTo(matchesArr[i].x - 40, matchesArr[i].y - 30);
            bmd.context.strokeStyle = this.colorCode;
            bmd.context.lineWidth = 2;
            bmd.context.stroke();
            this.lineArr[i] = this.game.add.sprite(0, 0, bmd);
            let temp = this.lineArr[i];
            let tween = this.game.add.tween(temp).to({ alpha: 0.3 }, 60, null, true, 0, 3, true);
            tween.onComplete.add(function (temp) {
                temp.destroy(true);
            });
        }
        this.configObj.playAudio(this.powermonster, false);
    }
    updateMoves() {
        this.total_moves_left -= 1;
        this.levelMovesText.text = "Moves\n " + this.total_moves_left;
    }

    updateScore(totalMatches, id) {
        this.score += this.scoreMultiplier * totalMatches;
        let currScore = this.scoreMultiplier * totalMatches;
        if (totalMatches >= 3 && !this.powerUpActivated) {
            let num = (totalMatches == 4 || totalMatches == 5) ? 2 : 1;
            this.animateScore(currScore, 'score' + id, this.monsterContainer[this.removedPos[num]]);
        }
        else if (this.powerUpActivated) {
            this.powerUpActivated = false;
            this.animateScore(this.scoreMultiplier, 'score' + id, this.removedPos);
        }

        this.levelScoreText.text = "Score \n" + this.score;
        this.checkStars(this.scoreMultiplier * totalMatches, this.score);
        this.configObj.levelClear = (this.score >= this.levelTarget && this.jellyCount == 0) ? true : false;
    }

    checkStars(currScore, levelScore) {
        let star = Math.floor(levelScore / this.levelTarget);
        let starPos;

        starPos = 55 * star;
        let divisor = this.levelTarget / 54.5;
        let xDiff = currScore / divisor;

        this.progressBar.x = this.progressBar.x + xDiff <= 200 ? this.progressBar.x + xDiff : 200;
        if (this.starCounter < star && star < 4 && star > 0) {
            let blankStar = this.blankStarArr[star - 1];
            //            this.footerLayer.remove(this.blankStarArr[star - 1]);
            this.blankStarLayer.add(blankStar);
            this.starCounter = star;
            this.animateText("" + this.starCounter);
            this.game.add.sprite(115 + starPos, 49, "spriteAtlas1", "inGamestar.png").anchor.setTo(0.5, 0.5);
        }

    }

    animateScore(value, scoreImg, arr) {
        let digits = value.toString().split('');
        let numContainer = this.game.add.group();
        let xDiff = 0;
        if (arr instanceof Array) {
            for (let i = 0; i < arr.length; i++) {
                xDiff = 0;
                for (let j = 0; j < digits.length; j++) {
                    let num = parseInt(digits[j]);
                    let numImg = this.game.add.sprite(this.monsterContainer[arr[i]].x - 45 + xDiff, this.monsterContainer[arr[i]].y, '' + scoreImg, num);
                    numContainer.add(numImg);
                    numImg.scale.x = 0.9;
                    numImg.scale.y = 0.9;
                    numImg.anchor.setTo(1, 1);
                    let tween = this.game.add.tween(numImg).to({ alpha: 0 }, 400, null, true, 100);
                    let tween1 = this.game.add.tween(numImg).to({ y: numImg.y - 40 }, 400, null, true);
                    tween.chain(tween1);
                    tween.start();
                    tween1.onComplete.add(function () {
                        numContainer.destroy(true);
                    });
                    xDiff += 35;
                }
            }
        }
        else {
            for (let j = 0; j < digits.length; j++) {
                let num = parseInt(digits[j]);
                let numImg = this.game.add.sprite(arr.x - 45 + xDiff, arr.y, '' + scoreImg, num);
                numContainer.add(numImg);
                numImg.scale.x = 0.9;
                numImg.scale.y = 0.9;
                numImg.anchor.setTo(1, 1);
                let tween = this.game.add.tween(numImg).to({ alpha: 0 }, 400, null, true, 100);
                let tween1 = this.game.add.tween(numImg).to({ y: numImg.y - 40 }, 400, null, true);
                tween.chain(tween1);
                tween.start();
                tween1.onComplete.add(function () {
                    numContainer.destroy(true);
                });
                xDiff += 35;
            }
        }

    }
    checkHorizontalValuesInGrid(Obj, Id, colNo, rowNo, index, arr) {
        let matchedArr = new Array();
        let incrementFactor = -1;
        matchedArr.push(Obj);
        for (let i = 0; i < 2; i++) {
            inner_loop:
            for (let j = 1; j < 3; j++) {
                let pos = index + (incrementFactor * j);
                if (pos >= 0 && this.monsterContainer[pos] != undefined && this.monsterContainer[pos].imageId == Id &&
                    ((colNo + (j * incrementFactor) >= 0) && (colNo + (j * incrementFactor) < this.totalCols))) {
                    matchedArr.push(this.monsterContainer[pos]);
                }
                else {
                    break inner_loop;
                }
            }
            incrementFactor = 1;
        }
        let rowStartPos = rowNo * this.totalRows;
        let rowEndPos = rowStartPos + this.totalRows;
        if (matchedArr.length >= 3) {
            this.scoreId = Id;
            for (let k = 0; k < matchedArr.length; k++) {
                if (matchedArr[k].monsterType == "super") {
                    this.configObj.playAudio(this.powermonster, false);
                    this.addHorizontalEffect(matchedArr[k], matchedArr[k].imageId);
                    this.addVerticalEffect(matchedArr[k], matchedArr[k].imageId);
                    this.addStarsHorizontal(matchedArr[k].x, matchedArr[k].y - 40, matchedArr[k].imageId);
                    this.powerUpActivated = true;
                    this.scoreMultiplier = 20;
                    for (let m = rowStartPos; m < rowEndPos; m++) {
                        if (this.monsterContainer[m].monsterType != "block") {
                            this.horizontalMatchedMonsterArray.push(this.monsterContainer[m]);
                        }
                    }
                    let colPos = this.monsterContainer.indexOf(matchedArr[k]) % 7;
                    for (let m = colPos; m < this.containerSize; m += 7) {
                        if (this.monsterContainer[m].monsterType != "block")
                            this.horizontalMatchedMonsterArray.push(this.monsterContainer[m]);
                    }
                    matchedArr.splice(0, matchedArr.length);
                    break;
                }
            }
        }
        if (matchedArr.length >= 3) {
            this.scoreId = Id;
            this.scoreMultiplier = 30;
            for (let j = 0; j < matchedArr.length; j++) {
                this.horizontalMatchedMonsterArray.push(matchedArr[j]);
                if (arr.indexOf(matchedArr[j]) == -1)
                    arr.push(matchedArr[j]);
            }
        }
        matchedArr.splice(0, matchedArr.length);
        if (this.horizontalMatchedMonsterArray.length < 3) {
            this.horizontalMatchedMonsterArray.splice(0, this.horizontalMatchedMonsterArray.length);
        }
    }
    addHorizontalEffect(obj, id) {
        let effect1 = this.game.add.sprite(obj.x - 65, obj.y - 50, "spriteAtlas1", "effect" + id + ".png");
        this.effectLayer.add(effect1);
        let effect2 = this.game.add.sprite(obj.x - 10, obj.y - 50, "spriteAtlas1", "effect" + id + ".png");
        this.effectLayer.add(effect2);
        effect2.scale.x = -1;
        let effect1Tween1 = this.game.add.tween(effect1.scale).to({ x: 6 }, 300, null);
        let effect1Tween2 = this.game.add.tween(effect1).to({ alpha: 0 }, 300, null);
        effect1Tween1.chain(effect1Tween2);
        effect1Tween1.start();

        let effect2Tween1 = this.game.add.tween(effect2.scale).to({ x: -6 }, 300, null);
        let effect2Tween2 = this.game.add.tween(effect2).to({ alpha: 0 }, 300, null);
        effect2Tween1.chain(effect2Tween2);
        effect2Tween1.start();

        effect2Tween1.onComplete.add(function () {
            effect1.destroy(true);
            effect2.destroy(true);
            effect1 = effect2 = null;
        });
    }
    addVerticalEffect(obj, id) {
        let effect1 = this.game.add.sprite(obj.x - 22, obj.y - 50, "spriteAtlas1", "effect" + id + ".png");
        effect1.angle = 90;
        this.effectLayer.add(effect1);
        let effect2 = this.game.add.sprite(obj.x - 60, obj.y - 15, "spriteAtlas1", "effect" + id + ".png");
        this.effectLayer.add(effect2);
        effect2.angle = -90;
        let effect1Tween1 = this.game.add.tween(effect1.scale).to({ x: 10 }, 300, null);
        let effect1Tween2 = this.game.add.tween(effect1).to({ alpha: 0 }, 300, null);
        effect1Tween1.chain(effect1Tween2);
        effect1Tween1.start();

        let effect2Tween1 = this.game.add.tween(effect2.scale).to({ x: 10 }, 300, null);
        let effect2Tween2 = this.game.add.tween(effect2).to({ alpha: 0 }, 300, null);
        effect2Tween1.chain(effect2Tween2);
        effect2Tween1.start();

        effect2Tween1.onComplete.add(function () {
            effect1.destroy(true);
            effect2.destroy(true);
            effect1 = effect2 = null;
        });
    }
    addStarsHorizontal(x, y, type) {
        let startY = y - 30;
        let endY = y + 30;
        for (let i = 0; i < 6; i++) {
            let starX = x - i * 30;
            let starY = Math.random() * (endY - startY) + startY;
            let effect1 = this.game.add.sprite(starX, starY, "spriteAtlas1", "starEffect" + type + ".png");
            effect1.alpha = 0;
            let effect1Tween1 = this.game.add.tween(effect1).to({ alpha: 1 }, 220, null, true, (6 - i) * 20);
            effect1Tween1.onComplete.add(function (effect1) {
                effect1.destroy(true);
            });
        }
        for (let i = 0; i < 6; i++) {
            let starX = x + i * 30;
            let starY = Math.random() * (endY - startY) + startY;
            let effect1 = this.game.add.sprite(starX, starY, "spriteAtlas1", "starEffect" + type + ".png");
            effect1.alpha = 0;
            let effect1Tween1 = this.game.add.tween(effect1).to({ alpha: 1 }, 220, null, true, (6 - i) * 20);
            effect1Tween1.onComplete.add(function (effect1) {
                effect1.destroy(true);
            });
        }
    }

    addStarsVertical(x, y, type) {
        let startX = x - 30;
        let endX = x + 30;
        for (let i = 0; i < 6; i++) {
            let starX = Math.random() * (endX - startX) + startX;
            let starY = y - i * 30;
            let effect1 = this.game.add.sprite(starX, starY, "spriteAtlas1", "starEffect" + type + ".png");
            effect1.alpha = 0;
            let effect1Tween1 = this.game.add.tween(effect1).to({ alpha: 1 }, 150, null, true, (6 - i) * 20);
            effect1Tween1.onComplete.add(function (effect1) {
                effect1.destroy(true);
            });
        }
        for (let i = 0; i < 6; i++) {
            let starX = Math.random() * (endX - startX) + startX;
            let starY = y + i * 30;
            let effect1 = this.game.add.sprite(starX, starY, "spriteAtlas1", "starEffect" + type + ".png");
            effect1.alpha = 0;
            let effect1Tween1 = this.game.add.tween(effect1).to({ alpha: 1 }, 150, null, true, (6 - i) * 20);
            effect1Tween1.onComplete.add(function (effect1) {
                effect1.destroy(true);
            });
        }
    }

    checkVerticalValuesInGrid(Obj, Id, colNo, rowNo, index, arr) {
        let matchesArr = new Array();
        let incrementFactor = -7;
        matchesArr.push(Obj);
        for (let i = 0; i < 2; i++) {
            inner_loop:
            for (let j = 1; j < 3; j++) {
                let pos = index + (incrementFactor * j);
                if (pos >= 0 && this.monsterContainer[pos] != undefined && this.monsterContainer[pos].imageId == Id &&
                    ((index + (incrementFactor * j) <= 49))) {
                    matchesArr.push(this.monsterContainer[pos]);
                }
                else {
                    break inner_loop;
                }
            }
            incrementFactor = 7;
        }

        if (matchesArr.length >= 3) {
            this.scoreId = Id;
            for (let k = 0; k < matchesArr.length; k++) {
                if (matchesArr[k].monsterType == "super") {
                    this.configObj.playAudio(this.powermonster, false);
                    this.addHorizontalEffect(matchesArr[k], matchesArr[k].imageId);
                    this.addVerticalEffect(matchesArr[k], matchesArr[k].imageId);
                    this.addStarsVertical(matchesArr[k].x - 50, matchesArr[k].y - 40, matchesArr[k].imageId);
                    this.powerUpActivated = true;
                    this.scoreMultiplier = 20;
                    let rowStartPos = Math.floor(this.monsterContainer.indexOf(matchesArr[k]) / this.totalRows) * this.totalRows;
                    let rowEndPos = rowStartPos + this.totalRows;
                    let colPos = this.monsterContainer.indexOf(matchesArr[k]) % 7;
                    for (let m = rowStartPos; m < rowEndPos; m++) {
                        if (this.monsterContainer[m].monsterType != "block")
                            this.verticalMatchedMonsterArray.push(this.monsterContainer[m]);
                    }
                    for (let m = colPos; m < this.containerSize; m += 7) {
                        if (this.monsterContainer[m].monsterType != "block")
                            this.verticalMatchedMonsterArray.push(this.monsterContainer[m]);
                    }
                    matchesArr.splice(0, matchesArr.length);
                    break;
                }
            }
        }

        if (matchesArr.length >= 3) {
            this.scoreId = Id;
            this.scoreMultiplier = 30;
            for (let j = 0; j < matchesArr.length; j++) {
                this.verticalMatchedMonsterArray.push(matchesArr[j]);
                if (arr.indexOf(matchesArr[j]) == -1)
                    arr.push(matchesArr[j]);
            }
        }
        matchesArr.splice(0, matchesArr.length);
        if (this.verticalMatchedMonsterArray.length < 3) {
            this.verticalMatchedMonsterArray.splice(0, this.verticalMatchedMonsterArray.length);
        }
    }

    checkforPowerUp(arr, pos, id) {
        let length = arr.length;
        switch (length) {
            case 3:
                break;
            case 4:
                this.powerUpData[pos] = {
                    "imageId": id,
                    "powerUpType": "super"
                };
                this.scoreMultiplier = 60;
                break;
            case 5:
            case 6:
            case 7:
            case 8:
            case 9:
            case 10:
                this.powerUpData[pos] = {
                    "imageId": 6,
                    "powerUpType": "universal"
                };
                this.scoreMultiplier = 90;
                break;
        }
    }

    clearMatchedElements(arr) {
        this.setButtonState(false);
        this.selectedMonster = null;
        this.killAnimationComplete = false;
        this.MonsterState = "moving";
        this.hintTimer = 0;
        this.startHintTimer = false;
        let Id = this.scoreId;
        this.monster_audio = this.game.add.audio("monster" + Id);
        this.configObj.playAudio(this.monster_audio, false);
        for (let i = 0; i < arr.length; i++) {
            this.destroyAnimation++;
            let index = this.monsterContainer.indexOf(arr[i]);
            if (this.currentLevelData.jelly.indexOf(index) != -1 && this.jellyBrakedArray.indexOf(index) == -1) {
                this.jellyBreakAnimation(this.currentLevelData.jelly.indexOf(index), index);
            }
            if (this.removedPos.indexOf(index) == -1) {
                this.removedPos.push(index);
            }
            let tween = this.game.add.tween(arr[i]).to({ alpha: 0 }, 150, null, true);
            tween.onComplete.add(() => {
                this.destroyAnimationComplete++;
                if (this.destroyAnimation == this.destroyAnimationComplete) {
                    this.destroyAnimation = this.destroyAnimationComplete = 0;
                    for (let j = 0; j < arr.length; j++) {
                        arr[j].destroy(true);
                    }
                    this.automatedMatchedArray.splice(0, this.automatedMatchedArray.length);
                    this.killAnimationComplete = true;
                }
            });
        }
        this.matchesFound = true;
        this.updateScore(this.removedPos.length, Id);
    }

    jellyBreakAnimation(pos, removedPos) {
        if (this.jellyCount > 0) {
            this.jellyContianer[pos].destroy(true);
            this.jellyBreakContianer[pos].visible = true;
            this.jellyBreakContianer[pos].play('jelly_animation', 18, false);
            this.jellyBrakedArray.push(removedPos);
            this.tempTimer = this.game.time.create(false);
            //                Timer set
            this.tempTimer.add(400, () => {
                this.configObj.playAudio(this.jellybreak);
                this.game.time.events.remove(this.tempTimer);
                this.tempTimer = null;
            }, this);
            this.tempTimer.start();

            this.jellyCount--;
        }
        else {
            this.jellyContianer.splice(0, this.jellyContianer.length);
            this.jellyBreakContianer.splice(0, this.jellyContianer.length);
        }
    }

    updateContainer() {
        this.horizontalMatchedMonsterArray.splice(0, this.horizontalMatchedMonsterArray.length);
        this.verticalMatchedMonsterArray.splice(0, this.verticalMatchedMonsterArray.length);
        this.automatedMatchedArray.splice(0, this.automatedMatchedArray.length);
        this.selectedMatchesArr.splice(0, this.selectedMatchesArr.length);
        this.swapperMatchesArr.splice(0, this.swapperMatchesArr.length);
        this.startHintTimer = false;
        this.tempTimer1 = this.game.time.create(false);
        this.tempTimer1.add(400, () => {
            this.configObj.playAudio(this.new_spawnSound);
            this.game.time.events.remove(this.tempTimer1);
            this.tempTimer1 = null;
        }, this);
        this.tempTimer1.start();
        let index = 0;
        for (let i = 0; i < this.totalRows; i++) {
            for (let j = 0; j < this.totalCols; j++) {
                let selPos = this.removedPos.indexOf(index);
                if (selPos != -1) {
                    let pos = index;
                    let prevPos = pos;
                    let xPos = this.monsterContainer[prevPos].x;
                    let newPos;
                    if (!this.powerUpData.hasOwnProperty(pos)) {
                        while (pos - this.totalRows >= 0) {
                            prevPos = pos - this.totalRows;
                            if (this.monsterContainer[prevPos].monsterType == "block" && (prevPos - this.totalRows) >= 0) {
                                while (this.monsterContainer[prevPos].monsterType == "block")
                                    prevPos -= this.totalRows;
                            }
                            newPos = this.configObj.objYPositionContainer[pos];
                            xPos = this.monsterContainer[prevPos].x;
                            this.monsterContainer[pos] = this.monsterContainer[prevPos];
                            this.tweenToPosition(this.monsterContainer[prevPos], newPos);
                            pos = prevPos;
                        }
                        let imgId = Math.floor(Math.random() * 6);
                        this.spawnNew(prevPos, xPos, this.configObj.objYPositionContainer[prevPos], "monster", imgId);
                        this.tweenToPosition(this.monsterContainer[prevPos], newPos);
                    }
                    else if (this.powerUpData.hasOwnProperty(pos)) {
                        this.spawnNew(pos, xPos, this.configObj.objYPositionContainer[pos], this.powerUpData[pos].powerUpType, this.powerUpData[pos].imageId);
                        delete this.powerUpData[pos];
                    }
                    this.tweenToPosition(this.monsterContainer[prevPos], this.configObj.objYPositionContainer[prevPos]);
                }
                index++;
            }
        }
        this.removedPos.splice(0, this.removedPos.length);
    }

    tweenToPosition(obj, destY) {
        this.setButtonState(false);
        this.startHintTimer = false;
        this.totalPositionUpdateCounter++;
        let dropAnim = this.game.add.tween(obj).to({ x: obj.x, y: destY }, 300, Phaser.Easing.Sinusoidal.In);
        let dropAnim1 = this.game.add.tween(obj.scale).to({ x: 1, y: .8 }, 100, Phaser.Easing.Sinusoidal.In);
        let dropAnim2 = this.game.add.tween(obj.scale).to({ x: 1, y: 1.2 }, 100, Phaser.Easing.Sinusoidal.In);
        let dropAnim3 = this.game.add.tween(obj.scale).to({ x: 1, y: 1 }, 100, Phaser.Easing.Sinusoidal.In);
        dropAnim.chain(dropAnim1);
        dropAnim1.chain(dropAnim2);
        dropAnim2.chain(dropAnim3);
        dropAnim.start();
        dropAnim.onComplete.add(() => {
            this.tweenAnimationCounter++;
            if (this.totalPositionUpdateCounter == this.tweenAnimationCounter) {
                this.totalPositionUpdateCounter = 0;
                this.tweenAnimationCounter = 0;
                this.newTimer = this.game.time.create(false);
                //                Timer set
                this.newTimer.add(100, this.automatedChecking, this);
                this.newTimer.start();
            }
        });
    }

    spawnNew(pos, xPos, yPos, type, imageId) {
        if (type == "monster" || type == "super") {
            let yP = type == "monster" ? 20 : yPos;
            this.monsterContainer[pos] = this.game.add.sprite(xPos, yP, type + imageId);
            this.monsterContainer[pos].loadTexture(type + imageId, 0);
            this.monsterContainer[pos].animations.add('blinkEyes');
            this.monsterContainer[pos].imageId = imageId;
        }
        else if (type == "universal") {
            this.monsterContainer[pos] = this.game.add.sprite(xPos, yPos, "" + type);
            this.monsterContainer[pos].imageId = 6;
        }
        this.MonsterLayer.add(this.monsterContainer[pos]);
        this.monsterContainer[pos].inputEnabled = true;
        this.monsterContainer[pos].anchor.setTo(1, 1);
        this.monsterContainer[pos].events.onInputDown.add(this.mouseDownCallBack.bind(this, this.monsterContainer[pos]), this);
        this.monsterContainer[pos].events.onInputUp.add(this.mouseUpCallBack.bind(this, this.monsterContainer[pos]), this);
        this.monsterContainer[pos].monsterType = type;
    }

    async automatedChecking() {
        let position;
        this.game.time.events.remove(this.newTimer);
        this.startHintTimer = false;
        let tempMatchedArr = new Array();
        let horizontalMatchedArr = new Array();
        let verticalMatchedArr = new Array();
        //        Horizontal matches
        for (let i = 0; i < this.containerSize; i++) {
            let imgId = this.monsterContainer[i].imageId;
            let rowNo = Math.floor(i / 7);
            tempMatchedArr.push(this.monsterContainer[i]);
            let nextColPos = i + 1;
            while (nextColPos < this.containerSize && Math.floor(nextColPos / 7) == rowNo && this.monsterContainer[nextColPos].imageId == imgId
                && this.monsterContainer[nextColPos].monsterType != "block" && this.monsterContainer[nextColPos].imageId != 6) {
                if (tempMatchedArr.indexOf(this.monsterContainer[nextColPos]) == -1) {
                    tempMatchedArr.push(this.monsterContainer[nextColPos]);

                }
                i = nextColPos;
                nextColPos = i + 1;
            }
            if (tempMatchedArr.length >= 3) {
                this.scoreId = tempMatchedArr[0].imageId;
                for (let j = 0; j < tempMatchedArr.length; j++) {
                    if (tempMatchedArr[j].monsterType == "super") {
                        this.configObj.playAudio(this.powermonster, false);
                        this.addHorizontalEffect(tempMatchedArr[j], tempMatchedArr[j].imageId);
                        this.addVerticalEffect(tempMatchedArr[j], tempMatchedArr[j].imageId);
                        this.addStarsVertical(tempMatchedArr[j].x - 50, tempMatchedArr[j].y - 40, tempMatchedArr[j].imageId);
                        this.powerUpActivated = true;
                        this.scoreMultiplier = 20;
                        let rowStartPos = Math.floor(this.monsterContainer.indexOf(tempMatchedArr[j]) / 7) * this.totalRows;
                        let rowEndPos = rowStartPos + this.totalRows;
                        for (let m = rowStartPos; m < rowEndPos; m++) {
                            if (this.monsterContainer[m].monsterType != "block" && this.automatedMatchedArray.indexOf(this.monsterContainer[m]) == -1)
                                this.automatedMatchedArray.push(this.monsterContainer[m]);
                        }
                        let colPos = this.monsterContainer.indexOf(tempMatchedArr[j]) % 7;
                        for (let m = colPos; m < this.containerSize; m += 7) {
                            if (this.monsterContainer[m].monsterType != "block" && this.automatedMatchedArray.indexOf(this.monsterContainer[m]) == -1)
                                this.automatedMatchedArray.push(this.monsterContainer[m]);
                        }
                        break;
                    }
                    else {
                        if (this.automatedMatchedArray.indexOf(tempMatchedArr[j]) == -1)
                            this.automatedMatchedArray.push(tempMatchedArr[j]);
                        horizontalMatchedArr.push(tempMatchedArr[j]);
                    }
                }
                if (tempMatchedArr.length >= 4) {
                    let pos = this.monsterContainer.indexOf(tempMatchedArr[0]);
                    this.checkforPowerUp(tempMatchedArr, pos, tempMatchedArr[0].imageId);
                }
            }
            tempMatchedArr.splice(0, tempMatchedArr.length);
        }
        //        Vertical matches
        for (let i = 0; i < this.containerSize; i++) {
            let imgId1 = this.monsterContainer[i].imageId;
            let pos = i;
            let colNo = i % 7;
            tempMatchedArr.push(this.monsterContainer[i]);
            let nextRowPos = i + 7;

            while (nextRowPos % 7 == colNo && nextRowPos < this.containerSize && this.monsterContainer[nextRowPos].imageId == imgId1
                && this.monsterContainer[nextRowPos].monsterType != "block" && this.monsterContainer[nextRowPos].imageId != 6) {
                if (tempMatchedArr.indexOf(this.monsterContainer[nextRowPos]) == -1 &&
                    verticalMatchedArr.indexOf(this.monsterContainer[nextRowPos]) == -1) {
                    tempMatchedArr.push(this.monsterContainer[nextRowPos]);
                    verticalMatchedArr.push(this.monsterContainer[nextRowPos]);
                }
                pos = nextRowPos;
                nextRowPos = pos + 7;
            }
            if (tempMatchedArr.length >= 3) {
                this.scoreId = tempMatchedArr[0].imageId
                for (let j = 0; j < tempMatchedArr.length; j++) {
                    if (tempMatchedArr[j].monsterType == "super") {
                        this.configObj.playAudio(this.powermonster, false);
                        this.addHorizontalEffect(tempMatchedArr[j], tempMatchedArr[j].imageId);
                        this.addVerticalEffect(tempMatchedArr[j], tempMatchedArr[j].imageId);
                        this.addStarsVertical(tempMatchedArr[j].x - 50, tempMatchedArr[j].y - 40, tempMatchedArr[j].imageId);
                        this.powerUpActivated = true;
                        this.scoreMultiplier = tempMatchedArr.length == 3 ? 30 : 20;
                        let rowStartPos = Math.floor(this.monsterContainer.indexOf(tempMatchedArr[j]) / 7) * this.totalRows;
                        let rowEndPos = rowStartPos + this.totalRows;
                        for (let m = rowStartPos; m < rowEndPos; m++) {
                            if (this.monsterContainer[m].monsterType != "block" && this.automatedMatchedArray.indexOf(this.monsterContainer[m]) == -1)
                                this.automatedMatchedArray.push(this.monsterContainer[m]);
                        }
                        let colPos = this.monsterContainer.indexOf(tempMatchedArr[j]) % 7;
                        for (let m = colPos; m < this.containerSize; m += 7) {
                            if (this.monsterContainer[m].monsterType != "block" && this.automatedMatchedArray.indexOf(this.monsterContainer[m]) == -1)
                                this.automatedMatchedArray.push(this.monsterContainer[m]);
                        }
                        break;
                    }
                    else {
                        if (this.automatedMatchedArray.indexOf(tempMatchedArr[j]) == -1) {
                            this.automatedMatchedArray.push(tempMatchedArr[j]);
                        }
                    }
                }
                if (tempMatchedArr.length >= 3) {
                    let pos = this.monsterContainer.indexOf(tempMatchedArr[0]);
                    this.checkforPowerUp(tempMatchedArr, pos, tempMatchedArr[0].imageId);
                    for (let x = 0; x < tempMatchedArr.length; x++) {
                        if (horizontalMatchedArr.indexOf(tempMatchedArr[x]) != -1) {
                            let remPos = this.monsterContainer.indexOf(tempMatchedArr[0]);
                            if (this.powerUpData.hasOwnProperty(remPos)) {
                                delete this.powerUpData[remPos];
                            }
                            position = this.monsterContainer.indexOf(tempMatchedArr[x]);
                            for (let index in this.powerUpData) {
                                let temp = parseInt(index);
                                if (temp >= position - 3 && temp <= position + 3) {
                                    delete this.powerUpData[temp];
                                }
                            }
                            this.powerUpData[position] = {
                                "imageId": 6,
                                "powerUpType": "universal"
                            };
                            this.scoreMultiplier = 90;
                        }
                    }

                }
            }
            tempMatchedArr.splice(0, tempMatchedArr.length);
        }
        horizontalMatchedArr.splice(0, horizontalMatchedArr.length);
        verticalMatchedArr.splice(0, horizontalMatchedArr.length);
    
        if (this.automatedMatchedArray.length >= 3) {
            this.scoreId = this.automatedMatchedArray[0].imageId;
            this.setButtonState(false);
            this.scoreMultiplier = this.powerUpActivated ? 20 : 30;
            this.MonsterState = "moving";
            this.groupFormed++;
            this.clearMatchedElements(this.automatedMatchedArray);
        }
        else {
            this.setButtonState(true);
            this.hintTimer = 0;
            this.startHintTimer = true;
            if (this.inGameTutorial)
                this.MonsterState = "stady";
            if (this.total_moves_left == 0) {
                await this.endDropAnim();
               
            }
            else if (this.total_moves_left > 0 && this.configObj.levelClear) {
                this.MonsterState = "moving";

                this.startHintTimer = false;
                this.monsterFrenzy();
            }
            if (this.groupFormed > 0 && !this.configObj.levelClear) {
                switch (this.groupFormed) {
                    case 2:
                        this.animateText("excellent");
                        this.groupFormed = 0;
                        break;
                    case 3:
                        this.animateText("awesom");
                        this.groupFormed = 0;
                        break;
                    case 4:
                        this.animateText("magnificent");
                        this.groupFormed = 0;
                        break;
                    case 5:
                        this.animateText("fascinating");
                        this.groupFormed = 0;
                        break;
                }
            }
        }
    }

    animateText(img) {
        this.textAnimation = true;
        let textEffect = this.game.add.sprite(this.configObj.percentOfWidth(0.5), 480, "spriteAtlas1", img + ".png");
        textEffect.anchor.setTo(0.5, 0.5);
        let tween = this.game.add.tween(textEffect).to({ alpha: 0 }, 600, Phaser.Easing.Sinusoidal.In, true, 200);
        let tween1 = this.game.add.tween(textEffect).to({ y: textEffect.y - 40 }, 600, null, true);
        tween.chain(tween1);
        tween.start();
        tween1.onComplete.add(() => {
            this.textAnimation = false;
            textEffect.destroy(true);
        });
    }

    monsterFrenzy() {
        if (this.configObj.levelClear) {
            this.setButtonState(false);
            if (!this.monsterFrenzyAnimFlag) {
                this.animateText("target achieved");
                this.monsterFrenzyAnimFlag = true;
                this.FrenzyImage = this.game.add.sprite(this.configObj.percentOfWidth(0.50), 450, "spriteAtlas1", "frenzy.png");
                this.FrenzyImage.anchor.setTo(0.5, 0.5);
                this.FrenzyImage.scale.x = 0;
                this.FrenzyImage.scale.y = 0;
                this.FrenzyImage.rotation = 0;
                let frenzyTween = this.game.add.tween(this.FrenzyImage).to({ angle: 360 }, 800, Phaser.Easing.Elastic.Out, false, 200);
                let frenzyTween1 = this.game.add.tween(this.FrenzyImage.scale).to({ x: 1, y: 1 }, 700, Phaser.Easing.Elastic.Out, false, 200);
                frenzyTween.chain(frenzyTween1);
                frenzyTween.start();

                frenzyTween1.onComplete.add(() => {
                    this.FrenzyImage.destroy(true);
                    this.setButtonState(false);
                    let pos = Math.floor(Math.random() * this.containerSize);
                    while (this.monsterContainer[pos].monsterType == "block" || this.monsterContainer[pos].monsterType == "universal") {
                        let pos = Math.floor(Math.random() * this.containerSize);
                    }
                    let imgId = this.monsterContainer[pos].imageId;
                    this.scoreId = this.monsterContainer[pos].imageId;
                    this.monsterContainer[pos].destroy(true);
                    this.monsterContainer[pos] = this.game.add.sprite(this.monsterContainer[pos].x, this.monsterContainer[pos].y, "universal");
                    this.monsterContainer[pos].imageId = imgId;
                    this.monsterContainer[pos].anchor.setTo(1, 1);
                    this.powerUpActivated = true;
                    this.updateMoves();
                    this.game.tweens.removeAll();
                    this.monsterFrenzyAnim(pos, imgId);
                });
            }
            else {
                this.setButtonState(false);
                let pos = Math.floor(Math.random() * this.containerSize);
                while (this.monsterContainer[pos].monsterType == "block" || this.monsterContainer[pos].monsterType == "universal") {
                    let pos = Math.floor(Math.random() * this.containerSize);
                }
                let imgId = this.monsterContainer[pos].imageId;
                this.scoreId = this.monsterContainer[pos].imageId;
                this.monsterContainer[pos].destroy(true);
                this.monsterContainer[pos] = this.game.add.sprite(this.monsterContainer[pos].x, this.monsterContainer[pos].y, "universal");
                this.monsterContainer[pos].imageId = imgId;
                this.monsterContainer[pos].anchor.setTo(1, 1);
                this.powerUpActivated = true;
                this.updateMoves();
                this.monsterFrenzyAnim(pos, imgId);
            }
        }
    }

    monsterFrenzyAnim(pos, imgId) {
        let superMonster;
        let matchArray = new Array();
        let superMonsterArr = new Array();
        matchArray.push(this.monsterContainer[pos]);
        for (let j = 0; j < this.containerSize; j++) {
            if (imgId == this.monsterContainer[j].imageId) {
                if (this.monsterContainer[j].monsterType == "super") {
                    this.configObj.playAudio(this.powermonster, false);
                    superMonster = this.monsterContainer[j];
                    this.addHorizontalEffect(superMonster, superMonster.imageId);
                    this.addVerticalEffect(superMonster, superMonster.imageId);
                    this.addStarsHorizontal(superMonster.x, superMonster.y - 40, superMonster.imageId);
                    this.powerUpActivated = true;
                    this.scoreMultiplier = 20;
                    let rowStartPos = Math.floor(j / 7) * this.totalRows;
                    let rowEndPos = rowStartPos + this.totalRows;
                    for (let m = rowStartPos; m < rowEndPos; m++) {
                        if (this.monsterContainer[m].monsterType != "block" && superMonsterArr.indexOf(this.monsterContainer[m]) == -1)
                            superMonsterArr.push(this.monsterContainer[m]);
                    }
                    let colPos = j % 7;
                    for (let m = colPos; m < this.containerSize; m += 7) {
                        if (this.monsterContainer[m].monsterType != "block" && superMonsterArr.indexOf(this.monsterContainer[m]) == -1)
                            superMonsterArr.push(this.monsterContainer[m]);
                    }
                }
                if (superMonsterArr.indexOf(this.monsterContainer[j]) == -1 && matchArray.indexOf(this.monsterContainer[j]) == -1)
                    matchArray.push(this.monsterContainer[j]);
            }
        }
        this.drawElectricEffect(matchArray, imgId);
        let finalClear = matchArray.concat(superMonsterArr);
        this.clearMatchedElements(finalClear);
        matchArray.splice(0, matchArray.length);
    }

    async checkforMonsterUnlock() {
        if (this.configObj.levelClear) {
            let levelClearCount = this.configObj.levelNo;
            switch (levelClearCount) {
                case 5:
                    if (this.configObj.unlockedMonsterArr.indexOf("char_1") == -1) {
                        this.configObj.unlockedMonsterArr.push("char_1");
                        await this.configObj.gameState.updateData({ unlocked_monster_data: this.configObj.unlockedMonsterArr });
                        this.animateMonsterUnlockPopUp(levelClearCount, 1, 0);
                        return true;
                    }
                    break;
                case 10:
                    if (this.configObj.unlockedMonsterArr.indexOf("char_2") == -1) {
                        this.configObj.unlockedMonsterArr.push("char_2");
                        await this.configObj.gameState.updateData({ unlocked_monster_data: this.configObj.unlockedMonsterArr });
                        this.animateMonsterUnlockPopUp(levelClearCount, 2, 2);
                        return true;
                    }
                    break;
                case 15:
                    if (this.configObj.unlockedMonsterArr.indexOf("char_3") == -1) {
                        this.configObj.unlockedMonsterArr.push("char_3");
                        await this.configObj.gameState.updateData({ unlocked_monster_data: this.configObj.unlockedMonsterArr });
                        this.animateMonsterUnlockPopUp(levelClearCount, 3, 4);
                        return true;
                    }
                    break;
                case 25:
                    if (this.configObj.unlockedMonsterArr.indexOf("char_4") == -1) {
                        this.configObj.unlockedMonsterArr.push("char_4");
                        await this.configObj.gameState.updateData({ unlocked_monster_data: this.configObj.unlockedMonsterArr });
                        this.animateMonsterUnlockPopUp(levelClearCount, 4, 3);
                        return true;
                    }
                    break;
                case 35:
                    if (this.configObj.unlockedMonsterArr.indexOf("char_5") == -1) {
                        this.configObj.unlockedMonsterArr.push("char_5");
                        await this.configObj.gameState.updateData({ unlocked_monster_data: this.configObj.unlockedMonsterArr });
                        this.animateMonsterUnlockPopUp(levelClearCount, 5, 5);
                        return true;
                    }
                    break;
                case 45:
                    if (this.configObj.unlockedMonsterArr.indexOf("char_6") == -1) {
                        this.configObj.unlockedMonsterArr.push("char_6");
                        await this.configObj.gameState.updateData({ unlocked_monster_data: this.configObj.unlockedMonsterArr });
                        this.animateMonsterUnlockPopUp(levelClearCount, 6, 1);
                        return true;
                    }
                    break;
            }
        }
        return false;
    }

    animateMonsterUnlockPopUp(count, charIndex, soundId) {
        this.tint_Bg.visible = true;
        let container = this.game.add.group();
        let unlockBg = this.game.add.sprite(this.configObj.percentOfWidth(0.02), 300, "spriteAtlas", "bg_unlock_popup.png");
        container.add(unlockBg);
        this.unlock_btn = this.game.add.button(this.configObj.percentOfWidth(0.185), 484, "spriteAtlas", this.OnUnlockClick.bind(this, charIndex, soundId), this);
        this.unlock_btn.frameName = "btn_unlocknow.png";
        container.add(this.unlock_btn);
        this.close_Unlockbtn = this.game.add.button(this.configObj.percentOfWidth(0.505), 484, "spriteAtlas", this.closeUnPopUp.bind(this, container), this);
        this.close_Unlockbtn.frameName = "btn_close.png";
        container.add(this.close_Unlockbtn);

        let heading = this.game.add.text(this.configObj.percentOfWidth(0.31), 350, this.configObj.languageData["unlockedData"]["unlockMsg"]["heading"], { font: "35px londrina", fill: "#00436A", align: "center" });
        container.add(heading);
        let message = this.game.add.text(this.configObj.percentOfWidth(0.2), 400, this.configObj.languageData["unlockedData"]["unlockMsg"]["message"] + count + this.configObj.languageData["unlockedData"]["unlockMsg"]["messageAppendText"], { font: "30px londrina", fill: "#a26829", align: "center" });
        container.add(message);
        container.pivot.x = -450;
        container.pivot.y = -400;
        container.scale.x = 0.5;
        container.scale.y = 0.5;
        this.game.add.tween(container.scale).to({ x: 1, y: 1 }, 400, Phaser.Easing.Back.Out, true);
        this.game.add.tween(container.position).to({ x: -450, y: -400 }, 400, Phaser.Easing.Back.Out, true);
    }

    closeUnPopUp(container) {
        const powerUpData = this.configObj.availablePowerUp;

        this.universalPowerUpCount.text = powerUpData["universal"];
        this.ringPowerUpCount.text = powerUpData["powerUpRing"];
        this.extraMovesPowerUpCount.text = powerUpData["addMoreMoves"];

        this.close_Unlockbtn.inputEnabled = false;
        this.setButtonState(true);
        let anim = this.game.add.tween(container.scale).to({ x: 0.5, y: 0.5 }, 400, Phaser.Easing.Back.In, true);
        this.game.add.tween(container.position).to({ x: 0, y: 0 }, 400, Phaser.Easing.Back.In, true);
        anim.onComplete.add(() => {
            container.destroy(true);
            if (this.configObj.levelClear) {
                if (this.bg_sound) {
                    this.bg_sound.stop();
                    this.bg_sound = null;
                }
                if (this.configObj.levelNo == 50) {
                    this.game.tweens.removeAll();
                    this.game.state.start('GameOver');
                }
                else {
                    this.game.tweens.removeAll();
                    this.game.state.start('LevelUp');
                }
            }
        });
    }

    OnUnlockClick(index, soundId) {
        this.close_Unlockbtn.inputEnabled = this.unlock_btn.inputEnabled = false;
        this.setButtonState(false);
        this.configObj.playAudio(this.configObj.button_clickAudio, false);
        this.tint_Bg.visible = true;
        let popUpContainer = this.game.add.group();
        this.unlock_screen = this.game.add.sprite(this.configObj.percentOfWidth(0.12), 70, "game_setting1");
        this.unlock_screen.scale.x = 1.2;
        this.unlock_screen.scale.y = 1.4;
        popUpContainer.add(this.unlock_screen);
        let startX = this.configObj.percentOfWidth(0.327);
        let startY = 220;
        let temp = 0;
        for (let i = 0; i < 6; i++) {
            if (temp == 2) {
                temp = 0;
                startX = this.configObj.percentOfWidth(0.327);
                startY += 210;
            }
            if (this.configObj.unlockedMonsterArr.indexOf("char_" + (i + 1)) == -1) {
                this.unlockMonsterArr[i] = this.game.add.button(startX, startY, "spriteAtlas1", null, this);
                this.unlockMonsterArr[i].frameName = "char_" + (i + 1) + ".png";
            }
            else {
                if (i + 1 != index) {
                    this.unlockMonsterArr[i] = this.game.add.button(startX + 10, startY, "spriteAtlas1", null, this);
                    this.unlockMonsterArr[i].frameName = "char_unlocked" + (i + 1) + ".png";
                }
                else {
                    this.unlockMonsterArr[i] = this.game.add.button(startX + 10, startY, "spriteAtlas1", this.unlockableClick.bind(this, this.configObj.languageData["unlockedData"]["subHeading1"], "char_unlocked" + (i + 1), popUpContainer, this.configObj.languageData["unlockedData"]["message"], soundId, i), this);
                    this.unlockMonsterArr[i].frameName = "char_unlocked" + (i + 1) + ".png";
                    this.game.add.tween(this.unlockMonsterArr[i]).to({ alpha: 0.5 }, 600, null, true, 0, 100, true);
                }

            }
            this.unlockMonsterArr[i].anchor.setTo(0.5, 0.5);
            startX += 200;
            popUpContainer.add(this.unlockMonsterArr[i]);
            temp++;
        }
        popUpContainer.scale.x = 0.5;
        popUpContainer.scale.y = 0.5;
        this.close_click = this.game.add.button(this.configObj.percentOfWidth(0.78), 60, "spriteAtlas", this.closePopUpUnlock.bind(this, popUpContainer), this);
        this.close_click.frameName = "close_btn.png";
        popUpContainer.add(this.close_click);
        this.animatePopUp(popUpContainer);
    }

    unlockableClick(heading, img, container, text, index, obj) {
        this.unlockMonsterArr[obj].inputEnabled = false;
        this.close_click.inputEnabled = false;
        this.tint_Bg1 = this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "tint_background");
        const popUpContainer = this.game.add.group();
        this.game_setting_back = popUpContainer.create(this.configObj.percentOfWidth(0.15), 160, "game_setting1");
        this.game_setting_back.scale.x = 1.1;
        this.game_setting_back.scale.y = 1.13;
        popUpContainer.add(this.game_setting_back);
        this.heading = this.game.add.text(this.configObj.percentOfWidth(0.37), 220, "" + heading, { font: "40px londrina", fill: "#a06626", align: "center" });
        popUpContainer.add(this.heading);
        this.pet = this.game.add.sprite(this.configObj.percentOfWidth(0.32), 260, "spriteAtlas1", img + ".png");
        popUpContainer.add(this.pet);
        this.achievement_txt = this.game.add.text(this.configObj.percentOfWidth(0.36), 470, "" + text, { font: "30px londrina", fill: "#a06626", align: "center" });
        popUpContainer.add(this.achievement_txt);
    
        const powerUpData = this.configObj.availablePowerUp;

        this.universalPowerUpCount.text = powerUpData["universal"];
        this.ringPowerUpCount.text = powerUpData["powerUpRing"];
        this.extraMovesPowerUpCount.text = powerUpData["addMoreMoves"];

        this.close_click1 = this.game.add.button(this.configObj.percentOfWidth(0.748), 135, "spriteAtlas", this.closeInfoPopUp.bind(this, popUpContainer), this);
        this.close_click1.frameName = "close_btn.png";
        popUpContainer.add(this.close_click1);
        popUpContainer.scale.x = 0.5;
        popUpContainer.scale.y = 0.5;
        this.monster_audio = this.game.add.audio("monster" + index);
        this.configObj.playAudio(this.monster_audio, false);
        this.animatePopUp(popUpContainer);
    }

    animatePopUp(container) {
        container.pivot.x = -450;
        container.pivot.y = -400;
        container.scale.x = 0.5;
        container.scale.y = 0.5;
        this.game.add.tween(container.scale).to({ x: 1, y: 1 }, 400, Phaser.Easing.Back.Out, true);
        this.game.add.tween(container.position).to({ x: -450, y: -400 }, 400, Phaser.Easing.Back.Out, true);
    }

    closeInfoPopUp(container) {
        this.close_click.inputEnabled = true;
        this.configObj.playAudio(this.configObj.button_clickAudio);
        let anim = this.game.add.tween(container.scale).to({ x: 0.5, y: 0.5 }, 450, Phaser.Easing.Back.In, true);
        this.game.add.tween(container.position).to({ x: 0, y: 0 }, 450, Phaser.Easing.Back.In, true);
        anim.onComplete.add(() => {
            container.destroy(true);
            this.tint_Bg1.destroy(true);
            this.unlockMonsterArr.splice(0, this.unlockMonsterArr.length);
            if (this.configObj.levelClear) {
                if (this.bg_sound) {
                    this.bg_sound.stop();
                    this.bg_sound = null;
                }
                if (this.configObj.levelNo == 50) {
                    this.game.tweens.removeAll();
                    this.game.state.start('GameOver');
                }
                else {
                    this.game.tweens.removeAll();
                    this.game.state.start('LevelUp');
                }

            }
        });
    }

    closePopUp(container) {
        this.setButtonState(true);
        if (!this.configObj.levelClear)
            this.MonsterState = "stady";
        if (this.settingBtn)
            this.settingBtn.inputEnabled = true;
        let anim = this.game.add.tween(container.scale).to({ x: 0.5, y: 0.5 }, 400, Phaser.Easing.Back.In, true);
        this.game.add.tween(container.position).to({ x: 0, y: 0 }, 400, Phaser.Easing.Back.In, true);
        anim.onComplete.add(async () => {
            this.tint_Bg.visible = false;
            container.destroy(true);
            if (this.total_moves_left > 0 && this.configObj.levelClear) {
                this.setButtonState(false);
                this.monsterFrenzy();
            }
            else if (this.total_moves_left == 0) {
                await this.endDropAnim();
            }
        })
    }

    async showHint() {
        let pos = 0;
        for (let i = 0; i < this.containerSize; i++) {
            let imgId = this.monsterContainer[i].imageId;
            let rowNo = Math.floor(i / 7);
            let nextColPos = i + 1;
            let incFac = -1;
            if (nextColPos < this.containerSize && Math.floor(nextColPos / 7) == rowNo && this.monsterContainer[nextColPos].imageId == imgId) {
                if (this.hintArray.indexOf(nextColPos) == -1) {
                    this.hintArray.push(i, nextColPos);
                    i = nextColPos;
                    nextColPos = i + 1;
                    this.checkNeighbour(imgId, incFac, "horizontal");
                    incFac = 1;
                }
                if (this.hintArray.length >= 3) {
                    break;
                }
                else
                    this.hintArray.splice(0, 2);
            }
            if (this.hintArray.length == 3) {
                break;
            }
        }
        if (this.hintArray.length == 0) {
            for (let i = 0; i < this.containerSize; i++) {
                let imgId1 = this.monsterContainer[i].imageId;

                pos = i;
                let colNo = i % 7;
                let incFac = -7;
                let nextRowPos = i + 7;
                while (nextRowPos % 7 == colNo && nextRowPos < this.containerSize && this.monsterContainer[nextRowPos].imageId == imgId1) {
                    if (this.hintArray.indexOf(nextRowPos) == -1) {
                        this.hintArray.push(i, nextRowPos);
                        pos = nextRowPos;
                        nextRowPos = pos + 7;
                        this.checkNeighbour(imgId1, incFac, "vertical");
                        incFac = 7;
                    }
                    if (this.hintArray.length >= 3) {
                        break;
                    }
                    else
                        this.hintArray.splice(0, 2);
                }
                if (this.hintArray.length >= 3) {
                    break;
                }
            }
        }
        if (this.hintArray.length == 0) {
            let tempArr = new Array();
            for (let i = 0; i < this.containerSize; i++) {
                let rowNo = Math.floor(i / this.totalRows);
                let colNo = i % 7;
                if (this.monsterContainer[i].monsterType != "block") {
                    if ((i - 1) >= 0 && Math.floor((i - 1) / this.totalRows) == rowNo) {
                        tempArr.push(i - 1);
                    }
                    if ((i + 1) < this.containerSize && Math.floor((i + 1) / this.totalRows) == rowNo) {
                        tempArr.push(i + 1);
                    }
                    if ((i - 7) >= 0 && (i - 7) % this.totalRows == colNo) {
                        tempArr.push(i - 7);
                    }
                    if ((i + 7) < this.containerSize && (i + 7) % this.totalRows == colNo) {
                        tempArr.push(i + 7);
                    }
                    for (let j = 0; j < tempArr.length; j++) {
                        for (let k = j + 1; k < tempArr.length; k++) {
                            if (this.monsterContainer[tempArr[j]].imageId == this.monsterContainer[tempArr[k]].imageId) {
                                if (this.hintArray.indexOf(tempArr[j]) == -1 && this.monsterContainer[tempArr[j]].monsterType != "block")
                                    this.hintArray.push(tempArr[j]);
                                if (this.hintArray.indexOf(tempArr[k]) == -1 && this.monsterContainer[tempArr[k]].monsterType != "block")
                                    this.hintArray.push(tempArr[k]);
                            }
                        }
                        if (this.hintArray.length >= 3)
                            break;
                        else
                            this.hintArray.splice(0, this.hintArray.length);
                    }
                    if (this.hintArray.length >= 3)
                        break;
                    else {
                        tempArr.splice(0, tempArr.length);
                        this.hintArray.splice(0, this.hintArray.length);
                    }
                }
            }
        }
        if (this.hintArray.length == 0) {
            this.configObj.playAudio(this.no_more_moves, false);
            for (let i = 0; i < this.containerSize; i++) {
                if (this.monsterContainer[i].monsterType == "super" || this.monsterContainer[i].monsterType == "universal") {
                    let obj = {
                        "imageId": this.monsterContainer[i].imageId,
                        "pos": i,
                        "monsterType": this.monsterContainer[i].monsterType
                    }
                    this.powUpMonster[i] = obj;
                }

            }
            await this.endDropAnim();
        }
        if (this.hintArray.length >= 3) {
            this.hintLoopEvent = this.game.time.events.loop(Phaser.Timer.SECOND * 2, this.animateHint, this);
        }


    }
    animateHint() {
        if (this.hintArray.length >= 3 && this.MonsterState == "stady") {
            for (let m = 0; m < 3; m++) {
                let obj = this.monsterContainer[this.hintArray[m]];
                let yPos = obj.y;
                this.dropAnim = this.game.add.tween(obj.scale).to({ x: 1, y: .86 }, 50, Phaser.Easing.Sinusoidal.In);
                this.dropAnim1 = this.game.add.tween(obj).to({ y: obj.y - 20 }, 120, Phaser.Easing.Sinusoidal.In);
                this.dropAnim2 = this.game.add.tween(obj.scale).to({ x: 1, y: .97 }, 50, Phaser.Easing.Sinusoidal.In);
                this.dropAnim3 = this.game.add.tween(obj).to({ y: obj.y + 7 }, 120, Phaser.Easing.Sinusoidal.In);
                this.dropAnim4 = this.game.add.tween(obj.scale).to({ x: 1, y: .7 }, 50, Phaser.Easing.Sinusoidal.In);
                this.dropAnim5 = this.game.add.tween(obj).to({ y: obj.y - 11 }, 120, Phaser.Easing.Sinusoidal.In);
                this.dropAnim6 = this.game.add.tween(obj.scale).to({ x: 1, y: 1 }, 50, Phaser.Easing.Sinusoidal.In);
                this.dropAnim7 = this.game.add.tween(obj).to({ y: yPos }, 200, Phaser.Easing.Sinusoidal.In);

                this.dropAnim.chain(this.dropAnim1);
                this.dropAnim1.chain(this.dropAnim2);
                this.dropAnim2.chain(this.dropAnim3);
                this.dropAnim3.chain(this.dropAnim4);
                this.dropAnim4.chain(this.dropAnim5);
                this.dropAnim5.chain(this.dropAnim6);
                this.dropAnim6.chain(this.dropAnim7);
                this.dropAnim.start();
            }
        }
    }

    checkNeighbour(id, inc, check) {
        let tempArr = new Array();
        let incFac = inc;
        for (let i = 0; i < this.hintArray.length; i++) {
            let pos = this.hintArray[i] + incFac;
            if (pos < this.containerSize && pos >= 0 && this.monsterContainer[pos].monsterType != "block") {
                let rowNo = check == "horizontal" ? Math.floor(this.hintArray[i] / this.totalRows) : Math.floor(pos / this.totalRows);
                let colNo = pos % 7;
                if ((pos - 1) >= 0 && Math.floor((pos - 1) / this.totalRows) == rowNo && this.hintArray.indexOf(pos - 1) == -1) {
                    tempArr.push(pos - 1);
                }
                if ((pos + 1) >= 0 && (pos + 1) < this.containerSize && Math.floor((pos + 1) / this.totalRows) == rowNo && this.hintArray.indexOf(pos + 1) == -1) {
                    tempArr.push(pos + 1);
                }
                if ((pos - 7) >= 0 && (pos - 7) % this.totalRows == colNo && this.hintArray.indexOf(pos - 7) == -1
                    && Math.floor(pos / this.totalRows) == rowNo) {
                    tempArr.push(pos - 7);
                }
                if ((pos + 7) < this.containerSize && (pos + 7) % this.totalRows == colNo && this.hintArray.indexOf(pos + 7) == -1
                    && Math.floor(pos / this.totalRows) == rowNo) {

                    tempArr.push(pos + 7);
                }
                for (let j = 0; j < tempArr.length; j++) {
                    if (this.monsterContainer[tempArr[j]].imageId == id && this.monsterContainer[tempArr[j]].monsterType != "block") {
                        if (this.hintArray.indexOf(tempArr[j]) == -1) {
                            this.hintArray.push(tempArr[j]);
                            if (this.hintArray.length >= 3)
                                break;
                        }
                    }
                }
                if (this.hintArray.length >= 3)
                    break;
            }
            incFac *= -1;
            tempArr.splice(0, tempArr.length);
        }
    }

    showSettings() {
        if (this.inGameTutorial && this.total_moves_left > 0) {
            this.setButtonState(false);
            this.settingBtn.inputEnabled = false;
            this.MonsterState = "moving";
            this.tint_Bg.visible = true;
            let settingPopup = this.game.add.group();
            this.game_setting_back = this.game.add.sprite(this.configObj.percentOfWidth(0.13), 165 - this.diffFactorForPlacement, "game_setting");
            settingPopup.add(this.game_setting_back);
            this.level_select_click = this.game.add.button(this.configObj.percentOfWidth(0.26), 290 - this.diffFactorForPlacement, "spriteAtlas", this.OnLevelSelectionClick, this);
            this.level_select_click.frameName = "level_select_button.png"
            settingPopup.add(this.level_select_click);
            let sound_btn = this.configObj.audioPaused ? "sound_on_button" : "sound_off_button";
            this.sound_click = this.game.add.button(this.configObj.percentOfWidth(0.26), 430 - this.diffFactorForPlacement, "spriteAtlas", this.OnSoundClick.bind(this, "off", settingPopup), this);
            this.sound_click.frameName = sound_btn + ".png";
            settingPopup.add(this.sound_click);
            this.close_click = this.game.add.button(this.configObj.percentOfWidth(0.79), 143 - this.diffFactorForPlacement, "spriteAtlas", this.closePopUp.bind(this, settingPopup), this);
            this.close_click.frameName = "close_btn.png";
            settingPopup.add(this.close_click);
            settingPopup.pivot.x = -450;
            settingPopup.pivot.y = -400;
            settingPopup.scale.x = 0.5;
            settingPopup.scale.y = 0.5;
            this.game.add.tween(settingPopup.scale).to({ x: 1, y: 1 }, 400, Phaser.Easing.Back.Out, true);
            this.game.add.tween(settingPopup.position).to({ x: -450, y: -400 }, 400, Phaser.Easing.Back.Out, true);
        }
    }

    OnGameSettingPopUpCloseClick() {
        //This is an event called when game settings pop up is closed using close button
        this.settingBtn.inputEnabled = true;
        this.MonsterState = "stady";
        this.game_setting_back.destroy();
        this.close_click.destroy();
        this.level_select_click.destroy();
        this.sound_click.destroy();
    }

    async OnLevelSelectionClick() {
        this.configObj.playAudio(this.configObj.button_clickAudio, false);
        this.bg_sound.stop();
        this.bg_sound = null;
        await this.configObj.updateLife(-1);
        this.OnGameSettingPopUpCloseClick();
        this.game.state.start("Menu");
    }

    OnSoundClick(key, container) {
        if (!this.configObj.audioPaused) {
            this.configObj.pauseAudio(this.bg_sound);
            this.configObj.audioPaused = true;
            this.sound_click.destroy();
            this.sound_click = this.game.add.button(this.configObj.percentOfWidth(0.26), 430 - this.diffFactorForPlacement, "spriteAtlas", this.OnSoundClick.bind(this, "on", container), this);
            this.sound_click.frameName = "sound_on_button.png";
            container.add(this.sound_click);
        } else {
            this.configObj.audioPaused = false;
            this.bg_sound.stop();
            this.bg_sound = null;
            this.bg_sound = this.game.add.audio('bg_sound');
            this.configObj.playAudio(this.bg_sound, true);
            this.sound_click.destroy();
            this.sound_click = this.game.add.button(this.configObj.percentOfWidth(0.26), 430 - this.diffFactorForPlacement, "spriteAtlas", this.OnSoundClick.bind(this, "off", container), this);
            this.sound_click.frameName = "sound_off_button.png";
            container.add(this.sound_click);
        }
    }

    async powerUpUsed(type) {
        this.configObj.playAudio(this.configObj.button_clickAudio, false);
        let count;
        if (!this.configObj.levelClear && this.inGameTutorial) {
            switch (type) {
                case "extramoves":
                    count = this.configObj.getPowerUp('addMoreMoves');
                    if (count > 0) {
                        let count = await this.configObj.updatePowerUp('addMoreMoves');
                        this.extraMovesPowerUpCount.text = "" + count;
                        this.powerUpUsedFlag = "addMoreMoves";
                        this.animateText("+ 5 moves");
                        this.total_moves_left += 5;
                        this.levelMovesText.text = "Moves\n " + this.total_moves_left;
                    }
                    break;
                case "wand":
                    if (this.powerUpUsedFlag == null) {
                        this.powerUpActivated = true;
                        count = this.configObj.getPowerUp('universal');
                        if (count > 0) {
                            this.settingBtn.inputEnabled = false;
                            this.extraMovesBtn.inputEnabled = false;
                            this.ringPowerBtn.inputEnabled = false;
                            this.universalPowerBtn.freezeFrames = true;
                            this.powerUpUsedFlag = "universal";

                        }
                    }
                    else {
                        this.settingBtn.inputEnabled = true;
                        this.extraMovesBtn.inputEnabled = true;
                        this.ringPowerBtn.inputEnabled = true;
                        this.universalPowerBtn.freezeFrames = false;
                        this.powerUpUsedFlag = null;
                    }
                    break;
                case "ring":
                    if (this.powerUpUsedFlag == null) {
                        this.powerUpActivated = true;
                        count = this.configObj.getPowerUp('powerUpRing');
                        if (count > 0) {
                            this.settingBtn.inputEnabled = false;
                            this.extraMovesBtn.inputEnabled = false;
                            this.universalPowerBtn.inputEnabled = false;
                            this.ringPowerBtn.freezeFrames = true;
                            this.powerUpUsedFlag = "powerUpRing";
                            this.ringPowerBtn.frame = 1;
                        }
                    }
                    else {
                        this.settingBtn.inputEnabled = true;
                        this.extraMovesBtn.inputEnabled = true;
                        this.universalPowerBtn.inputEnabled = true;
                        this.ringPowerBtn.freezeFrames = false;
                        this.powerUpUsedFlag = null;
                        this.ringPowerBtn.frame = 0;
                    }
                    break;
            }
        }
    }

    setButtonState(state) {
        this.universalPowerBtn.inputEnabled = state;
        this.ringPowerBtn.inputEnabled = state;
        this.extraMovesBtn.inputEnabled = state;
        this.settingBtn.inputEnabled = state;
    }

    update() {
        if (this.killAnimationComplete == true) {
            this.updateContainer();
            this.killAnimationComplete = false;
        }
    }
};
