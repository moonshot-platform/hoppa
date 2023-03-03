
import * as CreatureHelper from '../scripts/CreatureHelper';
import * as ObjectHelper from '../scripts/ObjectHelper';
import MovingPlatform from '../scripts/MovingPlatform';
import Rabbitmitter from './Rabbitmitter';
import BillBoard from './BillBoard';
import ChangeSkin from './ChangeSkin';
import NeonController from './NeonController';
import BarController from './BarController';
import ObstaclesController from './ObstaclesController';
import { GameSettings } from '~/scenes/GameSettings';

declare global {
    var musicTune: boolean;
    var musicTitle: string;
    var musicVolume: number;
    var soundVolume: number;
    var krasota: boolean;
    var krasotaPlayStarted: boolean;
    var rabbit: string;
    var voice: string;
}

export function playSound(sounds: Map<string, Phaser.Sound.BaseSound>, sound: string) {
    const s = sounds.get(sound);
    if (s !== undefined)
        s.play({ volume: globalThis.soundVolume });
    else
        console.log("Sound " + sound + " is undefined");
}
export function playKrasota(sounds: Map<string, Phaser.Sound.BaseSound>, sound: string, kps = false) {
    if(globalThis.krasota == false ) {
        krasotaLock();
        const sample = sound + globalThis.voice;
        const s = sounds.get(sample);
        if(s === undefined ) { 
            console.log("No such sound '" + sample + "'");
        }
        s?.on( 'play', () => {
            if(kps) globalThis.krasotaPlayStarted = true;
        });
        s?.on( 'complete', () => {
            globalThis.krasotaPlayStarted = false;
            krasotaUnlock();
        });
        s?.play({ volume: globalThis.soundVolume });
    }
}
export function krasotaLock() {
    globalThis.krasota = true;
}
export function krasotaUnlock() {
    globalThis.krasota = false;
}
export function krasotaPlayStarted() {
    return globalThis.krasotaPlayStarted;
}

export function playRandomSound(sounds: Map<string, Phaser.Sound.BaseSound>, sound: string, min: number, max: number) {
    const n = Phaser.Math.Between(min, max);
    const s = sounds.get(sound + n);
    if (s !== undefined)
        s.play({ volume: globalThis.soundVolume });
}

export function addSound(ctx: Phaser.Scene, sound: string, loop: boolean, autoplay = true) {

    const m = ctx.sound.add(sound, { loop: loop, volume: globalThis.soundVolume });

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
    const m = ctx.sound.add(choice, { loop: false, delay: 2, volume: globalThis.musicVolume });
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
        ctx.time.delayedCall(2000, () => {
            playRandomMusic(ctx);
        });
    });
    m.once(Phaser.Sound.Events.STOP, () => {
        globalThis.musicTune = false;
    });

    return m;
}

export function playRepeatMusic(ctx: Phaser.Scene, choice: string): Phaser.Sound.BaseSound {
    const m: Phaser.Sound.BaseSound = ctx.sound.add(choice, { loop: false, delay: 2, volume: globalThis.musicVolume });
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

    const tracks = [
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
        'freejump',
        'longawayhome',
        'swinginglevel',
        'happylevel', 
        '8bitmetal',
        'catchy',  
        'enchantedwoods',
        'galaticfunk',
    ];

    const choice = tracks[Phaser.Math.Between(0, tracks.length - 1)];
    playMusic(ctx, choice);
}

export function setupSounds(ctx: Phaser.Scene): Map<string, Phaser.Sound.BaseSound> {
    const m = new Map<string, Phaser.Sound.BaseSound>();
    const sounds = [
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
        'hit1','hit2',
        'breakingtile',
        'click',
        'lightswitch',
        'changeskin',
        '100coins',
        'blip',
    ];

    sounds.forEach(s => m.set(s, ctx.sound.add(s, { loop: false })));

    const flirts = [
        'breakmybed', 'donttellmewhattodo', 'imsothirsty', 'titanic', 'todo', 'uber', 'underneath', 'youcanstaybut'
    ];
    flirts.forEach(s => m.set(s, ctx.sound.add(s, { loop: false })));
    flirts.forEach(s => m.set(s+ '-cs', ctx.sound.add(s+ '-cs', { loop: false })));
    flirts.forEach(s => m.set(s+ '-vd', ctx.sound.add(s+ '-vd', { loop: false })));


    const gameovers = [
        'mymomcandothattoo', 'strongboysnevergiveup', 'takeitslow', 'whatareyou', 'wrongbutton', 'youcametooquick', 'yourfaceyourass'
    ];
    gameovers.forEach(s => m.set(s, ctx.sound.add(s, { loop: false })));
    gameovers.forEach(s => m.set(s + '-cs', ctx.sound.add(s + '-cs', { loop: false })));
    gameovers.forEach(s => m.set(s + '-vd', ctx.sound.add(s + '-vd', { loop: false })));


    const wise = [
        'beginatthebeginning', 'equalopportunity', 'hailtotheking', 'offtoday', 'therightmaninthewrong', 'wishtogoanywhere'
    ]
    wise.forEach(s => m.set(s, ctx.sound.add(s, { loop: false })));
    wise.forEach(s => m.set(s + '-cs', ctx.sound.add(s + '-cs', { loop: false })));
    wise.forEach(s => m.set(s + '-vd', ctx.sound.add(s + '-vd', { loop: false })));
    

    m.set( 'blowitoutofyourass',ctx.sound.add('blowitoutofyourass', { loop: false }));
    m.set( 'timetokickass', ctx.sound.add('timetokickass', { loop: false }));

    return m;
}

