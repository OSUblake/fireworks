class FireworkEmitter {

  constructor(fireworks, emote) {

    this.emote = emote;
    this.fireworks = fireworks;
    // this.image = new FireworkImage(fireworks, emote.image);
    this.image = new FireworkImage(fireworks, emote);

    this.imageData = emote.data;

    this.exploded = false;    
    this.launched = false;
    this.x = 0;
    this.y = 0;
    this.rotation = 0;
    this.rotationSign = 1;
    this.particles = [];
    this.aliveCount = 1;

    fireworks.emitterContainer.addChild(this.image);

    if (this.image.maskSprite) {
      fireworks.emitterContainer.addChild(this.image.maskSprite);
    }

    this.container = new PIXI.ParticleContainer(3000, {
      vertices: true,
      position: true,
      rotation: true,
      // uvs: true,
      tint: true
    });

    const screen = fireworks.screen;

    // this.container.filterArea = new PIXI.Rectangle(0, -screen.height, screen.width, screen.height);
    this.container.filterArea = screen;

    // this.timeline = gsap.timeline({
    //   paused: true,
    //   onComplete: () => {
    //     // this.fireworks.particleContainer.removeChild(this.container);
    //     // this.fireworks.particleContainer.removeChild(this.container2);
    //   }
    // });
  }

  async _prepare() {
    await this.image.init();
    this.createParticles();
  }

  prepare() {
    // await this.image.init();
    this.createParticles();

    console.log("NUM PARTICLES", this.particles.length);
    // console.log("PARTICLES", this.particles)

    // var c = this.imageData.getColor(65487.54, 321654.2)
    // console.log("**** GET COLOR", c)
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

    const debug = this.fireworks.debug.emitters;

    const particles = this.particles;

    for (let i = 0; i < particles.length; i++) {
      particles[i].alive = true;
      particles[i].alpha = 0.5;
      !debug && particles[i].play();
    }

    

    this.fireworks.particleContainer.addChild(this.container);

    // this.timeline.play();
    this.emote.popSound.play();
    
    // TODO
    if (debug) {
      this.image.alpha = 0.5
    } else {
      this.image.alpha = 0;
      this.fireworks.emitterContainer.removeChild(this.image);
    }
    
    // this.image.alpha = 0;
    // this.fireworks.emitterContainer.removeChild(this.image);

    this.exploded = true;
  }

  init() {

    const { particles, x, y, rotation } = this;

    for (let i = 0; i < particles.length; i++) {
      // particles[i].initPolygon(x, y, 0);
      particles[i].initPolygon(x, y, rotation);
    }
  }

  createParticles() {

    const fireworks = this.fireworks;
    // const { width, height } = this.image;
    const { numParticles, particleSize } = this.fireworks;

    

    // if (fireworks.explosionType === "particle") {
    //   // return;
    //   return this.addParticles(true);
    // }

    if (fireworks.isParticleExplosion) {
      return this.addParticles(true);
    }

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

    const { fireworks, imageData } = this;
    // const { width, height } = image;

    const width = imageData.endWidth;
    const height = imageData.endHeight;

    // console.log("W/H", width, height)

    // const { particleSize, shapeTextures, randomShape, explosionType } = fireworks;
    const { isParticleExplosion, polygonSpacing, orbSpacing, shapeTextures, randomShape } = fireworks;
    
    
    // const isParticleType = (explosionType === "particle");
    // const size = particleSize;
    // const gap = isParticleExplosion ? 5 : polygonSize;

    // const gap = isParticleExplosion ? orbSpacing : polygonSpacing;
    const gap = fireworks.particleSpacing;

    const cx = width / 2;
    const cy = height / 2;
    // const offset = Math.round(gap / 2);
    const offset = gap / 2;

    let count = 0;
    let tint = 0;

    

    for (let y = 0; y < height; y += gap) {
      for (let x = 0; x < width; x += gap) {
      
        // const color = image.getColor(x, y);
        // const tint = image.getColor(x, y);

        const xPos = x + offset;
        const yPos = y + offset;

        if (xPos > width || yPos > height) {
          // console.log("PARTICLE OVERFLOW")
          // continue;
        }


        if (centered) {
          tint = imageData.randomColor();
        } else {
          // tint = imageData.getColor(x, y);
          tint = imageData.getColor(xPos, yPos);
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

        // TODO
        // const shape = isParticleExplosion ? "circle" : "rect";
        // const shape = isParticleExplosion ? "circle" : randomShape();
        // const shape = "circle";

        let shape;

        if (fireworks.debug.emitters) {
          shape = fireworks.debug.particleShape;
        } else {
          shape = isParticleExplosion ? "circle" : randomShape();
        }

        // const frame = shapeTextures.getFrame(rgb, shape);
        // const rect = new PIXI.Rectangle(frame.sx, frame.sy, frame.sSize, frame.sSize);

        const texture = shapeTextures[shape + "Texture"];



        // if (explosionType === "particle") {
        //   texture = 
        // }

        const particle = new FireworkParticle(texture, fireworks, {
          centered,
          tint,
          dx: xPos - cx,
          dy: yPos - cy,
        });

        this.container.addChild(particle);
        // particle.alpha = 1;

        this.particles.push(particle);        

        count++;
      }
    }

    return count;
  }

  update() {

    const { exploded, fireworks, image, particles, x, y, rotation } = this;

    let alive = 0;

    if (!this.launched && y < 0) {
      this.launch();
    }

    if (!exploded) {

      // image.x = x;
      // image.y = y;
      // image.rotation = this.rotation;
      image.update(x, y, rotation);

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

    if (!alive && !fireworks.debug.emitters) {
      
      this.kill();
      // if (this.image.maskSprite) {
      //   fireworks.emitterContainer.removeChild(this.image.maskSprite);
      // }
    }

    // if (!alive) {
    //   image.pause();
    // }
  }

  kill() {

    this.fireworks.particleContainer.removeChild(this.container);

    this.fireworks.emitterContainer.removeChild(this.image);

    if (this.image.maskSprite) {
      this.fireworks.emitterContainer.removeChild(this.image.maskSprite);
    }
  }
}
