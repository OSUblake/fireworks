
function createRoughEases(count = 10) {

  const eases = []
  
  for (let i = 0; i < count; i++) {

    const ease = RoughEase.config({ 
      template: "power3.out", 
      strength: 2, 
      points: 100, 
      // taper: "in", 
      randomize: true, 
      clamp: true
    });

    eases.push(ease);
  }

  return eases;
}

const randomRoughEase = gsap.utils.random(createRoughEases(), true);


class FireworkParticle extends PIXI.Sprite {

  // constructor(texture, fireworks, settings) {
  constructor(fireworks, settings) {

    super(PIXI.Texture.EMPTY);

    this.fireworks = fireworks;

    // this.renderable = false;
    // this.visible = false;

    Object.assign(this, {

      visible: false,
      renderable: false,

      alive: false,
      // alpha: 1,
      // alpha: 0,
      centered: false,
      dx: 0,
      dy: 0
    }, settings);

    // this.startAlpha

    // this.size = fireworks.particleSize;

    this.anchor.set(0.5);

    // this.blendMode = PIXI.BLEND_MODES.ADD;
    // this.blendMode = PIXI.BLEND_MODES.MULTIPLY;
    // this.blendMode = PIXI.BLEND_MODES.SCREEN;

    // this.polygonVars = {
    //   startAlpha: gsap.utils.random(0.5, 1, true),
    //   scale: gsap.utils.random(0.5, 1, true),
    //   duration: gsap.utils.random(1, 2, true),
    //   friction: gsap.utils.random(0.1, 0.3, true),
    //   gravity: 400,
    //   rotation: gsap.utils.random(45 * utils.RAD, 90 * utils.RAD, true),
    //   spread: 60,
    //   skew: gsap.utils.random(-45 * utils.RAD, 45 * utils.RAD, true),
    //   velocity: gsap.utils.random(800, 1100, true),
    // };

    this.timeline = gsap.timeline({
      paused: true,
      onComplete: this.kill,
      onUpdate: this.update,
      callbackScope: this
      // onComplete: () => {
      //   this.alive = false;
      //   this.alpha = 0;
      // }
    });
  }

  kill() {
    this.timeline.kill();
    this.alpha = 0;
    this.alive = false;    

    if (this.glow) {
      this.glow.alpha = 0;
    }

    if (this.particleContainer) {
      this.particleContainer.removeChild(this);
    }

    // if (this.parent) {
    //   this.parent.removeChild(this);

    //   if (this.glow.parent) {
    //     this.glow.parent.removeChild(this.glow)
    //   }
    // }
  }

  update() {

    if (this.proxy) {
      this.position.set(
        this.proxy.x,
        this.proxy.y + this.proxy.drop
      );
    }

    if (this.maxSize && (this.width > this.maxSize || this.height > this.maxSize)) {
      this.width = this.heihgt = this.maxSize;
      // console.log("MAX SIZE BUST")
    }

    // if (this.glow) {
    //   // this.glow.position.set(this.x, this.y);
    //   this.glow.position.copyFrom(this.position);
    // }

  }

  addGlow(container) {

    this.glow = new PIXI.Sprite(this.texture);
    this.glow.alpha = 0.75;
    this.glow.anchor.set(0.5);
    // container.addChild(this.glow, this);
    this.glow.width = this.glow.height = this.fireworks.particleSize * 0.5;
  }

