import StateMachine from "./StateMachine";
import { sharedInstance as events } from './EventManager';

export default class DoorController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private sprite2: Phaser.Physics.Matter.Sprite;
    private sprite3: Phaser.Physics.Matter.Sprite;
    private sprite4: Phaser.Physics.Matter.Sprite;
    
    private stateMachine: StateMachine;
    private garbage = false;
    private name: string;
    private moveTime = 0;
    private openTime = 0;
    private closeTime = 0;
    private isOpen = false;
    private interactive = false;

    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        name: string
    ) {
        this.scene = scene;
        this.sprite = sprite;
        this.sprite2 = scene.add.sprite( this.sprite.body.position.x, this.sprite.body.position.y - 5, 'family');
        this.sprite3 = scene.add.sprite( this.sprite.body.position.x - 108, this.sprite.body.position.y, 'stoplight',"Green.webp");
        this.sprite4 = scene.add.sprite( this.sprite.body.position.x - 108, this.sprite.body.position.y, 'stoplight',"Red.webp");
        
        this.sprite2.setFrame(Phaser.Math.Between(0, 299));
        this.sprite2.setVisible(false);
        this.sprite2.setDisplaySize(81,85);
        
        this.sprite3.setVisible(false);
        this.sprite4.setVisible(false);

        this.name = name;
        this.garbage = false;
        this.createAnims();

        this.openTime = Phaser.Math.Between(2,5) * 1000;
        this.closeTime = Phaser.Math.Between(15,20) * 1000;

        this.stateMachine = new StateMachine(this);

        this.stateMachine.addState('idle', {
            onEnter: this.idleOnEnter
        })
        .setState('idle');

        const n = Phaser.Math.Between(0,1);
        if(n == 1) {
            this.closeDoor();
        }
        else {
            this.openDoor();
        }
        events.on( "boss-dies", this.setInteractive, this);
    }

    private setInteractive() {
        this.closeDoor(); 
        this.interactive = true;
    }

    update(deltaTime: number) {
        this.stateMachine.update(deltaTime);

        this.moveTime += deltaTime;
        if(!this.isOpen) {
            if(this.moveTime > this.closeTime) {
                this.openDoor();
            }
        }
        else {
            if(this.moveTime > this.openTime) {
                this.closeDoor();
            }
        }
    }

    private openDoor() {
        this.moveTime = 0;
        this.sprite2.setVisible(true);
        this.sprite3.setVisible(true);
        this.sprite4.setVisible(false);
        
        this.isOpen = true;

        if(this.interactive) {
            this.sprite.setCollidesWith([1,4]);
        }
    }

    private closeDoor() {
        this.moveTime = 0;
        this.sprite2.setVisible(false);
        this.isOpen = false;
        this.sprite4.setVisible(true);
        this.sprite3.setVisible(false);
        
        if(this.interactive) {
            this.sprite.setCollidesWith([6]);
        }
    }

    public getSprite() {
        return this.sprite;
    }

    public destroy() {
        this.sprite.destroy();
        this.sprite2.destroy();
        this.sprite3.destroy();
        this.sprite4.destroy();
    }
  
    private idleOnEnter() {
        this.sprite.play('idle');
    }

    public keepObject() {
        return !this.garbage;
    }

    private createAnims() {
        const n = Phaser.Math.Between(1,6);
        this.sprite.anims.create({
            key: 'idle',
            frameRate: 10,
            repeat: -1,
            frames: this.sprite.anims.generateFrameNames('doors', {
                start: n,
                end: n,
                prefix: 'Door',
                suffix: '.webp'
            })
        });
        
    }
}