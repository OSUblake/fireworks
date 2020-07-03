class Fireworks {

  constructor(settings) {

    Object.assign(this, settings);

    this.render = this.render.bind(this);    
    this.ctx = this.canvas.getContext("2d");
    this.dpr = window.devicePixelRatio;

    this.fireworksTimeline = gsap.timeline({ paused: true });

    this.shapeTextures = new ShapeTextures(this);

    // make sure image is valid, keep first image, shuffle remaining, then trim
    this.images = this.images.filter(img => img.naturalWidth || img.videoWidth || img.width);
    const firstImage = this.images.shift();
    this.images = [firstImage, ...gsap.utils.shuffle(this.images)].slice(0, this.maxFireworks);

    this.emitters = this.images.map((img, i) => new FireworkEmitter(this, img));

    this.onResize();
    this.createVars();

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

    const minRotation = 80;
    const maxRotation = 120;
    const spread = 200;
    const size = this.maxImageSize;
    const offset = size * Math.SQRT2 + 1;
    const spawnWidth = Math.min(this.spawnWidth, this.width) / 2;
    let spawnSide = 1;

    const cx = this.explodePoint.x;
    const cy = -(this.height - this.explodePoint.y);

    const randomX = gsap.utils.random(100, spawnWidth - size, true);
    const randomY = gsap.utils.random(cy - spread, cy + spread, true);
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

      let peakY, explodeY;

      if (isMain) {
        peakY = cy - drop;
        explodeY = cy;
      } else {
        peakY = randomY();
        explodeY = peakY + drop;
      }

      emitter.rotationSign = sign;
      emitter.x = isMain ? cx : (cx + randomX() * spawnSide);
      emitter.y = 0;
      emitter.y = offset;  
      emitter.y = this.height;  
      spawnSide *= -1;

      const tl = gsap.timeline({       
          paused: true,
          onStart: () => {
            emitter.play();
          }
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
        duration: 1.6,
        progress,
        ease: "none",
        onComplete: () => {
          tl.kill();
          emitter.explode();

          if (isMain) {
            this.popSound.play();
          }
        }
      });

      // this.fireworksTimeline.add(tween, isMain ? 0 : randomDelay());           
      this.fireworksTimeline.add(tween, isMain ? 0 : randomDelay());           
    });
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
  }

  fireReady() {

    this.onReady && this.onReady.call(this, this);
  }

  render() {

    const { ctx, emitters, width, height, dpr } = this;

    let aliveCount = 0;

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.globalAlpha = 1;

    // this.emitters.forEach(emitter => {
    //   ctx.drawImage(emitter.image.canvas, 0, 0)
    // })

    // ctx.drawImage(this.shapeTextures.texture, 0, 0);

    for (let i = 0; i < emitters.length; i++) {
      emitters[i].update();
      aliveCount += emitters[i].aliveCount;
    }

    if (!aliveCount) {
      this.kill();
    }  
  }
}

