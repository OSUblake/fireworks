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

    const p3 = new Path2D();
    // p2.moveTo(particleSize / 2, 0);
    p3.arc(particleSize / 2, particleSize / 2, particleSize / 2, 0, Math.PI * 2);
    // p2.lineTo(particleSize, particleSize);
    // p2.lineTo(0, particleSize);
    // p2.closePath();
    
    this.rectPath = p1;
    this.trianglePath = p2;
    this.circlePath = p3;

    this.addColor("rgb(255,255,255)");

    this.generate();
  }

  addColor(color) {

    color = color.replace(/\s/g, "");

    const key1 = color + "-rect";
    const key2 = color + "-triangle";
    const key3 = color + "-circle";

    if (this.shapes[key1]) {
      return this;
    }

    this.shapes[key1] = this.addFrame(color, this.rectPath);
    this.shapes[key2] = this.addFrame(color, this.trianglePath);
    this.shapes[key3] = this.addFrame(color, this.circlePath, true);
  }

  addFrame(color, path, useGradient = false) {

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
      texture: this.texture,
      useGradient
    };

    frame.rect = new PIXI.Rectangle(frame.sx, frame.sy, frame.sSize, frame.sSize);

    // const frame = new PIXI.Rectangle(

    // );

    this.numShapes++;

    return frame;
  }

  getFrame(color, shape = "rect") {
    color = color.replace(/\s/g, "");
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

    const radius = this.particleSize / 2;
    // const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
    const gradient = ctx.createRadialGradient(radius, radius, radius * 0.25, radius, radius, radius);
    
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.25)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");
    
    for (const [key, frame] of Object.entries(this.shapes)) {
      
      ctx.setTransform(
        dpr, 
        0, 
        0, 
        dpr, 
        frame.x * dpr, 
        frame.y * dpr
      );

      ctx.fillStyle = frame.useGradient ? gradient : frame.color;
      ctx.fill(frame.path);

      // ctx.fillStyle = "rgba(0,0,0,0)";
      // ctx.fillRect(0, 0, this.width, this.height);      
    }

    this.baseTexture = new PIXI.BaseTexture(this.texture, {
      resolution: dpr
    });

    const frame1 = this.getFrame("rgb(255,255,255)", "rect").rect;
    const frame2 = this.getFrame("rgb(255,255,255)", "triangle").rect;
    const frame3 = this.getFrame("rgb(255,255,255)", "circle").rect;

    this.rectTexture = new PIXI.Texture(this.baseTexture, frame1);
    this.triangleTexture = new PIXI.Texture(this.baseTexture, frame2);
    this.circleTexture = new PIXI.Texture(this.baseTexture, frame3);
  }
}
