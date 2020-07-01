class Fireworks {

  constructor(settings) {

    Object.assign(this, settings);

    this.targetFPMS = 60 / 1000;
    this.RAD = Math.PI / 180;
    this.DEG = 180 / Math.PI;

    this.render = this.render.bind(this);    
    this.dpr = window.devicePixelRatio;

    this.ctx = this.canvas.getContext("2d");

    this.createVars()
      .createShapes()
      .onResize()
      .init();

    window.addEventListener("resize", e => this.onResize());

    // TODO: TEMP
    // let numParticles = this.emitters.reduce((res, emitter) => {
    //   const count = emitter.particles.length;
    //   console.log("NUM PARTICLES", count);
    //   return res + count;
    // }, 0);

    // console.log("TOTAL PARTICLES", numParticles);
  }

  init() {

    const minRotation = 80;
    const maxRotation = 120;
    const spread = 100;
    const size = this.maxImageSize;
    const cx = this.width / 2;
    const cy = this.height / 2;
    const xPos = gsap.utils.random(size, this.width - size, true);
    const yPos = gsap.utils.random(cy - spread, cy + spread, true);
    const offset = size * 2;

    const randomRotation = gsap.utils.random(minRotation * this.RAD, maxRotation * this.RAD, true);
    const randomDuration = gsap.utils.random(1, 1.5, true);
    const randomDelay = gsap.utils.random(0.2, 0.5, true);
    const randomMultiplier = gsap.utils.random(1.3, 1.5, true);

    this.emitters = gsap.utils.shuffle(this.images.filter(img => img.naturalWidth))
      .slice(0, this.numFireworks)
      .map(img => new FireworkEmitter(this, img));

    this.emitters.forEach(emitter => {

      const sign = Math.random() < 0.5 ? 1 : -1;
      const duration = randomDuration();
      // const explodeTime = duration * randomMultiplier();
      const explodeTime = duration * 1.5;

      emitter.rotation = gsap.utils.random(0, Math.PI * 2);
      emitter.rotationSign = sign;
      emitter.x = xPos();
      emitter.y = 0;

      const tl = gsap.timeline({
          delay: randomDelay()          
        })
        .to(emitter, {
          duration: duration * 2,
          ease: "none",
          rotation: "+=" + randomRotation() * sign
        }, 0)
        .to(emitter, {
          duration,
          ease: "sine.out",
          y: -(yPos() + offset)
        }, 0)
        .to(emitter, {
          duration,
          ease: "sine.in",
          y: 0,
          onComplete: () => emitter.explode()
        }, ">");

      gsap.delayedCall(explodeTime, () => {
        tl.kill();
        emitter.explode();
      });        
    });

    return this;
  }

  createShapes() {
    return this;
  }

  createVars() {

    const RAD = this.RAD;

    this.particleVars = {
      startAlpha: gsap.utils.random(0.5, 1, true),
      scale: gsap.utils.random(0.5, 1, true),
      duration: gsap.utils.random(1, 2, true),
      friction: gsap.utils.random(0.1, 0.3, true),
      gravity: 400,
      rotation: gsap.utils.random(45 * RAD, 90 * RAD, true),
      spread: 60,
      skew: gsap.utils.random(-45 * RAD, 45 * RAD, true),
      velocity: gsap.utils.random(500, 700, true),
    };

    return this;
  }

  onResize() {

    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;
    
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    
    this.offsetY = this.height + this.maxImageSize * 2;
    this.resetTransform();

    return this;
  }

  resetTransform() {
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    return this;
  }

  setTransform(a, b, c, d, e, f) {
    this.ctx.transform(a, b, c, d, e, f);
    return this;
  }

  start() {
    gsap.ticker.add(this.render);
    return this;
  }

  stop() {
    gsap.ticker.remove(this.render);
    return this;
  }

  render() {

    const { ctx, emitters, width, height, dpr } = this;

    this.resetTransform();
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    for (let i = 0; i < emitters.length; i++) {
      emitters[i].update();
    }
  }
}

