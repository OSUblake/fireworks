class Fireworks {

  constructor(settings) {

    Object.assign(this, settings);

    this.targetFPMS = 60 / 1000

    this.render = this.render.bind(this);
    
    this.dpr = window.devicePixelRatio;
    // this.dpr = 3;

    this.ctx = this.canvas.getContext("2d");
    this.onResize();

    // this.width = this.canvas.clientWidth;
    // this.height = this.canvas.clientHeight;

    // this.images = gsap.utils.shuffle(settings.images.filter(img => img.naturalWidth))
    //   .slice(0, settings.maxFireworks);

    // this.emitters = this.images.map(img => new FireworkEmitter(this, img));

    this.emitters = gsap.utils.shuffle(settings.images.filter(img => img.naturalWidth))
      .slice(0, settings.maxFireworks)
      .map(img => new FireworkEmitter(this, img));

    window.addEventListener("resize", e => this.onResize());

    // TODO: TEMP
    let numParticles = this.emitters.reduce((res, emitter) => {
      const count = emitter.particles.length;
      console.log("NUM PARTICLES", count);
      return res + count;
    }, 0);

    console.log("TOTAL PARTICLES", numParticles);

    console.log("TRANSFORM", this.ctx.getTransform())
  }

  onResize() {

    const dpr = this.dpr;

    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  start() {
    gsap.ticker.add(this.render);
  }

  stop() {
    gsap.ticker.remove(this.render);
  }

  render(time, deltaTime) {

    const delta = deltaTime * this.targetFPMS;
    const { ctx, emitters, width, height, dpr } = this;

    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < emitters.length; i++) {
      emitters[i].render(ctx, delta);
    }
  }
}

