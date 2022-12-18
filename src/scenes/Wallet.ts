import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
import * as WalletHelper from '../scripts/WalletHelper';
export default class Wallet extends Phaser.Scene {
    
    private image!: Phaser.GameObjects.Image;
    private line1!: Phaser.GameObjects.BitmapText;
    private line2!: Phaser.GameObjects.BitmapText;
    private line3!: Phaser.GameObjects.BitmapText;
    
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
            this.line1 =this.add.bitmapText(width * 0.5, height / 2 + 160, 'press_start', 'It seems you dont have a wallet (yet)', 22)
                .setTint(0xffffff)
                .setOrigin(0.5);
        }
        else if(WalletHelper.isNotEligible() ) {
            this.line1= this.add.bitmapText(width * 0.5, height / 2 + 160, 'press_start', 'You are allowed access Level 1', 22)
                .setTint(0xffffff)
                .setOrigin(0.5);
        }

        this.line2 = this.add.bitmapText(width * 0.5, height / 2 + 210, 'press_start', 'Unlimited play only for Moonshot and Ra8bits holders', 22)
            .setTint(0xffffff)
            .setOrigin(0.5); 

        this.line3 =this.add.bitmapText(width * 0.5, height / 2 + 260, 'press_start', 'And MoonBoxes.io NFT holders', 22)
            .setTint(0xffffff)
            .setOrigin(0.5); 
        

        this.image = this.add.image(width / 2, height / 2, 'bg').setOrigin(0.5, 0.5).setVisible(true);

        this.input.on('pointerdown', () => { this.startGame(); });
        this.input.on('keydown', () => { this.startGame(); });
    }

    destroy() {
        this.line1.destroy();
        this.line2.destroy();
        this.line3.destroy();
    }

    startGame() {
        this.image.destroy();
        SceneFactory.stopSound(this);
        this.scene.stop();
        this.scene.start('player-select');
    }
}