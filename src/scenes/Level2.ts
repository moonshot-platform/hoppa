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
import * as AlignmentHelper from '../scripts/AlignmentHelper';
import ZeppelinController from '~/scripts/ZeppelinController';
import TNTController from '~/scripts/TNTController';
import BearController from '~/scripts/BearController';
import CrowController from '~/scripts/CrowController';
import FlyController from '~/scripts/FlyController';
import SawController from '~/scripts/SawController';
import { sharedInstance as events} from '../scripts/EventManager';

export default class Level2 extends Phaser.Scene {

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
  
    private playerX: number = -1;
    private playerY: number = -1;

    private sounds!: Map<string, Phaser.Sound.BaseSound>;

    constructor() {
		super('level2');
	}

    init() {
        this.cursors = this.input.keyboard.createCursorKeys();
        
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
        this.sounds = new Map<string,Phaser.Sound.BaseSound>();

        this.info = {
            'lastHealth': 100,
            'coinsCollected': 0,
            'carrotsCollected': 0,
            'currLevel': 1,
            'scorePoints': 0,
            'livesRemaining': 3,
        };

        let data = window.localStorage.getItem( 'ra8bit.stats' );
        if( data != null ) {
            let obj = JSON.parse(data);
            this.info = obj as PlayerStats;
        }

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {

            this.destroy();
        });

    }

	preload() {
        SceneFactory.preload(this);

        this.load.tilemapTiledJSON('tilemap2', 'assets/map2.json');
    }

    create() {

        this.sounds = SceneFactory.setupSounds(this);

        this.scene.launch('ui');

        SceneFactory.playRandomMusic(this);

        this.events.on('player-jumped', this.playerJumped, this);
     
        const { width, height } = this.scale;

        const totalWidth = 336 * 64;
        let hei = 24 * 64;
        let s = 1;
        this.add
          .image(width / 2, height, "sky")
          .setScrollFactor(0)
          .setOrigin(0.5, 1)
          .setScale(s);

        AlignmentHelper.createAligned(this, totalWidth, hei,"bg_1", 0.385 / s,1); //mountain
        AlignmentHelper.createAligned(this, totalWidth, hei, "bg_2", 0.375 / s,1);
        AlignmentHelper.createAligned(this, totalWidth, hei, "bg_3", 0.365 / s,1);
        AlignmentHelper.createAligned(this, totalWidth, hei,"bg_4", 0.35 / s,1);
        AlignmentHelper.createAligned(this, totalWidth, hei,"bg_5", 0.345 / s,1);
        AlignmentHelper.createAligned(this, totalWidth, hei,"bg_6", 0.36 ,1);

        this.map = this.make.tilemap({ key: 'tilemap2', tileWidth: 64, tileHeight: 64 });
        const groundTiles = this.map.addTilesetImage('ground', 'groundTiles', 64, 64, 0, 2);
        const propTiles = this.map.addTilesetImage('props', 'propTiles', 64, 64, 0, 2);
        const ground = this.map.createLayer('ground', [ groundTiles ]);
        const layer1 = this.map.createLayer('layer1', [ groundTiles ]);
      
        ground.setCollisionByProperty({ collides: true,recalculateFaces: false });
             
        this.map.createLayer('obstacles', propTiles);
        layer1.setDepth(10);
        
        let playerCat = 2; // this.matter.world.nextCategory();
        let enemyCat = 4; //this.matter.world.nextCategory();

        let collideWith = [1, playerCat];

        this.playerX = this.scene.scene.game.registry.get( 'playerX' ) || -1;
        this.playerY = this.scene.scene.game.registry.get( 'playerY' ) || -1;
        
        const objectsLayer = this.map.getObjectLayer('objects');
        objectsLayer.objects.forEach(objData => {
            
            const { x = 0, y = 0, name, width = 0, height = 0, rotation = 0 } = objData;
            let playerName: string = name;
            if(playerName === 'player-spawn') {
                playerName = 'player1'; // default to player1
            } else if (playerName === 'player1-spawn') {
                playerName = 'player1';
            } else {
                playerName = 'player2';
            }
            switch (name) {
                case 'player1-spawn':
                case 'player2-spawn':
                case 'player-spawn': {
                    this.player = SceneFactory.createPlayer(this,
                        (this.playerX == -1 ? x : this.playerX),
                        (this.playerY == -1 ? y : this.playerY),
                        width,height,playerCat);

                    this.playerController = new PlayerController(
                        this,
                        this.player, 
                        this.cursors,
                        this.obstaclesController,
                        this.sounds,
                        this.map,
                        this.info,
                        playerName
                        );
                    this.playerController.setCollideWith(playerCat);
                        
                    this.cameras.main.setBounds(0,0,this.map.widthInPixels,this.map.heightInPixels);
                    this.cameras.main.startFollow(this.player, true);

                    this.cameras.main.setAlpha(1);
                    this.cameras.main.setViewport(0,0,1280,640);
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
                    SceneFactory.basicCreate(this,name,x,y,width,height,rotation,enemyCat,collideWith,this.obstaclesController, objData, this.playerController);
                    break;
            }
        });
       
        this.matter.world.convertTilemapLayer(ground, {label: 'ground', friction: 0, frictionStatic: 0 });
        this.matter.world.setBounds(0,0,this.map.widthInPixels, this.map.heightInPixels);

/*        this.matter.world.drawDebug = false;
        this.input.keyboard.on("keydown-I", (event) => {
          this.matter.world.drawDebug = !this.matter.world.drawDebug;
          this.matter.world.debugGraphic.clear();
        });
        */

        this.matter.world.on( "collisionstart", (e: { pairs: any; }, o1: any, o2: any) => {
            var pairs = e.pairs;
            for( var i = 0; i < pairs.length; i ++ ) {
                let bodyA = pairs[i].bodyA;
                let bodyB = pairs[i].bodyB;

                let dx = ~~ (bodyA.position.x - bodyB.position.x);
                let dy = ~~ (bodyA.position.y - bodyB.position.y);

                const { min,max } = bodyA.bounds;
              
                let bw = max.x - min.x;
                let bh = (max.y - min.y ) * 0.5;
                if( Math.abs(dx) <= bw && Math.abs(dy) <= bh ) {
                    events.emit( bodyA.gameObject?.name + '-blocked', bodyA.gameObject);        
                }
            }
        });

        this.playerController?.setJoystick(this, width);
    }

    destroy() {

        this.events.off('player-jumped', this.playerJumped, this);
     
        this.playerController?.destroy();

        this.monsters.forEach( monster => monster.destroy());
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
        
    }

    update(time: number, deltaTime: number) {

        this.bombs = this.bombs.filter( e => e.keepObject()  );
        this.monsters = this.monsters.filter( e => e.keepObject() );
        this.crabs = this.crabs.filter( e => e.keepObject() );
        this.birds = this.birds.filter( e => e.keepObject() );
        this.firewalkers = this.firewalkers.filter( e => e.keepObject() );
        this.bats = this.bats.filter( e => e.keepObject() );
        this.dragons = this.dragons.filter( e => e.keepObject() );
        this.bears = this.bears.filter( e => e.keepObject() );
        this.crows = this.crows.filter( e => e.keepObject() );
        
        this.monsters.forEach( monster => {
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

        this.playerController?.update(deltaTime);
        SceneFactory.cullSprites(this);
    }

    playerJumped() {
        SceneFactory.playSound(this.sounds, 'jump');
    }

}
