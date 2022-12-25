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
import LightSwitchController from '~/scripts/LightSwitchController';

export default class Bonus extends Phaser.Scene {

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
    private lightswitches: LightSwitchController[] = [];
    private objects: Phaser.Physics.Matter.Sprite[] = [];
    private ground!: Phaser.Tilemaps.TilemapLayer;
    private layer1!: Phaser.Tilemaps.TilemapLayer;
    private introMusic!: Phaser.Sound.BaseSound;

    private playerX = -1;
    private playerY = -1;

    private sounds!: Map<string, Phaser.Sound.BaseSound>;

    constructor() {
        super('bonus');
    }

    init() {

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
        this.lightswitches = [];
        this.sounds = new Map<string, Phaser.Sound.BaseSound>();
        this.objects = [];
        this.info = {
            'lastHealth': 100,
            'coinsCollected': 0,
            'carrotsCollected': 0,
            'currLevel': 1,
            'scorePoints': 0,
            'livesRemaining': 3,
            'invincibility': false,
            'powerUp': false,
            'speedUp': false,
            'throw': false,
        };

        const data = window.localStorage.getItem('ra8bit.stats');
        if (data != null) {
            const obj = JSON.parse(data);
            this.info = obj as PlayerStats;
        }

    }

    preload() {
        SceneFactory.preload(this);
        this.load.image('ra8bittiles128-bg', 'assets/ra8bittiles128-bg.webp');
        this.load.tilemapTiledJSON('tilemap-bonus', 'assets/ra8bit1-map.json');
        this.load.image('ra8bits-64-tiles', 'assets/ra8bittiles64.webp');
    }

    create() {

        this.introMusic = SceneFactory.playRepeatMusic(this, 'angel-eyes');

        this.lights.enable().setAmbientColor(0x333333);

        this.sounds = SceneFactory.setupSounds(this);

        this.scene.launch('ui');

        this.events.on('player-jumped', this.playerJumped, this);

        const { width, height } = this.scale;

        this.map = this.make.tilemap({ key: 'tilemap-bonus', tileWidth: 64, tileHeight: 64 });

        const totalWidth = this.map.widthInPixels;
        const s = 1;
        const bg = this.add
            .image(totalWidth / 2, 0, "ra8bittiles128-bg")
            .setOrigin(0.5, 0)
            .setScale(s)
            .setAlpha(0.5);

        bg.setPipeline('Light2D');

        const groundTiles = this.map.addTilesetImage('ground', 'groundTiles', 64, 64, 0, 2);
        const propTiles = this.map.addTilesetImage('props', 'propTiles', 64, 64, 0, 2);
        const ra8bitTiles = this.map.addTilesetImage('ra8bits-64', 'ra8bits-64-tiles', 64, 64, 0, 0);
        this.ground = this.map.createLayer('ground', [groundTiles, ra8bitTiles]);
        this.layer1 = this.map.createLayer('layer1', [groundTiles, ra8bitTiles]);
        this.ground.setCollisionByProperty({ collides: true, recalculateFaces: false });

        this.map.createLayer('obstacles', propTiles);
        this.layer1.setDepth(10);

        const playerCat = 2;
        const enemyCat = 4;
        
        const collideWith = [1, playerCat];

        this.playerX = this.scene.scene.game.registry.get('playerX') || -1;
        this.playerY = this.scene.scene.game.registry.get('playerY') || -1;

        const objectsLayer = this.map.getObjectLayer('objects');
        objectsLayer.objects.forEach(objData => {

            const { x = 0, y = 0, name, width = 0, height = 0, rotation = 0 } = objData;
           

            switch (name) {
                case 'player1-spawn':
                case 'player2-spawn':
                case 'player-spawn':
                    {
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

                        this.cameras.main.setViewport(0, 0, 1280, 640);
                        this.cameras.main.setZoom(1.0);
                        this.cameras.main.roundPixels = true;
                        break;
                    }
                default:
                    break;
            }

        });

        objectsLayer.objects.forEach(objData => {
            const { x = 0, y = 0, name, width = 0, height = 0, rotation = 0 } = objData;
            switch (name) {
                default:
                    SceneFactory.basicCreate(this, name, x, y, width, height, rotation, enemyCat, collideWith, this.obstaclesController, objData, this.playerController);
                    break;
            }
        });

        this.lightswitches.forEach((l) => { l.setLayers([this.ground, this.layer1]) });

        this.matter.world.convertTilemapLayer(this.ground, { label: 'ground', friction: 0, frictionStatic: 0 });
        this.matter.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);

/*        this.matter.world.drawDebug = false;
        this.input.keyboard.on("keydown-I", (event) => {
            this.matter.world.drawDebug = !this.matter.world.drawDebug;
            this.matter.world.debugGraphic.clear();
        });*/

