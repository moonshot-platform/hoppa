import Phaser from "phaser";
import PlayerController from "../scripts/PlayerController";
import { sharedInstance as events } from '../scripts/EventManager';
import * as SceneFactory from '../scripts/SceneFactory';
import { PlayerStats } from "./PlayerStats";

export default class Inventory extends Phaser.Scene {
    constructor() {
        super('inventory')
    }

    private player!: PlayerController;
    private grid: Phaser.GameObjects.Sprite[] = [];
    private gridIndex: number = 0;
    private numCols: number = 5;
    private graphics!: Phaser.GameObjects.Graphics;
    private bgGraphics!: Phaser.GameObjects.Graphics;
    private lastUpdate: number = 0;
    private text?: Phaser.GameObjects.BitmapText;
    private statusText?: Phaser.GameObjects.BitmapText;
    private bgImage!: Phaser.GameObjects.Image;
    private balances: Number[] = [];
    private innerBorder = 8;
    private outerBorder = 4;
    
    private cardInfo : string[] = [
        "",
        "Skin Change Approved!",
        "Dead End!",
        "Power Up! Hit em hard!",
        "Power Up! Throw droppings!",
        "Power Up! Smash those bricks!",
        "Power Up! Need more speed!",
        "Surprise!",
        "Unknown destination",
        "Another voice!"
    ];

