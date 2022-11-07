import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
export default class Story extends Phaser.Scene {
    
    private chapter: number = 1;
    private image!: Phaser.GameObjects.Image;
    
    constructor() {
        super('story')
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
                    this.startGame();
                }
                
            
            });
        });


    }

    startGame() {
        this.game.sound.stopAll();
        this.scene.stop();
        this.scene.start('start');
    }
}