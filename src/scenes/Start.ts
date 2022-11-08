import Phaser from "phaser";
import ObstaclesController from "~/scripts/ObstaclesController";
import * as SceneFactory from '../scripts/SceneFactory';
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
import { sharedInstance as events } from '../scripts/EventManager';
import ZeppelinController from "~/scripts/ZeppelinController";
import TNTController from '~/scripts/TNTController';
import BearController from '~/scripts/BearController';
import CrowController from '~/scripts/CrowController';
import FlyController from '~/scripts/FlyController';
import SawController from "~/scripts/SawController";
import * as AlignmentHelper from '../scripts/AlignmentHelper';

export default class Start extends Phaser.Scene {
    constructor() {
        super({ key: 'start' });
    }

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
    private index: number = 0;
    private hsv;
    private shoutout !: Phaser.GameObjects.BitmapText;
    private credits !: Phaser.GameObjects.BitmapText;
    private goFS: boolean = false;

    init() {

        if (this.sys.game.device.fullscreen.available) {
            this.goFS = true;
        }

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
        this.bears = [];
        this.tnts = [];
        this.flies = [];
        this.crows = [];
        this.saws = [];

        let info = {
            'lastHealth': 100,
            'coinsCollected': 0,
            'carrotsCollected': 0,
            'currLevel': 1,
            'scorePoints': 0,
            'livesRemaining': 3,
        };
        let data = JSON.stringify(info);
        window.localStorage.setItem('ra8bit.stats', data); 

    }

    preload() {
        SceneFactory.preload(this);

        this.load.tilemapTiledJSON('start', 'assets/start.json');
    }

    create() {

        if(this.goFS && !this.scale.isFullscreen) {
          try {
            this.scale.startFullscreen();
          } catch(e) { }       
        }

        this.hsv = Phaser.Display.Color.HSVColorWheel();

        const { width, height } = this.scale;

        const map1 = this.make.tilemap({ key: 'start', tileWidth: 64, tileHeight: 64 });
        const groundTiles = map1.addTilesetImage('ground', 'groundTiles', 64, 64, 0, 2);
        const ra8bitTiles = map1.addTilesetImage('minira8bits', 'ra8bitTiles', 64, 64, 0, 2);
        const ground = map1.createLayer('ground', [groundTiles, ra8bitTiles]);

        ground.setCollisionByProperty({ collides: true, recalculateFaces: false });

        const objectsLayer = map1.getObjectLayer('objects');
        objectsLayer.objects.forEach(objData => {
            const { x = 0, y = 0, name, width = 0, height = 0, rotation = 0 } = objData;
            switch (name) {

                default:
                    SceneFactory.basicCreate(this, name, x, y, width, height, rotation, 4, [1], this.obstaclesController, objData, undefined);
                    break;
            }
        })
        this.matter.world.convertTilemapLayer(ground, { label: 'ground', friction: 0, frictionStatic: 0 });


        this.matter.world.setBounds(0, 0, map1.widthInPixels, map1.heightInPixels);
        this.cameras.main.setBounds(0, -308, map1.widthInPixels, map1.heightInPixels);
        this.cameras.main.setAlpha(1);
        this.cameras.main.setZoom(0.5);
        this.cameras.main.roundPixels = true;
        this.matter.world.drawDebug = false;

        this.matter.world.on("collisionstart", (e: { pairs: any; }, o1: any, o2: any) => {
            var pairs = e.pairs;
            for (var i = 0; i < pairs.length; i++) {
                let bodyA = pairs[i].bodyA;
                let bodyB = pairs[i].bodyB;

                let dx = ~~(bodyA.position.x - bodyB.position.x);
                let dy = ~~(bodyA.position.y - bodyB.position.y);

                if (Math.abs(dx) <= 64 && dy == 0) {
                    events.emit(bodyA.gameObject?.name + '-blocked', bodyA.gameObject);
                }
            }
        });

        SceneFactory.playRepeatMusic(this, 'theme');

        this.tweens.timeline({
            tweens: [
                {
                    targets: this.cameras.main,
                    scrollX: 80 * 64,
                    delay: 0,
                    ease: 'Sine.easeInOut',
                    duration: 5000,
                    yoyo: true,
                    repeat: -1,
                    loop: -1,
                    repeatDelay: 0,
                    hold: 500,
                    offset: 0, //1279,
                }
            ]
        });

        this.input.on('pointerdown', () => { this.continueGame(); });
        this.input.on('keydown', () => { this.continueGame(); });

        let cam = this.cameras.add(0, 0, width, 128);

        const layer = this.add.layer();
// -256, -220, 216
        this.shoutout = this.add.bitmapText(width / 2, -400, 'press_start',
            'PRESS SPACE TO PLAY', 24).setTint(0xff7300).setOrigin(0.5, 0.5);

        this.credits = this.add.bitmapText(320 + 640, -350, 'press_start',
            'Written by c0ntrol zero, Artwork by Pixel8it, Storyline by Dandybanger, C 2022 Ra8bits, C 2022 Moonshot', 12).setTint(0xff7300).setOrigin(0.5, 0.5);
        this.credits.setDropShadow(0, 2, 0xff0000, 0.5);

        cam.startFollow(this.shoutout);
        cam.setFollowOffset(0, -216);
        cam.setViewport(320, 0, 640, 512);

        cam.roundPixels = true;

        this.tweens.timeline({
            tweens: [
                {
                    targets: this.credits,
                    x: 320,
                    delay: 0,
                    ease: 'Sine.easeInOut',
                    duration: 3000,
                    repeat: -1,
                    yoyo: true,
                    offset: 0
                }
            ]
        });

        localStorage.removeItem('player-position');
    }

