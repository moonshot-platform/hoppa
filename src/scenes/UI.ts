import Phaser, { Tilemaps } from "phaser";
import { sharedInstance as events } from "../scripts/EventManager";
import * as SceneFactory from '../scripts/SceneFactory';


export default class UI extends Phaser.Scene {
    
    private info!: PlayerStats;

    private coinsLabel;
    private levelLabel;
    private scoreLabel;
    private timeLabel;
    private graphics!: Phaser.GameObjects.Graphics;

    private health ?: Phaser.GameObjects.Sprite;
    private lives: Phaser.GameObjects.Sprite[] = [];
    private coin?: Phaser.GameObjects.Sprite;

    private pwrSpeed?: Phaser.GameObjects.Sprite;
    private pwrInvincible?: Phaser.GameObjects.Sprite;
    private pwrPower?: Phaser.GameObjects.Sprite;
    private pwrPoop?: Phaser.GameObjects.Sprite;

    private time_start: number = 0;
    private lasttick: number = 0;

    constructor() {
        super('ui');        
    }

    init() {
       
        let data = window.localStorage.getItem( 'ra8bit.stats' );
        if( data != null ) {
            let obj = JSON.parse(data);
            this.info = obj as PlayerStats;
        }
        else {
            this.info = {
                'lastHealth': 100,
                'coinsCollected': 0,
                'carrotsCollected': 0,
                'currLevel': 1,
                'scorePoints': 0,
                'livesRemaining': 3
            };
        }
    }

    preload() {
        SceneFactory.preload(this);
    }
 
