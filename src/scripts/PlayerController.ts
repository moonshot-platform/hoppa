import Phaser, { Tilemaps } from "phaser";
import StateMachine from "./StateMachine";
import { sharedInstance as events } from './EventManager';
import ObstaclesController from "./ObstaclesController";
import * as UniqueID from "../scripts/UniqueID";
import * as SceneFactory from "../scripts/SceneFactory";
import PowerUps from "./PowerUps";
import VirtualJoyStick from "phaser3-rex-plugins/plugins/virtualjoystick";
import JoypadController from "./JoypadController";
import TickTask from "phaser3-rex-plugins/plugins/utils/ticktask/TickTask";


export default class PlayerController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private stateMachine: StateMachine;
    private obstacles: ObstaclesController;
    private powerUps!: PowerUps;
    private stats!: PlayerStats;
    private jp !: JoypadController;

    private health = 100;
    private playerSpeed = 5;
    private playerJump = 15;

    private lastBeeHit?: Phaser.Physics.Matter.Sprite;
    public sensors_bottom;
    public sensors_left;
    public sensors_right;
    private lasthit: number = 0;
    private poopbag = new Map<string, Phaser.Physics.Matter.Sprite>;
    private trashcan = new Map<string, Phaser.Physics.Matter.Sprite>;

    private deltaS: number = 0;

    private lastAction: number = 0;
    private lastThrow: number = 0;
    private throwDelay: number = 0;

    private ACCEL_FRAMES: number = 6;
    private DEACCEL_FRAMES: number = 3;

    private bonusObjects = ['berry', 'pow', 'star', 'rubber1'];
    private standingOnFloor: boolean = false;
    private standingOnPlatform: boolean = false;
    private wasStandingOnFloor: boolean = false;

    private cannotThrow: boolean = false;
    private delayedJump: boolean = false;
    private jumpCount: number = 0;
    private jumpActionValidUntil: number = 0;
    private sounds!: Map<string, Phaser.Sound.BaseSound>;
    private tilemap!: Phaser.Tilemaps.Tilemap;
    private colCat: number = 0;
    private spawn_x: number = 0;
    private spawn_y: number = 0;
    private playerButton1: boolean = false;
    private playerButton2: boolean = false;
    private LEANWAY: number = 8;

    private wasd;

    private joystick?: VirtualJoyStick;

    public name: string;

    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        cursors: Phaser.Types.Input.Keyboard.CursorKeys,
        obstacles: ObstaclesController,
        sounds: Map<string, Phaser.Sound.BaseSound>,
        tilemap: Phaser.Tilemaps.Tilemap,
        stats: PlayerStats,
        name: string,
    ) {
        this.scene = scene;
        this.sprite = sprite;
        this.cursors = cursors;
        this.obstacles = obstacles;
        this.sounds = sounds;
        this.tilemap = tilemap;
        this.stats = stats;
        this.throwDelay = 60;
        this.lastThrow = 0;
        this.name = name;
        this.powerUps = new PowerUps(this);
        this.spawn_x = this.sprite.body.position.x;
        this.spawn_y = this.sprite.body.position.y;
        this.createAnims();
        this.stateMachine = new StateMachine(this, this.name);

        this.scene.events.on('preupdate', this.preupdate, this);

        this.wasd = this.scene.input.keyboard.addKeys(
            {
                'up': Phaser.Input.Keyboard.KeyCodes.W,
                'down': Phaser.Input.Keyboard.KeyCodes.S,
                'left': Phaser.Input.Keyboard.KeyCodes.A,
                'right': Phaser.Input.Keyboard.KeyCodes.D
            }
        )

        this.scene.input.keyboard.once('keydown', () => {
            events.emit('level-start');
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
                onEnter: this.beeStompOnEnter
            })
            .addState('dead', {
                onEnter: this.deadOnEnter
            })
            .addState('throw', {
                onEnter: this.throwOnEnter,
                onUpdate: this.throwOnUpdate
            })
            .setState('idle');


        this.sprite.setOnCollideEnd((data: MatterJS.ICollisionPair) => {
            let body = data.bodyB as MatterJS.BodyType;
            let player = data.bodyA as MatterJS.BodyType;

            if (body.label === 'player')
                body = data.bodyA as MatterJS.BodyType;
            else if (player.label !== 'player')
                player = body;

            if (body.label === 'platform' || body.label === 'billboard') {
                this.standingOnPlatform = false;
            }
        });

        this.sprite.setOnCollideActive((data: MatterJS.ICollisionPair) => {
            let body = data.bodyB as MatterJS.BodyType;
            let player = data.bodyA as MatterJS.BodyType;

            if (body.label === 'player')
                body = data.bodyA as MatterJS.BodyType;
            else if (player.label !== 'player')
                player = body;

            if (body.label === 'platform') {
                this.handlePlatform(body);

                if (player.position.x < body.position.x || (player.position.x >= (body.position.x + 127))) {
                    // if colliding left or right, make the player fall down
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

        this.sprite.setOnCollide((data: MatterJS.ICollisionPair) => {
            let body = data.bodyB as MatterJS.BodyType;
            let player = data.bodyA as MatterJS.BodyType;

            if (body.label === 'player')
                body = data.bodyA as MatterJS.BodyType;
            else if (player.label !== 'player')
                player = body;

            if (this.obstacles.isType('spikes', body)) {
                this.stateMachine.setState('spike-hit');
                return;
            }

            if (this.obstacles.isType('exit', body)) {
                let next = this.obstacles.getValues('exit', body);
                this.scene.cameras.main.fadeOut(500, 0, 0, 0)
                this.scene.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, (c, e) => {
                    events.emit(next.event);
                    this.scene.scene.stop();
                    this.scene.scene.start(next.room);
                });
            }

            if (this.obstacles.isType('return', body)) {
                this.scene.matter.world.pause();
                let v = this.obstacles.getValues('return', body);
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
                let v = this.obstacles.getValues('goto', body);
                //this.sprite.setX(x).setY(y);
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
                    let v = this.obstacles.getValues('pipe', body);
                    let ry = this.sprite.y;
                    let rx = body.position.x;

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
                            this.scene.cameras.main.startFollow(this.sprite, true, undefined, undefined, undefined, 208);
                            this.scene.matter.world.resume();
                        }
                    });
                }
            }

            if (this.obstacles.isType('bonus', body)) {
                let v = this.obstacles.getValues('bonus', body);
                if (v.use > 0 && (player.position.y > body.position.y)) {
                    SceneFactory.playSound(this.sounds, 'bonustile');
                    let idx = ~~(Math.random() * this.bonusObjects.length);
                    while (v.last == idx) {
                        idx = ~~(Math.random() * this.bonusObjects.length);
                    }
                    let name = this.bonusObjects[idx];
                    const bee = this.scene.matter.add.sprite(body.position.x, body.position.y - 64, name, undefined, {
                        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
                        label: 'bonus'
                    });
                    bee.setName(name);
                    bee.setData('type', 'bonus');
                    bee.setBounce(0.2);
                    bee.setFriction(0.03);
                    bee.setMass(0.1);
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

                            bee.setTint(color);
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
                this.obstacles.isType('fire', body)) {
                this.lastBeeHit = body.gameObject;

                let bh = this.sprite.height * body.centerOfMass.y;
                let ph = 96 * player.centerOfMass.y;
                let yd = (body.position.y - player.position.y);

                if (player.position.y < body.position.y && yd > bh && yd <= (ph + bh)) {
                    this.stateMachine.setState('stomped');
                }
                else {
                    this.stateMachine.setState('hit');
                }

                return;
            }

            if (this.obstacles.isType('saw', body)) {
                this.stateMachine.setState('hit');
                return;
            }

            if (this.obstacles.isType('brick', body) && this.powerUps.isPower()) {
                if (player.position.y > (body.position.y + 32)) {
                    let v = this.obstacles.getValues('brick', body);

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
                return;
            }

            if (this.obstacles.isType('coinbrick', body) && this.powerUps.isPower()) {
                if (player.position.y > (body.position.y + 32)) {
                    let v = this.obstacles.getValues('coinbrick', body);

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
                let b = gameObject as Phaser.Physics.Matter.TileBody;

                if (!b.tile.visible) {
                    b.destroy();
                    return;
                }

                if (b.tile.properties.breakable == true && player.position.y <= body.position.y) {
                    let hits = b.tile.properties.hits || 0;

                    if (hits == 0) {
                        SceneFactory.playSound(this.sounds, 'breakingtile');
                        this.scene.time.delayedCall(b.tile.properties.breakdelay, () => {
                            b.tile.tilemapLayer.removeTileAt(b.tile.x, b.tile.y, true, true);
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
                    this.powerUps.add(sprite.name, this.scene);
                    sprite.destroy();
                    break;
                }
                case 'dropping': {
                    SceneFactory.playSound(this.sounds, 'pickupdropping');
                    this.collectPoop(sprite); //FIXME ??
                    break;
                }
                case 'coin': {
                    events.emit('coin-collected');
                    SceneFactory.playSound(this.sounds, 'pickupcoin');
                    this.bounceSpriteAndDestroy(sprite);

                    break;
                }
                case 'carrot': {
                    events.emit('carrot-collected');
                    SceneFactory.playSound(this.sounds, 'pickupcarrot');
                    this.health = Phaser.Math.Clamp(this.health + 1, 0, 100);
                    sprite.destroy();
                    break;
                }
                case 'heart': {
                    const value = sprite.getData('healthPoints') ?? 25;
                    let vnew = (this.health + value);
                    SceneFactory.playSound(this.sounds, 'pickuphealth');
                    if (vnew > 100) {
                        events.emit('lives-changed', (this.stats.livesRemaining + 1));
                        vnew = 100 - vnew;
                    }
                    this.health = Phaser.Math.Clamp(vnew, 0, 100);
                    events.emit('health-changed', this.health);
                    events.emit('score-changed', 100);
                    sprite.destroy();
                    break;
                }
                case 'platform': {
                    this.handlePlatform(body);
                    break;
                }
                case 'billboard': {
                    SceneFactory.playSound(this.sounds, 'click');
                    sprite.setFrame(Phaser.Math.Between(0, 14));
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
                        let v = this.obstacles.getValues('changeskin', body);
                        if (v.use > 0) {
                            v.use = v.use - 1;
                            this.bounceSprite(sprite);
                            SceneFactory.playSound(this.sounds, 'changeskin');
                            events.emit(sprite.name + "-touched", sprite, this);
                            events.emit('score-changed', 1000);
                        }
                    }
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

    setJoystick(scene: Phaser.Scene, width: number) {
        if (scene.game.device.os.desktop)
            return;

        this.jp = new JoypadController(scene, width);

        this.jp.getB().on('click', () => {
            if (!this.cannotThrow) {
                this.throwOnEnter();
                this.jp.fireB();
                this.jp.startTimerNow();
            }

        }, this);
        this.jp.getA().on('click', () => {
            this.playerButton2 = true;
            this.jp.fireA();
            this.jp.startTimerNow();
        }, this);

        this.joystick = this.jp.getStick();
    }

    takeDamage(dmg: number, sound: string) {
        this.health = this.health - dmg;
        this.health = Phaser.Math.Clamp(this.health, 0, 100);
        SceneFactory.playSound(this.sounds, sound);
        this.hitTween();
        events.emit('health-changed', this.health);
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

    collectPoop(turd: Phaser.Physics.Matter.Sprite) {
        if (this.trashcan.has(turd.name)) {
            console.log("Already destroyed " + turd.name);
        }
        else {
            SceneFactory.playSound(this.sounds, 'droppinghits');
            turd.flipX = this.sprite.flipX;
            turd.play('splash').once('animationcomplete', () => {


                this.trashcan.set(turd.name, turd);

            });
        }
    }

    destroy() {
        this.scene.events.off('preupdate', this.preupdate, this);
        this.poopbag.clear();
        this.trashcan.clear();
        this.sprite.destroy();
        this.stateMachine.destroy();
        this.obstacles.destroy();
        this.sounds.clear();
    }

    preupdate(time: number, delta: number) {

        this.trashcan.forEach((value, key) => {
            this.poopbag.delete(key);
            //value.destroy();
            value.setActive(false);
            value.setStatic(true);
            value.setOnCollide(() => { });
            value.setCollidesWith(0);
            value.setCollisionGroup(8);
            value.setCollisionCategory(16);
            value.setAlpha(0);
            //FIXME
            value.destroy();
        });

        this.trashcan.clear();

        this.poopbag.forEach((turd) => {

            let v = turd.getData('spawned');
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
        this.stateMachine.update(deltaTime);

        this.cannotThrow = !this.powerUps.isPoop();
        this.standingOnPlatform = false;

        this.playerButton1 = false;
        this.playerButton2 = false;

        if (this.jp !== undefined) {
            this.jp.setBActive(!this.cannotThrow);
            this.jp.startTimer();
        }

        if (this.sprite.body.position.y > (
            this.tilemap.heightInPixels - 32)) {
            console.log("World hit change state: " + this.sprite.body.position.y);
            this.stateMachine.setState('world-hit');
        }


    }

    private setHealth(value: number) {
        if (this.powerUps.isInvincible()) {
            if (value > 0) {
                let newhealth = Phaser.Math.Clamp(value, 0, 100);
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
        let d = (this.scene.game.loop.frame - this.lastAction);

        if (d > 120) {
            this.sprite.play(this.getEventName('facing'));
        }
        else {
            this.sprite.play(this.getEventName('idle'));
        }

        if (this.isLeft() || this.isRight()) {
            this.stateMachine.setState('walk');
        }

        this.playerThrows();
        this.playerJumps();

        this.updateVelocities('idle');
    }

    public printinfo() {
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

        let delta = this.scene.game.loop.frame - this.lastThrow;
        if (delta < this.throwDelay) {
            if (this.isLeft() || this.isRight()) {
                this.stateMachine.setState('walk');
            }
            else {
                this.stateMachine.setState('idle');
            }
            return;
        }

        let name = 'dropping' + UniqueID.genUniqueID();
        let dropping = this.scene.matter.add.sprite(this.sprite.body.position.x - 12, this.sprite.body.position.y - 21, 'dropping', undefined, {
            vertices: [{ x: 0, y: 0 }, { x: 24, y: 0 }, { x: 24, y: 24 }, { x: 0, y: 24 }],
            label: 'dropping',
            angle: 45,
            restitution: 1.0,
        });
        this.poopbag.set(name, dropping);

        let turdSpeed = 24;
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
            let a = data.bodyB as MatterJS.BodyType;
            let b = data.bodyA as MatterJS.BodyType;

            if (b.gameObject?.name === undefined) {
                let tile = this.tilemap.getTileAtWorldXY(b.position.x, b.position.y, undefined, this.scene.cameras.main, 'ground');
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
                        SceneFactory.playSound(this.sounds, 'droppingbounces');

                        break;
                    case 'spikes':
                        SceneFactory.playSound(this.sounds, 'lava');
                        break;
                    case 'fire':
                        break;
                    case 'player':
                        if (a.gameObject?.name !== undefined)
                            this.collectPoop(a.gameObject);

                        break;
                    case 'dropping':
                        if (a.gameObject !== undefined)
                            this.collectPoop(a.gameObject);

                        this.collectPoop(b.gameObject);
                        break;


                    default:
                        if (b.gameObject?.name !== undefined) {
                            if (a.velocity.x > 3 || a.velocity.x < -3) {
                                events.emit(b.gameObject.name + '-stomped', b.gameObject);

                                if (b.gameObject !== undefined) {
                                    let score = 100;
                                    let btxt = this.scene.add.bitmapText(b.position.x, b.position.y, 'press_start',
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
            frames: this.sprite.anims.generateFrameNames('dropping-splash', {
                start: 1,
                end: 3,
                prefix: 'Splash',
                suffix: '.png'
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

        this.setHealth(0);
        this.lasthit = this.scene.time.now;
        SceneFactory.playSound(this.sounds, 'lava');

        this.scene.time.delayedCall(100, () => {
            this.stateMachine.setState('dead');
            console.log("Player dies");
        });

        console.log("World hit taken");
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

        this.setHealth(this.health - 25);
        this.lasthit = this.scene.time.now;

        SceneFactory.playSound(this.sounds, 'hit');

        this.stateMachine.setState('idle');

        if (this.lastBeeHit) {
            if (this.sprite.x < this.lastBeeHit.x) {
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

    private beeStompOnEnter() {
        this.sprite.setVelocityY(-10);
        if (this.lastBeeHit !== undefined) {
            let body = this.lastBeeHit.body;
            let score = 100;
            let b = this.scene.add.bitmapText(body.position.x, body.position.y, 'press_start',
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

        events.emit(this.lastBeeHit?.name + '-stomped', this.lastBeeHit);
        SceneFactory.playSound(this.sounds, 'stomped');
        this.scene.cameras.main.shake(100, 0.025);

        this.stateMachine.setState('idle');
    }

    private deadOnEnter() {
        this.sprite.play(this.getEventName('dead'));

        this.sprite.setOnCollide(() => { });

        this.scene.cameras.main.shake(500);
        this.scene.time.delayedCall(250, () => {
            this.scene.cameras.main.fade(250);
        });

        this.stats.livesRemaining = (this.stats.livesRemaining > 0 ? this.stats.livesRemaining - 1 : 0);

        this.powerUps.reset();

        events.emit('lives-changed', this.stats.livesRemaining);

        if (this.stats.livesRemaining == 0) {

            this.scene.time.delayedCall(1000, () => {
                events.emit('reset-game');
                this.scene.scene.start('game-over');
            });

        }
        else {
            this.scene.time.delayedCall(1000, () => {
                this.scene.scene.restart();
            });
        }
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

    public enableAntiGravity() {
        this.sprite.setIgnoreGravity(true);
    }

    public disableAntiGravity() {
        this.sprite.setIgnoreGravity(false);
    }

    private updateVelocities(state: string) {

        let d = (this.scene.game.loop.frame - this.lastAction);
        this.deltaS = (d > this.ACCEL_FRAMES ? this.playerSpeed : (d / this.ACCEL_FRAMES) * this.playerSpeed);

        let speed = this.getSpeed(this.deltaS); // this.deltaS;

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
        let tile = this.tilemap.getTileAtWorldXY(
            x,
            y,
            false, this.scene.cameras.main, 'ground');

        if (tile != null) {
            if (tile.canCollide && tile.visible && tile.collides) {
                let dmg = tile.properties?.damage;
                let bt = tile.properties?.breakable;
                if ((dmg === undefined || dmg <= 0) && (bt === undefined || bt == false)) {
                    //tile.tint = 0xff0000;//debug
                    return true;
                }
            }
        }
        return false;
    }

    public updateSpawnlocation() {
        let nx = ~~(this.sprite.body.position.x / 64) * 64;
        let ny = ~~((this.sprite.body.position.y + 48) / 64) * 64;
        let nny = ~~((this.sprite.body.position.y) / 64) * 64;
        if (
            this.isValidTile(
                nx,
                ny,
            )) {
            this.scene.game.registry.set('playerX', nx);
            this.scene.game.registry.set('playerY', nny);
            //FIXME: call this less often
        }
    }

    private handlePlatform(body: MatterJS.BodyType) {
        let vec = body.gameObject?.getData('relpos');
        this.sprite.setPosition(
            this.sprite.body.position.x + vec.x,
            this.sprite.body.position.y + vec.y
        );

        this.sprite.body.velocity.x = vec.x;
        this.sprite.body.velocity.y = vec.y;
        this.standingOnPlatform = true;

    }

    private bounceTile(body: MatterJS.BodyType) {
        let tile = this.tilemap.getTileAtWorldXY(body.position.x, body.position.y, false, this.scene.cameras.main, 'ground');
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
        let oldY: number = sprite.body.position.y;
        this.scene.tweens.add({
            targets: sprite,
            y: sprite.body.position.y - 32,
            duration: 100,
            ease: 'Bounce',
            onComplete: () => {
                sprite.setY(oldY);
            },
            repeat: 0,
            yoyo: true,
        });
    }

    private bounceSpriteAndDestroy(sprite: Phaser.Physics.Matter.Sprite) {
        let oldY: number = sprite.body.position.y;
        sprite.setCollidesWith([]);

        this.scene.tweens.add({
            targets: sprite,
            alpha: 0,
            y: sprite.body.position.y - 64,
            duration: 500,
            ease: 'Bounce',
            onComplete: (t) => {
                sprite.destroy();
            },
            repeat: 0,
            yoyo: false,
        });
    }

    private createAnims() {
        this.sprite.anims.create({
            key: 'player1-idle',
            frameRate: 5,
            frames: this.sprite.anims.generateFrameNames('rabbit', {
                start: 1,
                end: 2,
                prefix: '5_Turn',
                suffix: '.png'
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
                suffix: '.png'
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
                suffix: '.png'
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
                suffix: '.png'
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
                    suffix: '.png'
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
                    suffix: '.png'
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
                suffix: '.png'
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
                suffix: '.png'
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
                suffix: '.png'
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
                suffix: '.png'
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
                    suffix: '.png'
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
                    suffix: '.png'
                })
        });
    }


    private isDown(): boolean {
        return (this.joystick?.down || this.cursors.down.isDown || this.wasd.down.isDown);
    }
    private isUp(): boolean {
        return (this.joystick?.up || this.cursors.up.isDown || this.wasd.up.isDown);
    }
    private isLeft(): boolean {
        return (this.joystick?.left || this.cursors.left.isDown || this.wasd.left.isDown);
    }
    private isRight(): boolean {
        return (this.joystick?.right || this.cursors.right.isDown || this.wasd.right.isDown);
    }
    private isShift(): boolean {
        return this.cursors.shift.isDown || this.playerButton1;
    }
    private isSpace(): boolean {
        return Phaser.Input.Keyboard.JustDown(this.cursors.space) || this.playerButton2;
    }

    private withForce(): number {
        let f = (this.joystick === undefined ? 1 : this.joystick.force);
        return f;
    }

    private getSpeed(num: number) {
        if (this.joystick !== undefined) {
            let vx = this.jp.dampenVelocityX(num);
            return vx;
        }
        return num;
    }


}