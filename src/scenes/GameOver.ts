import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
import { PlayerStats } from "./PlayerStats";
import * as WalletHelper from '../scripts/WalletHelper';
import TextDemo from '../scripts/TextDemo';

export default class GameOver extends Phaser.Scene {
    constructor() {
        super('game-over')
    }

    private introMusic?: Phaser.Sound.BaseSound;
    //private text!: Phaser.GameObjects.BitmapText;
    private textDemo!: TextDemo;
    private anyKey?: Phaser.GameObjects.BitmapText;
    
    private info?: PlayerStats;
    private offset: number = 0;
    private amplitude = 100;
    private frequency = 0.01;

    preload() {
        SceneFactory.preload(this);
    }

    init() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });
    }

    create() {
        const { width, height } = this.scale;
        
        globalThis.musicTune = false;
        globalThis.spawnLocation = 30 * 10;

        this.introMusic = SceneFactory.addSound(this, 'gameover', false);

       /* this.text = this.add.bitmapText(width * 0.5, height * 0.5, 'press_start', 'GAME OVER', 64)
            .setTint(0xff7300)
            .setOrigin(0.5);*/
        this.textDemo = new TextDemo(this,'press_start','GAME OVER', 48, width * 0.5, height * 0.5, 0xff7300, 0.5);
        this.textDemo.letterBounce(500,800,true,32,-1);

        this.input.on('pointerdown', () => { this.continueGame(); });
        this.input.on('keydown', () => { this.continueGame(); });

        this.cameras.main.shake(500);

        this.time.delayedCall( 5000, () => {
            this.anyKey = this.add.bitmapText(width * 0.5, height * 0.5 + 96, 'press_start', 'PRESS ANY KEY', 24 )
                .setTint(0xffffff)
                .setOrigin(0.5);
        });
    }

    continueGame() {
        this.introMusic?.stop();

        this.hasNewHighscore();
    }

    update() {
        if(SceneFactory.gamePadIsButton(this,-1)) {
            this.continueGame();
        }
    }

    destroy() {
        this.introMusic?.destroy();
        this.anyKey?.destroy();
        this.textDemo.destroy();
    }

    private hasNewHighscore() {
        let result = false;

        const data = window.localStorage.getItem( 'ra8bit.stats' );
        if( data != null ) {
            const obj = JSON.parse(data);
            this.info = obj as PlayerStats;
        }

        if(globalThis.chainId == 56 && !globalThis.noWallet ) {
            let hs = this.info?.highScorePoints || 0;
            let score = this.info?.scorePoints || 0;
            if( hs > score )
                score = hs;

            const checkNewHighscore = async() => {
                const inTop10 = await WalletHelper.hasNewHighScore(score);
                if(inTop10) {
                    this.scene.stop();
                    this.scene.start('enter-hall');
                }
                else {
                    this.scene.stop();
                    this.scene.start('start');
                }
            };
            checkNewHighscore();
        }
        else {
            this.scene.stop();
            this.scene.start('start');
        }

    }

}