    init(d) {
        this.player = d.player;
        
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });

        this.balances = new Array(10).fill(0);
        let data = window.localStorage.getItem( 'ra8bit.cards' );
        if( data != null ) {
            this.balances = JSON.parse(data);
        }
    }

    destroy() {
       this.text?.destroy();
       this.statusText?.destroy();
       this.graphics.destroy();
       this.bgGraphics.destroy();
       this.bgImage.destroy();
       this.grid.forEach( (cell) => {
        cell.destroy();
       });
       this.input.setDefaultCursor('none');
    }

    preload() {
        this.load.audio('card-1', ['assets/card-1.mp3', 'assets/card-1.m4a'] );
        this.load.audio('card-2', ['assets/card-2.mp3', 'assets/card-2.m4a'] );
        this.load.audio('card-3', ['assets/card-3.mp3', 'assets/card-3.m4a'] );
        this.load.audio('card-4', ['assets/card-4.mp3', 'assets/card-4.m4a'] );
        this.load.audio('card-5', ['assets/card-5.mp3', 'assets/card-5.m4a'] );
        this.load.audio('card-6', ['assets/card-6.mp3', 'assets/card-6.m4a'] );
        this.load.audio('card-7', ['assets/card-7.mp3', 'assets/card-7.m4a'] );
        this.load.audio('card-8', ['assets/card-8.mp3', 'assets/card-8.m4a'] );
        this.load.audio('card-9', ['assets/card-9.mp3', 'assets/card-9.m4a'] );

        this.load.image('inv', 'assets/inventory.webp' );
        this.load.atlas('cards', 'assets/cards.webp', 'assets/cards.json' );
    }

    update(time: number, deltaTime: number) {
        if(this.player === undefined) {
            return;
        }

        let id = this.gridIndex;
        let changed = false;
        
        if( this.player.isLeft()) {
            id = this.gridIndex - 1;
            changed = true;
        }
        else if(this.player.isRight()) {
            id = this.gridIndex + 1;
            changed = true;
        }
        else if(this.player.isUp()) {
            id = this.gridIndex + this.numCols;
            changed = true;
        }
        else if(this.player.isDown()) {
            id = this.gridIndex - this.numCols;
            changed = true;
        }

        if( id < 0 ) 
          id = 0;
        else if ( id > (this.grid.length - 1))
          id = (this.grid.length - 1);

        let i = this.gridIndex;
        if( i > (this.grid.length-1))
          i = (this.grid.length - 1);
        else if ( i < 0 )
          i = 0;
        this.gridIndex = i;

        let cell = this.grid[ this.gridIndex ];
        
        if(this.player.isShift() || this.player.isSpace()) {

            const iid = cell.getData("id");
            if( this.balances[iid] > 0 ) {
                SceneFactory.addSound(this, cell.name, false, true );
                this.tweens.add({
                    targets     : [ cell ],
                    scaleX: 1.25,
                    scaleY: 1.25,
                    ease        : 'Linear',
                    duration    : 200,
                    yoyo        : true,
                    repeat      : 0,
                    callbackScope: this,
                    onComplete: () => {
                        events.emit(cell.name);
                    }
                  });
            }
            else {
                this.openItem(iid);
            }
        }

        if( changed ) {
            const cz = 128 + (this.innerBorder/2);
            this.graphics.clear();
        
            this.graphics.lineStyle(this.innerBorder, 0xffffff);
            this.graphics.strokeRect(cell.x - 64, cell.y - 64, 128,128);

            this.graphics.lineStyle(this.outerBorder, 0x16ffff);
            this.graphics.strokeRect(cell.x - (cz/2), cell.y - (cz/2), cz, cz);
            const iid = cell.getData("id");

            this.text?.destroy();
            this.text = this.add.bitmapText(640, 640 - 48 - 44, 'press_start', this.cardInfo[iid], 32)
                .setTint(0xff7300)
                .setOrigin(0.5);
            this.time.delayedCall(8000, () => {
                this.text?.destroy();
                this.text = undefined;
            });    
        }

        if( time < this.lastUpdate ) 
            return;

        this.gridIndex = id;
        this.lastUpdate = time + 120; 
    }

    create() {

        const { width, height } = this.scale;

        this.input.setDefaultCursor('url(assets/hand.cur), pointer');

        this.cameras.main.setBackgroundColor('rgba(0, 0, 0, 0.8)');
 
        this.bgImage = this.add.image(width / 2, height / 2, 'inv').setOrigin(0.5, 0.5);

        this.bgGraphics = this.add.graphics();
        this.bgGraphics.lineStyle(this.innerBorder, 0x00fff8);
        this.bgGraphics.strokeRect(40, 60, 1200, 600);
        
        this.input.keyboard?.on("keydown-I", (event) => {
            this.scene.stop();
        });
        this.input.keyboard?.on("keydown-ESC", (event) => {
            this.scene.stop();
        });

        let statusText = "Press I or R2 [exit]\nPress X or Space [select]\nArrows [navigate]";
        this.statusText = this.add.bitmapText(1000, 96, 'press_start', statusText, 16)
                .setTint(0x16ffff)
                .setOrigin(0.5);
        
        this.player.setJoystick(this, width);
        
        this.graphics = this.add.graphics();

        const cellSize = 128;
        const padding = 16;
        const numCols = this.numCols;
        const numRows = 2;
        const maxCards = 9;
        const totalWidth = numCols * cellSize + (numCols - 1) * padding;
        const totalHeight = numRows * cellSize + (numRows - 1) * padding;
        const startX = (this.cameras.main.width - totalWidth) / 2;
        const startY = (this.cameras.main.height - totalHeight) / 2;
        const graphics = this.graphics;
        const that = this;
        
        let id = 1;
        let haveBalance = false;

        for( let j = 0; j < numRows; j ++ ) {
            for( let i = 0; i < numCols; i ++ ) {
                const x = startX + i * (cellSize + padding);
                const y = startY + j * (cellSize + padding);
               
                const cell = this.add.sprite(x, y, 'cards', `${id}.webp`);
                cell.setData( "id", id );
       
                cell.name = `card-${id}`;
                cell.setInteractive({ useHandCursor: true });
                
                if( this.balances[id] < 1 ) {
                    cell.setAlpha(0.1);
                }
                else {
                    haveBalance = true;
                }

                cell.on('pointerdown', function () {
                    const iid = cell.getData("id");
                    if( that.balances[iid] > 0 ) {
                        SceneFactory.addSound(that, cell.name, false, true );
                        that.tweens.add({
                            targets     : [ cell ],
                            scaleX: 1.25,
                            scaleY: 1.25,
                            ease        : 'Linear',
                            duration    : 200,
                            yoyo        : true,
                            repeat      : 0,
                            callbackScope: that,
                            onComplete: () => {
                                events.emit(cell.name);
                            }
                          });
                    }
                    else {
                        that.openItem(iid);
                    }
                });

                cell.on('pointerover', () => {
                    let cz = cellSize + (this.innerBorder/2);
                    graphics.lineStyle(this.innerBorder, 0xffffff);
                    graphics.strokeRect(x - (cellSize/2), y - (cellSize/2), cellSize, cellSize);

                    graphics.lineStyle(this.outerBorder, 0x16ffff);
                    graphics.strokeRect(x - (cz/2), y - (cz/2), cz, cz);
                    
                    this.gridIndex = (id - 1);
                    const iid = cell.getData("id");

                    this.text?.destroy();
                    this.text = this.add.bitmapText(width * 0.5, 640 - 48 - 44, 'press_start', this.cardInfo[iid], 32)
                        .setTint(0xff7300)
                        .setOrigin(0.5);
                    this.time.delayedCall(8000, () => {
                        this.text?.destroy();
                        this.text = undefined;
                    });
                });

                cell.on('pointerout', () => {
                    graphics.clear();
                    
                    if(!haveBalance) {
                        this.text?.destroy();
                        this.text = this.add.bitmapText(640, 640 - 48 - 44, 'press_start', "Select a hoppa card to buy", 32)
                            .setTint(0xff7300)
                            .setOrigin(0.5);
                    }
                    else {
                        this.text?.destroy();
                        this.text = undefined;
                    }
                });

                this.grid.push(cell);

                id ++;
                if( id > maxCards )
                    break;
            }
        }

        if(!haveBalance) {
            this.text?.destroy();
            this.text = this.add.bitmapText(640, 640 - 48 - 44, 'press_start', "Select a hoppa card to buy", 32)
                .setTint(0xff7300)
                .setOrigin(0.5);
        }
     
        this.scene.bringToTop('inventory');
    }
    
    openItem(id) {
        let url = "https://moonsea.io/details/0xb8eb97a1d6393b087eeacb33c3399505a3219d3d/" + id + "/1";
        window.open(url, '_blank')?.focus();
    }
 
}