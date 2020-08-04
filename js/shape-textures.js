class ShapeTextures {

  constructor(fireworks) {

    this.fireworks = fireworks;
    this.particleSize = fireworks.particleSize;

    this.shapes = {};
    this.numShapes = 0;

    this.texture = document.createElement("canvas");
    this.pad = 4;

    const particleSize = this.particleSize;
    const size = this.size = particleSize + this.pad;

    this.width = 1024;
    this.cols = Math.floor(this.width / size);
    this.rows = 1;

    const p1 = new Path2D();
    p1.rect(0, 0, particleSize, particleSize);
    
    const p2 = new Path2D();
    p2.moveTo(particleSize / 2, 0);
    p2.lineTo(particleSize, particleSize);
    p2.lineTo(0, particleSize);
    p2.closePath();
    
    this.rectPath = p1;
    this.trianglePath = p2;
  }

  addColor(color) {

    const key1 = color + "-rect";
    const key2 = color + "-triangle";

    if (this.shapes[key1]) {
      return this;
    }

    this.shapes[key1] = this.addFrame(color, this.rectPath);
    this.shapes[key2] = this.addFrame(color, this.trianglePath);;
  }

  addFrame(color, path) {

    const dpr = this.fireworks.dpr;

    const size = this.size;
    const rows = Math.floor(this.numShapes / this.cols);
    let x = ((this.numShapes * size) % (this.cols * size));
    let y = rows * size;
    this.rows = rows + 1;

    const frame = {
      color,
      x: x, 
      y: y, 
      path, 
      sSize: this.particleSize * dpr,
      dSize: this.particleSize,
      sx: x * dpr,
      sy: y * dpr,
      texture: this.texture
    };

    this.numShapes++;

    return frame;
  }

  getFrame(color, shape = "rect") {
    return this.shapes[`${color}-${shape}`];
  }

  nearestPow2(value){
    return Math.pow(2, Math.ceil(Math.log(value) / Math.log(2))); 
  }

  generate() {

    const dpr = this.fireworks.dpr;

    // this.height = this.rows * this.size;
    
    this.texture.width = this.width * dpr;
    // this.texture.height = this.rows * this.size * dpr;

    this.height = this.rows * this.size;
    this.texture.height = this.nearestPow2(this.height * dpr);
    
    const ctx = this.texture.getContext("2d");
    
    for (const [key, frame] of Object.entries(this.shapes)) {
      
      ctx.setTransform(
        dpr, 
        0, 
        0, 
        dpr, 
        frame.x * dpr, 
        frame.y * dpr
      );

      ctx.fillStyle = frame.color;
      ctx.fill(frame.path);

      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillRect(0, 0, this.width, this.height);

      
    }

    // console.log("SHAPE TEXTURE", this.texture)

    this.baseTexture = new PIXI.BaseTexture(this.texture, {
      resolution: dpr
    })

    // this.baseTexture = PIXI.BaseTexture.from(this.texture, {
    // // this.baseTexture = new PIXI.BaseTexture(this.texture, {
    //   resolution: dpr
    // });
}
}
