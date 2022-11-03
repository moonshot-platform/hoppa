

export function createCarrot(ctx, x, y, width, height) {
    ctx.anims.create({
        key: 'carrot',
        frameRate: 5,
        frames: ctx.anims.generateFrameNumbers('carrot', { start: 0, end: 5, first: 0 }),
        repeat: -1
    });
    const carrot = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'carrot', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        isStatic: true,
        isSensor: true, label: 'carrot'
    }).play('carrot');
    carrot.setData('type', 'carrot');
}

export function createCoin(ctx, x, y, width, height) {
    ctx.anims.create({
        key: 'coin',
        frameRate: 5,
        frames: ctx.anims.generateFrameNumbers('coin', { start: 0, end: 4, first: 0 }),
        repeat: -1
    });
    const coin = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'coin', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        isStatic: true,
        isSensor: true, label: 'coin'
    }).play('coin');
    coin.setData('type', 'coin');
}

export function createLab(ctx, x, y, width, height) {
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
}

export function createHealth(ctx, x, y, width, height) {
    const health = ctx.matter.add.sprite(x, y, 'heart', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        isStatic: true,
        isSensor: true
    });

    health.setData('type', 'heart');
    health.setData('healthPoints', 25);
}

export function createCrate(ctx, x, y, width, height) {
    const crate = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'crate', undefined, {
        vertices: [{ x: 1, y: 1 }, { x: 64, y: 1 }, { x: 64, y: 64 }, { x: 1, y: 64 }],
    });
    crate.setMass(0.1);
    crate.setData('type', 'crate');
}