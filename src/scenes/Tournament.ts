import Phaser from "phaser";
import { sharedInstance as events } from '../scripts/EventManager';
import * as SceneFactory from '../scripts/SceneFactory';
import * as WalletHelper from '../scripts/WalletHelper';
export default class Tournament extends Phaser.Scene {

    private actionButton?: Phaser.GameObjects.BitmapText;
    private valueButton?: Phaser.GameObjects.BitmapText;
    
    private yourStakeLabel!: Phaser.GameObjects.BitmapText;
    private ifYouWinLabel!: Phaser.GameObjects.BitmapText;
    private closingInLabel!: Phaser.GameObjects.BitmapText;
    private totalStakedLabel!: Phaser.GameObjects.BitmapText;
    private totalPlayersLabel!: Phaser.GameObjects.BitmapText;
    private penaltyLabel?: Phaser.GameObjects.BitmapText;
    private countdownText?: Phaser.GameObjects.BitmapText;

    private statusText?: Phaser.GameObjects.BitmapText;

    private inputAmount: number = 0;
    private previousAmount: number = 0;
    private countdown = 0;
    private idleTimer = 0;

    private inArena: boolean = false;
    private hasApproved: boolean = false;
    private lastUpdate = 0;
    private countdownTimer?: Phaser.Time.TimerEvent;

    private penaltyPercentage = 20;

