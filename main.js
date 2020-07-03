(function() {
  
  const settings = {
    canvas: document.querySelector("#canvas"),
    maxFireworks: 20,
    maxImageSize: 600,
    particleSize: 20,
    numParticles: 300,
    spawnWidth: 2000, 
  };

  const imageElements = Array.from(document.querySelectorAll(".image"));
  const name = document.querySelector("#name");

  const scriptUrls = [
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.3.4/gsap.min.js",
    "scripts/Physics2DPlugin.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.0/howler.min.js"
  ];

  const soundUrls = [
    "sounds/build_up.mp3",
    "sounds/main_and_side_pops.mp3"
  ];

  Promise.all(scriptUrls.map(src => loadScript(src)))
    .then(() => Promise.all([
      Promise.all(imageElements.filter(validUrl).map(loadImage)),
      Promise.all(soundUrls.map(loadSound))
    ]))
    .then(res => animate(res));

  function animate([images, sounds]) {

    gsap.registerPlugin(Physics2DPlugin);

    const launchSound = sounds[0];
    const popSound = sounds[1];

    const rect = name.getBoundingClientRect();
    const explodePoint = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height
    };

    const alertTimeline = gsap.timeline({ paused: true })
      .set("#wrap", { opacity: 1 })
      .from("#bit", {duration: 0.2, opacity: 0, scale: 0 })
      .from("#name", {
        duration: 0.6,
        ease: Back.easeOut.config(1.7),
        scaleX: 0,
        delay: 0.0
      })
      .from("#name span", { duration: 0.2, opacity: 0 })
      .from("#amount", { duration: 0.4, opacity: 0, y: "+=10" }, "-=.4")
      .from("#alert-user-message ", { duration: 0.4, opacity: 0, y: "-=10" }, "-=.4")
      .to("#notification", { duration: 0, delay: 1 })
      .to("#alert-user-message", { duration: 0.4, opacity: 0, delay: 7, y: "-=10" }, "-=.4")
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

    const fireworks = new Fireworks({
      ...settings,
      alertTimeline,
      explodePoint,
      images,
      launchSound,
      popSound
    });    

    fireworks.play();
  }

  function loadSound(url) {
    return new Promise((resolve, reject) => {

      const sound = new Howl({
        src: [url],
        autoplay: false,
        onloaderror: () => resolve(sound),
        onload: () => resolve(sound)
      });
    });
  }
  
  function loadImage(image) {
    return new Promise((resolve, reject) => {
  
      if (image.complete) {
        resolve(image);
      }
  
      image.onload = () => resolve(image);
      image.onerror = () => resolve(image);
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
  
  function validUrl(image) {
    return String(image.src).match(/\.(jpeg|jpg|gif|png|svg|webp)$/);
  }
})();
