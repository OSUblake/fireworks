class FireworkImage extends DisplayObject {

  constructor(fireworks, image) {

    super(fireworks);

    this.origImage = image;
    this.texture = image;

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
  }

  init() {
    
    const texture = this.texture;

    return new Promise(resolve => {

      if (!this.isVideo) {

        this.resizeImage();
        resolve();

      } else {

        const fulfill = () => {
          texture.removeEventListener("timeupdate", fulfill);          
          this.resizeImage();
          resolve();
        }

        // needed to get the first frame to render
        texture.addEventListener("timeupdate", fulfill);
        texture.currentTime = texture.duration * 0.5;
      }
    });
  }

  resizeVideo() {

    const texture = this.texture;

    texture.ontimeupdate = () => {
      texture.ontimeupdate = null;
      this.resizeImage();
    }

    texture.currentTime = texture.duration * 0.5;
  }

  resizeImage() {

    // const pixelFactor = 0.3;

    const image = this.texture;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = this.width;
    canvas.height = this.height;

    ctx.drawImage(image, 0, 0, this.baseWidth, this.baseHeight, 0, 0, this.width, this.height);
    this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data; 

    // const canvasCopy = document.createElement("canvas");
    // const ctxCopy = canvasCopy.getContext("2d");


    // const scaledWidth = this.width * pixelFactor;
    // const scaledHeight = this.height * pixelFactor;

    // ctxCopy.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    // ctx.imageSmoothingEnabled = false;
    // ctx.drawImage(canvasCopy, 0, 0, scaledWidth, scaledHeight, 0, 0, this.width, this.height);

    // ctx.drawImage(image, 0, 0, this.baseWidth, this.baseHeight, 0, 0, this.width, this.height);
    // this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;    
  }

  play() {
    if (this.isVideo) {
      this.texture.currentTime = 0;
      this.texture.play();
    }    
  }

  pause() {
    if (this.isVideo) {
      this.texture.pause();
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

  render() {

    const ctx = this.fireworks.ctx;

    this.setTransform();
    ctx.globalAlpha = 1;
    // ctx.globalAlpha = 0;

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
