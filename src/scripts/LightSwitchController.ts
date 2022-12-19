import StateMachine from "./StateMachine";
import { sharedInstance as events } from './EventManager';
import PlayerController from "./PlayerController";

export default class LightSwitchController {
    private scene: Phaser.Scene;
    private sprite: Phaser.Physics.Matter.Sprite;
    private stateMachine: StateMachine;
    private player: PlayerController;

    private status = false;
    private name: string;
    private spotlight: Phaser.GameObjects.Light;

    private layers: Phaser.Tilemaps.TilemapLayer[] = [];

    constructor(
        scene: Phaser.Scene,
        sprite: Phaser.Physics.Matter.Sprite,
        player: PlayerController,
        name: string
    ) {
        this.scene = scene;
        this.sprite = sprite;
        this.name = name;
        this.player = player;
        this.stateMachine = new StateMachine(this);

        this.stateMachine.addState('idle', {
            onEnter: this.idleOnEnter,
            onUpdate: this.idleUpdate,
        })
            .setState('idle');

        this.spotlight = scene.lights
            .addLight(0, 0, 200)
            .setColor(0xffffff)
            .setIntensity(2)
            .setVisible(false);

        events.on(this.name + '-touched', this.handleTouched, this);
    }

    destroy() {
        events.off(this.name + '-touched', this.handleTouched, this);

        this.sprite.destroy();
    }

    update(deltaTime) {
        this.stateMachine.update(deltaTime);
    }

    public getSprite() {
        return this.sprite;
    }

    public setLayers(tileLayers: Phaser.Tilemaps.TilemapLayer[]) {
        this.layers = tileLayers;
        this.layers.forEach((l) => l.setAlpha(0.2)); // lights are "off" by default

        const bodies: Phaser.GameObjects.GameObject[] = this.scene.children.list.filter(x => x instanceof Phaser.Physics.Matter.Sprite);
        bodies.forEach((e) => {
            const b = e as Phaser.Physics.Matter.Sprite;
            b.tint = (this.status ? 0xffffff : 0x322e32);
        });
    }

    private idleOnEnter() {
        this.sprite.setFrame(this.status ? 1 : 0);
    }

    private idleUpdate() {
        if (this.status) {
            this.spotlight.x = this.player.getX();
            this.spotlight.y = this.player.getY();
        }
    }

    private handleTouched(lightswitch: Phaser.Physics.Matter.Sprite) {
        if (this.sprite !== lightswitch) {
            return;
        }

        this.status = !this.status;
        this.spotlight.setVisible(this.status);
        this.sprite.setFrame(this.status ? 1 : 0);
        this.layers.forEach((l) => l.setAlpha(this.status ? 1 : 0.2));

        const bodies: Phaser.GameObjects.GameObject[] = this.scene.children.list.filter(x => x instanceof Phaser.Physics.Matter.Sprite);
        bodies.forEach((e) => {
            const b = e as Phaser.Physics.Matter.Sprite;
            b.tint = (this.status ? 0xffffff : 0x322e32);
        });

    }


}