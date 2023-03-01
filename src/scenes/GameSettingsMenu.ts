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

    constructor() {
        super('options');

        this.info = { soundVolume: 1.0, musicVolume: 0.5 };
    }

    preload() {
        SceneFactory.preload(this);

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
            .setTint(0xff7300)
            .setOrigin(0.5, 0.1);

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
            .setTint(0xff7300)
            .setOrigin(0.5, 0.1);

        this.add.existing(this.musicVolume);

        this.backLabel = this.add.bitmapText(width / 2, 620, 'press_start', 'Back', 32).setOrigin(0.5);
        this.backLabel.setInteractive({ cursor: 'pointer' })
            .on('pointerup', () => {
                this.backLabel.setTint(0x222b5c);
                this.continueGame();
            })
            .on('pointerdown', () => {
                this.backLabel.setTint(0x99b0be);
            });

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.saveSettings();
        });

        this.previousSoundVolume = globalThis.soundVolume;
        this.previousMusicVolume = globalThis.musicVolume;
    }

    update(time, delta) {

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
}
