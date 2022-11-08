import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';
import Button from 'phaser3-rex-plugins/plugins/button.js';
import { sharedInstance as events } from "../scripts/EventManager";

export default class JoypadController {
    private joystick: VirtualJoystick;
    private throwButton: Button;
    private jumpButton: Button;

    private outer: number = 0x888888;
    private inner: number = 0xcccccc;

    private alphaOn: number = 0.66;
    private alphaOff: number = 0.33;

    private A: Phaser.GameObjects.Arc;
    private B: Phaser.GameObjects.Arc;

    private scene: Phaser.Scene;
    private stickRadius: number = 160;
    private buttonRadius: number = 88;
    private started: boolean = false;

    constructor(scene: Phaser.Scene, width: number) {

        this.scene = scene;

        this.B = scene.add
            .circle(width - 96, 500, this.buttonRadius, this.outer)
            .setScrollFactor(0)
            .setAlpha(this.alphaOn)
            .setOrigin(0.5, 1)
            .setStrokeStyle(2, this.inner)
            .setDepth(99);

        this.A = scene.add
            .circle(width - 248, 600, this.buttonRadius, this.outer)
            .setScrollFactor(0)
            .setAlpha(this.alphaOn)
            .setOrigin(0.5, 1)
            .setStrokeStyle(2, this.inner)
            .setDepth(99);

        this.joystick = new VirtualJoystick(scene, {
            x: 172,
            y: 512,
            radius: this.stickRadius,
            base: scene.add.circle(0, 0, 160, this.outer, this.alphaOn).setDepth(99),
            thumb: scene.add.circle(0, 0, 72, this.inner, this.alphaOn).setDepth(99),
            forceMin: 20,
        });

        this.throwButton = new Button(this.B, {
            enable: true,
            mode: 1,
            clickInterval: 15,
            threshold: undefined
        });
        this.jumpButton = new Button(this.A, {
            enable: true,
            mode: 1,
            clickInterval: 15,
            threshold: undefined
        });


    }

    startTimer() {
        if (!this.started) {
            if (this.joystick.down || this.joystick.up || this.joystick.left || this.joystick.right) {
                this.started = true;
                events.emit('level-start');
            }
        }
    }

    startTimerNow() {
        if (!this.started) {
            events.emit('level-start');
            this.started = true;
        }
    }

    getStick() {
        return this.joystick;
    }

    getA() {
        return this.jumpButton;
    }

    getB() {
        return this.throwButton;
    }

    setBActive(status: boolean) {
        this.B.setAlpha(status ? this.alphaOn : this.alphaOff);
    }

    setAActive(status: boolean) {
        this.A.setAlpha(status ? this.alphaOn : this.alphaOff);
    }

    fireA() {
        //  this.visualFeedback(this.A);
    }

    fireB() {
        //   this.visualFeedback(this.B);
    }

    visualFeedback(gameObj) {
        this.scene.tweens.add({
            targets: gameObj,
            tint: 0xffffff,
            ease: 'Cubic.easeOut',
            duration: 50,
            repeat: -1,
            yoyo: true
        })
    }

    lerp(a, b, f) {
        return a * (1.0 - f) + (b * f);
    }

    // dampening
    dampenVelocityX(velocityX: number): number {
        let v = Phaser.Math.Clamp(this.joystick.force, 0, 80);
        if (v == 0)
            return 0;
        let f = (velocityX / 80) * v;
        return f;
    }

}