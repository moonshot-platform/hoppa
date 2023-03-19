import Phaser from "phaser";
import StateMachine from "./StateMachine";
import { sharedInstance as events } from './EventManager';
import ObstaclesController from "./ObstaclesController";
import * as UniqueID from "../scripts/UniqueID";
import * as SceneFactory from "../scripts/SceneFactory";
import PowerUps from "./PowerUps";
import VirtualJoyStick from "phaser3-rex-plugins/plugins/virtualjoystick";
import JoypadController from "./JoypadController";

import { PlayerStats } from "~/scenes/PlayerStats";

export default class PlayerController {
    private scene: Phaser.Scene;
    private sprite?: Phaser.Physics.Matter.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private stateMachine: StateMachine;
    private obstacles: ObstaclesController;
    private powerUps!: PowerUps;
    private stats!: PlayerStats;
    private jp?: JoypadController;
    private jpI?: JoypadController;
    
    private health = 100;
    private playerSpeed = 5;
    private playerJump = 15;

    private lastHitBy?: Phaser.Physics.Matter.Sprite;
    public sensors_bottom;
    public sensors_left;
    public sensors_right;
    private lasthit = 0;
    private poopbag = new Map<string, Phaser.Physics.Matter.Sprite>;
    private trashcan = new Map<string, Phaser.Physics.Matter.Sprite>;

    private deltaS = 0;
    private lastAction = 0;
    private lastThrow = 0;
    private throwDelay = 0;

    private ACCEL_FRAMES = 6;
    private DEACCEL_FRAMES = 3;

    private bonusObjects = ['berry', 'pow', 'star', 'rubber1'];
    private standingOnFloor = false;
    private standingOnPlatform = false;
    private wasStandingOnFloor = false;

    private cannotThrow = false;
    private delayedJump = false;
    private jumpCount = 0;
    private jumpActionValidUntil = 0;
    private sounds!: Map<string, Phaser.Sound.BaseSound>;
    private tilemap!: Phaser.Tilemaps.Tilemap;
    private colCat = 0;
    private spawn_x = 0;
    private spawn_y = 0;
    private playerButton1 = false;
    private playerButton2 = false;
    private LEANWAY = 8;
    private isDead = false;
    private wasd;
    private buttonRepeat : number[] = [];
    private inventoryOpen = false;

    private gameStopping = false;

    private projectileName: string = "dropping";
    private projectileSplash: string = "dropping-splash";

    private joystick?: VirtualJoyStick;


