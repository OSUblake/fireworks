(function() {
  
  const settings = {
    canvas: document.querySelector("#canvas"),
    maxFireworks: Number(3), // {maxFireworks}
    maxImageSize: Number(1000), // {maxImageSize}
    spawnWidth: Number(2000), // {spawnWidth}
    delayTime: Number(10), // {alertDelay}
    volume: Number(100) * 0.01, // {audioVolume}
    fireworkType: "emotePopper", // {fireworkType} emotePopper, classic, none
    particleSize: 30,
    numParticles: 300,
    mainExplodeY: 330,
    explodeTime: 1.6, // time when firework explodes in video 
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

  const nameElement = document.querySelector("#name");
  const backgroundVideo = document.querySelector("#vid");

  const scriptUrls = [
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.3.4/gsap.min.js",
    "scripts/Physics2DPlugin.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.0/howler.min.js"
  ];

  const soundUrls = [
    "sounds/fireworks-build-up.mp3", // {launchSound}
    "sounds/main_and_side_pops.mp3" // {popSound}
  ];

  let emoteSlots = [
    "videos/fire.webm", // {emotSlot1},
    "images/img-09.png", // {emotSlot2},
    "images/gsap-hero.svg", // {emotSlot3},
    "images/img-02.png", // {emotSlot4},
    "images/ryu.jpg", // {emotSlot5},
  ];

  emoteSlots = [...emoteSlots, ...emoteSlots];  

  Promise.all(scriptUrls.map(src => loadScript(src)))
    .then(() => Promise.all([
      loadAssets(emoteSlots),
      Promise.all(soundUrls.map(loadSound)),
      loadMedia(backgroundVideo)
    ]))
    .then(res => animate(res));

  function animate([images, sounds]) {

    gsap.registerPlugin(Physics2DPlugin);

    Howler.volume(settings.volume);

    const launchSound = sounds[0].mute(false);
    const popSound = sounds[1].mute(false);

    const rect = nameElement.getBoundingClientRect();
    const explodePoint = {
      x: rect.left + rect.width / 2,
      // y: rect.top + rect.height
      y: 330
    };

    const tl = gsap.timeline({ paused: true })
      .set("#content", {opacity: 1})
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
      .to("#notification", { duration: 0, delay: settings.delayTime })
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
      .to("#notification-center", { duration: 0, delay: 5, opacity: 0 });


    if (settings.fireworkType === "classic") {

      tl.add(() => {
        gsap.set(backgroundVideo, { display: "block" });
        backgroundVideo.play();
        launchSound.play();
      }, 0)
      .add(() => {
        popSound.play();
      }, 1.6)
      .play();

    } else if (settings.fireworkType === "emotePopper") {

      const fireworks = new Fireworks({
        ...settings,
        explodePoint,
        images,
        launchSound,
        popSound,
        alertTimeline: tl,
        onReady(fireworks) {
          fireworks.play();

          // gsap.set(backgroundVideo, { display: "block" });
          // backgroundVideo.play();
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
      mediaElement.src = media;
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
      imageElement.src = image;
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
})();
