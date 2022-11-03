import Phaser, { Tilemaps } from 'phaser'
import PlayerController from './PlayerController';
import { sharedInstance as events } from './EventManager';

export default class ChangeSkin {

    private sprite: Phaser.Physics.Matter.Sprite;
    private scene: Phaser.Scene;

    private name: string;

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite, name: string) {
        this.sprite = sprite;
        this.scene = scene;
        this.sprite.setData('type', 'changeskin');
        this.sprite.setName('changeskin');
        this.name = name;

        events.on(this.name + '-touched', this.handleTouched, this);
    }

    destroy() {
        events.off(this.name + '-touched', this.handleTouched, this);
    }

    private handleTouched(lightswitch: Phaser.Physics.Matter.Sprite, player: PlayerController) {
        if (this.sprite !== lightswitch) {
            return;
        }

        if (player.name === 'player1') {
            player.name = 'player2';
        }
        else if (player.name === 'player2') {
            player.name = 'player1';
        }
    }

}