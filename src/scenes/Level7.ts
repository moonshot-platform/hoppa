import Phaser from 'phaser'
import ObstaclesController from '../scripts/ObstaclesController';
import PlayerController from '../scripts/PlayerController';
import MonsterController from '../scripts/MonsterController';
import FireController from '../scripts/FireController';
import FlowerController from '../scripts/FlowerController';
import PlantController from '../scripts/PlantController';
import FireWalkerController from '~/scripts/FireWalkerController';
import CrabController from '../scripts/CrabController';
import BirdController from '../scripts/BirdController';
import BatController from '../scripts/BatController';
import DragonController from '../scripts/DragonController';
import BombController from '../scripts/BombController';
import * as SceneFactory from '../scripts/SceneFactory';
import ZeppelinController from '~/scripts/ZeppelinController';
import TNTController from '~/scripts/TNTController';
import BearController from '~/scripts/BearController';
import CrowController from '~/scripts/CrowController';
import FlyController from '~/scripts/FlyController';
import SawController from '~/scripts/SawController';
import { sharedInstance as events } from '../scripts/EventManager';
import BaseScene from './BaseScene';
import BossController from '~/scripts/BossController';
import DoorController from '~/scripts/DoorController';
import NeonController from '~/scripts/NeonController';
import BarController from '~/scripts/BarController';
import { PlayerStats } from './PlayerStats';

export default class Level7 extends BaseScene {

    private info!: PlayerStats;
    private map!: Phaser.Tilemaps.Tilemap;
    private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
    private player?: Phaser.Physics.Matter.Sprite;
    private playerController?: PlayerController;
    private obstaclesController!: ObstaclesController;
    private flowers: FlowerController[] = [];
    private monsters: MonsterController[] = [];
    private fires: FireController[] = [];
    private plants: PlantController[] = [];
    private firewalkers: FireWalkerController[] = [];
    private crabs: CrabController[] = [];
    private birds: BirdController[] = [];
    private bats: BatController[] = [];
    private bombs: BombController[] = [];
    private dragons: DragonController[] = [];
    private zeps: ZeppelinController[] = [];
    private tnts: TNTController[] = [];
    private bears: BearController[] = [];
    private flies: FlyController[] = [];
    private crows: CrowController[] = [];
    private saws: SawController[] = [];
    private boss: BossController[] = [];
    private doors: DoorController[] = [];
    private neon: NeonController[] = [];
    private bars: BarController[] = [];
    private playerX = -1;
    private playerY = -1;
    private spotlight!: Phaser.GameObjects.Light;
    private objects: Phaser.Physics.Matter.Sprite[] = [];
    private sounds!: Map<string, Phaser.Sound.BaseSound>;
    
    private ground1!: Phaser.Tilemaps.TilemapLayer;
    private layer1!: Phaser.Tilemaps.TilemapLayer;

    constructor() {
        super('level7');
    }

