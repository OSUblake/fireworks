class NerdLoader {

  constructor() {
    this.scriptElements = Array.from(document.querySelectorAll("script"));
    this.mediaElements = Array.from(document.querySelectorAll("video, audio"));
  }

  async load(resources) {

    await Promise.all(resources.scripts.map(url => this.loadScript(url)));

    // kill any previous running animations
    gsap.globalTimeline.getChildren().forEach(animation => animation.kill());    

    const emoteUrls = resources.emotes.filter(url => !!url);

    const [emotes, sounds] = await Promise.all([
      this.loadAssets([...emoteUrls, ...emoteUrls]),
      Promise.all(resources.sounds.map(url => this.loadSound(url))),
      Promise.all(this.mediaElements.map(element => this.loadMedia(element.currentSrc, element)))
    ]);

    return { emotes, sounds };
  }

  loadAssets(assets) {

    const promises = assets.reduce((res, asset) => {

      let promise;
      
      if (this.imageUrl(asset)) {
        promise = this.loadImage(asset);   
      } else if (this.videoUrl(asset)) {
        promise = this.loadMedia(asset);
      }

      if (promise) {
        res.push(promise);
      }

      return res;
    }, []);    

    return Promise.all(promises);
  }

  loadImage(url) {
    return new Promise(async (resolve, reject) => {   

      const cachedUrl = await this.checkCache(url);

      const imageElement = new Image();
      imageElement.crossOrigin = "Anonymous";
      imageElement.src = cachedUrl;

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

  loadMedia(url, element) {
    return new Promise(async (resolve, reject) => {

      const cachedUrl = await this.checkCache(url);

      const mediaElement = element || document.createElement("video");

      mediaElement.muted = true;
      mediaElement.crossOrigin = "Anonymous";
      mediaElement.src = cachedUrl;

      if (mediaElement.readyState > 3) {
        resolve(mediaElement);
      } else {
        mediaElement.oncanplaythrough = fulfill;
        mediaElement.onerror = fulfill;
      } 

      function fulfill() {
        mediaElement.oncanplaythrough = null;
        mediaElement.onerror = null;
        return resolve(mediaElement);
      }
    });    
  }

  loadScript(url) {
    return new Promise(async (resolve, reject) => {

      const cachedUrl = await this.checkCache(url);

      const exists = scriptElements.some((scriptElement) => scriptElement.src === cachedUrl);

      if (exists) {
        return resolve();
      }

      const script = document.createElement("script");
      document.head.appendChild(script);
  
      script.onerror = fulfill;
      script.onload = fulfill;
      script.src = cachedUrl;

      function fulfill() {
        script.onload = null;
        script.onerror = null;
        resolve(script);
      }
    });
  }

  loadSound(url) {
    return new Promise(async (resolve, reject) => {

      const cachedUrl = await this.checkCache(url);

      const sound = new Howl({
        src: cachedUrl,
        autoplay: false,
        mute: true,
        onloaderror: () => resolve(sound),
        onload: () => resolve(sound)
      });
    });
  }

  videoUrl(image) {
    return image.match(/\.(3gp|mpg|mpeg|mp4|m4v|m4p|ogv|ogg|mov|webm)$/);
  }

  imageUrl(image) {
    return image.match(/\.(jpeg|jpg|gif|png|svg|webp)$/);
  }

  checkCache(url) {
    return new Promise((resolve, reject) => {

      console.log("*** Checking cache url", url);

      fetch(url)
        .then(() => resolve(url))
        .catch(() => {
          if (url.indexOf("nocache") !== -1) {
            return reject("Nocache failed");
          }
          resolve(this.checkCache(`${url}?_nocache=${this.uniqueID()}`));
        });
    });
  }

  uniqueID() {
    return Date.now() + Math.random().toString(16).slice(2);
  }

  loadScript(url) {
    return new Promise(async (resolve, reject) => {
      const exists = this.scriptElements.some((scriptElement) => scriptElement.src === url);

      if (exists) {
        return resolve();
      }

      const script = document.createElement("script");
      document.head.appendChild(script);
  
      script.onerror = reject;
      script.onload = resolve;
      script.src = url;
    });
  }

  static async load(resources) {
    const loader = new NerdLoader();  
    return loader.load(resources);    
  }
}
