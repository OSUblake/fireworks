class FireworkParticle {

  constructor(app, settings) {
    Object.assign(this, settings);

    this.alive = false;

    this.app = app;
    this.size = app.particleSize;
    this.originX = this.size / 2;
    this.originY = this.size / 2;
    this.scale = 1;
    this.scaleX = 1;
    this.scaleY = 1;
    this.skewX = 0;
    this.skewY = 0;
    this.rotation = 0;
    this.x = 0;
    this.y = 0;
  }

  init(cx, cy, rotation) {

    const { dx, dy } = this;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    this.x = ((cos * dx) - (sin * dy)) + cx;
    this.y = ((cos * dy) + (sin * dx)) + cy;

    this.rotation = rotation;

    const angle = Math.atan2(this.y - cy, this.x - cx) * 180 / Math.PI;

    this.alive = true;
    
    gsap.to(this, {
      duration: "random(1, 2)",
      alpha: 0,
      onComplete: () => this.alive = false
    });

    gsap.to(this, {
      duration: "random(1, 2)",
      rotation: "random(-6, 6)"
    });

    gsap.to(this, {
      duration: "random(1, 2)",
      scaleX: 0
    });

    gsap.to(this, {
      duration: "random(1, 2)",
      scaleY: 0
    });

    gsap.to(this, {
      duration: "random(-2, 2)",
      skewX: 0
    });

    gsap.to(this, {
      duration: "random(-2, 2)",
      skewY: 0
    });

    gsap.to(this, {
      duration: "random(1, 2)",
      physics2D: {
        angle,
        velocity: "random(300, 600)",
        friction: "random(0.2, 0.5)",
        gravity: 400
      }
    });
  }

  render(ctx) {

    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;

    const { app, originX, originY, rotation, scale, scaleX, scaleY, skewX, skewY, size, x, y } = this;
    const dpr = app.dpr;

    // const cos = Math.cos(rotation) * scale;
    // const sin = Math.sin(rotation) * scale;

    // const a =  cos;
    // const b =  sin;
    // const c = -sin;
    // const d =  cos; 

    const a =  Math.cos(rotation + skewY) * scaleX;
    const b =  Math.sin(rotation + skewY) * scaleX;
    const c = -Math.sin(rotation - skewX) * scaleY;
    const d =  Math.cos(rotation - skewX) * scaleY;         
    const e = (x + originX) - ((originX * a) + (originY * c));
    const f = (y + originY) - ((originX * b) + (originY * d));

    ctx.transform(a, b, c, d, e, f);
    ctx.fillRect(0, 0, size, size);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}
