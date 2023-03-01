import Phaser from 'phaser'
export default class BaseScene extends Phaser.Scene {
    
    private frameTime = 0;
    private renderNow = false;
    private readonly MATTER_TIME_STEP = 1000 / 60;
    private readonly TARGET_RATE = 1000 / 30;
    private accumulator = 0;

  
    constructor(name: string |  Phaser.Types.Scenes.SettingsConfig)  {
        super(name);
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

}