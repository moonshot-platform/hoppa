export function createCarrot(ctx, x, y, width, height): Phaser.Physics.Matter.Sprite {
    ctx.anims.create({
        key: 'carrot',
        frameRate: 5,
        frames: ctx.anims.generateFrameNumbers('carrot', { start: 0, end: 5 }),
        repeat: -1
    });
    const carrot = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'carrot', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        isStatic: true,
        isSensor: true, label: 'carrot'
    }).play({key: 'carrot', startFrame: Phaser.Math.Between(0,5) }, true);
    carrot.setData('type', 'carrot');
    return carrot;
}

export function createCoin(ctx, x, y, width, height): Phaser.Physics.Matter.Sprite {
    ctx.anims.create({
        key: 'coin',
        frameRate: 5,
        frames: ctx.anims.generateFrameNumbers('coin', { start: 0, end: 4 }),
        repeat: -1
    });
    
    const coin = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'coin', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        isStatic: true,
        isSensor: true, label: 'coin'
    }).play({key: 'coin', startFrame: Phaser.Math.Between(0,4) }, true);
    
    coin.setData('type', 'coin');
    return coin;
}

export function createLab(ctx, x, y, width, height): Phaser.Physics.Matter.Sprite {
    ctx.anims.create({
        key: 'lab',
        frameRate: 8,
        frames: ctx.anims.generateFrameNumbers('lab', { start: 0, end: 3, first: 0 }),
        repeat: -1
    });
    const lab = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'lab', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 136 }, { x: 0, y: 136 }],
        isStatic: true,
        isSensor: true, label: 'lab'
    }).play('lab');
    lab.setData('type', 'lab');
    return lab;
}

export function createHealth(ctx, x, y, width, height): Phaser.Physics.Matter.Sprite {
    const health = ctx.matter.add.sprite(x + (width * 0.5), y+ (height * 0.5), 'heart', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        isStatic: true,
        isSensor: true
    });

    health.setData('type', 'heart'); 
    health.setData('healthPoints', 25);
    return health;
}

export function createTrashcan(ctx, x, y, width, height):Phaser.Physics.Matter.Sprite {
    const trashcan = ctx.matter.add.sprite(x + (width * 0.5), y+ (height * 0.5), 'trashcan', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 82, y: 0 }, { x: 82, y: 74 }, { x: 0, y: 74 }],
        isStatic: true,
        isSensor: true
    });

    trashcan.setData('type', 'heart'); 
    trashcan.setData('healthPoints', 25);
    trashcan.setCollidesWith([8]);
    return trashcan;
}

export function createCrate(ctx, x, y, width, height): Phaser.Physics.Matter.Sprite {
    const crate = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'crate', undefined, {
        vertices: [{ x: 1, y: 1 }, { x: 64, y: 1 }, { x: 64, y: 64 }, { x: 1, y: 64 }],
    });
    crate.setMass(0.1);
    crate.setData('type', 'crate');
    return crate;
}

export function createKey(ctx, x, y, width, height, controller): Phaser.Physics.Matter.Sprite {
    const key = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'key', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        label: 'key'
    });
    key.setCollidesWith([1,2]);
    key.setCollisionGroup(4);
    key.setMass(0.1);
    key.setData('type', 'key');
    key.setIgnoreGravity(false);
    key.setName('key');

    return key;
}