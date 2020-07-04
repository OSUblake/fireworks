class Fireworks {

  constructor(settings) {

    Object.assign(this, settings);

    this.render = this.render.bind(this);    
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio;
    this.fireworksTimeline = gsap.timeline({ paused: true });    
    this.trailParticles = [];
    
    this.shapeTextures = new ShapeTextures(this);
    this.colors.forEach(color => this.shapeTextures.addColor(color));
    this.randomColor = gsap.utils.random(this.colors, true);
    this.randomShape = gsap.utils.random(["triangle", "rect"], true);
    
    this.images = this.images.filter(img => img.naturalWidth || img.videoWidth || img.width);
    const firstImage = this.images.shift();
    this.images = [firstImage, ...gsap.utils.shuffle(this.images)].slice(0, this.maxFireworks);
    this.emitters = this.images.map((img, i) => new FireworkEmitter(this, img));

    this.onResize();
    this.createVars();

    this.mainExplodeY = -(this.height - this.mainExplodeY);

    window.addEventListener("resize", e => this.onResize());

    Promise.all(
      this.emitters.map(emitter => emitter.prepare())
    )
    .then((res) => {
      this.init();
      this.shapeTextures.generate();
      this.fireReady();
    });
  }

  init() {

    const { cx, mainExplodeY } = this;

    const minRotation = 80;
    const maxRotation = 120;
    const spread = 200;
    const size = this.maxImageSize;
    const offset = size * Math.SQRT2 + 1;
    const spawnWidth = Math.min(this.spawnWidth, this.width) / 2;
    let spawnSide = 1;

    // console.log("SPAWN WIDTH", spawnWidth)
    // console.log("CX", this.cx)
    // console.log("SIZE", size)
    // console.log("\n")

    // const randomX = gsap.utils.random(100, spawnWidth - size, true);
    const randomX = gsap.utils.random(100, spawnWidth, true);
    const randomY = gsap.utils.random(mainExplodeY - spread, mainExplodeY + spread, true);
    const randomRotation = gsap.utils.random(minRotation * RAD, maxRotation * RAD, true);
    const randomDuration = gsap.utils.random(1, 1.5, true);
    const randomDelay = gsap.utils.random(0.1, 0.5, true);
    const randomDrop = gsap.utils.random(50, 80, true);

    this.emitters.forEach((emitter, index) => {

      const isMain = !index;
      const sign = randomChoice(1, -1);
      // const duration = randomDuration();
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
        delay = randomDelay();
      }

      emitter.rotationSign = sign;
      emitter.x = isMain ? cx : (cx + randomX() * spawnSide);
      emitter.y = 0;
      emitter.y = offset;  
      emitter.y = this.height;  
      spawnSide *= -1;

      const tl = gsap.timeline({       
          paused: true,
          // onStart: () => {
          //   emitter.play();
          // }
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
          emitter.init();
          explodeTime = currentTime;
          break;
        }
      }

      tl.progress(0, true);

      const progress = explodeTime / tl.duration();

      const tween = gsap.to(tl, {
        duration: this.explodeTime,
        progress,
        ease: "none",
        onStart: () => {
          emitter.play();
        },
        onComplete: () => {
          tl.kill();
          emitter.explode();

          if (isMain) {
            this.popSound.play();
          }
        }
      });

      this.createTrailParticles({
        emitter,
        x: emitter.x,
        startY: emitter.y,
        endY: explodeY,
        isMain,
        delay,
      });
         
      this.fireworksTimeline.add(tween, delay);           
    });
  }

  createTrailParticles(settings) {

    // console.log("SETTINGS", settings)

    const {
      emitter,
      isMain,
    } = settings;

    const { randomColor, shapeTextures } = this;

    // minTrailParticleSize: 10, 
    // maxTrailParticleSize: 30,
    // maxImageSizeSlider: 1000, // based on maxImageSize slider
    // minImageSizeSlider: 10, // based on maxImageSize slider 

    

    const imageSize = Math.min(emitter.image.width, emitter.image.height);
    let maxOffsetX = Math.min(emitter.image.width, emitter.image.height) / 2;
    // maxOffsetX = Math.min(25, maxOffsetX)
    const randomOffsetX = gsap.utils.random(0, 25, true);

    const size = gsap.utils.mapRange(
      this.minImageSizeSlider,
      this.maxImageSizeSlider,
      this.minTrailParticleSize,
      this.maxTrailParticleSize,
      imageSize
    );

    // console.log("SIZE", size)

    // const size = 10;
    const scale = size / this.particleSize;


    // console.log("MAX OFFSET X", maxOffsetX)

    const count = isMain ? 9 : gsap.utils.random(2, 4, 1);

    for (let i = 0; i < count; i++) {

      const color = randomColor();

      const x = settings.x + randomOffsetX() * randomChoice(1, -1);

      const shape = this.randomShape();

      const particle = new FireworkParticle(this, {
        color,
        scaleX: scale,
        scaleY: scale,
        frame: shapeTextures.getFrame(color, shape),
        x,
        y: settings.endY,
        rotation: Math.random() * Math.PI,

        alive: true, // TODO: temp
      });

      this.trailParticles.push(particle);
    }


    // console.log("TRAIL PARTICLES", this.trailParticles)


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

    this.width = this.canvas.clientWidth;
    this.height = this.canvas.clientHeight;

    this.cx = this.width / 2;
    this.cy = this.height / 2;
    
    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.offsetY = this.height;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  play() {
    this.fireworksTimeline.play();
    this.alertTimeline.play();
    this.launchSound.play();
    gsap.ticker.add(this.render);  
  }

  kill() {
    gsap.ticker.remove(this.render);
    console.log("*** FIREWORKS COMPLETE ***");
  }

  fireReady() {

    this.onReady && this.onReady.call(this, this);
  }

  render() {

    const { ctx, emitters, width, height, trailParticles } = this;

    let aliveCount = 0;
    let i = 0;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    // ctx.imageSmoothingEnabled = false;

    // this.emitters.forEach(emitter => {
    //   ctx.drawImage(emitter.image.canvas, 0, 0)
    // })

    // ctx.drawImage(this.shapeTextures.texture, 0, 0);


    for (i = 0; i < trailParticles.length; i++) {
      const particle = trailParticles[i];

      if (particle.alive) {
        particle.render();
        aliveCount++;
      }

      // if (ct++ < 50) {
      //   console.log("TRAIL PARTICLE", particle)
      // }
    }

    for (i = 0; i < emitters.length; i++) {
      emitters[i].update();
      aliveCount += emitters[i].aliveCount;
    }

    if (!aliveCount) {
      this.kill();
    }  
  }
}

