class FireworkEmitter {

  constructor(fireworks, image) {

    this.fireworks = fireworks;
    this.image = new FireworkImage(fireworks.maxSize, image);;
    
    // TEMP
    this.x = gsap.utils.random(100, this.fireworks.width - 100, 1);
    this.y = gsap.utils.random(100, this.fireworks.height - 100, 1);

    this.particles = [];
    
    this.createParticles();
  }

  createParticles() {

    const offset = 8;
    const image = this.image;
    const { width, height } = image;
    const cx = width / 2;
    const cy = height / 2;

    for (let y = 0; y < height; y += offset) {
      for (let x = 0; x < width; x += offset) {
      
        const color = image.getColor(x, y);
        
        if (color.a < 0.7) {
          continue;
        }

        const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;

        const particle = new FireworkParticle({
          color: rgb,
          alpha: color.a,
          dx: x - cx,
          dy: y - cy
        });

        this.particles.push(particle);
      }
    }

    // console.log("PARTICLES", this.particles)
  }

  explode() {

    const { image, particles, x, y } = this;
  }

  render(ctx, delta) {

    const { image, particles, x, y } = this;

    ctx.globalAlpha = 0.4;
    image.render(ctx, x, y);
    ctx.globalAlpha = 1;
    
    for (let i = 0; i < particles.length; i++) {
      particles[i].init(x + image.originX, y + image.originY, image.rotation);
      particles[i].render(ctx, delta);
    }

    // ctx.fillStyle = "red";
    // ctx.beginPath();
    // ctx.arc(x + image.originX, y + image.originY, 5, 0, Math.PI * 2);
    // ctx.fill();
  }
}
