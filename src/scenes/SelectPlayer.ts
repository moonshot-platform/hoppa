import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
import { PlayerPreferences } from "./PlayerPreferences";
import { PlayerStats } from "./PlayerStats";

export default class GameSettingsMenu extends Phaser.Scene {

    private info!: PlayerPreferences;
    
    private backLabel!: Phaser.GameObjects.BitmapText;
    private backLabel2!: Phaser.GameObjects.BitmapText;
    private maleRabbit!: Phaser.GameObjects.Image;
    private femaleRabbit!: Phaser.GameObjects.Image;
    private arrow!:Phaser.GameObjects.Image;
    private player1Selected: boolean;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private nextScene: string;
    private sounds!: Map<string, Phaser.Sound.BaseSound>;
    private stats!: PlayerStats;
    
    constructor() {
        super('player-select');

        this.info = { rabbit: "player1", voice: "krasota" };
        this.player1Selected = true;
        this.nextScene = 'level1';
    }

    init() {
        this.cursors = this.input.keyboard?.createCursorKeys();
        this.sounds = new Map<string, Phaser.Sound.BaseSound>();

        const data = window.localStorage.getItem( 'ra8bit.stats' );
        if( data != null ) {
            const obj = JSON.parse(data);
            this.stats = obj as PlayerStats;
            this.nextScene = 'level' + this.stats.currLevel;
        }
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });
    }

    preload() {
        SceneFactory.preload(this);

        this.load.image('arrow', 'assets/arrow.webp');

        const data = window.localStorage.getItem('ra8bit.player');

        if (data != null) {
            const obj = JSON.parse(data);
            this.info = obj as PlayerPreferences;
        }
   
        globalThis.rabbit = this.info.rabbit;
     }

    saveSettings() {

        this.info.rabbit = globalThis.rabbit;
        
        const data = JSON.stringify(this.info);
        window.localStorage.setItem('ra8bit.player', data);
    }

    selectPlayer1() {
        const { width, height } = this.scale;
 
        this.player1Selected = true;
        this.arrow.setPosition( width/2 - 100, 220 );
        globalThis.rabbit = 'player1';
        globalThis.voice = '';
        SceneFactory.playSound(this.sounds, 'blip');
    }

    selectPlayer2() {
        const { width, height } = this.scale;
 
        this.player1Selected = false;
        this.arrow.setPosition( width/2 + 100, 220 );
        globalThis.rabbit = 'player2';
        globalThis.voice = '-cs';
        SceneFactory.playSound(this.sounds, 'blip');
    }

    create() {

        const { width, height } = this.scale;

        this.input.setDefaultCursor('url(assets/hand.cur), pointer');

        this.sounds = SceneFactory.setupSounds(this);
        
        this.backLabel = this.add.bitmapText(width / 2, 64, 'press_start', 'PLEASE SELECT', 24)
            .setTint(0xff7300)
            .setOrigin(0.5,0);
     
        this.backLabel2 = this.add.bitmapText(width / 2, 116, 'press_start', '... PLAYER?', 24)
            .setTint(0xff7300)
            .setOrigin(0.5,0);

        this.maleRabbit = this.add.image(width / 2 - 100, 350, 'rabbit', '5_Turn1.webp');
        this.femaleRabbit = this.add.image(width/2 + 100, 350, 'rabbit', '5_FemTurn1.webp');
        this.femaleRabbit.flipX = true;
        this.arrow = this.add.image(width/2 - 100, 220, 'arrow').setDisplaySize(32,40);

        this.tweens.add( {
            targets: this.arrow,
            y: 256,
            duration: 1000,
            ease: Phaser.Math.Easing.Linear,
            delay: 0,
            yoyo: true,
            repeat: -1,
        });

        this.maleRabbit.setInteractive({ cursor: 'pointer' })
            .on('pointerup', () => {
                this.selectPlayer1();
                this.continueGame();
            })
            .on('pointerdown', () => {
                this.selectPlayer1();
            });

        this.femaleRabbit.setInteractive({ cursor: 'pointer' })
            .on('pointerup', () => {
                this.selectPlayer2();
                this.continueGame();
            })
            .on('pointerdown', () => {
                this.selectPlayer2();
            });
        
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.saveSettings();
        });

        this.input.keyboard?.on("keydown-ESC", (event) => {
            this.goBackScene();
        });
    }

    update(): void {

        if(this.cursors?.left.isDown || SceneFactory.isGamePadLeft(this)) {
            this.selectPlayer1();
        }
        else if(this.cursors?.right.isDown || SceneFactory.isGamePadRight(this)) {
            this.selectPlayer2();
        }
        else if(this.cursors?.shift.isDown || this.cursors?.space.isDown || SceneFactory.gamePadIsButton(this,0) ) { 
            this.continueGame();
        }

        if( SceneFactory.gamePadIsButton(this,8)) {
            this.goBackScene();
        }
    }

    private goBackScene() {
        this.scene.stop();
        this.scene.start('hoppa-select');
    }

    destroy() {
        this.backLabel.destroy();
        this.backLabel2.destroy(); 
        this.maleRabbit.destroy();
        this.femaleRabbit.destroy();
        this.arrow.destroy();
        SceneFactory.stopSound(this);
        SceneFactory.removeAllSounds(this);
        this.sounds.clear(); 
    }

    continueGame() {
        this.scene.stop();

        if( globalThis.chainId == 56 && !globalThis.noWallet ) {
            globalThis.adReturn = this.nextScene;
            this.scene.start( 'halloffame' );
        }
        else {
            this.scene.start(this.nextScene);
        }
    }
}