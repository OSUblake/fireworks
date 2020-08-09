class FireworkParticle extends PIXI.Sprite {

  constructor(texture, fireworks, settings) {

    super(texture);

    this.fireworks = fireworks;

    Object.assign(this, {

      // visible: false,

      alive: false,
      // alpha: 1,
      // alpha: 0,
      centered: false,
      dx: 0,
      dy: 0
    }, settings);

    // this.size = fireworks.particleSize;

    this.anchor.set(0.5);

    // this.blendMode = PIXI.BLEND_MODES.ADD;
    // this.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    // this.blendMode = PIXI.BLEND_MODES.SCREEN;

    this.timeline = gsap.timeline({
      paused: true,
      onComplete: this.kill,
      onUpdate: this.update,
      callbackScope: this
      // onComplete: () => {
      //   this.alive = false;
      //   this.alpha = 0;
      // }
    });
  }

  kill() {
    this.timeline.kill();
    this.alpha = 0;
    this.alive = false;    

    if (this.glow) {
      this.glow.alpha = 0;
    }
  }

  update() {

    if (this.proxy) {
      this.position.set(
        this.proxy.x,
        this.proxy.y + this.proxy.drop
      );
    }

    if (this.glow) {
      this.glow.position.set(this.x, this.y);
    }
  }

  initOrb(emitterX, emitterY, emitterRotation, container) {

    const { dx, dy, fireworks } = this;

    this.alpha = 1;

    this.glow = new PIXI.Sprite(this.texture);
    // sprite2.blendMode = PIXI.BLEND_MODES.ADD;
    // sprite2.tint = 0xff0000;
    // this.addChild(sprite2);
    this.glow.alpha = 0.75;
    this.glow.anchor.set(0.5);
    container.addChild(this.glow, this);
    // container.addChild(this, sprite2);

    this.width = this.height = fireworks.particleSize;
    this.glow.width = this.glow.height = fireworks.particleSize * 0.5;

    // sprite2.width = sprite2.height = 4;

    const cos = Math.cos(emitterRotation);
    const sin = Math.sin(emitterRotation);

    const endX = ((cos * dx) - (sin * dy)) + emitterX;
    const endY = ((cos * dy) + (sin * dx)) + emitterY;

    const angle = Math.atan2(endY - emitterY, endX - emitterX) * utils.DEG;

    this.x = emitterX;
    this.y = emitterY;

    const duration = 2;
    const speed = 100;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // const velocitySpread = gsap.utils.random(-1.01, 1.01);
    const velocitySpread = gsap.utils.random(-10, 10);

    const velocity = dist + velocitySpread;

    // console.log("\nVELOCIT", velocity)
    // console.log("DIST", dist)

    // this.timeline
    //   .to(this, {
    //     duration,
    //     physics2D: {
    //       angle,
    //       velocity,
    //       gravity: 100
    //     }
    //   }, 0)

    this.proxy = {
      x: this.x,
      y: this.y,
      drop: 0
    };

    const dur = duration + gsap.utils.random(-0.3, 0.3);

    this.timeline
      .to(this.proxy, {
        duration: dur,
        x: endX + gsap.utils.random(-5, 5),
        y: endY + gsap.utils.random(-5, 5),
        ease: "power4"
      }, 0)
      .to(this.proxy, {
        duration: dur * 2,
        drop: "random(50, 60)"
      }, 0);
  }

  initPolygon(emitterX, emitterY, emitterRotation) {

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
    } = fireworks.polygonVars;

    this.width = this.height = fireworks.particleSize;
    
    if (fireworks.debug.particles) {
      this.rotation = emitterRotation;
    } else {
      this.rotation = Math.random() * Math.PI;    
      this.startAlpha = startAlpha();
      this.width = this.height = this.width * scale();
    }

    // this.rotation = Math.random() * Math.PI;    
    // this.startAlpha = startAlpha();
    // this.scale.x = this.scale.y = scale();


    // this.skew.x = skew();
    // this.skew.y = skew();

    let angle = 0;
    let minAngle = 0;
    let maxAngle = 360;
    let frictionValue = friction();

    frictionValue = utils.randomChoice(Math.min(frictionValue * 2, 0.8), frictionValue, 0.3);

    const cos = Math.cos(emitterRotation);
    const sin = Math.sin(emitterRotation);

    this.x = ((cos * dx) - (sin * dy)) + emitterX;
    this.y = ((cos * dy) + (sin * dx)) + emitterY;

    angle = Math.atan2(this.y - emitterY, this.x - emitterX) * utils.DEG;
    minAngle = angle - spread;
    maxAngle = angle + spread;

    if (fireworks.clusterParticles && this.centered) {

      this.x = emitterX;
      this.y = emitterY;

      angle = 0;
      minAngle = 0;
      maxAngle = 360;
    }

    // this.alpha = 0;

    this.timeline
      // .add(() => this.alive = true, 0)
      // .set(this, { 
      //   alpha: this.startAlpha,
      //   immediateRender: false, 
      // }, 0)
      .to(this, {
        duration,
        alpha: 0,
        rotation: "+=" + rotation()
        // rotation: Math.random() * Math.PI,
        // onComplete: () => this.kill()
      }, 0.2)


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

      // TODO: Waiting on Jack to fix this
      // this.timeline.progress(1, true).progress(0, true);
  }

  play() {
    // if (!this.timeline) {
    //   console.log("*** No particle timeline");
    //   return;
    // }

    this.alive = true;
    // this.alpha = this.startAlpha;
    this.timeline.play();
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
