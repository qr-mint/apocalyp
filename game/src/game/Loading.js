import { useGameStore } from '../store/game';

export class Loading {
    constructor (configObj) {
        this.configObj = configObj;
    }

    async preload() {
        this.game.stage.backgroundColor = "#222";        
        this.game.load.image("leftBar", "assets/images/game/left_side_bar.jpg");
        this.game.load.image("rightBarLevelUp", "assets/images/levelup/right_bar.jpg");
        this.game.load.spritesheet("gameHero", "assets/images/loadingScreen/Cat_spritesheet.png", 300, 285, 20);
        this.game.load.spritesheet("retry_ch", "assets/images/levelup/retry_ch.png", 166, 252, 12);
        this.game.load.image("fullscreen_icon", "assets/images/game/fullscreen_icon.png");

        this.game.scale.pageAlignHorizontally = true;
        this.game.scale.pageAlignVertically = true;
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        //this.game.scale.setScreenSize();
        this.game.scale.refresh();

        this.text = this.game.add.text(228, 520, '', { font: "40px londrina", fill: '#a26829', fontWeight: 'bold' });
        this.start();

        this.game.load.onLoadStart.add(this.loadStart, this);
        this.game.load.onFileComplete.add(this.fileComplete, this);
        this.game.load.onLoadComplete.add(this.loadComplete, this);
        //	Progress report
        //this.scaleForDevice();
        this.game.load.start();
    }

    create() {
        
    }