export function krasotaSays(selector: number, text: string ): string {
    if(selector == 0 ) {
        const options= [
            'breakmybed', 'donttellmewhattodo', 'imsothirsty', 'titanic', 'todo', 'uber', 'underneath', 'youcanstaybut'
        ];
        return options[ Phaser.Math.Between(0, options.length - 1)];
    }
    else if(selector == 1 ) {
        const options= [
            'mymomcandothattoo', 'strongboysnevergiveup', 'takeitslow', 'whatareyou', 'wrongbutton', 'youcametooquick', 'yourfaceyourass'
        ];
        return options[ Phaser.Math.Between(0, options.length - 1)];
    }
    else if(selector == 2 ) {
        const options= [
            'beginatthebeginning', 'offtoday', 'therightmaninthewrong', 'timetokickass', 'wishtogoanywhere'
        ];
        return options[ Phaser.Math.Between(0, options.length - 1)];
    }

    return text;
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

    stopSound(ctx);

    ctx.scene.run('paused', {
        onResume: () => {
            ctx.scene.stop();
        }
    });
}

export function stopSound(ctx: Phaser.Scene) {
    ctx.game.sound.stopAll();
   // ctx.sound.destroy();
    globalThis.musicTune = false;
}

export function removeAllSounds(ctx: Phaser.Scene) {
    ctx.game.sound.removeAll();
}

