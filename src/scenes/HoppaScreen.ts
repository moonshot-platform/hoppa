import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
export default class HoppaScreen extends Phaser.Scene {

    private rotate!: Phaser.GameObjects.BitmapText;
    private goFS: boolean = false;

    private continueLabel!: Phaser.GameObjects.BitmapText;
    private optionsLabel!: Phaser.GameObjects.BitmapText;
    private helpLabel!: Phaser.GameObjects.BitmapText;

    constructor() {
        super('hoppa')
    }

    init() {

        if (this.sys.game.device.fullscreen.available) {
            this.goFS = true;
        }
    }

    preload() {
        SceneFactory.preload(this);
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2 - 96, 'logo').setDisplaySize(306, 131).setOrigin(0.5, 0.5);

        this.add.bitmapText(width * 0.5, height / 2, 'press_start', 'A Ra8bits Production', 22)
            .setTint(0xffffff)
            .setOrigin(0.5);

        this.time.delayedCall(3000, () => {
            this.continueLabel = this.add.bitmapText(width * 0.5, height / 2 + 48, 'press_start', 'Continue', 18)
                .setTint(0xffffff)
                .setOrigin(0.5);

            this.optionsLabel = this.add.bitmapText(width * 0.5, height / 2 + 96, 'press_start', 'Options', 18)
                .setTint(0xffffff)
                .setOrigin(0.5);

            this.helpLabel = this.add.bitmapText(width * 0.5, height / 2 + 144, 'press_start', 'Help', 18)
                .setTint(0xffffff)
                .setOrigin(0.5);


            this.continueLabel.setInteractive({ cursor: 'pointer' })
                .on('pointerup', () => {
                    this.continueLabel.setTint(0x222b5c);
                    this.continueGame();
                })
                .on('pointerdown', () => {
                    this.continueLabel.setTint(0x99b0be);
                });

            this.optionsLabel.setInteractive({ cursor: 'pointer' })
                .on('pointerup', () => {
                    this.optionsLabel.setTint(0x222b5c);
                    this.scene.setVisible(false);
                    this.scene.launch('options');
                })
                .on('pointerdown', () => {
                    this.optionsLabel.setTint(0x99b0be);
                });

            this.helpLabel.setInteractive({ cursor: 'pointer' })
                .on('pointerup', () => {
                    this.helpLabel.setTint(0x222b5c);
                    this.scene.launch('help');
                    this.scene.setVisible(false);
                })
                .on('pointerdown', () => {
                    this.helpLabel.setTint(0x99b0be);
                });


            if (this.scale.orientation !== Phaser.Scale.Orientation.LANDSCAPE) {
                this.printWarning(width, height);
            }
        });


    }

    destroy() {
        this.optionsLabel.destroy();
        this.continueLabel.destroy();
        this.rotate?.destroy();
    }

    private printWarning(width, height) {
        this.rotate = this.add.bitmapText(width * 0.5, height / 2 + 192, 'press_start', '!rotate your device!', 18)
            .setTint(0xff7300)
            .setOrigin(0.5);
    }

    private continueGame() {
        this.scene.stop();
        this.scene.start('start');
    }

}