import BatController from "./BatController";
import BearController from "./BearController";
import BirdController from "./BirdController";
import BombController from "./BombController";
import BossController from "./BossController";
import CrabController from "./CrabController";
import CrowController from "./CrowController";
import DoorController from "./DoorController";
import DragonController from "./DragonController";
import FireController from "./FireController";
import FireWalkerController from "./FireWalkerController";
import FlowerController from "./FlowerController";
import FlyController from "./FlyController";
import LavaController from "./LavaController";
import LightSwitchController from "./LightSwitchController";
import MonsterController from "./MonsterController";
import PlantController from "./PlantController";
import PlayerController from "./PlayerController";
import SawController from "./SawController";
import TNTController from "./TNTController";
import ZeppelinController from "./ZeppelinController";

export function creatureCreateDragon(ctx, x, y, width, height, enemyCat, collideWith, controller, player) {
    const dragon = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'dragon', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 96 }, { x: 0, y: 96 }],
        label: 'dragon'
    })
        .setFixedRotation();
    dragon.setMass(0.1);
    dragon.setDepth(1);
    dragon.setCollisionCategory(enemyCat);
    dragon.setCollidesWith(collideWith);
    dragon.setName('dragon');
    dragon.setData('type', 'dragon');

    controller.add('dragon', dragon,dragon.body as MatterJS.BodyType);

    return new DragonController(ctx, dragon, player, dragon.name, enemyCat, collideWith);
}

export function creatureCreateBomb(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const bomb = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'bomb', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        label: 'bomb'
    })
        .setFixedRotation();
    bomb.setMass(0.1);
    bomb.setDepth(1);
    bomb.setCollisionCategory(enemyCat);
    bomb.setCollidesWith(collideWith);
    bomb.setName('bomb');
    bomb.setData('type', 'bomb');

    controller.add('bomb', bomb,bomb.body as MatterJS.BodyType);

    return new BombController(ctx, bomb, bomb.name);
}

export function createCreatureMonster(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const monster = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'monster', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 128 }, { x: 0, y: 128 }],
        label: 'monster'
    })
        .setFixedRotation();
    monster.setMass(0.1);
    monster.setDepth(1);
    monster.setCollisionCategory(enemyCat);
    monster.setCollidesWith(collideWith);
    monster.setName('monster');
    monster.setData('type', 'monster');

    controller.add('monster',monster, monster.body as MatterJS.BodyType);

    return new MonsterController(ctx, monster, monster.name)
}

export function createCreatureBat(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const bat = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'bat', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        label: 'bat'
    })
        .setFixedRotation();
    bat.setDepth(1);
    bat.setMass(0.1);
    bat.setCollisionCategory(enemyCat);
    bat.setIgnoreGravity(true);
    bat.setCollidesWith(collideWith);
    bat.setName('bat');
    bat.setData('type', 'bat');

    controller.add('bat',bat, bat.body as MatterJS.BodyType);

    return new BatController(ctx, bat, bat.name);
}

export function createCreatureBird(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const bird = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'bird', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        label: 'bird'
    })
        .setFixedRotation();
    bird.setDepth(1);
    bird.setMass(0.1);
    bird.setCollisionCategory(enemyCat);
    bird.setIgnoreGravity(true);
    bird.setCollidesWith(collideWith);
    bird.setName('bird');
    bird.setData('type', 'bird');

    controller.add('bird', bird,bird.body as MatterJS.BodyType);

    return new BirdController(ctx, bird, bird.name);
}

export function createCreatureCrow(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const crow = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'crow', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        label: 'crow'
    })
        .setFixedRotation();
    crow.setDepth(1);
    crow.setMass(0.1);
    crow.setCollisionCategory(enemyCat);
    crow.setIgnoreGravity(true);
    crow.setCollidesWith(collideWith);
    crow.setName('crow');
    crow.setData('type', 'crow');

    controller.add('crow',crow, crow.body as MatterJS.BodyType);

    return new CrowController(ctx, crow, crow.name);
}

export function createCreatureFly(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const fly = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'fly', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        label: 'fly'
    })
        .setFixedRotation();
    fly.setDepth(1);
    fly.setMass(0.1);
    fly.setCollisionCategory(enemyCat);
    fly.setIgnoreGravity(true);
    fly.setCollidesWith(collideWith);
    fly.setName('fly');
    fly.setData('type', 'fly');
    fly.set
    controller.add('fly',fly, fly.body as MatterJS.BodyType);

    return new FlyController(ctx, fly, fly.name);
}