export function loadSettings() {
    let info: GameSettings;
    const data = window.localStorage.getItem('ra8bit.audio');

    globalThis.musicVolume = 0.5;
    globalThis.soundVolume = 1.0;
    globalThis.krasota = false;

    if (data != null) {
        const obj = JSON.parse(data);
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

    ctx.load.image('sky', 'assets/back1.webp');
    ctx.load.image('groundTiles', 'assets/terrainv3.webp');
    ctx.load.image('propTiles', 'assets/spritesheet_props_extruded.webp');
    ctx.load.image('grasTiles', 'assets/gras.webp');
    ctx.load.image('cocoonTiles', 'assets/cocoons.webp');
    ctx.load.image('stonesTiles', 'assets/stones.webp');


    ctx.load.image('logo', 'assets/logo.webp');


    
    ctx.load.image('bg_cocoons', 'assets/bg_cocoons.webp');
    ctx.load.image('ra8bitTiles', 'assets/minira8bits.webp');
    


    //ui
    ctx.load.bitmapFont('press_start', 'assets/press_start_2p.webp', 'assets/press_start_2p.fnt');
    ctx.load.spritesheet('health', 'assets/health.webp', { frameWidth: 64, frameHeight: 64, startFrame: 0, endFrame: 4 });
    ctx.load.image('bg-ui', 'assets/bg-ui.webp');
    ctx.load.image('mushyroom', 'assets/label-mushyroom.webp');
    
    ctx.load.atlas( 'lava-top', 'assets/lava-top.webp', 'assets/lava-top.json');
    ctx.load.atlas( 'lava-center', 'assets/lava-center.webp', 'assets/lava-center.json');

    // sprite atlases
    ctx.load.atlas('rabbit', 'assets/rabbit.webp', 'assets/rabbit.json');
    ctx.load.atlas('bird', 'assets/bird.webp', 'assets/bird.json');
    ctx.load.atlas('crab', 'assets/crab.webp', 'assets/crab.json');
    ctx.load.atlas('firewalker', 'assets/firewalk.webp', 'assets/firewalk.json');
    ctx.load.atlas('bat', 'assets/bat.webp', 'assets/bat.json');
    ctx.load.atlas('monster', 'assets/monster.webp', 'assets/monster.json');
    ctx.load.atlas('plant', 'assets/plant.webp', 'assets/plant.json');
    ctx.load.atlas('flower', 'assets/flower.webp', 'assets/flower.json');
    ctx.load.atlas('fire', 'assets/fire.webp', 'assets/fire.json');
    ctx.load.atlas('dragon', 'assets/dragon.webp', 'assets/dragon.json');
    ctx.load.atlas('bomb', 'assets/bomb.webp', 'assets/bomb.json');
    ctx.load.atlas('dropping-splash', 'assets/dropping-splash.webp', 'assets/dropping-splash.json');
    ctx.load.atlas('moonshot-splash', 'assets/moonshot-splash.webp', 'assets/moonshot-splash.json');

    ctx.load.atlas('cracks', 'assets/cracks.webp', 'assets/cracks.json');
    ctx.load.atlas('crow', 'assets/crow.webp', 'assets/crow.json');
    ctx.load.atlas('bear', 'assets/bear.webp', 'assets/bear.json');
    ctx.load.atlas('fly', 'assets/fly.webp', 'assets/fly.json');
    ctx.load.atlas('tnt', 'assets/tnt.webp', 'assets/tnt.json');
    ctx.load.atlas('saw', 'assets/saw.webp', 'assets/saw.json');
    
    ctx.load.spritesheet('coin', 'assets/coin.webp', { frameWidth: 64, frameHeight: 64, startFrame: 0, endFrame: 5 });
    ctx.load.spritesheet('carrot', 'assets/carrot.webp', { frameWidth: 64, frameHeight: 64, startFrame: 0, endFrame: 5 });
    ctx.load.spritesheet('lab', 'assets/lab.webp', { frameWidth: 64, frameHeight: 136, startFrame: 0, endFrame: 3 });
    ctx.load.spritesheet('billboards', 'assets/billboards.webp', { frameWidth: 192, frameHeight: 220, startFrame: 0, endFrame: 34 });
    ctx.load.spritesheet('lightswitch', 'assets/lightswitch.webp', { frameWidth: 64, frameHeight: 64, startFrame: 0, endFrame: 1 });
    ctx.load.spritesheet('fireball', 'assets/fireball.webp', { frameWidth: 32, frameHeight: 32, startFrame: 0, endFrame: 3 });

    // images
    ctx.load.image('heart', 'assets/heart.webp');
    ctx.load.image('berry', 'assets/berry.webp');
    ctx.load.image('pow', 'assets/pow.webp');
    ctx.load.image('star', 'assets/star.webp');
    ctx.load.image('toad', 'assets/toad.webp');
    ctx.load.image('rubber1', 'assets/rubber_1.webp');
    ctx.load.image('dropping', 'assets/dropping.webp');
    ctx.load.image('pokeball', 'assets/pokeball.webp');
    ctx.load.image('moonshot-ball', 'assets/moonshot-ball.webp');
    ctx.load.image('crate', 'assets/crate.webp');
    ctx.load.image('zeppelin1', 'assets/zeppelin1.webp');
    ctx.load.image('zeppelin2', 'assets/zeppelin2.webp');
    ctx.load.image('platform', 'assets/platform.webp');
    ctx.load.image('brick1-2', 'assets/brick1-2.webp');
    ctx.load.image('brick2-2', 'assets/brick2-2.webp');
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
    ctx.load.audio('blip', ['assets/blip.mp3', 'assets/blip.m4a']);

    // font
    ctx.load.bitmapFont('press_start', 'assets/press_start_2p.webp', 'assets/press_start_2p.fnt');

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
    ctx.load.audio('longawayhome', [ 'assets/longawayhome.mp3', 'assets/longawayhome.m4a']);
    ctx.load.audio('swinginglevel', [ 'assets/swinginglevel.mp3', 'assets/swinginglevel.m4a']);
    ctx.load.audio('happylevel', [ 'assets/happylevel.mp3', 'assets/happylevel.m4a']);
    ctx.load.audio('8bitmetal', [ 'assets/8bitmetal.mp3', 'assets/8bitmetal.m4a']);
    ctx.load.audio('catchy', [ 'assets/catchy.mp3', 'assets/catchy.m4a']);
    ctx.load.audio('boss6', [ 'assets/boss6.mp3', 'assets/boss6.m4a']);
    ctx.load.audio('hit1', ['assets/hit1.mp3', 'assets/hit1.m4a']);
    ctx.load.audio('hit2', ['assets/hit2.mp3', 'assets/hit2.m4a']);
    ctx.load.audio('enchantedwoods', [ 'assets/enchantedwoods.mp3', 'assets/enchantedwoods.m4a']);
    ctx.load.audio('galaticfunk', [ 'assets/galaticfunk.mp3', 'assets/galaticfunk.m4a']);

    ctx.load.audio('beginatthebeginning', [ 'assets/beginatthebeginning.mp3', 'assets/beginatthebeginning.m4a']);
    ctx.load.audio('blowitoutofyourass', [ 'assets/blowitoutofyourass.mp3', 'assets/blowitoutofyourass.m4a']);
    ctx.load.audio('breakmybed', [ 'assets/breakmybed.mp3', 'assets/breakmybed.m4a']);
    ctx.load.audio('donttellmewhattodo', [ 'assets/donttellmewhattodo.mp3', 'assets/donttellmewhattodo.m4a']);
    ctx.load.audio('drunktoomuch', [ 'assets/drunktoomuch.mp3', 'assets/drunktoomuch.m4a']);
    ctx.load.audio('equalopportunity', [ 'assets/equalopportunity.mp3', 'assets/equalopportunity.m4a']);
    ctx.load.audio('hailtotheking', [ 'assets/hailtotheking.mp3', 'assets/hailtotheking.m4a']);
    ctx.load.audio('idontseehow', [ 'assets/idontseehow.mp3', 'assets/idontseehow.m4a']);
    ctx.load.audio('imsothirsty', [ 'assets/imsothirsty.mp3', 'assets/imsothirsty.m4a']);
    ctx.load.audio('mymomcandothattoo', [ 'assets/mymomcandothattoo.mp3', 'assets/mymomcandothattoo.m4a']);
    ctx.load.audio('offtoday', [ 'assets/offtoday.mp3', 'assets/offtoday.m4a']);
    ctx.load.audio('strongboysnevergiveup', [ 'assets/strongboysnevergiveup.mp3', 'assets/strongboysnevergiveup.m4a']);
    ctx.load.audio('takeitslow', [ 'assets/takeitslow.mp3', 'assets/takeitslow.m4a']);
    ctx.load.audio('therightmaninthewrong', [ 'assets/therightmaninthewrong.mp3', 'assets/therightmaninthewrong.m4a']);
    ctx.load.audio('timetokickass', [ 'assets/timetokickass.mp3', 'assets/timetokickass.m4a']);
    ctx.load.audio('titanic', [ 'assets/titanic.mp3', 'assets/titanic.m4a']);
    ctx.load.audio('todo', [ 'assets/todo.mp3', 'assets/todo.m4a']);
    ctx.load.audio('uber', [ 'assets/uber.mp3', 'assets/uber.m4a']);
    ctx.load.audio('underneath', [ 'assets/underneath.mp3', 'assets/underneath.m4a']);
    ctx.load.audio('weareallmadhere', [ 'assets/weareallmadhere.mp3', 'assets/weareallmadhere.m4a']);
    ctx.load.audio('whatareyou', [ 'assets/whatareyou.mp3', 'assets/whatareyou.m4a']);
    ctx.load.audio('wishtogoanywhere', [ 'assets/wishtogoanywhere.mp3', 'assets/wishtogoanywhere.m4a']);
    ctx.load.audio('wrongbutton', [ 'assets/wrongbutton.mp3', 'assets/wrongbutton.m4a']);
    ctx.load.audio('youcametooquick', [ 'assets/youcametooquick.mp3', 'assets/youcametooquick.m4a']);
    ctx.load.audio('youcanstaybut', [ 'assets/youcanstaybut.mp3', 'assets/youcanstaybut.m4a']);
    ctx.load.audio('yourfaceyourass', [ 'assets/yourfaceyourass.mp3', 'assets/yourfaceyourass.m4a']);

    ctx.load.audio('beginatthebeginning', [ 'assets/beginatthebeginning.mp3', 'assets/beginatthebeginning.m4a']);
    ctx.load.audio('blowitoutofyourass', [ 'assets/blowitoutofyourass.mp3', 'assets/blowitoutofyourass.m4a']);
    ctx.load.audio('breakmybed', [ 'assets/breakmybed.mp3', 'assets/breakmybed.m4a']);
    ctx.load.audio('donttellmewhattodo', [ 'assets/donttellmewhattodo.mp3', 'assets/donttellmewhattodo.m4a']);
    ctx.load.audio('drunktoomuch', [ 'assets/drunktoomuch.mp3', 'assets/drunktoomuch.m4a']);
    ctx.load.audio('equalopportunity', [ 'assets/equalopportunity.mp3', 'assets/equalopportunity.m4a']);
    ctx.load.audio('hailtotheking', [ 'assets/hailtotheking.mp3', 'assets/hailtotheking.m4a']);
    ctx.load.audio('idontseehow', [ 'assets/idontseehow.mp3', 'assets/idontseehow.m4a']);
    ctx.load.audio('imsothirsty', [ 'assets/imsothirsty.mp3', 'assets/imsothirsty.m4a']);
    ctx.load.audio('mymomcandothattoo', [ 'assets/mymomcandothattoo.mp3', 'assets/mymomcandothattoo.m4a']);
    ctx.load.audio('offtoday', [ 'assets/offtoday.mp3', 'assets/offtoday.m4a']);
    ctx.load.audio('strongboysnevergiveup', [ 'assets/strongboysnevergiveup.mp3', 'assets/strongboysnevergiveup.m4a']);
    ctx.load.audio('takeitslow', [ 'assets/takeitslow.mp3', 'assets/takeitslow.m4a']);
    ctx.load.audio('therightmaninthewrong', [ 'assets/therightmaninthewrong.mp3', 'assets/therightmaninthewrong.m4a']);
    ctx.load.audio('timetokickass', [ 'assets/timetokickass.mp3', 'assets/timetokickass.m4a']);
    ctx.load.audio('titanic', [ 'assets/titanic.mp3', 'assets/titanic.m4a']);
    ctx.load.audio('todo', [ 'assets/todo.mp3', 'assets/todo.m4a']);
    ctx.load.audio('uber', [ 'assets/uber.mp3', 'assets/uber.m4a']);
    ctx.load.audio('underneath', [ 'assets/underneath.mp3', 'assets/underneath.m4a']);
    ctx.load.audio('weareallmadhere', [ 'assets/weareallmadhere.mp3', 'assets/weareallmadhere.m4a']);
    ctx.load.audio('whatareyou', [ 'assets/whatareyou.mp3', 'assets/whatareyou.m4a']);
    ctx.load.audio('wishtogoanywhere', [ 'assets/wishtogoanywhere.mp3', 'assets/wishtogoanywhere.m4a']);
    ctx.load.audio('wrongbutton', [ 'assets/wrongbutton.mp3', 'assets/wrongbutton.m4a']);
    ctx.load.audio('youcametooquick', [ 'assets/youcametooquick.mp3', 'assets/youcametooquick.m4a']);
    ctx.load.audio('youcanstaybut', [ 'assets/youcanstaybut.mp3', 'assets/youcanstaybut.m4a']);
    ctx.load.audio('yourfaceyourass', [ 'assets/yourfaceyourass.mp3', 'assets/yourfaceyourass.m4a']);

    ctx.load.audio('beginatthebeginning-cs', [ 'assets/beginatthebeginning-cs.mp3', 'assets/beginatthebeginning-cs.m4a']);
    ctx.load.audio('breakmybed-cs', [ 'assets/breakmybed-cs.mp3', 'assets/breakmybed-cs.m4a']);
    ctx.load.audio('donttellmewhattodo-cs', [ 'assets/donttellmewhattodo-cs.mp3', 'assets/donttellmewhattodo-cs.m4a']);
    ctx.load.audio('drunktoomuch-cs', [ 'assets/drunktoomuch-cs.mp3', 'assets/drunktoomuch-cs.m4a']);
    ctx.load.audio('equalopportunity-cs', [ 'assets/equalopportunity-cs.mp3', 'assets/equalopportunity-cs.m4a']);
    ctx.load.audio('hailtotheking-cs', [ 'assets/hailtotheking-cs.mp3', 'assets/hailtotheking-cs.m4a']);
    ctx.load.audio('idontseehow-cs', [ 'assets/idontseehow-cs.mp3', 'assets/idontseehow-cs.m4a']);
    ctx.load.audio('imsothirsty-cs', [ 'assets/imsothirsty-cs.mp3', 'assets/imsothirsty-cs.m4a']);
    ctx.load.audio('mymomcandothattoo-cs', [ 'assets/mymomcandothattoo-cs.mp3', 'assets/mymomcandothattoo-cs.m4a']);
    ctx.load.audio('offtoday-cs', [ 'assets/offtoday-cs.mp3', 'assets/offtoday-cs.m4a']);
    ctx.load.audio('strongboysnevergiveup-cs', [ 'assets/strongboysnevergiveup-cs.mp3', 'assets/strongboysnevergiveup-cs.m4a']);
    ctx.load.audio('takeitslow-cs', [ 'assets/takeitslow-cs.mp3', 'assets/takeitslow-cs.m4a']);
    ctx.load.audio('therightmaninthewrong-cs', [ 'assets/therightmaninthewrong-cs.mp3', 'assets/therightmaninthewrong-cs.m4a']);
    ctx.load.audio('titanic-cs', [ 'assets/titanic-cs.mp3', 'assets/titanic-cs.m4a']);
    ctx.load.audio('todo-cs', [ 'assets/todo-cs.mp3', 'assets/todo-cs.m4a']);
    ctx.load.audio('uber-cs', [ 'assets/uber-cs.mp3', 'assets/uber-cs.m4a']);
    ctx.load.audio('underneath-cs', [ 'assets/underneath-cs.mp3', 'assets/underneath-cs.m4a']);
    ctx.load.audio('weareallmadhere-cs', [ 'assets/weareallmadhere-cs.mp3', 'assets/weareallmadhere-cs.m4a']);
    ctx.load.audio('whatareyou-cs', [ 'assets/whatareyou-cs.mp3', 'assets/whatareyou-cs.m4a']);
    ctx.load.audio('wishtogoanywhere-cs', [ 'assets/wishtogoanywhere-cs.mp3', 'assets/wishtogoanywhere-cs.m4a']);
    ctx.load.audio('wrongbutton-cs', [ 'assets/wrongbutton-cs.mp3', 'assets/wrongbutton-cs.m4a']);
    ctx.load.audio('youcametooquick-cs', [ 'assets/youcametooquick-cs.mp3', 'assets/youcametooquick-cs.m4a']);
    ctx.load.audio('youcanstaybut-cs', [ 'assets/youcanstaybut-cs.mp3', 'assets/youcanstaybut-cs.m4a']);
    ctx.load.audio('yourfaceyourass-cs', [ 'assets/yourfaceyourass-cs.mp3', 'assets/yourfaceyourass-cs.m4a']);
    
    ctx.load.audio( 'beginatthebeginning-vd', ['assets/beginatthebeginning-vd.mp3', 'assets/beginatthebeginning-vd.m4a' ]);
    ctx.load.audio( 'blowitoutofyourass-vd', ['assets/blowitoutofyourass-vd.mp3', 'assets/blowitoutofyourass-vd.m4a' ]);
    ctx.load.audio( 'breakmybed-vd', ['assets/breakmybed-vd.mp3', 'assets/breakmybed-vd.m4a' ]);
    ctx.load.audio( 'donttellmewhattodo-vd', ['assets/donttellmewhattodo-vd.mp3', 'assets/donttellmewhattodo-vd.m4a' ]);
    ctx.load.audio( 'drunktoomuch-vd', ['assets/drunktoomuch-vd.mp3', 'assets/drunktoomuch-vd.m4a' ]);
    ctx.load.audio( 'equalopportunity-vd', ['assets/equalopportunity-vd.mp3', 'assets/equalopportunity-vd.m4a' ]);
    ctx.load.audio( 'hailtotheking-vd', ['assets/hailtotheking-vd.mp3', 'assets/hailtotheking-vd.m4a' ]);
    ctx.load.audio( 'idontseehow-vd', ['assets/idontseehow-vd.mp3', 'assets/idontseehow-vd.m4a' ]);
    ctx.load.audio( 'imsothirsty-vd', ['assets/imsothirsty-vd.mp3', 'assets/imsothirsty-vd.m4a' ]);
    ctx.load.audio( 'mymomcandothattoo-vd', ['assets/mymomcandothattoo-vd.mp3', 'assets/mymomcandothattoo-vd.m4a' ]);
    ctx.load.audio( 'strongboysnevergiveup-vd', ['assets/strongboysnevergiveup-vd.mp3', 'assets/strongboysnevergiveup-vd.m4a' ]);
    ctx.load.audio( 'takeitslow-vd', ['assets/takeitslow-vd.mp3', 'assets/takeitslow-vd.m4a' ]);
    ctx.load.audio( 'therightmaninthewrong-vd', ['assets/therightmaninthewrong-vd.mp3', 'assets/therightmaninthewrong-vd.m4a' ]);
    ctx.load.audio( 'timetokickass-vd', ['assets/timetokickass-vd.mp3', 'assets/timetokickass-vd.m4a' ]);
    ctx.load.audio( 'underneath-vd', ['assets/underneath-vd.mp3', 'assets/underneath-vd.m4a' ]);
    ctx.load.audio( 'weareallmadhere-vd', ['assets/weareallmadhere-vd.mp3', 'assets/weareallmadhere-vd.m4a' ]);
    ctx.load.audio( 'whatareyou-vd', ['assets/whatareyou-vd.mp3', 'assets/whatareyou-vd.m4a' ]);
    ctx.load.audio( 'wishtogoanywhere-vd', ['assets/wishtogoanywhere-vd.mp3', 'assets/wishtogoanywhere-vd.m4a' ]);
    ctx.load.audio( 'wrongbutton-vd', ['assets/wrongbutton-vd.mp3', 'assets/wrongbutton-vd.m4a' ]);
    ctx.load.audio( 'youcametooquick-vd', ['assets/youcametooquick-vd.mp3', 'assets/youcametooquick-vd.m4a' ]);
    ctx.load.audio( 'youcanstaybut-vd', ['assets/youcanstaybut-vd.mp3', 'assets/youcanstaybut-vd.m4a' ]);
    ctx.load.audio( 'yourfaceyourass-vd', ['assets/yourfaceyourass-vd.mp3', 'assets/yourfaceyourass-vd.m4a' ]);
    ctx.load.audio( 'titanic-vd', ['assets/titanic-vd.mp3', 'assets/titanic-vd.m4a' ]);
    ctx.load.audio( 'todo-vd', ['assets/todo-vd.mp3', 'assets/todo-vd.m4a' ]);
    ctx.load.audio( 'uber-vd', ['assets/uber-vd.mp3', 'assets/uber-vd.m4a' ]);
    ctx.load.audio( 'offtoday-vd', ['assets/offtoday-vd.mp3', 'assets/offtoday-vd.m4a' ]);

    setupHandlers(ctx);
}

export function cullSprites(ctx: Phaser.Scene) {
    const children: Phaser.GameObjects.GameObject[] = ctx.children.getChildren();
    const n: number = children.length;
    let i = 0;
    while (i < n) {
        const c = children[i];
        if (c instanceof Phaser.Physics.Matter.Sprite) {
            const t = c as Phaser.Physics.Matter.Sprite;
            t.setVisible(false);
        }
        i++
    }

    const visible: Phaser.GameObjects.GameObject[] = ctx.cameras.main.cull(children);
    const n2: number = visible.length;
    i = 0;
    while (i < n2) {
        const c = visible[i];
        if (c instanceof Phaser.Physics.Matter.Sprite) {
            const t = c as Phaser.Physics.Matter.Sprite;
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
            {x: 9, y: 95 },
            {x: 1, y: 79 },
            {x: 7, y: 53 },
            {x: 11,y: 45 },
            {x: 0, y: 25 },
            {x: 0, y: 7 },
            {x: 8, y: 1 },
            {x: 19,y: 12},
            {x: 23,y: 37},
            {x: 33,y: 35},
            {x: 33,y: 8},
            {x: 40,y: 1},
            {x: 46,y: 1},
            {x: 54,y: 7},
            {x: 55,y: 29},
            {x: 49,y: 43},
            {x: 59,y: 50},
            {x: 59,y: 82},
            {x: 62,y: 81},
            {x: 62,y: 96},
            {x: 9,y: 96 }
        ],
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

export function basicCreate(ctx, name, x, y, width, height, rotation, enemyCat, collideWith, controller: ObstaclesController, objData, player) {
    switch (name) {
        case 'neon': {
            const variation = objData.properties.find((p)=>p.name === 'taste')?.value || 'neon';
            const neon = ctx.matter.add.sprite( x + (width * 0.5), y + (height * 0.5), variation, undefined, { 
                isStatic: true,
                label: 'neon',
                vertices: [{x:0,y:0}, {x: 256, y: 0}, {x: 256, y: 52 }, { x:0,y: 52}]
            });
            const m = new NeonController(ctx,neon,variation);
            neon.setCollisionGroup(6);
            neon.setCollidesWith([6]);
            controller.add('neon', neon, neon.body as MatterJS.BodyType);
            ctx.neon.push(m);
            break;
        }
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
        case 'lava-top':
        case 'lava-center':
            ctx.lava.push( CreatureHelper.createCreatureLava(ctx, name,x,y, width, height, enemyCat, collideWith, controller));
            break;
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
            ctx.bears.push(CreatureHelper.createCreatureBear(ctx, x, y, width, height, enemyCat, collideWith, controller, player));
            break;
        }
        case 'boss': {
            ctx.boss.push(CreatureHelper.createCreatureBoss(ctx, x, y, width, height, enemyCat, collideWith, controller, player));
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
        case 'key': {
            ObjectHelper.createKey(ctx, x, y, width, height, controller);
            break;
        }
        case 'lab': {
            ObjectHelper.createLab(ctx, x, y, width, height);
            break;
        }
        case 'health':
        case 'heart': {
            ObjectHelper.createHealth(ctx, x, y, width, height);
            break;
        }
        case 'crate': {
            ObjectHelper.createCrate(ctx, x, y, width, height);
            break;
        }

        case 'trashcan': {
            ObjectHelper.createTrashcan(ctx,x,y,width,height);
            break;
        }
        case 'window': {
            ctx.doors.push(CreatureHelper.createWindow(ctx,x,y,width,height,rotation,enemyCat,collideWith,controller,player));
            break;
        }
        case 'pipe': {
            const dstx = objData.properties.find((p) => p.name === 'dstx')?.value;
            const dsty = objData.properties.find((p) => p.name === 'dsty')?.value;
            const delay = objData.properties.find((p) => p.name === 'delay')?.value || 0;
            const duration = objData.properties.find((p) => p.name === 'duration')?.value || 0;
            const room_wid = objData.properties.find((p) => p.name === 'room_width')?.value || 0;
            const room_hei = objData.properties.find((p) => p.name === 'room_height')?.value || 0;

            const pipe = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                isStatic: true,
                label: 'pipe'
            });
            controller.addWithValues('pipe', undefined, pipe,{ "dstx": dstx, "dsty": dsty, "delay": delay, "duration": duration, "room_width": room_wid, "room_height": room_hei });
            break;
        }
        case 'platform': {
            const to = objData.properties.find((p) => p.name === 'to').value;
            const duration = objData.properties.find((p) => p.name === 'duration').value;
            const vert = objData.properties.find((p) => p.name === 'vert').value;
            const noautostart = objData.properties.find((p)=> p.name === 'noautostart')?.value || false;

            const platform = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'platform', undefined, {
                isStatic: true,
                label: 'platform',
                vertices: [{ x: 0, y: 0 }, { x: 192, y: 0 }, { x: 192, y: 32 }, { x: 0, y: 32 }]
            });

            const m = new MovingPlatform(ctx, x, y, to, duration, vert, platform, noautostart, platform.body.id);
            controller.add('platform', platform, platform.body as MatterJS.BodyType);
            break;
        }
        case 'bar': {
            const bar = ctx.matter.add.sprite(x + (width * 0.5), y+ (height * 0.5), 'bar', undefined, {
                vertices: [{ x: 0, y: 0 }, { x: 937, y: 0 }, { x: 937, y: 28 }, { x: 0, y: 28 }],
                isStatic: true,
                label: 'bar'
            });
        
            bar.setData('type', 'bar'); 
            bar.setCollidesWith([]);

            const m = new BarController(ctx,bar,'bar');
            controller.add('bar', bar, bar.body as MatterJS.BodyType);
            break
        }
        case 'sink': {
            //FIXME: groups a set of tiles and move them down 
            break;
        }
        case 'trap': {
            //FIXME: deadly object that moves down x tiles in time t
            break;
        }
        case 'brick': {
            const hits = objData.properties.find((p) => p.name === 'hits').value;
            const pem = objData.properties.find((p) => p.name === 'emitter').value;

            const brick: MatterJS.BodyType = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
                isStatic: true,
                label: 'brick',
            });
            const m = new Rabbitmitter(ctx, x, y, hits, pem, brick);
            controller.addWithValues('brick', undefined, brick, { "use": hits, "emitter": m });
            break;
        }
        case 'coinbrick': {
            const hits = objData.properties.find((p) => p.name === 'hits').value;
            const brick: MatterJS.BodyType = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
                isStatic: true,
                label: 'coinbrick',
            });
            controller.addWithValues('coinbrick', undefined,brick, { "use": hits });
            break;
        }
        case 'spikes': {
            const spike = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                isStatic: true
            });
            controller.add('spikes', undefined,spike);
            break;
        }
        case 'bonus': {
            const bonus = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                vertices: [{ x: 1, y: 1 }, { x: 64, y: 1 }, { x: 64, y: 64 }, { x: 1, y: 64 }],
                isStatic: true,
                label: 'bonus',
            });
            controller.addWithValues('bonus', undefined, bonus, { "use": 3, "last": -1 });
            break;
        }
        case 'exit': {
            const ev = objData.properties.find((p) => p.name === 'event').value;
            const room = objData.properties.find((p) => p.name === 'room')?.value || 'start';
            const bonus = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
                isStatic: true,
                label: 'exit',
            });
            controller.addWithValues('exit',undefined, bonus, { "event": ev, "room": room });
            break;
        }
        case 'return': {
            const bonus = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
                isStatic: true,
                label: 'return',
            });
            const dx = objData.properties.find((p) => p.name === 'spawnx').value;
            const dy = objData.properties.find((p) => p.name === 'spawny').value;

            controller.addWithValues('return',undefined, bonus, { "spawnx": dx, "spawny": dy });
            break;
        }
        case 'goto': {
            const bonus = ctx.matter.add.rectangle(x + (width * 0.5), y + (height * 0.5), width, height, {
                vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
                isStatic: true,
                label: 'return',
            });
            const dx = objData.properties.find((p) => p.name === 'spawnx').value;
            const dy = objData.properties.find((p) => p.name === 'spawny').value;
            const camw = objData.properties.find((p) => p.name === 'camera-width').value;
            const camh = objData.properties.find((p) => p.name === 'camera-height').value;

            controller.addWithValues('goto',undefined, bonus, { "spawnx": dx, "spawny": dy, "camw": camw, "camh": camh });

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
            controller.add('billboard',billboard, billboard.body as MatterJS.BodyType);
            break;
        }
        case 'changeskin': {
            const use = objData.properties.find((p) => p.name === 'use').value;
            const skin = ctx.matter.add.sprite(x + (width * 0.5), y + (height * 0.5), 'changeskin', undefined, {
                isStatic: true,
                label: 'changeskin',
                vertices: [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],

            });
            new ChangeSkin(ctx, skin, 'changeskin');
            controller.addWithValues('changeskin',skin,  skin.body as MatterJS.BodyType, { "use": use });
            break;
        }

        case 'player':
        case 'player-spawn':
            break;

        case '':
            console.log("Object " + objData.id + " has no name");
            break;

        default:
            {
                const sp = objData.properties.find((p) => p.name === 'label').value;
                ctx.add.image(width / 2, height / 2, name, sp);
            }
            break;
    }

}

export function isGamePadActive(ctx: Phaser.Scene) : boolean {
    const pad = ctx.input.gamepad?.getPad(0);
    return pad !== undefined;
}

export function isGamePadRight(ctx: Phaser.Scene) : boolean {
    const pad = ctx.input.gamepad?.getPad(0);
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

export function isGamePadLeft(ctx: Phaser.Scene) : boolean {
    const pad = ctx.input.gamepad?.getPad(0);
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

export function isGamePadDown(ctx: Phaser.Scene) : boolean {
    const pad = ctx.input.gamepad?.getPad(0);
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

export function isGamePadUp(ctx: Phaser.Scene) : boolean {
    const pad = ctx.input.gamepad?.getPad(0);
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

export function gamePadAnyButton(ctx: Phaser.Scene) : boolean {
    const pad = ctx.input.gamepad?.getPad(0);
    if(pad === undefined)
        return false;

    for ( let i = 0; i < pad.buttons.length; i ++ ) {
        if(pad?.buttons[i].pressed)
           return true;
    }
    return false;
}
