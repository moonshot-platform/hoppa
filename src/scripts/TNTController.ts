import StateMachine from "./StateMachine";
import { sharedInstance as events } from './EventManager';

export default class TNTController {
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;

    private name: string;

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
                onEnter: this.deadOnEnter
            })
            .setState('idle');

        events.on(this.name + '-stomped', this.handleStomped, this);
    }

    destroy() {
        events.off(this.name + '-stomped', this.handleStomped, this);
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

    private deadOnEnter() {

        this.sprite.play('dead');
        this.sprite.on('animationcomplete', () => {
            this.cleanup();
        });
        this.stateMachine.setState('dead');
    }

    private cleanup() {
        this.sprite.destroy();
    }

    private handleStomped(tnt: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== tnt) {
            return;
        }
        
        events.off(this.name + '-stomped', this.handleStomped, this);

        this.sprite.play('pressed');
        this.sprite.on('animationcomplete', () => {
            this.stateMachine.setState('dead');
        });

    }

    private createAnims() {
        this.sprite.anims.create({
            key: 'idle',
            frameRate: 1,
            repeat: -1,
            frames: this.sprite.anims.generateFrameNames('tnt', {
                start: 0,
                end: 0,
                prefix: '0_Idle',
                suffix: '.webp'
            })
        });
        this.sprite.anims.create({
            key: 'active',
            frameRate: 10,
            repeat: 0,
            frames: this.sprite.anims.generateFrameNames('tnt', {
                start: 0,
                end: 0,
                prefix: '1_Pressed',
                suffix: '.webp'
            })
        });
        this.sprite.anims.create({
            key: 'dead',
            frameRate: 10,
            repeat: 0,
            frames: this.sprite.anims.generateFrameNames('tnt', {
                start: 0,
                end: 1,
                prefix: '2_Dead',
                suffix: '.webp'
            })
        });
    }

}