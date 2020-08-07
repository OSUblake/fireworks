class Fireworks extends PIXI.Application {

  constructor(settings) {

    const dpr = window.devicePixelRatio || 1;

    super({
      resolution: dpr,
      view: settings.canvas,
      autoStart: false,
      resizeTo: window,
      antialias: true,
      transparent: true
    });

    Object.assign(this, settings);

    if (settings.debug) {
      this.stats = new Stats();
      this.stats.showPanel(0);
      document.body.appendChild(this.stats.dom);
      this.stats.dom.style.left = "unset";
      this.stats.dom.style.right = "0px";
    }

    // this.spriteCache = [];

    // this.stage.filters = [
    //   // new PIXI.filters.AlphaFilter(1)
    // ];

    this.stage.filterArea = this.screen;

    this.dpr = window.devicePixelRatio;

    this.emitterContainer = new PIXI.Container();
    // this.lightContainer = new PIXI.Container();
    this.particleContainer = new PIXI.Container();
    this.trailContainer = new PIXI.Container();
    this.mainContainer = new PIXI.Container();
    this.mainContainer.addChild(this.trailContainer, this.emitterContainer, this.particleContainer);
    // this.mainContainer.addChild(this.lightContainer, this.trailContainer, this.emitterContainer, this.particleContainer);
    
    
    this.canPlay = false;

    this.update = this.update.bind(this);    

    this.fireworksTimeline = gsap.timeline({ paused: true });    
    this.trailParticles = [];
    
    this.shapeTextures = new ShapeTextures(this);
    // this.colors.forEach(color => this.shapeTextures.addColor(color));
    this.randomColor = gsap.utils.random(this.colors, true);
    this.randomShape = gsap.utils.random(["triangle", "rect"], true);

    this.getFPS = this.smoothedAverage();
    this.getElapsed = this.smoothedAverage();

    console.log("FIREWORKS", this)

    this.stage.filterArea = this.screen;

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

    // console.log("EMOTES", this.emotes)
    
    // this.emotes = this.emotes.filter
    this.emitters = this.emotes
      .filter(emote => emote.data.isValid)
      .map(emote => new FireworkEmitter(this, emote));

    this.onResize();
    this.createVars();

    this.mainExplodeY = -(this.height - this.mainExplodeY);

    window.addEventListener("resize", e => this.onResize());

    this.emitters.forEach(emitter => emitter.prepare());

    console.time("INIT");
    this.init();
    console.timeEnd("INIT")
    this.fireReady();

    // this.render();
    // this.start();

    // Promise.all(
    //   this.emitters.map(emitter => emitter.prepare())
    // )
    // .then((res) => {      
    //   this.init();
    //   this.fireReady();
    // });
  }

  init() {

    // console.log("INIT", this.shapeTextures.baseTexture)

    // this.shapeTextures.generate();
    this.shapesBaseTexture = this.shapeTextures.baseTexture; 
    this.shapesSprite = new PIXI.Sprite(new PIXI.Texture(this.shapesBaseTexture));

    if (this.debug) {
      this.text = new PIXI.Text("",{
        fontFamily: "monospace", 
        fontSize: 18, 
        fill : 0xffffff, 
        dropShadow: true,
        dropShadowDistance: 1
        // align : 'center'
      });
      this.stage.addChild(this.shapesSprite, this.text);
    }

    this.stage.addChild(this.mainContainer);

    this.canPlay = true;

    const { cx, mainExplodeY } = this;

    const minRotation = 80;
    const maxRotation = 120;
    const spread = 200;
    const size = this.maxImageSize;
    const spawnWidth = Math.min(this.spawnWidth, this.width) / 2;
    let spawnSide = 1;

    const randomX = gsap.utils.random(100, spawnWidth, true);
    const randomY = gsap.utils.random(mainExplodeY - spread, mainExplodeY + spread, true);
    const randomRotation = gsap.utils.random(minRotation * RAD, maxRotation * RAD, true);
    const randomDelay = gsap.utils.random(0.1, 0.5, true);
    const randomDrop = gsap.utils.random(50, 80, true);

    this.emitters.forEach((emitter, index) => {

      const isMain = !index;
      const sign = randomChoice(1, -1);
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
          console.time(`EMITTER ${index}`)
          emitter.init();
          console.timeEnd(`EMITTER ${index}`)
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

      // console.log("DELAY", delay)
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
    const randomRotation = gsap.utils.random(minRotation * RAD, maxRotation * RAD, true);

    const size = gsap.utils.mapRange(
      this.minImageSizeSlider,
      this.maxImageSizeSlider,
      this.minTrailParticleSize,
      this.maxTrailParticleSize,
      imageSize
    );

    const scale = size / this.particleSize;

    const count = isMain ? gsap.utils.random(6, 9, 1) : gsap.utils.random(2, 3, 1);

    const trailTimeline = gsap.timeline();

    for (let i = 0; i < count; i++) {

      const tint = randomColor();      
      const x = emitter.x + randomOffsetX() * randomChoice(1, -1);
      const shape = this.randomShape();      
      const sign = randomChoice(1, -1);      
      const offsetY = randomOffsetY();
      const startY = emitter.y + offsetY;
      const peakY = endY - offsetY;
      const fadeY = peakY + randomDrop();

      // const frame = shapeTextures.getFrame(color, shape);
      // const rect = new PIXI.Rectangle(frame.sx, frame.sy, frame.sSize, frame.sSize);

      const texture = shapeTextures[shape + "Texture"];

      const particle = new FireworkParticle(texture, this, {
        tint,
        // scaleX: scale,
        // scaleY: scale,
        // frame: rect,
        // frame: shapeTextures.getFrame(color, shape),
        x,
        y: startY,
        rotation: Math.random() * Math.PI,
      });     

      particle.scale.set(scale);
      // particle.texture = new PIXI.Texture(this.shapesBaseTexture, rect);

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

      // this.fireworksTimeline.add(tweener, delay);

        // particle.y = -1000;
        // particle.x = 1000;
        // particle.alpha = 1;

      trailTimeline.add(tweener, 0);

      // trailTimeline.play()

      this.trailParticles.push(particle);

      // return tweener;
    }

    return trailTimeline;
  }  

  createVars() {

    this.particleVars = {
      startAlpha: gsap.utils.random(0.5, 1, true),
      scale: gsap.utils.random(0.5, 1, true),
      duration: gsap.utils.random(1, 2, true),
      friction: gsap.utils.random(0.1, 0.3, true),
      gravity: 400,
      rotation: gsap.utils.random(45 * RAD, 90 * RAD, true),
      spread: 60,
      skew: gsap.utils.random(-45 * RAD, 45 * RAD, true),
      velocity: gsap.utils.random(800, 1100, true),
    };
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

  ___onResize() {

    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    this.cx = this.width / 2;
    this.cy = this.height / 2;
    
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.offsetY = this.height;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    this.ctx.font = "700 18px monospace";
  }

  // get cx() {
  //   return this.width / 2;
  // }

  // get cy() {
  //   return this.height / 2;
  // }

  play(tl) {

    if (!this.canPlay) {
      console.log("*** Fireworks can't play");
      return;
    }

    // this.fireworksTimeline.pause(0.5);
    // this.render(0, 1);

    this.lastTime = performance.now();

    this.fireworksTimeline.play(0);
    tl.play(0);
    gsap.ticker.add(this.update);  
    this.update();

    // this.start();

    // this.emitters[0].x = 200;
    // this.emitters[0].y = 200;


    // gsap.ticker.remove(gsap.updateRoot);
    // this.fireworksTimeline.play();

    // this.startTime = this.lastTime = Date.now();
    // this.update();

    
    // requestAnimationFrame(() => this.update());
  }

  kill() {
    gsap.ticker.remove(this.update);

    if (this.debug) {
      console.log("*** Fireworks complete");
    }

    // this.stop();
  }

  fireReady() {

    this.onReady && this.onReady.call(this, this);
  }

  smoothedAverage(smoothing = 0.9) {
    
    let smoothingInv = 1 - smoothing;
    let measurement = 0;
    
    return current => {
      measurement = (measurement * smoothing) + (current * smoothingInv);
      return measurement;
    }
  }

  update() {
    this.render();
  }

  render(time, deltaTime) {

    const { emitters, trailParticles } = this;

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

    if (this.debug) {
      this.stats.update();
      // const currentTime = performance.now();
      // const elapsed = currentTime - this.lastTime;
      // this.lastTime = currentTime;
      // const fps = this.getFPS(1000 / elapsed).toFixed(0);
      // const elapsedAvg = this.getElapsed(elapsed).toFixed(0);
      // this.text.text = `FPS: ${fps}\nELAPSED: ${elapsedAvg}`;
    }

    this.renderer.render(this.stage);
  }
}
