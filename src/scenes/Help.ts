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

    preload() {
        SceneFactory.preload(this);
    }

    create() {
        const { width, height } = this.scale;
        
        this.add.image(width / 2, height / 2 - 150, 'logo').setDisplaySize(460, 196).setOrigin(0.5, 0.5);

        this.createIntro();

        this.input.on('pointerdown', () => { this.continueGame(); });
        this.input.on('keydown', () => { this.continueGame(); });
    }

    private clearLines() {
        this.line1.destroy();
        this.line2.destroy();
        this.line3.destroy();
        this.line4.destroy();
    }

    private createIntro() {
        const { width, height } = this.scale;

        this.line1 = this.add.bitmapText(width * 0.5, height / 2, 'press_start', 'If you allow Hoppa to connect', 32)
            .setTint(0xffffff)
            .setOrigin(0.5);
        this.line2 = this.add.bitmapText(width * 0.5, height / 2 + 48, 'press_start', 'Hoppa will check your Balance for', 32)
            .setTint(0xffffff)
            .setOrigin(0.5);
        this.line3 = this.add.bitmapText(width * 0.5, height / 2 + 96, 'press_start', 'MSHOT and RA8BIT tokens', 32)
            .setTint(0xffffff)
            .setOrigin(0.5);
        this.line4 = this.add.bitmapText(width * 0.5, height / 2 + 144, 'press_start', 'And NFTs from MoonBoxes.io', 32)
            .setTint(0xffffff)
            .setOrigin(0.5);
                    
        this.time.delayedCall(12000, () => {
            this.clearLines();
            this.createKeys();
        });

    }

    private createKeys() {
        const { width, height } = this.scale;

        this.line1 = this.add.bitmapText(width * 0.5, height / 2, 'press_start', 'Use CURSOR or WASD keys to move', 32)
        .setTint(0xffffff)
        .setOrigin(0.5);

        this.line2 = this.add.bitmapText(width * 0.5, height / 2 + 48, 'press_start', 'Use SPACEBAR to jump', 32)
            .setTint(0xffffff)
            .setOrigin(0.5);

        this.line3 = this.add.bitmapText(width * 0.5, height / 2 + 96, 'press_start', 'Use SHIFT to throw', 32)
            .setTint(0xffffff)
            .setOrigin(0.5);

        this.line4 = this.add.bitmapText(width * 0.5, height / 2 + 144, 'press_start', 'Or use touchpad', 32)
            .setTint(0xffffff)
            .setOrigin(0.5);

            
        this.time.delayedCall(6000, () => {
            this.clearLines();
            this.createIntro();
        });
    }

    destroy() {
        this.line1.destroy();
        this.line2.destroy();
        this.line3.destroy();
        this.line4.destroy();
    }

    private continueGame() {
        this.scene.stop();
        this.scene.start('hoppa');
    }

}