    public name: string;

    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite | undefined,
        cursors: Phaser.Types.Input.Keyboard.CursorKeys,
        obstacles: ObstaclesController,
        sounds: Map<string, Phaser.Sound.BaseSound>,
        tilemap: Phaser.Tilemaps.Tilemap,
        stats: PlayerStats
    ) {
        this.scene = scene;
        this.sprite = sprite;
        this.cursors = cursors;
        this.obstacles = obstacles;
        this.sounds = sounds;
        this.tilemap = tilemap;
        this.stats = stats;
        this.throwDelay = 30;
        this.lastThrow = 0;
        this.name = globalThis.rabbit || 'player1';
        this.powerUps = new PowerUps(this, scene, false);
        this.spawn_x = this.sprite?.body.position.x || 640;
        this.spawn_y = this.sprite?.body.position.y || -100;
        if(this.sprite !== undefined) {
            this.createAnims();
        }
        this.stateMachine = new StateMachine(this, this.name);

        this.scene.events.on('preupdate', this.preupdate, this);
        this.scene.input.gamepad?.once( Phaser.Input.Gamepad.Events.DISCONNECTED, this.onGamePadDisconnected, this);
        this.scene.input.gamepad?.once( Phaser.Input.Gamepad.Events.CONNECTED, this.onGamePadConnected, this );

        this.wasd = this.scene.input.keyboard?.addKeys(
            {
                'up': Phaser.Input.Keyboard.KeyCodes.W,
                'down': Phaser.Input.Keyboard.KeyCodes.S,
                'left': Phaser.Input.Keyboard.KeyCodes.A,
                'right': Phaser.Input.Keyboard.KeyCodes.D
            }
        )

        this.buttonRepeat = Array(32).fill(0);

        this.scene.input.keyboard?.once('keydown', () => {
            events.emit('level-start');
        });

        this.scene.input.keyboard?.on("keydown-I", (event) => {
          this.openInventory();
        });


        this.scene.input.keyboard?.once('keydown-ESC', () => {
            this.stopGame();
        });

        this.stateMachine.addState('idle', {
            onEnter: this.idleOnEnter,
            onUpdate: this.idleOnUpdate
        })
            .addState('walk', {
                onEnter: this.walkOnEnter,
                onUpdate: this.walkOnUPdate
            })
            .addState('jump', {
                onEnter: this.jumpOnEnter,
                onUpdate: this.jumpOnUpdate
            })
            .addState('spike-hit', {
                onEnter: this.spikeHitOnEnter
            })
            .addState('world-hit', {
                onEnter: this.worldHitOnEnter
            })
            .addState('hit', {
                onEnter: this.playerHitOnEnter
            })
            .addState('stomped', {
                onEnter: this.creatureStompOnEnter
            })
            .addState('dead', {
                onEnter: this.deadOnEnter
            })
            .addState('throw', {
                onEnter: this.throwOnEnter,
                onUpdate: this.throwOnUpdate
            })
            .setState('idle');


        this.sprite?.setOnCollideEnd((data: MatterJS.ICollisionPair) => {
            let body = data.bodyB as MatterJS.BodyType;
            let player = data.bodyA as MatterJS.BodyType;

            if (body.label === 'player')
                body = data.bodyA as MatterJS.BodyType;
            else if (player.label !== 'player')
                player = body;

            if (body.label === 'platform' || body.label === 'billboard' || body.label === 'bar' || body.label == 'mushroom-platform') {
                this.standingOnPlatform = false;
            }
        });

        this.sprite?.setOnCollideActive((data: MatterJS.ICollisionPair) => {
            let body = data.bodyB as MatterJS.BodyType;
            let player = data.bodyA as MatterJS.BodyType;

            if (body.label === 'player')
                body = data.bodyA as MatterJS.BodyType;
            else if (player.label !== 'player')
                player = body;

            if (body.label === 'platform' || body.label == 'mushroom-platform') {
                this.handlePlatform(body);

                if (player.position.x < body.position.x || (player.position.x >= (body.position.x + 127))) {
                    player.gameObject?.setVelocityY(10);
                }
            }

            if (body.label === 'billboard') {
                this.standingOnPlatform = true;
            }


            if (body.position.y > player.position.y && (body.position.y - player.position.y) < 96 || this.standingOnPlatform) {
                this.standingOnFloor = true;
                this.wasStandingOnFloor = true;
                this.jumpCount = 0;
            }

            if (!this.sprite.flipX) {
                if (body.position.x > player.position.x && (body.position.x - player.position.x) <= 96
                    && Math.abs(body.position.y - player.position.y) <= 64 && !this.standingOnPlatform
                ) {
                    this.cannotThrow = true;
                }
            }
            else if (body.position.x < player.position.x && (player.position.x - body.position.x) <= 96
                && Math.abs(body.position.y - player.position.y) <= 64 && !this.standingOnPlatform) {

                this.cannotThrow = true;
            }
        });

        this.sprite?.setOnCollide((data: MatterJS.ICollisionPair) => {
            let body = data.bodyB as MatterJS.BodyType;
            let player = data.bodyA as MatterJS.BodyType;

            if (body.label === 'player')
                body = data.bodyA as MatterJS.BodyType;
            else if (player.label !== 'player')
                player = body;

            if (this.obstacles.isType('spikes', body)) {
                this.lastHitBy = body.gameObject;
                this.stateMachine.setState('spike-hit');
                return;
            }

            if (this.obstacles.isType('exit', body)) {
                const next = this.obstacles.getValues('exit', body);
                const room = next.room;
                const ev = next.event;
                this.scene.cameras.main.fadeOut(500, 0, 0, 0)
                this.scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                    events.emit(ev);
                    this.scene.scene.stop();
                    if( (globalThis.noWallet || (globalThis.moonshotBalance == 0 && globalThis.ra8bitBalance == 0 && !globalThis.hasNFT)) && room !== 'bonus' ) {
                        SceneFactory.stopSound(this.scene);
                        this.scene.scene.start( 'hoppa');
                    }
                    else {
                        SceneFactory.stopSound(this.scene);
                        this.scene.scene.start(room);
                    }
                });
            }

            if (this.obstacles.isType('return', body)) {
                this.scene.matter.world.pause();
                const v = this.obstacles.getValues('return', body);
                this.sprite.setPosition(
                    v.spawnx * 64,
                    v.spawny * 64
                );

                this.scene.cameras.main.setBounds(0, 0, 336 * 64, 50 * 64);
                this.scene.cameras.main.startFollow(this.sprite, true);

                this.scene.matter.world.resume();
            }

            if (this.obstacles.isType('goto', body) && this.isDown()) {
                this.scene.matter.world.pause();
                const v = this.obstacles.getValues('goto', body);
                this.sprite.scene.tweens.add({
                    targets: this.sprite,
                    y: this.sprite.y + this.sprite.height,
                    ease: 'Cubic.easeOut',
                    duration: 2000,
                    onComplete: () => {
                        this.sprite.setPosition(v.spawnx * 64, v.spawny * 64);
                        this.scene.cameras.main.setBounds(0, 0, v.camw * 64, v.camh * 64);
                        this.scene.cameras.main.startFollow(this.sprite, true);
                        this.scene.matter.world.resume();
                    }
                });
            }

            if (this.obstacles.isType('pipe', body)) {
                if (this.isDown()) {

                    this.scene.matter.world.pause();
                    const v = this.obstacles.getValues('pipe', body);
                    const vrh = v.room_hei;
                    const ry = this.sprite.y;
                    const rx = body.position.x;

                    this.sprite.scene.tweens.add({
                        targets: this.sprite,
                        y: this.sprite.y + this.sprite.height,
                        ease: 'Cubic.easeOut',
                        duration: v.duration,
                        delay: v.delay,
                        onStart: () => {
                            this.sprite.setPosition(rx, ry);
                            this.stateMachine.setState('idle');
                        },
                        onComplete: () => {
                            this.sprite.setPosition(v.dstx * 64, v.dsty * 64);
                            if( vrh > 0) {
                                this.scene.cameras.main.startFollow(this.sprite, true, undefined, undefined, undefined, 208);
                            }
                            else {
                                this.scene.cameras.main.startFollow(this.sprite, true);
                            }
                            this.scene.matter.world.resume();
                        }
                    });
                }
            }

            if (this.obstacles.isType('bonus', body)) {
                const v = this.obstacles.getValues('bonus', body);
                if (v.use > 0 && (player.position.y > body.position.y)) {
                    SceneFactory.playSound(this.sounds, 'bonustile');
                    let idx = (v.use == 3 ? 1 :  ~~(Math.random() * this.bonusObjects.length)); // first bonus is always POWER , followed by random bonus drop
                    while (v.last == idx) {
                        idx = ~~(Math.random() * this.bonusObjects.length);
                    }
                    const name = this.bonusObjects[idx];
                    const pwrup = this.scene.matter.add.sprite(body.position.x, body.position.y - 64, name, undefined, {
                        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
                        label: 'bonus'
                    });
                    pwrup.setName(name);
                    pwrup.setData('type', 'bonus');
                    pwrup.setBounce(0.2);
                    pwrup.setFriction(0.03);
                    pwrup.setMass(0.1);
                    const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
                    const endColor = Phaser.Display.Color.ValueToColor(0xc22caf);
                    this.scene.tweens.addCounter({
                        from: 0,
                        to: 100,
                        duration: 100,
                        repeat: 2,
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

                            pwrup.setTint(color);
                        }
                    })

                    this.bounceTile(body);

                    v.use = v.use - 1;
                    v.last = idx;
                }
                return;
            }

            if (this.obstacles.isType('dragon', body) ||
                this.obstacles.isType('monster', body) ||
                this.obstacles.isType('plant', body) ||
                this.obstacles.isType('flower', body) ||
                this.obstacles.isType('bird', body) ||
                this.obstacles.isType('bat', body) ||
                this.obstacles.isType('bomb', body) ||
                this.obstacles.isType('crab', body) ||
                this.obstacles.isType('firewalker', body) ||
                this.obstacles.isType('bear', body) ||
                this.obstacles.isType('fly', body) ||
                this.obstacles.isType('crow', body) ||
                this.obstacles.isType('tnt', body) ||
                this.obstacles.isType('boss', body) ||
                this.obstacles.isType('fire', body)) {
                this.lastHitBy = body.gameObject;

                if( (player.position.y + 31) < body.position.y ) {
                   this.stateMachine.setState('stomped');
                }
                else {
                    if(this.obstacles.isType('plant', body)) {
                        events.emit("plant-touched", body.gameObject, this);
                    }
                    this.stateMachine.setState('hit');
                }

                return;
            }

            if (this.obstacles.isType('saw', body)) {
                this.lastHitBy = body.gameObject;
                this.stateMachine.setState('hit');
                return;
            }

            if (this.obstacles.isType('brick', body) && this.powerUps.isPower()) {
                this.handleBrick(body);
                return;
            }

            if (this.obstacles.isType('coinbrick', body) && this.powerUps.isPower()) {
                if (player.position.y > (body.position.y + 32)) {
                    const v = this.obstacles.getValues('coinbrick', body);

                    if (v.use > 0) {
                        v.use = v.use - 1;
                        SceneFactory.basicCreate(this.scene, 'coin', body.position.x - 32, body.position.y - 96 - (64 * v.use),
                            64, 64, 0, 4, [0], this.obstacles, null, this);
                        this.bounceTile(body);
                    }
                    else if (v.use == 0) {
                        v.use = -1;
                    }

                }
                return;
            }


            const gameObject = body.gameObject;
            if (!gameObject) {
                if (body.label === "Rectangle Body" && body.position.y > player.position.y) {
                    this.stateMachine.setState('world-hit');
                }

                return;
            }

            if (gameObject instanceof Phaser.Physics.Matter.TileBody) {
                const b = gameObject as Phaser.Physics.Matter.TileBody;

                if (!b.tile.visible) {
                    b.destroy();
                    return;
                }

                if (b.tile.properties.breakable == true && player.position.y <= body.position.y) {
                    const hits = b.tile.properties.hits || 0;

                    if (hits == 0) {
                        SceneFactory.playSound(this.sounds, 'breakingtile');
                        this.scene.time.delayedCall(b.tile.properties.breakdelay, () => {
                            b.tile.tilemapLayer?.removeTileAt(b.tile.x, b.tile.y, true, true);
                            b.destroy();
                        }, [b], this);
                    }

                    b.tile.properties.hits =
                        (b.tile.properties.hits > 0 ? b.tile.properties.hits - 1 : 0);

                }

                if (b.tile.properties.sound !== undefined) {
                    SceneFactory.playSound(this.sounds, b.tile.properties.sound);
                }

                if (b.tile.properties.damage > 0) {
                    this.setHealth(this.health - b.tile.properties.damage);
                }

                if (player.position.y < body.position.y && (body.position.y - player.position.y) < 96) {
                    this.standingOnFloor = true;
                    this.wasStandingOnFloor = true;
                }
                return;
            }

            const sprite = gameObject as Phaser.Physics.Matter.Sprite;
            const type = sprite.getData('type');

            switch (type) {
                case 'bonus': {
                    
                    SceneFactory.playSound(this.sounds, sprite.name);
                    if(sprite.name === 'berry')  {
                        SceneFactory.playKrasota(this.sounds, 'blowitoutofyourass');
                    }
                    else if(sprite.name === 'pow') {
                        SceneFactory.playKrasota(this.sounds, 'hailtotheking');
                    }
                    this.powerUps.add(sprite.name, this.scene);
                    sprite.destroy();
                    break;
                }
                case 'dropping': {
                    SceneFactory.playSound(this.sounds, 'pickupdropping');
                    this.collectPoop(sprite,false);
                    break;
                }
                case 'coin': {
                    events.emit('coin-collected');
                    SceneFactory.playSound(this.sounds, 'pickupcoin');
                    this.bounceSpriteAndDestroy(sprite);
                    if( Phaser.Math.Between(0,25) == 0 ) {
                        SceneFactory.playKrasota(this.sounds, SceneFactory.krasotaSays(0,"")  );
                    }
                    break;
                }
                case 'key': {
                    sprite.setCollidesWith(6);
                    events.emit('key-collected');
                    SceneFactory.playSound(this.sounds, 'pickupcoin');
                    this.bounceSpriteAndDestroy(sprite);
                    SceneFactory.playKrasota(this.sounds, SceneFactory.krasotaSays(0,"")  );
                    events.emit( "wakeup-object" );
                    break;
                }
                case 'window': {
                    // fade out, start another scene
                    if(this.stateMachine.getCurrentState() === 'jump') {
                        events.emit('coin-taken');
                        
                        this.sprite.body.velocity.x = 0;
                        this.sprite.body.velocity.y = 0;
                        this.sprite.setIgnoreGravity(true);

                        this.scene.cameras.main.fadeOut(1000, 0, 0, 0);
                        this.scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (c, e) => {
                            this.scene.scene.stop();
                            this.scene.scene.stop('ui');
                            this.scene.scene.start('win');
                        });
                    }
                    break;
                }
                case 'carrot': {
                    events.emit('carrot-collected');
                    SceneFactory.playSound(this.sounds, 'pickupcarrot');
                    this.health = Phaser.Math.Clamp(this.health + 1, 0, 100);
                    this.bounceSpriteAndDestroy(sprite);
                    break;
                }
                case 'heart': {
                    SceneFactory.playSound(this.sounds, 'pickuphealth');
                    this.stats.livesRemaining += 1;
                    events.emit('lives-changed', this.stats.livesRemaining);
                    this.health = 100;
                    events.emit('health-changed', this.health);
                    this.bounceSpriteAndDestroy(sprite);
                    break;
                }
                case 'platform':
                case 'mushroom-platform': {
                    this.handlePlatform(body);
                    break;
                }
                case 'billboard': {
                    SceneFactory.playSound(this.sounds, 'click');
                    sprite.setFrame(Phaser.Math.Between(0, 34));
                    break;
                }
                case 'lightswitch': {
                    if (player.position.y > body.position.y) {
                        this.bounceSprite(sprite);
                        SceneFactory.playSound(this.sounds, 'lightswitch');
                        events.emit(sprite.name + '-touched', sprite);
                    }
                    break;
                }
                case 'changeskin': {
                    if (player.position.y > body.position.y) {
                        const v = this.obstacles.getValues('changeskin', body);
                        if (v.use > 0) {
                            v.use = v.use - 1;
                            this.bounceSprite(sprite);
                            SceneFactory.playSound(this.sounds, 'changeskin');
                            events.emit(sprite.name + "-touched", sprite, this);
                            SceneFactory.playSound(this.sounds, 'equalopportunity');
                        }
                    }
                    break;
                }
                case 'lava-center': {
                    this.lastHitBy = body.gameObject;
                    SceneFactory.playSound(this.sounds, 'lava');
                    this.stateMachine.setState('world-hit');
                    break;
                }
                case 'crate': {

                    break;
                }
                default:
                    break;
            }
        });
    }

    private createVirtualJoystick() {
        if(this.jp !== undefined) {
            this.jp.getB().on('click', () => {
                this.playerButton1 = true;
                if(!(this.playerButton1 && this.playerButton2)) {
                    if (!this.cannotThrow) {
                        this.throwOnEnter();
                        this.jp?.fireB();
                        this.jp?.startTimerNow();
                    }
                }
            }, this);

            this.jp.getA().on('click', () => {
                this.playerButton2 = true;
                if(!(this.playerButton1 && this.playerButton2)) {
                    this.jp?.fireA();
                    this.jp?.startTimerNow();
                }
            }, this);

            this.joystick = this.jp.getStick();
        }
    }
    
    setJoystick(scene: Phaser.Scene, width: number) {
        if (scene.game.device.os.desktop)
            return;

        if( scene.input.gamepad.total > 0 )
            return;
/*
        if(this.jp !== undefined) {
            this.jp.destroy();
            this.jp = undefined;
            this.joystick = undefined;
        }

        this.jp = new JoypadController(scene, width); */

        if( this.jp === undefined ) {
            this.jp = new JoypadController(scene, width );
            this.createVirtualJoystick();
        }
     /*   else {
            this.jp.destroy();
            this.jp = new JoypadController(scene, width);
            this.createVirtualJoystick();
        } */

    }

    pokeVirtualStick(scene: Phaser.Scene, width: number ) {
        if( !scene.game.device.os.desktop && scene.input.gamepad.total <= 0 )
        {
            this.jpI = this.jp;
            this.jp = new JoypadController(scene, width );
            this.createVirtualJoystick();
        }
        else {
            this.jpI = undefined;
        }

    }

    unpokeVirtualStick(scene:Phaser.Scene) {
        this.jp?.destroy();
        this.jp = this.jpI;

        if( !scene.game.device.os.desktop && scene.input.gamepad.total <= 0 )
         this.createVirtualJoystick();

        this.jpI = undefined;
        this.inventoryOpen = false;
    }


    onGamePadConnected() {
        if(this.jp !== undefined) {
            this.jp.destroy();
            this.jp = undefined;
            this.joystick = undefined;
        }

        console.log("Connected gamepads: ", this.scene.input.gamepad.total);
    }

    onGamePadDisconnected() {
        this.setJoystick( this.scene, this.scene.scale.width );

        console.log("Connected gamepads: ", this.scene.input.gamepad.total);
    }

    takeDamage(dmg: number, sound: string) {
        this.setHealth(this.health - dmg);
        SceneFactory.playSound(this.sounds, sound);
        this.hitTween();
        this.lasthit = this.scene.time.now;
    }

    getCollideWith() {
        return this.colCat;
    }

    setCollideWith(value: number) {
        this.colCat = value;
    }

    getSprite() {
        return this.sprite;
    }

    openInventory() {
        this.inventoryOpen = !this.inventoryOpen;
        if(this.inventoryOpen) {
            this.scene.scene.launch('inventory', {"player": this });
        }
    }

    collectPoop(turd: Phaser.Physics.Matter.Sprite, splash = true) {
        if (this.trashcan.has(turd.name)) {
            console.log("Already destroyed " + turd.name);
        }
        else {
            SceneFactory.playSound(this.sounds, 'droppinghits');
                if(splash) {
                    turd.flipX = this.sprite.flipX;
                    turd.play('splash').once('animationcomplete', () => {


                        this.trashcan.set(turd.name, turd);

                    });
                }
        }
    }

    destroy() {
        this.scene.events.off('preupdate', this.preupdate, this);
        this.poopbag.clear();
        this.trashcan.clear();
        this.sprite?.destroy();
        this.stateMachine.destroy();
        this.sounds?.clear();
        this.jp?.destroy();
        this.powerUps.destroy();
    }

    preupdate(time, delta) {

        this.trashcan.forEach((value, key) => {
            this.poopbag.delete(key);
            value.setActive(false);
            value.setStatic(true);
            //value.setOnCollide(() => { });
            value.setCollidesWith(0);
            value.setCollisionGroup(8);
            value.setCollisionCategory(16);
            value.setAlpha(0);
            value.destroy();
        });

        this.trashcan.clear();

        this.poopbag.forEach((turd) => {
            const v = turd.getData('spawned');
            if (v != -1) {
                if (!Phaser.Geom.Intersects.RectangleToRectangle(this.sprite.getBounds(), turd.getBounds())) {
                    turd.setCollidesWith([1, 2, 4]);
                    turd.setData('spawned', -1);

                }
            }
        });

        this.updateSpawnlocation();
        
    }

    update(deltaTime: number) {

        if( this.inventoryOpen )
            return;

        this.stateMachine.update(deltaTime);

        this.cannotThrow = !this.powerUps.isPoop();
        this.standingOnPlatform = false;

        this.playerButton1 = false;
        this.playerButton2 = false;

        if (this.jp !== undefined) {
            this.jp.setBActive(!this.cannotThrow);
            this.jp.startTimer();
        }

        if (this.sprite.body != null && this.sprite.body.position.y > (
            this.tilemap.heightInPixels - 32)) {
            this.stateMachine.setState('world-hit');
        }
    }

    private handleBrick(body: MatterJS.BodyType) {
        const v = this.obstacles.getValues('brick', body);

        if (v.use > 0) {
            v.use = v.use - 1;
            v.emitter.emitParticle(this.tilemap, body);
            SceneFactory.playSound(this.sounds, 'explosion1');

        }
        else if (v.use == 0) {
            v.emitter.removeBrick(this.tilemap, body);
            this.obstacles.remove('brick', body);
            SceneFactory.playRandomSound(this.sounds, 'explosion', 2, 6);
            v.use = -1;
        }
    }

    private setHealth(value: number) {
        if (this.powerUps.isInvincible()) {
            if (value > 0) {
                const newhealth = Phaser.Math.Clamp(value, 0, 100);
                if (newhealth > this.health) {
                    this.health = newhealth;
                    events.emit('health-changed', this.health);

                }
            }
            return;
        }

        this.health = Phaser.Math.Clamp(value, 0, 100);

        events.emit('health-changed', this.health);
        if (this.health <= 0) {
            this.stateMachine.setState('dead');
        }
    }

    public getX() {
        return this.sprite.x;
    }

    public getY() {
        return this.sprite.y;
    }

    private idleOnEnter() {

        this.changeAction();
    }

    private playerJumps(): boolean {

        if (this.jumpActionValidUntil < this.scene.game.loop.frame) {
            this.wasStandingOnFloor = false;
        }

        const spacebarJustDown = this.isSpace();
        if (spacebarJustDown) {
            if (this.standingOnFloor && this.jumpCount == 0 || this.jumpCount == 1) {
                this.stateMachine.setState('jump');
                return true;
            }
            else {
                this.jumpActionValidUntil = this.scene.game.loop.frame + this.LEANWAY;
            }
        }
        else if (this.jumpActionValidUntil > this.scene.game.loop.frame && this.jumpCount < 2 && !this.wasStandingOnFloor) {
            this.stateMachine.setState('jump');
            return true;
        }
        else if (this.jumpActionValidUntil > this.scene.game.loop.frame && this.jumpCount < 2 && this.wasStandingOnFloor) {
            this.delayedJump = true;
        }
        return false;
    }

    private playerThrows() {
        const fireJustDown = this.isShift();
        if (fireJustDown) {
            if (!this.cannotThrow) {
                this.stateMachine.setState('throw');
            }
        }

    }

    private getEventName(suffix: string): string {
        return this.name + "-" + suffix;
    }

    private idleOnUpdate() {
        const d = (this.scene.game.loop.frame - this.lastAction);

        if (d > 120) {
            this.sprite.play(this.getEventName('facing'));
        }
        else {
            this.sprite.play(this.getEventName('idle'));
        }

        if (this.isLeft() || this.isRight()) {
            this.stateMachine.setState('walk');
        }

        if( this.isR2() ) {
            this.openInventory();
        }
        
        this.playerThrows();
        this.playerJumps();

        this.updateVelocities('idle');
    
        if( this.isStart() ) {
            this.stopGame();
        }
    }

    private jumpOnEnter() {

        this.changeAction();

        this.scene.events.emit("player-jumped");
        this.sprite.play(this.getEventName('jump')); // super jump
        this.sprite.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
            this.stateMachine.setState('idle');
        });
        this.jumpCount++;
        this.sprite.setVelocityY((this.jumpCount == 1 ? -1 * this.playerJump : -1 * (this.playerJump * 0.75)));
        this.jumpActionValidUntil = this.scene.game.loop.frame; // invalidate
    }

    private jumpOnUpdate() {
        const fireJustDown = this.isShift();
        if (fireJustDown) {
            if (!this.cannotThrow) {
                this.throwOnEnter();
            }
        }

        this.playerJumps();
        this.updateVelocities('jump');
    }

    private walkOnEnter() {
        this.sprite.play(this.getEventName('walk'));
        this.changeAction();
    }

    private walkOnUPdate() {
        this.playerThrows();
        this.playerJumps();
        this.updateVelocities('walk');
    }

    private throwOnUpdate() {
        this.playerJumps();
        this.updateVelocities('throw');
    }

    private throwOnEnter() {
        const delta = this.scene.game.loop.frame - this.lastThrow;
        const dx = this.sprite.body?.position.x || -1;
        const dy = this.sprite.body?.position.y || -1;
        
        if( dx == -1 && dy == -1 )
            return;
 
        if (delta < this.throwDelay) {
            if (this.isLeft() || this.isRight()) {
                this.stateMachine.setState('walk');
            }
            else {
                this.stateMachine.setState('idle');
            }
            return;
        }

        const name = 'dropping' + UniqueID.genUniqueID();
        const dropping = this.scene.matter.add.sprite(dx - 12, dy - 21, this.projectileName, undefined, {
            vertices: [{ x: 0, y: 0 }, { x: 24, y: 0 }, { x: 24, y: 24 }, { x: 0, y: 24 }],
            label: 'dropping',
            angle: 45,
            restitution: 1.0,
        });
        this.poopbag.set(name, dropping);

        const turdSpeed = 24 + ( this.stats.pokeBall ? 8 : 0);
        dropping.setBounce(0.9);

        dropping.setFriction(0.0);
        dropping.setFrictionAir(0.0005);
        dropping.setMass(0.1);
        dropping.setDepth(10);

        dropping.setVelocityX((this.sprite.flipX ? -turdSpeed : turdSpeed));

        dropping.setCollisionGroup(6);
        dropping.setCollidesWith(0); //[1, 4]); 

        dropping.setName(name);
        dropping.setData('type', 'dropping');
        dropping.setData('spawned', this.scene.game.loop.frame);

        this.lastThrow = this.scene.game.loop.frame;

        dropping.setOnCollide((data: MatterJS.ICollisionPair) => {
            const a = data.bodyB as MatterJS.BodyType;
            const b = data.bodyA as MatterJS.BodyType;

            if( this.obstacles.isType('brick', b) ) {
                this.handleBrick(b);
                this.collectPoop(a.gameObject);
                return;
            }

            if (b.gameObject?.name === undefined) {
                const tile = this.tilemap.getTileAtWorldXY(b.position.x, b.position.y, undefined, this.scene.cameras.main, 'ground');
                if (tile != null && tile.properties !== undefined && tile.properties.sound !== undefined) {
                    SceneFactory.playSound(this.sounds, tile.properties.sound);
                    if (tile.properties.damage > 0) {
                        this.collectPoop(a.gameObject);
                    }
                }
            }
            if (b.gameObject !== undefined) {
                switch (b.label) {
                    case 'ground':
                    case 'coin':
                    case 'heart':
                    case 'berry':
                    case 'rubber1':
                    case 'star':
                    case 'crate':
                    case 'carrot':
                    case 'key':
                        SceneFactory.playSound(this.sounds, 'droppingbounces');

                        break;
                    case 'spikes':
                        SceneFactory.playSound(this.sounds, 'lava');
                        break;
                    
                    case 'fire':
                        break;
                    case 'player':
                        if (a.gameObject?.name !== undefined)
                            this.collectPoop(a.gameObject, false);

                        break;
                    case 'boss':
                        if(a.velocity.x > 4 || a.velocity.x < -4) {
                            events.emit(b.gameObject.name + '-hit', b.gameObject);
                            this.collectPoop(a.gameObject);
                        }
                        break;
                    case 'dropping':
                        if (a.gameObject !== undefined)
                            this.collectPoop(a.gameObject);

                        this.collectPoop(b.gameObject);
                        break;


                    default:
                        if (b.gameObject?.name !== undefined) {
                            if (a.velocity.x > 3 || a.velocity.x < -3) {
                                if (b.gameObject !== undefined) {
                                    b.gameObject.setCollidesWith(6);

                                    events.emit(b.gameObject.name + '-stomped', b.gameObject);

                                    const score = 100;
                                    const btxt = this.scene.add.bitmapText(b.position.x, b.position.y, 'press_start',
                                        '+100', 24).setTint(0x4b2a09);
                                    btxt.setBlendMode('DIFFERENCE');


                                    this.scene.add.tween({
                                        targets: btxt,
                                        alpha: 0,
                                        duration: 800,
                                        ease: 'Power2',
                                        onComplete: () => {
                                            btxt.destroy();
                                        }
                                    });

                                    events.emit('enemy-killed', score);
                                }

                            }
                        }
                        this.collectPoop(a.gameObject);

                        break;
                }
            }

        });

        this.sprite.play(this.getEventName('throw')).once('animationcomplete', () => {
            if (this.isLeft() || this.isDown()) {
                this.stateMachine.setState('walk');
            }
            else {
                this.stateMachine.setState('idle');
            }
        });

        dropping.anims.create({
            key: 'splash',
            frameRate: 25,
            frames: this.sprite.anims.generateFrameNames(this.projectileSplash, {
                start: 1,
                end: 3,
                prefix: 'Splash',
                suffix: '.webp'
            }),
            repeat: 0
        });
        
    }

    private hitTween() {
        const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
        const endColor = Phaser.Display.Color.ValueToColor(0xff0000);

        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 100,
            repeat: 2,
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
            }
        });
    }

    private worldHitOnEnter() {
        if (this.health <= 0)
            return;

        this.sprite.setVelocityY(-10);

        this.hitTween();

        //this.setHealth(0);
        this.lasthit = this.scene.time.now;
        SceneFactory.playSound(this.sounds, 'lava');

        this.health = Phaser.Math.Clamp(0, 0, 100);

        events.emit('health-changed', this.health);
        this.stateMachine.setState('dead');

    }

    private stopGame() {
        if(!this.gameStopping) {
            this.gameStopping = true;
            SceneFactory.stopSound(this.scene);
            this.scene.scene.stop('ui');
            this.scene.scene.stop();
            this.scene.scene.start('hoppa');
        }
    }

    private spikeHitOnEnter() {
        this.sprite.setVelocityY(-10);

        this.hitTween();

        this.stateMachine.setState('idle');

        this.setHealth(this.health - 25);
        this.lasthit = this.scene.time.now;

        SceneFactory.playSound(this.sounds, 'lava');

    }

    private playerHitOnEnter() {

        if( this.lasthit > (this.scene.time.now + 1000))
            return;

      
        this.lasthit = this.scene.time.now;

        const startColor = Phaser.Display.Color.ValueToColor(0xffffff);
        const endColor = Phaser.Display.Color.ValueToColor(0xff0000);

        this.scene.tweens.addCounter({
            from: 0,
            to: 100,
            duration: 100,
            repeat: 2,
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
            }
        })
        
        SceneFactory.playSound(this.sounds, 'hit');
        this.setHealth(this.health - 25);

        this.stateMachine.setState('idle');

        if (this.lastHitBy !== undefined && this.sprite !== undefined) {
            if (this.sprite.x < this.lastHitBy.x) {
                this.sprite.setVelocityX(-40);
            }
            else {
                this.sprite.setVelocityX(40);
            }
        }
        else {
            this.sprite.setVelocityY(-20);
        }

    }

    private creatureStompOnEnter() {
        this.sprite.setVelocityY(-10);
        if (this.lastHitBy !== undefined) {
            const body = this.lastHitBy.body;
            if(body != null) {
                const score = 100;
                const b = this.scene.add.bitmapText(body.position.x, body.position.y, 'press_start',
                    '+100', 24).setTint(0xffffff);
                b.setBlendMode('DIFFERENCE');

                this.scene.add.tween({
                    targets: b,
                    alpha: 0,
                    duration: 800,
                    ease: 'Power2',
                    onComplete: () => {
                        b.destroy();
                    }
                });

                events.emit('enemy-killed', score);
            }
        }

        events.emit(this.lastHitBy?.name + '-stomped', this.lastHitBy);
        SceneFactory.playSound(this.sounds, 'stomped');
        this.scene.cameras.main.shake(100, 0.025);

        this.stateMachine.setState('idle');
    }

    private deadOnEnter() {
        
        if(this.isDead) {
            return;
        }

        this.isDead = true;

        console.log("Player died! ");

        this.sprite.setInteractive(false);
        this.sprite.setCollidesWith(6);
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        this.sprite.setOnCollide( () => {} );

        this.sprite.play(this.getEventName( 'dead'));

        this.scene.cameras.main.shake(500);
        this.scene.time.delayedCall(250, () => {
            this.scene.cameras.main.fade(4000);
        });

        this.stats.livesRemaining = (this.stats.livesRemaining > 0 ? this.stats.livesRemaining - 1 : 0);

        this.powerUps.reset();

        events.emit('lives-changed', this.stats.livesRemaining);

         
        if (this.stats.livesRemaining == 0) {
            const bite = SceneFactory.krasotaSays(2,"");
            const s = this.sounds.get(bite);
            if(s !== undefined ) {
                s.on( 'complete', () => {
                    SceneFactory.krasotaUnlock();
                    events.emit('reset-game');
                    this.scene.scene.start('game-over');
                });
                SceneFactory.playKrasota(this.sounds, bite,true );
            } else {
                events.emit('reset-game');
                this.scene.scene.start('game-over');
            }
        }
        else {
            const bite = SceneFactory.krasotaSays(1,"");
            const s = this.sounds.get(bite);
            if(s !== undefined) {
                s.on( 'complete', () => {
                    SceneFactory.krasotaUnlock();
                    this.scene.scene.restart();
                    events.emit('restart');
                });
                SceneFactory.playKrasota(this.sounds, bite,true );
            }
            else {
                this.scene.scene.restart();
                events.emit('restart');
            }
        }

        this.scene.time.delayedCall(5500, () => {
            if(!SceneFactory.krasotaPlayStarted() || (SceneFactory.krasotaPlayStarted() && globalThis.krasota)) {
                if(this.stats.livesRemaining == 0 ) {
                    // 'complete' event not fired
                    events.emit('reset-game');
                    this.scene.scene.start('game-over');
                }
                else {
                    this.scene.scene.restart();
                    events.emit('restart');
                }
            }
        });
        
    }

    public changeAction() {
        this.lastAction = this.scene.game.loop.frame;
    }

    public setSpeed(newSpeed: number) {
        this.playerSpeed = newSpeed;
    }

    public restoreSpeed() {
        this.playerSpeed = 5;
    }

    public getSpeed() {
        return this.playerSpeed;
    }

    public enableAntiGravity() {
        this.sprite.setIgnoreGravity(true);
    }

    public disableAntiGravity() {
        this.sprite.setIgnoreGravity(false);
    }

    public toggle() {
        let voice = '';
        if (this.name === 'player1') {
            this.name = 'player2';
            voice = '-cs'; // CryptoSeas
        }
        else if (this.name === 'player2') {
            this.name = 'player1'; // Krasota
        }
        globalThis.rabbit = this.name;
        globalThis.voice = voice;
    }

    public setVoice(val: boolean) {
        if( val == false ) {
            if(this.name === 'player1') {
                globalThis.voice = '-cs';
            }
            else {
                globalThis.voice = '';
            }

        }   
        else {
            globalThis.voice = '-vd';
        }
        
        this.stats.voice = val;
    }


    public setProjectile(name: string, splash: string) {
        this.projectileName = name;
        this.projectileSplash = splash;

        if("moonshot-ball" === name ) {
            this.stats.pokeBall = true;
        }
        else {
            this.stats.pokeBall = false;
        }

    }

    private updateVelocities(state: string) {
        const d = (this.scene.game.loop.frame - this.lastAction);
        this.deltaS = (d > this.ACCEL_FRAMES ? this.playerSpeed : (d / this.ACCEL_FRAMES) * this.playerSpeed);

        let speed = this.getSpeed(this.deltaS); // FIXME

        let keepWalking = false;

        if (this.isLeft()) {
            this.sprite.flipX = true;
            this.sprite.setVelocityX(-speed);

            keepWalking = true;
        }
        else if (this.isRight()) {
            this.sprite.flipX = false;
            this.sprite.setVelocityX(speed);

            keepWalking = true;

        }
        else {
            speed = 0;
            this.sprite.setVelocityX(speed);
        }


        if (state === 'walk' && !keepWalking) {
            this.stateMachine.setState('idle');
        }

        if (this.delayedJump) {
            if (this.jumpActionValidUntil > this.scene.game.loop.frame) {
                this.jumpOnEnter();
            }
            this.delayedJump = false;
        }

        this.standingOnFloor = false;


    }

    private isValidTile(x, y) {
        const tile = this.tilemap.getTileAtWorldXY(
            x,
            y,
            false, this.scene.cameras.main, 'ground');

        

        if (tile != null) {
            if (tile.canCollide && tile.visible && tile.collides) {
                const dmg = tile.properties?.damage || 0;
                const bt = tile.properties?.breakable || false;
                const hits = tile.properties?.hits || 0;
                 
                if ((dmg === undefined || dmg <= 0) && (bt === undefined || bt == false) && (hits == 0)) {
                    //tile.tint = 0xff0000;//debug
                    const tileUp = this.tilemap.getTileAtWorldXY(
                        x,
                        y - 64,
                        false,
                        this.scene.cameras.main, 'ground');
                        
                    if(tileUp != null) {
                        if(tileUp.canCollide && tileUp.visible && tileUp.collides) {
                            return false;
                        }
                    }

                    return true;
                }
            }
        }
        return false;
    }

    public updateSpawnlocation() {
        if(this.sprite === undefined || this.sprite.body === undefined)
            return;
     
        if(!this.standingOnFloor)
           return;

        if( this.sprite.body?.velocity.y != 0 || this.sprite.body?.velocity.x == 0 )
            return;

        const nx =  ~~( this.sprite.body.position.x / 64) * 64;
        const ny =  ~~((this.sprite.body.position.y + 48) / 64) * 64;
        const nny = ~~((this.sprite.body.position.y) / 64) * 64;
     
        if (
            this.isValidTile(
                nx,
                ny,
            )) {
            this.scene.game.registry.set('playerX', nx);
            this.scene.game.registry.set('playerY', nny);
            this.spawn_x = nx;
            this.spawn_y = ny;
        }
    }

    private handlePlatform(body: MatterJS.BodyType) {
        const vec = body.gameObject?.getData('relpos' + body.id);
        if( vec !== undefined) {
            this.sprite.setPosition(
                Phaser.Math.RoundTo(this.sprite.body.position.x + vec.x),
                Phaser.Math.RoundTo(this.sprite.body.position.y + vec.y)
            );
        }
 
        this.standingOnPlatform = true;      
    }

    private bounceTile(body: MatterJS.BodyType) {
        const tile = this.tilemap.getTileAtWorldXY(body.position.x, body.position.y, false, this.scene.cameras.main, 'ground');
        if (tile != null) {
            this.scene.tweens.add({
                targets: tile,
                pixelY: tile.pixelY - 32,
                duration: 100,
                ease: 'Bounce',
                onComplete: () => {
                    tile.pixelY = tile.y * 64;
                },
                repeat: 0,
                yoyo: true,
            });
        }
    }

    private bounceSprite(sprite: Phaser.Physics.Matter.Sprite) {
        const oldY: number = sprite.body?.position.y || -1;
        const t1: Phaser.Tweens.Tween = sprite.getData( 'tween' );
        if( t1 !== undefined) {
            return; // tween running
        }

        const tw = this.scene.tweens.add({
            targets: sprite,
            y: (sprite.body?.position.y || 0) - 32,
            duration: 100,
            ease: 'Bounce',
            onComplete: () => {
                sprite.setY(oldY);
                sprite.setData( 'tween', undefined);
            },
            repeat: 0,
            yoyo: true,
        });
        sprite.setData( 'tween', tw );
    }

    private bounceSpriteAndDestroy(sprite: Phaser.Physics.Matter.Sprite) {
        
        sprite.setCollidesWith([]);
        if( sprite.body != null) {
            this.scene.tweens.add({
                targets: sprite,
                alpha: 0,
                y: sprite.body.position.y - 64,
                duration: 500,
                ease: 'Bounce',
                onComplete: () => {
                    sprite.setActive(false);
                    sprite.setVisible(false);
                    //sprite.destroy();
                },
                repeat: 0,
                yoyo: false,
            });
        }
    }

    private createAnims() {
        this.sprite.anims.create({
            key: 'player1-idle',
            frameRate: 5,
            frames: this.sprite.anims.generateFrameNames('rabbit', {
                start: 1,
                end: 2,
                prefix: '5_Turn',
                suffix: '.webp'
            }),
            repeat: -1
        });


        this.sprite.anims.create({
            key: 'player1-walk',
            frameRate: 5,
            frames: this.sprite.anims.generateFrameNames('rabbit', {
                start: 0,
                end: 3,
                prefix: '3_Walk', 
                suffix: '.webp'
            }),
            repeat: -1
        });

        this.sprite.anims.create({
            key: 'player1-facing',
            frameRate: 5,
            frames: this.sprite.anims.generateFrameNames('rabbit', {
                start: 0,
                end: 1,
                prefix: '5_Turn',
                suffix: '.webp'
            }),
            repeat: -1
        });

        this.sprite.anims.create({
            key: 'player1-jump',
            frameRate: 8,
            frames: this.sprite.anims.generateFrameNames('rabbit', {
                start: 0,
                end: 4,
                prefix: '1_Jump',
                suffix: '.webp'
            })
        });

        this.sprite.anims.create({
            key: 'player1-dead',
            frameRate: 10,
            frames: this.sprite.anims.generateFrameNames('rabbit',
                {
                    start: 0,
                    end: 3,
                    prefix: '4_Dead',
                    suffix: '.webp'
                })
        });

        this.sprite.anims.create({
            key: 'player1-throw',
            frameRate: 20,
            frames: this.sprite.anims.generateFrameNames('rabbit',
                {
                    start: 0,
                    end: 4,
                    prefix: '2_Throw',
                    suffix: '.webp'
                })
        });

        /*************************************/
        this.sprite.anims.create({
            key: 'player2-idle',
            frameRate: 5,
            frames: this.sprite.anims.generateFrameNames('rabbit', {
                start: 1,
                end: 2,
                prefix: '5_FemTurn',
                suffix: '.webp'
            }),
            repeat: -1
        });


        this.sprite.anims.create({
            key: 'player2-walk',
            frameRate: 5,
            frames: this.sprite.anims.generateFrameNames('rabbit', {
                start: 0,
                end: 3,
                prefix: '3_FemWalk',
                suffix: '.webp'
            }),
            repeat: -1
        });

        this.sprite.anims.create({
            key: 'player2-facing',
            frameRate: 5,
            frames: this.sprite.anims.generateFrameNames('rabbit', {
                start: 0,
                end: 1,
                prefix: '5_FemTurn',
                suffix: '.webp'
            }),
            repeat: -1
        });

        this.sprite.anims.create({
            key: 'player2-jump',
            frameRate: 8,
            frames: this.sprite.anims.generateFrameNames('rabbit', {
                start: 0,
                end: 3,
                prefix: '1_FemJump',
                suffix: '.webp'
            })
        });

        this.sprite.anims.create({
            key: 'player2-dead',
            frameRate: 10,
            frames: this.sprite.anims.generateFrameNames('rabbit',
                {
                    start: 0,
                    end: 3,
                    prefix: '4_FemDead',
                    suffix: '.webp'
                })
        });

        this.sprite.anims.create({
            key: 'player2-throw',
            frameRate: 20,
            frames: this.sprite.anims.generateFrameNames('rabbit',
                {
                    start: 0,
                    end: 4,
                    prefix: '2_FemThrow',
                    suffix: '.webp'
                })
        });
    }


    public isDown(): boolean {
        return (this.isGamePadDown() || this.joystick?.down || this.cursors.down.isDown || this.wasd.down.isDown);
    }
    public isUp(): boolean {
        return (this.isGamePadUp() || this.joystick?.up || this.cursors.up.isDown || this.wasd.up.isDown);
    }
    public isLeft(): boolean {
        return (this.isGamePadLeft() || this.joystick?.left || this.cursors.left.isDown || this.wasd.left.isDown);
    }
    public isRight(): boolean {
        return (this.isGamePadRight() || this.joystick?.right || this.cursors.right.isDown || this.wasd.right.isDown);
    }
    public isShift(): boolean {
        return this.isGamePadButton(1) || this.cursors.shift.isDown || this.playerButton1;
    }
    public isSpace(): boolean {
        return this.isGamePadButton(0) || Phaser.Input.Keyboard.JustDown(this.cursors.space) || this.playerButton2;
    }
    public isR2(): boolean {
        return this.isGamePadButton(7) || (this.playerButton1 && this.playerButton2);
    }
    public isStart(): boolean {
        return this.isGamePadButton(9);
    }

    private isGamePadRight(): boolean {
        const pad = this.scene.input.gamepad?.getPad(0);
        if(pad?.axes.length) {
            const x = pad.axes[0].getValue();
            if( x > 0 )
                return true;
        }
        if(pad?.buttons[15].pressed) {
            return true;
        }
        return false;
    }

    private isGamePadLeft(): boolean {
        const pad = this.scene.input.gamepad?.getPad(0);
        if(pad?.axes.length) {
            const x = pad.axes[0].getValue();
            if( x < 0 )
                return true;
        }
        if(pad?.buttons[14].pressed) {
            return true;
        }
        return false;
    }


    private isGamePadDown(): boolean {
        const pad = this.scene.input.gamepad?.getPad(0);
        if(pad?.axes.length) {
            const y = pad.axes[1].getValue();
            if( y < 0 )
                return true;
        }
        if(pad?.buttons[13].pressed) {
            return true;
        }
        return false;
    }

    private isGamePadUp(): boolean {
        const pad = this.scene.input.gamepad?.getPad(0);
        if(pad?.axes.length) {
            const y = pad.axes[1].getValue();
            if( y > 0 )
                return true;
        }
        if(pad?.buttons[12].pressed) {
            return true;
        }
        return false;
    }

    private isGamePadButton(index): boolean {
        const pad = this.scene.input.gamepad?.getPad(0);
        if(pad?.axes.length) {
            if(this.buttonRepeat[index] == 0) { 
                this.buttonRepeat[index] = 8;
                const v = pad.buttons[index].pressed;
                if( v ) {
                    return true;
                }
                else {
                    this.buttonRepeat[index] = 0;
                }
            }
            else {
                this.buttonRepeat[index] --;
            }
        }
        return false;
    }

    private withForce(): number {
        const f = (this.joystick === undefined ? 1 : this.joystick.force);
        return f;
    }
}