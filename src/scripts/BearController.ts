import StateMachine from "./StateMachine";
import { sharedInstance as events } from './EventManager';
import PlayerController from "./PlayerController";

export default class BearController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private heart: Phaser.GameObjects.Image;
    
    private stateMachine: StateMachine;
    private garbage = false;
    private name: string;
    private player: Phaser.Physics.Matter.Sprite;

    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        name: string,
        playerController: PlayerController,
    ) {
        this.scene = scene;
        this.sprite = sprite;
        this.name = name; scene.add.image
        this.createAnims();
        this.garbage = false;
        this.stateMachine = new StateMachine(this);
        this.player = playerController?.getSprite();
        this.heart = undefined;
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

        this.cleanup();
    }

    update(deltaTime: number) {
        this.stateMachine.update(deltaTime);

        if(this.stateMachine.getCurrentState() !== 'idle' || this.player === undefined)
            return;

        if( this.player.body.position.x > this.sprite.body.position.x ) {
            this.sprite.flipX = true;
        }
        else {
            this.sprite.flipX = false;
        }

        if( this.heart === undefined && Phaser.Math.Distance.BetweenPoints(this.sprite.body.position, this.player.body.position) < (4 * 64 )) {
            this.heart = this.scene.add.image( this.sprite.x - 4, this.sprite.y - this.sprite.height - 8, 'health',4).setScale(0.5,0.5);
            const tweenConfig = {
                targets: this.heart,
                scaleX: 1.25,
                scaleY: 1.25,
                duration: 1500,
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: 0,
                onComplete: () => {
                    this.heart.destroy();
                    this.heart = undefined;
                }
            };
            this.scene.tweens.add( tweenConfig );
        }
    }

    public getSprite() {
        return this.sprite;
    }

    private idleOnEnter() {
        this.sprite.play('idle');
    }

    private handleStomped(bear: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== bear && !this.garbage) {
            return;
        }
        
        events.off(this.name + '-stomped', this.handleStomped, this);
        this.garbage = true;
        this.sprite.play('dead');
        this.sprite.setStatic(true);
        this.sprite.setCollisionCategory(0);
        this.sprite.on('animationcomplete', () => {
            this.cleanup();
        });

        if(this.heart !== undefined) {
            this.heart.setVisible(false);
        }

        this.stateMachine.setState('dead');
    }

    private cleanup() {
        if(this.sprite !== undefined) {
           this.sprite.destroy();
           this.stateMachine.destroy();
        }
        this.sprite = undefined;
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