// class FireworkParticle extends DisplayObject {
class FireworkParticle extends PIXI.Sprite {

  constructor(fireworks, settings) {

    // const texture = new PIXI.Texture(fireworks.shapesBaseTexture, settings.frame);

    // super(fireworks);
    super(PIXI.Texture.EMPTY);
    // super(texture);
    this.fireworks = fireworks;

    Object.assign(this, {
      alive: false,
      // alpha: 1,
      alpha: 0,
      centered: false,
      dx: 0,
      dy: 0
    }, settings);

    this.size = fireworks.particleSize;
    this.originX = this.size / 2;
    this.originY = this.size / 2;

    this.anchor.set(0.5);

    // this.visible = false;
  }

  init(cx, cy, currentRotation, timeline) {

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
    this.startAlpha = startAlpha();
    this.scale.x = this.scale.y = scale();
    this.skew.x = skew();
    this.skew.y = skew();

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

    this.alpha = 0;

    // this.renderable = false;

    // this.timeline = gsap.timeline({
    //     paused: true
    //   })
    timeline
      .add(() => this.alive = true, 0)
      // .add(() => this.play(), 0)
      .set(this, { 
        alpha: this.startAlpha,
        immediateRender: false, 
      }, 0)
      .to(this, {
        duration,
        // alpha: 0,
        // onStart: () => this.alive = true,
        // onComplete: () => this.kill()
        // onComplete: () => this.alive = false
        onComplete: () => this.kill()
      }, 0.2)
      // .from(this, {
      //   duration,
      //   alpha: this.startAlpha,
      //   immediateRender: false,
      //   // onStart: () => this.alive = true,
      //   // onComplete: () => this.kill()
      //   // onComplete: () => this.alive = false
      //   onComplete: () => this.kill()
      // }, 0.2)
      .to(this.scale, {
        duration,
        x: 0,
        y: 0
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

      this.texture = new PIXI.Texture(this.fireworks.shapesBaseTexture, this.frame);
  }

  play() {
    // if (!this.timeline) {
    //   console.log("*** No particle timeline");
    //   return;
    // }

    this.alive = true;
    // this.alpha = this.startAlpha;
    // this.timeline.play();
  }

  kill() {
    // this.timeline.kill();
    this.alpha = 0;
    this.alive = false;
    this.parent.removeChild(this);
    
  }

  ___render() {

    if (!this.alpha || !this.scaleX || !this.scaleY) {
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