export function createCreatureCrab(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const crab = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'crab', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        label: 'crab'
    })
        .setFixedRotation();
    crab.setDepth(1);
    crab.setMass(0.1);
    crab.setCollisionCategory(enemyCat);
    crab.setCollidesWith(collideWith);
    crab.setName('crab');
    crab.setData('type', 'crab');

    controller.add('crab', crab,crab.body as MatterJS.BodyType);

    return new CrabController(ctx, crab, crab.name)
}

export function createCreatureFire(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const fire = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'fire', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        label: 'fire'
    })
        .setFixedRotation();
    fire.setDepth(1);
    fire.setMass(0.1);
    fire.setCollisionCategory(enemyCat);
    fire.setCollidesWith(collideWith);
    fire.setName('fire');

    controller.add('fire',fire, fire.body as MatterJS.BodyType);

    return new FireController(ctx, fire, fire.name);
}

export function createCreatureSaw(ctx, x, y, width, height, rot, enemyCat, collideWith, controller) {
    const saw = ctx.matter.add.sprite(x + (width * 0.5), y, 'saw', undefined, {
        angle: rot * Phaser.Math.DEG_TO_RAD,
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 32 }, { x: 0, y: 32 }],
        label: 'saw',
    })
        .setFixedRotation();
    saw.setDepth(10);
    saw.setIgnoreGravity(true);
    saw.setMass(10);
    saw.setCollisionCategory(enemyCat);
    saw.setCollidesWith(collideWith);
    saw.setName('saw');

    controller.add('saw',saw, saw.body as MatterJS.BodyType);

    return new SawController(ctx, saw, saw.name);
}

export function creatureCreatureFireWalker(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const firewalker = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'firewalker', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        label: 'firewalker'
    })
        .setFixedRotation();
    firewalker.setDepth(1);
    firewalker.setMass(0.1);
    firewalker.setCollisionCategory(enemyCat);
    firewalker.setCollidesWith(collideWith);
    firewalker.setName('firewalker');
    firewalker.setData('type', 'firewalker');

    controller.add('firewalker', firewalker, firewalker.body as MatterJS.BodyType);

    return new FireWalkerController(ctx, firewalker, firewalker.name);
}

export function createCreatureFlower(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const flower = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'flower', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        label: 'flower'
    })
        .setFixedRotation();
    flower.setStatic(true);
    flower.setCollisionCategory(enemyCat);
    flower.setCollidesWith(collideWith);
    flower.setName('flower');
    flower.setData('type', 'flower');

    controller.add('flower', flower,flower.body as MatterJS.BodyType);

    return new FlowerController(ctx, flower, flower.name);
}

export function createCreaturePlant(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const plant = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'plant', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 128 }, { x: 0, y: 128 }],
        label: 'plant'
    })
        .setFixedRotation();
    plant.setStatic(true);
    plant.setCollisionCategory(enemyCat);
    plant.setCollidesWith(collideWith);
    plant.setName('plant');

    controller.add('plant', plant,plant.body as MatterJS.BodyType);

    return new PlantController(ctx, plant, plant.name);
}

export function createCreatureLava(ctx, name,x, y, width, height, enemyCat, collideWith, controller) {
    const lava = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), name, undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        label: name
    })
        .setFixedRotation();
    lava.setStatic(true);
    lava.setCollisionCategory(enemyCat);
    
    if( name === 'lava-center' )
    {
        lava.setCollidesWith(collideWith);
    }  
    else { // lava-top : fallthrough
        lava.setDepth(10);
        lava.setCollidesWith(6);
    }

    lava.setName(name);
    lava.setData('type', name);

    controller.add(name, lava,lava.body as MatterJS.BodyType);

    return new LavaController(ctx, lava, lava.name);
}

export function createCreatureBear(ctx, x, y, width, height, enemyCat, collideWith, controller, playerController: PlayerController ) {
    const bear = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'bear', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 68, y: 0 }, { x: 64, y: 68 }, { x: 0, y: 68 }],
        label: 'bear'
    })
        .setFixedRotation();
    bear.setStatic(true);
    bear.setCollisionCategory(enemyCat);
    bear.setCollidesWith(collideWith);
    bear.setName('bear');

    controller.add('bear', bear,bear.body as MatterJS.BodyType);

    return new BearController(ctx, bear, bear.name, playerController);
}

