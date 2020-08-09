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

    this.timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        this.alive = false;
        this.alpha = 0;
      }
    });
  }

  initOrb(emitterX, emitterY, emitterRotation) {

    const { dx, dy, fireworks } = this;

    this.width = this.height = fireworks.particleSize;

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

    const proxy = {
      x: this.x,
      y: this.y,
      drop: 0
    };

    this.timeline
      .to(proxy, {
        duration: duration + gsap.utils.random(-0.3, 0.3),
        x: endX + gsap.utils.random(-10, 10),
        y: endY + gsap.utils.random(-10, 10),
        ease: "power4"
      }, 0)
      .to(proxy, {
        duration: duration,
        drop: "random(10, 15)"
      }, 0)

    this.timeline.eventCallback("onUpdate", () => {

      this.x = proxy.x;
      this.y = proxy.y + proxy.drop;
    })
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

  kill() {
    this.timeline.kill();
    this.alpha = 0;
    this.alive = false;
    // this.parent.removeChild(this);
    
  }

  

  update() {

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
