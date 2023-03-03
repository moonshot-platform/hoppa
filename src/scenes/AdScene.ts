import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory'; 

export default class AdScene extends Phaser.Scene {

    private v?: Phaser.GameObjects.Video;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

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

        this.cursors = this.input.keyboard?.createCursorKeys();

    }

    preload() {
        this.loadVideo();
    }

    create() {
        const { width, height } = this.scale;
        
        this.v = this.add.video(width/2,height/2,'ad');

        this.v?.play(true);
        this.v?.setPaused(false);
       
    }

    update() {
        if(SceneFactory.gamePadAnyButton(this) || this.cursors?.space.isDown) {
            this.scene.stop();
            this.scene.start('hoppa');
        }

        if( this.v?.isPaused() ) {
            this.v?.setPaused(false);
        }

        let t = this.v?.getProgress() || 0; 

        if( t > 0.99 ) {
            this.scene.stop();
            this.scene.start('hoppa');     
        }
    }

    destroy() {
      this.v?.stop();
      this.v?.destroy();
    }
}