    constructor() {
        super('tournament');
    }

    
    init(d) {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });
    }

    preload() {
        SceneFactory.preload(this);
    }

    create() {
        const { width, height } = this.scale;
        const fontSize = 24;
        const x = 64;
        const y = 382;

        this.input.setDefaultCursor('url(assets/hand.cur), pointer');

        this.countdown = 32;
        this.countdownText = this.add.bitmapText(width - 64, height - 64, 'press_start', "" + this.countdown, 22 ).setOrigin(1,1).setTint(0x300051);

        this.statusText = this.add.bitmapText(width/2, height/2 - 64 , 'press_start', 'Checking Block Chain ...', fontSize)
            .setTint(0xffffff)
            .setOrigin(0.5);
        this.actionButton = this.add.bitmapText(width * 0.5, 164, 'press_start',  'enter', 48 ).setTint(0xffffff).setOrigin(0.5);
        this.valueButton = this.add.bitmapText(width * 0.5, 216, 'press_start', '', 24 ).setTint(0xffffff).setOrigin(0.5);
        this.penaltyLabel = this.add.bitmapText(width * 0.5, 64, 'press_start', '', 24 )
                .setTint(0xff0000)
                .setOrigin(0.5);
        
        this.yourStakeLabel = this.add.bitmapText(x,y, 'press_start', '', fontSize)
            .setTint(0xffffff);

        this.ifYouWinLabel = this.add.bitmapText(x,y + 64,  'press_start', '', fontSize)
            .setTint(0xffffff);
        
        this.closingInLabel = this.add.bitmapText(x,y + 128, 'press_start','', fontSize)
            .setTint(0xffffff);

        this.totalStakedLabel = this.add.bitmapText(x,y + 192, 'press_start', '', fontSize)
            .setTint(0xffffff);

        this.penaltyLabel = this.add.bitmapText(width * 0.5, 164, 'press_start','', 24 )
            .setTint(0xff0000)
            .setOrigin(0.5);

        this.checkIfInArena();
        this.checkIfApproved();
        this.checkIfUnderPenalty();

        this.nextNumber(0);
         
        this.updateAll();    
 
        this.input.on('pointerdown', this.handlePointerDown, this );
        this.input.on("wheel", this.handleWheel, this);
        this.input.keyboard?.on("keydown", this.handleKeyDown, this);

        this.countdownTimer = this.time.addEvent( { delay: 1000, callback: this.updateCountdown, callbackScope: this});
        
    }

    destroy() {

        this.countdownTimer?.remove();
        this.actionButton?.destroy();
        this.valueButton?.destroy();
        this.countdownText?.destroy();
        this.statusText?.destroy();
        this.actionButton?.destroy();
        this.ifYouWinLabel?.destroy();
        this.penaltyLabel?.destroy();
        this.yourStakeLabel?.destroy();
        this.closingInLabel?.destroy();
        this.totalPlayersLabel?.destroy();
        this.penaltyLabel?.destroy();

    }

    update(time: number, deltaTime: number) {

        if (time < this.lastUpdate)
            return;

        this.lastUpdate = time + 120;

        if (SceneFactory.isGamePadDown(this)) {
            this.nextNumber(-1);
        }
        if (SceneFactory.isGamePadUp(this)) {
            this.nextNumber(1);
        }
        if (SceneFactory.isGamePadLeft(this)) {
            this.nextNumber(-10);
        }
        if (SceneFactory.isGamePadRight(this)) {
           this.nextNumber(10);
        }

        if( SceneFactory.gamePadIsButton(this,1)) {
            this.endScene();
        }

        if( SceneFactory.gamePadIsButton(this,0)) {
            this.handlePointerDown();
        }

        if( SceneFactory.gamePadIsButton(this,8)) {
            this.scene.stop();
            this.scene.start( "tournament-intro");
        }

        if( this.input.activePointer.isDown && this.input.activePointer.wasTouch ) {
            let dir = ( this.input.activePointer.position.y > 0 ? 1 : -1 );
            
            this.nextNumber( dir );
        }
            
        if( this.previousAmount == this.inputAmount && time > this.idleTimer && this.idleTimer > 0) {
            this.showCountdown();
            this.idleTimer = 0;
        }
        else if( this.previousAmount != this.inputAmount) {
            this.previousAmount = this.inputAmount;
            this.idleTimer = Math.floor(time) + 8000;
        }
        
    }

    private updateCountdown() {
        this.countdown --;
        if(this.countdown <= 0) {
            this.endScene();
        }
        else {
            this.countdownTimer = this.time.addEvent( { delay: 1000, callback: this.updateCountdown, callbackScope: this});
        }
        this.countdownText?.setText( "" + this.countdown );
    }

    private handlePointerDown() {
        if(!this.hasApproved) {
            this.approveArena();
        }
        else if(!this.inArena ) {
            this.enterArena();
        }
        else {
            this.leaveArena();
        }

        this.removeCountdown();
    }

    private handleKeyDown(event) {
        
        if(!this.inArena) {
            if (event.keyCode === 37) {
                this.nextNumber(-10);
            } else if (event.keyCode === 39) {
                this.nextNumber(10);
            } else if (event.keyCode == 38 ) {
                this.nextNumber(1);
            } else if (event.keyCode == 40 ) {
                this.nextNumber(-1);
            } else if (event.keyCode == 13 ) {
                this.handlePointerDown();
            } else if (event.keyCode == 8 ) {
                this.inputAmount = 0;
            } 
        }
        
        if (event.keyCode == 27) {
            this.endScene();
        }
        
    }

    private endScene() {
        this.scene.stop();
        this.scene.start('hoppa-select');
    }

    private formatPlayerStake() {
        const f = async () => {
            let v = await WalletHelper.getEstimatedUnstakedAmount();
            if(this.scene.isActive(this.scene.key)) {
                let dv = this.fromContractAmount(v);
                if( dv > 0 ) {
                    this.yourStakeLabel.setText( "Your stake: " + this.getUnit( dv ) + " $MSHOT" );
                }
                else {
                    this.yourStakeLabel.setText( "Use the wheel, cursors or gamepad for amount");
                }
            }
        };

        f();
    }

    private calculateIfYouWin() {
        const f = async () => {
            let v = await WalletHelper.getEstimatedReward();
            if(this.scene.isActive(this.scene.key)) {
                let dv = this.fromContractAmount(v);
                if( dv > 0) {
                this.ifYouWinLabel.setText( "If you win: " + this.getUnit( dv ) + " $MSHOT" );
                }
                else {
                    this.ifYouWinLabel.setText( "" );
                    this.ifYouWinLabel.setText( "Press Enter, Click, Touch or X press to confirm");
                }
            }
        };

        return f();
    }

    private formatTotalStaked() {
        const f = async () => {
            let tp = await WalletHelper.getTotalPlayers();
            let ts = await WalletHelper.getTotalAmountStaked();

            if(this.scene.isActive(this.scene.key)) {
                let dts = this.fromContractAmount(ts);

                if( dts > 0 ) {
                    this.totalStakedLabel.setText( "Total staked by " + tp + " players: " + this.getUnit( dts ) + " $MSHOT" );
                }
                else {
                    this.totalStakedLabel.setText( "" );
                }
            }
        };
        f();
    }

    
    private updateAll() {
        this.checkMyStake();
        this.formatPlayerStake();
        this.calculateIfYouWin();
        this.formatTotalStaked();
        this.formatClosingTime; 
    }

    private formatClosingTime() {
        
       
        const f = async () => {
            let gameEndTime = await WalletHelper.getGameEndTime();
            if(this.scene.isActive(this.scene.key)) {
                let end = new Date(gameEndTime);
                let now = new Date();

                const timeDiff = end.getTime() - now.getTime();

                const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

                const dayStr = days.toString().padStart(2, '0');
                const hourStr = hours.toString().padStart(2, '0');
                const minuteStr = minutes.toString().padStart(2, '0');

                
                const str = "Closing ceremony in " + dayStr + ":" + hourStr + ":" + minuteStr;
                
                this.closingInLabel?.setText(str);
            }
        }
        f();
   
    }

    private checkIfUnderPenalty() {
        let result = false;
        const f = async () => {
            result = await WalletHelper.isArenaUnderPenalty();
            if(this.scene.isActive(this.scene.key)) {
                if(result) {
                    this.statusText?.setText("Arena game is playing");
                }
                else {
                    this.statusText?.setText("No penalty for unstaking");
                }
                if(result && this.inArena) {
                    this.penaltyLabel?.setText(`Leaving early is under ${this.penaltyPercentage}% penalty!`);
                }
                else {
                    this.penaltyLabel?.setText('');
                }
            }
        }
        f();
    }

    private checkIfInArena() {
        let result = false;
        const f = async () => {
            result = await WalletHelper.isArenaPlayer();
            if(this.scene.isActive(this.scene.key)) {
                this.statusText?.setText(
                    "Arena participant: " + (result ? "Yes": "No")
                );
                this.inArena = result;
            }
        }
        f();
    }

    private updateActionButtons(hasApproved) {
        if(hasApproved) {
            if(!this.inArena) {
                this.valueButton?.setVisible(true);
                this.actionButton?.setText("Enter Arena");
                this.statusText?.setText("Enter the amount you want to stake.");
            }
            else {
                this.valueButton?.setVisible(false);
                this.actionButton?.setText("Leave Arena");
                this.statusText?.setText("If you wish to go.");

                this.countdown = 10;
                this.countdownTimer?.remove();
                this.countdownTimer = this.time.addEvent( { delay: 1000, callback: this.updateCountdown, callbackScope: this});
            }
        }
        else {
            this.valueButton?.setVisible(true);
            this.actionButton?.setText("Approve");
            let w = (globalThis.allowance == 0 ? "set" : "increase");
            this.statusText?.setText("Please " + w + " the allowance.");
        }
    }


    private checkIfApproved() {
        let result = false;
        const f = async () => {
            result = await WalletHelper.isArenaApproved(this.toContractAmount());
            if(this.scene.isActive(this.scene.key)) {
                this.hasApproved = result;
                this.updateActionButtons(this.hasApproved);
            }
        }
        f();
    }

    private checkMyStake() {
        let result = "";
        const f = async () => {
            result = await WalletHelper.getMyStake();
            if(this.scene.isActive(this.scene.key)) {
                let v = this.fromContractAmount(result);
                if( v <= 0 ) {
                    v = 10;
                }
                this.inputAmount = v;
                this.previousAmount = v;
                this.nextNumber(0);
            }
        }
        f();
    }

    private approveArena() {
        let status = "";
        if(!this.hasApproved) {
            this.statusText?.setText("Please confirm the transaction");
            const f = async () => {
                status = await WalletHelper.approveForArena(this.toContractAmount());
                if(this.scene.isActive(this.scene.key)) {
                    if(status === "OK") {
                        this.statusText?.setText("Approval successful");
                        this.updateActionButtons(true);
                        this.checkIfApproved();
                    }
                    else if(!status !== undefined) {
                        this.statusText?.setText(status);
                    }

                    this.showCountdown();
                }
            }   
            f();
        }
    }

    private enterArena() {
        let status = "";
        this.statusText?.setText("Please confirm the transaction");
        const f = async () => {
            status = await WalletHelper.enterArena(this.toContractAmount());
            if(this.scene.isActive(this.scene.key)) {
                if( status === "OK" ) {
                    this.statusText?.setText("You entered the Arena.");
                    this.inArena = true;
                    this.updateActionButtons(this.hasApproved);
                    this.updateAll();
                }
                else {
                    this.statusText?.setText(status);
                }

                this.showCountdown();
            }
        }
        f();
    }

    private leaveArena() {
        let status = "";
        this.statusText?.setText("Please confirm the transaction");
        const f = async () => {
            status = await WalletHelper.leaveArena();
            if(this.scene.isActive(this.scene.key)) {
                if( status === "OK" ) {
                    this.statusText?.setText("You left the Arena.");
                    this.inArena = false;
                    this.updateActionButtons(this.hasApproved);
                    this.updateAll();
                }
                else {
                    this.statusText?.setText(status);
                }
                
                this.showCountdown();
            }
        }
        f();
    }


    private formatNumber(n, d, l) {
        return (n / d).toFixed(1) + l;
    }
    


    private toContractAmount() {
        let v = this.inputAmount;

        let s = 1000000000 * v; // input amount is in millions

        return s;
    }

    private fromContractAmount(v) {
        
        let s = v / 1000000000;
        
        return s;
    }

    private nextNumber(direction) {

        let scaledDirection = 1;

        if( this.inputAmount < 1000) {
            scaledDirection = 10;
        }
        else if (this.inputAmount < 1000000 ) {
            scaledDirection = 100;
        }
        else {
            scaledDirection = 1000;
        }

        let v = (scaledDirection * direction);
        if( (this.inputAmount + v) < 0 ) {
            this.inputAmount = 0;
        }
        else {
            this.inputAmount += v;
        }

        if( this.toContractAmount() > globalThis.allowance ) {
            this.hasApproved = false;
            this.updateActionButtons(this.hasApproved);
        }
        else {
            this.hasApproved = (globalThis.allowance > this.toContractAmount() ? true: false);
            this.updateActionButtons(this.hasApproved);
        }
        
        this.valueButton?.setText( this.getUnit(this.inputAmount) + " $MSHOT");

        if(direction != 0 )
            this.removeCountdown(); 
    }

    private handleWheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        
        if(!this.inArena) {
            if (deltaY < 0) {
                this.nextNumber(1);
            }
            else {
                this.nextNumber(-1);
            }
        }
        this.removeCountdown();
    }

    private removeCountdown() {
        this.countdownTimer?.remove();
        this.countdownText?.setVisible(false);
        this.countdown = 0;
    }

    private showCountdown() {
        this.countdown = 8;
        this.countdownText?.setText("" + this.countdown);
        this.countdownText?.setVisible(true);
        this.countdownTimer = this.time.addEvent( { delay: 1000, callback: this.updateCountdown, callbackScope: this});
    }

    private getUnit(v) {
        let s;

        if (v >= 1000000) {
          s = Math.round(v / 10000) / 100;
          s += "T";
        } else if (v >= 1000) {
          s = Math.round(v / 100) / 10;
          s += "B";
        } else {
          s = v;
          s += "M";
        }
        return s;
      }
}