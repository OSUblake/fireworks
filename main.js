(async () => {
   
  // NerdLoader


  const settings = {
    canvas: document.querySelector("#canvas"),
    maxFireworks: Number(5), // {maxFireworks}
    maxImageSize: Number(90), // {maxImageSize}
    spawnWidth: Number(2000), // {spawnWidth}
    delayTime: Number(10), // {alertDelay}
    volume: Number(0) * 0.01, // {audioVolume}
    popVolume: Number(0) * 0.01, // {popVolume}
    fireworkType: "emotePopper", // "{fireworkType}" emotePopper, classic, none
    fireworkOrder: "ordered", // "{fireworkOrder}" random, ordered
    fireworkDelay: Number(0.6), // {fireworkDelay} a value of 0 is normal
    explosionType: "image", // {explosionType} particle, image  
    shellSize: Number(25), // {shellSize}
    // cropExplosion: "circle", // {cropExplosion} none, circle
    maskFirework: "true", // {maskFirework} true, false dropdown, mask emote to a circle
    // particleSize: 30,
    // imageTypeSize: 30,
    // particleTypeSize: 5,
    numParticles: 300,
    mainExplodeY: 330,
    explodeTime: 1.55, // time when firework explodes in video 
    minTrailParticleSize: 10, 
    maxTrailParticleSize: 30,
    minImageSizeSlider: 10, // based on maxImageSize slider 
    maxImageSizeSlider: 1000, // based on maxImageSize slider
    clusterParticles: true, // group extra particles in the center of image

    // debug: true, // dev mode
    // debugParticles: true, // dev stuff

    // polygonSize: 30,
    // polygonSpacing: 15,

    // orbSize: 10,
    // orbSpacing: 20,

    particleSize: 30,
    particleSpacing: 30,



    // cropExplosion: false,

    debug: { // only for development
      stats: true,
      particles: true,
      emitters: true,
      shapes: true,
      particleShape: "rect"
    },

    // fps: Number(60),
    minPixelAlpha: 0.9,

    // particleSize: 15,
    

    colors: [
      0xF05189, // red
      0x00CCFF, // blue
      0xA800FF, // purple
      0xFFE300, // yellow
      0x51F058, // green
    ]
  };
  
  if (Boolean(true)) { // {displayGif}
  	// document.getElementById("bit").style.display = "block";
  }

  const resources = await NerdLoader.load([
    // "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.3.2/pixi.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.js",
    // "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/PixiPlugin.min.js",
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

      settings.isParticleExplosion = (settings.explosionType === "particle");

      // TODO: need to check for explosion type?
      settings.maskFirework = (settings.maskFirework === "true");

      console.time("FIREWORKS");      

      const fireworks = createFireworks({
        ...settings,
        popSound,
        emotes,
        onReady(fireworks) {
          fireworks.play(tl);

          console.timeEnd("FIREWORKS");
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