    create() {
        this.graphics = this.add.graphics();
        this.setHealthBar(100);

        this.add.image( 0,640,'bg-ui').setDisplaySize(this.cameras.main.width,80). setOrigin(0, 0);
        this.levelLabel = this.add.bitmapText( 16,676, 'press_start',
        `Level ${this.info.currLevel}`, 24 ).setTint(0xff7300); //0x7c9f4d);
        this.levelLabel.setDropShadow(0,2,0xff0000, 0.5);

        this.timeLabel = this.add.bitmapText( 630,676, 'press_start', 
         '0', 24 ).setTint(0xffffff);
        this.timeLabel.setDropShadow(0,2,0xff0000,0.5);

        this.coin = this.add.sprite(256 + (32 * 0.5),670 + (32 * 0.5), 'coin').setDisplaySize(32,32);

        this.coinsLabel = this.add.bitmapText( 256 + 48,676, 'press_start',
        `x ${this.info.coinsCollected}`, 24 ).setTint(0xff7300);
        this.coinsLabel.setDropShadow(0,2,0xff0000, 0.5);

        this.scoreLabel = this.add.bitmapText( 448, 676 , 'press_start', `${this.info.scorePoints}`, 24).setTint(0xffffff);
        this.scoreLabel.setDropShadow(0,2,0xff0000, 0.5);
        
        this.pwrPoop = this.add.sprite( 760, 670 + (32 * 0.5), 'berry' ).setDisplaySize(32,32);
        this.pwrSpeed = this.add.sprite( 760 + 48, 670 + (32 * 0.5), 'star' ).setDisplaySize(32,32);
        this.pwrPower = this.add.sprite( 760 + 48 + 48, 670 + (32 * 0.5), 'pow' ).setDisplaySize(32,32);
        this.pwrInvincible = this.add.sprite( 760 + (3 * 48), 670 + (32 * 0.5), 'rubber1' ).setDisplaySize(32,32);
        
        this.pwrPoop.setAlpha(0.1);
        this.pwrSpeed.setAlpha(0.1);
        this.pwrPower.setAlpha(0.1);
        this.pwrInvincible.setAlpha(0.1);

        this.health = this.add.sprite( 1230, 678, 'health', 4 );
        this.lives = [];
        let x = 1230 - 208;
        let y = 678;

        this.lives.push( this.add.sprite( x, y, 'health', this.info.livesRemaining > 0 ? 4 :0 ) ); x+= 64;
        this.lives.push( this.add.sprite( x, y, 'health', this.info.livesRemaining > 1 ? 4 :0 ) ); x+= 64;
        this.lives.push( this.add.sprite( x, y, 'health', this.info.livesRemaining > 2 ? 4 :0 ) );
        
        events.on('coin-collected', this.handleCoinCollected, this);
        events.on('enemy-killed', this.handleEnemyKilled,this);
        events.on('health-changed', this.handleHealthChanged, this);
        events.on('reset-game', this.handleReset, this);
        events.on('next-level', this.handleNextLevel, this);
        events.on('bonus-level', this.handleBonusRound, this);

        events.on('power-invincible' , this.handleInvincible, this);
        events.on('power-speed' , this.handleSpeed, this);
        events.on('power-poop' , this.handlePoop, this);
        events.on('power-power', this.handlePower, this);
        events.on('score-changed', this.handleChangeScore, this);
        
        events.on('carrot-collected', this.handleCarrotCollected, this );
        events.on('lives-changed', this.handleLivesChanged, this); 

        events.on('level-start', this.startGame, this); 

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            events.off('coin-collected', this.handleCoinCollected, this);
            events.off('enemy-killed', this.handleEnemyKilled,this);
            events.off('health-changed', this.handleHealthChanged, this);
            events.off('reset-game', this.handleReset, this);
            
            events.off('next-level', this.handleNextLevel, this);
            events.off('bonus-level', this.handleBonusRound, this);
    
            events.off('power-invincible' , this.handleInvincible, this);
            events.off('power-speed' , this.handleSpeed, this);
            events.off('power-poop' , this.handlePoop, this);
            events.off('power-power', this.handlePower, this);
            events.off('score-changed', this.handleChangeScore, this);
            
            events.off('carrot-collected', this.handleCarrotCollected, this );
            events.off('lives-changed', this.handleLivesChanged, this); 
        
            events.off('level-start', this.startGame, this); 
        });
    }

    update(time, delta) {
        if(this.time_start > 0 && this.lasttick <= this.game.loop.frame) {
            this.timeLabel.text = `${(Phaser.Math.FloorTo( (this.time.now - this.time_start) * 0.001))}`;
            this.lasttick = this.game.loop.frame + 20;
        }
    }

    private startGame() {
        this.time_start = this.time.now;
    }

    private setHealthBar(value: number) {
        const percent = Phaser.Math.Clamp(value, 0, 100);
        const heart   = ~~ ( percent / 25  );
        this.info.lastHealth = value;
        this.health?.setFrame(heart);
    }

    private handleLivesChanged(value: number ) {
        for( let i = 0; i < 3; i ++ ) {
            this.lives[i].setFrame( value < i ? 0 : 4 );
        }
        this.info.livesRemaining = value;
        this.save();
    }
    
    private handleHealthChanged(value: number) {
        /* this.tweens.addCounter( {
             from: this.info.lastHealth,
             to: value,
             duration: 200,
             ease: Phaser.Math.Easing.Sine.InOut,
             onUpdate: tween => {
                 const value = tween.getValue();
                 this.setHealthBar(value);
             }
         }); */
        this.setHealthBar(value);
       
     }

    private handleEnemyKilled(value: number) {
        this.updateScore(value);
    }

    private handleInvincible(value: boolean) {
        this.pwrInvincible?.setAlpha(value ? 1: 0.1);
        if(value) {
            this.updateScore(1000);
        }
    }
    
    private handleSpeed(value: boolean) {
        this.pwrSpeed?.setAlpha(value ? 1: 0.1);
        if(value) {
            this.updateScore(1000);
        }
    }
    
    private handlePoop(value: boolean) {
        this.pwrPoop?.setAlpha(value ? 1: 0.1);
        if(value) {
            this.updateScore(1000);
        }
    }

    private handlePower(value: boolean) {
        this.pwrPower?.setAlpha(value ? 1: 0.1);
        if(value) {
            this.updateScore(1000);
        }
    }

    private handleChangeScore(value: number) {
        this.updateScore(value);
    }

    private handleCarrotCollected() {
        this.info.carrotsCollected ++;

        this.updateScore(5);
    }

    private handleSceneSwitch() {
        this.save();

        this.time_start = 0;
        
        this.resetSpawnPoint();
        this.game.sound.stopAll();
        this.scene.stop(); // stop UI
    }
    
    private handleBonusRound() {
        this.handleSceneSwitch();   
    }

    private handleNextLevel() {
        if( (globalThis.moonshotBalance == 0 && globalThis.ra8bitBalance == 0) || globalThis.noWallet ) {
            this.info.currLevel = 1;
        }
        else {
           this.info.currLevel ++;
        }

        this.handleSceneSwitch();
    }

    private handleCoinCollected() {
        this.info.coinsCollected ++;

        this.coinsLabel.text = `x ${this.info.coinsCollected}`;

        this.updateScore(10);

        if( this.info.coinsCollected == 100  ) {
          //  SceneFactory.addSound(this, '100coins', false, true );
            this.handleLivesChanged(this.info.livesRemaining + 1);
            this.info.coinsCollected = 0;
        } 
    }

    private handleReset() {
        this.health?.setFrame(0);
        for(let i = 0; i <3 ;i ++ ) {
            this.lives[i].setFrame(0);
        }
        this.info.scorePoints = 0;
        this.info.currLevel = 1;
        this.info.lastHealth = 100;
        this.info.livesRemaining = 3;

        this.save();

        this.resetSpawnPoint();
        this.game.sound.stopAll();
        this.scene.stop();
    }

    private resetSpawnPoint() {
        this.scene.scene.game.registry.set( 'playerX' , -1 );
        this.scene.scene.game.registry.set( 'playerY' , -1 );
    }

    private updateScore(value: number) {
        this.info.scorePoints += value;
        this.scoreLabel.text = `${this.info.scorePoints}`;
    }

    private save() {
        let data = JSON.stringify(this.info);
        window.localStorage.setItem( 'ra8bit.stats', data );
    }

}