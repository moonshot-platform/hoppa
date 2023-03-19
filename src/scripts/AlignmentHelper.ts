export function createAligned(scene, totalWidth, hei, texture, scrollFactor, scale) {
    const w = scene.textures.get(texture).getSourceImage().width;
    const count = Math.ceil(totalWidth / w) * scrollFactor;

    let x = 0;
    for (let i = 0; i < count; ++i) {
        const m = scene.add
            .image(x, hei, texture)
            .setOrigin(0, 1)
            .setScrollFactor(scrollFactor)
            .setScale(scale);

        x += m.width;
    }
}

export function createAligned2(scene, totalWidth, hei, texture, scrollFactor, scale) {
    const w = scene.textures.get(texture).getSourceImage().width;
    const count = Math.ceil(totalWidth / w) * scrollFactor;

    let x = 0;
    for (let i = 0; i < count; ++i) {
        const m = scene.add
            .image(x, hei, texture)
            .setOrigin(0, 1)
            .setScrollFactor(scrollFactor)
            .setScale(scale);

        x += (m.width * scale);
    }
}