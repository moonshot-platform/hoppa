
import * as CreatureHelper from '../scripts/CreatureHelper';
import * as ObjectHelper from '../scripts/ObjectHelper';
import MovingPlatform from '../scripts/MovingPlatform';
import Rabbitmitter from './Rabbitmitter';
import BillBoard from './BillBoard';
import ChangeSkin from './ChangeSkin';

declare global {
    var musicTune: boolean;
    var musicTitle: string;
    var musicVolume: number;
    var soundVolume: number;
}

export function playSound(sounds: Map<string, Phaser.Sound.BaseSound>, sound: string) {
    let s = sounds.get(sound);
    if (s !== undefined)
        s.play({ volume: globalThis.soundVolume });
    else
        console.log("Sound " + sound + " is undefined");
}

export function playRandomSound(sounds: Map<string, Phaser.Sound.BaseSound>, sound: string, min: number, max: number) {
    let n = Phaser.Math.Between(min, max);

    let s = sounds.get(sound + n);
    if (s !== undefined)
        s.play({ volume: globalThis.soundVolume });
}

export function addSound(ctx: Phaser.Scene, sound: string, loop: boolean, autoplay: boolean = true) {
    if (globalThis.musicTune) {
        ctx.sound.get(globalThis.musicTitle).stop();
        globalThis.musicTune = false;
        globalThis.musicTitle = "";
    }

    let m = ctx.sound.add(sound, { loop: loop });

    if (!autoplay)
        return m;


    if (!ctx.sound.locked) {
        m.play({ volume: globalThis.soundVolume });
    }
    else {
        ctx.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
            m.play({ volume: globalThis.soundVolume });
        });
    }

    return m;
}

export function playMusic(ctx: Phaser.Scene, choice: string): Phaser.Sound.BaseSound {
    let m = ctx.sound.add(choice, { loop: false, delay: 2, volume: globalThis.musicVolume });
    if (!ctx.sound.locked) {
        m.play();
        globalThis.musicTune = true;
        globalThis.musicTitle = choice;
    }
    else {
        ctx.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
            m.play();
            globalThis.musicTune = true;
            globalThis.musicTitle = choice;
        });
    }

    m.once(Phaser.Sound.Events.COMPLETE, () => {
        globalThis.musicTune = false;
        m.stop();

        playRandomMusic(ctx);
    });
    m.once(Phaser.Sound.Events.STOP, () => {
        globalThis.musicTune = false;
    });

    return m;
}

export function playRepeatMusic(ctx: Phaser.Scene, choice: string): Phaser.Sound.BaseSound {
    let m: Phaser.Sound.BaseSound = ctx.sound.add(choice, { loop: false, delay: 2, volume: globalThis.musicVolume });
    if (!ctx.sound.locked) {
        m.play();
        globalThis.musicTune = true;
        globalThis.musicTitle = choice;
    }
    else {
        ctx.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
            m.play();
            globalThis.musicTune = true;
            globalThis.musicTitle = choice;
        });
    }

    m.once(Phaser.Sound.Events.COMPLETE, () => {
        globalThis.musicTune = false;
        m.stop();
        playRepeatMusic(ctx, choice);
    });
    m.once(Phaser.Sound.Events.STOP, () => {
        globalThis.musicTune = false;
    });

    return m;
}

export function playRandomMusic(ctx: Phaser.Scene) {

    if (globalThis.musicTune) {
        console.log("Already playing " + globalThis.musicTitle);
        return;
    }

    let tracks = [
        '01_main_screen_trailer',
        '02_level_grass',
        '03_level_forest',
        '04_level_rain',
        '05_level_desert',
        'bgm_alpha',
        'bgm_beta',
        'bgm_delta',
        'bgm_epsilon',
        'bgm_gamma',
        'bgm_menu',
        'bgm_omega',
        'bottomlesspitman',
        'dawn_of_hope_low',
        'greengray',
        'junglegroove',
        'onmyway',
        'spy',
        'thevillage',
        'heroimmortal',
        'juhanijunkala',
        'juhanjunkala2',
        'thecreeper',
        'redheels', 
        'freejump'

    ];

    let choice = tracks[Phaser.Math.Between(0, tracks.length - 1)];


    playMusic(ctx, choice);
}

