import StateMachine from "./StateMachine";
import { sharedInstance as events } from './EventManager';

export default class PlantController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;

    private moveTime = 0;
    private name: string;

    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        name: string
    ) {
        this.scene = scene;
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
        this.stateMachine.setState('move-left');
    }

    private handleStomped(plant: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== plant) {
            return;
        }

        events.off(this.name + '-stomped', this.handleStomped, this);

        this.sprite.play('dead');
        this.sprite.on('animationcomplete', () => {
            this.cleanup();
        });

        this.stateMachine.setState('dead');
    }

    private cleanup() {
        this.sprite.destroy();
    }

    private createAnims() {
        this.sprite.anims.create({
            key: 'idle',
            frameRate: 0.5,
            repeat: -1,
            frames: this.sprite.anims.generateFrameNames('plant', {
                start: 1,
                end: 2,
                prefix: '0_Idle',
                suffix: '.png'
            })
        });
        this.sprite.anims.create({
            key: 'dead',
            frameRate: 15,
            repeat: 0,
            frames: this.sprite.anims.generateFrameNames('plant', {
                start: 1,
                end: 3,
                prefix: '1_Dead',
                suffix: '.png'
            })
        });
    }

}