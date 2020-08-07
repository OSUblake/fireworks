class FireworkEmitter {

  constructor(fireworks, emote) {

    this.emote = emote;
    this.fireworks = fireworks;
    // this.image = new FireworkImage(fireworks, emote.image);
    this.image = new FireworkImage(fireworks, emote);
    this.exploded = false;    
    this.launched = false;
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.rotationSign = 1;
    this.particles = [];
    this.aliveCount = 1;

    fireworks.emitterContainer.addChild(this.image);

    this.container = new PIXI.ParticleContainer(1500, {
      vertices: true,
      position: true,
      rotation: true,
      // uvs: true,
      tint: true
    });

    // this.container = new PIXI.Container();

    this.container2 = new PIXI.Container();
    // this.container2.addChild(this.container);

    const screen = fireworks.screen;
    // this.container.filterArea = new PIXI.Rectangle(0, -screen.height, screen.width, screen.height);

    this.container.filterArea = new PIXI.Rectangle(0, -screen.height, screen.width, screen.height);
    this.container.filterArea = screen;

    // this.container2.filterArea = new PIXI.Rectangle(0, -screen.height, screen.width, screen.height);
    // this.container.filterArea = screen;
    // this.container2.filterArea = this.container.filterArea;
    // this.container2.filterArea = screen;
    
    // this.container2.addChild(this.container);

    // const filter = new GlowFilter({
    //   // color: 0xff0000
    //   outerStrength: 12,
    // });


    // const filter = new PIXI.filters.GlowFilter({
    //   // color: 0xff0000,
    //   outerStrength: 12,
    // })

    // this.container2.filters = [
    //   filter
    // ]
    

    // var filter2 = new PIXI.filters.GlowFilter({ 
    //   // distance: 15, 
    //   outerStrength: 0,
    //   // knockout: true
    // });

    // this.filter2 = filter2;

    // var filter = new PIXI.filters.AdvancedBloomFilter({

    // })

    // var filter3 = new PIXI.filters.BlurFilter ()

    // filter = new PIXI.filters.OutlineFilter(10, 0xff0000)

    // console.log("FILTER", filter)

    

    // if (fireworks.useFilters) {

    //   this.container2.filters = [
    //     // filter, 
    //     // filter3,
  
    //     filter2,
    //   ];

    // }

    this.timeline = gsap.timeline({
      paused: true,
      onComplete: () => {
        this.fireworks.particleContainer.removeChild(this.container);
        // this.fireworks.particleContainer.removeChild(this.container2);
      }
    });
  }

  async _prepare() {
    await this.image.init();
    this.createParticles();
  }

  prepare() {
    // await this.image.init();
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

    // gsap.to(this.filter2, {
    //   outerStrength: 2,
    //   duration: this.timeline.duration()
    // })

    const particles = this.particles;

    // for (let i = 0; i < particles.length; i++) {
      // particles[i].play();
      // particles[i].alive = true;
    // }

    this.fireworks.particleContainer.addChild(this.container);
    // this.fireworks.particleContainer.addChild(this.container2);

    this.timeline.play();
    this.emote.popSound.play();
    this.image.alpha = 0;
    this.fireworks.emitterContainer.removeChild(this.image);

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
    // const { width, height } = this.image;
    const { numParticles, particleSize } = this.fireworks;

    this.addParticles(false);

    // console.log("NUM PARTICLES 1", this.particles.length)

    let len = this.particles.length;

    if (!len) {
      return;
    }

    this.addParticles(true);

    while (len < numParticles) {
      this.addParticles(true);
      len = this.particles.length;
    }

    // console.log("NUM PARTICLES 2", this.particles.length)
  }

  addParticles(centered) {

    const { fireworks, image } = this;
    // const { width, height } = image;
    const width = image.endWidth;
    const height = image.endHeight;

    // console.log("W/H", width, height)

    const { particleSize, shapeTextures, randomShape, explosionType } = fireworks;
    const cx = width / 2;
    const cy = height / 2;
    const size = particleSize;
    const offset = size / 2;

    let count = 0;
    let tint = 0;

    for (let y = 0; y < height; y += size) {
      for (let x = 0; x < width; x += size) {
      
        // const color = image.getColor(x, y);
        // const tint = image.getColor(x, y);

        if (centered) {
          tint = image.randomColor();
        } else {
          tint = image.getColor(x, y);
        }

        // if (color.a < 0.9) {
        //   continue;
        // }

        // console.log("TINT", tint)

        if (tint < 0) {
          // console.log("NO TINT")
          continue;
        }


        // const rgb = `rgb(${color.r}, ${color.g}, ${color.b})`;      
        // const rgb = `rgb(${255}, ${255}, ${255})`;      
        // shapeTextures.addColor(rgb); 
        // const shape = randomShape();
        const shape = explosionType === "particle" ? "circle" : randomShape();

        // const frame = shapeTextures.getFrame(rgb, shape);
        // const rect = new PIXI.Rectangle(frame.sx, frame.sy, frame.sSize, frame.sSize);

        const texture = shapeTextures[shape + "Texture"];



        // if (explosionType === "particle") {
        //   texture = 
        // }

        const particle = new FireworkParticle(texture, fireworks, {
          centered,
          tint,
          // color: rgb,
          // color: PIXI.utils.rgb2hex([color.r / 255, color.g / 255, color.b / 255]),
          // alpha: color.a,
          dx: (x + offset) - cx,
          dy: (y + offset) - cy,
          // frame: rect
          // frame: shapeTextures.getFrame(rgb, shape)
        });

        // fireworks.particleContainer.addChild(particle);

        this.container.addChild(particle);
        particle.alpha = 1;

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
      // image.render();
      alive++;

    } else {

      for (let i = 0; i < particles.length; i++) {
        const particle = particles[i];

        if (particle.alive) {
          // particle.render();
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