  initOrb(emitterX, emitterY, emitterRotation, container) {

    const { fireworks } = this;

    // this.alpha = 1;

    this.texture = this.textureData.texture;

    const randomOffset = gsap.utils.random(-5, 5, true);
    const randomScale = gsap.utils.random(0.75, 1);
    this.alpha = gsap.utils.random(0.5, 1);

    const dx = this.dx + randomOffset();
    const dy = this.dy + randomOffset();



    // this.particleContainer = container;    
    this.rotation = Math.random() * Math.PI;  
    
    // container.addChild(this, sprite2);

    // this.width = this.height = fireworks.particleSize;
    const endSize = fireworks.particleSize * randomScale;
    this.width = this.height = endSize;
    
    // this.clampSize = gsap.utils.clamp(0, this.width);
    


    // this.glow.width = this.glow.height = fireworks.particleSize * 0.5;

    // sprite2.width = sprite2.height = 4;

    const cos = Math.cos(emitterRotation);
    const sin = Math.sin(emitterRotation);

    const endX = ((cos * dx) - (sin * dy)) + emitterX;
    const endY = ((cos * dy) + (sin * dx)) + emitterY;

    const angle = Math.atan2(endY - emitterY, endX - emitterX) * utils.DEG;

    this.x = emitterX;
    this.y = emitterY;

    // const duration = 1;

    // const speed = 100;
    // const dist = Math.sqrt(dx * dx + dy * dy);

    // const velocity = gsap.utils.mapRange(0, fireworks.maxImageSize, 0, fireworks.maxImageSize / duration, dist);

    // const velocity = 

    // const velocitySpread = gsap.utils.random(-1.01, 1.01);
    // const velocitySpread = gsap.utils.random(-10, 10);
    // const velocity = dist + velocitySpread;

    // console.log("\nVELOCIT", velocity)
    // console.log("DIST", dist)

    // this.timeline
    //   .to(this, {
    //     duration,
    //     physics2D: {
    //       angle,
    //       velocity,
    //       gravity: 100
    //     }
    //   }, 0)

    this.proxy = {
      x: this.x,
      y: this.y,
      drop: 0
    };

    // const dur = duration + gsap.utils.random(-0.3, 0.3);
    const duration = 1.5 + gsap.utils.random(-0.1, 0.1);
    // const startFizzle = gsap.utils.random(duration + 1, duration + 1.2);
    const startFizzle = gsap.utils.random(duration - 0.25, duration + 1);
    const fizzleDuration = gsap.utils.random(duration - 1, duration - 0.5);

    this.timeline
      .to(this.proxy, {
        duration,
        // duration: dur + gsap.utils.random(-0.1, 0.1),
        // x: endX + gsap.utils.random(-5, 5),
        // y: endY + gsap.utils.random(-5, 5),
        x: endX,
        y: endY,
        ease: "power2"
      }, 0)
      // .to(this.proxy, {
      //   duration: duration * 3,
      //   drop: "random(100, 150)",
      //   ease: "sine.in"
      // }, 0)
      // .to(this, {
      //   duration: duration,
      //   width: endSize,
      //   height: endSize
      // }, 0)

      // .to(this, {
      //   duration,
      //   width: endSize,
      //   height: endSize,
      //   ease: randomRoughEase(),
      // }, 0)
      .to(this, {
        width: 0,
        height: 0,
        alpha: 0.5,
        duration: fizzleDuration,
        onComplete: () => this.kill(),
        ease: randomRoughEase(),
      }, startFizzle)

      this.timeline.to(this.proxy, {
        duration: this.timeline.duration(),
        // drop: "random(100, 150)",
        drop: "random(50, 60)",
        ease: "sine.in"
      }, 0);

      // .to(this, {
      //   duration: dur,
      //   ease: "none",
      //   physics2D: {
      //     angle,
      //     // friction: 0.1,
      //     // friction: "random(0.01, 0.015)",
      //     // friction: frictionValue,
      //     velocity,
      //     gravity: 150
      //   }
      // }, 0)
      // .to(this, {
      //   // alpha: 0,
      //   // onComplete: () => this.kill(),
      //   ease: randomEase(),
      //   duration: dur * 2
      // }, gsap.utils.random(dur, dur + 0.5))
      

    

    this.timeline.progress(1, true).progress(0, true);
  }

