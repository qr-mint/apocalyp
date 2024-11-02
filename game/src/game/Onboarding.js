export class Onboarding {
    constructor(configObj) {
        this.configObj = configObj;
        this.charEyes = new Array();
        this.eyesPos = [{
            x: configObj.percentOfWidth(0.347),
            y: configObj.percentOfHeight(0.365)
        },
        {
            x: configObj.percentOfWidth(0.645),
            y: configObj.percentOfHeight(0.53)
        },
        {
            x: configObj.percentOfWidth(0.468),
            y: configObj.percentOfHeight(0.685)
        }];
    }
    
    preload() {
        //
    }

    create() {
        this.eyeAnimIndex = 0;
        this.gameTimeCounter = 0;
        this.bg_sound = this.game.add.audio("splash_screen_bg");
        this.configObj.playAudio(this.bg_sound);
        this.languageSelection = "english";

        this.game.add.sprite(0, 0, "main_background");

        this.playBtn = this.game.add.button(this.configObj.percentOfWidth(0.2735), this.configObj.percentOfHeight(0.84), "spriteAtlas", this.startGame, this);
        this.playBtn.frameName = "button_play.png";
    }

    startGame() {
        this.configObj.pauseAudio(this.bg_sound);
        this.configObj.button_clickAudio = this.game.add.audio('button_click');
        this.configObj.playAudio(this.configObj.button_clickAudio, false);
        this.game.state.start('Menu');
    }

    update() {
        
    }
}