export class GameOver {
  constructor(configObj) {
    this.configObj = configObj;
  }

  create () {
    var levelData = this.configObj.getLevelInfo(this.configObj.levelNo - 1);
    this.backGroundImg1 = this.configObj.game.add.sprite(
      this.configObj.percentOfWidth(0),
      0,
      "bg_Img"
    );
    this.configObj.game.add.sprite(
      this.configObj.percentOfWidth(0.2),
      270,
      "spriteAtlas",
      "level_score.png"
    );
    this.score = this.configObj.game.add.text(
      this.configObj.percentOfWidth(0.51),
      310,
      this.configObj.languageData["levelUp"]["levelScore"] +
      ": " +
      this.configObj.currentLevelScore,
      { font: "50px londrina", fill: "#fffeff", align: "center" }
    );
    this.score.anchor.setTo(0.5, 0.5);
    this.configObj.game.add.sprite(
      this.configObj.percentOfWidth(0.26),
      357,
      "spriteAtlas",
      "highest_score.png"
    );
    this.highScore = this.configObj.game.add.text(
      this.configObj.percentOfWidth(0.51),
      375,
      this.configObj.languageData["levelUp"]["highScore"] + ": " + levelData.score,
      { font: "31px londrina", fill: "#ACF1F3", align: "center" }
    );
    this.highScore.anchor.setTo(0.5, 0.5);
    var retryLevel = this.configObj.game.add.button(
      this.configObj.percentOfWidth(0.118),
      735,
      "spriteAtlas",
      this.restartLevel,
      this
    );
    retryLevel.frameName = "retry_level.png";
    var levelSelection = this.configObj.game.add.button(
      this.configObj.percentOfWidth(0.312),
      735,
      "spriteAtlas",
      this.loadLevelSelectionScreen,
      this
    );
    levelSelection.frameName = "level_selc_btn.png";
    //this.displayAdd();
  }

  restartLevel () {
    //        document.getElementById("div-gpt-ad-1409063445073-0").style.display = "none";
    this.configObj.playAudio(this.configObj.button_clickAudio);
    this.configObj.game.state.start("MagicMonsters");
  }

  loadLevelSelectionScreen () {
    //        document.getElementById("div-gpt-ad-1409063445073-0").style.display = "none";
    this.configObj.game.state.start("Menu");
  }

  displayAdd () {
    //        googletag.cmd.push(function() { googletag.display('div-gpt-ad-1409063445073-0'); });
    //        document.getElementById("div-gpt-ad-1409063445073-0").style.display = "block";
  }

  update () {

  }
}
