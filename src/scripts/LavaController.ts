
import StateMachine from "./StateMachine";

export default class LavaController {
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;

    private name;

    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        name: string
    ) {
        this.sprite = sprite;
        this.name = name;
        this.createAnims();

        this.stateMachine = new StateMachine(this);

        this.stateMachine.addState('idle', {
            onEnter: this.idleOnEnter
        })
        .addState('dead', {
              
        })
        .setState('idle');

    } 

    destroy() {
        this.sprite.destroy();
    }

    update(deltaTime: number) {
        this.stateMachine.update(deltaTime);
    }

    public getSprite() {
        return this.sprite;
    }

    private idleOnEnter() {
        this.sprite.play('idle');
    }

    private createAnims() {
        this.sprite.anims.create({
            key: 'idle',
            frameRate: 10,
            repeat: -1,
            yoyo: true,
            frames: this.sprite.anims.generateFrameNames(this.name, {
                start: 1,
                end: (this.name === 'lava-center' ? 30 : 32),
                prefix: 'lavatop-',
                suffix: '.webp'
            })
        });

        
    }

}