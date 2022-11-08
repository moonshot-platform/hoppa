import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
import CreditScene from "./CreditScene";
export default class Story extends CreditScene {
    
    private chapter: number = 1;
    private image!: Phaser.GameObjects.Image;
    private scroller!: Phaser.GameObjects.DynamicBitmapText;
    private scrollText: string[] = [];
    private spacing: string[] = [
      "",
      "",
      "",
      "",      
      "",
      "",
     

    ];

    constructor() {
        super('story');
    }

    preload() {
        this.load.image('story1', 'assets/story1.webp');
        this.load.image('story2', 'assets/story2.webp');
        this.load.image('story3', 'assets/story3.webp');
        this.load.image('story4', 'assets/story4.webp');
        this.load.image('story5', 'assets/story5.webp');

        SceneFactory.preload(this);
    }

    create() {
        const { width, height } = this.scale;

        SceneFactory.playMusic( this, 'spectacle');

        this.image = this.add.image(width / 2, height / 2, 'story1').setOrigin(0.5, 0.5).setVisible(true);

        this.chapter = 1;
        
        this.nextStory();

        this.scrollText = this.spacing.concat( this.content );

        this.scroller = this.add.dynamicBitmapText(width/2, 0, 'press_start',this.scrollText, 22);
        this.scroller.setCenterAlign();
        this.scroller.setOrigin(0.5,0.5);
        this.scroller.setTint(0xffffff);
        this.scroller.setVisible(false);
        this.scroller.scrollY = -1900;

        this.input.on('pointerdown', () => { this.startGame(); });
        this.input.on('keydown', () => { this.startGame(); });
    }

    nextStory() {
        const { width, height } = this.scale;

        this.time.delayedCall(5000, () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);

            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (c, e) => {
                this.image.destroy();
           
                this.chapter ++;

                if(this.chapter < 6) {
                    this.image = this.add.image(width / 2, height / 2, 'story' + this.chapter).setOrigin(0.5, 0.5);
                    this.cameras.main.fadeIn( 1000, 0,0,0);
                    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, (c, e) => {
                       this.nextStory();
                    }); 
                }
                else {
                    this.cameras.main.fadeIn( 100,0,0,0 );
                    this.scroller.setVisible(true);
                }
            });
        });

    }

    update(time,delta) {
        if(this.scroller.visible) {
            this.scroller.scrollY += 0.05 * delta;
            console.log(this.scroller.scrollY);
            if (this.scroller.scrollY > 2100) { 
                this.startGame();
            }
        }
    }


    startGame() {

        let sound: Phaser.Sound.BaseSound = this.sound.get('spectacle');
        this.tweens.add({
            targets:  sound,
            volume:   0,
            duration: 500,
            onComplete: () => {
                this.game.sound.stopAll();
                this.scene.stop();
                this.scene.start('start');
            }
        });

        
    }
}