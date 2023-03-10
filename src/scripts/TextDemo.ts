import * as Phaser from 'phaser';

export default class TextDemo { 
 
  private bitmapLetters: Phaser.GameObjects.BitmapText[] = [];
  private scene: Phaser.Scene;
  private destY: number;
 
  constructor(scene: Phaser.Scene, font: string, text: string, fontSize: number, dstX: number, dstY: number , tint: number, originX: number = 0, originY: number = 0) {
    
    let tmp = scene.add.bitmapText( dstX, dstY, font, text, fontSize);
    const wid = tmp.width/2;

    tmp.destroy();

    for( let i = 0; i < text.length; i ++ ) {
      const letter = text[i];
      let bitmapLetter = scene.add.bitmapText( dstX + (i * fontSize) - wid, dstY, font, letter, fontSize);
      bitmapLetter.setTint(0xff7300);
      bitmapLetter.setOrigin(originX,originY);
      this.bitmapLetters.push(bitmapLetter);
    }

    this.destY = dstY;
 

    this.scene = scene;
  }

  letterBounce(min: number, max: number, loop: boolean,distance: number, repeat: number = -1) {
    
    for( let i = 0; i < this.bitmapLetters.length; i ++ ) {
      const startY = this.bitmapLetters[i].y;
      const d = Phaser.Math.Between( min,max);
      this.scene.tweens.add({
        targets: this.bitmapLetters[i],
        y: startY - (Phaser.Math.Between(distance/4, distance)),
        duration: d,
        ease: 'Sine.easeInOut',
        yoyo: loop,
        repeat: repeat,
        delay: 500,
      })
    }
  }
 
  destroy() {
    for( let i = 0; i < this.bitmapLetters.length; i ++ ) {
      this.bitmapLetters[i].destroy();
    } 

    this.bitmapLetters = [];
  }

}