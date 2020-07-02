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

    const { fireworks, particles } = this;

    for (let i = 0; i < particles.length; i++) {
      particles[i].play();
    }

    this.exploded = true;
    fireworks.popSound.play();
  }

  init() {

    const { particles, x, y, rotation, rotationSign } = this;

    for (let i = 0; i < particles.length; i++) {
      particles[i].init(x, y, rotation, rotationSign);
    }
  }

  createParticles() {

    const { fireworks, image } = this;
    const { width, height } = image;
    const { numParticles, particleSize, shapeTextures } = fireworks;
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

          shapeTextures.addColor(rgb);
  
          const particle = new FireworkParticle(fireworks, {
            color: rgb,
            alpha: color.a,
            dx: x - cx,
            dy: y - cy,
            centered: !!loops,
            frame: shapeTextures.getFrame(rgb)
          });
  
          this.particles.push(particle);        
        }
      }

      loops++;
      
    } while (this.particles.length < numParticles);

    this.particles = gsap.utils.shuffle(this.particles.slice(0, numParticles));
  }

  update() {

    const { exploded, image, particles, x, y } = this;

    let alive = 0;

    if (!exploded) {

      image.x = this.x;
      image.y = this.y;
      image.rotation = this.rotation;
      image.render();
      alive++;

    } else {

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        if (particle.alive) {
          particle.render();
          alive++;
        }
      }
    }

    this.aliveCount = alive;
  }
}
