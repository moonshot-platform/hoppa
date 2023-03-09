import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';
import { Slider } from 'phaser3-rex-plugins/templates/ui/ui-components.js';
import { GameSettings } from "./GameSettings";

export default class GameSettingsMenu extends Phaser.Scene {

    private soundVolume!: Slider;
    private musicVolume!: Slider;
    private info!: GameSettings;

    private soundLabel!: Phaser.GameObjects.BitmapText;
    private musicLabel!: Phaser.GameObjects.BitmapText;
    private backLabel!: Phaser.GameObjects.BitmapText;

    private soundSample!: Phaser.Sound.BaseSound;
    private musicSample!: Phaser.Sound.BaseSound;
    private previousSoundVolume: number = 0;
    private previousMusicVolume: number = 0;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
    private arrow?:Phaser.GameObjects.Image;
    private activeItem: number = 0;

    private arrowY: number = 460;
    private arrowX: number = 400;
    private lastUpdate: number = 0;

    constructor() {
        super('options');

        this.info = { soundVolume: 1.0, musicVolume: 0.5 };
    }

    preload() {
        SceneFactory.preload(this);

        this.load.image('arrow', 'assets/arrow.webp');

        let data = window.localStorage.getItem('ra8bit.audio');

        if (data != null) {
            let obj = JSON.parse(data);
            this.info = obj as GameSettings;
        }

        if (this.info?.musicVolume === undefined) {
            this.info.musicVolume = 0.5;
        }
        if (this.info?.soundVolume === undefined) {
            this.info.soundVolume = 1.0;
        }

        globalThis.musicVolume = this.info.musicVolume;
        globalThis.soundVolume = this.info.soundVolume;

        this.previousSoundVolume = globalThis.soundVolume;
        this.previousMusicVolume = globalThis.musicVolume;
    }

    saveSettings() {

        this.info.musicVolume = globalThis.musicVolume;
        this.info.soundVolume = globalThis.soundVolume;

        let data = JSON.stringify(this.info);
        window.localStorage.setItem('ra8bit.audio', data);
    }

    playSound() {
        this.soundSample.play({ volume: globalThis.soundVolume, delay: 0.2 });
    }

    playMusic() {
        this.musicSample.play({ volume: globalThis.musicVolume });
    }

