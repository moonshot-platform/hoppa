import Phaser from "phaser";
import * as WalletHelper from '../scripts/WalletHelper';
import * as SceneFactory from '../scripts/SceneFactory';

interface Highscore {
    address: string,
    score: number,
    name: string
}

export default class HallOfFame extends Phaser.Scene {

    private fontface = 'press_start';
    private title!: Phaser.GameObjects.BitmapText;
    private cellPaddingTop: number = 10;
    private cellPaddingBottom: number = 10;
    private cellPaddingLeft: number = 10;
    private cellPaddingRight: number = 10;
    private countdownText!: Phaser.GameObjects.BitmapText;
    private countdown = 0;
    private hsv;
    private hsvIndex = 0;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

    private rowTints: number[] = [
        0xff0000,
        0xff6600,
        0xffff00,
        0x33cc33,
        0x3366cc,
        0x9933cc,
        0xff33cc,
        0x999999,
        0xffffff,
        0xff6600,
      ];

    private highscores: Highscore[] = [];
    private bitmapTexts: Phaser.GameObjects.BitmapText[] = [];

    private fromScene: string = 'hoppa';
    
    constructor() {
        super('halloffame');
        
    }

    init(data) {
        this.cursors = this.input.keyboard?.createCursorKeys();
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });

        if( data !== undefined ) {
            this.fromScene = data.fromScene;
        }
    }

    preload() {
        this.load.bitmapFont('press_start', 'assets/press_start_2p.webp', 'assets/press_start_2p.fnt');

        this.input.setDefaultCursor('none');
    }

    create() {
        const { width, height } = this.scale;

        this.title = this.add.bitmapText(width/2, 16, this.fontface, "HALL OF FAME", 82).setTint(0xffff00).setDropShadow(2,2,0xff0000,0.5).setOrigin(0.5,0);
        this.countdown = 16;
        this.countdownText = this.add.bitmapText(width - 64, height - 64, this.fontface, "" + this.countdown, 22 ).setOrigin(1,1).setTint(0x300051);
        this.time.addEvent( { delay: 1000, callback: this.updateCountdown, callbackScope: this});

        this.hsv = Phaser.Display.Color.HSVColorWheel();

        this.input.on('pointerdown', () => { this.endScene(); });
        
        this.getHallOfFame(); 

        this.time.delayedCall( this.countdown * 1000, this.endScene, undefined, this );
    }


    update(time: number, deltaTime: number) {

        const top = this.hsv[this.hsvIndex].color;
        const bottom = this.hsv[359 - this.hsvIndex].color;
        
        this.hsvIndex++;
        if (this.hsvIndex >= 360)
            this.hsvIndex = 0;

        this.title.setTint(top, bottom, top, bottom);

        if(SceneFactory.gamePadAnyButton(this) || this.cursors?.space.isDown ) {
            this.endScene();
        }
    }

    destroy(){
        this.title.destroy();
        this.countdownText.destroy();
        this.bitmapTexts.forEach( (b)=> { b.destroy(); });
        this.highscores = [];
        this.bitmapTexts = [];
    }   
    
    private updateCountdown() {
        this.countdown --;
        if(this.countdown <= 0) {
            this.scene.stop();
        }
        else {
            this.time.addEvent( { delay: 1000, callback: this.updateCountdown, callbackScope: this});
        }
        this.countdownText.setText( "" + this.countdown );
    }

    private endScene() {
        this.scene.stop();
        this.scene.start(this.fromScene);
    }

    private getOrdinal(i) {
        let j = i % 10,
            k = i % 100;
        if (j == 1 && k != 11) {
            return i + "st";
        }
        if (j == 2 && k != 12) {
            return i + "nd";
        }
        if (j == 3 && k != 13) {
            return i + "rd";
        }
        return i + "th";
    }

    private limit (string = '', limit = 0) {  
        return string.substring(0, limit)
      }

    private parseEntry(address,s,thename): Highscore {
        const score: number = parseInt( s );
        let name = this.limit(thename, 3);
        return { address, score, name };
    }

    private createUI() {
        const screenWidth = this.scale.width;
        const screenHeight = this.scale.height;
      
        const tableWidth = 500;
        const tableHeight = this.highscores.length * 50 + this.cellPaddingTop + this.cellPaddingBottom;
        const tableX = (screenWidth - tableWidth) / 2;
        const tableY = 16 + ( (screenHeight - tableHeight) / 2 );
      
        const rankHeaderX = tableX + this.cellPaddingLeft;
        const rankHeaderY = tableY + this.cellPaddingTop;
        const rankHeaderText = 'RANK';
        this.bitmapTexts.push( this.add.bitmapText(rankHeaderX, rankHeaderY, this.fontface, rankHeaderText, 24) );

        const scoreHeaderX = tableX + tableWidth - this.cellPaddingRight;
        const scoreHeaderY = tableY + this.cellPaddingTop;
        const scoreHeaderText = 'SCORE';
        this.bitmapTexts.push( this.add.bitmapText(scoreHeaderX, scoreHeaderY, this.fontface, scoreHeaderText, 24).setOrigin(1, 0) );

        const nameHeaderX = tableX + tableWidth / 2;
        const nameHeaderY = tableY + this.cellPaddingTop;
        const nameHeaderText = 'NAME';
        this.bitmapTexts.push( this.add.bitmapText(nameHeaderX, nameHeaderY, this.fontface, nameHeaderText, 24).setOrigin(0.5, 0) );

        for (let i = 0; i < this.highscores.length; i++) {
            const rowY = tableY + (i + 1) * 50;

            const rankX = tableX + this.cellPaddingLeft;
            const rankText = this.getOrdinal(i+1);
            this.bitmapTexts.push( this.add.bitmapText(rankX, rowY, this.fontface, rankText, 24).setTint(this.rowTints[i]) );

            const scoreX = tableX + tableWidth - this.cellPaddingRight;
            const scoreText = ( this.highscores[i].score > 0 ? this.highscores[i].score.toString() : "" );
            this.bitmapTexts.push( this.add.bitmapText(scoreX, rowY, this.fontface, scoreText, 24).setOrigin(1, 0).setTint(this.rowTints[i]).setDropShadow(2, 2,0,0.5) );

            const nameX = tableX + tableWidth / 2;
            const nameText = this.highscores[i].name;
            this.bitmapTexts.push( this.add.bitmapText(nameX, rowY, this.fontface, nameText, 24).setOrigin(0.5, 0).setTint(this.rowTints[i]).setDropShadow(2, 2,0,0.5) );
        }

    }
      
    private getHallOfFame() {
        if(globalThis.chainId == 56 && !globalThis.noWallet ) {
            const loadHighscores = async() => {
                const data = await WalletHelper.getHighscores();
                for( let i = 0; i < data.length; i ++ ) {
                    let row = data[i];
                    let p = this.parseEntry( row[0], row[1], row[2] );
                    this.highscores.push( p );
                }
                this.createUI();
            };
            loadHighscores();
        }
    }
}