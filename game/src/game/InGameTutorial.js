export class InGameTutorial {
    constructor(configObj) {
        this.configObj = configObj;
    }
    
    static tutorialGrid() {
        return [
            [0, 2, 1, 2, 5],
            [0, 1, 0, 1, 1],
            [3, 5, 3, 0, 5],
            [2, 4, 2, 4, 3]
        ];
    }

    preload() {

    }

    create() {
        // gameConfig
        this.tutorialStartXPos = 195;
        this.tutorialStartYPos = 373;
        this.tutorialgapBetweenObj = 81;
        //
        this.monsterState = "stady";
        this.totalPositionUpdateCounter = this.tweenAnimationCounter = 0;
        this.destroyedPets = new Array();
        this.game.inputEnabled = true;
        this.bg_sound = this.game.add.audio('bg_sound');
        this.configObj.playAudio(this.bg_sound, true);

        if (false || !!document.documentMode) {
            this.game.stage.disableVisibilityChange = true;
        }
        this.tutorialContainer = new Array();
        this.index = 0;
        this.tutorial = "tutorial1";
        this.selectedMonster = this.swapperMonster = null;
        this.mouseDownX = this.mouseDownY = this.mouseUpX = this.mouseUpY = 0;
        this.diffFactor = 64;
        this.selectedMonsterPos;
        this.yPosContainer = new Array();
        this.game.input.mouse.mouseMoveCallback = this.mouseMoveCallBack.bind(this);
        this.game.input.touch.touchMoveCallback = this.mouseMoveCallBack.bind(this);

        this.backGroundImg1 = this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "Game_background_mbl");
        this.backGroundImg1.inputEnabled = true;
        this.footer = this.game.add.sprite(-50, 725, "footer");
        this.hud_BGLayer = this.game.add.sprite(85, 0, "hud_BGLayer");
        this.game.add.sprite(-19, -78, "header");
        this.levelMovesText = this.game.add.text(30, 755, "Moves\n" + 10, { font: "35px londrina", fill: "#ffffff", align: "center" });
        this.settingBtn = this.game.add.button(569, 10, "spriteAtlas", this.showSettings, this);
        this.settingBtn.frameName = "mbl_settings.png";
        this.game.add.text(13, 10, "Level \n" + 1, { font: "25px londrina", fill: "#e9f4ff", align: "center" });
        this.game.add.text(365, 10, "Target " + 1000, { font: "35px londrina", fill: "#FFDC4E", align: "center" });
        let style = { font: "35px londrina", fill: "#ffffff", align: "center" };
        this.levelScoreText = this.game.add.text(535, 755, "Score \n" + 0, style);
        this.universalPowerBtn = this.game.add.button(202, 770, "universalPowerUp", this.universalPowerUp, this, 0, 0, 1, 0);
        style = { font: "25px londrina", fill: "#f5a3ff", align: "center" };
        this.universalPowerUpCount = this.game.add.text(202, 750, "5", style);
        this.ringPowerBtn = this.game.add.button(294, 768, "powerUpRing", this.ringPowerUp, this, 0, 0, 1, 0);
        this.ringPowerBtn.frameName = "powerUpRing.png";
        this.ringPowerUpCount = this.game.add.text(292, 750, "5", style);
        this.movesPowerBtn = this.game.add.button(390, 768, "addMoreMoves", this.movesPowerUp, this, 0, 0, 1, 0);
        this.movesPowerBtn.frameName = "addMoreMoves.png";
        this.extraMovesPowerUpCount = this.game.add.text(382, 750, "5", style);
        this.universalPowerBtn.inputEnabled = this.ringPowerBtn.inputEnabled = this.movesPowerBtn.inputEnabled = false;


        this.monsterDisabledLayer = this.game.add.group();
        this.monsterDisabledLayer.z = 0;
        this.tintLayer = this.game.add.group();
        this.tintLayer.z = 1;
        this.monsterEnabledLayer = this.game.add.group();
        this.monsterEnabledLayer.z = 2;

        this.logoLayer = this.game.add.group();
        this.logoLayer.z = 3;
        this.activeBtnLayer = this.game.add.group();
        this.activeBtnLayer.z = 4;
        this.tutorialLayer = this.game.add.group();
        this.tutorialLayer.z = 5;

        this.startTutorial();
    }

    startTutorial() {
        if (localStorage.tutorialShown == undefined) {
            this.messageContainer = this.game.add.sprite(this.configObj.percentOfWidth(0.027), 370 - this.diffFactor, "spriteAtlas", "ingame_tut.png");
            this.tutorialLayer.add(this.messageContainer);
            this.tutorialText = this.game.add.text(this.configObj.percentOfWidth(0.495), 440 - this.diffFactor, this.configObj.languageData["tutorialText"][0], { font: "30px londrina", fill: "#a06626", align: "center" });
            this.tutorialLayer.add(this.tutorialText);
            this.tutorialText.anchor.setTo(0.5, 0.5);
            this.skipBtn = this.game.add.button(this.configObj.percentOfWidth(0.2), 750 - this.diffFactor, "spriteAtlas", this.skipTutorial, this);
            this.skipBtn.frameName = "skip.png";
            this.skipBtn.anchor.setTo(0.5, 0.5);
            this.nextBtn = this.game.add.button(this.configObj.percentOfWidth(0.8), 750 - this.diffFactor, "spriteAtlas", this.tutorial1, this);
            this.nextBtn.frameName = "next.png";
            this.nextBtn.anchor.setTo(0.5, 0.5);
            this.game.add.tween(this.nextBtn).to({ alpha: 0.5 }, 600, null, true, 0, 1000, true);
        }
    }

    mouseMoveCallBack() {
        if (this.selectedMonster != null) {
            this.tint_Bg.visible = false;
            let xPos = this.selectedMonster.x;
            let yPos = this.selectedMonster.y;
            let yDiff = Math.abs(this.mouseDownY - this.mouseUpY);
            if (this.selectedMonsterPos == 2) {
                let tempArr = new Array();
                if (yDiff >= 20) {
                    this.swapperMonster = this.tutorialContainer[7];
                    this.swapperMonsterPos = 7;
                    this.game.add.tween(this.selectedMonster).to({ x: this.swapperMonster.x, y: this.swapperMonster.y }, 180, null, true);
                    let tween = this.game.add.tween(this.swapperMonster).to({ x: xPos, y: yPos }, 180, null, true, 100);

                    let tempObj;
                    tween.onComplete.add(() => {
                        tempObj = this.tutorialContainer[7];
                        this.tutorialContainer[7] = this.tutorialContainer[2];
                        this.tutorialContainer[2] = tempObj;
                        tempArr.push(this.tutorialContainer[6], this.tutorialContainer[7], this.tutorialContainer[8]);
                        this.killPets(tempArr);
                        //
                    });
                }
                this.selectedMonsterPos = -1;
            }
        }
    }
    
    killPets(arr) {
        this.monsterState = "moving";
        for (let i = 0; i < arr.length; i++) {
            arr[i].destroy();
            this.destroyedPets.push(this.tutorialContainer.indexOf(arr[i]));
        }
        this.updateContainer();

    }

    updateContainer() {
        let index = 0;
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 4; j++) {
                let selPos = this.destroyedPets.indexOf(index);
                if (selPos != -1) {
                    let pos = index;
                    let prevPos = pos;
                    let xPos = this.tutorialContainer[prevPos].x;
                    let newPos;
                    while (pos - 5 >= 0) {
                        prevPos = pos - 5;
                        newPos = this.yPosContainer[pos];
                        xPos = this.tutorialContainer[prevPos].x;
                        this.tutorialContainer[pos] = this.tutorialContainer[prevPos];
                        this.tweenToPosition(this.tutorialContainer[prevPos], newPos);
                        pos = prevPos;
                    }
                    let imgId = Math.floor(Math.random() * 6);
                    this.spawnNew(prevPos, xPos, this.yPosContainer[prevPos], "monster", imgId);
                    this.tweenToPosition(this.tutorialContainer[prevPos], this.yPosContainer[prevPos]);
                }
                index++;
            }
        }
        this.destroyedPets.splice(0, this.destroyedPets.length);
    }

    spawnNew(pos, xPos, yPos, type, imageId) {
        let yP = 10;
        this.tutorialContainer[pos] = this.game.add.sprite(xPos, yP, type + imageId);
        this.tutorialContainer[pos].loadTexture(type + imageId, 0);
        this.tutorialContainer[pos].animations.add('blinkEyes');
        this.tutorialContainer[pos].imageId = imageId;
        this.monsterDisabledLayer.add(this.tutorialContainer[pos]);
        this.tutorialContainer[pos].inputEnabled = true;
        this.tutorialContainer[pos].anchor.setTo(1, 1);
        this.tutorialContainer[pos].events.onInputDown.add(this.mouseDownCallBack.bind(this, this.tutorialContainer[pos]), this);
        this.tutorialContainer[pos].events.onInputUp.add(this.mouseUpCallBack.bind(this, this.tutorialContainer[pos]), this);
        this.tutorialContainer[pos].monsterType = type;
    }

    tweenToPosition(obj, destY) {
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
                this.totalPositionUpdateCounter = this.tweenAnimationCounter = 0;
                this.newTimer = this.game.time.create(false);
                //                Timer set
                this.newTimer.add(300, this.nextTutorial, this);
                this.newTimer.start();
            }
        });
    }

    nextTutorial() {
        this.game.time.events.remove(this.newTimer);
        if (this.tutorial == "tutorial1") {
            this.tutorial2();
        }
        else if (this.tutorial == "tutorial2") {
            this.tutorial3();
        }
        else if (this.tutorial == "tutorial3") {
            this.tutorial4();
        }
    }

    skipTutorial() {
        localStorage.tutorialShown = true;
        this.bg_sound.stop();
        this.bg_sound = null;
        this.game.tweens.removeAll();
        this.game.state.start('MagicMonsters');
    }

    setButtonState(state) {
        this.universalPowerBtn.inputEnabled = state;
        this.ringPowerBtn.inputEnabled = state;
        this.movesPowerBtn.inputEnabled = state;
        this.settingBtn.inputEnabled = state;
    }

    animateText(img) {
        let textEffect = this.game.add.sprite(this.configObj.percentOfWidth(0.5), 480, "spriteAtlas1", img + ".png");
        textEffect.anchor.setTo(0.5, 0.5);
        let tween = this.game.add.tween(textEffect).to({ alpha: 0 }, 500, Phaser.Easing.Sinusoidal.In, true, 100);
        let tween1 = this.game.add.tween(textEffect).to({ y: textEffect.y - 40 }, 500, null, true);
        tween.chain(tween1);
        tween.start();
        tween1.onComplete.add(function () {
            textEffect.destroy(true);
        });
    }

    tutorial1() {
        if (this.tutorial == "tutorial1") {
            this.configObj.playAudio(this.configObj.button_clickAudio, false);
            this.nextBtn.visible = false;
            this.tutorialLayer.visible = false;
            let xPos = this.tutorialStartXPos;
            for (let i = 0; i < 4; i++) {
                for (let j = 0; j < 5; j++) {
                    let temp = InGameTutorial.tutorialGrid()[i][j];
                    this.tutorialContainer[this.index] = this.game.add.sprite(xPos, 10, 'monster' + temp);
                    this.tutorialContainer[this.index].loadTexture('monster' + temp, 0);
                    this.tutorialContainer[this.index].animations.add('blinkEyes');
                    this.tutorialContainer[this.index].imageId = temp;
                    this.tutorialContainer[this.index].anchor.setTo(1, 1);
                    this.yPosContainer.push(this.tutorialStartYPos);
                    xPos += this.tutorialgapBetweenObj;
                    if (this.index == 2 || this.index == 6 || this.index == 8) {
                        this.monsterEnabledLayer.add(this.tutorialContainer[this.index]);
                    }
                    else {
                        this.monsterDisabledLayer.add(this.tutorialContainer[this.index]);
                    }
                    this.index++;
                }
                this.tutorialStartYPos += this.tutorialgapBetweenObj;
                xPos = this.tutorialStartXPos;
            }
            this.tutorialContainer[2].inputEnabled = true;
            this.tutorialContainer[2].events.onInputDown.add(this.mouseDownCallBack.bind(this, this.tutorialContainer[2]), this);
            this.tutorialContainer[2].events.onInputUp.add(this.mouseUpCallBack.bind(this, this.tutorialContainer[this.index]), this);

            this.tint_Bg = this.game.add.sprite(-this.configObj.percentOfWidth(0), 0, "bg_disable");
            this.tint_Bg.scale.x = 2.2;
            this.tintLayer.add(this.tint_Bg);
            this.handImg = this.game.add.sprite(this.configObj.percentOfWidth(0.5), 375 - this.diffFactor, "tap_hands", 1);
            let handAnim = this.game.add.tween(this.handImg.scale).to({ x: 1, y: 1 }, 600, Phaser.Easing.Sinusoidal.In, false);
            let handAnim1 = this.game.add.tween(this.handImg).to({ y: 465 - this.diffFactor }, 600, Phaser.Easing.Sinusoidal.In, false, 400);
            handAnim.chain(handAnim1);
            handAnim.start();

            handAnim1.onComplete.add(() => {
                this.handImg.frame = 0;
                let reverseAnim = this.game.add.tween(this.handImg).to({ y: 375 - this.diffFactor }, 650, Phaser.Easing.Sinusoidal.In, true, 400);
                reverseAnim.onComplete.add(() => {
                    this.handImg.frame = 1;
                    handAnim.start();
                });
            });
            this.startDropAnim();
        }
        if (this.tutorial == "tutorial4") {
            this.bg_sound.stop();
            this.bg_sound = null;
            localStorage.tutorialShown = true;
            this.setButtonState(true);
            this.bg_sound = null;
            this.game.state.start('MagicMonsters');
        }
    }

    tutorial2() {
        this.tint_Bg.visible = true;
        this.tintLayer.remove(this.tint_Bg);
        this.activeBtnLayer.add(this.tint_Bg);
        this.activeBtnLayer.add(this.ringPowerBtn);
        this.activeBtnLayer.add(this.ringPowerUpCount);
        this.ringPowerBtn.inputEnabled = true;
        this.universalPowerBtn.inputEnabled = false;
        this.movesPowerBtn.inputEnabled = false;
        this.game.input.mouse.mouseMoveCallback = null;
        this.game.input.touch.touchMoveCallback = null;
        this.handImg.destroy(true);

        this.newhandImg = this.game.add.sprite(this.ringPowerBtn.x + 20, this.ringPowerBtn.y + 20, 'hand_anim');


        this.newhandImg.loadTexture('hand_anim');
        this.newhandImg.animations.add('hand_anim');
        this.newhandImg.play('hand_anim', 10, true);

        for (let i = 0; i < 20; i++) {
            this.tutorialContainer[i].inputEnabled = true;
            this.tutorialContainer[i].events.onInputDown.add(this.mouseDownCallBack.bind(this, this.tutorialContainer[i]), this);
        }
        this.tutorialLayer.visible = true;
        this.messageContainer.y = 170 - this.diffFactor;
        this.tutorialText.y = 242 - this.diffFactor;
        this.tutorialText.text = this.configObj.languageData["tutorialText"][1];
    }

    tutorial3() {
        this.newhandImg.visible = true;
        this.ringPowerBtn.inputEnabled = false;
        this.tint_Bg.visible = true;
        this.activeBtnLayer.add(this.universalPowerBtn);
        this.activeBtnLayer.add(this.universalPowerUpCount);
        this.universalPowerBtn.inputEnabled = true;
        this.movesPowerBtn.inputEnabled = false;
        this.ringImg.destroy(true);
        this.newhandImg.x = this.universalPowerBtn.x + 20;
        this.newhandImg.y = this.universalPowerBtn.y + 20;
        this.tutorialLayer.visible = true;
        this.tutorialText.text = this.configObj.languageData["tutorialText"][2];
    }

    tutorial4() {
        this.tutorial = "tutorial4";
        this.newhandImg.visible = true;
        this.ringPowerBtn.inputEnabled = false;
        this.universalPowerBtn.inputEnabled = false;
        this.tint_Bg.visible = true;
        this.activeBtnLayer.add(this.movesPowerBtn);
        this.activeBtnLayer.add(this.extraMovesPowerUpCount);
        this.movesPowerBtn.inputEnabled = true;
        this.newhandImg.x = this.movesPowerBtn.x + 20;
        this.newhandImg.y = this.movesPowerBtn.y + 20;
        this.tutorialLayer.visible = true;
        this.tutorialText.text = this.configObj.languageData["tutorialText"][3];
    }

    tutorial2Anim() {
        this.tutorial = "tutorial2";
        this.ringImg = this.game.add.sprite(this.selectedMonster.x - 70, this.selectedMonster.y - 70, "spriteAtlas", "powerUpRing.png");
        let ringAnim = this.game.add.tween(this.ringImg.scale).to({ x: 2, y: 2 }, 350, Phaser.Easing.Bounce.Out);
        let ringAnim1 = this.game.add.tween(this.ringImg.scale).to({ x: 1.2, y: 1.2 }, 350, Phaser.Easing.Bounce.Out);
        ringAnim.chain(ringAnim1);
        ringAnim.start();
        let tempMatchArr = [this.selectedMonster];
        ringAnim1.onComplete.add(() => {
            this.ringImg.destroy();
            this.killPets(tempMatchArr);
        });
    }

    tutorial3Anim() {
        this.tutorial = "tutorial3";
        let tempArr = [];
        let imgId = this.selectedMonster.imageId;
        tempArr.push(this.selectedMonster);
        for (let i = 0; i < 20; i++) {
            if (this.tutorialContainer[i].imageId == imgId) {
                tempArr.push(this.tutorialContainer[i]);
            }
        }
        this.drawElectricEffect(tempArr);
    }

    drawElectricEffect(matchesArr) {
        let lineArr = [];
        let colorCode = ["#9b4a1c", "#25acad", "#ffa30d", "#fa6100", "#6b7c90", "#d32959"];
        this.colorCode = colorCode[matchesArr[1].imageId];
        let bmd = this.game.add.bitmapData(this.game.width, this.game.height);
        for (let i = 1; i < matchesArr.length; i++) {
            bmd.context.beginPath();
            bmd.context.moveTo(matchesArr[0].x - 40, matchesArr[0].y - 30);
            bmd.context.lineTo(matchesArr[i].x - 40, matchesArr[i].y - 30);
            bmd.context.strokeStyle = this.colorCode;
            bmd.context.lineWidth = 2;
            bmd.context.stroke();
            lineArr[i] = this.game.add.sprite(0, 0, bmd);
            let temp = lineArr[i];
            let tween = this.game.add.tween(temp).to({ alpha: 0.3 }, 60, null, true, 0, 3, true);
            tween.onComplete.add((temp) => {
                temp.destroy(true);
                this.killPets(matchesArr);
            });
        }
    }

    startDropAnim() {
        let dropAnim, dropAnim1, dropAnim2, dropAnim3;
        for (let i = 0; i < 20; i++) {
            dropAnim = this.game.add.tween(this.tutorialContainer[i]).to({ y: this.yPosContainer[i] }, 300, Phaser.Easing.Sinusoidal.In);
            dropAnim1 = this.game.add.tween(this.tutorialContainer[i].scale).to({ x: 1, y: 0.8 }, 120, Phaser.Easing.Sinusoidal.In);
            dropAnim2 = this.game.add.tween(this.tutorialContainer[i].scale).to({ x: 1, y: 1.2 }, 120, Phaser.Easing.Sinusoidal.In);
            dropAnim3 = this.game.add.tween(this.tutorialContainer[i].scale).to({ x: 1, y: 1 }, 120, Phaser.Easing.Sinusoidal.In);
            dropAnim.chain(dropAnim1);
            dropAnim1.chain(dropAnim2);
            dropAnim2.chain(dropAnim3);
            dropAnim.start();
        }
    }

    mouseUpCallBack() {
        this.mouseUpX = this.game.input.activePointer.x;
        this.mouseUpY = this.game.input.activePointer.y;
    }

    mouseDownCallBack(obj) {
        if (this.monsterState == "stady") {
            if (this.newhandImg)
                this.newhandImg.visible = false;
            if (this.handImg)
                this.handImg.visible = false;
            this.selectedMonster = obj;
            this.selectedMonsterPos = 2;
            this.mouseDownX = this.game.input.activePointer.x;
            this.mouseDownY = this.game.input.activePointer.y;
            if (this.tutorial == "tutorial2" && this.newhandImg != null) {
                this.ringPowerBtn.setFrames(0, 0, 1, 0);
                this.tutorial2Anim();
            }
            if (this.tutorial == "tutorial3") {
                this.universalPowerBtn.setFrames(0, 0, 1, 0);
                this.tutorial3Anim();
            }
        }
        this.monsterState = "moving";
    }

    ringPowerUp() {
        this.ringPowerBtn.freezeFrames = true;
        this.tint_Bg.visible = false;
        this.activeBtnLayer.remove(this.ringPowerBtn);
        this.activeBtnLayer.remove(this.ringPowerUpCount);
        this.monsterDisabledLayer.add(this.ringPowerBtn);
        this.monsterDisabledLayer.add(this.ringPowerUpCount);
        this.setButtonState(false);
        this.configObj.playAudio(this.configObj.button_clickAudio, false);
        this.tutorial = "tutorial2";
        this.monsterState = "stady";
        let pos = Math.floor(Math.random() * 20);
        this.newhandImg.x = this.tutorialContainer[pos].x - 25;
        this.newhandImg.y = this.tutorialContainer[pos].y - 40;
    }

    universalPowerUp() {
        this.universalPowerBtn.freezeFrames = true;
        this.tint_Bg.visible = false;
        this.activeBtnLayer.remove(this.universalPowerBtn);
        this.activeBtnLayer.remove(this.universalPowerUpCount);
        this.monsterDisabledLayer.add(this.universalPowerBtn);
        this.monsterDisabledLayer.add(this.universalPowerUpCount);
        this.setButtonState(false);
        this.configObj.playAudio(this.configObj.button_clickAudio, false);
        this.tutorial = "tutorial3";
        this.monsterState = "stady";
        let pos = Math.floor(Math.random() * 20);
        this.newhandImg.x = this.tutorialContainer[pos].x - 25;
        this.newhandImg.y = this.tutorialContainer[pos].y - 40;
    }

    movesPowerUp() {
        this.setButtonState(false);
        this.configObj.playAudio(this.configObj.button_clickAudio, false);
        this.animateText("+ 5 moves");
        this.levelMovesText.text = "Moves\n" + 15;
        this.game.add.tween(this.levelMovesText.scale).to({ x: 1.1, y: 1.1 }, 600, null, true, 0, 5, true);
        this.nextBtn.visible = true;
        this.tint_Bg.destroy(true);
        this.newhandImg.destroy(true);
    }
}
