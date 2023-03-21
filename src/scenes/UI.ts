import Phaser from "phaser";
import { sharedInstance as events } from "../scripts/EventManager";
import * as SceneFactory from '../scripts/SceneFactory';
import * as WalletHelper from '../scripts/WalletHelper';
import { PlayerStats } from "./PlayerStats";

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

    private time_start = 0;
    private lasttick = 0;

    constructor() {
        super('ui');        
    }

    init() {
       
        const data = window.localStorage.getItem( 'ra8bit.stats' );
        if( data != null ) {
            const obj = JSON.parse(data);
            this.info = obj as PlayerStats;

            if(this.info.currLevel === undefined) {
                this.info.currLevel = 0;
            }
        }
        else {
            this.info = {
                'lastHealth': 100,
                'coinsCollected': 0,
                'carrotsCollected': 0,
                'currLevel': 1,
                'scorePoints': 0,
                'highScorePoints': 0,
                'livesRemaining': 3,
                'invincibility': false,
                'speedUp': false,
                'powerUp': false,
                'throw': false,
                'pokeBall': false,
                'voice': false,
            };
        }
        
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });
    }

    destroy() {

        this.disableEvents();

        this.scoreLabel.destroy();
        this.coinsLabel.destroy();
        this.timeLabel.destroy();
        this.levelLabel.destroy();

        this.graphics.destroy();
        this.health?.destroy();
        this.lives.forEach( (l) => {
            l.destroy();
        });
        this.pwrInvincible?.destroy();
        this.pwrSpeed?.destroy();
        this.pwrPoop?.destroy();
        this.pwrPower?.destroy();
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
        
        this.pwrSpeed.setAlpha(this.info.speedUp ? 1: 0.1);
        this.pwrPoop.setAlpha(this.info.throw? 1: 0.1);
        this.pwrInvincible.setAlpha(this.info.invincibility?1:0.1);
        this.pwrPower.setAlpha(this.info.powerUp?1:0.1);

        this.health = this.add.sprite( 1230, 678, 'health', 4 );
        this.lives = [];
        let x = 1230 - 208;
        const y = 678;

        this.lives.push( this.add.sprite( x, y, 'health', this.info.livesRemaining > 0 ? 4 :0 ) ); x+= 64;
        this.lives.push( this.add.sprite( x, y, 'health', this.info.livesRemaining > 1 ? 4 :0 ) ); x+= 64;
        this.lives.push( this.add.sprite( x, y, 'health', this.info.livesRemaining > 2 ? 4 :0 ) );
        
        events.on('coin-collected', this.handleCoinCollected, this);
        events.on('coin-taken', this.handleCoinTaken, this);
        events.on('enemy-killed', this.handleEnemyKilled,this);
        events.on('health-changed', this.handleHealthChanged, this);
        events.on('reset-game', this.handleReset, this);
        events.on('next-level', this.handleNextLevel, this);
        events.on('warp-level', this.handleWarpLevel, this);
        events.on('bonus-level', this.handleBonusRound, this);

        events.on('power-invincible' , this.handleInvincible, this);
        events.on('power-speed' , this.handleSpeed, this);
        events.on('power-poop' , this.handlePoop, this);
        events.on('power-power', this.handlePower, this);
        events.on('power-pokeball', this.handlePokeball, this);
        events.on('voice-random', this.handleVoice, this);
        events.on('score-changed', this.handleChangeScore, this);
        
        events.on('carrot-collected', this.handleCarrotCollected, this );
        events.on('lives-changed', this.handleLivesChanged, this); 

        events.on('level-start', this.startGame, this); 
        events.on('restart', this.handleRestart, this);
        events.on('save-state', this.save, this);

        events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.disableEvents();
        });
    }
    
    update() {
        if(this.time_start > 0 && this.lasttick <= this.game.loop.frame) {
            this.timeLabel.text = `${(Phaser.Math.FloorTo( (this.time.now - this.time_start) * 0.001))}`;
            this.lasttick = this.game.loop.frame + 20;
        }
    }

    private disableEvents() {
        events.off('coin-collected', this.handleCoinCollected, this);
        events.off('coin-taken', this.handleCoinTaken, this);
        events.off('enemy-killed', this.handleEnemyKilled,this);
        events.off('health-changed', this.handleHealthChanged, this);
        events.off('reset-game', this.handleReset, this);
        
        events.off('next-level', this.handleNextLevel, this);
        events.off('bonus-level', this.handleBonusRound, this);
        events.off('warp-level', this.handleWarpLevel, this);

        events.off('power-invincible' , this.handleInvincible, this);
        events.off('power-speed' , this.handleSpeed, this);
        events.off('power-poop' , this.handlePoop, this);
        events.off('power-pokeball', this.handlePokeball, this);
        events.off('power-power', this.handlePower, this);
        events.off('score-changed', this.handleChangeScore, this);
        events.off('voice-random', this.handleVoice, this);
    
        events.off('carrot-collected', this.handleCarrotCollected, this );
        events.off('lives-changed', this.handleLivesChanged, this); 
    
        events.off('level-start', this.startGame, this);
        events.off( 'restart', this.handleRestart, this);

        events.off('save-state', this.save, this );
    }

    private startGame() {
        this.time_start = (this.time_start == 0 ? this.time.now: this.time_start);
        this.lasttick = 0;
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
        this.setHealthBar(value);
     }

    private handleEnemyKilled(value: number) {
        this.updateScore(value);
    }

    private handleInvincible(value: boolean) {
        this.pwrInvincible?.setAlpha(value ? 1: 0.1);
        this.info.invincibility = value;
    }
    
    private handleSpeed(value: boolean) {
        this.pwrSpeed?.setAlpha(value ? 1: 0.1);
        this.info.speedUp = value;
    }
    
    private handlePoop(value: boolean) {
        this.pwrPoop?.setAlpha(value ? 1: 0.1);
        this.info.throw = value;
    }

    private handlePokeball(value: boolean) {
        this.info.pokeBall = value;
        this.pwrPoop?.setAlpha(value ? 1: 0.1);
        this.info.throw = value;
    }

    private handleVoice(value: boolean) {
        this.info.voice = value;
    }

    private handlePower(value: boolean) {
        this.pwrPower?.setAlpha(value ? 1: 0.1);
        this.info.powerUp = value;
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
        this.lasttick = 0;
        
        this.resetSpawnPoint();
        this.scene.stop(); // stop UI
    }
    
    private handleBonusRound() {
        this.handleSceneSwitch();   
    }

    private handleWarpLevel(value: number) {
       
        
        this.time_start = 0;
        this.lasttick = 0;

        this.resetSpawnPoint();

        this.scene.stop();
        this.info.currLevel = value;
        
        this.save();

        this.levelLabel.setText('Level '+ this.info.currLevel);

        this.scene.start( 'level' + this.info.currLevel );
    }

    private handleNextLevel() {
        if( WalletHelper.isNotEligible()) {
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
            this.handleLivesChanged(this.info.livesRemaining + 1);
            this.info.coinsCollected = 0;
        } 
    }

    private handleCoinTaken() {
        this.info.coinsCollected -= 5;
        
        if( this.info.coinsCollected < 0  ) {
            this.info.coinsCollected = 0;
        }
        
        this.coinsLabel.text = `x ${this.info.coinsCollected}`;
    }

    private handleReset() {
        this.health?.setFrame(0);
        for(let i = 0; i <3 ;i ++ ) {
            this.lives[i].setFrame(0);
        }
        this.info.highScorePoints = ( this.info.scorePoints > this.info.highScorePoints ? this.info.scorePoints : this.info.highScorePoints );
        this.info.scorePoints = 0;
        
        this.info.currLevel = 1;
        this.info.lastHealth = 100;
        this.info.livesRemaining = 3;

        this.info.invincibility = false;
        this.info.speedUp = false;
        this.info.powerUp = false;
        this.info.throw = false;
        this.info.pokeBall = false;
        this.info.voice = false;
        this.save();

        this.resetSpawnPoint();
        this.scene.stop();

        this.lasttick = 0;
        this.time_start = 0;
    }

    private handleRestart() {
        this.info.invincibility = false;
        this.info.speedUp = false;
        this.info.powerUp = false;
        this.info.throw = false;
        this.info.pokeBall = false;
        this.info.voice = false;
        this.info.lastHealth = 100;
        
        this.pwrSpeed?.setAlpha(this.info.speedUp ? 1: 0.1);
        this.pwrPoop?.setAlpha(this.info.throw? 1: 0.1);
        this.pwrInvincible?.setAlpha(this.info.invincibility?1:0.1);
        this.pwrPower?.setAlpha(this.info.powerUp?1:0.1);

        this.save();
    }

    private resetSpawnPoint() {
        globalThis.spawnLocation = 30 * 10;
    }

    private updateScore(value: number) {
        this.info.scorePoints += value;
        this.scoreLabel.text = `${this.info.scorePoints}`;
    }

    private save() {
        const data = JSON.stringify(this.info);
        window.localStorage.setItem( 'ra8bit.stats', data );
    }

}