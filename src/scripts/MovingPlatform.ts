import Phaser from 'phaser'
import { sharedInstance as events } from './EventManager';
import PlayerController from './PlayerController';

export default class MovingPlatform {

    private startY = 0;
    private startX = 0;
    private to = 0;
    private duration = 0;
    private vertical = false;
    private sprite: Phaser.Physics.Matter.Sprite;
    private scene: Phaser.Scene;
    private player: PlayerController;

    private vx = 0;
    private vy = 0;
    private lastX = 0;
    private id = 0;
    private lastY = 0;
    private noautostart = false;
    
    constructor(scene, x, y, to, duration, vertical, sprite: Phaser.Physics.Matter.Sprite, nas: false, id, player: PlayerController) {
        this.startX = x;
        this.startY = y;
        this.to = (to * 64);
        this.duration = duration;
        this.sprite = sprite;
        this.scene = scene;
        this.vertical = vertical;
        this.sprite.setData('type', 'platform');
        this.sprite.setDepth(16);
        this.lastX = x;
        this.lastY = y;
        this.id = id;
        this.noautostart = nas;
        this.player = player;
        if(this.noautostart) {
            this.disable();
            events.on('wakeup-object', this.enable, this);
        }
        else {
            this.enable();
            this.start();
        }
    }

    disable() {
        this.sprite.setAlpha(0);
        this.sprite.setCollidesWith([6]);
    }

    enable() {
        this.sprite.setAlpha(1);
        this.sprite.setCollidesWith([1,4]);

        this.start();
    }

    start() {
        if (this.vertical) {
            this.moveVertically();
        }
        else {
            this.moveHorizontally();
        }   
    }

    destroy() {
        if(!this.noautostart) {
            events.off('wakeup-object', this.start);
        }

        this.sprite.destroy();
    }

    moveVertically() {

        this.scene.tweens.addCounter({
            from: 0,
            to: this.to,
            duration: this.duration,
            ease: Phaser.Math.Easing.Sine.InOut,
            repeat: -1,
            yoyo: true,
            onUpdate: (tween, target) => {
                const y = Phaser.Math.RoundTo(this.startY + target.value,0);
                const dy = y - this.lastY; 

                this.sprite.setVelocityY(dy);
                this.sprite.setPosition(this.lastX, y);
               
                this.vy = dy;
                this.vx = 0;
               
                this.player?.changePosition( this.vx, this.vy, this.sprite );

                this.lastX = this.sprite.body.position.x;
                this.lastY = this.sprite.body.position.y;

            }
        });
    }

    moveHorizontally() {
        this.scene.tweens.addCounter({
            from: 0,
            to: this.to,
            duration: this.duration,
            ease: Phaser.Math.Easing.Sine.InOut,
            repeat: -1,
            yoyo: true,
            onUpdate: (tween, target) => {
                const x = Phaser.Math.RoundTo(this.startX + target.value,0);
                const dx = x - this.sprite.x;
             
                this.sprite.setVelocityX(dx);
                this.sprite.setPosition(x, this.lastY);
                
                this.vy = this.sprite.body.velocity.y;
                this.vx = dx;

                if(this.vx != 0 ) this.sprite.setData('relpos' + this.id, { x: this.vx, y: this.vy });

                this.lastX = this.sprite.body.position.x;
                this.lastY = this.sprite.body.position.y;
            }
        });
    }
}