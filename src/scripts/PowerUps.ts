import { sharedInstance as events } from './EventManager';
import PlayerController from "./PlayerController";

export default class PowerUps {

    private hasInvincibility: boolean = false;
    private hasSpeedUp: boolean = false;
    private hasPower: boolean = false;
    private hasPoop: boolean = false;

    private player!: PlayerController;

    constructor(player: PlayerController) {
        this.player = player;
    }


    public reset() {
        this.hasInvincibility = false;
        this.hasSpeedUp = false;
        this.hasPower = false;
        this.hasPoop = false;
    }

    public isInvincible(): boolean {
        return this.hasInvincibility;
    }

    public isPoop(): boolean {
        return this.hasPoop;
    }

    public isSpeedUp(): boolean {
        return this.hasSpeedUp;
    }

    public isPower(): boolean {
        return this.hasPower;
    }

    public setPower(scene: Phaser.Scene) {
        this.hasPower = true;
        scene.time.delayedCall(30 * 1000, this.restorePower, undefined, this);
        events.emit('power-power', this.hasPower);
    }

    public setInvincibility(scene: Phaser.Scene) {
        this.hasInvincibility = true;
        scene.time.delayedCall(30 * 1000, this.restoreInvincibility, undefined, this);

        this.player.getSprite().setCollidesWith([1]);
        events.emit('power-invincible', this.hasInvincibility);
    }

    public restoreInvincibility() {
        this.hasInvincibility = false;
        this.player.getSprite().setCollidesWith([1, 4]);
        events.emit('power-invincible', this.hasInvincibility);
    }

    public setSpeed(scene: Phaser.Scene) {
        this.hasSpeedUp = true;
        this.player.setSpeed(6);
        scene.time.delayedCall(30 * 1000, this.restoreSpeed, undefined, this);
        events.emit('power-speed', this.hasSpeedUp);
    }

    public setPoop() {
        this.hasPoop = true;
        events.emit('power-poop', this.hasPoop);
    }

    public restoreSpeed() {
        this.hasSpeedUp = false;
        this.player.setSpeed(5);
        events.emit('power-speed', this.hasSpeedUp);
    }

    public restorePower() {
        this.hasPower = false;
        events.emit('power-power', this.hasPower);
    }

    public add(name: string, scene: Phaser.Scene) {
        switch (name) {
            case 'berry': {
                this.setPoop();
                break;
            }
            case 'pow': {
                this.setPower(scene);
                break;
            }
            case 'star': {
                this.setSpeed(scene);
                break;
            }
            case 'rubber1': {
                this.setInvincibility(scene);
                break;
            }
        }
    }

}