import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
export default class GameOver extends Phaser.Scene {
    constructor() {
        super('game-over')
    }

    private introMusic?: Phaser.Sound.BaseSound;

    preload() {
        SceneFactory.preload(this);
    }

    create() {
        const { width, height } = this.scale;

        this.introMusic = SceneFactory.addSound(this, 'gameover', false);

        this.add.bitmapText(width * 0.5, height * 0.5, 'press_start', 'GAME OVER', 64)
            .setTint(0xff7300)
            .setOrigin(0.5);

        this.input.on('pointerdown', () => { this.continueGame(); });
        this.input.on('keydown', () => { this.continueGame(); });

        this.cameras.main.shake(500);
    }

    continueGame() {
        this.introMusic?.stop();
        this.scene.start('start');
    }
}