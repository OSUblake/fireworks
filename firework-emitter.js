class FireworkEmitter {

  constructor(fireworks, emote) {

    this.emote = emote;
    this.fireworks = fireworks;
    this.image = new FireworkImage(fireworks, emote.image);
    this.exploded = false;    
    this.launched = false;
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.rotationSign = 1;
    this.particles = [];
    this.aliveCount = 1;

    this.timeline = gsap.timeline({
      paused: true
    });
  }

  async prepare() {
    await this.image.init();
    this.createParticles();
  }

  play() {
    this.image.play();
  }

  launch() {

    

    this.emote.launchSound.play();
    this.launched = true;
  }

  explode() {

    const particles = this.particles;

    for (let i = 0; i < particles.length; i++) {
      // particles[i].play();
      // particles[i].alive = true;
    }

    this.timeline.play();

    this.emote.popSound.play();

    this.exploded = true;
  }

  init() {

    const { particles, x, y, rotation, rotationSign } = this;

    for (let i = 0; i < particles.length; i++) {
      particles[i].init(x, y, rotation, this.timeline);
    }
  }

  createParticles() {

    const fireworks = this.fireworks;
    const { width, height } = this.image;
    const { numParticles, particleSize } = this.fireworks;

    this.addParticles(false);

    let len = this.particles.length;

    if (!len) {
      return;
    }

    this.addParticles(true);

    while (len < numParticles) {
      this.addParticles(true);
      len = this.particles.length;
    }
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

    let alive = 0;

    if (!this.launched && y < 0) {
      this.launch();
    }

    if (!exploded) {

      image.x = x;
      image.y = y;
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

    if (!alive) {
      image.pause();
    }
  }
}