  initPolygon(emitterX, emitterY, emitterRotation, container) {

    const { dx, dy, fireworks } = this;

    this.texture = this.textureData.texture;

    // const {
    //   duration,
    //   friction,
    //   gravity,
    //   scale,
    //   skew,
    //   spread,
    //   startAlpha,
    //   rotation,
    //   velocity
    // } = fireworks.polygonVars;

    const startAlpha = gsap.utils.random(0.5, 1, true);
    const scale = gsap.utils.random(0.5, 1, true);
    const duration = gsap.utils.random(1, 2, true);
    const friction = gsap.utils.random(0.1, 0.3, true);
    const gravity = 400;
    const rotation = gsap.utils.random(45 * utils.RAD, 90 * utils.RAD, true);
    const spread = 60;
    const skew = gsap.utils.random(-45 * utils.RAD, 45 * utils.RAD, true);
    const velocity = gsap.utils.random(800, 1100, true);

    this.particleContainer = container;

    if (fireworks.isOrbType) {
      // this.addGlow(container);
    }

    // this.width = this.height = fireworks.particleSize;
    
    if (fireworks.debug.particles) {
      this.rotation = emitterRotation;
    } else {
      this.rotation = Math.random() * Math.PI;    
      this.startAlpha = startAlpha();
      this.width = this.height = this.width * scale();
    }

    // this.rotation = Math.random() * Math.PI;    
    // this.startAlpha = startAlpha();
    // this.scale.x = this.scale.y = scale();


    // this.skew.x = skew();
    // this.skew.y = skew();

    let angle = 0;
    let minAngle = 0;
    let maxAngle = 360;
    let frictionValue = friction();

    frictionValue = utils.randomChoice(Math.min(frictionValue * 2, 0.8), frictionValue, 0.3);

    const cos = Math.cos(emitterRotation);
    const sin = Math.sin(emitterRotation);

    this.x = ((cos * dx) - (sin * dy)) + emitterX;
    this.y = ((cos * dy) + (sin * dx)) + emitterY;

    angle = Math.atan2(this.y - emitterY, this.x - emitterX) * utils.DEG;
    minAngle = angle - spread;
    maxAngle = angle + spread;

    if (fireworks.clusterParticles && this.centered) {

      this.x = emitterX;
      this.y = emitterY;

      angle = 0;
      minAngle = 0;
      maxAngle = 360;
    }

    // this.alpha = 0;

    this.timeline
      // .add(() => this.alive = true, 0)
      // .set(this, { 
      //   alpha: this.startAlpha,
      //   immediateRender: false, 
      // }, 0)
      .to(this, {
        duration,
        alpha: 0,
        rotation: "+=" + rotation()
        // rotation: Math.random() * Math.PI,
        // onComplete: () => this.kill()
      }, 0.2)


      .to(this.scale, {
        duration,
        x: 0,
        y: 0
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

      if (this.glow) {
        this.timeline.to(this.glow, {
          alpha: 0,
          duration
        }, 0.2)
      }

      // TODO: Waiting on Jack to fix this
      // this.timeline.progress(1, true).progress(0, true);

      // this.timeline.timeScale(0.05)
  }

  play() {
    // if (!this.timeline) {
    //   console.log("*** No particle timeline");
    //   return;
    // }

    

    this.alive = true;
    // this.alpha = this.startAlpha;
    this.timeline.play();

    if (this.particleContainer) {
      
      // if (this.glow) {
      //   this.particleContainer.addChild(this.glow);
      //   // this.addChild(this.glow);
      // } 

      this.particleContainer.addChild(this);
    }
  }
}

// FireworkParticle.polygonVars = {
//   startAlpha: gsap.utils.random(0.5, 1, true),
//   scale: gsap.utils.random(0.5, 1, true),
//   duration: gsap.utils.random(1, 2, true),
//   friction: gsap.utils.random(0.1, 0.3, true),
//   gravity: 400,
//   rotation: gsap.utils.random(45 * utils.RAD, 90 * utils.RAD, true),
//   spread: 60,
//   skew: gsap.utils.random(-45 * utils.RAD, 45 * utils.RAD, true),
//   velocity: gsap.utils.random(800, 1100, true),
// };
