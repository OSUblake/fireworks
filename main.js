(function() {
  
  const settings = {
    canvas: document.querySelector("#canvas"),
    maxImages: 20,
    maxSize: 100
  };

  const scriptUrls = [
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.3.4/gsap.min.js"
  ];

  Promise.all([
    loadImages(Array.from(document.querySelectorAll(".image"))),
    ...scriptUrls.map(src => loadScript(src))
  ])
  .then(res => animate(res[0]));

  function animate(images) {

    const fireworks = new Fireworks({
      ...settings,
      images
    });    

    fireworks.start();
  }

  function loadImages(images) {  
    return Promise.all(images.filter(validUrl).map(loadImage));
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
