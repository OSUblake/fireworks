class FireworkImage extends DisplayObject {

  constructor(fireworks, image) {

    super(fireworks);

    this.texture = image;
    this.resizeImage(fireworks.maxImageSize, image);
  }

  resizeImage(maxSize = 100, image) {

    const pixelFactor = 0.3;

    const baseWidth = image.naturalWidth || image.width;
    const baseHeight = image.naturalHeight || image.height;

    let ratio = 1;

    if (baseWidth > maxSize) {
      ratio = maxSize / baseWidth;
    } else if (baseHeight > maxSize) {
      ratio = maxSize / baseHeight;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const canvasCopy = document.createElement("canvas");
    const ctxCopy = canvasCopy.getContext("2d");

    this.texture = canvas;
    this.width = canvas.width = Math.floor(baseWidth * ratio);
    this.height = canvas.height = Math.floor(baseHeight * ratio);
    this.originX = this.width / 2;
    this.originY = this.height / 2;

    const scaledWidth = this.width * pixelFactor;
    const scaledHeight = this.height * pixelFactor;

    ctxCopy.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvasCopy, 0, 0, scaledWidth, scaledHeight, 0, 0, this.width, this.height);
    this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
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

    ctx.globalAlpha = 1;
    this.setTransform();
    ctx.drawImage(this.texture, 0, 0);

    return this;
  }
}
