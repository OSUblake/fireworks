class FireworkParticle extends DisplayObject {

  constructor(fireworks, settings) {

    super(fireworks);

    Object.assign(this, {
      alive: false,
      alpha: 1,
      centered: false,
      dx: 0,
      dy: 0
    }, settings);

    this.size = fireworks.particleSize;
    this.originX = this.size / 2;
    this.originY = this.size / 2;
  }

  init(cx, cy, currentRotation) {

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

    // this.rotation = currentRotation;
    this.rotation = Math.random() * Math.PI;    
    this.alpha = startAlpha();
    this.scaleX = this.scaleY = scale();
    this.skewX = skew();
    this.skewY = skew();

    let angle = 0;
    let minAngle = 0;
    let maxAngle = 360;
    let frictionValue = friction();

    frictionValue = randomChoice(Math.min(frictionValue * 2, 0.8), frictionValue, 0.3);

    const cos = Math.cos(currentRotation);
    const sin = Math.sin(currentRotation);

    this.x = ((cos * dx) - (sin * dy)) + cx;
    this.y = ((cos * dy) + (sin * dx)) + cy;

    angle = Math.atan2(this.y - cy, this.x - cx) * DEG;
    minAngle = angle - spread;
    maxAngle = angle + spread;

    if (fireworks.clusterParticles && this.centered) {

      this.x = cx;
      this.y = cy;

      angle = 0;
      minAngle = 0;
      maxAngle = 360;
    }

    this.timeline = gsap.timeline({
        paused: true
      })
      .to(this, {
        duration,
        alpha: 0,
        onComplete: () => this.kill()
      }, 0.2)
      .to(this, {
        duration,
        scaleX: 0,
        scaleY: 0
      }, 0)   
      .to(this, {
        duration,
        physics2D: {
          angle: gsap.utils.random(minAngle, maxAngle),
          friction: frictionValue,
          velocity,
          gravity
        }
      }, 0);
  }

  play() {
    if (!this.timeline) {
      console.log("*** No particle timeline");
      return;
    }

    this.alive = true;
    this.timeline.play();
  }

  kill() {
    this.timeline.kill();
    this.alive = false;
  }

  render() {

    if (!this.alpha || (!this.scaleX && !this.scaleY)) {
      return;
    }

    const { fireworks, frame } = this;
    const ctx = fireworks.ctx;

    this.setTransform();
    
    ctx.globalAlpha = this.alpha;
    ctx.drawImage(
      frame.texture,
      frame.sx,
      frame.sy,
      frame.sSize,
      frame.sSize,
      0,
      0,
      frame.dSize,
      frame.dSize
    );
  }
}
