import Phaser, { Tilemaps } from 'phaser'

export default class BillBoard {

    private sprite: Phaser.Physics.Matter.Sprite;
    private frame: number = 0;

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
        this.sprite = sprite;

        this.frame = Phaser.Math.Between(0, 14);

        this.sprite.setData('type', 'billboard');

        this.sprite.setFrame(this.frame);

        scene.time.addEvent({ delay: 30 * 1000, callback: this.rotateBillBoard, callbackScope: this, loop: true });
    }

    public rotateBillBoard() {
        this.sprite.setFrame((this.frame + 1) % 14);
    }

}