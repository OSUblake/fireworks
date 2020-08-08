class FireworkImage extends PIXI.Sprite {

  constructor(fireworks, emote) {

    super(emote.data.texture);
    
    this.fireworks = fireworks;

    this.emote = emote;

    // this.origImage = emote.image;

    const data = emote.data;

    // this.imageData = data.imageData;
    // this.isValid = data.isValid;

    // this.isVideo = data.isVideo;

    // this.baseWidth = data.baseWidth;
    // this.baseHeight = data.baseHeight;

    this.width = data.startWidth;
    this.height = data.startHeight;

    // this.startWidth = data.startWidth;
    // this.startHeight = data.startHeight;
    // this.endWidth = data.endWidth;
    // this.endHeight = data.endHeight;

    this.anchor.set(0.5);

    if (emote.data.maskTexture) {
      this.maskSprite = new PIXI.Sprite(emote.data.maskTexture);
      this.maskSprite.anchor.set(0.5);
      this.mask = this.maskSprite;
    }
  }

  update(x = 0, y = 0, rotation = 0) {

    this.x = x;
    this.y = y;
    this.rotation = rotation;

    if (this.maskSprite) {
      this.maskSprite.x = x;
      this.maskSprite.y = y;
      this.maskSprite.rotation = rotation;
    }
  }

  play() {
    if (this.isVideo) {
      // this.origImage.currentTime = 0;
      // this.origImage.play();
    }    
  }

  pause() {
    if (this.isVideo) {
      // this.origImage.pause();
    }    
  }

  // randomColor() {
  //   return this.emote.data.randomColor();
  // }

  // getColor(x = 0, y = 0) {
  //   return this.emote.data.getColor(x, y);
  // }
}
