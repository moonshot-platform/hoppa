import Phaser from "phaser";
import { sharedInstance as events } from "../scripts/EventManager";
import * as SceneFactory from '../scripts/SceneFactory';
export default class Pause extends Phaser.Scene {

    private text!: Phaser.GameObjects.BitmapText;

    constructor() {
        super('pause')
    }

    preload() {
        this.load.bitmapFont('press_start', 'assets/press_start_2p.webp', 'assets/press_start_2p.fnt');
    }

    create() {
        const { width, height } = this.scale;

        this.text = this.add.bitmapText(width * 0.5, height * 0.5, 'press_start', 'GAME PAUSED', 64)
            .setTint(0xff7300)
            .setOrigin(0.5);

    }

    destroy() {
        this.text.destroy();
    }
}