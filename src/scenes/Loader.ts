import Phaser from "phaser";
import * as SceneFactory from '../scripts/SceneFactory';

export default class Loader extends Phaser.Scene {
    constructor(name: string) {
        super(name)
    }

    private commandline!: Phaser.GameObjects.Text;
    private ready!: Phaser.GameObjects.Text;



    preload() {
        let width = this.game.canvas.width;
        let height = this.game.canvas.height;

        let d = ~~(width / 12);

        this.cameras.main.setBackgroundColor(0x000000);
        this.add.rectangle(d, d, width - d - d, height - d - d, 0x000000).setOrigin(0);

        let startup = this.add.graphics();


        let boot = this.make.text({
            x: d + d,
            y: d,
            text: 'RA8BIT BASIC version 22.0',
            style: {
                font: "20px 'Press Start 2P'",
                color: "#ffffff",
            }
        });
        boot.setOrigin(0, 0);


        let status = this.make.text({
            x: d + (d / 2),
            y: d + 24,
            text: '4GB RAM SYSTEM    4294958080 Bytes free',
            style: {
                font: "20px 'Press Start 2P'",
                color: "#ffffff",
            }
        });
        status.setOrigin(0, 0);

        let info = this.make.text({
            x: d + (d / 2),
            y: d + 48,
            text: '(C) RA8BITS & MOONSHOT',
            style: {
                font: "20px 'Press Start 2P'",
                color: "#ffffff",
            }
        });
        info.setOrigin(0, 0);


        this.ready = this.make.text({
            x: d + 2,
            y: d + 48 + 48 + 24 + 24,
            text: '',
            style: {
                font: "20px 'Press Start 2P'",
                color: "#ffffff",
            }
        });
        status.setOrigin(0, 0);


        this.commandline = this.add.text(2 + d, d + 48 + 48 + 48 + 24, '');
        this.commandline.setColor("#ffffff");
        this.commandline.setFontSize(20);

        var progressBar = this.add.graphics();
        var progressBox = this.add.graphics();
        var scene = this;

        var percentText = this.make.text({
            x: 4 + d + 128,
            y: d + 48 + 48,
            text: '0%',
            style: {
                font: "20px 'Press Start 2P'",
            }
        });

        var assetText = this.make.text({
            x: d + 128 + 64,
            y: d + 48 + 48,
            text: '',
            style: {
                font: "20px 'Press Start 2P'",
            }
        });

        this.load.on('progress', function (value: string) {
            let p1 = parseFloat(value);
            let p = ~~(p1 * 100);
            percentText.setText(p + '%');
            percentText.setColor('#ffffff');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBox.fillRect(4 + d, d + 48 + 48, 128 * p1, 20);
        });

        this.load.on('fileprogress', function (file) {
            assetText.setText(' ' + file.key + "]");
            assetText.setColor('#ffffff');
        });

        this.load.on('complete', (e) => {
            this.ready.text = "READY."
            progressBar.destroy();
            progressBox.destroy();
            percentText.destroy();
            assetText.destroy();

        }, this);


        SceneFactory.preload(this);
    }

    create() {
        this.typewriteText('POKE 53265,0: RUN', '#ffffff');

        this.time.delayedCall(1000, () => { this.cameras.main.shake(500, 0.02); }, undefined, this);

        this.time.delayedCall(1500, this.nextScene, undefined, this);
    }

    nextScene() {
        this.scene.start('moonshot');
    }

    typewriteText(text, color) {
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