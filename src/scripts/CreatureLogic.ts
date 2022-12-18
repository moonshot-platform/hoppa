import { Physics } from "phaser";

export function hasTileAhead(map: Phaser.Tilemaps.Tilemap, camera: Phaser.Cameras.Scene2D.Camera, sprite: Physics.Matter.Sprite, pathOnly: boolean, tilesAhead: number) {

    const direction = (sprite.body.velocity.x < 0) ? -1 : 1;
    let x = sprite.body.position.x;
    x += (direction * tilesAhead * 64);
    x += (direction * (sprite.width * sprite.centerOfMass.x));
    let y = sprite.body.position.y + (sprite.centerOfMass.y * sprite.height);
    y += 32;

    const tile = map.getTileAtWorldXY(x, y, undefined, camera, 'ground');
    return tile != null;
}