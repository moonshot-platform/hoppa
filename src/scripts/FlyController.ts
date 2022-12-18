import StateMachine from "./StateMachine";
import { sharedInstance as events } from './EventManager';
import * as CreatureLogic from './CreatureLogic';

export default class FlyController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;
    private garbage = false;
    private moveTime = 0;
    private name;
    private wingPower = 3;

    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        name: string
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
            .addState('move-down', {
                onEnter: this.moveDownOnEnter,
                onUpdate: this.moveDownOnUpdate
            })
            .addState('move-up', {
                onEnter: this.moveUpOnEnter,
                onUpdate: this.moveUpOnUPdate
            })
            .addState('dead', {
            })
            .setState('idle');

        events.on(this.name + '-stomped', this.handleStomped, this);
        events.on(this.name + '-blocked', this.handleBlocked, this);

        this.wingPower = Phaser.Math.FloatBetween(2.0, 4.0);

    }

    destroy() {
        events.off(this.name + '-stomped', this.handleStomped, this);
        events.off(this.name + '-blocked', this.handleBlocked, this);
    }

    update(deltaTime: number) {
        this.stateMachine.update(deltaTime);
    }

    public getSprite() {
        return this.sprite;
    }

    private moveDownOnEnter() {
        this.moveTime = 0;
    }

    private moveDownOnUpdate(deltaTime: number) { // this is up actually
        this.moveTime += deltaTime;
        this.sprite.setVelocityY(-1 * this.wingPower);

        if (this.moveTime > 4000) {
            this.stateMachine.setState('move-up');
        }
    }

    private moveUpOnEnter() {
        this.moveTime = 0;
    }

    private moveUpOnUPdate(deltaTime: number) {
        this.moveTime += deltaTime;
        this.sprite.setVelocityY(4 * this.wingPower);

        if (this.moveTime > 1000) {
            this.stateMachine.setState('move-down');

        }
    }
    public lookahead(map: Phaser.Tilemaps.Tilemap): boolean {
        if (this.sprite.active == false)
            return false;

        if (!CreatureLogic.hasTileAhead(map, this.scene.cameras.main, this.sprite, true, 0)) {
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
        this.stateMachine.setState('move-down');
    }

    private handleStomped(fly: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== fly) {
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

    private handleBlocked(fly: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== fly) {
            return;
        }

        this.moveTime = 0;

        if (Math.random() < 0.5) {
            this.stateMachine.setState('move-down');
        }
        else {
            this.stateMachine.setState('move-up');
        }
    }
    public keepObject() {
        return !this.garbage;
    }
    private createAnims() {
        this.sprite.anims.create({
            key: 'idle',
            frameRate: 10,
            repeat: -1,
            frames: this.sprite.anims.generateFrameNames('fly', {
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
            frames: this.sprite.anims.generateFrameNames('fly', {
                start: 0,
                end: 2,
                prefix: '1_Dead',
                suffix: '.webp'
            })
        });
    }

}