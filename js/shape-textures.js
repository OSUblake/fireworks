class ShapeTextures {

  constructor(fireworks) {

    this.fireworks = fireworks;
    this.particleSize = utils.nextPow2(Math.max(32, fireworks.particleSize));

    this.shapes = {};
    this.numShapes = 0;

    this.texture = document.createElement("canvas");
    this.ctx = this.texture.getContext("2d");
    this.pad = 4;

    const particleSize = this.particleSize;
    const size = this.size = particleSize + this.pad;

    this.width = utils.nextPow2(Math.max(1024, particleSize));
    this.cols = Math.floor(this.width / size);
    this.rows = 1;

    this.createShapes(particleSize);

    this.generate();
  }

  createShapes(size) {

    const radius = size / 2;

    const p1 = new Path2D();
    p1.rect(0, 0, size, size);
    
    const p2 = new Path2D();
    p2.moveTo(radius, 0);
    p2.lineTo(size, size);
    p2.lineTo(0, size);
    p2.closePath();

    const p3 = new Path2D();
    p3.moveTo(0, radius);
    p3.lineTo(radius, size * 0.3);
    p3.lineTo(size, radius);
    p3.lineTo(radius, size * 0.7);
    p3.closePath();

    const p4 = new Path2D();
    p4.arc(radius, radius, radius, 0, Math.PI * 2);
        
    // const gradient = this.ctx.createRadialGradient(radius, radius, radius * 0.25, radius, radius, radius);    
    // gradient.addColorStop(0, "rgba(255,255,255,1)");
    // gradient.addColorStop(0.2, "rgba(255,255,255,0.25)");
    // gradient.addColorStop(1, "rgba(0,0,0,0)");

    const gradient = this.ctx.createRadialGradient(radius, radius, radius * 0.25, radius, radius, radius);    
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.2, "rgba(255,255,255,0.25)");
    gradient.addColorStop(1, "rgba(0,0,0,0)");

    this.shapes.rect = this.addFrame(p1);
    this.shapes.triangle = this.addFrame(p2);
    this.shapes.polygon1 = this.addFrame(p3);
    this.shapes.circle = this.addFrame(p4, gradient);
  }

  addFrame(path, gradient) {

    const dpr = this.fireworks.dpr;

    const size = this.size;
    const rows = Math.floor(this.numShapes / this.cols);
    let x = ((this.numShapes * size) % (this.cols * size));
    let y = rows * size;
    this.rows = rows + 1;

    const frame = {
      x: x, 
      y: y, 
      path, 
      sSize: this.particleSize * dpr,
      dSize: this.particleSize,
      sx: x * dpr,
      sy: y * dpr,
      texture: this.texture,
      gradient
    };

    frame.rect = new PIXI.Rectangle(frame.sx, frame.sy, frame.sSize, frame.sSize);

    this.numShapes++;

    return frame;
  }

  generate() {

    const dpr = this.fireworks.dpr;
    
    this.texture.width = this.width * dpr;
    this.height = this.rows * this.size;
    this.texture.height = utils.nextPow2(this.height * dpr);

    const radius = this.particleSize / 2;
    
    for (const [key, frame] of Object.entries(this.shapes)) {
      
      this.ctx.setTransform(
        dpr, 
        0, 
        0, 
        dpr, 
        frame.x * dpr, 
        frame.y * dpr
      );

      this.ctx.fillStyle = frame.gradient ? frame.gradient : "#ffffff";
      this.ctx.fill(frame.path);     
    }

    this.baseTexture = new PIXI.BaseTexture(this.texture, {
      resolution: dpr
    });

    this.rectTexture = new PIXI.Texture(this.baseTexture, this.shapes.rect.rect);
    this.triangleTexture = new PIXI.Texture(this.baseTexture, this.shapes.triangle.rect);
    this.polygon1Texture = new PIXI.Texture(this.baseTexture, this.shapes.polygon1.rect);
    this.circleTexture = new PIXI.Texture(this.baseTexture, this.shapes.circle.rect);
  }
}