export function setupSounds(ctx: Phaser.Scene): Map<string, Phaser.Sound.BaseSound> {
    let m = new Map<string, Phaser.Sound.BaseSound>();
    let sounds = [
        'jump',
        'pickupcoin',
        'droppinghits',
        'droppingbounces',
        'pickupcarrot',
        'pickuphealth',
        'pickupdropping',
        'stomped',
        'hit',
        'bonustile',
        'rubber1',
        'star',
        'pow',
        'berry',
        'lava',
        'splash',
        'nothrow',
        'explosion1', 'explosion2', 'explosion3', 'explosion4', 'explosion5', 'explosion6',
        'breakingtile',
        'click',
        'lightswitch',
        'changeskin',
        '100coins',
    ];

    sounds.forEach(s => m.set(s, ctx.sound.add(s, { loop: false })));
    return m;
}

export function setupHandlers(ctx: Phaser.Scene) {

    ctx.game.events.on(Phaser.Core.Events.BLUR, () => {
        if (ctx.scene.isActive('paused')) {
            ctx.scene.stop('paused');
        }

    });

    ctx.game.events.on(Phaser.Core.Events.FOCUS, () => {
        if (!globalThis.musicTune && globalThis.musicTitle !== undefined) {
            playMusic(ctx, globalThis.musicTitle);
        }
    });

    document.addEventListener('visibilitychange', () => {
        if (!document.hidden)
            return;
        handleLoseFocus(ctx);
    });
}

export function handleLoseFocus(ctx: Phaser.Scene) {
    if (ctx.scene.isActive('paused')) {
        return;
    }

    ctx.game.sound.stopAll();
    globalThis.musicTune = false;

    ctx.scene.run('paused', {
        onResume: () => {
            ctx.scene.stop();
        }
    });
}

export function loadSettings() {
    let info: GameSettings;
    let data = window.localStorage.getItem('ra8bit.audio');

    globalThis.musicVolume = 0.5;
    globalThis.soundVolume = 1.0;

    if (data != null) {
        let obj = JSON.parse(data);
        info = obj as GameSettings;

        globalThis.musicVolume = info.musicVolume || 0.5;
        globalThis.soundVolume = info.soundVolume || 1.0;

        if (globalThis.musicVolume < 0 || globalThis.musicVolume > 1) {
            globalThis.musicVolume = 0.5;
        }
        if (globalThis.soundVolume < 0 || globalThis.soundVolume > 1) {
            globalThis.soundVolume = 1;
        }
    }
}

