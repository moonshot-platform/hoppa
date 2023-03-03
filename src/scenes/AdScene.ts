import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory'; 

export default class AdScene extends Phaser.Scene {

    private v?: Phaser.GameObjects.Video;
    
    constructor() {
        super('ad')
    }

    private loadVideo() {
        const N = 24;

        let c = Phaser.Math.Between(0,N);

        this.load.video( 'ad', 'assets/ad-'+c + '.mp4', 'loadeddata', false, false);

        console.log("play " + c );
    }

    init() {
        
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            
            if( this.cache.video.has( 'ad' ) ) {
                this.cache.video.remove( 'ad' );
            }
            
            
            this.destroy();


        });

    }

    preload() {
        this.loadVideo();
    }

    create() {
        const { width, height } = this.scale;
        
        this.input.setDefaultCursor('none');


        this.v = this.add.video(width/2,height/2,'ad');

        this.v?.play(true);
        this.v?.setPaused(false);
       
        this.input.on('pointerdown', this.startGame, this);
        this.input.on('keydown',this.startGame, this);
    }

    update() {

        if(SceneFactory.gamePadAnyButton(this)) {
            this.startGame();
        }

        if( this.v?.isPaused() ) {
            this.v?.setPaused(false);
        }

        let t = this.v?.getProgress() || 0; 

        if( t > 0.99 ) {
            this.startGame();
        }
 
    }

    private startGame() {
        this.scene.stop();
        this.scene.start('hoppa');
    }

    destroy() {
      this.v?.stop();
      this.v?.destroy();

      this.input.off('pointerdown', this.startGame, this);
      this.input.off('keydown', this.startGame, this);
    }
}