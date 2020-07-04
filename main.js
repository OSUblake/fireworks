(function() {
  
  const settings = {
    canvas: document.querySelector("#canvas"),
    maxFireworks: Number(3), // {maxFireworks}
    maxImageSize: Number(100), // {maxImageSize}
    spawnWidth: Number(2000), // {spawnWidth}
    delayTime: Number(10), // {alertDelay}
    volume: Number(100) * 0.01, // {audioVolume}
    fireworkType: "emotePopper", // "{fireworkType}" emotePopper, classic, none
    particleSize: 30,
    numParticles: 300,
    mainExplodeY: 330,
    explodeTime: 1.55, // time when firework explodes in video 
    minTrailParticleSize: 10, 
    maxTrailParticleSize: 30,
    minImageSizeSlider: 10, // based on maxImageSize slider 
    maxImageSizeSlider: 1000, // based on maxImageSize slider
    clusterParticles: true, // group extra particles in the center of image
    colors: [
      "#F05189", // red
      "#00CCFF", // blue
      "#A800FF", // purple
      "#FFE300", // yellow
      "#51F058", // green
    ]
  };
  
  if (Boolean(true)) { // {displayGif}
  	document.getElementById("bit").style.display = "block";
  }

  const soundUrls = [
    "sounds/fireworks-build-up.mp3", // {launchSound}
    "sounds/main_and_side_pops.mp3" // {popSound}
  ];

  let emoteSlots = [
    "https://uploads.twitchalerts.com/000/070/135/721/100-bit.png", // "{emotSlot1}",
    "https://uploads.twitchalerts.com/000/070/135/721/fire-HZa.webm", // "{emotSlot2}",
    "https://uploads.twitchalerts.com/000/070/135/721/fire-HZa.webm", // "{emotSlot2}",
    "https://uploads.twitchalerts.com/000/070/135/721/fire-HZa.webm", // "{emotSlot2}",
    "https://uploads.twitchalerts.com/000/070/135/721/fire-HZa.webm", // "{emotSlot2}",
    "images/gsap-hero.svg", // "{emotSlot3}",
    "images/img-02.png", // "{emotSlot4}",
    "images/ryu.jpg", // "{emotSlot5}",
  ];

  const scriptUrls = [
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.3.4/gsap.min.js",
    "scripts/Physics2DPlugin.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.0/howler.min.js"
  ];
  
  const RAD = Math.PI / 180;
  const DEG = 180 / Math.PI;

  const backgroundVideo = document.querySelector("#vid");

  emoteSlots = [...emoteSlots, ...emoteSlots];  

  Promise.all(scriptUrls.map(src => loadScript(src)))
    .then(() => Promise.all([
      loadAssets(emoteSlots),
      Promise.all(soundUrls.map(loadSound)),
      loadMedia(backgroundVideo, true)
    ]))
    .then(res => animate(res));

  function animate([images, sounds]) {

    gsap.registerPlugin(Physics2DPlugin);

    Howler.volume(settings.volume);

    const launchSound = sounds[0].mute(false);
    const popSound = sounds[1].mute(false);

    const tl = gsap.timeline({ paused: true })
      .set("#alertHolder", {opacity: 1})
      .from("#bit", {duration: 0.2, opacity: 0, scale: 0, delay: 1.6 })
      .from("#name", {
        duration: 0.6,
        ease: "back.out(1.7)",
        scaleX: 0,
        delay: 0.0
      })
      .from("#name span", { duration: 0.2, opacity: 0 })
      .from("#amount", { duration: 0.4, opacity: 0, y: "+=10" }, "-=.4")
      .from("#message", { duration: 0.4, opacity: 0, y: "-=10" }, "-=.4")
      .to("#alertHolder", { duration: 0, delay: settings.delayTime })
      .to("#message", { duration: 0.4, opacity: 0, delay: 4, y: "-=10" }, "-=.4")
      .to("#amount", { duration: 0.4, opacity: 0, y: "+=10" }, "-=.4")
      .to("#name span", { duration: 0.2, opacity: 0 })
      .to("#name", {
        duration: 0.4,
        ease: "back.out(1.7)",
        scaleX: 0,
        delay: 0.2
      })
      .to("#bit", { duration: 0.2, opacity: 0, scale: 0, delay: 0.5 }, "-=.6")
      .to("#alertHolder", { duration: 0, opacity: 0 });

    if (settings.fireworkType === "classic") {

      tl.add(() => {
        gsap.set(backgroundVideo, { display: "block" });
        backgroundVideo.play();
        launchSound.play();
      }, 0)
      .add(() => popSound.play(), 1.55)
      .add(() => popSound.play(), 1.75)
      .add(() => popSound.play(), 1.83)
      .play();

    } else if (settings.fireworkType === "emotePopper") {

      const fireworks = new Fireworks({
        ...settings,
        images,
        popSound,
        onReady(fireworks) {
          fireworks.play();
          launchSound.play();
          tl.play();
        }
      });

    } else {
      tl.play();
    }      
  }

  function loadAssets(assets) {

    const promises = assets.reduce((res, asset) => {

      let promise;
      
      if (imageUrl(asset)) {
        promise = loadImage(asset);   
      } else if (videoUrl(asset)) {
        promise = loadMedia(asset);
      }

      if (promise) {
        res.push(promise);
      }

      return res;
    }, []);    

    return Promise.all(promises);
  }

  function loadSound(url) {
    return new Promise((resolve, reject) => {

      const sound = new Howl({
        src: url,
        autoplay: false,
        mute: true,
        onloaderror: () => resolve(sound),
        onload: () => resolve(sound)
      });
    });
  }
  
  function loadMedia(media) {

    let mediaElement = media;

    if (typeof media === "string") {
      mediaElement = document.createElement("video");
      mediaElement.muted = true;
      mediaElement.crossOrigin = "Anonymous";
      mediaElement.src = media + `?v=${Date.now() + Math.floor(Math.random() * 10000000000)}`;
    }

    return new Promise((resolve, reject) => {

      if (mediaElement.readyState > 3) {
        resolve(mediaElement);
      } else {
        mediaElement.oncanplaythrough = fulfill;
        mediaElement.onerror = fulfill;
      } 

      function fulfill() {
        mediaElement.oncanplaythrough = null;
        mediaElement.onerror = null;
        resolve(mediaElement);
      }
    });    
  }

  function loadImage(image) {

    let imageElement = image;

    if (typeof image === "string") {
      imageElement = new Image();
      imageElement.crossOrigin = "Anonymous";
      imageElement.src = image + `?v=${Date.now() + Math.floor(Math.random() * 10000000000)}`;
    }

    return new Promise((resolve, reject) => {   

      if (imageElement.complete) {
        resolve(imageElement);
      } else {
        imageElement.onload = fulfill;
        imageElement.onerror = fulfill;
      }      

      function fulfill() {
        imageElement.onload = null;
        imageElement.onerror = null;
        resolve(imageElement);
      }
    });
  }
  
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      document.head.appendChild(script);
  
      script.onerror = reject;
      script.onload = resolve;
      script.src = src;
    });
  }

  function videoUrl(image) {
    return image.match(/\.(3gp|mpg|mpeg|mp4|m4v|m4p|ogv|ogg|mov|webm)$/);
  }

  function imageUrl(image) {
    return image.match(/\.(jpeg|jpg|gif|png|svg|webp)$/);
  }

  function randomChoice(a, b, chance = 0.5) {
    return Math.random() < chance ? a : b;
  }

  class DisplayObject {

    constructor(fireworks) {
  
      this.fireworks = fireworks;
  
      this.originX = 0;
      this.originY = 0;
      this.scaleX = 1;
      this.scaleY = 1;
      this.skewX = 0;
      this.skewY = 0;
      this.rotation = 0;
      this.x = 0;
      this.y = 0;
    }
  
    setTransform() {
  
      const { fireworks, originX, originY, rotation, scaleX, scaleY, skewX, skewY, x, y } = this;
      const { ctx, dpr, offsetY } = fireworks;
  
      let x1 = x - originX;
      let y1 = offsetY + (y - originY);
  
      const a =  Math.cos(rotation + skewY) * scaleX;
      const b =  Math.sin(rotation + skewY) * scaleX;
      const c = -Math.sin(rotation - skewX) * scaleY;
      const d =  Math.cos(rotation - skewX) * scaleY;         
      const e = x1 + originX - (originX * a + originY * c);
      const f = y1 + originY - (originX * b + originY * d);
  
      ctx.setTransform(
        a * dpr,
        b * dpr,
        c * dpr,
        d * dpr,
        e * dpr,
        f * dpr,
      );
    }
  }

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
      
      this.images = this.images.filter(img => img && (img.naturalWidth || img.videoWidth || img.width));
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
          delay = randomDelay();
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
            emitter.init();
            explodeTime = currentTime;
            break;
          }
        }
  
        tl.progress(0, true);
  
        const progress = explodeTime / tl.duration();
  
        const tweener = gsap.to(tl, {
          duration: this.explodeTime,
          progress,
          ease: "none",
          onStart: () => {
            emitter.play();
          },
          onComplete: () => {
            tl.kill();
            emitter.explode();
            this.popSound.play();
          }
        });
  
        this.createTrailParticles({
          emitter,
          startY: emitter.y,
          endY: explodeY,
          isMain,
          delay
        });
           
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
  
        this.fireworksTimeline.add(tweener, delay);
  
        this.trailParticles.push(particle);
      }
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
      gsap.ticker.add(this.render);  
    }
  
    kill() {
      gsap.ticker.remove(this.render);
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
  
      ctx.imageSmoothingEnabled = false;
      // ctx.imageSmoothingQuality = "high";
  
      for (i = 0; i < trailParticles.length; i++) {
        const particle = trailParticles[i];
  
        if (particle.alive) {
          particle.render();
          aliveCount++;
        }
      }
  
      ctx.imageSmoothingEnabled = true;
  
      for (i = 0; i < emitters.length; i++) {
        emitters[i].update();
        aliveCount += emitters[i].aliveCount;
      }
  
      if (!aliveCount) {
        this.kill();
      }  
    }
  }
  
  class FireworkParticle extends DisplayObject {

    constructor(fireworks, settings) {
  
      super(fireworks);
  
      Object.assign(this, {
        alive: false,
        alpha: 1,
        centered: false,
        dx: 0,
        dy: 0
      }, settings);
  
      this.size = fireworks.particleSize;
      this.originX = this.size / 2;
      this.originY = this.size / 2;
    }
  
    init(cx, cy, currentRotation) {
  
      const { dx, dy, fireworks } = this;
  
      const {
        duration,
        friction,
        gravity,
        scale,
        skew,
        spread,
        startAlpha,
        rotation,
        velocity
      } = fireworks.particleVars;
  
      this.rotation = Math.random() * Math.PI;    
      this.alpha = startAlpha();
      this.scaleX = this.scaleY = scale();
      this.skewX = skew();
      this.skewY = skew();
  
      let angle = 0;
      let minAngle = 0;
      let maxAngle = 360;
      let frictionValue = friction();
  
      frictionValue = randomChoice(Math.min(frictionValue * 2, 0.8), frictionValue, 0.3);
  
      const cos = Math.cos(currentRotation);
      const sin = Math.sin(currentRotation);
  
      this.x = ((cos * dx) - (sin * dy)) + cx;
      this.y = ((cos * dy) + (sin * dx)) + cy;
  
      angle = Math.atan2(this.y - cy, this.x - cx) * DEG;
      minAngle = angle - spread;
      maxAngle = angle + spread;
  
      if (fireworks.clusterParticles && this.centered) {
  
        this.x = cx;
        this.y = cy;
  
        angle = 0;
        minAngle = 0;
        maxAngle = 360;
      }
  
      this.timeline = gsap.timeline({
          paused: true
        })
        .to(this, {
          duration,
          alpha: 0,
          onComplete: () => this.kill()
        }, 0.2)
        .to(this, {
          duration,
          scaleX: 0,
          scaleY: 0
        }, 0)   
        .to(this, {
          duration,
          physics2D: {
            angle: gsap.utils.random(minAngle, maxAngle),
            friction: frictionValue,
            velocity,
            gravity
          }
        }, 0);
    }
  
    play() {
      if (!this.timeline) {
        console.log("*** No particle timeline");
        return;
      }
  
      this.alive = true;
      this.timeline.play();
    }
  
    kill() {
      this.timeline.kill();
      this.alive = false;
    }
  
    render() {
  
      if (!this.alpha || (!this.scaleX && !this.scaleY)) {
        return;
      }
  
      const { fireworks, frame } = this;
      const ctx = fireworks.ctx;
  
      this.setTransform();
      
      ctx.globalAlpha = this.alpha;
      ctx.drawImage(
        frame.texture,
        frame.sx,
        frame.sy,
        frame.sSize,
        frame.sSize,
        0,
        0,
        frame.dSize,
        frame.dSize
      );
    }
  }
  
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
  
      const ctx = this.fireworks.ctx;
  
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
  
      if (!alive) {
        image.pause();
      }
    }
  }

  class FireworkImage extends DisplayObject {

    constructor(fireworks, image) {
  
      super(fireworks);
  
      this.origImage = image;
      this.texture = image;
  
      this.isVideo = image instanceof HTMLMediaElement;
  
      this.baseWidth = image.naturalWidth || image.videoWidth || image.width;
      this.baseHeight = image.naturalHeight || image.videoHeight || image.height;
  
      const maxSize = this.fireworks.maxImageSize;
      let ratio = 1;
  
      if (this.baseWidth > maxSize) {
        ratio = maxSize / this.baseWidth;
      } else if (this.baseHeight > maxSize) {
        ratio = maxSize / this.baseHeight;
      }
  
      this.width = Math.floor(this.baseWidth * ratio);
      this.height = Math.floor(this.baseHeight * ratio);
      this.originX = this.width / 2;
      this.originY = this.height / 2;
    }
  
    init() {
      
      const texture = this.texture;
  
      return new Promise(resolve => {

        if (!texture) {
          resolve();
        }
  
        if (!this.isVideo) {
  
          this.resizeImage();
          resolve();
  
        } else {
  
          const fulfill = () => {
            texture.removeEventListener("timeupdate", fulfill);          
            this.resizeImage();
            resolve();
          }
  
          // needed to get the first frame to render
          texture.addEventListener("timeupdate", fulfill);
          texture.currentTime = texture.duration * 0.5;
        }
      });
    }
  
    resizeImage() {
  
      const image = this.texture;
  
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
  
      canvas.width = this.width;
      canvas.height = this.height;
  
      ctx.drawImage(image, 0, 0, this.baseWidth, this.baseHeight, 0, 0, this.width, this.height);
      this.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data; 
    }
  
    play() {
      if (this.isVideo) {
        this.texture.currentTime = 0;
        this.texture.play();
      }    
    }
  
    pause() {
      if (this.isVideo) {
        this.texture.pause();
      }    
    }
  
    getColor(x = 0, y = 0) {
  
      const i = (y * this.width + x) * 4;
  
      if (!this.imageData[i]) {
        return {
          r: 0,
          g: 0,
          b: 0,
          a: 0
        };
      }
  
      return {
        r: this.imageData[i],
        g: this.imageData[i+1],
        b: this.imageData[i+2],
        a: this.imageData[i+3] / 255,
      };
    }
  
    render() {
  
      const ctx = this.fireworks.ctx;
  
      this.setTransform();
      ctx.globalAlpha = 1;
  
      ctx.drawImage(
        this.texture,
        0,
        0,
        this.baseWidth,
        this.baseHeight,
        0,
        0,
        this.width,
        this.height
      );
    }
  }
  
  class ShapeTextures {

    constructor(fireworks) {
  
      this.fireworks = fireworks;
      this.particleSize = fireworks.particleSize;
  
      this.shapes = {};
      this.numShapes = 0;
  
      this.texture = document.createElement("canvas");
      this.pad = 0;
  
      const particleSize = this.particleSize;
      const size = this.size = particleSize + this.pad;
  
      this.width = 1000;
      this.cols = Math.floor(this.width / size);
      this.rows = 1;
  
      const p1 = new Path2D();
      p1.rect(this.pad, this.pad, particleSize, particleSize);
      
      const p2 = new Path2D();
      p2.moveTo(this.pad + particleSize / 2, this.pad);
      p2.lineTo(size, size);
      p2.lineTo(this.pad, size);
      p2.closePath();
      
      this.rectPath = p1;
      this.trianglePath = p2;
    }
  
    addColor(color) {
  
      const key1 = color + "-rect";
      const key2 = color + "-triangle";
  
      if (this.shapes[key1]) {
        return this;
      }
  
      this.shapes[key1] = this.addFrame(color, this.rectPath);
      this.shapes[key2] = this.addFrame(color, this.trianglePath);;
    }
  
    addFrame(color, path) {
  
      const dpr = this.fireworks.dpr;
  
      const size = this.size;
      const rows = Math.floor(this.numShapes / this.cols);
      let x = ((this.numShapes * size) % (this.cols * size));
      let y = rows * size;
      this.rows = rows + 1;
  
      const frame = {
        color,
        x: x, 
        y: y, 
        path, 
        sSize: this.particleSize * dpr,
        dSize: this.particleSize,
        sx: x * dpr,
        sy: y * dpr,
        texture: this.texture
      };
  
      this.numShapes++;
  
      return frame;
    }
  
    getFrame(color, shape = "rect") {
      return this.shapes[`${color}-${shape}`];
    }
  
    generate() {
  
      const dpr = this.fireworks.dpr;
  
      this.height = this.rows * this.size;
      
      this.texture.width = this.width * dpr;
      this.texture.height = this.rows * this.size * dpr;
      
      const ctx = this.texture.getContext("2d");
      
      for (const [key, frame] of Object.entries(this.shapes)) {
        
        ctx.setTransform(
          dpr, 
          0, 
          0, 
          dpr, 
          frame.x * dpr, 
          frame.y * dpr
        );
  
        ctx.fillStyle = frame.color;
        ctx.fill(frame.path);
  
        ctx.fillStyle = "rgba(0,0,0,0)";
        ctx.fillRect(0, 0, this.width, this.height);
      }
    }
  }
})();
