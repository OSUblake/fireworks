class ShapeTextures {

  constructor(fireworks) {

    this.fireworks = fireworks;
    this.particleSize = fireworks.particleSize;

    this.shapes = {};
    this.numShapes = 0;

    this.texture = document.createElement("canvas");

    const particleSize = this.particleSize;
    const size = this.size = particleSize + 1;

    this.width = 1000;
    this.cols = Math.floor(this.width / size);
    this.rows = 1;

    const p1 = new Path2D();
    p1.rect(1, 1, particleSize, particleSize);
    
    const p2 = new Path2D();
    p2.moveTo(1 + particleSize / 2, 1);
    p2.lineTo(size, size);
    p2.lineTo(1, size);
    p2.closePath();
    
    this.rectPath = p1;
    this.trianglePath = p2;
  }

  addColor(color, shape) {

    if (this.shapes[color]) {
      return this;
    }

    const dpr = this.fireworks.dpr;
    
    let path = this[shape + "Path"];
    
    if (!path) {
      shape = randomChoice("rect", "triangle", 0.5);
      path = this[shape + "Path"];
    }
    
    const size = this.size;
    const x = (this.numShapes * size) % (this.cols * size) + 1;
    const rows = Math.floor(this.numShapes / this.cols);
    const y = rows * size + 1;
    this.rows = rows + 1;

    const frame = {
      x: x, 
      y: y, 
      path, 
      sSize: this.particleSize * dpr,
      dSize: this.particleSize,
      sx: x * dpr,
      sy: y * dpr,
      texture: this.texture
    };

    this.shapes[color] = frame;
    this.numShapes++;

    return frame;
  }

  getFrame(color) {
    return this.shapes[color];
  }

  generate() {

    const dpr = this.fireworks.dpr;

    this.height = this.rows * this.size;
    
    this.texture.width = this.width * dpr;
    this.texture.height = this.rows * this.size * dpr;
    
    const ctx = this.texture.getContext("2d");
    
    for (const [color, frame] of Object.entries(this.shapes)) {
      
      ctx.setTransform(
        dpr, 
        0, 
        0, 
        dpr, 
        frame.x * dpr, 
        frame.y * dpr
      );
      ctx.fillStyle = color;
      ctx.fill(frame.path);
    }
  }
}
