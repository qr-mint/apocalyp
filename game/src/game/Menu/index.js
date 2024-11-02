import { CWScroller } from "../../utils/scroll";
import { badgesRewards, levelData as configLevelData } from "../../config/config";
import { getStatic } from "../../api/static";
import { useGameStore } from "../../store/game";

const achievements = [
  {
    name: "ton",
    index: 1
  },
  {
    name: "stars",
    index: 2
  },
  {
    name: "usdt",
    index: 3
  },
  {
    name: "friends",
    index: 4
  },
  {
    namme: "all_level_3",
    index: 5
  },
  {
    name: "social",
    index: 6
  }
];

export class Menu {
  constructor(configObj) {
    this.configObj = configObj;
    this.unlockMonsterText = [
      "Play 5 levels to unlock",
      "Play 10 levels to unlock",
      "Play 15 levels to unlock",
      "Play 25 levels to unlock",
      "Play 35 levels to unlock",
      "Play 45 levels to unlock"
    ];
    this.badgesRewards = badgesRewards;
    this.unlocableSoundId = [0, 2, 4, 3, 5, 1];
    this.CWScroller = new CWScroller(configObj);
  }

  async preload() {
    try {
      const data = await getStatic();
      this.userCount = data.users;
      this.orders = data.orders;
      this.referrals = data.referrals;
      this.level3Stars = data.levels;
      this.socialSubscribed = data.socialSubscribed;
    } catch (err) {
      this.configObj.appState.setError(err.message);
    }
  }

  async create() {
    this.timerPopUp = false;
    this.popUp = false;
    this.infoPopUp = false;
    let lastLevelInfo = this.configObj.currLevelStatus;
    if (lastLevelInfo != null && lastLevelInfo["levelCleared"] == false) {
      await this.configObj.updateLife(-1);
    }
    await this.checkForLifeUpdate();
    
    this.lifeCount = this.configObj.getLifeCount();

    this.punch = this.game.add.audio("punch");
    this.bg = this.game.add.sprite(this.configObj.percentOfWidth(0.065), 15, "level_select_bg1");

    if (this.lifeCount < 3) {
      this.loopEvent = this.game.time.events.loop(Phaser.Timer.SECOND, this.gameTimer, this);
    }

    this.badgesArr = new Array();
    this.unlockMonsterArr = new Array();

    this.lockArr = new Array();
    this.container = this.game.add.group();
    let xPos = this.configObj.percentOfWidth(0.263);
    let startXpos = xPos;
    let startYpos = this.configObj.percentOfHeight(0.13);
    let levelBtn, levelText = 1, diff = 165, starDiff = 35, Leveltext;
    let temp = 0, blankStar, starCount, star, levelData;
    let style = { font: "35px londrina", fill: "#004300", align: "center" };
    for (let i = 1; i < 51; i++) {
      levelData = this.configObj.getLevelInfo(i - 1);
      if (temp == 3) {
        temp = 0;
        startYpos += diff;
        startXpos = xPos;
        starYPos = startYpos;
      }
      if (i == 1) {
        levelBtn = this.game.add.button(startXpos, startYpos, "spriteAtlas", this.OnLevelButtonClick.bind(this, i, levelData.stars), this);
        levelBtn.frameName = "unlocked_a.png";
        Leveltext = this.game.add.text(levelBtn.x, levelBtn.y + this.configObj.textMarginForBrowser, "" + levelText, style);
        Leveltext.anchor.setTo(0.5, 0.5);
      } else if (this.configObj.oldLevelData[i - 2] != undefined && this.configObj.oldLevelData[i - 2].level_cleared) {
        levelBtn = this.game.add.button(startXpos, startYpos, "spriteAtlas", this.OnLevelButtonClick.bind(this, i), this);
        levelBtn.frameName = "unlocked_a.png";
        if (i == this.configObj.oldLevelData.length + 1) {
          this.game.add.tween(levelBtn).to({ alpha: 0.5 }, 600, null, true, 0, 200, true);
        }
        Leveltext = this.game.add.text(levelBtn.x, levelBtn.y + this.configObj.textMarginForBrowser, "" + levelText, style);
        Leveltext.anchor.setTo(0.5, 0.5);
      } else {
        levelBtn = this.game.add.button(startXpos, startYpos, "spriteAtlas", null, this);
        levelBtn.frameName = "locked_b.png";
        Leveltext = this.game.add.text(levelBtn.x, levelBtn.y + this.configObj.textMarginForBrowser, "" + levelText, { font: "35px londrina", fill: "#52432B", align: "center" });
        Leveltext.anchor.setTo(0.5, 0.5);
      }
      levelBtn.anchor.setTo(0.5, 0.5);
      let starXpos = startXpos - 50;
      let starYPos = startYpos - 35;
      if (levelData != null)
        starCount = levelData.stars;
      for (let j = 0; j < 3; j++) {
        blankStar = this.game.add.sprite(starXpos, starYPos + 80, "spriteAtlas", "star_blank.png");
        this.container.add(blankStar);
        if (starCount > 0) {
          star = this.game.add.sprite(starXpos, starYPos + 80, "spriteAtlas", "star.png");
          this.container.add(star);
          starCount--;
        }
        starXpos += starDiff;
      }
      this.container.add(levelBtn);
      this.container.add(Leveltext);
      temp++;
      levelText++;
      startXpos += diff;
    }

    this.CWScroller.to(this.container, 640, 1150, 640, 3100, { bouncing: false, scrollingX: false });
    this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "overlay");