        this.matter.world.on("collisionstart", (e: { pairs: any; }, o1: any, o2: any) => {
            const pairs = e.pairs;
            for (let i = 0; i < pairs.length; i++) {
                const bodyA = pairs[i].bodyA;
                const bodyB = pairs[i].bodyB;

                const dx = ~~(bodyA.position.x - bodyB.position.x);
                const dy = ~~(bodyA.position.y - bodyB.position.y);

                if (Math.abs(dx) <= 64 && dy == 0) {
                    events.emit(bodyA.gameObject?.name + '-blocked', bodyA.gameObject);
                }
            }
        });

        this.playerController?.setJoystick(this, width);
    }

    preDestroy() {
        this.obstaclesController.destroy(this);
    }

    destroy() {

        this.introMusic.destroy();
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
        this.lightswitches.forEach(l => l.destroy());
        this.objects.forEach(obj=>obj.destroy());

        this.ground.destroy();
        this.layer1.destroy();
        
        
        this.map.destroy();
        
        SceneFactory.stopSound(this);
        SceneFactory.removeAllSounds(this);
        
    }

    update(time: number, deltaTime: number) {

        this.bombs = this.bombs.filter(e => e.keepObject());
        this.monsters = this.monsters.filter(e => e.keepObject());
        this.crabs = this.crabs.filter(e => e.keepObject());
        this.birds = this.birds.filter(e => e.keepObject());
        this.firewalkers = this.firewalkers.filter(e => e.keepObject());
        this.bats = this.bats.filter(e => e.keepObject());
        this.dragons = this.dragons.filter(e => e.keepObject());
        this.bears = this.bears.filter(e => e.keepObject());
        this.crows = this.crows.filter(e => e.keepObject());

        this.monsters.forEach(monster => {
            monster.update(deltaTime);
            monster.lookahead(this.map);
        });
        this.fires.forEach(fire => {
            fire.update(deltaTime);
            fire.lookahead(this.map)
        });
        this.flowers.forEach(flower => flower.update(deltaTime));
        this.plants.forEach(plant => plant.update(deltaTime));
        this.crabs.forEach(crab => {
            crab.update(deltaTime);
            crab.lookahead(this.map);
        });
        this.birds.forEach(bird => bird.update(deltaTime));
        this.firewalkers.forEach(firewalker => {
            firewalker.update(deltaTime);
            firewalker.lookahead(this.map);
        });
        this.bats.forEach(bat => bat.update(deltaTime));
        this.dragons.forEach(dragon => {
            dragon.update(deltaTime);
            dragon.lookahead(this.map);
        });
        this.bombs.forEach(bomb => bomb.update(deltaTime));
        this.zeps.forEach(zep => zep.update(deltaTime));
        this.bears.forEach(bear => bear.update(deltaTime));
        this.tnts.forEach(tnt => tnt.update(deltaTime));
        this.flies.forEach(fly => fly.update(deltaTime));
        this.crows.forEach(crow => crow.update(deltaTime));
        this.saws.forEach(saw => {
            saw.update(deltaTime);
            saw.lookahead(this.map);
        });

        if (this.playerController !== undefined) {
            this.playerController.update(deltaTime);
            this.lightswitches.forEach(l => {
                l.update(deltaTime);
            });
        }

        SceneFactory.cullSprites(this);
    }

    playerJumped() {
        SceneFactory.playSound(this.sounds, 'jump');
    }

}
