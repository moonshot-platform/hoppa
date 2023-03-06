import Phaser from 'phaser';
import * as SceneFactory from '../scripts/SceneFactory';

export default class BaseScene extends Phaser.Scene {
    
    private frameTime = 0;
    private renderNow = false;
    private readonly MATTER_TIME_STEP = 1000 / 60;
    private readonly TARGET_RATE = 1000 / 30;
    private accumulator = 0;

  
    constructor(name: string |  Phaser.Types.Scenes.SettingsConfig)  {
        super(name);
    }

    init() {
        this.game.events.on( Phaser.Core.Events.BLUR, this.muteSound, this );
        this.game.events.on( Phaser.Core.Events.FOCUS, this.unmuteSound, this );

        document.addEventListener('visibilitychange', this.looseFocus );
    }

    create() {
        this.input.setDefaultCursor('none');

        this.matter.world.autoUpdate = false;
    }

    update(time: number, delta: number) {
        this.frameTime += delta;
        this.accumulator += delta;
        this.renderNow = false;

        while( this.accumulator >= this.MATTER_TIME_STEP ) {
            this.accumulator -= this.MATTER_TIME_STEP;
            if(this.matter.world.enabled)
              this.matter.world.step(this.MATTER_TIME_STEP);
        }

        if( this.frameTime >= this.TARGET_RATE ) {
            this.frameTime -= this.TARGET_RATE;
            this.renderNow = true;
        }

    }
   
    doStep(): boolean {
        return this.renderNow;
    }

    private muteSound() {
        SceneFactory.stopSound(this);
    }

    private unmuteSound() {
        if (!globalThis.musicTune && globalThis.musicTitle !== undefined) {
            SceneFactory.playMusic(this, globalThis.musicTitle);
        }
    }

    private looseFocus() {
        if (!document.hidden)
          return;
        SceneFactory.stopSound(this);
    }

    destroy() {
        this.game.events.off(Phaser.Core.Events.BLUR, this.muteSound, this);
        this.game.events.off(Phaser.Core.Events.FOCUS, this.unmuteSound, this );

        document?.removeEventListener( 'visibilitychange' , this.looseFocus );

        SceneFactory.stopSound(this);
        SceneFactory.removeAllSounds(this);

    }


    

    

}