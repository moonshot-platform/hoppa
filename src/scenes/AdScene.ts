import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory'; 
import News from "../scripts/News";

export default class AdScene extends Phaser.Scene {

    private v?: Phaser.GameObjects.Video;
    private news?: News;
    private adEnding = false;
   
    constructor() {
        super('ad')
    }

    init() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.removeAd();
            this.destroy();
        });

    }

    preload() {
        this.loadVideo();
    }

    create() {
        this.input.setDefaultCursor('none');

        SceneFactory.stopSound(this);

        this.loadAd();

        this.playAd();
      
        this.time.delayedCall( 5000, () => { this.news = new News(this) } );
        
        this.input.on('pointerdown', this.startGame, this);
        this.input.on('keydown',this.startGame, this);
    }

    update(time,delta) {

        if(SceneFactory.gamePadIsButton(this,-1)) {
            this.startGame();
        }

        if( this.v?.isPaused() ) {
            this.v?.setPaused(false);
        }

        let t = this.v?.getProgress() || 0; 

        if( t >= 0.9806) { // magic number 
            this.startGame();
        }
    }

    destroy() {
      this.v?.stop();
      this.v?.destroy();

      this.news?.destroy();

      this.input.off('pointerdown', this.startGame, this);
      this.input.off('keydown', this.startGame, this);

      this.adEnding = false;
    }
    
    private chooseAd(): string {
        const N = 25;
        let c = Phaser.Math.Between(0,N);
        return 'assets/ad-'+c + '.mp4';
    }

    private loadVideo() {
        this.load.video( 'ad', this.chooseAd(), 'loadeddata', false, false);
    }

    private removeAd() {
        if( this.cache.video.has( 'ad' ) ) {
            this.cache.video.remove( 'ad' );
        }
    }

    private loadAd() {
        const { width, height } = this.scale;        
        this.v = this.add.video(width/2,height/2,'ad');
    }

    private playAd() {
        this.v?.play(true);
        this.v?.setPaused(false);
    }
    
    private startGame() {
        if(!this.adEnding) {
            this.adEnding = true;
            this.cameras.main.fadeOut(100, 0, 0, 0);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.stop();
                this.scene.start(globalThis.adReturn);
            });
            this.v?.setPaused();
        }
    }
}