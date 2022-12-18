export default class NeonController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private onTime = 0;
    private powerSurge = 0;
    private name: string;
  
    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        name: string
    ) {
        this.scene = scene;
        this.sprite = sprite;
     
        this.name = name;
        this.createAnims();
        this.sprite.play('idle');

        this.newSurge();

    }

    private newSurge() {
        this.onTime = 0;
        this.powerSurge = Phaser.Math.Between( 1000, 5000 );
    }

    public getSprite() {
        return this.sprite;
    }

    public destroy() {
        this.sprite.destroy();
    }

    public update(deltaTime: number) {
        this.onTime += deltaTime;
        if(this.onTime > this.powerSurge) {
            this.sprite.play('flicker');
            this.newSurge();
            this.scene.time.delayedCall( 100, () => {
                this.sprite.play('idle');
            })
        }
        
    }

    private createAnims() {
        this.sprite.anims.create({
            key: 'idle',
            frameRate: 15,
            repeat: 0,
            frames: this.sprite.anims.generateFrameNames(this.name, {
                start: 0,
                end: 1,
                prefix: 'neon-',
                suffix: '.webp'
            })
            
        });
        this.sprite.anims.create({
            key: 'flicker',
            frameRate: 15,
            repeat: 6,
            frames: this.sprite.anims.generateFrameNames(this.name, {
                start: 0,
                end: 1,
                prefix: 'neon-',
                suffix: '.webp'
            })
            
        });
    }
}