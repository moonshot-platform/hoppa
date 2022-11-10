import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
import * as WalletHelper from '../scripts/WalletHelper';
export default class Wallet extends Phaser.Scene {
    
    private image!: Phaser.GameObjects.Image;
    
    constructor() {
        super('wallet');
     }

    preload() {
        this.load.image('bg', 'assets/storyx.webp');

        SceneFactory.preload(this);
    }

    create() {
        const { width, height } = this.scale;

        if(globalThis.noWallet) {
            this.add.bitmapText(width * 0.5, height / 2 + 160, 'press_start', 'It seems you dont have a wallet (yet)', 22)
                .setTint(0xffffff)
                .setOrigin(0.5);
        }
        else if(WalletHelper.isNotEligible() ) {
            this.add.bitmapText(width * 0.5, height / 2 + 160, 'press_start', 'You are allowed access Level 1', 22)
                .setTint(0xffffff)
                .setOrigin(0.5);
        }

        this.add.bitmapText(width * 0.5, height / 2 + 210, 'press_start', 'Unlimited play only for Moonshot and Ra8bits holders', 22)
            .setTint(0xffffff)
            .setOrigin(0.5); 

        this.image = this.add.image(width / 2, height / 2, 'bg').setOrigin(0.5, 0.5).setVisible(true);

        this.input.on('pointerdown', () => { this.startGame(); });
        this.input.on('keydown', () => { this.startGame(); });
    }

    startGame() {
        this.image.destroy();
        this.game.sound.stopAll();
        this.scene.stop();
        this.scene.start('level1');
    }
}