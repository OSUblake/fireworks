class FireworkParticle extends DisplayObject {

  constructor(fireworks, settings) {

    super(fireworks);

    Object.assign(this, settings);

    this.alive = false;
    this.size = fireworks.particleSize;
    this.originX = this.size / 2;
    this.originY = this.size / 2;

    this.createTimeline();
  }

  createTimeline() {

    const {
      duration,
      friction,
      gravity,
      scale,
      skew,
      spread,
      startAlpha,
      rotation,
      velocity
    } = this.fireworks.particleVars;

    this.rotation = Math.random() * Math.PI;    
    this.alpha = startAlpha();
    this.scaleX = this.scaleY = scale();

    this.timeline = gsap.timeline({
        paused: true
      })
      .to(this, {
        duration,
        alpha: 0,
        onComplete: () => this.kill()
      }, 0)
      .to(this, {
        duration,
        rotation: "+=" + rotation() * (Math.random() < 0.5 ? 1 : -1)
      }, 0)
      .to(this, {
        duration,
        scaleX: 0
      }, 0)  
      .to(this, {
        duration,
        scaleY: 0
      }, 0)  
      .to(this, {
        duration,
        skewX: skew
      }, 0)  
      .to(this, {
        duration,
        skewY: skew
      }, 0);

    return this;
  }

  init(cx, cy, currentRotation, rotationSign) {

    const { dx, dy, fireworks } = this;

    const {
      duration,
      friction,
      gravity,
      scale,
      skew,
      spread,
      startAlpha,
      rotation,
      velocity
    } = fireworks.particleVars;

    const DEG = fireworks.DEG;

    let angle = 0;
    let minAngle = 0;
    let maxAngle = 360;

    if (!this.centered) {

      const cos = Math.cos(currentRotation);
      const sin = Math.sin(currentRotation);

      this.x = ((cos * dx) - (sin * dy)) + cx;
      this.y = ((cos * dy) + (sin * dx)) + cy;

      angle = Math.atan2(this.y - cy, this.x - cx) * DEG;
      minAngle = angle - spread;
      maxAngle = angle + spread;

      // this.x = cx;
      // this.y = cy;

    } else {

      this.x = cx;
      this.y = cy;
    }

    this.alive = true;

    let frictionValue = friction();
    
    if (Math.random() < 0.3) {
      frictionValue = Math.min(frictionValue * 2, 0.8);
    } 

    this.timeline.to(this, {
      duration,
      physics2D: {
        angle: gsap.utils.random(minAngle, maxAngle),
        friction: frictionValue,
        // friction: Math.random() > 0.3 ? friction() : friction() * 2,
        velocity,
        gravity
      }
    }, 0).play()
  }

  kill() {
    this.timeline.kill();
    this.alive = false;

    return this;
  }

  render() {

    const { fireworks, size } = this;
    const ctx = fireworks.ctx;

    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;

    this.setTransform();
    ctx.fillRect(0, 0, size, size);

    return this;
  }
}