    start() {
        //        Img pack
        this.game.load.atlasXML('spriteAtlas', 'assets/images/imgPack/sprites.png', 'assets/images/imgPack/sprites.xml');
        this.game.load.atlasXML('spriteAtlas1', 'assets/images/imgPack/Pack2/sprites.png', 'assets/images/imgPack/Pack2/sprites.xml');

        //      Main menu
        this.game.load.image("main_background", "assets/images/mainmenu/bg_main_menu.png");

        // Contains the loading of files for game settings screen
        this.game.load.image("tint_background", "assets/images/GameSettings/tint_bg.png");
        this.game.load.image("bg_disable", "assets/images/GameSettings/bg_disable.png");
        this.game.load.image("game_setting", "assets/images/GameSettings/game_setting.png");
        this.game.load.image("game_setting1", "assets/images/GameSettings/game_setting1.png");

        //Contains the loading of image files for level selection screen

        this.game.load.image("level_select_bg1", "assets/images/levelselection/level_selection_bg1.png");
        this.game.load.image("overlay", "assets/images/levelselection/overlay.png");
        this.game.load.image("level_info_Bg", "assets/images/levelselection/levelInfoBG.png");
        this.game.load.image("bigStar", "assets/images/levelselection/bigStar.png");

        this.game.load.image("buy_popup", "assets/images/shop/buy_popup.png");

        //        Game screen
        this.game.load.image("Game_background", "assets/images/game/bg_game_screen.png");
        this.game.load.spritesheet("jelly_animation", "assets/images/game/jelly_animation.png", 343, 348, 20);
        this.game.load.image("rightBar", "assets/images/game/right_side_bar.png");

        this.game.load.spritesheet("tap_hands", "assets/images/game/tap_hand.png", 58, 52, 2);
        this.game.load.spritesheet("hand_anim", "assets/images/game/hand_anim.png", 57, 56, 10);

        this.game.load.spritesheet("extra_moves", "assets/images/game/extra_moves.png", 192, 137, 2);
        this.game.load.spritesheet("magic_ring", "assets/images/game/magic_ring.png", 192, 125, 2);
        this.game.load.spritesheet("magic_stick", "assets/images/game/magic_stick.png", 192, 134, 2);
        this.game.load.spritesheet("powerUpRing", "assets/images/game/mobile/magicRing.png", 55, 55, 2);
        this.game.load.spritesheet("universalPowerUp", "assets/images/game/mobile/magicStick.png", 63, 62, 2);
        this.game.load.spritesheet("addMoreMoves", "assets/images/game/mobile/extraMoves.png", 61, 59, 2);

        //      Monsters Image
        this.game.load.spritesheet("monster0", "assets/images/game/monster0.png", 80, 80, 2);
        this.game.load.spritesheet("monster1", "assets/images/game/monster1.png", 80, 80, 2);
        this.game.load.spritesheet("monster2", "assets/images/game/monster2.png", 80, 80, 2);
        this.game.load.spritesheet("monster3", "assets/images/game/monster3.png", 80, 80, 2);
        this.game.load.spritesheet("monster4", "assets/images/game/monster4.png", 80, 80, 2);
        this.game.load.spritesheet("monster5", "assets/images/game/monster5.png", 80, 80, 2);
        //      Power Ups
        this.game.load.spritesheet("super0", "assets/images/game/powerup0.png", 80, 80, 2);
        this.game.load.spritesheet("super1", "assets/images/game/powerup1.png", 80, 80, 2);
        this.game.load.spritesheet("super2", "assets/images/game/powerup2.png", 80, 80, 2);
        this.game.load.spritesheet("super3", "assets/images/game/powerup3.png", 80, 80, 2);
        this.game.load.spritesheet("super4", "assets/images/game/powerup4.png", 80, 80, 2);
        this.game.load.spritesheet("super5", "assets/images/game/powerup5.png", 80, 80, 2);

        this.game.load.spritesheet("score0", "assets/images/game/score0.png", 40, 54);
        this.game.load.spritesheet("score1", "assets/images/game/score1.png", 40, 54);
        this.game.load.spritesheet("score2", "assets/images/game/score2.png", 40, 54);
        this.game.load.spritesheet("score3", "assets/images/game/score3.png", 40, 54);
        this.game.load.spritesheet("score4", "assets/images/game/score4.png", 40, 54);
        this.game.load.spritesheet("score5", "assets/images/game/score5.png", 40, 54);

        this.game.load.image("universal", "assets/images/game/mobile/universal.png");
        this.game.load.image("header", "assets/images/game/mobile/header.png");
        this.game.load.image("footer", "assets/images/game/mobile/footer.png");
        this.game.load.image("Game_background_mbl", "assets/images/game/mobile/background.png");
        this.game.load.image("hud_BGLayer", "assets/images/game/mobile/hud_BGLayer.png");

        //       Level Up
        this.game.load.image("bg_Img", "assets/images/levelup/bg_Img.jpg");
        this.game.load.image("win", "assets/images/levelup/win.jpg");


        //      Audio
        //this.game.load.audio('splash_screen_bg', ['assets/audio/splash_screen_bgSound.mp3', 'assets/audio/splash_screen_bgSound.ogg']);
        this.game.load.audio('bg_sound', ['assets/audio/mm_bg.ogg', 'assets/audio/mm_bg.mp3']);
        this.game.load.audio('button_click', ['assets/audio/button_click.mp3', 'assets/audio/button_click.ogg']);
        this.game.load.audio('swipe', ['assets/audio/swipe.mp3', 'assets/audio/swipe.ogg']);
        this.game.load.audio('wrong_move', ['assets/audio/wrong_move.mp3', 'assets/audio/wrong_move.ogg']);
        this.game.load.audio('level_up', ['assets/audio/level_up.mp3', 'assets/audio/level_up.ogg']);
        this.game.load.audio('level_fail', ['assets/audio/level_fail.mp3', 'assets/audio/level_fail.ogg']);
        this.game.load.audio('new_spawn', ['assets/audio/new_spawn.mp3', 'assets/audio/new_spawn.ogg']);

        this.game.load.audio('monster0', ['assets/audio/monster0.mp3', 'assets/audio/monster0.ogg']);
        this.game.load.audio('monster1', ['assets/audio/monster1.mp3', 'assets/audio/monster1.ogg']);
        this.game.load.audio('monster2', ['assets/audio/monster2.mp3', 'assets/audio/monster2.ogg']);
        this.game.load.audio('monster3', ['assets/audio/monster3.mp3', 'assets/audio/monster3.ogg']);
        this.game.load.audio('monster4', ['assets/audio/monster4.mp3', 'assets/audio/monster4.ogg']);
        this.game.load.audio('monster5', ['assets/audio/monster5.mp3', 'assets/audio/monster5.ogg']);
        this.game.load.audio('punch', ['assets/audio/punch.mp3', 'assets/audio/punch.ogg']);
        this.game.load.audio('powermonster', ['assets/audio/powermonster.mp3', 'assets/audio/powermonster.ogg']);
        this.game.load.audio('jellybreak', ['assets/audio/jellybreak.mp3', 'assets/audio/jellybreak.ogg']);
        this.game.load.audio('no_more_moves', ['assets/audio/no_more_moves.mp3', 'assets/audio/no_more_moves.ogg']);
        this.preparing = this.game.add.text(this.configObj.percentOfWidth(0.365), 610, '', { font: "30px londrina", fill: '#a26829' });
    }

    async loadStart() {
        try {
            const { init } = useGameStore.getState();
            await init();
            await this.configObj.init();
        } catch (err) {
            console.error(err.message);
        }
    }

    //	This callback is sent the following parameters:
    fileComplete(progress) {
        this.text.setText("loading: " + progress + "%");
        this.preparing.destroy();
    }

    loadComplete() {
        this.configObj.appState.setLoading(false);
        this.game.state.start('Onboarding');
    }

    scaleForDevice() {

    }

    update() {
        
    }
}
