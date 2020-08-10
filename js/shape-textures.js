class ShapeTextures {

  constructor(fireworks) {

    this.fireworks = fireworks;
    this.particleSize = utils.nextPow2(Math.max(32, fireworks.particleSize));

    this.shapes = {};
    this.numShapes = 0;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.pad = 4;

    const particleSize = this.particleSize;
    const size = this.size = particleSize + this.pad;

    // TODO: Make 2048?
    this.width = utils.nextPow2(Math.max(1024, particleSize));
    // this.width = 2048;

    this.cols = Math.floor(this.width / size);
    this.rows = 1;

    // this.canvas.width = this.width;
    // this.canvas.height = 2048;

    // this.baseTexture = new PIXI.BaseTexture(this.canvas, {
    //   resolution: fireworks.dpr
    // });

    const radius = particleSize / 2;
    // const gradient = this.glowGradient = this.ctx.createRadialGradient(radius, radius, (radius * 0.25) * 0.05, radius, radius, radius * 0.25);    
    const gradient = this.glowGradient = this.ctx.createRadialGradient(radius, radius, 0, radius, radius, radius * 0.25);    
    gradient.addColorStop(0, "rgba(255,255,255,0.5)");
    // gradient.addColorStop(0.25, "rgba(255,255,255,0.2)");
    // gradient.addColorStop(0.5, "rgba(255,255,255,0.05)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    // gradient.addColorStop(0, `rgba(${r},${g},${b},1)`);
    // gradient.addColorStop(0.25, `rgba(${r},${g},${b},0.2)`);
    // gradient.addColorStop(0.5, `rgba(${r},${g},${b},0.05)`);
    // gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

    this.createShapes(particleSize);

    this.addShape(0xffffff, "rect");
    this.addShape(0xffffff, "triangle");
    this.addShape(0xffffff, "polygon");
    this.addShape(0xffffff, "circle");

    // this.generate();
  }

  createShapes(size) {

    const radius = size / 2;

    const p1 = this.rectPath = new Path2D();
    p1.rect(0, 0, size, size);
    
    const p2 = this.trianglePath =  new Path2D();
    p2.moveTo(radius, 0);
    p2.lineTo(size, size);
    p2.lineTo(0, size);
    p2.closePath();

    const p3 = this.polygonPath = new Path2D();
    p3.moveTo(0, radius);
    p3.lineTo(radius, size * 0.3);
    p3.lineTo(size, radius);
    p3.lineTo(radius, size * 0.7);
    p3.closePath();

    const p4 = this.circlePath = new Path2D();
    p4.arc(radius, radius, radius * 0.5, 0, Math.PI * 2);
        
    // const gradient = this.ctx.createRadialGradient(radius, radius, radius * 0.25, radius, radius, radius);    
    // gradient.addColorStop(0, "rgba(255,255,255,1)");
    // gradient.addColorStop(0.2, "rgba(255,255,255,0.25)");
    // gradient.addColorStop(1, "rgba(0,0,0,0)");

    // const gradient = this.gradient = this.ctx.createRadialGradient(radius, radius, radius * 0.25, radius, radius, radius);    
    // gradient.addColorStop(0, "rgba(255,255,255,1)");
    // gradient.addColorStop(0.2, "rgba(255,255,255,0.25)");
    // gradient.addColorStop(1, "rgba(0,0,0,0)");

    

    

    // this.shapes.rect = this.createFrame(p1);
    // this.shapes.triangle = this.createFrame(p2);
    // this.shapes.polygon1 = this.createFrame(p3);
    // this.shapes.circle = this.createFrame(p4, gradient);
  }

  addShape(color, shape) {

    // const key1 = color + "-rect";
    // const key2 = color + "-triangle";

    const key = color + "-" + shape;

    if (this.shapes[key]) {
      // return this.shapes[key].texture;
      return this.shapes[key];
    }

    // const gradient = shape === "circle" ? this.gradient : null;
    const gradient = (shape === "circle");
    const frame = this.shapes[key] = this.createFrame(color, this[shape + "Path"], gradient);

    // console.log("FRAME", frame)

    return frame;
    // return frame.texture;

    // this.shapes[key1] = this.createFrame(color, this.rectPath);
    // this.shapes[key2] = this.createFrame(color, this.trianglePath);
  }

  getGradient(color) {

    const radius = this.particleSize / 2;

    const rgb = PIXI.utils.hex2rgb(color);
    const r = (rgb[0] * 255) | 0;
    const g = (rgb[1] * 255) | 0;
    const b = (rgb[2] * 255) | 0;

    const color1 = `rgba(${r},${g},${b}, 1)`;
    const color2 = utils.logShade(color1, 0.01);


    const gradient = this.ctx.createRadialGradient(radius, radius, radius * 0.5, radius, radius, radius * 0.0);    
    gradient.addColorStop(0, color2);
    gradient.addColorStop(1, color1);

    // gradient.addColorStop(0, `rgba(${r},${g},${b},1)`);
    // gradient.addColorStop(0.25, `rgba(${r},${g},${b},0.2)`);
    // gradient.addColorStop(0.5, `rgba(${r},${g},${b},0.05)`);
    // gradient.addColorStop(1, `rgba(${r},${g},${b},0)`);

    // return gradient;
    return {
      gradient: color1,
      shadowColor: utils.logShade(color1, 0)
    };
  }

  getTexture(color, shape) {
    return this.shapes[`${color}-${shape}`].texture;
  }

  // createFrame(color, path, gradient) {
  createFrame(color, path, useGradient) {

    const dpr = this.fireworks.dpr;

    const size = this.size;
    const rows = Math.floor(this.numShapes / this.cols);
    let x = ((this.numShapes * size) % (this.cols * size));
    let y = rows * size;
    this.rows = rows + 1;

    const fillStyle = PIXI.utils.hex2string(color);

    // console.log("FILL STYLE", fillStyle)

    // const ctx = this.ctx;

    

    

    const frame = {
      x: x, 
      y: y, 
      path, 
      sSize: this.particleSize * dpr,
      dSize: this.particleSize,
      sx: x * dpr,
      sy: y * dpr,
      fillStyle,
      color,
      // tint: color,
      // texture: this.texture,
      // gradient
    };

    frame.rect = new PIXI.Rectangle(frame.sx, frame.sy, frame.sSize, frame.sSize);
    // frame.texture = new PIXI.Texture(this.baseTexture, frame.rect);    

    if (useGradient) {
      // frame.gradient = this.getGradient(fillStyle);
      const { shadowColor, gradient } = this.getGradient(color);
      frame.shadowColor = shadowColor;
      frame.gradient = gradient;
    }

    this.numShapes++;

    return frame;
  }

  generate() {

    const dpr = this.fireworks.dpr;

    const useGlow = this.fireworks.useGlow;
    
    this.canvas.width = this.width * dpr;
    this.height = this.rows * this.size;
    this.canvas.height = utils.nextPow2(this.height * dpr);

    const radius = this.particleSize / 2;
    const ctx = this.ctx;
    
    for (const [key, frame] of Object.entries(this.shapes)) {
      
      ctx.setTransform(
        dpr, 
        0, 
        0, 
        dpr, 
        frame.x * dpr, 
        frame.y * dpr
      );

      if (frame.gradient) {

        ctx.fillStyle = frame.gradient;
        

        if (useGlow) {
          ctx.shadowBlur = radius * 0.5;
          ctx.shadowColor = frame.shadowColor;
        }

        ctx.fill(frame.path);

        ctx.shadowColor = "rgba(0,0,0,0)";

      } else {

        ctx.fillStyle = frame.fillStyle;
        ctx.fill(frame.path);
      }

      // if (frame.gradient) {

      //   const r = frame.rect;

      //   // ctx.globalCompositeOperation = "multiply";
      //   // ctx.fillStyle = frame.fillStyle;
      //   // ctx.fillRect(0, 0, r.width, r.height);
      //   // ctx.globalCompositeOperation = "destination-atop";
      //   // ctx.fillStyle = frame.gradient;
      //   // ctx.fill(frame.path);

      //   ctx.fillStyle = frame.gradient;
      //   ctx.fill(frame.path);

      //   if (useGlow) {
      //     ctx.fillStyle = this.glowGradient;
      //     ctx.fill(frame.path)
      //   }
      //   // ctx.fillStyle = frame.fillStyle;
      //   // ctx.globalCompositeOperation = "source-atop";
      //   // ctx.fillRect(0, 0, r.width, r.height);

      //   // ctx.globalCompositeOperation = "source-over";

      // } else {
      //   ctx.fillStyle = frame.fillStyle;
      //   ctx.fill(frame.path);
      // }

      // this.ctx.fillStyle = frame.gradient ? frame.gradient : "#ffffff";
      // this.ctx.fillStyle = frame.gradient ? frame.gradient : frame.fillStyle;
      // this.ctx.fill(frame.path);     
    }

    this.baseTexture = new PIXI.BaseTexture(this.canvas, {
      resolution: dpr
    });

    for (const [key, frame] of Object.entries(this.shapes)) {
      frame.texture = new PIXI.Texture(this.baseTexture, frame.rect);   
    }

    // this.baseTexture.height = this.canvas.height;
    // this.baseTexture.update();

    // console.log("BASSE TEXXTURE", this.baseTexture)

    // this.rectTexture = new PIXI.Texture(this.baseTexture, this.shapes.rect.rect);
    // this.triangleTexture = new PIXI.Texture(this.baseTexture, this.shapes.triangle.rect);
    // this.polygon1Texture = new PIXI.Texture(this.baseTexture, this.shapes.polygon1.rect);
    // this.circleTexture = new PIXI.Texture(this.baseTexture, this.shapes.circle.rect);
  }
}
