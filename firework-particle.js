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
    this.alive = true;

    const angle = Math.atan2(this.y - cy, this.x - cx) * 180 / Math.PI;

    const duration = gsap.utils.random(1, 2, true);

    gsap.to(this, {
      duration,
      alpha: 0,
      onComplete: () => this.alive = false
    });

    gsap.to(this, {
      duration,
      rotation: gsap.utils.random(-6, 6)
    });

    gsap.to(this, {
      duration,
      scaleX: 0
    });

    gsap.to(this, {
      duration,
      scaleY: 0
    });

    gsap.to(this, {
      duration,
      skewX: gsap.utils.random(-1, 1)
    });

    gsap.to(this, {
      duration,
      skewY: gsap.utils.random(-1, 1)
    });

    gsap.to(this, {
      duration,
      physics2D: {
        angle,
        velocity: gsap.utils.random(300, 600),
        friction: gsap.utils.random(0.2, 0.5),
        gravity: 400
      }
    });
  }

  render(ctx) {

    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;

    const { app, originX, originY, rotation, scaleX, scaleY, skewX, skewY, size, x, y } = this;
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