export function preload(ctx) {

    loadSettings();

    ctx.load.image('sky', 'assets/back1.png');
    ctx.load.image('groundTiles', 'assets/terrainv3.png');
    ctx.load.image('propTiles', 'assets/spritesheet_props_extruded.png');
    ctx.load.image('grasTiles', 'assets/gras.png');

    ctx.load.image('bg_1', 'assets/back2.png');
    ctx.load.image('bg_2', 'assets/back3.png');
    ctx.load.image('bg_3', 'assets/back4.png');
    ctx.load.image('bg_4', 'assets/back5.png');
    ctx.load.image('bg_5', 'assets/back6.png');
    ctx.load.image('bg_6', 'assets/back7.png');
    ctx.load.image('logo', 'assets/logo.png');


    ctx.load.image('bg_cocoons', 'assets/bg_cocoons.jpg');
    ctx.load.image('ra8bitTiles', 'assets/minira8bits.png');
    ctx.load.image('ra8bittiles128-bg', 'assets/ra8bittiles128-bg.webp');



    ctx.load.image('ra8bits-64-tiles', 'assets/ra8bittiles64.webp');

    //ui
    ctx.load.bitmapFont('press_start', 'assets/press_start_2p.png', 'assets/press_start_2p.fnt');
    ctx.load.spritesheet('health', 'assets/health.png', { frameWidth: 64, frameHeight: 64, startFrame: 0, endFrame: 4 });
    ctx.load.image('bg-ui', 'assets/bg-ui.png');
    ctx.load.image('mushyroom', 'assets/label-mushyroom.png');

    //win
    ctx.load.atlas('cocoon', 'assets/cocoons.png', 'assets/cocoons.json');
    ctx.load.atlas('flares', 'assets/flares.png', 'assets/flares.json');


    // sprite atlases
    ctx.load.atlas('rabbit', 'assets/rabbit.png', 'assets/rabbit.json');
    ctx.load.atlas('bird', 'assets/bird.png', 'assets/bird.json');
    ctx.load.atlas('crab', 'assets/crab.png', 'assets/crab.json');
    ctx.load.atlas('firewalker', 'assets/firewalk.png', 'assets/firewalk.json');
    ctx.load.atlas('bat', 'assets/bat.png', 'assets/bat.json');
    ctx.load.atlas('monster', 'assets/monster.png', 'assets/monster.json');
    ctx.load.atlas('plant', 'assets/plant.png', 'assets/plant.json');
    ctx.load.atlas('flower', 'assets/flower.png', 'assets/flower.json');
    ctx.load.atlas('fire', 'assets/fire.png', 'assets/fire.json');
    ctx.load.atlas('dragon', 'assets/dragon.png', 'assets/dragon.json');
    ctx.load.atlas('bomb', 'assets/bomb.png', 'assets/bomb.json');
    ctx.load.atlas('dropping-splash', 'assets/dropping-splash.png', 'assets/dropping-splash.json');

    ctx.load.atlas('cracks', 'assets/cracks.png', 'assets/cracks.json');
    ctx.load.atlas('crow', 'assets/crow.png', 'assets/crow.json');
    ctx.load.atlas('bear', 'assets/bear.png', 'assets/bear.json');
    ctx.load.atlas('fly', 'assets/fly.png', 'assets/fly.json');
    ctx.load.atlas('tnt', 'assets/tnt.png', 'assets/tnt.json');
    ctx.load.atlas('saw', 'assets/saw.png', 'assets/saw.json');

    ctx.load.spritesheet('coin', 'assets/coin.png', { frameWidth: 64, frameHeight: 64, startFrame: 0, endFrame: 5 });
    ctx.load.spritesheet('carrot', 'assets/carrot.png', { frameWidth: 64, frameHeight: 64, startFrame: 0, endFrame: 5 });
    ctx.load.spritesheet('lab', 'assets/lab.png', { frameWidth: 64, frameHeight: 136, startFrame: 0, endFrame: 3 });
    ctx.load.spritesheet('billboards', 'assets/billboards.png', { frameWidth: 192, frameHeight: 220, startFrame: 0, endFrame: 34 });
    ctx.load.spritesheet('lightswitch', 'assets/lightswitch.png', { frameWidth: 64, frameHeight: 64, startFrame: 0, endFrame: 1 });
    ctx.load.spritesheet('fireball', 'assets/fireball.png', { frameWidth: 32, frameHeight: 32, startFrame: 0, endFrame: 3 });



    // images
    ctx.load.image('heart', 'assets/heart.png');
    ctx.load.image('berry', 'assets/berry.png');
    ctx.load.image('pow', 'assets/pow.png');
    ctx.load.image('star', 'assets/star.png');
    ctx.load.image('toad', 'assets/toad.png');
    ctx.load.image('rubber1', 'assets/rubber_1.png');
    ctx.load.image('dropping', 'assets/dropping.png');
    ctx.load.image('crate', 'assets/crate.png');
    ctx.load.image('zeppelin1', 'assets/zeppelin1.png');
    ctx.load.image('zeppelin2', 'assets/zeppelin2.png');
    ctx.load.image('platform', 'assets/platform.png');
    ctx.load.image('brick1-2', 'assets/brick1-2.png');
    ctx.load.image('brick2-2', 'assets/brick2-2.png');
    ctx.load.image('changeskin', 'assets/changeskin.webp');


    // audio
    ctx.load.audio('jump', ['assets/jump.mp3', 'assets/jump.m4a']);
    ctx.load.audio('pickupcoin', ['assets/coinpickup.mp3', 'assets/coinpickup.m4a']);
    ctx.load.audio('droppinghits', ['assets/droppinghits.mp3', 'assets/droppinghits.m4a']);
    ctx.load.audio('droppingbounces', ['assets/droppingbounces.mp3', 'assets/droppingbounces.m4a']);
    ctx.load.audio('pickupcarrot', ['assets/pickupcarrot.mp3', 'assets/pickupcarrot.m4a']);
    ctx.load.audio('pickuphealth', ['assets/pickuphealth.mp3', 'assets/pickuphealth.m4a']);
    ctx.load.audio('pickupdropping', ['assets/pickupdropping.mp3', 'assets/pickupdropping.m4a']);
    ctx.load.audio('stomped', ['assets/stomped2.mp3', 'assets/stomped2.m4a']);
    ctx.load.audio('hit', ['assets/hit.mp3', 'assets/hit.m4a']);
    ctx.load.audio('bonustile', ['assets/bonustile.mp3', 'assets/bonustile.m4a']);
    ctx.load.audio('rubber1', ['assets/rubber1.mp3', 'assets/rubber1.m4a']);
    ctx.load.audio('star', ['assets/star.mp3', 'assets/star.m4a']);
    ctx.load.audio('pow', ['assets/pow.mp3', 'assets/pow.m4a']);
    ctx.load.audio('berry', ['assets/berry.mp3', 'assets/berry.m4a']);
    ctx.load.audio('lava', ['assets/lava.mp3', 'assets/lava.m4a']);
    ctx.load.audio('splash', ['assets/splash.mp3', 'assets/splash.m4a']);
    ctx.load.audio('nothrow', ['assets/nothrow.mp3', 'assets/nothrow.m4a']);

    ctx.load.audio('explosion1', ['assets/explosion1.mp3', 'assets/explosion1.m4a']);
    ctx.load.audio('explosion2', ['assets/explosion2.mp3', 'assets/explosion2.m4a']);
    ctx.load.audio('explosion3', ['assets/explosion3.mp3', 'assets/explosion3.m4a']);
    ctx.load.audio('explosion4', ['assets/explosion4.mp3', 'assets/explosion4.m4a']);
    ctx.load.audio('explosion5', ['assets/explosion5.mp3', 'assets/explosion5.m4a']);
    ctx.load.audio('explosion6', ['assets/explosion6.mp3', 'assets/explosion6.m4a']);

    ctx.load.audio('breakingtile', ['assets/breakingtile.mp3', 'assets/breakingtile.m4a']);

    ctx.load.audio('gameover', ['assets/gameover.mp3', 'assets/gameover.m4a']);
    ctx.load.audio('click', ['assets/click2.mp3', 'assets/click2.m4a']);
    ctx.load.audio('lightswitch', ['assets/lightswitch.mp3', 'assets/lightswitch.m4a']);
    ctx.load.audio('boss', ['assets/boss.mp3', 'assets/boss.m4a']);

    ctx.load.audio('changeskin', ['assets/changeskin.mp3', 'assets/changeskin.m4a']);
    ctx.load.audio('spectacle', [ 'assets/spectacle.mp3', 'assets/spectacle.m4a']);
    ctx.load.audio('theme', ['assets/start.mp3', 'assets/start.m4a']);
    ctx.load.audio('100coins', ['assets/100coins.mp3', 'assets/100coins.m4a']);

    // font
    ctx.load.bitmapFont('press_start', 'assets/press_start_2p.png', 'assets/press_start_2p.fnt');

    ctx.load.audio('angel-eyes', ['assets/angel-eyes.mp3', 'assets/angel-eyes.m4a']);
    ctx.load.audio('01_main_screen_trailer', ['assets/01_main_screen_trailer.mp3', 'assets/01_main_screen_trailer.m4a']);
    ctx.load.audio('02_level_grass', ['assets/02_level_grass.mp3', 'assets/02_level_grass.m4a']);
    ctx.load.audio('03_level_forest', ['assets/03_level_forest.mp3', 'assets/03_level_forest.m4a']);
    ctx.load.audio('04_level_rain', ['assets/04_level_rain.mp3', 'assets/04_level_rain.m4a']);
    ctx.load.audio('05_level_desert', ['assets/05_level_desert.mp3', 'assets/05_level_desert.m4a']);
    ctx.load.audio('bgm_alpha', ['assets/bgm_alpha.mp3', 'assets/bgm_alpha.m4a']);
    ctx.load.audio('bgm_beta', ['assets/bgm_beta.mp3', 'assets/bgm_beta.m4a']);
    ctx.load.audio('bgm_delta', ['assets/bgm_delta.mp3', 'assets/bgm_delta.m4a']);
    ctx.load.audio('bgm_epsilon', ['assets/bgm_epsilon.mp3', 'assets/bgm_epsilon.m4a']);
    ctx.load.audio('bgm_gamma', ['assets/bgm_gamma.mp3', 'assets/bgm_gamma.m4a']);
    ctx.load.audio('bgm_menu', ['assets/bgm_menu.mp3', 'assets/bgm_menu.m4a']);
    ctx.load.audio('bgm_omega', ['assets/bgm_omega.mp3', 'assets/bgm_omega.m4a']);
    ctx.load.audio('bottomlesspitman', ['assets/bottomlesspitman.mp3', 'assets/bottomlesspitman.m4a']);
    ctx.load.audio('ch-ay-na', ['assets/ch-ay-na.mp3', 'assets/ch-ay-na.m4a']);
    ctx.load.audio('dawn_of_hope_low', ['assets/dawn_of_hope_low.mp3', 'assets/dawn_of_hope_low.m4a']);
    ctx.load.audio('greengray', ['assets/greengray.mp3', 'assets/greengray.m4a']);
    ctx.load.audio('junglegroove', ['assets/junglegroove.mp3', 'assets/junglegroove.m4a']);
    ctx.load.audio('onmyway', ['assets/onmyway.mp3', 'assets/onmyway.m4a']);
    ctx.load.audio('spy', ['assets/spy.mp3', 'assets/spy.m4a']);
    ctx.load.audio('thevillage', ['assets/thevillage.mp3', 'assets/thevillage.m4a']);
    ctx.load.audio('heroimmortal', [ 'assets/heroimmortal.mp3', 'assets/heroimmortal.m4a']);
    ctx.load.audio('juhanijunkala', [ 'assets/juhanijunkala.mp3', 'assets/juhanijunkala.m4a']);
    ctx.load.audio('juhanjunkala2', [ 'assets/juhanjunkala2.mp3', 'assets/juhanjunkala2.m4a']);
    ctx.load.audio('thecreeper', [ 'assets/thecreeper.mp3', 'assets/thecreeper.m4a'] );
    ctx.load.audio('redheels', [ 'assets/redheels.mp3', 'assets/redheels.m4a']);
    ctx.load.audio('freejump', [ 'assets/freejump.mp3', 'assets/freejump.m4a']);
    
    


    setupHandlers(ctx);
}

