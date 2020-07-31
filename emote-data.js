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
    let ratio = 1;

    if (this.baseWidth > maxSize) {
      ratio = maxSize / this.baseWidth;
    } else if (this.baseHeight > maxSize) {
      ratio = maxSize / this.baseHeight;
    }

    this.width = Math.floor(this.baseWidth * ratio);
    this.height = Math.floor(this.baseHeight * ratio);
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

    canvas.width = this.width;
    canvas.height = this.height;

    ctx.drawImage(image, 0, 0, this.baseWidth, this.baseHeight, 0, 0, this.width, this.height);
    this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data; 
  }
}
