import { getStatic } from "../api/static";
import { levelData as configLevelData } from "../config/config";

export class LevelUp {
    constructor(configObj) {
        this.configObj = configObj;
    }

    async preload() {
        try {
            const data = await getStatic();
            this.userCount = data.users;
        } catch (err) {
            this.configObj.appState.setError(err.message);
        }
    }

    async create() {
        this.backGroundImg1 = this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "bg_Img");
        const levelData = this.configObj.getLevelInfo(this.configObj.levelNo - 1);
        await this.checkForLifeUpdate();
        this.lifeCount = this.configObj.getLifeCount();
        if (this.lifeCount < 3) {
            this.loopEvent = this.game.time.events.loop(Phaser.Timer.SECOND, this.gameTimer, this);
        }
        const audioRef = this.configObj.levelClear ? "level_up" : "level_fail";
        this.bg_soundLevelUp = this.game.add.audio("" + audioRef);
        this.configObj.playAudio(this.bg_soundLevelUp, false);
        if (this.configObj.levelClear) {
            let starCount = Math.floor(this.configObj.currentLevelScore / configLevelData[this.configObj.levelNo].targetScore);
            if (starCount > 3)
                starCount = 3;
            if (starCount === 3) {
                    this.coins = 1;
                    await this.configObj.coins.set(this.coins);
            }
            await this.configObj.gameState.updateData({ curr_level_status: {} })
            this.configObj.currLevelStatus = null;
            this.backGroundImg1 = this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "win");
            this.game.add.sprite(this.configObj.percentOfWidth(0.3), 177, "spriteAtlas", "level_upGrapics.png");
            
            const retryLevel = this.game.add.button(this.configObj.percentOfWidth(0.032), 734 + 280, "spriteAtlas", this.restartLevel, this);
            retryLevel.frameName = "retry_level.png";
            const lData = configLevelData[this.configObj.levelNo + 1];
            if (!lData.users && this.userCount >= lData.users) {
                const nextLevelBtn = this.game.add.button(this.configObj.percentOfWidth(0.223), 735 + 280, "spriteAtlas", this.loadNextLevel, this);
                nextLevelBtn.frameName = "nxt_level.png";
            }
            const levelSelection = this.game.add.button(this.configObj.percentOfWidth(0.4155), 735 + 280, "spriteAtlas", this.loadLevelSelectionScreen, this);
            levelSelection.frameName = "level_selc_btn.png";

            this.game.add.sprite(this.configObj.percentOfWidth(0.41), 30, "spriteAtlas", "blank_star.png");
            this.starImg = this.game.add.sprite(this.configObj.percentOfWidth(0.522), 108, "spriteAtlas", "starLevelUp.png");
            this.starImg.anchor.setTo(0.5, 0.5);
            this.game.add.sprite(this.configObj.percentOfWidth(0.20), 270, "spriteAtlas", "level_score.png");
            this.score = this.game.add.text(this.configObj.percentOfWidth(0.51), 310 + this.configObj.textMarginForBrowser, this.configObj.languageData["levelUp"]["levelScore"] + ": " + this.configObj.currentLevelScore, { font: "50px londrina", fill: "#fffeff", align: "center" });
            this.score.anchor.setTo(0.5, 0.5);
            this.game.add.sprite(this.configObj.percentOfWidth(0.265), 357, "spriteAtlas", "highest_score.png");
            this.highScore = this.game.add.text(this.configObj.percentOfWidth(0.51), 375 + this.configObj.textMarginForBrowser, this.configObj.languageData["levelUp"]["highScore"] + ": " + levelData.score, { font: "30px londrina", fill: "#ACF1F3", align: "center" });
            this.highScore.anchor.setTo(0.5, 0.5);

            this.game.add.sprite(this.configObj.percentOfWidth(0.265), 412, "spriteAtlas", "coinCount.png");
            this.coins = this.game.add.text(this.configObj.percentOfWidth(0.51), 438 + this.configObj.textMarginForBrowser, this.configObj.languageData["levelUp"]["levelCoins"] + ": " + this.configObj.coins.totalCoins, { font: "31px londrina", fill: "#fffeff", align: "center" });
            this.coins.anchor.setTo(0.5, 0.5);