    create() {

        const { width, height } = this.scale;

        this.input.setDefaultCursor('url(assets/hand.cur), pointer');

        SceneFactory.setupSounds(this);

        this.soundSample = SceneFactory.addSound(this, 'jump', false, false);
        this.musicSample = SceneFactory.addSound(this, 'theme', false, false);

        this.add.image(width / 2, 128, 'logo').setDisplaySize(306, 131).setOrigin(0.5);

        //this.createArrow();

        this.soundVolume = new Slider(this, {
            x: width / 2,
            y: 300,
            width: 500,
            height: 48,
            orientation: 'x',
            value: globalThis.soundVolume,
            background: this.add.rectangle(0, 0, 200, 20, 0x222b5c),
            track: this.add.rectangle(0, 0, 180, 16, 0x004fa0),
            thumb: this.add.rectangle(100, 0, 64, 64, 0x99b0be),
            valuechangeCallback: function (value) {
                globalThis.soundVolume = value;

            },
            space: {
                top: 4,
                bottom: 4
            },
            enable: true,
            input: 'drag',
        }).layout();

        this.add.existing(this.soundVolume);
        this.soundLabel = this.add.bitmapText(width / 2, 240, 'press_start', 'Sound Volume', 24)
            .setTint(0xffffff)
            .setOrigin(0.5, 0.1)
            .setInteractive()
            .on( 'pointerdown', () => {this.highlightActive(0); } )
            .on( 'pointerup', () => {  });

        this.musicVolume = new Slider(this, {
            x: width / 2,
            y: 500,
            width: 500,
            height: 48,
            orientation: 'x',
            value: globalThis.musicVolume,
            background: this.add.rectangle(0, 0, 200, 20, 0x222b5c),
            track: this.add.rectangle(0, 0, 180, 16, 0x004fa0),
            thumb: this.add.rectangle(100, 0, 64, 64, 0x99b0be),
            valuechangeCallback: function (value) {
                globalThis.musicVolume = value;
            },
            space: {
                top: 4,
                bottom: 4
            },
            enable: true,
            input: 'drag',
        }).layout();

        this.musicLabel = this.add.bitmapText(width / 2, 440, 'press_start', 'Music Volume', 24)
            .setTint(0xffffff)
            .setOrigin(0.5, 0.1)
            .setInteractive()
            .on( 'pointerdown', () => { this.highlightActive(1);  })
            .on( 'pointerup', () => { });

        this.add.existing(this.musicVolume);

        this.backLabel = this.add.bitmapText(width / 2, 620, 'press_start', 'Back', 32).setOrigin(0.5).setTint(0xffffff);
        this.backLabel.setInteractive({ cursor: 'pointer' })
            .on('pointerup', () => {
                this.continueGame();
            })
            .on('pointerdown', () => {
                this.highlightActive(2);
            });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.saveSettings();
        });

        this.previousSoundVolume = globalThis.soundVolume;
        this.previousMusicVolume = globalThis.musicVolume;
    }

    private highlightActive(active) {
        switch(active) {
            case 0:
                this.soundLabel.setTint(0xff7300);
                this.musicLabel.setTint(0xffffff);
                this.backLabel.setTint(0xffffff);
                break;
            case 1:
                this.soundLabel.setTint(0xffffff);
                this.musicLabel.setTint(0xff7300);
                this.backLabel.setTint(0xffffff);
                break;
            case 2:
                this.soundLabel.setTint(0xffffff);
                this.musicLabel.setTint(0xffffff);
                this.backLabel.setTint(0xff7300);
                break;           
        }
        this.activeItem = active;
    }

    update(time, delta) {

       
        if( time < this.lastUpdate ) 
            return;

        let haveArrow = false;

        if( SceneFactory.isGamePadActive(this) ) {
            haveArrow = true;
        }

        this.lastUpdate = time + 120; 

        if(this.cursors?.down.isDown || SceneFactory.isGamePadUp(this)) {
            this.activeItem --;
        }
        else if(this.cursors?.up.isDown || SceneFactory.isGamePadDown(this)) {
            this.activeItem ++;
        }
        else if(this.cursors?.shift.isDown || this.cursors?.space.isDown || SceneFactory.gamePadAnyButton(this) ) { 
            switch(this.activeItem) {
                case 2:
                    this.continueGame();
                    break;    
                case 0:
                    this.playSound();
                    break;
                case 1:
                    this.playMusic();
                    break;
            }
        }
        else if( SceneFactory.isGamePadRight(this) || this.cursors?.right.isDown) {
            switch(this.activeItem) {
                case 0: {
                    let vv = this.soundVolume.getValue();
                    vv += 0.05;
                    if( vv > 1.0) vv = 1.0;
                    this.soundVolume.setValue(vv);
                    break;
                }
                case 1: {
                    let vv = this.musicVolume.getValue();
                    vv += 0.05;
                    if( vv > 1.0) vv = 1.0;
                    this.musicVolume.setValue(vv);
                    break;
                }
            }
        }
        else if( SceneFactory.isGamePadLeft(this) || this.cursors?.left.isDown ) {
            switch(this.activeItem) {
                case 0: {
                    let vv = this.soundVolume.getValue();
                    vv -= 0.05;
                    if( vv > 1.0) vv = 1.0;
                    this.soundVolume.setValue(vv);
                    break;
                }
                case 1: {
                    let vv = this.musicVolume.getValue();
                    vv -= 0.05;
                    if( vv > 1.0) vv = 1.0;
                    this.musicVolume.setValue(vv);
                    break;
                }
            }
        }

        if( this.activeItem < 0 ) { 
            this.activeItem = 2;
        } else if (this.activeItem > 2 ) {
            this.activeItem = 0;
        }
    
        this.highlightActive(this.activeItem);
        
        if(haveArrow) {
            this.arrow?.setVisible(true);
            this.arrow?.setPosition( this.arrowX, this.arrowY + (64 * this.activeItem) );
        }
        else {
            this.arrow?.setVisible(false);
        }

        if (this.previousSoundVolume != globalThis.soundVolume) {
            this.previousSoundVolume = globalThis.soundVolume;
            this.playSound();
        }
        if (this.previousMusicVolume != globalThis.musicVolume) {
            this.previousMusicVolume = globalThis.musicVolume;
            this.playMusic();
        }

    }

    destroy() {
        this.soundLabel.destroy();
        this.musicLabel.destroy();
        this.backLabel.destroy();
    }

    continueGame() {
        this.musicSample.stop();
        this.soundSample.stop();
        this.scene.stop();
        this.scene.start('hoppa');
    }

    createArrow() {
        this.arrow = this.add.image(this.arrowX, this.arrowY, 'arrow' );
        this.arrow.setRotation(30);
        this.arrow.setVisible(false);
    }
}
