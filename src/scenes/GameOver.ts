import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
export default class GameOver extends Phaser.Scene {
    constructor() {
        super('game-over')
    }

    private introMusic?: Phaser.Sound.BaseSound;
    private text: Phaser.GameObjects.BitmapText;

    preload() {
        SceneFactory.preload(this);
    }

    create() {
        const { width, height } = this.scale;
        
        globalThis.musicTune = false;

        this.introMusic = SceneFactory.addSound(this, 'gameover', false);

        this.text = this.add.bitmapText(width * 0.5, height * 0.5, 'press_start', 'GAME OVER', 64)
            .setTint(0xff7300)
            .setOrigin(0.5);

        this.input.on('pointerdown', () => { this.continueGame(); });
        this.input.on('keydown', () => { this.continueGame(); });

        this.cameras.main.shake(500);

        this.time.delayedCall( 5000, () => {
            this.add.bitmapText(width * 0.5, height * 0.5 + 96, 'press_start', 'PRESS ANY KEY', 24 )
                .setTint(0xffffff)
                .setOrigin(0.5);
        });
    }

    continueGame() {
        this.introMusic?.stop();
        this.scene.start('start');
    }

    update() {
        if(SceneFactory.gamePadAnyButton(this)) {
            this.continueGame();
        }
    }

    destroy() {
        this.text.destroy();
        this.introMusic?.destroy();
    }
}