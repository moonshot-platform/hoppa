import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
import * as WalletHelper from '../scripts/WalletHelper';
import CreditScene from "./CreditScene";
import { PlayerStats } from "./PlayerStats";
export default class Win extends CreditScene {

    private scroller!: Phaser.GameObjects.DynamicBitmapText;
    private shoutout!: Phaser.GameObjects.BitmapText;
    private index = 0;
    private hsv;
    private fireworks!: Phaser.GameObjects.Particles.ParticleEmitter;
    private particles!: Phaser.GameObjects.Particles.ParticleEmitter;
    private info: PlayerStats;

    private music!: Phaser.Sound.BaseSound;

    constructor() {
        super('win');
    }

    init() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });
    }
   
    preload() {
        SceneFactory.preload(this);

        this.load.spritesheet('player1-win', 'assets/player1-win.webp', { frameWidth: 256, frameHeight: 167, startFrame: 0, endFrame: 5 });
        this.load.spritesheet('player2-win', 'assets/player2-win.webp', { frameWidth: 256, frameHeight: 167, startFrame: 0, endFrame: 5 });
        this.load.atlas('flares', 'assets/flares.webp', 'assets/flares.json');
        this.load.atlas('cocoon', 'assets/cocoons.webp', 'assets/cocoons.json');
    }

    create() {
        const { width, height } = this.scale;

        this.music = SceneFactory.playRepeatMusic(this, 'boss');
        this.hsv = Phaser.Display.Color.HSVColorWheel();
        this.add.image(width / 2, 0, 'logo').setDisplaySize(144, 62).setOrigin(0.5, 0);

        this.time.delayedCall(3000, () => {
            const emitterConfig = {
                alpha: { start: 1, end: 0, ease: 'Cubic.easeIn' },
                angle: { start: 0, end: 360, steps: 100 },
                blendMode: 'ADD',
                frame: { frames: ['red', 'yellow', 'green', 'blue'], cycle: true, quantity: 512 },
                frequency: 1024,
                gravityY: 300,
                lifespan: 2000,
                quantity: 500,
                reserve: 500,
                scale: { min: 0.05, max: 0.15 },
                speed: { min: 100, max: 200 },
            };
            this.particles = this.add.particles(512,385,'flares', emitterConfig);

            this.time.addEvent({
                delay: 250,
                startAt: 250,
                repeat: -1,
                callback: () => {
                    this.particles.setPosition(width * Phaser.Math.FloatBetween(0.25, 0.75), height * Phaser.Math.FloatBetween(0, 0.5));
                },
            });
        });

        const textures = this.textures;
        this.anims.create({
            key: 'player1-wins',
            frameRate: 15,
            frames: this.anims.generateFrameNumbers('player1-win', { start: 0, end: 5, first: 0 }),
            repeat: -1
        });

        this.anims.create({
            key: 'player2-wins',
            frameRate: 15,
            frames: this.anims.generateFrameNumbers('player2-win', { start: 0, end: 5, first: 0 }),
            repeat: -1
        });

        this.add.sprite(width / 2 - 384, height / 2, 'player1-win').setOrigin(0.5, 0).play('player1-wins');
        this.add.sprite(width / 2 + 384, height / 2, 'player2-win').setOrigin(0.5, 0).play('player2-wins');

        const logo = this.add.image(width / 2, height / 2, 'cocoon', 'c1.webp').setDisplaySize(128, 203).setOrigin(0.5, 0.1);
        const origin = logo.getTopLeft();

        const logoSource = {
            getRandomPoint: function (vec) {
                let pixel;
                let x,y;
                do {
                    x = Phaser.Math.Between(0, 128 - 1);
                    y = Phaser.Math.Between(0, 203 - 1);
                    pixel = textures.getPixel(x, y, 'cocoon');
                } while (pixel.alpha < 255);

                return vec.setTo(x + origin.x, y + origin.y);
            }
        };

        this.fireworks = this.add.particles(0,0, 'flares', {
            lifespan: 1000,
            gravityY: 10,
            scale: { start: 0, end: 0.25, ease: 'Quad.easeOut' },
            alpha: { start: 1, end: 0, ease: 'Quad.easeIn' },
            blendMode: 'ADD',
            emitZone: { type: 'random', source: logoSource }
        });

        this.shoutout = this.add.bitmapText(width * 0.5, 96, 'press_start', 'YOU ARE A TRUE RA8BIT!', 48)
            .setTint(0xff7300)
            .setOrigin(0.5, 0.1);

        this.scroller = this.add.dynamicBitmapText(640, 360, 'press_start', this.content, 22).setOrigin(0.5,0.5);
        this.scroller.setCenterAlign();
        
        this.scroller.scrollY = -2000;
       
        this.input.on('pointerdown', () => { this.continueGame(); });
        this.input.on('keydown', () => { this.continueGame(); });
    }

    update(time, delta) {
        this.scroller.scrollY += 0.05 * delta;
        if (this.scroller.scrollY > 3848) {
            this.scroller.scrollY = -2000;
        }

        const top = this.hsv[this.index].color;
        const bottom = this.hsv[359 - this.index].color;
        const top2 = this.hsv[(this.index + 45) % 360].color;
        const bottom2 = this.hsv[(359 - this.index + 45) % 360].color;

        this.shoutout.setTint(top, bottom, top, bottom);

        this.scroller.setTint(top, bottom, top2, bottom2);

        this.index++;
        if (this.index >= 360)
            this.index = 0;
    }

    continueGame() {
        this.hasNewHighscore();
    }

    destroy() {
        this.particles.destroy();
        this.music.destroy();
        this.shoutout.destroy();
        this.scroller.destroy();
    
        SceneFactory.stopSound(this);
        SceneFactory.removeAllSounds(this);
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