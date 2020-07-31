class Fireworks {

  constructor(settings) {

    gsap.ticker.lagSmoothing(0);

    Object.assign(this, settings);

    this.canPlay = false;
    this.render = this.render.bind(this);    
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio;
    this.fireworksTimeline = gsap.timeline({ paused: true });    
    this.trailParticles = [];
    
    this.shapeTextures = new ShapeTextures(this);
    this.colors.forEach(color => this.shapeTextures.addColor(color));
    this.randomColor = gsap.utils.random(this.colors, true);
    this.randomShape = gsap.utils.random(["triangle", "rect"], true);

    this.getFPS = this.smoothedAverage(0.9);
    // this.getFPS = this.movingAverage();
    // this.ct = 0;
    
    // this.images = this.images.filter(img => img instanceof HTMLElement && (img.naturalWidth || img.videoWidth || img.width));

    // if (this.images.length) {
    //   this.prepare();
    // } else {
    //   this.fireReady();
    // }

    if (this.emotes.length) {
      this.prepare();
    } else {
      this.fireReady();
    }
  }

  prepare() {

    // const firstImage = this.images.shift();
    // this.images = [firstImage, ...gsap.utils.shuffle(this.images)].slice(0, this.maxFireworks);

    // this.emitters = this.images.map((img, i) => new FireworkEmitter(this, img));
    this.emitters = this.emotes.map(emote => new FireworkEmitter(this, emote));

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

      // let launchTime = 0;
      // let lastTime = 0;

      // for (let i = 0; i <= 1; i += 0.01) {

      //   const currentTime = duration * i;

      //   // tl.time(currentTime, true);
      //   tl.time(currentTime, true);

      //   // console.log("EMITTER Y", emitter.y)

      //   if (emitter.y < explodeY) {
      //     // emitter.init();
      //     launchTime = lastTime;
      //     // break;
      //   }

      //   lastTime = currentTime;
      // }

      // tl.add(() => emitter.launch(), launchTime);

      // console.log("**** LAUNCH TIME", launchTime)

      // tl.progress(0, true);

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

      // const tweener = gsap.to(tl, {
      //   duration: this.explodeTime,
      //   progress,
      //   ease: "none",
      //   onStart: () => {
      //     emitter.play();
      //   },
      //   onComplete: () => {
      //     tl.kill();
      //     emitter.explode();
      //     // this.popSound.play();
      //   }
      // });

      const tweener = gsap.timeline({
        onStart: () => {
          emitter.play();
        },
        // onComplete: () => {
        //   tl.kill();
        //   emitter.explode();
        //   // this.popSound.play();
        // }
      })
      .to(tl, {
        duration: this.explodeTime,
        progress,
        ease: "none",
        // onStart: () => {
        //   emitter.play();
        // },
        onComplete: () => {
          tl.kill();
          emitter.explode();
          // this.popSound.play();
        }
      }, 0);

      const trailAnimation = this.createTrailParticles({
        emitter,
        startY: emitter.y,
        endY: explodeY,
        isMain,
        // delay
      });

      tweener.add(trailAnimation, 0);
         
      this.fireworksTimeline.add(tweener, delay);        
      
      // if (this.fireworkDelay) {

      // } else {

      // }
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

      const color = randomColor();      
      const x = emitter.x + randomOffsetX() * randomChoice(1, -1);
      const shape = this.randomShape();      
      const sign = randomChoice(1, -1);      
      const offsetY = randomOffsetY();
      const startY = emitter.y + offsetY;
      const peakY = endY - offsetY;
      const fadeY = peakY + randomDrop();

      const particle = new FireworkParticle(this, {
        color,
        scaleX: scale,
        scaleY: scale,
        frame: shapeTextures.getFrame(color, shape),
        x,
        y: startY,
        rotation: Math.random() * Math.PI,
      });     

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

      tl.to(particle, {
          ease: "power3.in",
          duration: timeDifference * 2,
          scaleX: 0,
          scaleY: 0
        }, duration - timeDifference);


      tl.progress(0, true);
      
      const progress = endTime / tl.duration();
      const minDuration = this.explodeTime + 0.1;
      const maxDuration = minDuration + 0.3;
      const tweenerDuration = gsap.utils.random(minDuration, maxDuration);

      const tweener = gsap.timeline({
          onStart: () => {
            particle.alive = true;
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
      trailTimeline.add(tweener, 0);

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

  play(tl) {

    if (!this.canPlay) {
      console.log("*** Fireworks can't play");
      return;
    }

    this.fireworksTimeline.play(0);
    // this.fireworksTimeline.pause(0.5);
    // this.render(0, 1);
    tl.play(0);
    gsap.ticker.add(this.render);  

    // gsap.ticker.remove(gsap.updateRoot);
    // this.fireworksTimeline.play();

    // this.startTime = this.lastTime = Date.now();
    // this.update();

    
    // requestAnimationFrame(() => this.update());
  }

  kill() {
    gsap.ticker.remove(this.render);

    if (this.debug) {
      console.log("*** Fireworks complete");
    }
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

  // movingAverage(numSamples = 100) {
  
  //   let index = 0;
  //   let sum = 0;
  //   let samples = Array(numSamples).fill(0);
            
  //   return (newValue, valid) => {
      
  //     sum -= samples[index];
  //     sum += newValue;
  //     samples[index] = newValue;    
  //     index = (index + 1) % numSamples;
      
  //     return sum / numSamples;
  //   }
  // }

  // update() {

  //   const currentTime = Date.now();
  //   const elapsed = currentTime - this.lastTime;
  //   gsap.updateRoot((currentTime - this.startTime) / 1000);
  //   this.render(0, elapsed);
  //   this.lastTime = currentTime;

  //   if (this.fireworksTimeline.progress() < 1) {
  //     requestAnimationFrame(() => this.update());
      
  //   }

  // }

  render(time, deltaTime) {

    // if (this.ct++ < 100) {
    //   console.log("ELAPSED", deltaTime)
    // }

    const { ctx, emitters, width, height, trailParticles } = this;

    let aliveCount = 0;
    let i = 0;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    if (this.debug) {
      ctx.drawImage(this.shapeTextures.texture, 0, 0);
      // ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      // ctx.fillRect(0, 0, 200, 100);
      const fps = `FPS: ${this.getFPS(1000 / deltaTime).toFixed(0)}`;
      ctx.fillStyle = "#ffffff";      
      // ctx.strokeStyle = "#000000";
      ctx.shadowColor = "#000000";
      // ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(fps, 10, 20);
      ctx.shadowColor = "transparent";
      // ctx.strokeText(fps, 10, 20);
    }

    for (i = 0; i < trailParticles.length; i++) {
      const particle = trailParticles[i];

      if (particle.alive) {
        particle.render();
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
  }
}