    this.handAnim = this.game.add.sprite(this.configObj.percentOfWidth(0.55), 680, 'hand_anim');
    this.handAnim.anchor.setTo(0.5, 0.5);
    this.handAnim.loadTexture('hand_anim');
    this.handAnim.animations.add('hand_anim');
    this.handAnim.play('hand_anim', 13, false);

    let handAnim = this.game.add.tween(this.handAnim).to({ y: 600 }, 650, Phaser.Easing.Sinusoidal.In, false, 450);
    handAnim.start();
    handAnim.onComplete.add(() => {
      let reverseAnim = this.game.add.tween(this.handAnim).to({ y: 680 }, 700, Phaser.Easing.Sinusoidal.In, true, 300);
      this.handAnim.frame = 1;
      reverseAnim.onComplete.add(() => {
        this.handAnim.play('hand_anim', 13, false);
        this.game.tweens.remove(reverseAnim);
        handAnim.start();
      });
    });

    this.timerText = this.game.add.text(this.configObj.percentOfWidth(0.88), 60 + this.configObj.textMarginForBrowser, "", { font: "30px londrina", fill: "#580101", align: "center" });
    this.ach_butn = this.configObj.game.add.button(this.configObj.percentOfWidth(0.05), 1000, "spriteAtlas", this.OnAchievementClick, this);
    this.ach_butn.frameName = "achievement_sc.png";
    this.shop_butn = this.game.add.button(this.configObj.percentOfWidth(0.3), 1000, "spriteAtlas", this.OnShopClick, this);
    this.shop_butn.frameName = "shop_sc.png";
    this.unlock_butn = this.game.add.button(this.configObj.percentOfWidth(0.55), 1000, "spriteAtlas", this.OnUnlockClick, this);
    this.unlock_butn.frameName = "unlock_sc.png"
    this.backLayer = this.game.add.group();
    this.game.add.sprite(this.configObj.percentOfWidth(0.01), 2, "spriteAtlas", "Coin1.png");
    this.coinsText = this.game.add.text(this.configObj.percentOfWidth(0.22), 37 + this.configObj.textMarginForBrowser, "" + this.configObj.coins.totalCoins, { font: "30px londrina", fill: "#FFEBCE", align: "center" });
    this.coinsText.anchor.setTo(0.5, 0.5);
    this.game.add.sprite(this.configObj.percentOfWidth(0.5), 2, "spriteAtlas", "Life1.png");
    this.lifeText = this.game.add.text(this.configObj.percentOfWidth(0.925), 32.5 + this.configObj.textMarginForBrowser, "" + this.lifeCount, { font: "30px londrina", fill: "#580101", align: "center" });
    this.lifeText.anchor.setTo(0.5, 0.5);
    this.tint_Bg = this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "tint_background");
    this.tint_Bg.visible = false;

    useGameStore.subscribe((state) => {
      this.configObj.coins.totalCoins += state.coins;
      this.coinsText.text = `${this.configObj.coins.totalCoins}`;
    });
  }

  async checkForLifeUpdate() {
    try {
      let totalElapsedTime = await this.configObj.attempTimerObj.updateTime();
      if (totalElapsedTime != null) {
        let totalLifeToUpdate = Math.floor(totalElapsedTime.m / this.configObj.attempTimeCounter);
        await this.configObj.incrementLife(totalLifeToUpdate);
      }
    } catch (err) {
      this.configObj.appState.setError(err.message);
    }
  }

  OnAchievementClick() {
    if (!this.popUp && !this.timerPopUp) {
      this.popUp = true;
      this.buttonState(false);
      this.configObj.playAudio(this.configObj.button_clickAudio);
      let startXpos = this.configObj.percentOfWidth(0.23), startYPos = 210;
      this.tint_Bg.visible = true;
      let popUpContainer = this.game.add.group();
      let game_setting_back = popUpContainer.create(this.configObj.percentOfWidth(0.12), 70, "game_setting");
      game_setting_back.scale.y = 1.08;
      popUpContainer.add(game_setting_back);
      let achievement_txt = this.game.add.text(this.configObj.percentOfWidth(0.28), 130, "" + this.configObj.languageData["unlockedBadgeData"].heading, { font: "50px londrina", fill: "#a06626", align: "center" });
      popUpContainer.add(achievement_txt);
      let temp = 0;
      const locks = [];
      for (const achievement of achievements) {
        if (temp == 2) {
          temp = 0;
          startXpos = this.configObj.percentOfWidth(0.23);
          startYPos += 180;
        }
        const index = achievement.index - 1;
        this.badgesArr.push(
          this.game.add.button(
            startXpos, startYPos,
            "spriteAtlas",
            this.achievementClick.bind(this, this.configObj.languageData["unlockedBadgeData"].subHeading, "badge_" + (achievement.index), popUpContainer, this.configObj.languageData["unlockedBadgeData"].unlockBadgeText, index, this.badgesRewards[index]),
            this));
        this.badgesArr[this.badgesArr.length - 1].frameName = "badge_" + (achievement.index) + ".png";
        popUpContainer.add(this.badgesArr[index]);
        if (achievement.name === "ton" && this.orders.ton !== 0) {
          locks.push("badge"+achievement.index);
        } else if (achievement.name === "stars" && this.orders.stars !== 0) {
          locks.push("badge"+achievement.index);
        } else if (achievement.name === "usdt" && this.orders.usdt  !== 0) {
          locks.push("badge"+achievement.index);
        } else if (achievement.name === "friends" && this.orders.friends < 2) {
          locks.push("badge"+achievement.index);
        } else if (achievement.name === "all_level_3" && this.level3Stars != 50) {
          locks.push("badge"+achievement.index);
        } else if (achievement.name === "social" && !this.socialSubscribed) {
          locks.push("badge"+achievement.index);
        }
        if (locks.indexOf("badge" + (achievement.index)) == -1) {
          this.lockArr.push(this.game.add.sprite(startXpos + 80, startYPos + 75, "spriteAtlas", "lock.png"));
          popUpContainer.add(this.lockArr[this.lockArr.length - 1]);
        }
        startXpos += 230;
        temp++;
      }
      this.close_click = null;
      this.close_click = this.game.add.button(this.configObj.percentOfWidth(0.78), 55, "spriteAtlas", this.closePopUp.bind(this, popUpContainer), this);
      this.close_click.frameName = "close_btn.png";
      popUpContainer.add(this.close_click);
      popUpContainer.scale.x = 0.5;
      popUpContainer.scale.y = 0.5;
      this.animatePopUp(popUpContainer);
    }
  }

  achievementClick(heading, img, container, textContainer, number, rewards) {
    if (!this.infoPopUp && !this.timerPopUp) {
      this.tint_Bg1 = this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "tint_background");
      this.close_click.inputEnabled = false;
      this.infoPopUp = true;
      this.tint_Bg.visible = true;
      let popUpContainer = this.game.add.group();
      let game_setting_back = popUpContainer.create(this.configObj.percentOfWidth(0.15), 155, "game_setting");
      game_setting_back.scale.x = 0.92;
      game_setting_back.scale.y = 0.9;
      popUpContainer.add(game_setting_back);
      const headingSprite = this.game.add.text(this.configObj.percentOfWidth(0.34), 220, "" + heading, { font: "40px londrina", fill: "#a06626", align: "center" });
      popUpContainer.add(headingSprite);
      let badge = this.game.add.sprite(this.configObj.percentOfWidth(0.42), 280, "spriteAtlas");
      badge.frameName = img + ".png";
      popUpContainer.add(badge);
      let achievement_txt = this.game.add.text(this.configObj.percentOfWidth(0.5), 450, "" + textContainer[number], { font: "28px londrina", fill: "#a06626", align: "center" });
      achievement_txt.anchor.setTo(0.5, 0.5);
      popUpContainer.add(achievement_txt);
      this.rewards_txt = this.game.add.text(this.configObj.percentOfWidth(0.25), 520, this.configObj.languageData["unlockedBadgeData"].rewards + ": ", { font: "30px londrina", fill: "#a06626", align: "center" });
      popUpContainer.add(this.rewards_txt);
      let startX = this.configObj.percentOfWidth(0.45);
      let startY = 520;
      for (let i = 0; i < rewards.length; i++) {
        let rtext = this.game.add.text(startX, startY, `${rewards[i].count}`, { font: "30px londrina", fill: "#a06626", align: "center" });

        popUpContainer.add(rtext);
        let rImg = this.game.add.sprite(startX + 70, startY + 20, "spriteAtlas", "" + rewards[i].powerUp + ".png");
        rImg.anchor.setTo(0.5, 0.5);
        popUpContainer.add(rImg);
        startY += 65;
      }
      this.close_click1 = null;
      this.close_click1 = this.game.add.button(this.configObj.percentOfWidth(0.74), 130, "spriteAtlas", this.closeInfoPopUp.bind(this, popUpContainer), this);
      this.close_click1.frameName = "close_btn.png";
      popUpContainer.add(this.close_click1);
      popUpContainer.scale.x = 0.5;
      popUpContainer.scale.y = 0.5;
      this.animatePopUp(popUpContainer);
    }
  }

  unlockableClick(heading, img, container, textContainer, number) {

    if (!this.infoPopUp) {
      this.tint_Bg1 = this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "tint_background");
      this.close_click.inputEnabled = false;
      this.infoPopUp = true;
      this.tint_Bg.visible = true;
      const popUpContainer = this.game.add.group();
      const game_setting_back = popUpContainer.create(this.configObj.percentOfWidth(0.15), 155, "game_setting");
      game_setting_back.scale.x = 0.92;
      game_setting_back.scale.y = 0.9;
      popUpContainer.add(game_setting_back);
      const headingSprite = this.game.add.text(this.configObj.percentOfWidth(0.52), 240, "" + heading, { font: "40px londrina", fill: "#a06626", align: "center" });
      headingSprite.anchor.setTo(0.5, 0.5);
      popUpContainer.add(headingSprite);
      const badge = this.game.add.sprite(this.configObj.percentOfWidth(0.49), 360, "spriteAtlas1");
      badge.frameName = img + ".png";
      badge.anchor.setTo(0.5, 0.5);
      popUpContainer.add(badge);
      const achievement_txt = this.game.add.text(this.configObj.percentOfWidth(0.28), 463, "" + textContainer[number], { font: "30px londrina", fill: "#a06626", align: "center" });
      popUpContainer.add(achievement_txt);
  
      this.close_click1 = null;
      this.close_click1 = this.game.add.button(this.configObj.percentOfWidth(0.73), 130, "spriteAtlas", this.closeInfoPopUp.bind(this, popUpContainer), this);
      this.close_click1.frameName = "close_btn.png";
      popUpContainer.add(this.close_click1);
      popUpContainer.scale.x = 0.5;
      popUpContainer.scale.y = 0.5;
      this.monster_audio = null;
      this.monster_audio = this.game.add.audio("monster" + this.unlocableSoundId[number]);
      this.configObj.playAudio(this.monster_audio, false);
      this.animatePopUp(popUpContainer);
    }
  }

  animatePopUp(container) {
    this.buttonState(false);
    container.pivot.x = -this.configObj.percentOfWidth(0.36);
    container.pivot.y = -420;
    this.game.add.tween(container.scale).to({ x: 1, y: 1 }, 450, Phaser.Easing.Back.Out, true);
    const tween2 = this.game.add.tween(container.position).to({ x: -this.configObj.percentOfWidth(0.36), y: -420 }, 450, Phaser.Easing.Back.Out, true);
    tween2.onComplete.add(() => {
      this.game.tweens.remove(container);
      this.game.tweens.remove(container);
    });
    this.CWScroller.Enable(false);
  }

  closeInfoPopUp(container) {
    this.close_click.inputEnabled = true;
    this.close_click1.inputEnabled = false;
    this.configObj.playAudio(this.configObj.button_clickAudio);
    let anim = this.game.add.tween(container.scale).to({ x: 0.5, y: 0.5 }, 450, Phaser.Easing.Back.In, true);
    let anim1 = this.game.add.tween(container.position).to({ x: 0, y: 0 }, 450, Phaser.Easing.Back.In, true);

    anim.onComplete.add(() => {
      this.game.tweens.remove(anim);
      this.game.tweens.remove(anim1);
      container.destroy(true);
      if (this.tint_Bg1)
        this.tint_Bg1.destroy();
      this.tint_Bg1 = null;
      this.infoPopUp = false;
      this.badgesArr.splice(0, this.badgesArr.length);
      this.lockArr.splice(0, this.lockArr.length);
    });
  }

  closeTimerPopUp(container) {
    this.close_clickAlert.inputEnabled = false;
    this.configObj.playAudio(this.configObj.button_clickAudio);
    let anim = this.game.add.tween(container.scale).to({ x: 0.5, y: 0.5 }, 450, Phaser.Easing.Back.In, true);
    let anim1 = this.game.add.tween(container.position).to({ x: 0, y: 0 }, 450, Phaser.Easing.Back.In, true);
    anim.onComplete.add(() => {
      this.tint_BgTimer.destroy();
      this.game.tweens.remove(anim);
      this.game.tweens.remove(anim1);
      container.destroy(true);
      this.buttonState(true);
      this.tint_Bg.visible = false;
      this.timerPopUp = false;
    });
    this.CWScroller.Enable(true);
  }

  closePopUp(container) {
    if (this.close_click)
      this.close_click.inputEnabled = false;
    if (this.timerPopUp) {
      this.close_clickAlert.inputEnabled = true;
    }
    this.configObj.playAudio(this.configObj.button_clickAudio);
    let anim = this.game.add.tween(container.scale).to({ x: 0.5, y: 0.5 }, 450, Phaser.Easing.Back.In, true);
    let anim1 = this.game.add.tween(container.position).to({ x: 0, y: 0 }, 450, Phaser.Easing.Back.In, true);
    anim.onComplete.add(() => {
      this.game.tweens.remove(anim);
      this.game.tweens.remove(anim1);
      container.destroy(true);
      this.buttonState(true);
      if (this.tint_Bg2)
        this.tint_Bg2.visible = false;
      this.tint_Bg.visible = false;
      this.badgesArr.splice(0, this.badgesArr.length);
      this.lockArr.splice(0, this.lockArr.length);
      this.unlockMonsterArr.splice(0, this.unlockMonsterArr.length);
      this.popUp = false;
    });
    this.CWScroller.Enable(true);
  }

  OnCopyClipboard() {

  }

  OnShopClick() {
    if (!this.popUp) {
      if (this.close_clickAlert)
        this.close_clickAlert.inputEnabled = false;
      this.configObj.playAudio(this.configObj.button_clickAudio);
      this.popUp = true;
      this.buttonState(false);
      this.tint_Bg2 = this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "tint_background");
      this.backLayer.add(this.tint_Bg2);

      let popUpContainer = this.game.add.group();
      let unlock_screen = this.game.add.sprite(this.configObj.percentOfWidth(0.075), 70, "game_setting");
      unlock_screen.scale.x = 1.155;
      unlock_screen.scale.y = 1.12;
      popUpContainer.add(unlock_screen);
      let lifeBtnBg = this.game.add.sprite(this.configObj.percentOfWidth(0.147), 135, "spriteAtlas1", "attempts_bg.png");
      popUpContainer.add(lifeBtnBg);
      let lifeBtn = this.game.add.button(this.configObj.percentOfWidth(0.162), 260, "spriteAtlas1", this.shopSelected.bind(this, "addLife"), this);
      lifeBtn.frameName = "btn_5000.png";
      popUpContainer.add(lifeBtn);
      let style = { font: "28px londrina", fill: "#D5F3FF", align: "center" };
      let cText = this.game.add.text(this.configObj.percentOfWidth(0.393), 165, "1x", style);
      popUpContainer.add(cText);
      let movesBtnBg = this.game.add.sprite(this.configObj.percentOfWidth(0.52), 135, "spriteAtlas1", "moves_bg.png");
      popUpContainer.add(movesBtnBg);
      let movesBtn = this.game.add.button(this.configObj.percentOfWidth(0.535), 260, "spriteAtlas1", this.shopSelected.bind(this, "addMoves"), this);
      movesBtn.frameName = "btn_1500.png";
      popUpContainer.add(movesBtn);
      cText = this.game.add.text(this.configObj.percentOfWidth(0.768), 165, "1x", style);
      popUpContainer.add(cText)
      let singleCandyBg = this.game.add.sprite(this.configObj.percentOfWidth(0.147), 340, "spriteAtlas1", "hoop1_bg.png");
      popUpContainer.add(singleCandyBg);
      let singleCandyBtn = this.game.add.button(this.configObj.percentOfWidth(0.162), 465, "spriteAtlas1", this.shopSelected.bind(this, "addSingleCandy"), this);
      singleCandyBtn.frameName = "btn_500.png";
      popUpContainer.add(singleCandyBtn);
      cText = this.game.add.text(this.configObj.percentOfWidth(0.393), 370, "1x", style);
      popUpContainer.add(cText)
      let CandyBg = this.game.add.sprite(this.configObj.percentOfWidth(0.52), 340, "spriteAtlas1", "hoop3_bg.png");
      popUpContainer.add(CandyBg);
      let CandyBtn = this.game.add.button(this.configObj.percentOfWidth(0.535), 465, "spriteAtlas1", this.shopSelected.bind(this, "addMultipleCandies"), this);
      CandyBtn.frameName = "btn_1200.png";
      popUpContainer.add(CandyBtn);
      cText = this.game.add.text(this.configObj.percentOfWidth(0.768), 370, "3x", style);
      popUpContainer.add(cText);
      let singleWandBg = this.game.add.sprite(this.configObj.percentOfWidth(0.147), 545, "spriteAtlas1", "wand1_bg.png");
      popUpContainer.add(singleWandBg);
      let singleWandBtn = this.game.add.button(this.configObj.percentOfWidth(0.162), 670, "spriteAtlas1", this.shopSelected.bind(this, "singleWand"), this);
      singleWandBtn.frameName = "btn_1000.png";
      popUpContainer.add(singleWandBtn);
      cText = this.game.add.text(this.configObj.percentOfWidth(0.393), 575, "1x", style);
      popUpContainer.add(cText);
      let WandBg = this.game.add.sprite(this.configObj.percentOfWidth(0.52), 540, "spriteAtlas1", "candy_bg.png");
      popUpContainer.add(WandBg);
      let WandBtn = this.game.add.button(this.configObj.percentOfWidth(0.535), 670, "spriteAtlas1", this.shopSelected.bind(this, "Wand"), this);
      WandBtn.frameName = "btn_2500.png";
      popUpContainer.add(WandBtn);
      cText = this.game.add.text(this.configObj.percentOfWidth(0.768), 580, "3x", style);
      popUpContainer.add(cText);

      popUpContainer.scale.x = 0.5;
      popUpContainer.scale.y = 0.5;
      this.close_click = this.game.add.button(this.configObj.percentOfWidth(0.84), 53, "spriteAtlas", this.closePopUp.bind(this, popUpContainer), this);
      this.close_click.frameName = "close_btn.png";
      popUpContainer.add(this.close_click);
      this.animatePopUp(popUpContainer);
    }
  }

  async shopSelected(item) {
    const coins = await this.configObj.coins.get();
    switch (item) {
      case "addLife":
        if (coins >= 5000) {
          try {
            await this.configObj.incrementLife(3);
            this.addShopStatusPopUp(true, "attempts_icon");
            await this.configObj.coins.set(-5000);
            this.lifeText.text = "" + await this.configObj.getLifeCount();
            this.coinsText.text = "" + this.configObj.coins.totalCoins;
          } catch (err) {
            this.configObj.appState.setError(err.message);
          }
        }
        else {
          this.addShopStatusPopUp(false, null);
        }
        break;
      case "addMoves":
        if (coins >= 1500) {
          await this.configObj.localDataModelObj.setPowerUp("addMoreMoves", 1);
          this.addShopStatusPopUp(true, "addMoreMoves");
          await this.configObj.coins.set(-1500);
          this.coinsText.text = "" + this.configObj.coins.totalCoins;
        }
        else {
          this.addShopStatusPopUp(false, null);
        }
        break;
      case "addSingleCandy":
        if (coins >= 500) {
          await this.configObj.localDataModelObj.setPowerUp("powerUpRing", 1);
          await this.configObj.coins.set(-500);
          this.addShopStatusPopUp(true, "powerUpRing");
          this.coinsText.text = "" + this.configObj.coins.totalCoins;
        }
        else {
          this.addShopStatusPopUp(false, null);
        }
        break;
      case "addMultipleCandies":
        if (coins >= 1200) {
          await this.configObj.localDataModelObj.setPowerUp("powerUpRing", 3);
          await this.configObj.coins.set(-1200);
          this.addShopStatusPopUp(true, "hoop_3_icon");
          this.coinsText.text = "" + this.configObj.coins.totalCoins;
        }
        else {
          this.addShopStatusPopUp(false, null);
        }
        break;
      case "singleWand":
        if (coins >= 1000) {
          await this.configObj.localDataModelObj.setPowerUp("universal", 1);
          await this.configObj.coins.set(-1000);
          this.addShopStatusPopUp(true, "universal");
          this.coinsText.text = "" + this.configObj.coins.totalCoins;
        }
        else {
          this.addShopStatusPopUp(false, null);
        }
        break;
      case "Wand":
        if (coins >= 2500) {
          await this.configObj.localDataModelObj.setPowerUp("universal", 3);
          await this.configObj.coins.set(-2500);
          this.addShopStatusPopUp(true, "wand_3_icon");
          this.coinsText.text = "" + this.configObj.coins.totalCoins;
        }
        else {
          this.addShopStatusPopUp(false, null);
        }
        break;
    }
  }

  addShopStatusPopUp(status, img) {
    if (!this.infoPopUp) {
      this.close_click.inputEnabled = false;
      this.infoPopUp = true;
      this.tint_Bg1 = this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "tint_background");
      //            this.backLayer.add(this.tint_Bg1);
      let msg;
      let popUpContainer = this.game.add.group();
      let bg = this.game.add.sprite(this.configObj.percentOfWidth(0.06), 300, "spriteAtlas", "coin_success.png");
      popUpContainer.add(bg);

      if (status) {
        this.coinsText.text = "" + this.configObj.coins.totalCoins;
        msg = this.configObj.languageData["shop"]["successMessage"];
        let beams = this.game.add.sprite(this.configObj.percentOfWidth(0), 250, "spriteAtlas", "beams.png");
        popUpContainer.add(beams);
        let item = this.game.add.sprite(this.configObj.percentOfWidth(0.21), 385, "spriteAtlas", img + ".png");
        popUpContainer.add(item);
        item.anchor.setTo(0.5, 0.5);
        let heading = this.game.add.text(this.configObj.percentOfWidth(0.555), 390, this.configObj.languageData["shop"]["successHeading"], { font: "42px londrina", fill: "#00436A", align: "center" });
        heading.anchor.setTo(0.5, 0.5);
        popUpContainer.add(heading);
      } else {
        msg = this.configObj.languageData["shop"]["failMessage"];;
        let heading = this.game.add.text(this.configObj.percentOfWidth(0.5), 390, this.configObj.languageData["shop"]["failHeading"], { font: "42px londrina", fill: "#00436A", align: "center" });
        heading.anchor.setTo(0.5, 0.5);
        popUpContainer.add(heading);
      }
      let message = this.game.add.text(this.configObj.percentOfWidth(0.5), 480, "" + msg, { font: "28px londrina", fill: "#a06626", align: "center" });
      message.anchor.setTo(0.5, 0.5);
      popUpContainer.add(message);
      this.close_click1 = this.game.add.button(this.configObj.percentOfWidth(0.84), 270, "spriteAtlas", this.closeInfoPopUp.bind(this, popUpContainer), this);
      this.close_click1.frameName = "close_btn.png";
      popUpContainer.add(this.close_click1);
      popUpContainer.scale.x = 0.5;
      popUpContainer.scale.y = 0.5;
      this.animatePopUp(popUpContainer);
    }
  }

  OnUnlockClick() {
    if (!this.popUp && !this.timerPopUp) {
      this.popUp = true;
      this.buttonState(false);
      this.configObj.playAudio(this.configObj.button_clickAudio);
      this.tint_Bg.visible = true;
      const popUpContainer = this.game.add.group();
      let unlock_screen = this.game.add.sprite(this.configObj.percentOfWidth(0.12), 70, "game_setting");
      unlock_screen.scale.y = 1.08;
      popUpContainer.add(unlock_screen);
      let startX = this.configObj.percentOfWidth(0.18);
      let startY = 145;
      let temp = 0;

      for (let i = 0; i < 6; i++) {
        if (temp == 2) {
          temp = 0;
          startX = this.configObj.percentOfWidth(0.18);
          startY += 200;
        }
        console.log(this.configObj.languageData["unlockedData"].subHeading1, this.configObj.languageData["unlockedData"].subHeading2);
        if (this.configObj.unlockedMonsterArr.indexOf("char_" + (i + 1)) == -1) {
          this.unlockMonsterArr[i] = this.game.add.button(startX, startY, "spriteAtlas1", this.unlockableClick.bind(this, this.configObj.languageData["unlockedData"].subHeading2, "char_" + (i + 1), popUpContainer, this.configObj.languageData["unlockedData"].unlockPetText, i), this);
          this.unlockMonsterArr[i].frameName = "char_" + (i + 1) + ".png";
        } else {
          this.unlockMonsterArr[i] = this.game.add.button(startX, startY, "spriteAtlas1", this.unlockableClick.bind(this, this.configObj.languageData["unlockedData"].subHeading1, "char_unlocked" + (i + 1), popUpContainer, this.configObj.languageData["unlockedData"].unlockPetText, i), this);
          this.unlockMonsterArr[i].frameName = "char_unlocked" + (i + 1) + ".png";
        }

        startX += 200;
        popUpContainer.add(this.unlockMonsterArr[i]);
        temp++;
      }
      popUpContainer.scale.x = 0.5;
      popUpContainer.scale.y = 0.5;
      this.close_click = this.game.add.button(this.configObj.percentOfWidth(0.76), 60, "spriteAtlas", this.closePopUp.bind(this, popUpContainer), this);
      this.close_click.frameName = "close_btn.png";
      popUpContainer.add(this.close_click);
      this.animatePopUp(popUpContainer);
    }
  }

  OnLevelButtonClick(levelNo) {
    if (configLevelData[levelNo].users && this.userCount < configLevelData[levelNo].users) {
      this.showBlocked(configLevelData[levelNo].users);
    } else if (!this.popUp && this.lifeCount > 0 && !this.timerPopUp) {
      this.buttonState(false);
      this.popUp = true;
      let score, stars;
      let levelInfo = this.configObj.getLevelInfo(levelNo - 1);
      if (levelInfo != null) {
        score = levelInfo.score;
      }
      else {
        score = 0;
      }

      this.configObj.playAudio(this.configObj.button_clickAudio);
      this.tint_Bg.visible = true;
      let popUpContainer = this.game.add.group();
      let game_setting_back = this.game.add.sprite(this.configObj.percentOfWidth(0.072), 55, "level_info_Bg");
      popUpContainer.add(game_setting_back);
      this.Level = this.game.add.text(this.configObj.percentOfWidth(0.345), 115, this.configObj.languageData["levelInfo"].title + " :" + levelNo, { font: "65px londrina", fill: "#a06626", align: "center" });
      popUpContainer.add(this.Level);
      this.Score = this.game.add.text(this.configObj.percentOfWidth(0.36), 370, this.configObj.languageData["levelInfo"].levelScore + "\t: " + score, { font: "35px londrina", fill: "#a26829", align: "center" });
      popUpContainer.add(this.Score);
      this.Target = this.game.add.text(this.configObj.percentOfWidth(0.36), 430, this.configObj.languageData["levelInfo"].levelTarget + " : " + configLevelData[levelNo].targetScore, { font: "35px londrina", fill: "#a26829", align: "center" });
      popUpContainer.add(this.Target);
      this.Moves = this.game.add.text(this.configObj.percentOfWidth(0.36), 490, this.configObj.languageData["levelInfo"].levelMoves + " \t: " + configLevelData[levelNo].moves, { font: "35px londrina", fill: "#a26829", align: "center" });
      popUpContainer.add(this.Moves);
      this.play_butn = this.game.add.button(this.configObj.percentOfWidth(0.284), 576, "spriteAtlas", this.OnPlayButtonClick.bind(this, popUpContainer), this);
      this.play_butn.frameName = "ingame_play_btn.png";
      popUpContainer.add(this.play_butn);
      this.play_butn.inputEnabled = false;
      this.close_click = this.game.add.button(this.configObj.percentOfWidth(0.84), 40, "spriteAtlas", this.closePopUp.bind(this, popUpContainer), this);
      this.close_click.frameName = "close_btn.png";
      popUpContainer.add(this.close_click);
      popUpContainer.scale.x = 0.5;
      popUpContainer.scale.y = 0.5;
      this.close_click.inputEnabled = false;
      this.configObj.levelNo = levelNo;
      this.animatePopUp(popUpContainer);
      let levelData = this.configObj.getLevelInfo(levelNo - 1);
      let startPos = this.configObj.percentOfWidth(0.29);
      let starCount = levelData != null ? levelData.stars : 0;
      if (starCount > 0) {
        this.buttonState(false);
        this.starImg = this.game.add.sprite(startPos, 276, "bigStar");
        popUpContainer.add(this.starImg);
        this.starImg.scale.x = 2;
        this.starImg.scale.y = 2;
        this.starImg.anchor.setTo(0.5, 0.5);
        startPos += 137;
        let starTween = this.game.add.tween(this.starImg.scale).to({ x: 0.2, y: 0.2 }, 500, Phaser.Easing.Bounce.Out, true, 100);
        this.configObj.playAudio(this.punch, false);
        starTween.onComplete.add(() => {
          this.starImg.destroy();
          this.starImg = null;
          this.starImg = this.game.add.sprite(this.configObj.percentOfWidth(0.221), 237, "spriteAtlas", "level_star.png");
          popUpContainer.add(this.starImg);
          this.play_butn.inputEnabled = this.close_click.inputEnabled = true;
          starCount--;
          if (starCount > 0) {
            this.play_butn.inputEnabled = this.close_click.inputEnabled = false;
            this.starImg1 = this.game.add.sprite(startPos, 276, "bigStar");
            this.starImg1.scale.x = 2;
            this.starImg1.scale.y = 2;
            popUpContainer.add(this.starImg1);
            this.starImg1.anchor.setTo(0.5, 0.5);
            startPos += 137;
            let starTween = this.game.add.tween(this.starImg1.scale).to({ x: 0.2, y: .2 }, 500, Phaser.Easing.Bounce.Out, true, 100);
            this.configObj.playAudio(this.punch, false);
            starTween.onComplete.add(() => {
              this.starImg1.destroy();
              this.starImg1 = null;
              this.starImg1 = this.game.add.sprite(this.configObj.percentOfWidth(0.435), 237, "spriteAtlas", "level_star.png");
              popUpContainer.add(this.starImg1);
              this.play_butn.inputEnabled = this.close_click.inputEnabled = true;
              starCount--;
              if (starCount > 0) {
                this.play_butn.inputEnabled = this.close_click.inputEnabled = false;
                this.starImg2 = this.game.add.sprite(startPos, 276, "bigStar");
                this.starImg2.scale.x = 2;
                this.starImg2.scale.y = 2;
                popUpContainer.add(this.starImg2);
                this.starImg2.anchor.setTo(0.5, 0.5);
                startPos += 137;
                let starTween = this.game.add.tween(this.starImg2.scale).to({ x: .2, y: .2 }, 500, Phaser.Easing.Bounce.Out, true, 100);
                this.configObj.playAudio(this.punch, false);
                starTween.onComplete.add(() => {
                  this.starImg2.destroy();
                  this.starImg2 = null;
                  this.starImg2 = this.game.add.sprite(this.configObj.percentOfWidth(0.65), 237, "spriteAtlas", "level_star.png");
                  popUpContainer.add(this.starImg2);
                  this.play_butn.inputEnabled = this.close_click.inputEnabled = true;
                });
              }
            });
          }
        });
      }
      else {
        this.play_butn.inputEnabled = this.close_click.inputEnabled = true;
      }
    } else if (!this.popUp && this.lifeCount == 0 && !this.timerPopUp) {
      this.buttonState(false);
      this.timerPopUp = true;
      this.tint_BgTimer = this.game.add.sprite(this.configObj.percentOfWidth(0), 0, "tint_background");
      const popUpContainer = this.game.add.group();
      const bg = this.game.add.sprite(this.configObj.percentOfWidth(0.07), 200, "buy_popup");
      popUpContainer.add(bg);
      const buyBtn = this.game.add.button(this.configObj.percentOfWidth(0.318), 520, "spriteAtlas1", this.OnShopClick, this);
      buyBtn.frameName = "buy_attempts_btn.png";
      popUpContainer.add(buyBtn);
      popUpContainer.add(this.game.add.text(this.configObj.percentOfWidth(0.255), 280, this.configObj.languageData["warning"]["noAttempts"].heading, { font: "45px londrina", fill: "red", align: "center" }));
      popUpContainer.add(this.game.add.text(this.configObj.percentOfWidth(0.23), 350, this.configObj.languageData["warning"]["noAttempts"].timerText, { font: "40px londrina", fill: "#a06626", align: "center" }));
      this.remainingTime = this.game.add.text(this.configObj.percentOfWidth(0.455), 400, "" + this.timerText.text, { font: "40px londrina", fill: "#a06626", align: "center" });
      popUpContainer.add(this.remainingTime);
      popUpContainer.add(this.game.add.text(this.configObj.percentOfWidth(0.19), 450, this.configObj.languageData["warning"]["noAttempts"]["suggestionMsg"], { font: "30px londrina", fill: "#a06626", align: "center" }));
      popUpContainer.scale.x = 0.5;
      popUpContainer.scale.y = 0.5;
      this.close_clickAlert = this.game.add.button(this.configObj.percentOfWidth(0.85), 170, "spriteAtlas", this.closeTimerPopUp.bind(this, popUpContainer), this);
      this.close_clickAlert.frameName = "close_btn.png";
      popUpContainer.add(this.close_clickAlert);
      this.animatePopUp(popUpContainer);
    }
  }

  showBlocked(users) {
    this.buttonState(false);
    const popUpContainer = this.game.add.group();
    const bg = this.game.add.sprite(this.configObj.percentOfWidth(0.07), 200, "buy_popup");
    popUpContainer.add(bg);
    const buyBtn = this.game.add.button(this.configObj.percentOfWidth(0.318), 520, "spriteAtlas1", this.OnCopyClipboard, this);
    buyBtn.frameName = "buy_attempts_btn.png";
    popUpContainer.add(buyBtn);
    popUpContainer.add(this.game.add.text(this.configObj.percentOfWidth(0.255), 280, this.configObj.languageData["warning"]["noUsers"].heading, { font: "45px londrina", fill: "red", align: "center" }));
    popUpContainer.add(this.game.add.text(this.configObj.percentOfWidth(0.2), 350, `Need to get ${users} users \n`, { font: "40px londrina", fill: "#a06626", align: "center" }));
    popUpContainer.add(this.game.add.text(this.configObj.percentOfWidth(0.255), 450, this.configObj.languageData["warning"]["noUsers"]["suggestionMsg"], { font: "30px londrina", fill: "#a06626", align: "center" }));
    popUpContainer.scale.x = 0.5;
    popUpContainer.scale.y = 0.5;
    this.close_clickAlert = this.game.add.button(this.configObj.percentOfWidth(0.85), 170, "spriteAtlas", this.closePopUp.bind(this, popUpContainer), this);
    this.close_clickAlert.frameName = "close_btn.png";
    popUpContainer.add(this.close_clickAlert);
    this.animatePopUp(popUpContainer);
  }

  async gameTimer() {
    this.lifeCount = await this.configObj.getLifeCount();
    if (this.lifeCount < 3) {
      this.totalElapsedTime = await this.configObj.attempTimerObj.updateTime();

      if (this.lifeCount > 0) {
        this.timerText.visible = false;
      }
      if (this.lifeCount == 0) {
        const timer = (this.configObj.attempTimeCounter * 60) - ((this.totalElapsedTime.m * 60) + this.totalElapsedTime.s);
        const minutes = Math.floor(timer / 60);
        const min = minutes < 10 ? "0" + minutes : minutes;
        const sec = timer % 60;
        const seconds = sec < 10 ? "0" + sec : sec;
        if (minutes >= 0 && sec >= 0) {
          if (this.timerText)
            this.timerText.text = min + ":" + seconds;
          if (this.timerPopUp) {
            this.remainingTime.text = min + ":" + seconds;
          }
        }
      }
      if (this.totalElapsedTime.m > 0 && this.totalElapsedTime.m % this.configObj.attempTimeCounter == 0) {
        //this.configObj.attempTimeCounter += this.configObj.attempTimeCounter;
        try {
          await this.configObj.incrementLife(1);
          this.lifeText.text = "" + await this.configObj.getLifeCount();
        } catch (err) {
          this.configObj.appState.setError(err.message);
        }
      }
    } else {
      this.configObj.attempTimeCounter = 10;
      this.game.time.events.remove(this.loopEvent);
    }
  }

  OnPlayButtonClick(container) {
    const isAndroid = navigator.userAgent.indexOf('Android') >= 0;
    const webkitVer = parseInt((/WebKit\/([0-9]+)/.exec(navigator.appVersion) || 0)[1], 10) || void 0; // also match AppleWebKit
    const isNativeAndroid = isAndroid && webkitVer <= 534 && navigator.vendor.indexOf('Google') == 0;
    if (isNativeAndroid) {
      this.configObj.nativeBrowser = true;
    }
    // this.level_start = this.game.add.audio('level_start');
    // this.configObj.playAudio(this.level_start, false);
    this.play_butn.inputEnabled = false;
    const anim = this.game.add.tween(container.scale).to({ x: 0.5, y: 0.5 }, 450, Phaser.Easing.Back.In, true);
    this.game.add.tween(container.position).to({ x: 0, y: 0 }, 450, Phaser.Easing.Back.In, true);
    anim.onComplete.add(() => {
      container.destroy();
      this.tint_Bg.destroy();
      this.tint_Bg = null;
      if (localStorage.tutorialShown == undefined) {
        this.game.tweens.removeAll();
        this.game.state.start('InGameTutorial');
      } else {
        this.game.tweens.removeAll();
        this.game.state.start('MagicMonsters');
      }
    });
  }

  buttonState(state) {
    this.ach_butn.inputEnabled = this.shop_butn.inputEnabled = this.unlock_butn.inputEnabled = state;
  }

  update() {
  }
}