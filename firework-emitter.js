class FireworkEmitter {

  constructor(fireworks, image) {

    this.fireworks = fireworks;
    this.image = new FireworkImage(fireworks, image);

    this.exploded = false;
    
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.rotationSign = 1;
    this.particles = [];
    this.aliveCount = 1;

    this.createParticles(); 
  }

  explode() {

    const { image, particles, x, y, rotation, rotationSign } = this;

    this.exploded = true;

    for (let i = 0; i < particles.length; i++) {
      particles[i].init(x, y, rotation, rotationSign);
    }

    return this;
  }

  createParticles() {

    const { fireworks, image } = this;
    const { width, height } = image;
    const { numParticles, particleSize } = fireworks;
    const cx = width / 2;
    const cy = height / 2;

    let loops = 0;

    do {

      for (let y = 0; y < height; y += particleSize) {
        for (let x = 0; x < width; x += particleSize) {
        
          const color = image.getColor(x, y);
          
          if (color.a < 0.9) {
            continue;
          }
  
          const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;
  
          const particle = new FireworkParticle(fireworks, {
            color: rgb,
            alpha: color.a,
            dx: x - cx,
            dy: y - cy,
            centered: !!loops
          });
  
          this.particles.push(particle);        
        }
      }

      loops++;
      
    } while (this.particles.length < numParticles);

    this.particles = gsap.utils.shuffle(this.particles).slice(0, numParticles);
    // this.particles = this.particles.slice(0, numParticles);

    return this;
  }

  update() {

    const { exploded, image, particles, x, y } = this;

    if (!exploded) {

      image.x = this.x;
      image.y = this.y;
      image.rotation = this.rotation;
      image.render();

    } else {

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];
        particle.alive && particle.render();
      }
    }

    return this;
  }
}
