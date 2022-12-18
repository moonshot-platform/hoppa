import { sharedInstance as events } from './EventManager';
import PlayerController from "./PlayerController";

export default class PowerUps {

    private hasInvincibility = false;
    private hasSpeedUp = false;
    private hasPower = false;
    private hasPoop = false;
    private scene!: Phaser.Scene;
    private player!: PlayerController;

    constructor(player: PlayerController, scene: Phaser.Scene) {
        this.player = player;
        this.scene = scene;
        const data = window.localStorage.getItem( 'ra8bit.stats' );
        if( data != null ) {
            const obj = JSON.parse(data);
            const info = obj as PlayerStats;
            if(info.invincibility) this.setInvincibility(this.scene);
            if(info.throw) this.setPoop();
            if(info.powerUp) this.setPower(this.scene);
            if(info.speedUp) this.setSpeed(this.scene);
        }
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
        events.emit('power-power', this.hasPower);
    }

    public setInvincibility(scene: Phaser.Scene) {
        this.hasInvincibility = true;
        scene.time.delayedCall(10 * 1000, this.restoreInvincibility, undefined, this);

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
        scene.time.delayedCall(20 * 1000, this.restoreSpeed, undefined, this);
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