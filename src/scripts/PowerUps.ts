import { sharedInstance as events } from './EventManager';
import PlayerController from "./PlayerController";
import * as SceneFactory from '../scripts/SceneFactory';
import { PlayerStats } from '~/scenes/PlayerStats';
export default class PowerUps {

    private hasInvincibility = false;
    private hasSpeedUp = false;
    private hasPower = false;
    private hasPoop = false;
    private hasPokeBall = false;
    private hasVoice = false;
    private hasBeserker = false;

    private currLevel = 1;
    private scene!: Phaser.Scene;
    private player: PlayerController;
    private hasEvents = false;
    private oldSpeed: number = 5;

    private blinkingTween?: Phaser.Tweens.Tween;
    private timerEvent?:Phaser.Time.TimerEvent;

    
    constructor(player: PlayerController, scene: Phaser.Scene, inventoryTrigger: boolean = false) {
        this.player = player;
        this.scene = scene;
     
        if( !inventoryTrigger ) {
            events.on('card-6', this.activateSpeedUp, this );
            events.on('card-5', this.activatePowerUp, this );
            events.on('card-7', this.activateMystery, this );
            events.on('card-4', this.activateDroppings, this );
            events.on('card-8', this.activateWarp, this);
            events.on('card-3', this.activatePokeBall, this );
            events.on('card-2', this.activateDeadEnd, this);
            events.on('card-1', this.activateAnotherPlayer, this);
            events.on('card-9', this.activateVoice, this);
        }

        this.hasEvents = inventoryTrigger;

        const data = window.localStorage.getItem( 'ra8bit.stats' );
        if( data != null ) {
            const obj = JSON.parse(data);
            let info = obj as PlayerStats;
            this.hasSpeedUp = info.speedUp;
            this.hasPower = info.powerUp;
            this.hasPokeBall = info.pokeBall;
            this.hasVoice = info.voice;
            this.hasPoop = info.throw;
            this.currLevel = info.currLevel;
            
            if(this.hasPokeBall) {
                this.player.setProjectile("moonshot-ball", "moonshot-splash");
            }
        }
    }

    public destroy() {
        if(!this.hasEvents) {
            events.off('card-6', this.activateSpeedUp, this );
            events.off('card-5', this.activatePowerUp, this );
            events.off('card-7', this.activateMystery, this );
            events.off('card-4', this.activateDroppings, this );
            events.off('card-8', this.activateWarp, this);
            events.off('card-3', this.activatePokeBall, this );
            events.off('card-2', this.activateDeadEnd, this);
            events.off('card-1', this.activateAnotherPlayer, this);
            events.off('card-9', this.activateVoice, this);
        }
    }

    public activateVoice() {
        this.hasVoice = !this.hasVoice;
        this.player.setVoice(this.hasVoice);
        events.emit( 'voice-random');
        events.emit('save-state');
    }

    public activatePokeBall() {
        this.hasPokeBall = true;
        if(this.hasPokeBall) {
            this.player.setProjectile("moonshot-ball", "moonshot-splash");
        }
        events.emit('power-pokeball', this.hasPokeBall);
        events.emit('save-state');
    }

    public activateAnotherPlayer() {
        this.player.changeSkin();
        this.closeInventory();
    }

    public activateSpeedUp() {
        this.hasSpeedUp = !this.hasSpeedUp;
        this.player.setSpeed( (this.hasSpeedUp ? 6: 5) );
        events.emit('power-speed', this.hasSpeedUp);
        events.emit('save-state');
    }

    public activatePowerUp() {
        this.hasPower = true;
        events.emit('power-power', this.hasPower);
        events.emit('save-state');
    }

    public activateMystery() {
        this.player.toggle();
        this.closeInventory();
    }

    public activateDroppings() {
        this.hasPoop = true;
        this.hasPokeBall = false;
        if(this.hasPoop) {
            this.player.setProjectile( "dropping", "dropping-splash" );
        }
        events.emit('power-poop', this.hasPoop);
        events.emit('save-state');
    }

    public activateWarp() {
      
        SceneFactory.stopSound(this.scene);

        events.emit( "warp-level", 0 );

        this.scene.scene.stop( 'inventory' );
        this.scene.scene.stop( 'level' + this.currLevel );

        this.scene.scene.start( 'warp' );
    }

    public activateDeadEnd() {
        this.closeInventory();

        this.scene.scene.restart();
        events.emit('restart');
    }

