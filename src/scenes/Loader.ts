import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';

export default class Loader extends Phaser.Scene {
    constructor(name: string) {
        super(name)
    }

    private commandline!: Phaser.GameObjects.Text;
    private ready!: Phaser.GameObjects.Text;


    init() {
        localStorage.clear();
    }

    preload() {
        const width = this.game.canvas.width;
        const height = this.game.canvas.height;
        
        const d = ~~(width / 12);

        this.cameras.main.setBackgroundColor(0x000000);
        this.add.rectangle(d, d, width - d - d, height - d - d, 0x000000).setOrigin(0);

        const boot = this.make.text({
            x: d + d,
            y: d,
            text: 'RA8BIT BASIC version 23.3',
            style: {
                font: "48px 'Press Start 2P'",
                color: "#ffffff",
            }
        });
        boot.setOrigin(0, 0);


        const status = this.make.text({
            x: d + (d / 2),
            y: d + 64,
            text: '4GB RAM SYSTEM    4294958080 Bytes free',
            style: {
                font: "48px 'Press Start 2P'",
                color: "#ffffff",
            }
        });
        status.setOrigin(0, 0);

        const info = this.make.text({
            x: d + (d / 2),
            y: d + 64 + 64,
            text: '(C) RA8BITS & MOONSHOT 2021-2023',
            style: {
                font: "48px 'Press Start 2P'",
                color: "#ffffff",
            }
        });
        info.setOrigin(0, 0);


        this.ready = this.make.text({
            x: d + 2,
            y: d + 64 + 64 + 64 + 64,
            text: '',
            style: {
                font: "48px 'Press Start 2P'",
                color: "#ffffff",
            }
        });
        status.setOrigin(0, 0);


        this.commandline = this.add.text(2 + d, d + 256 + 64, '');
        this.commandline.setColor("#ffffff");
        this.commandline.setFontSize(48);

        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        
        const percentText = this.make.text({
            x: 4 + d + 128,
            y: d + 256,
            text: '0%',
            style: {
                font: "48px 'Press Start 2P'",
            }
        });

        
        this.load.on('progress', function (value: string) {
            const p1 = parseFloat(value);
            const p = ~~(p1 * 100);
            percentText.setText(p + '%');
            percentText.setColor('#ffffff');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBox.fillRect(4 + d, d + 256, 128 * p1, 48);
        });

        this.load.on('complete', () => {
            this.ready.text = "READY."
            progressBar.destroy();
            progressBox.destroy();
            percentText.destroy();
            

        }, this);

        SceneFactory.preload(this);
    }

    create() {
        this.typewriteText('POKE 53265,0: RUN');

        this.time.delayedCall(1000, () => { this.cameras.main.shake(500, 0.02); }, undefined, this);

        this.time.delayedCall(1500, this.nextScene, undefined, this);
    }

    nextScene() {
        this.scene.start('moonshot');
    }

    typewriteText(text) {
        const length = text.length;
        let i = 0;

        this.time.addEvent({
            callback: () => {
                this.commandline.text += text[i];

                ++i
            },
            repeat: length - 1,
            delay: 40,

        });
    }
}