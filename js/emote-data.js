class EmoteData {

  constructor(fireworks, image) {

    this.image = image;
    this.fireworks = fireworks;

    this.maskFirework = fireworks.maskFirework;

    this.imageData = [0,0,0,0];
    this.isValid = false;

    this.isVideo = image instanceof HTMLMediaElement;

    this.baseWidth = image.naturalWidth || image.videoWidth || image.width;
    this.baseHeight = image.naturalHeight || image.videoHeight || image.height;

    const maxSize = this.fireworks.maxImageSize;
    const shellSize = this.fireworks.shellSize;
    
    // const sx1 = maxSize / this.baseWidth;
    // const sy1 = maxSize / this.baseHeight;  

    // const sx2 = shellSize / this.baseWidth;
    // const sy2 = shellSize / this.baseHeight;  

    // this.scaleMax = Math.min(sx1, sy1);
    // this.scaleMin = Math.min(sx2, sy2);

    this.scaleMin = utils.getScale(this.baseWidth, this.baseHeight, shellSize);
    this.scaleMax = utils.getScale(this.baseWidth, this.baseHeight, maxSize);

    let ratio = 1;

    if (fireworks.explosionType === "particle") {

      this.startWidth = Math.floor(this.baseWidth * this.scaleMin);
      this.startHeight = Math.floor(this.baseHeight * this.scaleMin);
      this.endWidth = Math.floor(this.baseWidth * this.scaleMax);
      this.endHeight = Math.floor(this.baseHeight * this.scaleMax);

    } else {

      if (this.scaleMax < 1) {
        ratio = this.scaleMax;
      }

      this.startWidth = this.endWidth = Math.floor(this.baseWidth * ratio);
      this.startHeight = this.endHeight = Math.floor(this.baseHeight * ratio);
    }

    this.colorCache = [];
    this.validColors = [];
    this.isValid = false;

    this.minAlpha = fireworks.minPixelAlpha;
  }

  async init() {

    const image = this.image;

    return new Promise(resolve => {

      if (!image) {
        console.log("*** FIREWORKS: Invalid Texture");
        return resolve();
      }

      if (!this.isVideo) {

        this.createImageData();
        resolve();

      } else {

        const fulfill = () => {
          image.removeEventListener("timeupdate", fulfill);          
          this.createImageData();
          resolve();
        }

        // needed to get the first frame to render
        image.addEventListener("timeupdate", fulfill);
        image.currentTime = image.duration * 0.5;
      }
    });
  }

  resizeImage() {

    const frame = new PIXI.Rectangle(0, 0, this.baseWidth, this.baseHeight);

    let src;

    if (this.isVideo) {      
      src = this.image;
      src.loop = true;
    } else {

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = utils.nextPow2(this.baseWidth);
      canvas.height = utils.nextPow2(this.baseHeight);

      ctx.drawImage(this.image, 0, 0);
      src = canvas;
    }

    // if (this.isVideo) {
    //   this.baseTexture = new PIXI.BaseTexture(this.image);
    //   this.texture = new PIXI.Texture(this.baseTexture, frame);
    //   return this;
    // }

    // const canvas = document.createElement("canvas");
    // const ctx = canvas.getContext("2d");

    // canvas.width = utils.nextPow2(this.baseWidth);
    // canvas.height = utils.nextPow2(this.baseHeight);

    // ctx.drawImage(this.image, 0, 0);

    this.baseTexture = new PIXI.BaseTexture(src);
    this.texture = new PIXI.Texture(this.baseTexture, frame);
  }

  createImageData() {

    const image = this.image;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = this.endWidth;
    canvas.height = this.endHeight;

    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(image, 0, 0, this.baseWidth, this.baseHeight, 0, 0, canvas.width, canvas.height);
    this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data; 

    const radius = Math.min(canvas.width, canvas.height) / 2;
    this.circle = new PIXI.Circle(canvas.width / 2, canvas.height / 2, radius);

    this.maskFirework && this.createMask();
    // this.createMask();
    this.createColors();
    this.resizeImage();
  }

  createMask() {

    // console.log("CREATE MASK")

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = this.startWidth;
    canvas.height = this.startHeight;

    const radius = Math.min(canvas.width, canvas.height) / 2;

    ctx.fillStyle = "rgba(255,255,255,1)";
    // ctx.fillStyle = "#ffffff";
    // ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2);
    ctx.fill();

    this.maskTexture = PIXI.Texture.from(canvas);
  }

  createColors() {

    const width = this.endWidth;
    const height = this.endHeight;

    let reds = 0;
    let greens = 0;
    let blues = 0;

    const validColors = [];
    const colorCache = [];
    
    const minAlpha = 0;
    const data = this.imageData;
    const circle = this.circle;
    const maskFirework = this.maskFirework;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {

          const i = (y * width + x) * 4;

          if (maskFirework && !circle.contains(x, y)) {
            colorCache.push(-1);
            continue;
          }

          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          const a = data[i+3] / 255;

          if (a >= minAlpha) {

            const tint = ((r << 16) + (g << 8) + (b | 0));

            reds += r;
            greens += g;
            blues += b;

            validColors.push(tint);
            colorCache.push(tint);


          } else {
            colorCache.push(-1);
          }
      }
    }

    const count = validColors.length;

    const r = reds / count;
    const g = greens / count;
    const b = blues / count;

    this.avgColor = ((r << 16) + (g << 8) + (b | 0));

    this.validColors = validColors;
    this.colorCache = colorCache;
    this.isValid = !!count;

    this.randomColor = gsap.utils.random(this.validColors, true);

  }

  getColor(x = 0, y = 0) {

    x = Math.round(x);
    y = Math.round(y);

    // console.log("COLOR", x, y)

    const i = (y * this.endWidth + x);

    const tint = this.colorCache[i];

    // if (this.cropExplosion && !this.circle.contains(x, y)) {
    //   return -1;
    // }

    if (tint != null) {
      return tint;
    }

    return -1;
  }
}
