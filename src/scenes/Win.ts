import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
export default class Win extends Phaser.Scene {

    private content: string[] = [];
    private scroller!: Phaser.GameObjects.DynamicBitmapText;
    private shoutout!: Phaser.GameObjects.BitmapText;
    private index: number = 0;
    private hsv;
    private fireworks!: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

    private music!: Phaser.Sound.BaseSound;

    constructor() {
        super('win');

        this.content = [
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "MOONSHOT presents",
            "",
            "a RA8BITS production",
            "",
            "HOPPA!",
            "",
            "Lead Cast",
            "Male Ra8bit",
            "",
            "Supporting Cast",
            "Female Ra8bit",
            "",
            "Casting Director",
            "DandyBanger",
            "",
            "Music Composer",
            "Loony chitptoon",
            "Public Domain",
            "jsfxr",
            "",
            "Costume Designer",
            "Miley Cyrus",
            "",
            "Associate Producers",
            "Juan Concreto",
            "",
            "Editors",
            "The Lost Ra8bits",
            "",
            "Production Designer",
            "Ninkwondo",
            "",
            "Director of Photography",
            "DandyBanger",
            "",
            "Executive Producer",
            "Crypt0 King",
            "",
            "Writers",
            "c0ntrol zero",
            "Pixel8bit",
            "DandyBanger",
            "",
            "Director",
            "CZ",
            "",
            "Game Designer",
            "c0ntrol zero",
            "Pixel8bit",
            "DandyBanger",
            "",
            "Sound engineer",
            "Retro OpenGame Art",
            "FreeSound",
            "",
            "Musical Composition",
            "Nicole Marie T",
            "BGM The Slimeking's Tower",
            "DeltaBreaker",
            "Bottomless Pit Man",
            "@wyver9",
            "Snabisch http://audiojungle.net/user/Snabisch",
            "Mega Pixel Music Lab",
            "Christovix",
            "Kim Lightyear",
            "3xBlast",
            "",
            "",
            "Special thanks to",
            "Vitalik",
            "Shef",
            "Crypt0 King",
            "Luis",
            "Winnie",
            "Joshua",
            "Micheal",
            "Borris",
            "Shubham",
            "Rony",
            "Rohan",
            "Jill",
            "Akhi1",
            "Genesis",
            "Elon",
            "Crypto Dasha",
            "Crypto Baby",
            "Juli Cold",
            "Niki",
            "Joy",
            "Ms Krasota",
            "CryptoSeas",
            "Pure Evil",
            "Smack",
            "Rick",
            "Crypto Hunter",
            "David",
            "Pratik",
            "Joonas",
            "Furkan",
            "Light",
            "Jackson",
            "Joe",
            "K",
            "",
            "$MSHOT",
            "",

        ];
    }

    private particles!: Phaser.GameObjects.Particles.ParticleEmitterManager;

    preload() {
        SceneFactory.preload(this);

        this.load.spritesheet('player1-win', 'assets/player1-win.png', { frameWidth: 256, frameHeight: 167, startFrame: 0, endFrame: 5 });
        this.load.spritesheet('player2-win', 'assets/player2-win.png', { frameWidth: 256, frameHeight: 167, startFrame: 0, endFrame: 5 });
        this.load.atlas('flares', 'assets/flares.png', 'assets/flares.json');
    }

    create() {
        const { width, height } = this.scale;

        this.music = SceneFactory.playRepeatMusic(this, 'boss');
        this.hsv = Phaser.Display.Color.HSVColorWheel();
        this.fireworks = this.add.particles('flares');
        this.add.image(width / 2, 0, 'logo').setDisplaySize(144, 62).setOrigin(0.5, 0);

        this.time.delayedCall(3000, () => {
            const emitterConfig = {
                alpha: { start: 1, end: 0, ease: 'Cubic.easeIn' },
                angle: { start: 0, end: 360, steps: 100 },
                blendMode: 'ADD',
                frame: { frames: ['red', 'yellow', 'green', 'blue'], cycle: true, quantity: 512 },
                frequency: 1024,
                gravityY: 300,
                lifespan: 1000,
                quantity: 500,
                reserve: 500,
                scale: { min: 0.05, max: 0.15 },
                speed: { min: 200, max: 512 },
                x: 512, y: 384,
            };
            this.emitter = this.fireworks.createEmitter(emitterConfig);

            this.time.addEvent({
                delay: 250,
                startAt: 250,
                repeat: -1,
                callback: () => {
                    this.emitter.setPosition(width * Phaser.Math.FloatBetween(0.25, 0.75), height * Phaser.Math.FloatBetween(0, 0.5));
                },
            });
        });

        var textures = this.textures;
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

        var logo = this.add.image(width / 2, height / 2, 'cocoon', 'Cocoon1').setDisplaySize(128, 203).setOrigin(0.5, 0.1);
        let origin = logo.getTopLeft();

        var logoSource = {
            getRandomPoint: function (vec) {
                do {
                    var x = Phaser.Math.Between(0, 128 - 1);
                    var y = Phaser.Math.Between(0, 203 - 1);
                    var pixel = textures.getPixel(x, y, 'cocoon');
                } while (pixel.alpha < 255);

                return vec.setTo(x + origin.x, y + origin.y);
            }
        };

        this.particles = this.add.particles('flares');

        this.particles.createEmitter({
            x: 0,
            y: 0,
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

        this.scroller = this.add.dynamicBitmapText(384, 150, 'press_start', this.content, 22);
        this.scroller.setSize(512, 512);
        this.scroller.setCenterAlign();
       
        this.input.on('pointerdown', () => { this.continueGame(); });
        this.input.on('keydown', () => { this.continueGame(); });
    }

    update(time, delta) {
        this.scroller.scrollY += 0.05 * delta;
        if (this.scroller.scrollY > 3848) {
            this.scroller.scrollY = 0;
        }

        let top = this.hsv[this.index].color;
        let bottom = this.hsv[359 - this.index].color;
        let top2 = this.hsv[(this.index + 45) % 360].color;
        let bottom2 = this.hsv[(359 - this.index + 45) % 360].color;

        this.shoutout.setTint(top, bottom, top, bottom);

        this.scroller.setTint(top, bottom, top2, bottom2);

        this.index++;
        if (this.index >= 360)
            this.index = 0;
    }

    continueGame() {
        this.music.stop();
        this.scene.stop();
        this.scene.start('start');
    }

    destroy() {
        this.particles.destroy();
        this.music.destroy();
    }

}