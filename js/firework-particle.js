
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


var id = 0;


class FireworkParticle extends PIXI.Sprite {

  // constructor(texture, fireworks, settings) {
  constructor(fireworks, settings) {

    super(PIXI.Texture.EMPTY);

    this.fireworks = fireworks;

    this.tempID = id++;

    // this.renderable = false;
    // this.visible = false;

    Object.assign(this, {

      // visible: false,
      // renderable: false,

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

    this.timeline = gsap.timeline({
      paused: true,
      onComplete: this.kill,
      // onUpdate: this.update,
      callbackScope: this
    });

    this.tweens = [];
  }

  kill() {

    this.timeline.pause().kill();
    this.timeline.vars.onUpdate = null;
    
    this.alpha = 0;
    this.alive = false;  
    
    this.timeline = null;
    this.textureData = null;

    // this.destroy();

    // this.particleContainer.removeChild(this);
  }

  update() {

    // this.x += 1;
    // this.x *= 0.97;

    // this.y += 1;
    // this.y *= 0.97;

    if (this.proxy) {
    // if (false) {
      this.position.set(
        this.proxy.x,
        this.proxy.y + this.proxy.drop
      );
    }

    if (this.maxSize && (this.width > this.maxSize || this.height > this.maxSize)) {
      this.width = this.heihgt = this.maxSize;
    }
  }

  initOrb(emitterX, emitterY, emitterRotation) {

    const { fireworks } = this;

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
    
    const cos = Math.cos(emitterRotation);
    const sin = Math.sin(emitterRotation);

    const endX = ((cos * dx) - (sin * dy)) + emitterX;
    const endY = ((cos * dy) + (sin * dx)) + emitterY;

    const angle = Math.atan2(endY - emitterY, endX - emitterX) * utils.DEG;

    this.x = emitterX;
    this.y = emitterY;

    this.proxy = {
      x: this.x,
      y: this.y,
      drop: 0
    };

    const duration = 1.5 + gsap.utils.random(-0.1, 0.1);
    const startFizzle = gsap.utils.random(duration - 0.25, duration + 1);
    const fizzleDuration = gsap.utils.random(duration - 1, duration - 0.5);

    this.timeline
      .to(this.proxy, {
        duration,
        x: endX,
        y: endY,
        ease: "power2"
      }, 0)
      .to(this, {
        width: 0,
        height: 0,
        alpha: 0.5,
        duration: fizzleDuration,
        // onComplete: () => this.kill(),
        ease: randomRoughEase(),
      }, startFizzle)

      this.timeline.to(this.proxy, {
        duration: this.timeline.duration(),
        // drop: "random(100, 150)",
        drop: "random(50, 60)",
        ease: "sine.in"
      }, 0);

    this.timeline.progress(1, true).progress(0, true);
  }

  initPolygon(emitterX, emitterY, emitterRotation) {

    const { dx, dy, fireworks } = this;

    this.texture = this.textureData.texture;

    const startAlpha = gsap.utils.random(0.5, 1, true);
    const scale = gsap.utils.random(0.5, 1, true);
    const duration = gsap.utils.random(1, 2, true);
    const friction = gsap.utils.random(0.1, 0.3, true);
    const gravity = 400;
    const rotation = gsap.utils.random(45 * utils.RAD, 90 * utils.RAD, true);
    const spread = 60;
    const skew = gsap.utils.random(-45 * utils.RAD, 45 * utils.RAD, true);
    const velocity = gsap.utils.random(800, 1100, true);
    
    if (fireworks.debug.particles) {
      this.rotation = emitterRotation;
    } else {
      this.rotation = Math.random() * Math.PI;    
      this.startAlpha = startAlpha();
      this.width = this.height = this.width * scale();
    }

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
      .to(this, {
        duration,
        alpha: 0,
        rotation: "+=" + rotation()
      }, 0.2)


      .to(this.scale, {
        duration,
        x: 0,
        y: 0,
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

      // this.timeline.progress(1, true).progress(0, true);
      this.timeline.pause(0.000001)
  }

  play() {

    this.particleContainer.addChild(this);    

    this.alive = true;
    this.timeline.play();
  }
}
