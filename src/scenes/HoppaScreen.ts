import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
import * as WalletHelper from '../scripts/WalletHelper'

declare global {
    var dramaticIntro: boolean;
}

export default class HoppaScreen extends Phaser.Scene {

    private rotate!: Phaser.GameObjects.BitmapText;

    private continueLabel!: Phaser.GameObjects.BitmapText;
    private optionsLabel!: Phaser.GameObjects.BitmapText;
    private helpLabel!: Phaser.GameObjects.BitmapText;
    private text!:Phaser.GameObjects.BitmapText;

    constructor() {
        super('hoppa');
    }

    preload() {
        SceneFactory.preload(this);
    }

    create() {
        const { width, height } = this.scale;

        this.add.image(width / 2, height / 2 - 128, 'logo').setDisplaySize(460, 196).setOrigin(0.5, 0.5);

        this.text = this.add.bitmapText(width * 0.5, height / 2, 'press_start', 'A Ra8bits Production', 48)
            .setTint(0xc0c0c0)
            .setOrigin(0.5);

        let delay = 3000;
        if( globalThis.dramaticIntro ) {
            delay = 500;
        }

        this.time.delayedCall(delay, () => {
            this.continueLabel = this.add.bitmapText(width * 0.5, height / 2 + 108, 'press_start', 'Connect', 48)
                .setTint(0xffffff)
                .setOrigin(0.5);

            this.optionsLabel = this.add.bitmapText(width * 0.5, height / 2 + 176, 'press_start', 'Options', 48)
                .setTint(0xffffff)
                .setOrigin(0.5);

            this.helpLabel = this.add.bitmapText(width * 0.5, height / 2 + 234, 'press_start', 'Help', 48)
                .setTint(0xffffff)
                .setOrigin(0.5);

            this.continueLabel.setInteractive({ cursor: 'pointer' })
                .on('pointerup', () => {
                    this.hideInstaller();
                    this.continueLabel.setTint(0x222b5c);
                    this.continueGame();
                })
                .on('pointerdown', () => {
                    this.continueLabel.setTint(0x99b0be);
                });

            this.optionsLabel.setInteractive({ cursor: 'pointer' })
                .on('pointerup', () => {
                    this.optionsLabel.setTint(0x222b5c);
                    this.hideInstaller();
                    this.scene.stop();
                    this.scene.start('options');
                })
                .on('pointerdown', () => {
                    this.optionsLabel.setTint(0x99b0be);
                });

            this.helpLabel.setInteractive({ cursor: 'pointer' })
                .on('pointerup', () => {
                    this.helpLabel.setTint(0x222b5c);
                    this.hideInstaller();
                    this.scene.stop();
                    this.scene.start('help');
                })
                .on('pointerdown', () => {
                    this.helpLabel.setTint(0x99b0be);
                });

            if (this.scale.orientation !== Phaser.Scale.Orientation.LANDSCAPE) {
                this.printWarning(width, height);
            }

            globalThis.dramaticIntro = true;
        });

    }

    destroy() {
        this.optionsLabel.destroy();
        this.continueLabel.destroy();
        this.rotate?.destroy();
        this.text.destroy();
        this.helpLabel.destroy(); 
    }

    private printWarning(width, height) {
        this.rotate = this.add.bitmapText(width * 0.5, height / 2 + 240, 'press_start', '!rotate your device!', 18)
            .setTint(0xff7300)
            .setOrigin(0.5);
    }

    private continueGame() {
        WalletHelper.init();
        WalletHelper.getCurrentAccount();
        this.scene.stop();
        this.scene.start('story');
    }

    private hideInstaller() {
        const button = document.querySelector('.add-button') as HTMLElement;
        if(button != null ) {
            button.style.display='none';
        }
    }

}