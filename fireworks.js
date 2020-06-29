class Fireworks {

  constructor(settings) {

    Object.assign(this, settings);

    this.targetFPMS = 60 / 1000

    this.render = this.render.bind(this);
    this.resolution = window.devicePixelRatio;
    this.ctx = this.canvas.getContext("2d");
    this.onResize();
    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    this.images = gsap.utils.shuffle(settings.images.filter(img => img.naturalWidth))
      .slice(0, settings.maxImages);

    this.emitters = this.images.map(img => new FireworkEmitter(this, img));

    window.addEventListener("resize", e => this.onResize());

    // TODO: TEMP
    let numParticles = this.emitters.reduce((res, emitter) => {
      return res + emitter.particles.length;
    }, 0);

    console.log("NUM PARTICLES", numParticles)
  }

  onResize() {

    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  start() {
    gsap.ticker.add(this.render);
  }

  stop() {
    gsap.ticker.remove(this.render);
  }

  render(time, deltaTime) {

    const delta = deltaTime * this.targetFPMS;
    const { ctx, emitters, width, height } = this;

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < emitters.length; i++) {
      emitters[i].render(ctx, delta);
    }
  }
}