    init() {

        super.init();

        this.cursors = this.input.keyboard?.createCursorKeys();

        this.obstaclesController = new ObstaclesController();
        this.monsters = [];
        this.fires = [];
        this.flowers = [];
        this.plants = [];
        this.firewalkers = [];
        this.crabs = [];
        this.birds = [];
        this.bats = [];
        this.dragons = [];
        this.bombs = [];
        this.zeps = [];
        this.bears = [];
        this.tnts = [];
        this.flies = [];
        this.crows = [];
        this.saws = [];
        this.boss = [];
        this.doors = [];
        this.neon = [];
        this.bars = [];
        this.objects = [];
        this.sounds = new Map<string, Phaser.Sound.BaseSound>();

        this.info = {
            'lastHealth': 100,
            'highScorePoints': 0,
            'coinsCollected': 0,
            'carrotsCollected': 0,
            'currLevel': 7,
            'scorePoints': 0,
            'livesRemaining': 3,
            'invincibility': false,
            'speedUp': false,
            'powerUp': false,
            'throw': false,
            'pokeBall': false,
            'voice': false,
        };

        const data = window.localStorage.getItem('ra8bit.stats');
        if (data != null) {
            const obj = JSON.parse(data);
            this.info = obj as PlayerStats;
        }

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });

    }

    preload() {
        this.load.tilemapTiledJSON('tilemap4', 'assets/map4.json');
        
        this.load.atlas('boss', 'assets/boss.webp', 'assets/boss.json');
        this.load.atlas('money', 'assets/money.webp', 'assets/money.json');
        this.load.json( 'money-emitter', 'assets/money-emitter.json' );
        this.load.atlas( 'plof', 'assets/plof.webp', 'assets/plof.json');

        this.load.image('backboss', 'assets/backboss.webp');
        this.load.image('bar', 'assets/bar.webp');
        this.load.image('key', 'assets/key.webp');
        this.load.atlas('stoplight', 'assets/stoplight.webp', 'assets/stoplight.json');
        this.load.atlas('doors', 'assets/doors.webp', 'assets/doors.json');

        this.load.spritesheet('family', 'assets/ra8bittiles128-bg.webp', { frameWidth: 128, frameHeight: 128, startFrame: 0, endFrame: 299 });
        
        this.load.atlas('neon', 'assets/neon.webp', 'assets/neon.json');
        this.load.atlas('neon2', 'assets/neon2.webp', 'assets/neon2.json');

        this.load.audio('demon1', [ 'assets/demon_1.mp3', 'assets/demon_1.m4a']);
        this.load.audio('demon2', [ 'assets/demon_2.mp3', 'assets/demon_2.m4a']);
        this.load.audio('demon3', [ 'assets/demon_3.mp3', 'assets/demon_3.m4a']);
        this.load.audio('demon4', [ 'assets/demon_4.mp3', 'assets/demon_4.m4a']);
        
        this.load.image('trashcan', 'assets/trashcan.webp');
        this.load.image('ra8bits-64-tiles', 'assets/ra8bittiles64.webp');

        SceneFactory.preload(this);
    }

    create() {

        super.create();

        this.sounds = SceneFactory.setupSounds(this);

        this.scene.launch('ui');

        SceneFactory.playRepeatMusic(this, "boss6");

        this.events.on('player-jumped', this.playerJumped, this);

        const { width, height } = this.scale;

        this.scene.scene.add
            .image(0, 128, 'backboss')
            .setOrigin(0, 0)
            .setScrollFactor(1.0)
      
        this.map = this.make.tilemap({ key: 'tilemap4', tileWidth: 64, tileHeight: 64 });
        const groundTiles = this.map.addTilesetImage('ground', 'groundTiles', 64, 64, 0, 2);
        const stonesTiles = this.map.addTilesetImage( 'stones', 'stonesTiles', 64,64,0 ,0);
        const propTiles = this.map.addTilesetImage('props', 'propTiles', 64, 64, 0, 2);
        const ra8bitTiles = this.map.addTilesetImage('ra8bits-64', 'ra8bits-64-tiles', 64, 64, 0, 0);
        
        this.ground1 = this.map.createLayer('ground', [groundTiles, ra8bitTiles,stonesTiles]);
        this.layer1 = this.map.createLayer('layer1', [groundTiles, ra8bitTiles,stonesTiles]);
     
        this.ground1.setCollisionByProperty({ collides: true, recalculateFaces: false });
       
        this.map.createLayer('obstacles', propTiles);
        this.layer1.setDepth(10);

        const playerCat = 2;
        const enemyCat = 4;

        const collideWith = [1, playerCat];

        this.playerX = this.scene.scene.game.registry.get('playerX') || -1;
        this.playerY = this.scene.scene.game.registry.get('playerY') || -1;

        const objectsLayer = this.map.getObjectLayer('objects');
        objectsLayer?.objects.forEach(objData => {

            const { x = 0, y = 0, name, width = 0, height = 0 } = objData;
        
            switch (name) {
                case 'player1-spawn':
                case 'player2-spawn':
                case 'player-spawn': {
                    this.player = SceneFactory.createPlayer(this,
                        (this.playerX == -1 ? x : this.playerX),
                        (this.playerY == -1 ? y : this.playerY),
                        width, height, playerCat);

                    this.playerController = new PlayerController(
                        this,
                        this.player,
                        this.cursors,
                        this.obstaclesController,
                        this.sounds,
                        this.map,
                        this.info
                    );
                    this.playerController.setCollideWith(playerCat);
                    this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
                    this.cameras.main.startFollow(this.player, true);
                    this.cameras.main.setAlpha(1);
                    this.cameras.main.setViewport(0, 0, 1280, 640);
                    this.cameras.main.setZoom(1.0);
                    this.cameras.main.roundPixels = true;

                    break;
                }
                default:
                    break;
            }
        });

        objectsLayer?.objects.forEach(objData => {
            const { x = 0, y = 0, name, width = 0, height = 0, rotation = 0 } = objData;
            switch (name) {
                default:
                    SceneFactory.basicCreate(this, name, x, y, width, height, rotation, enemyCat, collideWith, this.obstaclesController, objData, this.playerController);
                    break;
            }
        });

        this.matter.world.convertTilemapLayer(this.ground1, { label: 'ground', friction: 0, frictionStatic: 0 });
        this.matter.world.setBounds(0,0,this.map.widthInPixels, this.map.heightInPixels, 1, true, true,false, false);

    /*    this.matter.world.drawDebug = false;
        this.input.keyboard.on("keydown-I", () => {
            this.matter.world.drawDebug = !this.matter.world.drawDebug;
            this.matter.world.debugGraphic.clear();
        }); */

        this.matter.world.on("collisionstart", (e: { pairs: any; }, o1: any, o2: any) => {
            const pairs = e.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const bodyA = pairs[i].bodyA;
                const bodyB = pairs[i].bodyB;

                if (bodyA.gameObject === undefined)
                    continue;

                const dx = ~~(bodyA.position.x - bodyB.position.x);
                const dy = ~~(bodyA.position.y - bodyB.position.y);
                const { min, max } = bodyA.bounds;
                const bw = max.x - min.x;
                const bh = (max.y - min.y) * 0.5;

                if (Math.abs(dx) <= bw && Math.abs(dy) <= bh) {
                    events.emit(bodyA.gameObject?.name + '-blocked', bodyA.gameObject);
                }
            }
        });

        this.playerController?.setJoystick(this, width);

        this.spotlight = this.scene.scene.lights
            .addLight(0, 0, 200)
            .setColor(0xFFC0CB)
            .setIntensity(1.5)
            .setVisible(true);

        this.spotlight.x = this.playerController?.getX() || 0;
        this.spotlight.y = this.playerController?.getY() || 0;
    }

    preDestroy() {
        this.obstaclesController.destroy(this);
    }
    
    destroy() {

        super.destroy();

        this.events.off('player-jumped', this.playerJumped, this);

        this.playerController?.destroy();

        this.monsters.forEach(monster => monster.destroy());
        this.fires.forEach(fire => fire.destroy());
        this.plants.forEach(plant => plant.destroy());
        this.flowers.forEach(flower => flower.destroy());
        this.crabs.forEach(crab => crab.destroy());
        this.birds.forEach(bird => bird.destroy());
        this.firewalkers.forEach(firewalker => firewalker.destroy());
        this.bats.forEach(bat => bat.destroy());
        this.dragons.forEach(dragon => dragon.destroy());
        this.bombs.forEach(bomb => bomb.destroy());
        this.zeps.forEach(zep => zep.destroy());
        this.bears.forEach(bear => bear.destroy());
        this.tnts.forEach(tnt => tnt.destroy());
        this.flies.forEach(fly => fly.destroy());
        this.crows.forEach(crow => crow.destroy());
        this.saws.forEach(saw => saw.destroy());
        this.boss.forEach(boss=>boss.destroy());

        this.boss.forEach(boss=>boss.destroy());
        this.neon.forEach(n=>n.destroy());
        this.bars.forEach(b=>b.destroy());
        
        this.ground1.destroy();
        this.layer1.destroy();
        this.map.destroy();

        this.objects.forEach(obj=>obj.destroy());
        
        this.sounds.clear();
    }

    update(time: number, deltaTime: number) {

        super.update(time,deltaTime);

        if(!super.doStep())
            return;
        
        this.bombs = this.bombs.filter(e => e.keepObject());
        this.monsters = this.monsters.filter(e => e.keepObject());
        this.crabs = this.crabs.filter(e => e.keepObject());
        this.birds = this.birds.filter(e => e.keepObject());
        this.firewalkers = this.firewalkers.filter(e => e.keepObject());
        this.bats = this.bats.filter(e => e.keepObject());
        this.dragons = this.dragons.filter(e => e.keepObject());
        this.bears = this.bears.filter(e => e.keepObject());
        this.boss = this.boss.filter(e=>e.keepObject());
      
        this.monsters.forEach(monster => {
            monster.update(deltaTime);
            monster.lookahead(this.map);
        });
        this.fires.forEach(fire => {
            fire.update(deltaTime);
            fire.lookahead(this.map)
        });
        this.firewalkers.forEach(firewalker => {
            firewalker.update(deltaTime);
            firewalker.lookahead(this.map);
        });
        this.zeps.forEach(zep => { 
            zep.update(deltaTime); 
            zep.lookahead(this.map);
        });
        this.flies.forEach(fly => {
            fly.update(deltaTime); 
            fly.lookahead(this.map);
        });
        this.crabs.forEach(crab => {
            crab.update(deltaTime);
            crab.lookahead(this.map);
        });
        this.dragons.forEach(dragon => {
            dragon.update(deltaTime);
            dragon.lookahead(this.map);
        });
        this.crows.forEach(crow => {
            crow.update(deltaTime);
            crow.lookahead(this.map);
        });

        this.flowers.forEach(flower => flower.update(deltaTime));
        this.plants.forEach(plant => plant.update(deltaTime));
        this.birds.forEach(bird => bird.update(deltaTime));
        this.bats.forEach(bat => bat.update(deltaTime));
        this.bombs.forEach(bomb => bomb.update(deltaTime));
        this.bears.forEach(bear => bear.update(deltaTime));
        this.tnts.forEach(tnt => tnt.update(deltaTime));
        this.saws.forEach(saw => {
            saw.update(deltaTime);
            saw.lookahead(this.map);
        });
        this.doors.forEach( door => door.update(deltaTime));

        this.boss.forEach(boss => boss.update(deltaTime));
        this.neon.forEach(n=>n.update(deltaTime));
        
        this.playerController?.update(deltaTime);


        SceneFactory.cullSprites(this);

        this.spotlight.x = this.playerController?.getX() || 0;
        this.spotlight.y = this.playerController?.getY() || 0;
        
    }

    playerJumped() {
        SceneFactory.playSound(this.sounds, 'jump');
    }

}