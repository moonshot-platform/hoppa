import Phaser from 'phaser'

export default class MovingPlatform {

    private startY: number = 0;
    private startX: number = 0;
    private to: number = 0;
    private duration: number = 0;
    private vertical: boolean = false;
    private sprite: Phaser.Physics.Matter.Sprite;
    private scene: Phaser.Scene;

    private vx: number = 0;
    private vy: number = 0;

    private lastX: number = 0;
    private lastY: number = 0;

    constructor(scene, x, y, to, duration, vertical, sprite) {
        this.startX = x;
        this.startY = y;
        this.to = (to * 64);
        this.duration = duration;
        this.sprite = sprite;
        this.scene = scene;
        this.vertical = vertical;
        this.sprite.setFriction(1, 0, Infinity);
        this.sprite.setData('type', 'platform');
        this.lastX = x;
        this.lastY = y;
        if (this.vertical) {
            this.moveVertically();
        }
        else {
            this.moveHorizontally();
        }
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
                this.vy = this.sprite.body.position.y - this.lastY;
                this.vx = this.sprite.body.position.x - this.lastX;
                this.lastX = this.sprite.body.position.x;
                this.lastY = this.sprite.body.position.y;

                const y = this.startY + target.value;
                const dy = y - this.sprite.y;
                this.sprite.y = y;
                this.sprite.setVelocityY(dy);

                this.sprite.setData('relpos', { x: this.vx, y: this.vy, vert: true, direction: (this.vy < 0 ? -1 : 1) });

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
                this.vy = this.sprite.body.position.y - this.lastY;
                this.vx = this.sprite.body.position.x - this.lastX;
                this.lastX = this.sprite.body.position.x;
                this.lastY = this.sprite.body.position.y;


                const x = this.startX + target.value;
                const dx = x - this.sprite.x;
                this.sprite.x = x;
                this.sprite.setVelocityX(dx);


                this.sprite.setData('relpos', { x: this.vx, y: this.vy, vert: false, direction: (this.vx < 0 ? -1 : 1) });
            }
        });
    }
}