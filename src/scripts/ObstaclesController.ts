const createKey = (name: string, id: number) => {
    return name + id;
}

export default class ObstaclesController {
    private obstacles = new Map<string, MatterJS.BodyType>();
    private values = new Map();

    add(name: string, body: MatterJS.BodyType) {
        const key = createKey(name, body.id);
        if (this.obstacles.has(key)) {
            throw new Error('obstacle ' + name + '.' + body.id + ' already exits at this key');
        }
        this.obstacles.set(key, body);
    }

    addWithValues(name: string, body: MatterJS.BodyType, object) {
        const key = createKey(name, body.id);
        if (this.obstacles.has(key)) {
            throw new Error('obstacle already exits at this key');
        }
        this.values.set(key, object);
        this.obstacles.set(key, body);
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

    destroy() {
        this.obstacles.clear();
        this.values.clear();
    }
}