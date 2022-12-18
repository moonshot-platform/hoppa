import StateMachine from "./StateMachine";
import { sharedInstance as events } from './EventManager';
import PlayerController from "./PlayerController";
import AnimatedParticle from "./AnimatedParticle";
import * as SceneFactory from '../scripts/SceneFactory';
import ObstaclesController from "./ObstaclesController";

export default class BossController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    
    private stateMachine: StateMachine;
    private garbage = false;
    private name: string;
    private player: Phaser.Physics.Matter.Sprite = undefined;
    private playerController: PlayerController;
    private moneybag = new Map<string, Phaser.Physics.Matter.Sprite>;

    private emitter: Phaser.GameObjects.Particles.ParticleEmitter;
    private plof: Phaser.GameObjects.Particles.ParticleEmitter;
    private obstacles: ObstaclesController;
    
    private drops:Phaser.Physics.Matter.Sprite[] = [];
    private state = 0;
    private stateDuration = 0;

    private hit1: any;
    private hit2: any;

    private enemyCat: any;
    private collideWith: any;

    private health = 10;
    private healthbg: Phaser.GameObjects.Rectangle
    private healthbar: Phaser.GameObjects.Rectangle;

    private soundSample = [];
    
    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        name: string,
        enemyCat: any,
        collideWith: any,
        playerController: PlayerController,
        obstacles: ObstaclesController,
    ) {
        this.scene = scene;
        this.sprite = sprite;
        this.name = name; scene.add.image
        this.createAnims();
        this.garbage = false;
        this.stateMachine = new StateMachine(this);
        this.player = playerController?.getSprite();
        this.playerController = playerController;
        this.hit1 = SceneFactory.addSound(this.scene, 'hit1', false, false);
        this.hit2 = SceneFactory.addSound(this.scene, 'hit2', false, false );
        this.enemyCat = enemyCat;
        this.obstacles = obstacles;
        this.collideWith = collideWith;
        const p3 = scene.add.particles('money');
        p3.setDepth(20);
        
        this.emitter = p3.createEmitter({
            speed: 250,
            scale: { start: 1, end: 1 },  
            blendMode: '',
            lifespan: 3500,
            gravityY: -6,
            angle: {
                min: -90 - 90,
                max: -45 - 45,
            },
            frequency: -1,
            frame: {  frames: [ "Munney1.webp", "Munney2.webp", "Munney3.webp" ], cycle: false },
        });

        const p4 = scene.add.particles('plof');
        p4.setDepth(12);
        this.plof = p4.createEmitter({
            speed: 1,
            scale: { start: 0.75, end: 1 },  
            blendMode: 'SCREEN',
            alpha: 0.8,
            
            lifespan: 500,
            gravityY: -15,
            angle: {
                min: -45 - 45,
                max: -25 - 25,
            },
            frequency: -1,
            frame: {  frames: [ "plof1.webp", "plof2.webp", "plof3.webp", "plof4.webp", "plof5.webp" ], cycle: false },
            particleClass: AnimatedParticle,
            emitCallbackScope: this,
            emitCallback: (particle) => {
                particle.anim = this.scene.anims.create({
                    key: 'plof',
                    frameRate: 7,
                    repeat: -1,
                    frames: this.sprite.anims.generateFrameNames('plof', {
                        start: 1,
                        end: 5,
                        prefix: 'plof',
                        suffix: '.webp'
                    })
                });
            }
        });
        
        const bw = 128 + 64;
        this.healthbg = this.scene.add.rectangle( this.sprite.x - (bw/2)
            , this.sprite.y + 196, bw, 24 + 2, 0, 0.6 ).setOrigin(0,0);
        this.healthbar = this.scene.add.rectangle( this.sprite.x -(bw/2) + 4
            , this.sprite.y + 196 + 4, bw - 8, 18, 0x00ff00).setOrigin(0,0);
        

        this.soundSample.push( SceneFactory.addSound(this.scene, 'demon1', false, false) );
        this.soundSample.push( SceneFactory.addSound(this.scene, 'demon2', false, false) );
        this.soundSample.push( SceneFactory.addSound(this.scene, 'demon3', false, false) );
        this.soundSample.push( SceneFactory.addSound(this.scene, 'demon4', false, false) );
        
        this.stateMachine.addState('idle', {
            onEnter: this.idleOnEnter
        })
        .addState('dead', {
            onEnter: this.deadOnEnter
        })
        .setState('idle');

        events.on(this.name + '-stomped', this.handleStomped, this);
        events.on(this.name + '-hit', this.handleHit, this);
    }

    private playSound() {
        this.soundSample[ Phaser.Math.Between(0,this.soundSample.length-1) ].play({ volume: globalThis.soundVolume });
    }

    destroy() {
        events.off(this.name + '-stomped', this.handleStomped, this);
        events.off(this.name + '-hit', this.handleHit, this); 
    }

    update(deltaTime: number) {
        this.stateMachine.update(deltaTime);

        if(this.stateMachine.getCurrentState() !== 'idle' || this.player === undefined) {
            return;
        }

        this.moneybag.forEach((bill) => {
            const v = bill.getData('spawned') + 180;
            if( v < this.scene.game.loop.frame) {
                this.moneybag.delete(bill.name);
                bill.destroy();
            }
        });

        if( this.stateDuration > 0) {
            this.stateDuration = this.stateDuration - 1;
        }

        if(this.stateDuration == 0) {
            this.changeState( this.state == 0 || this.state == 2 ? 1 : 0);
        }
    
        if( this.state == 1 && Phaser.Math.Between(0,100) < 15 ) {
          this.moneyDrops();
        }
       
    }

    public getSprite() {
        return this.sprite;
    }

    private idleOnEnter() {
        this.changeState(0);
    }

    private deadOnEnter() {
        this.changeState(3);
    }

    private moneyDrops() {
        const name = 'dollarbill' + this.scene.game.loop.frame;
        const bill = this.scene.matter.add.sprite( Phaser.Math.Between(this.sprite.x - 640,this.sprite.x + 640), this.sprite.y - 320 , 'money',undefined, {
            vertices: [{ x: 16, y: 16 }, { x: 48, y: 16 }, { x: 48, y: 48 }, { x: 16, y: 48 }],
            label: 'dollarbill',
            angle: Phaser.Math.Between(5,55),
            restitution: 1.0,
        });
        
        bill.setFriction(0.0);
        bill.setFrictionAir(0.1);
        bill.setMass(0.01);
        bill.setDepth(16);
        bill.setVelocityY(-10);
        bill.setCollisionCategory(8);
        bill.setCollidesWith([1,2]); //[1, 4]); 
        bill.setName(name);
        bill.setData('type', 'dollarbill');
        bill.setData('spawned', this.scene.game.loop.frame);

        bill.anims.create({
            key: 'idle',
            frameRate: 0.5,
            repeat: -1,
            frames: this.sprite.anims.generateFrameNames('money', {
                start: 1,
                end: 3,
                prefix: 'Munney',
                suffix: '.webp'
            })
        });

        bill.setOnCollide((data: MatterJS.ICollisionPair) => {
            const a = data.bodyB as MatterJS.BodyType;
            const b = data.bodyA as MatterJS.BodyType;
            if(a.label === 'player' || b.label === 'player') {
                this.playerController.takeDamage(5, 'lava');
            }
            bill.setCollidesWith([]);
                
        });

        bill.play( 'idle' );
        this.moneybag.set(name, bill);
    }

    private hitTween(repeats = 8, dies = true) {
        const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
        const endColor = Phaser.Display.Color.ValueToColor(0xff0000);

        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 100,
            repeat: repeats,
            yoyo: true,
            ease: Phaser.Math.Easing.Sine.InOut,
            onUpdate: tween => {
                const value = tween.getValue();
                const colorObject = Phaser.Display.Color.Interpolate.ColorWithColor(
                    startColor,
                    endColor,
                    100,
                    value
                );

                const color = Phaser.Display.Color.GetColor(
                    colorObject.r,
                    colorObject.g,
                    colorObject.b
                );

                this.sprite.setTint(color);
            },
            onComplete: () => {
                if(dies) {
                    this.bossDies();
                }
            },
        });
    }

    private spawnKey() {
        
        SceneFactory.basicCreate(this.scene, 'key', this.sprite.body.position.x, this.sprite.body?.position.y - 64,
            64, 64, 0, this.enemyCat, [0], this.obstacles, null, this);
    }

    private bossDies() {

        events.off(this.name + '-stomped', this.handleStomped, this);
        events.off(this.name + '-hit' , this.handleHit, this);
      
        this.healthbg.setAlpha(0);
        this.healthbar.setAlpha(0);

        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            duration: 2000,
            ease: 'Power2',
            onComplete: () => {
                this.spawnKey();
                this.cleanup();
            }
        });
    }

    private updateHealthBar() {
        const p = this.healthbar.width / 100;
        this.healthbar.displayWidth = Math.floor( this.health * p );
    }

    private handleStomped(boss: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== boss) {
            return;
        }

        if(this.state != 0) {
            this.playerController.takeDamage(25, 'hit');
            return;
        }
        this.garbage = true;
        this.changeState(2);
        this.health -= 10;
        this.updateHealthBar();

        if(this.health <= 0) {
            this.changeState(3);
        }
        
    }

    private handleHit(boss: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== boss) {
            return;
        }

        this.health -= (this.state == 2 ? 5 : 2);
        this.hitTween(0, false);
        this.updateHealthBar();

        if(this.health <= 0) {
            this.changeState(3);
        }
    }

    private cleanup() {
        this.sprite.destroy();
        this.moneybag.forEach((bill) => {
            this.moneybag.delete(bill.name);
            bill.destroy();
        });
    }

    public keepObject() {
        return !this.garbage;
    }

    private createAnims() {
        this.sprite.anims.create({
            key: 'angry',
            frameRate: 10,
            repeat: -1,
            frames: this.sprite.anims.generateFrameNames('boss', {
                start: 1,
                end: 9,
                prefix: 'angry',
                suffix: '.webp'
            })
        });
        this.sprite.anims.create({
            key: 'idle',
            frameRate: 10,
            repeat: -1,
            frames: this.sprite.anims.generateFrameNames('boss', {
                start: 1,
                end: 4,
                prefix: 'idle',
                suffix: '.webp'
            })
        });

        this.sprite.anims.create({
            key: 'hit',
            frameRate: 8,
            repeat: -1,
            frames: this.sprite.anims.generateFrameNames('boss', {
                start: 1,
                end: 8,
                prefix: 'hit',
                suffix: '.webp'
            })
        });
      
        this.sprite.on(Phaser.Animations.Events.ANIMATION_UPDATE, function(anim,frame,sprite,frameKey) {
            switch(frameKey) {
                case 'angry4.webp':
                    this.emitter.emitParticle(Phaser.Math.Between(3, 7),  this.sprite.body.position.x -64, this.sprite.body.position.y - 32);
                    break;
                case 'angry6.webp':
                    this.emitter.emitParticle(Phaser.Math.Between(3, 7),  this.sprite.body.position.x + 64, this.sprite.body.position.y - 32);
                    break;
                case 'angry7.webp':
                    this.hit1.play({ volume: globalThis.soundVolume });
                    this.scene.cameras.main.shake(100,0.02);
                    this.plof.emitParticle(1,  this.sprite.body.position.x - 48, this.sprite.body.position.y + 88);
                    this.plof.emitParticle(1,  this.sprite.body.position.x + 48, this.sprite.body.position.y + 88);
                    break;
                case 'angry5.webp':
                case 'angry1.webp': 
                    this.scene.cameras.main.shake(100,0.01);    
                    this.hit2.play({ volume: globalThis.soundVolume });
                    break;
                case 'idle1.webp':
                    this.playSound();
                    break;
            }
        }, this );      
    }

    private changeState(newState: number) {

        if(this.state == newState)
            return;

        switch(newState) {
            case 0:
                this.sprite.play('idle');
                this.stateDuration = 30 * 8;
                break;
            case 1:
                this.sprite.play('angry');
                this.stateDuration = 30 * 16;
                break;
            case 2:
                this.sprite.play('hit');
                this.stateDuration = 60;
                break;
            case 3:
                this.hitTween();
                this.sprite.play('hit');
                this.sprite.setCollidesWith([]);
                this.stateDuration = 1000000;
                events.emit( "boss-dies" );
                
                SceneFactory.stopSound(this.scene);
                SceneFactory.playRandomMusic(this.scene);

                break;
        }
        this.state = newState;
    }

}