    private continueGame() {
        this.game.sound.stopAll();
        if(globalThis.noWallet || (globalThis.moonshotBalance == 0 && globalThis.ra8bitBalance == 0) )
            this.scene.start('wallet');
        else
            this.scene.start('level1');
    }

    destroy() {

        this.input.off('pointerdown', () => { this.continueGame(); });
        this.input.off('keydown', () => { this.continueGame(); });

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
        this.obstaclesController.destroy();
        this.shoutout.destroy();
        this.credits.destroy();

    }

    update(time: number, deltaTime: number) {
        this.monsters.forEach(monster => monster.update(deltaTime));
        this.fires.forEach(fire => fire.update(deltaTime));
        this.flowers.forEach(flower => flower.update(deltaTime));
        this.plants.forEach(plant => plant.update(deltaTime));
        this.crabs.forEach(crab => crab.update(deltaTime));
        this.birds.forEach(bird => bird.update(deltaTime));
        this.firewalkers.forEach(firewalker => firewalker.update(deltaTime));
        this.bats.forEach(bat => bat.update(deltaTime));
        this.dragons.forEach(dragon => dragon.update(deltaTime));
        this.bombs.forEach(bomb => bomb.update(deltaTime));
        this.zeps.forEach(zep => zep.update(deltaTime));
        this.bears.forEach(bear => bear.update(deltaTime));
        this.tnts.forEach(tnt => tnt.update(deltaTime));
        this.flies.forEach(fly => fly.update(deltaTime));
        this.crows.forEach(crow => crow.update(deltaTime));
        this.saws.forEach(saw => saw.update(deltaTime));

        let top = this.hsv[this.index].color;
        let bottom = this.hsv[359 - this.index].color;
        let top2 = this.hsv[(this.index + 45) % 360].color;
        let bottom2 = this.hsv[(359 - this.index + 45) % 360].color;

        this.shoutout.setTint(top, bottom, top, bottom);

        this.index++;
        if (this.index >= 360)
            this.index = 0;

        SceneFactory.cullSprites(this);

    }
}
