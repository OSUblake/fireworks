
class Fireworks extends PIXI.Application {

  constructor(settings) {

    super({
      resolution: settings.dpr,
      view: settings.canvas,
      autoStart: false,
      resizeTo: window,
      // antialias: true,
      transparent: true
    });

    Object.assign(this, settings);

    if (settings.debug.stats) {
      this.stats = utils.createStats();
    }

    // this.stage.filterArea = this.screen;

    // this.dpr = window.devicePixelRatio;

    this.emitterContainer = new PIXI.Container();
    this.particleContainer = new PIXI.Container();

    this.particleContainer = new PIXI.ParticleContainer(16384, {
      vertices: true,
      position: true,
      rotation: true,
      // uvs: true,
      tint: true
    }, 16384, true);

    this.particleContainer.roundPixels = true;

    if (this.useBlendMode) {
      this.particleContainer.blendMode = PIXI.BLEND_MODES.ADD;
    }

    this.trailContainer = new PIXI.Container();
    this.mainContainer = new PIXI.Container();
    this.mainContainer.addChild(this.trailContainer, this.emitterContainer, this.particleContainer);    
    
    this.canPlay = false;

    this.update = this.update.bind(this);    

    this.fireworksTimeline = gsap.timeline({ paused: true });    
    this.trailParticles = [];
    
    this.shapeTextures = new ShapeTextures(this);
    // this.colors.forEach(color => this.shapeTextures.addColor(color));

    this.colors.forEach(color => {
      this.shapeTextures.addShape(color, "rect");
      this.shapeTextures.addShape(color, "triangle");
    });
    this.randomColor = gsap.utils.random(this.colors, true);
    this.randomShape = gsap.utils.random(["triangle", "rect", "polygon"], true);

    // this.getFPS = this.smoothedAverage();
    // this.getElapsed = this.smoothedAverage();

    utils.log("FIREWORKS", this)

    this.stage.filterArea = this.screen;

    this.stage.filters = [
      // new PIXI.filters.AlphaFilter(1)
    ]

    if (this.emotes.length) {
      this.prepare();
    } else {
      this.fireReady();
    }
  }

  async prepare() {

    this.emoteData = new Map();

    const promises = this.emotes.map(emote => {

      if (this.emoteData.has(emote)) {
        return emote;
      }

      this.emoteData.set(emote);
      emote.data = new EmoteData(this, emote.image);
      return emote.data.init();
    });

    await Promise.all(promises);
    
    this.emitters = this.emotes
      .filter(emote => emote.data.isValid)
      .map(emote => new FireworkEmitter(this, emote));

    this.onResize();
    // this.createVars();

    this.mainExplodeY = -(this.height - this.mainExplodeY);    

    this.emitters.forEach(emitter => emitter.prepare());

    utils.time("INIT TIME");
    this.init();
    utils.timeEnd("INIT TIME")

    if (this.debug.stats) {
      const numParticles = this.emitters.reduce((res, emitter, i) => {
        const count = emitter.particles.length;
        utils.log(`*** EMITTER ${i} PARTICLES`, count);
        return res + count;
      }, 0);
      utils.log("*** TOTAL PARTICLES", numParticles);
    }

    window.addEventListener("resize", e => this.onResize());

    this.fireReady();
  }

  // createVars() {

  //   this.polygonVars = {
  //     startAlpha: gsap.utils.random(0.5, 1, true),
  //     scale: gsap.utils.random(0.5, 1, true),
  //     duration: gsap.utils.random(1, 2, true),
  //     friction: gsap.utils.random(0.1, 0.3, true),
  //     gravity: 400,
  //     rotation: gsap.utils.random(45 * utils.RAD, 90 * utils.RAD, true),
  //     spread: 60,
  //     skew: gsap.utils.random(-45 * utils.RAD, 45 * utils.RAD, true),
  //     velocity: gsap.utils.random(800, 1100, true),
  //   };
  // }

