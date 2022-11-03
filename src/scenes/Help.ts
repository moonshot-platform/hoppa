import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
export default class Help extends Phaser.Scene {

    private line1!: Phaser.GameObjects.BitmapText;
    private line2!: Phaser.GameObjects.BitmapText;
    private line3!: Phaser.GameObjects.BitmapText;
    private line4!: Phaser.GameObjects.BitmapText;

    constructor() {
        super('help')
    }

    init() {

    }

    preload() {
        SceneFactory.preload(this);
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2 - 96, 'logo').setDisplaySize(306, 131).setOrigin(0.5, 0.5);


        this.line1 = this.add.bitmapText(width * 0.5, height / 2, 'press_start', 'Use CURSOR or WASD keys to move.', 18)
            .setTint(0xffffff)
            .setOrigin(0.5);

        this.line2 = this.add.bitmapText(width * 0.5, height / 2 + 48, 'press_start', 'Use SPACEBAR to jump', 18)
            .setTint(0xffffff)
            .setOrigin(0.5);

        this.line3 = this.add.bitmapText(width * 0.5, height / 2 + 96, 'press_start', 'Use SHIFT to throw', 18)
            .setTint(0xffffff)
            .setOrigin(0.5);

        this.line4 = this.add.bitmapText(width * 0.5, height / 2 + 144, 'press_start', 'Or use touchpad', 18)
            .setTint(0xffffff)
            .setOrigin(0.5);

        this.input.on('pointerdown', () => { this.continueGame(); });
        this.input.on('keydown', () => { this.continueGame(); });
    }

    destroy() {
        this.line1.destroy();
        this.line2.destroy();
        this.line3.destroy();
        this.line4.destroy();
    }

    private continueGame() {
        this.scene.stop();
        this.scene.setVisible(true, 'hoppa');
    }

}