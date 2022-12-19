import Phaser from 'phaser'

export default class Rabbitmitter {

    private sprite!: MatterJS.BodyType;
    private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;
    private particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    private scene: Phaser.Scene;
    private layers: string[] = ['ground', 'layer1'];

    constructor(scene, x, y, hits, pem, sprite) {
        this.scene = scene;
        this.sprite = sprite;
        this.particles = scene.add.particles(pem);
        this.emitter = this.particles.createEmitter({
            speed: 400,
            scale: { start: 0.66, end: 0 },  // for some strange reason, there is a crash on images of size 64x64 'reading halfWidth'
            blendMode: '',
            lifespan: 2000,
            gravityY: 1000,
            angle: {
                min: -90 - 35,
                max: -45 - 35,
            },
            frequency: -1
        });
    }

    removeBrick(map: Phaser.Tilemaps.Tilemap, body: MatterJS.BodyType) {
        const x = ~~(body.position.x / 64);
        const y = ~~(body.position.y / 64);

        this.layers.forEach((e) => {
            const tile = map.getTileAt(x, y, false, e);
            if (tile != null) {
                tile.setVisible(false);
            }
        });

        this.scene.matter.world.remove(body);
        this.emitter.stop();
        this.particles.destroy();
    }

    emitParticle(map: Phaser.Tilemaps.Tilemap, body: MatterJS.BodyType) {
        const x = ~~(body.position.x / 64);
        const y = ~~(body.position.y / 64);

        const tile = map.getTileAt(x, y, false, 'ground');
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

        this.emitter.emitParticle(Phaser.Math.Between(3, 5), body.position.x, body.position.y);
    }

}