  init() {

    // TODO: added
    this.shapeTextures.generate();

    this.shapesBaseTexture = this.shapeTextures.baseTexture; 
    this.shapesSprite = new PIXI.Sprite(new PIXI.Texture(this.shapesBaseTexture));

    // this.emitters.filter(emitter => emitter.isValid);

    if (this.debug.shapes) {
      this.stage.addChild(this.shapesSprite);
    }

    this.stage.addChild(this.mainContainer);

    this.canPlay = true;

    const { cx, mainExplodeY } = this;

    const minRotation = 80;
    const maxRotation = 120;
    const spread = 200;
    const size = this.maxImageSize;
    // const spawnWidth = Math.min(this.spawnWidth, this.width) / 2;
    const spawnWidth = Math.min(this.spawnWidth, this.width - 200) / 2;
    let spawnSide = 1;

    const randomX = gsap.utils.random(100, spawnWidth, true);
    const randomY = gsap.utils.random(mainExplodeY - spread, mainExplodeY + spread, true);
    const randomRotation = gsap.utils.random(minRotation * utils.RAD, maxRotation * utils.RAD, true);
    const randomDelay = gsap.utils.random(0.1, 0.5, true);
    const randomDrop = gsap.utils.random(50, 80, true);

    this.emitters.forEach((emitter, index) => {

      const isMain = !index;
      const sign = utils.randomChoice(1, -1);
      const duration = 1;
      const drop = randomDrop();

      let delay, peakY, explodeY;

      if (isMain) {
        peakY = mainExplodeY - drop;
        explodeY = mainExplodeY;
        delay = 0;
      } else {
        peakY = randomY();
        explodeY = peakY + drop;
        

        if (this.fireworkDelay) {
          // delay = `>${this.fireworkDelay}`;
          const delayOffset = this.fireworkDelay * 0.2;
          delay = this.fireworkDelay * index + gsap.utils.random(-delayOffset, delayOffset);
        } else {
          delay = randomDelay();
        }
      }

      emitter.rotationSign = sign;
      emitter.x = isMain ? cx : (cx + randomX() * spawnSide);
      emitter.y = this.height;  
      spawnSide *= -1;

      const tl = gsap.timeline({       
          paused: true
        })
        .to(emitter, {
          duration: duration * 2,
          ease: "none",
          rotation: "+=" + randomRotation() * sign
        }, 0)
        .to(emitter, {
          duration,
          ease: "sine.out",
          y: peakY
        }, 0)
        .to(emitter, {
          duration,
          ease: "sine.in",
          y: 0
        }, ">");

      tl.time(duration, true);

      let explodeTime = 0;

      for (let i = 0; i <= 1; i += 0.01) {

        const currentTime = duration + duration * i;

        tl.time(currentTime, true);

        if (emitter.y > explodeY) {
          utils.time(`EMITTER ${index} TIME`)
          emitter.init();
          utils.timeEnd(`EMITTER ${index} TIME`)
          explodeTime = currentTime;
          break;
        }
      }

      tl.progress(0, true);

      const progress = explodeTime / tl.duration();

      const tweener = gsap.timeline({
        onStart: () => {
          emitter.play();
        }
      })
      .to(tl, {
        duration: this.explodeTime,
        progress,
        ease: "none",
        onComplete: () => {
          tl.kill();
          emitter.explode();
        }
      }, 0);

      const trailAnimation = this.createTrailParticles({
        emitter,
        startY: emitter.y,
        endY: explodeY,
        isMain,
        delay
      });

      tweener.add(trailAnimation, 0);         
      this.fireworksTimeline.add(tweener, delay);
    });
  }