export function cullSprites(ctx: Phaser.Scene) {
    let children: Phaser.GameObjects.GameObject[] = ctx.children.getChildren();
    const n: number = children.length;
    let i: number = 0;
    while (i < n) {
        let c = children[i];
        if (c instanceof Phaser.Physics.Matter.Sprite) {
            let t = c as Phaser.Physics.Matter.Sprite;
            t.setVisible(false);
        }
        i++
    }

    let visible: Phaser.GameObjects.GameObject[] = ctx.cameras.main.cull(children);
    const n2: number = visible.length;
    i = 0;
    while (i < n2) {
        let c = visible[i];
        if (c instanceof Phaser.Physics.Matter.Sprite) {
            let t = c as Phaser.Physics.Matter.Sprite;
            t.setVisible(true);
        }
        i++;
    }
}

export function createPlayer(ctx, x: number, y: number, width: number, height: number, playerCat: number): Phaser.Physics.Matter.Sprite {
    const player = ctx.matter.add.sprite(
        x + (width * 0.5),
        y,
        'rabbit',
        undefined, {
        vertices: [
            { x: 0, y: 0 },
            { x: 64, y: 0 },
            { x: 64, y: 96 },
            { x: 0, y: 96 },],
        restitution: 0.05, frictionAir: 0, mass: 1.0, label: 'player'
    })
        .setFixedRotation(); //.setDisplaySize(64,78);
    player.setFixedRotation();
    player.setBounce(0);
    player.setFriction(0.0);
    player.setFrictionAir(0.0005);
    player.setFrictionStatic(0);

    player.setCollisionGroup(playerCat);
    player.setDepth(9);
    player.setMass(10.0);
    player.setData('type', 'player');
    player.setData('collision', playerCat);

    return player;
}

