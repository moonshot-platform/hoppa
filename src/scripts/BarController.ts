
import { sharedInstance as events } from './EventManager';
export default class BarController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private name: string;
  
    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        name: string
    ) {
        this.scene = scene;
        this.sprite = sprite;     
        this.name = name;

        events.on( "wakeup-object", this.setInteractive, this);
    }

    private setInteractive() {
        this.sprite.setCollidesWith([1,4]);
    }

    public getSprite() {
        return this.sprite;
    }

    public destroy() {
        this.sprite.destroy();
        
    }
}