  createTrailParticles(settings) {

    const {
      delay,
      emitter,
      endY,
      isMain,
    } = settings;

    const { randomColor, shapeTextures } = this;

    const minRotation = 360;
    const maxRotation = 720;

    const imageSize = Math.min(emitter.image.width, emitter.image.height);
    const maxOffsetX = Math.min(10, imageSize / 2);
    
    const randomDelay = gsap.utils.random(0, 0.5, true);
    const randomDrop = gsap.utils.random(100, 150, true);
    const randomOffsetX = gsap.utils.random(50, maxOffsetX, true);
    const randomOffsetY = gsap.utils.random(endY * 0.2, endY * 0.5, true);
    const randomRotation = gsap.utils.random(minRotation * utils.RAD, maxRotation * utils.RAD, true);
    const randomShape = gsap.utils.random(["triangle", "rect"], true);
    const randomSize = gsap.utils.random(10, 15, true);

    // const size = gsap.utils.mapRange(
    //   this.minImageSizeSlider,
    //   this.maxImageSizeSlider,
    //   this.minTrailParticleSize,
    //   this.maxTrailParticleSize,
    //   imageSize
    // );

    // const scale = size / this.shapeTextures.particleSize;

    const count = isMain ? gsap.utils.random(6, 9, 1) : gsap.utils.random(2, 3, 1);

    const trailTimeline = gsap.timeline();

    for (let i = 0; i < count; i++) {

      const tint = randomColor();      
      const x = emitter.x + randomOffsetX() * utils.randomChoice(1, -1);
      const shape = randomShape();      
      const sign = utils.randomChoice(1, -1);      
      const offsetY = randomOffsetY();
      const startY = emitter.y + offsetY;
      const peakY = endY - offsetY;
      const fadeY = peakY + randomDrop();

      // const texture = shapeTextures[shape + "Texture"];  
      const texture = shapeTextures.addShape(tint, shape).texture;
      // const texture = getTexture(tint, shape);
      
      const particle = new PIXI.Sprite(texture);
      particle.tint = tint;
      particle.alive = false;
      particle.alpha = 0;
      particle.rotation = Math.random() * Math.PI;
      particle.position.set(x, startY);
      particle.anchor.set(0.5);
      particle.width = particle.height = randomSize();
      // particle.scale.set(scale);

      this.trailContainer.addChild(particle);

      const duration = 1;

      const tl = gsap.timeline({
          paused: true
        })
        .to(particle, {
          duration,
          y: peakY,
          ease: "sine.out"
        })
        .to(particle, {
          duration,
          y: 0,
          ease: "sine.in"
        })
        .to(particle, {
          duration: duration * 2,
          rotation: "+=" + randomRotation() * sign,
          ease: "power3.in"
        }, 0);

      let endTime = 0;

      for (let i = 0; i <= 1; i += 0.01) {

        const currentTime = duration + duration * i;

        tl.time(currentTime, true);

        if (particle.y > fadeY) {
          endTime = currentTime;
          break;
        }
      }

      const timeDifference = endTime - duration;

      tl.to(particle.scale, {
          ease: "power3.in",
          duration: timeDifference * 2,
          x: 0,
          y: 0
        }, duration - timeDifference);


      tl.progress(0, true);
      
      const progress = endTime / tl.duration();
      const minDuration = this.explodeTime + 0.1;
      const maxDuration = minDuration + 0.3;
      const tweenerDuration = gsap.utils.random(minDuration, maxDuration);

      const tweener = gsap.timeline({
          onStart: () => {
            particle.alive = true;
            particle.alpha = 1;
          },
          onComplete: () => {
            particle.alive = false;
            tl.kill();
          }
        })
        .to(tl, {
          duration: tweenerDuration,
          progress,
          ease: "none"            
        });

      trailTimeline.add(tweener, 0);

      this.trailParticles.push(particle);
    }

    return trailTimeline;
  }  

  onResize() {

    this.width = this.screen.width;
    this.height = this.screen.height;
    this.cx = this.width / 2;
    this.cy = this.height / 2;
    this.offsetY = this.height;
    this.mainContainer.y = this.offsetY;
    this.renderer.resize(this.width, this.height);
  }

  play(tl) {

    if (!this.canPlay) {
      utils.log("*** Fireworks can't play");
      return;
    }

    this.lastTime = performance.now();

    this.fireworksTimeline.play(0);
    tl.play(0);
    gsap.ticker.add(this.update);  
    gsap.ticker.lagSmoothing(0)
    this.update();

    
  }

  kill() {
    gsap.ticker.remove(this.update);

    if (this.debug.stats) {
      utils.log("*** Fireworks complete");
    }

    // this.stop();
  }

  fireReady() {

    this.onReady && this.onReady.call(this, this);
  }

  update(time, deltaTime) {

    const { emitters, trailParticles } = this;

    // TWEEN.update();

    // const currentTime = performance.now();
    // const delta = (currentTime - this.lastTime) * 0.06;
    // this.lastTime = currentTime;

    let aliveCount = 0;
    let i = 0;

    for (i = 0; i < trailParticles.length; i++) {
      const particle = trailParticles[i];

      if (particle.alive) {
        // particle.render();
        aliveCount++;
      }
    }

    for (i = 0; i < emitters.length; i++) {
      emitters[i].update();
      aliveCount += emitters[i].aliveCount;
    }

    if (!aliveCount) {
      this.kill();
    }  

    if (this.debug.stats) {
      this.stats.update();
      // utils.log("ACTIVE PARTICELS", this.particleContainer.children.length);
    }

    this.renderer.render(this.stage);
  }
}