            this.game.add.text(this.configObj.percentOfWidth(0.51), 70 + this.configObj.textMarginForBrowser, "" + levelData.stars, { font: "60px londrina", fill: "#a06626", align: "center" });
        } else {
            await this.configObj.updateLife(-1);
            this.game.add.sprite(this.configObj.percentOfWidth(0.28), 130, "spriteAtlas", "try_againGraphics.png");
            this.game.add.sprite(this.configObj.percentOfWidth(0.2), 255, "spriteAtlas", "level_score.png");
            this.score = this.game.add.text(this.configObj.percentOfWidth(0.5), 295 + this.configObj.textMarginForBrowser, this.configObj.languageData["levelUp"]["levelScore"] + ": " + this.configObj.currentLevelScore, { font: "50px londrina", fill: "#fffeff", align: "center" });
            this.score.anchor.setTo(0.5, 0.5);
            this.game.add.sprite(this.configObj.percentOfWidth(0.257), 345, "spriteAtlas", "highest_score.png");
            this.highScore = this.game.add.text(this.configObj.percentOfWidth(0.5), 365 + this.configObj.textMarginForBrowser, this.configObj.languageData["levelUp"]["highScore"] + ": " + levelData.score, { font: "30px londrina", fill: "#ACF1F3", align: "center" });
            this.highScore.anchor.setTo(0.5, 0.5);
            this.game.add.sprite(this.configObj.percentOfWidth(0.263), 400, "spriteAtlas", "coinCount.png");
            this.coins = this.game.add.text(this.configObj.percentOfWidth(0.51), 425 + this.configObj.textMarginForBrowser, this.configObj.languageData["levelUp"]["levelCoins"] + ": " + this.configObj.coins.totalCoins, { font: "31px londrina", fill: "#fffeff", align: "center" });
            this.coins.anchor.setTo(0.5, 0.5);
            const retryLevel = this.game.add.button(this.configObj.percentOfWidth(0.12), 734 + 280, "spriteAtlas", this.restartLevel, this);
            retryLevel.frameName = "retry_level.png";
            const levelSelection = this.game.add.button(this.configObj.percentOfWidth(0.31), 735 + 280, "spriteAtlas", this.loadLevelSelectionScreen, this);
            levelSelection.frameName = "level_selc_btn.png"
        }
        this.game.add.sprite(this.configObj.percentOfWidth(0.85), 8, "spriteAtlas", "life.png");
        this.lifeText = this.game.add.text(this.configObj.percentOfWidth(0.905), 36 + this.configObj.textMarginForBrowser, "" + this.configObj.getLifeCount(), { font: "30px londrina", fill: "#580101", align: "center" });
        this.lifeText.anchor.setTo(0.5, 0.5);
    }

    async checkForLifeUpdate() {
        const totalElapsedTime = await this.configObj.attempTimerObj.updateTime();
        if (totalElapsedTime != null) {
            const totalLifeToUpdate = Math.floor(totalElapsedTime.h / this.configObj.attempTimeCounter);
            try {
                await this.configObj.incrementLife(totalLifeToUpdate);
            } catch (err) {
                this.configObj.appState.setError(err.message);
            }
        }
    }

    async gameTimer() {
        this.lifeCount = this.configObj.getLifeCount();
        if (this.lifeCount < 3) {
            this.totalElapsedTime = await this.configObj.attempTimerObj.updateTime();
            if (this.totalElapsedTime.h > 0 && this.totalElapsedTime.h % this.configObj.attempTimeCounter == 0) {
                this.configObj.attempTimeCounter += this.configObj.attempTimeCounter;
                try {
                    await this.configObj.incrementLife(1);
                    const life = await this.configObj.getLifeCount();
                    this.lifeText.text = life.toString();
                } catch (err) {
                    console.error(err);
                    this.configObj.appState.setError(err.message);
                }
            }
        } else {
            this.configObj.attempTimeCounter = 6;
            this.game.time.events.remove(this.loopEvent);
        }
    }

    restartLevel() {
        if (this.bg_soundLevelUp)
            this.bg_soundLevelUp.stop();
        this.bg_soundLevelUp = null;
        this.configObj.playAudio(this.configObj.button_clickAudio, false);
        const lifeCount = this.configObj.getLifeCount();
        if (lifeCount > 0) {
            this.game.tweens.removeAll();
            this.game.state.start('MagicMonsters');
        } else {
            let popUpContainer = this.game.add.group();
            let bg = this.game.add.sprite(this.configObj.percentOfWidth(0.07), 200, "buy_popup");
            popUpContainer.add(bg);
            let buyBtn = this.game.add.button(this.configObj.percentOfWidth(0.318), 520, "spriteAtlas1", this.buyAttempts, this);
            buyBtn.frameName = "buy_attempts_btn.png";
            popUpContainer.add(buyBtn);
            popUpContainer.add(this.game.add.text(this.configObj.percentOfWidth(0.255), 280, this.configObj.languageData["warning"]["noAttempts"]["heading"], { font: "45px londrina", fill: "red", align: "center" }));
            popUpContainer.add(this.game.add.text(this.configObj.percentOfWidth(0.19), 450, this.configObj.languageData["warning"]["noAttempts"]["suggestionMsg"], { font: "30px londrina", fill: "#a06626", align: "center" }));
            popUpContainer.scale.x = 0.5;
            popUpContainer.scale.y = 0.5;
            this.close_click = this.game.add.button(this.configObj.percentOfWidth(0.85), 170, "spriteAtlas", this.closePopUp.bind(this, popUpContainer), this);
            this.close_click.frameName = "close_btn.png";
            popUpContainer.add(this.close_click);
            popUpContainer.pivot.x = -this.configObj.percentOfWidth(0.36);
            popUpContainer.pivot.y = -420;
            this.game.add.tween(popUpContainer.scale).to({ x: 1, y: 1 }, 450, Phaser.Easing.Back.Out, true);
            this.game.add.tween(popUpContainer.position).to({ x: -this.configObj.percentOfWidth(0.36), y: -420 }, 450, Phaser.Easing.Back.Out, true);
        }
    }

    closePopUp(popUpContainer) {
        let anim = this.game.add.tween(popUpContainer.scale).to({ x: 0.5, y: 0.5 }, 450, Phaser.Easing.Back.In, true);
        this.game.add.tween(popUpContainer.position).to({ x: 0, y: 0 }, 450, Phaser.Easing.Back.In, true);
        anim.onComplete.add(() => {
            this.popUp = false;
            popUpContainer.destroy();
        });
    }

    buyAttempts() {
        this.game.tweens.removeAll();
        this.game.state.start('Menu');
    }

    loadNextLevel() {
        this.bg_soundLevelUp.stop();
        this.bg_soundLevelUp = null;
        this.configObj.playAudio(this.configObj.button_clickAudio, false);
        if (this.configObj.levelClear)
            this.configObj.levelNo += 1;
        if (this.configObj.levelNo <= 50)
            this.game.state.start('MagicMonsters');
    }

    loadLevelSelectionScreen() {
        this.configObj.playAudio(this.configObj.button_clickAudio, false);
        this.game.tweens.removeAll();
        this.game.state.start('Menu');
    }

    update() {
        //
    }
}