(async () => {
   
  // NerdLoader

  const settings = {
    maxFireworks: Number(5), // {maxFireworks}
    maxImageSize: Number(500), // {maxImageSize}
    spawnWidth: Number(2000), // {spawnWidth}
    delayTime: Number(10), // {alertDelay}
    volume: Number(0) * 0.01, // {audioVolume}
    popVolume: Number(0) * 0.01, // {popVolume}
    fireworkType: "emotePopper", // "{fireworkType}" emotePopper, classic, none
    fireworkOrder: "ordered", // "{fireworkOrder}" random, ordered
    fireworkDelay: Number(0.6), // {fireworkDelay} a value of 0 is normal
    maskFirework: true, // {maskFirework} mask emote to a circle
    explosionType: "particle", // "{explosionType}"" particle, image  
    shellSize: Number(25), // {shellSize} only affects explosionType particle
    particleType: "orb", // "{particleType}" polygon, orb

    particleSize: Number(30), // {particleSize}
    particleSpacing: Number(15), // {particleSpacing}

    clusterParticles: true, // {clusterParticles} group extra particles in the center of image
    displayGif: false, // {displayGif}

    mainExplodeY: 330,
    explodeTime: 1.55, // timestamp when firework explodes in video 
    
    numParticles: 300,
    minPixelAlpha: 0.9, // min alpha level of pixel to be candidate for particle
    // fps: Number(60), // TODO: fps option?

    colors: [
      0xF05189, // red
      0x00CCFF, // blue
      0xA800FF, // purple
      0xFFE300, // yellow
      0x51F058, // green
    ],

    // only for development
    debug: { 
      enabled: true, // make sure this is false before releasing
      stats: true,
      particles: false,
      emitters: false,
      shapes: false,
      particleShape: "rect"
    }
  };
  
  const resources = await NerdLoader.load([
    "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.3.2/pixi.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.js",
    "https://ext-assets.streamlabs.com/users/140067/Physics2DPlugin.min.3.3.4.js",
    "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.0/howler.min.js",

    { name: "emoteSlot1", url: "images/img-08.png" }, // {emoteSlot1}
    { name: "emoteSlot2", url: "videos/fire.webm" }, // {emoteSlot2}
    { name: "emoteSlot3", url: "images/ryu.jpg" }, // {emoteSlot3}
    { name: "emoteSlot4", url: "images/beach.jpg" }, // {emoteSlot4}
    { name: "emoteSlot5", url: "images/red.png" }, // {emoteSlot5}

    { name: "launchSound1", url: "sounds/firework_launch_01.wav" },// {launchSound1}
    { name: "launchSound2", url: "sounds/firework_launch_02.wav" },// {launchSound2}
    { name: "launchSound3", url: "sounds/firework_launch_03.wav" },// {launchSound3}
    { name: "launchSound4", url: "sounds/firework_launch_01.wav" },// {launchSound4}
    { name: "launchSound5", url: "sounds/firework_launch_02.wav" },// {launchSound5}

    { name: "popSound1", url: "sounds/firework_explode_03.wav" }, // {popSound1}
    { name: "popSound2", url: "sounds/firework_explode_04.wav" }, // {popSound2}
    { name: "popSound3", url: "sounds/firework_explode_05.wav" }, // {popSound3}
    { name: "popSound4", url: "sounds/firework_explode_06.wav" }, // {popSound4}
    { name: "popSound5", url: "sounds/firework_explode_07.wav" }, // {popSound5}

    { name: "launchSound", url: "sounds/firework_launch_01.wav" },// {launchSound} for classic video?
    { name: "popSound", url: "sounds/firework_explode_07.wav" }, // {popSound} for classic video?

    { name: "backgroundVideo", target: "#vid", url: "https://uploads.twitchalerts.com/000/070/135/721/fireworks-red.webm" } // https://uploads.twitchalerts.com/000/070/135/721/fireworks-{backgroundVideo}.webm
  ]);
  
  animate();

  function animate() {

    gsap.registerPlugin(Physics2DPlugin);

    const launchSound = resources.launchSound.mute(false).volume(settings.volume);
    const popSound = resources.popSound.mute(false).volume(settings.popVolume);

    const launchSound1 = resources.launchSound1.mute(false).volume(settings.volume);
    const launchSound2 = resources.launchSound2.mute(false).volume(settings.volume);
    const launchSound3 = resources.launchSound3.mute(false).volume(settings.volume);
    const launchSound4 = resources.launchSound4.mute(false).volume(settings.volume);
    const launchSound5 = resources.launchSound5.mute(false).volume(settings.volume);

    const popSound1 = resources.popSound1.mute(false).volume(settings.popVolume);
    const popSound2 = resources.popSound2.mute(false).volume(settings.popVolume);
    const popSound3 = resources.popSound3.mute(false).volume(settings.popVolume);
    const popSound4 = resources.popSound4.mute(false).volume(settings.popVolume);
    const popSound5 = resources.popSound5.mute(false).volume(settings.popVolume);

    const backgroundVideo = resources.backgroundVideo;
    backgroundVideo.volume = settings.volume;

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
      .from("#alert-user-message", { duration: 0.4, opacity: 0, y: "-=10" }, "-=.4")
      .to("#alertHolder", { duration: 0, delay: settings.delayTime })
      .to("#alert-user-message", { duration: 0.4, opacity: 0, delay: 4, y: "-=10" }, "-=.4")
      .to("#amount", { duration: 0.4, opacity: 0, y: "+=10" }, "-=.4")
      .to("#name span", { duration: 0.2, opacity: 0 })
      .to("#name", {
        duration: 0.4,
        ease: "back.out(1.7)",
        scaleX: 0,
        delay: 0.2
      })
      .to("#bit", { duration: 0.2, opacity: 0, scale: 0, delay: 0.5 }, "-=.6");

    if (settings.displayGif) {
      tl.set("#bit", { display: "block" }, 0);
    }

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

      settings.isParticleExplosion = (settings.explosionType === "particle");
      settings.isOrbType = (settings.particleType === "orb");
      settings.canvas = document.querySelector("#canvas");
      settings.dpr = window.devicePixelRatio || 1;

      if (!settings.debug.enabled) {
        for (let key in settings.debug) {
          settings.debug[key] = false;
        }
      }

      utils.debugEnabled = settings.debug.enabled;

      const allEmotes = [
        { image: resources.emoteSlot1, launchSound: launchSound1, popSound: popSound1 },
        { image: resources.emoteSlot2, launchSound: launchSound2, popSound: popSound2 },
        { image: resources.emoteSlot3, launchSound: launchSound3, popSound: popSound3 },
        { image: resources.emoteSlot4, launchSound: launchSound4, popSound: popSound4 },
        { image: resources.emoteSlot5, launchSound: launchSound5, popSound: popSound5 },
      ].filter(emote => !!emote.image && (emote.image.naturalWidth || emote.image.videoWidth || emote.image.width));

      const emotes = [];
      const randomEmote = gsap.utils.random(allEmotes, true);
      const wrapEmote = gsap.utils.wrap(allEmotes);

      for (let i = 0; i < settings.maxFireworks; i++) {
        const image = settings.fireworkOrder === "random" ? randomEmote() : wrapEmote(i);
        emotes.push(image);
      }

      utils.time("FIREWORKS TIME");      

      const fireworks = createFireworks({
        ...settings,
        popSound,
        emotes,
        onReady(fireworks) {
          fireworks.play(tl);
          utils.timeEnd("FIREWORKS TIME");
        }
      });

    } else {
      tl.play();
    }      
  }

  function createFireworks(settings) {    
  
    return new Fireworks(settings);    
  }
})();
