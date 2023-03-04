import * as Phaser from 'phaser';

export type BannerConfig = {
  background: number[];
  text: string;
  textColor: number;
  textSize: number;
  margin: number;
  x: number;
  y: number;
  expand: boolean;
};

export default class NewsBanner {
  private scene: Phaser.Scene;
  private banner: Phaser.GameObjects.Container;
  private text!:Phaser.GameObjects.BitmapText;
  private graphics!:Phaser.GameObjects.Graphics;
  private bannerHeight = 0;
  private bannerWidth = 0;

  constructor(scene: Phaser.Scene, config: BannerConfig) {
    const { background, text, textColor, textSize, margin,x,y, expand } = config;

    this.scene = scene;
    const col:  Phaser.Display.Color = Phaser.Display.Color.ValueToColor(textColor);
 
    this.text = scene.add.bitmapText(x + margin,y + margin, 'press_start', text, textSize)
        .setTint(textColor)
        .setOrigin(0,0);

    const textMetrics = this.text.getTextBounds(true); 
    const global = textMetrics.global;
  
    const boxWidth = (expand ? scene.scale.width : global.width + margin * 2);
    
    this.graphics = this.scene.add.graphics();

    this.graphics.fillStyle(background[0], 1);
    this.graphics.fillRect(x, y, boxWidth, global.height + margin * 2);
    if (background.length > 1) {
        this.graphics.fillStyle(background[1], 1);
        this.graphics.fillRect(x, y, boxWidth, (global.height + margin * 2) / 2);
    }

    this.banner = this.scene.add.container(x, y, [this.graphics, this.text]);
    this.banner.setSize(boxWidth, global.height + margin * 2);

    this.bannerHeight = global.height + margin * 2;
    this.bannerWidth = global.width;
  }

  destroy() {
    this.graphics.destroy();
    this.text.destroy();
  }
 
  getBannerWidth() {
    return this.bannerWidth;
  }

  getBannerHeight() {
    return this.bannerHeight;
  }

  setText(text: string): void {
    this.text.setText(text);
  }
}