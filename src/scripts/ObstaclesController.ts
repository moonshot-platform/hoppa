const createKey = (name: string, id: number) => {
    return name + id;
}

export default class ObstaclesController {
    private obstacles = new Map<string, MatterJS.BodyType>();
    private sprites = new Map<string, Phaser.Physics.Matter.Sprite>();
    
    private values = new Map();

    add(name: string, sprite: Phaser.Physics.Matter.Sprite| undefined, body: MatterJS.BodyType) {
        const key = createKey(name, body.id);
        if (this.obstacles.has(key)) {
            throw new Error('obstacle ' + name + '.' + body.id + ' already exits at this key');
        }
        this.obstacles.set(key, body);
        if( sprite !== undefined ) 
            this.sprites.set(key, sprite);
    }

    addWithValues(name: string,  sprite: Phaser.Physics.Matter.Sprite| undefined, body: MatterJS.BodyType,object: any) {
        const key = createKey(name, body.id);
        if (this.obstacles.has(key)) {
            throw new Error('obstacle already exits at this key');
        }
        this.values.set(key, object);
        this.obstacles.set(key, body);
        if( sprite !== undefined)
            this.sprites.set(key, sprite);
    }

    getValues(name: string, body: MatterJS.BodyType) {
        const key = createKey(name, body.id);
        return this.values.get(key);
    }

    get(name: string, body: MatterJS.BodyType) {
        const key = createKey(name, body.id);
        return this.obstacles.get(key);
    }

    remove(name: string, body: MatterJS.BodyType) {
        const key = createKey(name, body.id);
        return this.obstacles.delete(key);
    }

    isType(name: string, body: MatterJS.BodyType) {
        const key = createKey(name, body.id);
        return this.obstacles.has(key);
    }

    destroy(scene: Phaser.Scene) {

        this.sprites.forEach( (value, key ) => {
             value.destroy();
             this.obstacles.delete( key );
        })

        this.obstacles.forEach( body => {
            scene.matter.world.remove(body);
        } );
        this.obstacles.clear();
        this.values.clear();
        this.sprites.clear();
    }
}