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
  }

  async prepare() {
    await this.image.init();
    this.createParticles();
  }

  play() {
    this.image.play();
  }

  explode() {

    const particles = this.particles;

    for (let i = 0; i < particles.length; i++) {
      particles[i].play();
    }

    this.exploded = true;
  }

  init() {

    const { particles, x, y, rotation, rotationSign } = this;

    for (let i = 0; i < particles.length; i++) {
      particles[i].init(x, y, rotation, rotationSign);
    }
  }

  createParticles() {

    const fireworks = this.fireworks;
    const { width, height } = this.image;
    const { numParticles, particleSize } = this.fireworks;

    const count = this.addParticles(false);

    let len = this.particles.length;

    if (!len) {
      return;
    }

    // const particlesNeeded = Math.ceil((width * height) / (particleSize * particleSize));
    let particlesNeeded = Math.max(count, numParticles);

    // particlesNeeded = 100;

    // console.log("PARTICLES NEEDED", particlesNeeded, count)

    // while (len < numParticles) {
    while (len < particlesNeeded) {
      this.addParticles(true);
      len = this.particles.length;
    }

    this.particles = gsap.utils.shuffle(this.particles.slice(0, particlesNeeded));
    // this.particles = gsap.utils.shuffle(this.particles).slice(0, numParticles);
    // this.particles = gsap.utils.shuffle(this.particles);
  }

  addParticles(centered) {

    const { fireworks, image } = this;
    const { width, height } = image;
    const { particleSize, shapeTextures, randomShape } = fireworks;
    const cx = width / 2;
    const cy = height / 2;
    const size = particleSize;
    const offset = size / 2;

    let count = 0;

    // console.log("IMAGE SIZE", width, height)

    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
      
        const color = image.getColor(x, y);

        if (color.a < 0.9) {
          continue;
        }

        const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;      
        shapeTextures.addColor(rgb); 
        const shape = randomShape();

        const particle = new FireworkParticle(fireworks, {
          centered,
          color: rgb,
          alpha: color.a,
          dx: (x + offset) - cx,
          dy: (y + offset) - cy,
          frame: shapeTextures.getFrame(rgb, shape)
        });

        this.particles.push(particle);        

        count++;
      }
    }

    return count;
  }

  update() {

    const { exploded, image, particles, x, y } = this;

    const ctx = this.fireworks.ctx;

    let alive = 0;

    // TODO: Temp
    // image.x = this.x;
    // image.y = this.y;
    // image.rotation = this.rotation;
    // image.render();

    if (!exploded) {

      image.x = this.x;
      image.y = this.y;
      image.rotation = this.rotation;
      image.render();
      alive++;

    } else {

      // ctx.imageSmoothingEnabled = false;

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        if (particle.alive) {
          particle.render();
          alive++;
        }
      }
    }

    // ctx.imageSmoothingEnabled = true;

    this.aliveCount = alive;

    if (!alive) {
      image.pause();
    }
  }
}
