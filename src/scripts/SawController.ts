import StateMachine from "./StateMachine";
import { sharedInstance as events } from './EventManager';
import * as CreatureLogic from './CreatureLogic';

export default class SawController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;

    private moveTime = 0;
    private velocityX = 4;
    private name: string;
    private myMoveTime = 6000;

    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        name: string
    ) {
        this.scene = scene;
        this.sprite = sprite;
        this.name = name;
        this.createAnim();
        this.stateMachine = new StateMachine(this);

        this.stateMachine.addState('idle', {
            onEnter: this.idleOnEnter
        })
            .addState('move-down', {
                onEnter: this.moveDownOnEnter,
                onUpdate: this.moveDownOnUpdate
            })
            .addState('move-up', {
                onEnter: this.moveUpOnEnter,
                onUpdate: this.moveUpOnUPdate
            })
            .setState('idle');

        this.velocityX += Phaser.Math.Between(-2.95, + 2.95);

        events.on(this.name + '-blocked', this.handleBlocked, this);
    }

    destroy() {
        events.off(this.name + '-blocked', this.handleBlocked, this);

        this.sprite.destroy();
    }

    update(deltaTime: number) {
        this.stateMachine.update(deltaTime);
    }

    public getSprite() {
        return this.sprite;
    }

    public lookahead(map: Phaser.Tilemaps.Tilemap): boolean {
        if (this.sprite.active == false)
            return false;

        if (!CreatureLogic.hasTileAhead(map, this.scene.cameras.main, this.sprite, true, 0) && this.sprite.body?.velocity.y == 0) {
            if (this.sprite.flipX)
                this.stateMachine.setState("move-up");
            else
                this.stateMachine.setState("move-down");
            return true;
        }

        return false;
    }

    private moveDownOnEnter() {
        this.moveTime = 0;
    }

    private moveDownOnUpdate(deltaTime: number) {
        this.moveTime += deltaTime;
        this.sprite.flipX = true;
        this.sprite.setVelocityX(-1 * this.velocityX);

        if (this.moveTime > this.myMoveTime) {
            this.stateMachine.setState('move-up');
        }
    }

    private moveUpOnEnter() {
        this.moveTime = 0;
    }

    private moveUpOnUPdate(deltaTime: number) {
        this.moveTime += deltaTime;
        this.sprite.flipX = false;
        this.sprite.setVelocityX(this.velocityX);

        if (this.moveTime > this.myMoveTime) {
            this.stateMachine.setState('move-down');
        }
    }

    private idleOnEnter() {

        this.sprite.play('idle');
        this.stateMachine.setState('move-down');
    }

    private handleStomped(saw: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== saw) {
            return;
        }

    }

    private handleBlocked(saw: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== saw) {
            return;
        }

        this.moveTime = 0;

        if (this.sprite.flipX) {
            this.stateMachine.setState('move-up');
        }
        else {
            this.stateMachine.setState('move-down');
        }
    }


    private createAnim() {
        this.sprite.anims.create({
            key: 'idle',
            frameRate: 25,
            repeat: -1,
            frames: this.sprite.anims.generateFrameNames('saw', {
                start: 2,
                end: 0,
                prefix: '0_Idle',
                suffix: '.webp'
            })
        });
    }
}