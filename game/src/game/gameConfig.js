import { AttemptTimer } from "./model/AttemptTimer";

import { GameOver } from "./GameOver";
import { InGameTutorial } from "./InGameTutorial";
import { Menu } from "./Menu";
import { LevelUp } from "./LevelUp";
import { Loading } from "./Loading";
import { Magic } from "./Magic";
import { Onboarding } from "./Onboarding";
import { useGameStore } from "../store/game";
import { useAppStore } from "../store/app";

import language from "./language.json";
import { Coins } from "./model/Coins";

export class GameConfig {
  constructor(containerId) {
    this.audioPaused = false;
    this.currentLevelData = {};
    this.nativeBrowser = false;

    this.attempTimeCounter = 10;

    this.currLevelStatus = null;
    
    this.game = new Phaser.Game(640, 1150, Phaser.CANVAS, containerId, null, false, false);

    this.textMarginForBrowser = 0;
    this.device = null;

    this.levelNo = 1;
    this.currentLevelScore = 0;

    this.levelClear = false;
    // Global audio
    this.button_clickAudio = null;
    this.languageData = language.english;
    this.gameState = useGameStore.getState();
    this.appState = useAppStore.getState();


    this.objYPositionContainer = [];
    this.game.state.add("LoadingScreen", new Loading(this));
    this.game.state.add("Onboarding", new Onboarding(this));
    this.game.state.add("InGameTutorial", new InGameTutorial(this));
    this.game.state.add("LevelUp", new LevelUp(this));
    this.game.state.add("Menu", new Menu(this));
    this.game.state.add("GameOver", new GameOver(this));
    this.game.state.add("MagicMonsters", new Magic(this));
    this.game.state.start("LoadingScreen");
  }

  async init() {
    const { levels, data } = useGameStore.getState();
    this.oldLevelData = levels;

    this.availablePowerUp = data.power_up_count;
    this.livesCount = data.lives;
    this.unlockedMonsterArr = data.unlocked_monster_data;
    this.currLevelStatus = data.curr_level_status;
    if (data.attempt_timer) {
      this.attempTimer = parseInt(data.attempt_timer);
    }
    this.attempTimerObj = new AttemptTimer(this);
    this.coins = new Coins(data.coins);
    try {
      await this.updateLife(-1);
    } catch (err) {
      this.appState.setError(err.message);
    }
  }

  async addItems(levelNo, stars, score, cleared, currScore) {
    if (this.oldLevelData[levelNo - 2] !== undefined) {
      const total = this.oldLevelData[levelNo - 2].total_score + currScore;
      this.currentLevelData = {
        number: levelNo,
        stars,
        score,
        level_cleared: cleared,
        total_score: total,
      };
      this.oldLevelData[levelNo - 1] = this.currentLevelData;
      try {
        await this.gameState.pushLevel(this.oldLevelData[levelNo - 1]);
      } catch (err) {
        this.appState.setError(err.message);
      }
    }
  }

  getLevelInfo(levelNo) {
    return this.oldLevelData[levelNo];
  }

  getLifeCount() {
    return this.livesCount;
  }

  async updateLife(incrementFactor) {
    const lastLevelInfo = this.currLevelStatus;
    if (lastLevelInfo !== null && lastLevelInfo["levelCleared"] === false) {
      const lifeRem = this.livesCount;
      this.livesCount += lifeRem > 0 ? incrementFactor : 0;
      const data = { lives: this.livesCount, curr_level_status: {} };

      if (this.livesCount < 3) {
        data.attempt_timer = this.attempTimerObj.getTime();
        this.attempTimer = data.attemp_timer;
        this.attempTimerObj.setAttemptTimer(data.attempt_timer);
      }
      await this.gameState.updateData(data);
    }
  }

  async incrementLife(factor) {
    const lifeRem = this.livesCount + factor;
    const data = {};
    if (lifeRem >= 3) {
      data.attempt_timer = null;
    }
    data.lives = lifeRem;
    this.livesCount = lifeRem;
    await this.gameState.updateData(data);
  }

  async setPowerUp(powerUp, count) {
    try {
      const temp = this.availablePowerUp;
      const updated = temp[powerUp] + count;
      if (updated >= 0) {
        this.availablePowerUp[powerUp.toString()] = updated;
        await this.gameState.updateData({ power_up_count: this.availablePowerUp })
      }
    } catch (err) {
      this.appState.setError(err.message);
    }
  }

  percentOfWidth(factor) {
    return this.game.width * factor;
  }

  percentOfHeight(factor) {
    return 1138 * factor;
  }

  getPowerUp(powerUp) {
    return this.availablePowerUp[powerUp];
  }

  async updatePowerUp(powerUp) {
    try {
      const updated = this.availablePowerUp[powerUp] - 1;
      if (updated >= 0) {
        this.availablePowerUp[`${powerUp}`] = updated;
        await this.gameState.updateData({ power_up_count: this.availablePowerUp });
      }
      return updated;
    } catch (err) {
      this.appState.setError(err.message);
    }
  }

  playAudio(audio, loop) {
    if (this.nativeBrowser && (audio.name === "bg_sound" || audio.name === "splash_screen_bg")) {
      if (!this.audioPaused) {
        if (loop) audio.play("", 0, 1, true);
        else audio.play();
      }
    } else if (!this.audioPaused && !this.nativeBrowser) {
      if (loop) audio.play("", 0, 1, true);
      else audio.play();
    }
  }

  pauseAudio(audio) {
    audio.pause();
  }

  resumeAudio(audio) {
    audio.resume();
  }

  destroy() {
    this.game.destroy();
  }
}