    public reset() {
        this.hasInvincibility = false;
        this.hasSpeedUp = false;
        this.hasPower = false;
        this.hasPoop = false;
        this.hasPokeBall = false;
        this.hasVoice = false;
        this.hasBeserker = false;
    }

    public isInvincible(): boolean {
        return this.hasInvincibility;
    }

    public isPoop(): boolean {
        return this.hasPoop || this.hasPokeBall;
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

    public setPokeball() {
        this.hasPokeBall = true;
        this.hasPoop = true;
        this.player.setProjectile("moonshot-ball", "moonshot-splash");
        events.emit('power-poop', this.hasPoop);
    }

    public setVoice() {
        this.hasVoice = true;
    }

    public setInvincibility(scene: Phaser.Scene) {
        this.hasInvincibility = true;
        scene.time.delayedCall(10 * 1000, this.restoreInvincibility, undefined, this);

        this.player.getSprite()?.setCollidesWith([1]);
        events.emit('power-invincible', this.hasInvincibility);
    
        this.blink(0xf5ee31, 10);
    }

    public setCrazySpeed(scene: Phaser.Scene) {
        this.hasSpeedUp = true;
        this.hasPower = true;
        this.player.setSpeed(8);

        if(this.hasBeserker) {
            this.player.setSpeed(9);
        }

        events.emit('power-power', this.hasPower);
        events.emit('power-speed', this.hasSpeedUp);

        this.blink(0xa5135d, 10);
        scene.time.delayedCall(10 * 1000,  this.restoreCrazySpeed, undefined, this );
    }

    public restoreCrazySpeed() {
        this.player.setSpeed(this.oldSpeed);
        events.emit('power-speed', false);
    }

    public setBezerker(scene: Phaser.Scene) {
        
        this.hasBeserker = true;
        this.hasInvincibility = true;
        this.hasPower = true;
        
        scene.time.delayedCall(10 * 1000,  this.restoreBezerker, undefined, this );

        const startColor = Phaser.Display.Color.ValueToColor(0x3d022e);
        const endColor = Phaser.Display.Color.ValueToColor(0xe956c4);
        events.emit('power-invincible', this.hasInvincibility);
        events.emit('power-power', this.hasPower);

        this.blink(0xe672ad, 10);
    }

    public restoreBezerker() {
        this.hasBeserker = false;
        this.hasInvincibility = false;
        
        events.emit('power-invincible', this.hasInvincibility);
    }

    public isBezerker() {
        return this.hasBeserker;
    }

    public restoreInvincibility() {
        this.hasInvincibility = false;
        this.player.getSprite()?.setCollidesWith([1, 4]);
        events.emit('power-invincible', this.hasInvincibility);
    }

    public setSpeed(scene: Phaser.Scene) {
        this.hasSpeedUp = true;
        this.oldSpeed = this.player.getSpeed();
        this.player.setSpeed(6);
        scene.time.delayedCall(20 * 1000, this.restoreSpeed, undefined, this);
        events.emit('power-speed', this.hasSpeedUp);
    }

    public setPoop() {
        if(!this.hasPoop) {
            this.player.setProjectile( "dropping", "dropping-splash" );
        }
        this.hasPoop = true;
        events.emit('power-poop', this.hasPoop);
    }

    public restoreSpeed() {
        this.hasSpeedUp = false;
        this.player.setSpeed(this.oldSpeed);
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
            case 'rubber2': {
                this.setBezerker(scene);
                break;
            }
            case 'rubber3': {
                this.setCrazySpeed(scene);
                break;
            }
        }
    }

    private closeInventory() {
        this.player.unpokeVirtualStick(this.scene);
        this.scene.scene.stop('inventory');
    }

    private blink(color: number, duration: number) {
        this.blinkingTween?.stop();
        this.timerEvent?.remove();
        this.player.getSprite()?.setTint(0xffffff);
  
        const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
        const endColor = Phaser.Display.Color.ValueToColor(color);

        this.blinkingTween = this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 100,
            repeat: -1,
            yoyo: true,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: tween => {
                const value = tween.getValue();
                const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                    startColor,
                    endColor,
                    100,
                    value
                );

                const color = Phaser.Display.Color.GetColor(
                    colorObject.r,
                    colorObject.g,
                    colorObject.b
                );

                this.player.getSprite()?.setTint(color);
            }
        });

        this.timerEvent = this.scene.time.addEvent({
            delay: duration * 1000,
            callback: () => {
                this.blinkingTween?.stop();
                this.player.getSprite()?.setTint(0xffffff);
                this.timerEvent = undefined;
            }
        });
    }

}