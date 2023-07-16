import StateMachine from "./StateMachine";
import { sharedInstance as events } from './EventManager';
import * as CreatureLogic from './CreatureLogic';

export default class BombController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;

    private moveTime = 0;
    private name = "";
    private garbage = false;
    private myMoveTime = 0;

    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        name: string,
    ) {
        this.scene = scene;
        this.sprite = sprite;
        this.name = name;
        this.garbage = false;
        this.createAnims();

        this.stateMachine = new StateMachine(this);

        this.stateMachine.addState('idle', {
            onEnter: this.idleOnEnter
        })
            .addState('move-left', {
                onEnter: this.moveLeftOnEnter,
                onUpdate: this.moveLeftOnUpdate
            })
            .addState('move-right', {
                onEnter: this.moveRightOnEnter,
                onUpdate: this.moveRightOnUPdate
            })
            .addState('dead', {
                onEnter: this.deadOnEnter,
            })
            .setState('idle');

        this.myMoveTime = Phaser.Math.Between(1500, 2500);


        events.on(this.name + '-stomped', this.handleStomped, this);
        events.on(this.name + '-blocked', this.handleBlocked, this);
    }

    destroy() {
        events.off(this.name + '-stomped', this.handleStomped, this);
        events.off(this.name + '-blocked', this.handleBlocked, this);

        this.cleanup();
    }

    update(deltaTime: number) {
        this.stateMachine.update(deltaTime);
    }

    public getSprite() {
        return this.sprite;
    }

    private moveLeftOnEnter() {
        this.moveTime = 0;
    }

    private moveLeftOnUpdate(deltaTime: number) {
        this.moveTime += deltaTime;
        this.sprite.flipX = false;
        this.sprite.setVelocityX(-3);

        if (this.moveTime > this.myMoveTime) {
            this.stateMachine.setState('move-right');
        }
    }

    private moveRightOnEnter() {
        this.moveTime = 0;
    }

    private moveRightOnUPdate(deltaTime: number) {
        this.moveTime += deltaTime;
        this.sprite.flipX = true;
        this.sprite.setVelocityX(3);

        if (this.moveTime > this.myMoveTime) {
            this.stateMachine.setState('move-left');
        }
    }

    private deadOnEnter() {
        this.moveTime = 0;
        this.sprite.play('dead');
        this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.cleanup();
        });
    }

    public lookahead(map: Phaser.Tilemaps.Tilemap): boolean {
        if (this.sprite.active == false)
            return false;

        if (!CreatureLogic.hasTileAhead(map, this.scene.cameras.main, this.sprite, true, 0) && this.sprite.body?.velocity.y == 0) {
            if (this.sprite.flipX)
                this.stateMachine.setState("move-left");
            else
                this.stateMachine.setState("move-right");
            return true;
        }

        return false;
    }
    private idleOnEnter() {
        this.sprite.play('idle');

        if (Math.random() > 0.5) {
            this.stateMachine.setState('move-left');
        }
        else {
            this.stateMachine.setState('move-right');
        }
    }

    private handleStomped(bomb: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== bomb && !this.garbage) {
            return;
        }
        this.garbage = true;
        events.off(this.name + '-stomped', this.handleStomped, this);
        this.sprite.flipX = false;
        this.sprite.play('count');
        this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.stateMachine.setState('dead');
            this.cleanup();
        });

    }
    private cleanup() {
        if(this.sprite !== undefined) {
           this.sprite.destroy();
           this.stateMachine.destroy();
        }
        this.sprite = undefined;
    }

    private handleBlocked(fire: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== fire) {
            return;
        }

        this.moveTime = 0;

        if (this.sprite.flipX) {
            this.stateMachine.setState('move-left');
        }
        else {
            this.stateMachine.setState('move-right');
        }
    }

    public getEvent() {
        return this.name + '-stomped';
    }

    public keepObject() {
        return !this.garbage;
    }

    private createAnims() {
        this.sprite.anims.create({
            repeat: -1,
            key: 'idle',
            frameRate: 5,
            frames: this.sprite.anims.generateFrameNames('bomb', {
                start: 0,
                end: 1,
                prefix: '0_Idle',
                suffix: '.webp'
            })
        });
        this.sprite.anims.create({
            key: 'move',
            repeat: -1,
            frameRate: 5,
            frames: this.sprite.anims.generateFrameNames('bomb', {
                start: 0,
                end: 0,
                prefix: '1_Move',
                suffix: '.webp'
            })
        });
        this.sprite.anims.create({
            key: 'count',
            repeat: 0,
            frameRate: 5,
            frames: this.sprite.anims.generateFrameNames('bomb', {
                start: 2,
                end: 0,
                prefix: '2_Count',
                suffix: '.webp'
            })
        });
        this.sprite.anims.create({
            key: 'dead',
            repeat: 0,
            frameRate: 5,
            frames: this.sprite.anims.generateFrameNames('bomb', {
                start: 0,
                end: 2,
                prefix: '3_Dead',
                suffix: '.webp'
            })
        });
    }

}