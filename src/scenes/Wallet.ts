import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
import * as WalletHelper from '../scripts/WalletHelper';
export default class Wallet extends Phaser.Scene {
    
    private image!: Phaser.GameObjects.Image;
    private line1!: Phaser.GameObjects.BitmapText;
    private line2!: Phaser.GameObjects.BitmapText;
    private line3!: Phaser.GameObjects.BitmapText;
    private line4!: Phaser.GameObjects.BitmapText;
    private line5!: Phaser.GameObjects.BitmapText;
    private status!: Phaser.GameObjects.BitmapText;
    private delayedRun!: Phaser.Time.TimerEvent;
    private txLock = false;
    private changeEvents = 0;

    constructor() {
        super('wallet');
     }

    preload() {
        this.load.image('bg', 'assets/storyx.webp');

        SceneFactory.preload(this);
    } 

    create() {
        const { width, height } = this.scale;

        this.changeEvents = globalThis.changeEvent;

        this.input.setDefaultCursor('url(assets/hand.cur), pointer');

        if(globalThis.noWallet) {
            this.line1 =this.add.bitmapText(width * 0.5, height / 2 + 150, 'press_start', 'It seems you dont have a crypto wallet (yet)', 22)
                .setTint(0xffffff)
                .setOrigin(0.5);
        }
        else if(WalletHelper.isNotEligible() ) {
            this.line1= this.add.bitmapText(width * 0.5, height / 2 + 150, 'press_start', 'You are allowed access Level 1', 22)
                .setTint(0xffffff)
                .setOrigin(0.5);
        }

        this.line2 = this.add.bitmapText(width * 0.5, height / 2 + 190, 'press_start', 'Unlimited play only for Moonshot and Ra8bits holders', 22)
            .setTint(0xffffff)
            .setOrigin(0.5); 

        this.line3 =this.add.bitmapText(width * 0.5, height / 2 + 240, 'press_start', 'And MoonBoxes.io NFT holders', 22)
            .setTint(0xffffff)
            .setOrigin(0.5); 

        this.status = this.add.bitmapText(width * 0.5, 64, 'press_start', "" , 18)
            .setTint(0xff7300)
            .setOrigin(0.5); 

        if( globalThis.chainId != 56 && !globalThis.noWallet) {
            this.status.setText("Your wallet is not connected to the Binance Smart Chain!");
        }

        this.line4 = this.add.bitmapText(width * 0.5 - 256, height / 2 + 320, 'press_start', 'Give me free $RA8BIT!', 16)
            .setTint(0xffffff)
            .setDropShadow(2,2,0xff0000)
            .setOrigin(0.5);

        let statusText = "Please confirm the TX and standby";
        if( globalThis.chainId != 56 ) {
            statusText = "You are not connected to the Binance Smart Chain";
        }
        else if( globalThis.noWallet ) {
            statusText = "Please install MetaMask or TrustWallet first";
        }

        this.line4.setInteractive({ cursor: 'pointer' })
            .on('pointerup', () => {
                this.line5.setTint(0x222b5c);
                this.status.setText(statusText);

                if( globalThis.chainId == 56 && !globalThis.noWallet) {
                    this.txLock = true;

                    const faucet = async() => {
                        const msg = await  WalletHelper.getSomeRa8bitTokens();
                        this.status.setText(msg);
                        this.txLock = false;
                        this.delayedStart();
                    };

                    faucet();
                }
               
            })
            .on('pointerdown', () => {
                this.line4.setTint(0x99b0be);
                
            });    

        this.line5 = this.add.bitmapText(width * 0.5 + 256, height / 2 + 320, 'press_start', 'Give me free $MSHOT!', 16)
            .setTint(0xffffff)
            .setDropShadow(2,2,0xff0000)
            .setOrigin(0.5);

        this.line5.setInteractive({ cursor: 'pointer' })
            .on('pointerup', () => {
                this.delayedRun?.remove(false);
                this.line5.setTint(0x222b5c);
 
                this.status.setText(statusText);

                if(globalThis.chainId == 56 && !globalThis.noWallet ) {
                    this.txLock = true;

                    const faucet = async() => {
                        const msg = await WalletHelper.getSomeMoonshotTokens();
                        this.status.setText(msg);
                        this.txLock = false;
                        this.delayedStart();
                    };

                    faucet();
                }
            })
            .on('pointerdown', () => {
                this.line5.setTint(0x99b0be);   
            }); 


        this.image = this.add.image(width / 2, height / 2, 'bg').setOrigin(0.5, 0.5).setVisible(true);

        this.input.on('keydown', () => { if(!this.txLock) this.startGame(); });
        this.input.keyboard?.once('keydown-ESC', () => {
            this.scene.stop();
            this.scene.start('hoppa');
        });

        this.delayedRun = this.time.delayedCall( 10000, () => {
            if(!this.txLock) {
                this.startGame();
            }
        });
    }

    private delayedStart() {
        this.time.delayedCall( 3000, () => {
            this.startGame();
        })
    }

    destroy() {
        this.line1.destroy();
        this.line2.destroy();
        this.line3.destroy();
        this.line4.destroy();
        this.line5.destroy();
        this.status.destroy();
    }

    update() {
        

        if( globalThis.changeEvent != this.changeEvents ) {
            this.scene.restart();
            this.changeEvents = globalThis.changeEvent;
        }
        else if(SceneFactory.gamePadAnyButton(this)) {
            this.startGame();
        }
    }

    startGame() {
        this.cameras.main.fadeOut();
        this.image.destroy();
        this.scene.stop();
        this.scene.start('player-select');
    }
}