import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
import { PlayerStats } from "./PlayerStats";
import * as WalletHelper from '../scripts/WalletHelper';

export default class EnterHallOfFame extends Phaser.Scene {

    private fontface = 'press_start';
    private initials: string[] = ["?", "?", "?"];
    private letterValues: number[] = [0, 0, 0];
    private alphabet: string = "?ABCDEFGHIJKLMNOPQRSTUVWXYZ ";
    private currentInitialIndex: number;
    private lastUpdate: number = 0;
    private bitmapLetters: Phaser.GameObjects.BitmapText[] = [];
    private bitmapCursor!: Phaser.GameObjects.BitmapText;
    private sounds!: Map<string, Phaser.Sound.BaseSound>;

    private title!: Phaser.GameObjects.BitmapText;
    private scoreText!: Phaser.GameObjects.BitmapText;
    private statusText!: Phaser.GameObjects.BitmapText;
    private countdownText!: Phaser.GameObjects.BitmapText;
    private countdown = 0;
    private countdownActive = true;
    private hsv;
    private hsvIndex = 0;
    private spacing = 72;
    private startPosition = 0;

    private sceneEnding = false;

    private isReady: number[] = [0,0,0];
    private touchInputTimer?: Phaser.Time.TimerEvent;

    private info?: PlayerStats;

    constructor() {
        super({ key: 'enter-hall' });
        this.currentInitialIndex = 0;
    }

