class FireworkEmitter {

  constructor(app, image) {

    this.app = app;
    // this.image = new FireworkImage(app.maxSize, image);
    this.image = new FireworkImage(app, image);

    this.exploded = false;
    
    // TEMP
    this.x = gsap.utils.random(100, app.width - 100, 1);
    this.y = gsap.utils.random(100, app.height - 100, 1);

    this.particles = [];

    this.createParticles();    
    this.init();
  }

  init() {

    const sign = Math.random() < 0.5 ? 1 : -1;

    gsap.to(this.image, {
      rotation: "+=" + Math.PI * 2 * sign,
      duration: gsap.utils.random(3, 5),
      // ease: "sine.inOut",
      ease: "none",
      // repeat: -1,

      onComplete: () => this.explode()
    });
    
  }

  explode() {

    const { image, particles, x, y } = this;

    this.exploded = true;

    for (let i = 0; i < particles.length; i++) {
      particles[i].init(x + image.originX, y + image.originY, image.rotation);
      // particles[i].render(ctx, delta);
    }
  }

  createParticles() {

    

    // const image = this.image;
    const { app, image } = this;
    const { width, height } = image;
    const cx = width / 2;
    const cy = height / 2;

    const size = app.particleSize;
    const offset = size / 2;

    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
      
        const color = image.getColor(x, y);
        // const color = image.getColor(x + offset, y + offset);
        
        if (color.a < 0.9) {
          continue;
        }

        const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;

        const particle = new FireworkParticle(app, {
          color: rgb,
          alpha: color.a,
          dx: x - cx,
          dy: y - cy
        });

        this.particles.push(particle);        
      }
    }

    // this.particles = gsap.utils.shuffle(this.particles).slice(0, this.fireworks.maxParticles);

    // console.log("PARTICLES", this.particles)
  }

  

  render(ctx, delta) {

    const { exploded, image, particles, x, y } = this;

    ctx.globalAlpha = 1;

    if (!exploded) {

      image.render(ctx, x, y);
      return this;
    }

    for (let i = 0; i < particles.length; i++) {
      const particle = particles[i];
      particle.alive && particle.render(ctx, delta);
    }


    // ctx.globalAlpha = 0.4;
    // image.render(ctx, x, y);
    // ctx.globalAlpha = 1;
    
    // for (let i = 0; i < particles.length; i++) {
    //   particles[i].init(x + image.originX, y + image.originY, image.rotation);
    //   particles[i].render(ctx, delta);
    // }

    // ctx.fillStyle = "red";
    // ctx.beginPath();
    // ctx.arc(x + image.originX, y + image.originY, 5, 0, Math.PI * 2);
    // ctx.fill();
  }
}
