class EmoteData {

  constructor(fireworks, image) {

    this.image = image;
    this.fireworks = fireworks;

    this.imageData = [0,0,0,0];
    this.isValid = false;

    this.isVideo = image instanceof HTMLMediaElement;

    this.baseWidth = image.naturalWidth || image.videoWidth || image.width;
    this.baseHeight = image.naturalHeight || image.videoHeight || image.height;

    const maxSize = this.fireworks.maxImageSize;
    const shellSize = this.fireworks.shellSize;
    let ratio = 1;

    // if (this.baseWidth > maxSize) {
    //   ratio = maxSize / this.baseWidth;
    // } else if (this.baseHeight > maxSize) {
    //   ratio = maxSize / this.baseHeight;
    // }

    const sx1 = maxSize / this.baseWidth;
    const sy1 = maxSize / this.baseHeight;  

    const sx2 = shellSize / this.baseWidth;
    const sy2 = shellSize / this.baseHeight;  

    this.scaleMax = Math.min(sx1, sy1);
    this.scaleMin = Math.min(sx2, sx2);

    if (fireworks.explosionType === "particle") {

      // ratio = this.scaleMax;

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

    // this.width = Math.floor(this.baseWidth * ratio);
    // this.height = Math.floor(this.baseHeight * ratio);

    // this.startWidth = 

    this.colorCache = [];
    this.validColors = [];
    this.isValid = false;

    this.minAlpha = fireworks.minPixelAlpha;

    // console.log("EMOTE DATA", this)
  }

  async init() {

    const image = this.image;

    return new Promise(resolve => {

      if (!image) {
        console.log("*** FIREWORKS: Invalid Texture");
        return resolve();
      }

      if (!this.isVideo) {

        this.resizeImage();
        resolve();

      } else {

        const fulfill = () => {
          image.removeEventListener("timeupdate", fulfill);          
          this.resizeImage();
          resolve();
        }

        // needed to get the first frame to render
        image.addEventListener("timeupdate", fulfill);
        image.currentTime = image.duration * 0.5;
      }
    });
  }

  resizeImage() {

    const image = this.image;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    canvas.width = this.endWidth;
    canvas.height = this.endHeight;

    ctx.imageSmoothingEnabled = false;

    // ctx.drawImage(image, 0, 0, this.baseWidth, this.baseHeight, 0, 0, this.width, this.height);
    ctx.drawImage(image, 0, 0, this.baseWidth, this.baseHeight, 0, 0, canvas.width, canvas.height);
    this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data; 

    this.createColors();
  }

  createColors() {

    const width = this.endWidth;
    const height = this.endHeight;

    // let numColors = 0;
    let reds = 0;
    let greens = 0;
    let blues = 0;

    const validColors = [];
    const colorCache = [];
    
    const minAlpha = 0;
    const data = this.imageData;

    // let x, y, i, r, g, b, a;
    // let index = 0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {

          // index = 
          const i = (y * width + x) * 4;

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

    const tint = ((r << 16) + (g << 8) + (b | 0));

    console.log("AVG COLOR", tint.toString(16))


    this.validColors = validColors;
    this.colorCache = colorCache;
    this.isValid = !!count;

    this.randomColor = gsap.utils.random(this.validColors, true);

  }

  getColor(x = 0, y = 0) {

    const i = (y * this.endWidth + x);

    const tint = this.colorCache[i];

    if (tint != null) {
      return tint;
    }

    return -1;
    

    // if (!this.colorCache[i]) {
    //   return -1;
    // }

    // return this.co
  }

  ___getColor(x = 0, y = 0) {

    const i = (y * this.width + x) * 4;

    if (!this.imageData[i]) {
      return -1;
      // return 0;
      // return this.emptyColor;
      // return {
      //   r: 0,
      //   g: 0,
      //   b: 0,
      //   a: 0
      // };
    }

    // const key = "i"

    if (this.colorCache[i]) {
      return this.colorCache[i];
    }

    const data = this.imageData;
    const alpha = data[i+3] / 255;

    if (alpha < this.minAlpha) {
      return this.emptyColor;
    }

    return {
      r: this.imageData[i],
      g: this.imageData[i+1],
      b: this.imageData[i+2],
      a: this.imageData[i+3] / 255,
    };
  }
}
