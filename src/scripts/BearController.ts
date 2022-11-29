import { Physics } from "phaser";
import StateMachine from "./StateMachine";
import { sharedInstance as events } from './EventManager';
import PlayerController from "./PlayerController";

export default class BearController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;
    private garbage: boolean = false;
    private name: string;
    private player: Phaser.Physics.Matter.Sprite = null;

    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        name: string,
        playerController: PlayerController,
    ) {
        this.scene = scene;
        this.sprite = sprite;
        this.name = name;
        this.createAnims();
        this.garbage = false;
        this.stateMachine = new StateMachine(this);
        this.player = playerController?.getSprite();
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

        if( this.player !== undefined && this.player.body.position.x > this.sprite.body.position.x ) {
            this.sprite.flipX = true;
        }
        else {
            this.sprite.flipX = false;
        }
    }

    public getSprite() {
        return this.sprite;
    }

    private idleOnEnter() {
        this.sprite.play('idle');
        this.stateMachine.setState('move-left');
    }

    private handleStomped(bear: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== bear && !this.garbage) {
            return;
        }
        this.garbage = true;

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

    public keepObject() {
        return !this.garbage;
    }

    private createAnims() {
        this.sprite.anims.create({
            key: 'idle',
            frameRate: 2,
            repeat: -1,
            frames: this.sprite.anims.generateFrameNames('bear', {
                start: 0,
                end: 1,
                prefix: '0_Idle',
                suffix: '.webp'
            })
        });
        this.sprite.anims.create({
            key: 'dead',
            frameRate: 10,
            repeat: 0,
            frames: this.sprite.anims.generateFrameNames('bear', {
                start: 0,
                end: 2,
                prefix: '1_Dead',
                suffix: '.webp'
            })
        });
    }

}