    init() {
        const data = window.localStorage.getItem('ra8bit.stats');
        if (data != null) {
            const obj = JSON.parse(data);
            this.info = obj as PlayerStats;
        }
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });
        this.sounds = new Map<string, Phaser.Sound.BaseSound>();
    }

    preload() {
        SceneFactory.preload(this);

        this.input.setDefaultCursor('url(assets/hand.cur), pointer');
    }

    create() {
        const { width, height } = this.scale;

        const x = width / 2 - 75;
        const y = height / 2 + 200;
        const score = this.info?.highScorePoints || 0;

        this.startPosition = x;
        this.hsv = Phaser.Display.Color.HSVColorWheel();

        this.sounds = SceneFactory.setupSounds(this);

        this.countdown = 32;
        this.countdownText = this.add.bitmapText(width - 64, height - 64, this.fontface, "" + this.countdown, 22).setOrigin(1, 1).setTint(0x300051);
        this.time.addEvent({ delay: 1000, callback: this.updateCountdown, callbackScope: this });

        this.title = this.add.bitmapText(width / 2, 64, this.fontface, "NEW HIGHSCORE", 82).setTint(0xffff00).setDropShadow(2, 2, 0xff0000, 0.5).setOrigin(0.5, 0);

        this.statusText = this.add.bitmapText(width / 2, height - 64, this.fontface, "", 14).setOrigin(0.5, 0);

        this.scoreText = this.add.bitmapText(width / 2, 196, this.fontface, this.formatScore(score), 72).setOrigin(0.5, 0);

        for (let i = 0; i < 3; i++) {
            const letter: Phaser.GameObjects.BitmapText = this.add.bitmapText(x + i * this.spacing, y, this.fontface, this.initials[i], 72);
            letter.setOrigin(0.5);
            this.bitmapLetters.push(letter);
        }
        this.bitmapCursor = this.add.bitmapText(x, y + 35, this.fontface, "_", 72);
        this.bitmapCursor.setOrigin(0.5, 0.5);

        this.input.keyboard?.on("keydown", this.handleKeyDown, this);

        this.input.on("pointerdown", this.handlePointerDown, this);
        this.input.on("wheel", this.handleWheel, this);
 
        SceneFactory.playSound(this.sounds, 'winneris' );
        this.time.delayedCall( 4000, () => {
            SceneFactory.playSound(this.sounds, 'hiscore');
        }, undefined, this);
    }

    private handleKeyDown(event) {
        const letter = String.fromCharCode(event.keyCode).toUpperCase();

        if (letter >= "A" && letter <= "Z" || letter === "?" || letter === " ") {
            this.updateInitial(letter);
            this.confirmed();
            this.incLetter();
        } else if (event.keyCode === 37) {
            this.decLetter();
            this.unconfirmed();
        } else if (event.keyCode === 39) {
            this.incLetter();
            this.unconfirmed();
        } else if (event.keyCode == 38 ) {
            this.nextLetter( this.currentInitialIndex, -1);
            this.unconfirmed();
        } else if (event.keyCode == 40 ) {
            this.nextLetter( this.currentInitialIndex, 1);
            this.unconfirmed();
        } else if (event.keyCode == 13 ) {
            this.confirmed();
            this.incLetter();
        } else if (event.keyCode == 8 ) {
            this.decLetter();
            this.unconfirmed();
        } else if (event.keyCode == 27) {
            this.endScene();
        }
    }

    handlePointerDown(pointer: Phaser.Input.Pointer) {
        if( pointer.isDown && pointer.wasTouch)
            return; // touch event 

        this.confirmed();
        this.incLetter();
    }

    updateInitial(letter) {
        this.initials[this.currentInitialIndex] = letter;
        this.updateLetters();
    }


    update(time: number, deltaTime: number) {

        const top = this.hsv[this.hsvIndex].color;
        const bottom = this.hsv[359 - this.hsvIndex].color;

        this.hsvIndex++;
        if (this.hsvIndex >= 360)
            this.hsvIndex = 0;

        this.title.setTint(top, bottom, top, bottom);

        if (time < this.lastUpdate)
            return;

        this.lastUpdate = time + 120;

        if (SceneFactory.isGamePadDown(this)) {
            this.nextLetter(this.currentInitialIndex, -1);
        }
        if (SceneFactory.isGamePadUp(this)) {
            this.nextLetter(this.currentInitialIndex, 1);
        }
        if (SceneFactory.isGamePadLeft(this)) {
            this.currentInitialIndex--;
            if (this.currentInitialIndex < 0)
                this.currentInitialIndex = 0;
            this.unconfirmed();
        }
        if (SceneFactory.isGamePadRight(this)) {
            this.currentInitialIndex++;
            if (this.currentInitialIndex > 2)
                this.currentInitialIndex = 2;
            this.unconfirmed();
        }

        if (SceneFactory.gamePadIsButton(this,-1)) {
            this.confirmed();
            this.incLetter();
        }

        if( this.input.activePointer.isDown && this.input.activePointer.wasTouch ) {
            let dir = ( this.input.activePointer.position.y > 0 ? 1 : -1 );
            const index = this.nearestLeter(this.input.activePointer);
            if(index >= 0) {
                this.touchInputNotDone();
                this.nextLetter(index, dir );
                this.confirmedX(index);
                // start 3 second wait timer and accept input if user does not make any changes
                if( this.isInputDone() ) {
                    this.stopCountdown();
                    this.touchInputTimer = this.time.addEvent( { delay : 3000, callback: this.inputDone, callbackScope : this });
                }
            }
        }
        

    }

    destroy() {
        for (let i = 0; i < 3; i++) {
            this.bitmapLetters[i].destroy();
        }
        this.bitmapCursor.destroy();
        this.title.destroy();
        this.countdownText.destroy();
        this.scoreText.destroy();
        this.statusText.destroy();
        SceneFactory.stopSound(this);
        SceneFactory.removeAllSounds(this);
        this.sounds.clear();
        this.isReady[0] = 0;
        this.isReady[1] = 0;
        this.isReady[2] = 0;

        this.touchInputTimer?.remove(false);
        this.touchInputTimer?.destroy();
        this.sceneEnding = false;
    }

    private touchInputNotDone() {
        this.touchInputTimer?.remove(false);
        this.touchInputTimer?.destroy();
        this.touchInputTimer = undefined;
    }

    private handleWheel(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        const index = this.nearestLeter(pointer);
        if(index == -1)
            return;

        if (deltaY < 0) {
            this.nextLetter(index, 1);
        }
        else {
            this.nextLetter(index, -1);
        }
        this.unconfirmedX(index);
    }

    private updateCountdown() {
        this.countdown--;
        if (this.countdown <= 0) {
            this.endScene();
        }
        else {
            if(this.countdownActive) {
                this.time.addEvent({ delay: 1000, callback: this.updateCountdown, callbackScope: this });
            }
        }
        this.countdownText.setText("" + this.countdown);
    }

    private formatScore(x: number) {
        return x.toLocaleString();
    }

    private inputDone() {

        const cd = 10;
        this.countdownText.setVisible(false);
        this.bitmapCursor.setVisible(false);

        this.countdown = cd;
        this.countdownText.setText("" + this.countdown);
        this.time.addEvent({ delay: 1000, callback: this.updateCountdown, callbackScope: this });

        this.statusText.setText( "Please confirm the transaction to save your score");

        if (globalThis.chainId == 56 && !globalThis.noWallet) {
            const saveHighscore = async () => {
                const msg = await WalletHelper.updateHighscore(this.initials.join(""), this.info?.highScorePoints || 0);

                if( this.scene.isActive( 'enter-hall') ) {
                    this.statusText.setText(msg);
                    if ("OK" === msg) {
                        this.statusText.setText("Saved data on chain");
                    }
                    else {
                        this.statusText.setText(msg);
                    }
                    
                }
            };

            saveHighscore();
        }
        else {
            this.statusText.setText("You are not connected to the Binance Smart Chain");
        }
        this.time.delayedCall(cd * 1000, this.endScene, undefined, this);
    }

    private isInputDone() {
        return this.isReady[0] == 1 && this.isReady[1] == 1 && this.isReady[2] == 1;
    }

    private endScene() {
        if(!this.sceneEnding) {
            globalThis.adReturn = "hoppa";
            this.scene.stop();
            this.scene.start('halloffame');
            this.sceneEnding = true;
        }
    }

    private nearestLeter(pointer): number {
        let smallestDistance = 5000;
        let nearestLetter = 0;
        for (let i = 0; i < 3; i++) {
            const d = Phaser.Math.Distance.BetweenPoints(pointer, this.bitmapLetters[i]);
            if (d < smallestDistance) {
                smallestDistance = d;
                nearestLetter = i;
            }
        }

        if (smallestDistance < 35) {
            return nearestLetter;
        }

        return -1;
    }

    private updateLetters() {
        for (let i = 0; i < 3; i++) {
            this.bitmapLetters[i].setText(this.initials[i]);
        }
    }

    private nextLetter(index, direction) {
        this.letterValues[index] += direction;
        if (this.letterValues[index] < 0) {
            this.letterValues[index] = this.alphabet.length - 1
        }
        else if (this.letterValues[index] >= this.alphabet.length) {
            this.letterValues[index] = 0;
        }

        this.initials[index] = this.alphabet.charAt(this.letterValues[index]);
        this.updateLetters();
    }

    private incLetter() {
        this.currentInitialIndex++;
        if (this.currentInitialIndex > 2) {
            this.currentInitialIndex = 2;
        }
        if( this.isInputDone() )
            this.inputDone();
    }

    private decLetter() {
        this.currentInitialIndex--;
        if (this.currentInitialIndex < 0) {
            this.currentInitialIndex = 0; 
        }
        if( this.isInputDone() )
            this.inputDone();
    }

    private stopCountdown() {
        this.countdownActive = false;
        this.countdownText.setText("");
    }

    private confirmed() {
        this.bitmapCursor.setX(this.startPosition + this.currentInitialIndex * this.spacing);
        this.bitmapLetters[this.currentInitialIndex].setTint(0x300051);
        this.bitmapCursor.setTint(0x300051);
        SceneFactory.playSound(this.sounds, 'blip');
        this.isReady[ this.currentInitialIndex ] = 1;
    }

    private confirmedX(index) {
        this.bitmapCursor.setX(this.startPosition + index * this.spacing);
        this.bitmapLetters[index].setTint(0x300051);
        this.bitmapCursor.setTint(0x300051);
        SceneFactory.playSound(this.sounds, 'blip');
        this.isReady[ index ] = 1;
    }

    private unconfirmed() {
        this.bitmapCursor.setX(this.startPosition + this.currentInitialIndex * this.spacing);
        this.bitmapLetters[this.currentInitialIndex].setTint(0xffffff);
        this.bitmapCursor.setTint(0xffffff);
        this.isReady[ this.currentInitialIndex  ] = 0;
    }

    private unconfirmedX(index) {
        this.bitmapCursor.setX(this.startPosition + index * this.spacing);
        this.bitmapLetters[index].setTint(0xffffff);
        this.bitmapCursor.setTint(0xffffff);
        this.isReady[ index  ] = 0;
    }
}