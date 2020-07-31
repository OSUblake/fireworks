class FireworkImage extends PIXI.Sprite {

  constructor(fireworks, image) {

    // super(fireworks);

    // super(new PIXI.BaseTexture(image));

    // var baseTexture = new PIXI.BaseTexture(image);
    // console.log("BASE TEXTURE", baseTexture)

    // console.log("IMAGE", image)
    // console.log(PIXI.Texture.from(image))
    super(PIXI.Texture.from(image));
    this.fireworks = fireworks;

    this.origImage = image;
    // this.texture = image;
    this.imageData = [0,0,0,0];
    this.isValid = false;

    this.isVideo = image instanceof HTMLMediaElement;

    this.baseWidth = image.naturalWidth || image.videoWidth || image.width;
    this.baseHeight = image.naturalHeight || image.videoHeight || image.height;

    const maxSize = this.fireworks.maxImageSize;
    let ratio = 1;

    if (this.baseWidth > maxSize) {
      ratio = maxSize / this.baseWidth;
    } else if (this.baseHeight > maxSize) {
      ratio = maxSize / this.baseHeight;
    }

    this.width = Math.floor(this.baseWidth * ratio);
    this.height = Math.floor(this.baseHeight * ratio);
    this.originX = this.width / 2;
    this.originY = this.height / 2;

    this.anchor.set(0.5);
  }

  init() {
    
    // console.log("FIREWORK IMAGE", this)

    const origImage = this.origImage;

    return new Promise(resolve => {

      if (!origImage) {
        console.log("*** FIREWORKS: Invalid Texture");
        return resolve();
      }

      if (!this.isVideo) {

        this.resizeImage();
        resolve();

      } else {

        const fulfill = () => {
          origImage.removeEventListener("timeupdate", fulfill);          
          this.resizeImage();
          resolve();
        }

        // needed to get the first frame to render
        origImage.addEventListener("timeupdate", fulfill);
        origImage.currentTime = origImage.duration * 0.5;
      }
    });
  }

  resizeImage() {

    const image = this.origImage;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = this.width;
    canvas.height = this.height;

    ctx.drawImage(image, 0, 0, this.baseWidth, this.baseHeight, 0, 0, this.width, this.height);
    this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data; 
  }

  play() {
    if (this.isVideo) {
      this.origImage.currentTime = 0;
      this.origImage.play();
    }    
  }

  pause() {
    if (this.isVideo) {
      this.origImage.pause();
    }    
  }

  getColor(x = 0, y = 0) {

    const i = (y * this.width + x) * 4;

    if (!this.imageData[i]) {
      return {
        r: 0,
        g: 0,
        b: 0,
        a: 0
      };
    }

    return {
      r: this.imageData[i],
      g: this.imageData[i+1],
      b: this.imageData[i+2],
      a: this.imageData[i+3] / 255,
    };
  }

  ____render() {

    const ctx = this.fireworks.ctx;

    this.setTransform();
    ctx.globalAlpha = 1;

    ctx.drawImage(
      this.texture,
      0,
      0,
      this.baseWidth,
      this.baseHeight,
      0,
      0,
      this.width,
      this.height
    );
  }
}