export function createCreatureBoss(ctx, x, y, width, height, enemyCat, collideWith, controller, playerController: PlayerController ) {
    const boss = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'boss', undefined, {
       vertices: [{x: 98, y: 92 }, {x: 190, y: 92}, {x: 190, y: 155 }, {x: 98 , y: 155 }],
       label: 'boss'
    })
        .setFixedRotation();
    boss.setStatic(true);
    boss.setCollisionCategory(enemyCat);
    boss.setCollidesWith(collideWith);
    boss.setName('boss');

    controller.add('boss', boss,boss.body as MatterJS.BodyType);

    return new BossController(ctx, boss, boss.name, enemyCat, collideWith, playerController, controller);
}


export function createCreatureTNT(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const tnt = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'tnt', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 68 }, { x: 0, y: 68 }],
        label: 'tnt'
    })
        .setFixedRotation();
    tnt.setStatic(true);
    tnt.setCollisionCategory(enemyCat);
    tnt.setCollidesWith(collideWith);
    tnt.setName('tnt');

    controller.add('tnt', tnt,tnt.body as MatterJS.BodyType);

    return new TNTController(ctx, tnt, tnt.name);
}

export function createCreatureZeppelin1(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const zep = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'zeppelin1', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 128, y: 0 }, { x: 128, y: 78 }, { x: 0, y: 78 }],
        label: 'zeppelin1'
    })
        .setFixedRotation();
    zep.setDepth(1);
    zep.setMass(5);
    zep.setIgnoreGravity(true);
    zep.setCollisionCategory(enemyCat);
    zep.setCollidesWith(collideWith);
    zep.setName('zeppelin1');
    zep.setData('type', 'zeppelin');

    controller.add('zeppelin1',zep, zep.body as MatterJS.BodyType);

    return new ZeppelinController(ctx, zep, zep.name);
}

export function createCreatureZeppelin2(ctx, x, y, width, height, enemyCat, collideWith, controller) {
    const zep = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'zeppelin2', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 128, y: 0 }, { x: 128, y: 78 }, { x: 0, y: 78 }],
        label: 'zeppelin2'
    })
        .setFixedRotation();
    zep.setDepth(1);
    zep.setMass(5);
    zep.setIgnoreGravity(true);
    zep.setCollisionCategory(enemyCat);
    zep.setCollidesWith(collideWith);
    zep.setName('zeppelin1');
    zep.setData('type', 'zeppelin');
    zep.setName('zeppelin2');

    controller.add('zeppelin2', zep,zep.body as MatterJS.BodyType);

    return new ZeppelinController(ctx, zep, zep.name);
}

export function createLightSwitch(ctx, x, y, width, height, rotation, enemyCat, collideWith, controller, player) {
    const zelightswitch = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'lightswitch', undefined, {
        vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
        isStatic: true,
        label: 'lightswitch'
    })
        .setFixedRotation();
    zelightswitch.setData('type', 'lightswitch');
    zelightswitch.setName('lightswitch');
    zelightswitch.setCollisionCategory(enemyCat);
    zelightswitch.setCollidesWith(collideWith);

    controller.add('lightswitch', zelightswitch, zelightswitch.body as MatterJS.BodyType);

    return new LightSwitchController(ctx, zelightswitch, player, zelightswitch.name);
}

export function createWindow(ctx,x,y,width,height,rotation,enemyCat, collideWith, controller, player) {
    const win = ctx.matter.add.sprite( x + (width * 0.5), y + (height * 0.5),
                 'doors', undefined, {
        isStatic: true,
        label: 'window',
        vertices: [{ x:0 , y: 0} , { x: 132, y: 0 }, { x: 132, y: 148}, { x:0 , y: 148}]
    }).setFixedRotation();
    win.setData('type', 'window');
    win.setName('window');
    win.setCollisionCategory(enemyCat);
    win.setCollidesWith([6]);

    controller.add('window', win, win.body as MatterJS.BodyType);
    
    return new DoorController(ctx, win, 'window');
}


