export default class AnimatedParticle extends Phaser.GameObjects.Particles.Particle {

    private time = 0;
    private index = 0;
    private anim!: Phaser.Animations.Animation;
    
    constructor(emitter: any) {
        super(emitter);
    }

    update(delta, step, processors): boolean {
        const result = super.update(delta,step,processors);
        this.time += delta;

        if(this.time >= this.anim.msPerFrame) {
            this.index ++;

            if(this.index > 4) {
                this.index = 0;
            }

            this.frame = this.anim.frames[ this.index ].frame;

            this.time -= this.anim.msPerFrame;
        }

        return result;
    }

}