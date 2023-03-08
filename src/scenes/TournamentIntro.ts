import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';

export default class TournamentIntro extends Phaser.Scene {
    
    public content: string[] = [
        "",
        "",
        "",
        "Greetings, Rabbits!",
        "",
        "Are you ready to stake your claim",
        "in the ultimate battle of crypto dominance?",
        "",
        "",
        "",
        "Do you have what it takes to outsmart",
        "your opponents and emerge victorious",
        "as the king of the carrot patch?",
        "",
        "",
        "",
        "Well, get ready to put your tokens where your paws are,",
        "",
        "",
        "",
        "because the tournament game is about to begin!",
        "",
        "",
        "",
        "The rules are simple: stake your tokens,",
        "compete against other players,",
        "and the one with the highest stake wins big.",
        "",
        "",
        "",
        "The rewards are so sweet,",
        "they'll make you want to hop with excitement.",
        "",
        "",
        "",
        `But beware, rabbits, for there's a ${globalThis.leavePenalty | 20}% penalty`,
        "for those who bail out early.",
        "",
        "",
        "",
        "We don't want to be left nibbling",
        "on a carrot alone, do we?",
        "",
        "",
        "",
        "So make sure you stay till the end",
        "and fight like a true rabbit.",
        "",
        "",
        "",
        "So grab your tokens, sharpen your mind,",
        "and get ready to hop into action!",
        "",
        "",
        "",
        "The game maker will choose the winners,",
        "and the rewards will be paid out from",
        "the total amount staked.",
        "",
        "",
        "",
        "And if you're lucky enough",
        "to emerge as the champion,",
        "your stake will be increased",
        "by a percentage.",
        "",
        "",
        "",
        "Now that's a win-win situation!",
        "",
        "",
        "",
        "Stay tuned for our announcements",
        "on when the tournaments start,",
        "and what you need to do to join the fray.",
        "",
        "",
        "",
        "Afraid to miss out ?",
        "You can stake already now",
        "But don't forget to keep up to date!",
        "",
        "",
        "",
        "Remember, in the game of crypto,",
        "there's no time for hopping around.",
        "So, let's grab our carrots,",
        "and stake our claim in the tournament game!",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        
    ];

    private scroller!: Phaser.GameObjects.DynamicBitmapText;
    private music!:Phaser.Sound.BaseSound;
    private countdownText!: Phaser.GameObjects.BitmapText;
    private countdown = 0;
    private buttonRepeat1 = 0;
    private buttonRepeat2 = 0;
    private lastUpdate = 0;

    constructor() {
        super("tournament-intro");
    }

    init() {
        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            this.destroy();
        });
    }
   
    preload() {
        SceneFactory.preload(this);
    }
 
    create() {
        const { width, height } = this.scale;

        this.input.setDefaultCursor('none');

        this.countdown = 68;
        this.countdownText = this.add.bitmapText(width - 64, height - 64, 'press_start', "" + this.countdown, 22 ).setOrigin(1,1).setTint(0x300051);
        this.time.addEvent( { delay: 1000, callback: this.updateCountdown, callbackScope: this});

        this.scroller = this.add.dynamicBitmapText(640, 360, 'press_start', this.content, 22).setOrigin(0.5,0.5);
        this.scroller.setCenterAlign();
        
        this.scroller.scrollY = -1650;
       
        this.input.on('pointerdown', () => { this.endScene(); });
        this.input.keyboard?.on("keydown", this.handleKeyDown, this);

        SceneFactory.playRepeatMusic(this, 'finalbossbattle');
    }

    update(time, delta) {
        this.scroller.scrollY += 0.05 * delta;
        console.log( this.scroller.scrollY);
        if (this.scroller.scrollY > 1800) {
            this.scroller.scrollY = -1650;
        }
        
        if (time < this.lastUpdate)
            return;

        this.lastUpdate = time + 120;

        if(SceneFactory.gamePadIsButton(this,0)) {
            this.buttonRepeat1 ++;
        }
        else {
            this.buttonRepeat1 = 0;
        }

        if(SceneFactory.gamePadIsButton(this,8)) {
            this.buttonRepeat2 ++;
        }
        else {
            this.buttonRepeat2 = 0;
        }

        if(this.buttonRepeat1 >= 15) {
            this.endScene();
            this.buttonRepeat1 = 0;
        }

        if(this.buttonRepeat2 >= 15) {
            this.previousScene();
            this.buttonRepeat2 = 0;
        }
         
    }

    destroy() {
        this.scroller.destroy();
        this.countdownText.destroy();
    
        SceneFactory.stopSound(this);
        SceneFactory.removeAllSounds(this);
    }

    private handleKeyDown(event) {
        if (event.keyCode == 27) {
            this.previousScene();
        }
        if( event.keyCode == 32) {
            this.endScene();
        }
    }

    private endScene() {
        this.scene.stop();
        this.scene.start('tournament');
    }

    private previousScene() {
        this.scene.stop();
        this.scene.start('hoppa-select');
    }

    private updateCountdown() {
        this.countdown --;
        if(this.countdown <= 0) {
            this.endScene();
        }
        else {
            this.time.addEvent( { delay: 1000, callback: this.updateCountdown, callbackScope: this});
        }
        this.countdownText.setText( "" + this.countdown );
    }

}