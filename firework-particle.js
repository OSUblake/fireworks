class FireworkParticle extends DisplayObject {

  constructor(fireworks, settings) {

    super(fireworks);

    Object.assign(this, settings);

    this.alive = false;
    this.size = fireworks.particleSize;
    this.originX = this.size / 2;
    this.originY = this.size / 2;
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

    this.rotation = Math.random() * Math.PI;    
    this.alpha = startAlpha();
    this.scaleX = this.scaleY = scale();

    let angle = 0;
    let minAngle = 0;
    let maxAngle = 360;
    let frictionValue = friction();

    frictionValue = randomChoice(Math.min(frictionValue * 2, 0.8), frictionValue, 0.3);

    // if (!this.centered) {

    //   const cos = Math.cos(currentRotation);
    //   const sin = Math.sin(currentRotation);

    //   this.x = ((cos * dx) - (sin * dy)) + cx;
    //   this.y = ((cos * dy) + (sin * dx)) + cy;

    //   angle = Math.atan2(this.y - cy, this.x - cx) * DEG;
    //   minAngle = angle - spread;
    //   maxAngle = angle + spread;

    // } else {

    //   this.x = cx;
    //   this.y = cy;

    //   // frictionValue = randomChoice(Math.min(frictionValue * 2, 0.8), frictionValue, 0.3);
    // }

    const cos = Math.cos(currentRotation);
    const sin = Math.sin(currentRotation);

    this.x = ((cos * dx) - (sin * dy)) + cx;
    this.y = ((cos * dy) + (sin * dx)) + cy;

    angle = Math.atan2(this.y - cy, this.x - cx) * DEG;
    minAngle = angle - spread;
    maxAngle = angle + spread;

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
        rotation: "+=" + rotation() * randomChoice(1, -1)
      }, 0)
      .to(this, {
        duration,
        scaleX: 0
      }, 0)  
      .to(this, {
        duration,
        scaleY: 0
      }, 0)  
      // .to(this, {
      //   duration,
      //   skewX: skew
      // }, 0)  
      // .to(this, {
      //   duration,
      //   skewY: skew
      // }, 0)
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
    this.alive = true;
    this.timeline.play();
  }

  kill() {
    this.timeline.kill();
    this.alive = false;
  }

  render() {

    const { fireworks, frame, size } = this;
    const ctx = fireworks.ctx;

    ctx.globalAlpha = this.alpha;
    // ctx.fillStyle = this.color;

    this.setTransform();
    // ctx.fillRect(0, 0, size, size);

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