export function basicCreate(ctx, name, x, y, width, height, rotation, enemyCat, collideWith, controller, objData, player) {
    switch (name) {

        case 'dragon': {
            ctx.dragons.push(CreatureHelper.creatureCreateDragon(ctx, x, y, width, height, enemyCat, collideWith, controller, player));
            break;
        }
        case 'bomb': {
            ctx.bombs.push(CreatureHelper.creatureCreateBomb(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'monster': {
            ctx.monsters.push(CreatureHelper.createCreatureMonster(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'bat': {
            ctx.bats.push(CreatureHelper.createCreatureBat(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'bird': {
            ctx.birds.push(CreatureHelper.createCreatureBird(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'crab': {
            ctx.crabs.push(CreatureHelper.createCreatureCrab(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'fire': {
            ctx.fires.push(CreatureHelper.createCreatureFire(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'firewalker': {
            ctx.firewalkers.push(CreatureHelper.creatureCreatureFireWalker(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'flower': {
            ctx.flowers.push(CreatureHelper.createCreatureFlower(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'plant': {
            ctx.plants.push(CreatureHelper.createCreaturePlant(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'zeppelin1': {
            ctx.zeps.push(CreatureHelper.createCreatureZeppelin1(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'zeppelin2': {
            ctx.zeps.push(CreatureHelper.createCreatureZeppelin2(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'fly': {
            ctx.flies.push(CreatureHelper.createCreatureFly(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'bear': {
            ctx.bears.push(CreatureHelper.createCreatureBear(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'crow': {
            ctx.crows.push(CreatureHelper.createCreatureCrow(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'tnt': {
            ctx.tnts.push(CreatureHelper.createCreatureTNT(ctx, x, y, width, height, enemyCat, collideWith, controller));
            break;
        }
        case 'saw': {
            ctx.saws.push(CreatureHelper.createCreatureSaw(ctx, x, y, width, height, rotation, enemyCat, collideWith, controller));
            break;
        }
        case 'lightswitch': {
            ctx.lightswitches.push(CreatureHelper.createLightSwitch(ctx, x, y, width, height, rotation, enemyCat, collideWith, controller, player));
            break;
        }
        case 'carrot': {
            ObjectHelper.createCarrot(ctx, x, y, width, height);
            break;
        }
        case 'coin': {
            ObjectHelper.createCoin(ctx, x, y, width, height);
            break;
        }
        case 'lab': {
            ObjectHelper.createLab(ctx, x, y, width, height);
            break;
        }
        case 'heart': {
            ObjectHelper.createHealth(ctx, x, y, width, height);
            break;
        }
        case 'crate': {
            ObjectHelper.createCrate(ctx, x, y, width, height);
            break;
        }
        case 'pipe': {
            let dstx = objData.properties.find((p) => p.name === 'dstx')?.value;
            let dsty = objData.properties.find((p) => p.name === 'dsty')?.value;
            let delay = objData.properties.find((p) => p.name === 'delay')?.value;
            let duration = objData.properties.find((p) => p.name === 'duration')?.value;
            let room_wid = objData.properties.find((p) => p.name === 'room_width')?.value;
            let room_hei = objData.properties.find((p) => p.name === 'room_height')?.value;

            const pipe = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                isStatic: true,
                label: 'pipe'
            });
            controller.addWithValues('pipe', pipe, { "dstx": dstx, "dsty": dsty, "delay": delay, "duration": duration, "room_width": room_wid, "room_height": room_hei });
            break;
        }
        case 'platform': {
            let to = objData.properties.find((p) => p.name === 'to').value;
            let duration = objData.properties.find((p) => p.name === 'duration').value;
            let vert = objData.properties.find((p) => p.name === 'vert').value;

            const platform = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'platform', undefined, {
                isStatic: true,
                label: 'platform',
                vertices: [{ x: 0, y: 0 }, { x: 192, y: 0 }, { x: 192, y: 32 }, { x: 0, y: 32 }]
            });


            let m = new MovingPlatform(ctx, x, y, to, duration, vert, platform);
            controller.add('platform', platform.body as MatterJS.BodyType);
            break;
        }
        case 'sink': {
            // groups a set of tiles and move them down FIXME
            break;
        }
        case 'trap': {
            //FIXME: deadly object that moves down x tiles in time y
            break;
        }
        case 'brick': {
            let hits = objData.properties.find((p) => p.name === 'hits').value;
            let pem = objData.properties.find((p) => p.name === 'emitter').value;

            const brick: MatterJS.BodyType = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
                isStatic: true,
                label: 'brick',
            });
            let m = new Rabbitmitter(ctx, x, y, hits, pem, brick);
            controller.addWithValues('brick', brick, { "use": hits, "emitter": m });
            break;
        }
        case 'coinbrick': {
            let hits = objData.properties.find((p) => p.name === 'hits').value;

            const brick: MatterJS.BodyType = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
                isStatic: true,
                label: 'coinbrick',
            });
            controller.addWithValues('coinbrick', brick, { "use": hits });
            break;
        }
        case 'spikes': {
            const spike = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                isStatic: true
            });
            controller.add('spikes', spike);
            break;
        }
        case 'bonus': {
            const bonus = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                vertices: [{ x: 1, y: 1 }, { x: 64, y: 1 }, { x: 64, y: 64 }, { x: 1, y: 64 }],
                isStatic: true,
                label: 'bonus',
            });
            controller.addWithValues('bonus', bonus, { "use": 3 }, { "last": -1 });
            break;
        }
        case 'exit': {
            let ev = objData.properties.find((p) => p.name === 'event').value;
            let room = objData.properties.find((p) => p.name === 'room')?.value || 'start';
            const bonus = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
                isStatic: true,
                label: 'exit',
            });
            controller.addWithValues('exit', bonus, { "event": ev, "room": room });
            break;
        }
        case 'return': {
            const bonus = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
                isStatic: true,
                label: 'return',
            });
            let dx = objData.properties.find((p) => p.name === 'spawnx').value;
            let dy = objData.properties.find((p) => p.name === 'spawny').value;

            controller.addWithValues('return', bonus, { "spawnx": dx, "spawny": dy });
            break;
        }
        case 'goto': {
            const bonus = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
                isStatic: true,
                label: 'return',
            });
            let dx = objData.properties.find((p) => p.name === 'spawnx').value;
            let dy = objData.properties.find((p) => p.name === 'spawny').value;
            let camw = objData.properties.find((p) => p.name === 'camera-width').value;
            let camh = objData.properties.find((p) => p.name === 'camera-height').value;

            controller.addWithValues('goto', bonus.body as MatterJS.BodyType, { "spawnx": dx, "spawny": dy, "camw": camw, "camh": camh });

            break;
        }
        case 'billboard': {
            const billboard = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'billboards', undefined, {
                isStatic: true,
                label: 'billboard',
                vertices: [{ x: 0, y: -60 }, { x: 192, y: -60 }, { x: 192, y: 48 }, { x: 0, y: 48 }],
                render: { sprite: { yOffset: 64 } },
            }).setOrigin(0.5, 0.33);
            new BillBoard(ctx, billboard);
            controller.add('billboard', billboard.body as MatterJS.BodyType);
            break;
        }
        case 'changeskin': {
            let use = objData.properties.find((p) => p.name === 'use').value;
            const skin = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'changeskin', undefined, {
                isStatic: true,
                label: 'changeskin',
                vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],

            });
            new ChangeSkin(ctx, skin, 'changeskin');
            controller.addWithValues('changeskin', skin.body as MatterJS.BodyType, { "use": use });
            break;
        }
        default:
            console.log("Creature unknown " + name);
            break;
    }

}