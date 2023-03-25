import Phaser from 'phaser'

export default class BillBoard {

    private sprite: Phaser.Physics.Matter.Sprite;
    private frame = 0;

    constructor(scene: Phaser.Scene, sprite: Phaser.Physics.Matter.Sprite) {
        this.sprite = sprite;

        this.frame = Phaser.Math.Between(0, 34);

        this.sprite.setData('type', 'billboard');

        this.sprite.setFrame(this.frame);

        const delay = 27 + Phaser.Math.Between(3,7);

        scene.time.addEvent({ delay: delay * 1000, callback: this.rotateBillBoard, callbackScope: this, loop: true });
    }

    public rotateBillBoard() {
        this.sprite.setFrame((this.frame + 1) % 34);
    }

    public destroy() {
        this.sprite.destroy();
    }

}