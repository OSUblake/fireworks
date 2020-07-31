(async () => {

  const RAD = Math.PI / 180;
  const DEG = 180 / Math.PI;


  // new Fireworks();
  // return;
   
  // NerdLoader
  // class NerdLoader{constructor(){this.resources={}}async load(assets=[]){const scripts=[],images=[],sounds=[],videos=[];return assets.forEach(asset=>{"string"==typeof asset&&(asset={name:asset,url:asset});const ext=((asset.url||"").match(/\.([^.]*?)(?=\?|#|$)/)||[])[1];/(js)$/.test(ext)?scripts.push(asset):/(jpe?g|gif|png|svg|webp)$/.test(ext)?images.push(asset):/(3gp|mpg|mpeg|mp4|m4v|m4p|ogv|ogg|mov|webm)$/.test(ext)?videos.push(asset):/(mp3)$/.test(ext)&&sounds.push(asset)}),await Promise.all(scripts.map(asset=>this.loadScript(asset))),gsap.globalTimeline.getChildren().forEach(animation=>animation.kill()),await Promise.all([...sounds.map(asset=>this.loadSound(asset)),...videos.map(asset=>this.loadVideo(asset)),...images.map(asset=>this.loadImage(asset))]),this.resources}loadImage({name:name,url:url}){return new Promise(async(resolve,reject)=>{const cachedUrl=await this.checkCache(url),imageElement=new Image;function fulfill(){imageElement.onload=null,imageElement.onerror=null,resolve(imageElement)}imageElement.crossOrigin="Anonymous",imageElement.src=cachedUrl,this.resources[name]=imageElement,imageElement.complete?resolve(imageElement):(imageElement.onload=fulfill,imageElement.onerror=fulfill)})}loadVideo({name:name,url:url,target:target}){return new Promise(async(resolve,reject)=>{const cachedUrl=await this.checkCache(url),mediaElement=document.querySelector(target)||document.createElement("video");function fulfill(){return mediaElement.oncanplaythrough=null,mediaElement.onerror=null,resolve(mediaElement)}mediaElement.muted=!0,mediaElement.crossOrigin="Anonymous",mediaElement.src=cachedUrl,this.resources[name]=mediaElement,mediaElement.readyState>3?resolve(mediaElement):(mediaElement.oncanplaythrough=fulfill,mediaElement.onerror=fulfill)})}loadScript({name:name,url:url}){return new Promise(async(resolve,reject)=>{const cachedUrl=await this.checkCache(url),scriptElements=Array.from(document.querySelectorAll("script"));let script=scriptElements.filter(scriptElement=>scriptElement.src===cachedUrl)[0];if(script)return fulfill();function fulfill(){return script.onload=null,script.onerror=null,resolve(script)}script=document.createElement("script"),document.head.appendChild(script),this.resources[name]=script,script.onerror=fulfill,script.onload=fulfill,script.src=cachedUrl})}loadSound({name:name,url:url}){return new Promise(async(resolve,reject)=>{const cachedUrl=await this.checkCache(url),sound=new Howl({src:cachedUrl,autoplay:!1,mute:!0,onloaderror:()=>resolve(sound),onload:()=>resolve(sound)});this.resources[name]=sound})}checkCache(url){return new Promise((resolve,reject)=>{console.log("*** Checking cache",url),fetch(url).then(()=>resolve(url)).catch(()=>{if(-1!==url.indexOf("nocache"))return reject(`Cache failed: ${String(url)}`);resolve(this.checkCache(`${url}?_nocache=${this.uniqueID()}`))})})}uniqueID(){return Date.now()+Math.random().toString(16).slice(2)}static async load(assets){return(new NerdLoader).load(assets)}}

  const settings = {
    canvas: document.querySelector("#canvas"),
    maxFireworks: Number(10), // {maxFireworks}
    maxImageSize: Number(100), // {maxImageSize}
    spawnWidth: Number(2000), // {spawnWidth}
    delayTime: Number(10), // {alertDelay}
    volume: Number(100) * 0.01, // {audioVolume}
    popVolume: Number(100) * 0.01, // {popVolume}
    fireworkType: "emotePopper", // "{fireworkType}" emotePopper, classic, none
    fireworkOrder: "ordered", // "{fireworkOrder}" random, ordered
    fireworkDelay: Number(0.6), // {fireworkDelay} a value of 0 is normal
    particleSize: 30,
    numParticles: 300,
    mainExplodeY: 330,
    explodeTime: 1.55, // time when firework explodes in video 
    minTrailParticleSize: 10, 
    maxTrailParticleSize: 30,
    minImageSizeSlider: 10, // based on maxImageSize slider 
    maxImageSizeSlider: 1000, // based on maxImageSize slider
    clusterParticles: true, // group extra particles in the center of image
    debug: true, // dev mode

    useFilters: false,

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

  const resources = await NerdLoader.load([
    // "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/5.3.2/pixi.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/gsap.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.4.2/PixiPlugin.min.js",
    "https://ext-assets.streamlabs.com/users/140067/Physics2DPlugin.min.3.3.4.js",
    "https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.0/howler.min.js",

    { name: "emoteSlot1", url: "videos/fire.webm" }, // {emoteSlot1}
    { name: "emoteSlot2", url: "images/orange.png" }, // {emoteSlot2}
    { name: "emoteSlot3", url: "images/purple.png" }, // {emoteSlot3}
    { name: "emoteSlot4", url: "images/teal.png" }, // {emoteSlot4}
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

    gsap.registerPlugin(Physics2DPlugin, PixiPlugin);

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

      // const allImages = [
      //   resources.emoteSlot1,
      //   resources.emoteSlot2,
      //   resources.emoteSlot3,
      //   resources.emoteSlot4,
      //   resources.emoteSlot5
      // ].filter(img => !!img && (img.naturalWidth || img.videoWidth || img.width));

      const allEmotes = [
        { image: resources.emoteSlot1, launchSound: launchSound1, popSound: popSound1 },
        { image: resources.emoteSlot2, launchSound: launchSound2, popSound: popSound2 },
        { image: resources.emoteSlot3, launchSound: launchSound3, popSound: popSound3 },
        { image: resources.emoteSlot4, launchSound: launchSound4, popSound: popSound4 },
        { image: resources.emoteSlot5, launchSound: launchSound5, popSound: popSound5 },
        // resources.emoteSlot1,
        // resources.emoteSlot2,
        // resources.emoteSlot3,
        // resources.emoteSlot4,
        // resources.emoteSlot5
      ].filter(emote => !!emote.image && (emote.image.naturalWidth || emote.image.videoWidth || emote.image.width));

      const emotes = [];
      const randomEmote = gsap.utils.random(allEmotes, true);
      const wrapEmote = gsap.utils.wrap(allEmotes);

      for (let i = 0; i < settings.maxFireworks; i++) {
        const image = settings.fireworkOrder === "random" ? randomEmote() : wrapEmote(i);
        emotes.push(image);
      }

      const fireworks = createFireworks({
        ...settings,
        popSound,
        emotes,
        onReady(fireworks) {
          fireworks.play(tl);


          // launchSound.play();
          // tl.play();
        }
      });

    } else {
      tl.play();
    }      
  }

  function randomChoice(a, b, chance = 0.5) {
    return Math.random() < chance ? a : b;
  }

  function createFireworks(settings) {    
  
    // DisplayObject
    // class DisplayObject{constructor(fireworks){this.fireworks=fireworks,this.originX=0,this.originY=0,this.scaleX=1,this.scaleY=1,this.skewX=0,this.skewY=0,this.rotation=0,this.x=0,this.y=0}setTransform(){const{fireworks:fireworks,originX:originX,originY:originY,rotation:rotation,scaleX:scaleX,scaleY:scaleY,skewX:skewX,skewY:skewY,x:x,y:y}=this,{ctx:ctx,dpr:dpr,offsetY:offsetY}=fireworks;let x1=x-originX,y1=offsetY+(y-originY);const a=Math.cos(rotation+skewY)*scaleX,b=Math.sin(rotation+skewY)*scaleX,c=-Math.sin(rotation-skewX)*scaleY,d=Math.cos(rotation-skewX)*scaleY,e=x1+originX-(originX*a+originY*c),f=y1+originY-(originX*b+originY*d);ctx.setTransform(a*dpr,b*dpr,c*dpr,d*dpr,e*dpr,f*dpr)}}

    // // Fireworks
    // class Fireworks{constructor(settings){Object.assign(this,settings),this.canPlay=!1,this.render=this.render.bind(this),this.ctx=this.canvas.getContext("2d"),this.dpr=window.devicePixelRatio,this.fireworksTimeline=gsap.timeline({paused:!0}),this.trailParticles=[],this.shapeTextures=new ShapeTextures(this),this.colors.forEach(color=>this.shapeTextures.addColor(color)),this.randomColor=gsap.utils.random(this.colors,!0),this.randomShape=gsap.utils.random(["triangle","rect"],!0),this.images=this.images.filter(img=>img instanceof HTMLElement&&(img.naturalWidth||img.videoWidth||img.width)),this.images.length?this.prepare():this.fireReady()}prepare(){this.emitters=this.images.map((img,i)=>new FireworkEmitter(this,img)),this.onResize(),this.createVars(),this.mainExplodeY=-(this.height-this.mainExplodeY),window.addEventListener("resize",e=>this.onResize()),Promise.all(this.emitters.map(emitter=>emitter.prepare())).then(res=>{this.init(),this.shapeTextures.generate(),this.fireReady()})}init(){this.canPlay=!0;const{cx:cx,mainExplodeY:mainExplodeY}=this,minRotation=80,maxRotation=120,spread=200,size=this.maxImageSize,spawnWidth=Math.min(this.spawnWidth,this.width)/2;let spawnSide=1;const randomX=gsap.utils.random(100,spawnWidth,!0),randomY=gsap.utils.random(mainExplodeY-200,mainExplodeY+200,!0),randomRotation=gsap.utils.random(80*RAD,120*RAD,!0),randomDelay=gsap.utils.random(.1,.5,!0),randomDrop=gsap.utils.random(50,80,!0);this.emitters.forEach((emitter,index)=>{const isMain=!index,sign=randomChoice(1,-1),duration=1,drop=randomDrop();let delay,peakY,explodeY;isMain?(peakY=mainExplodeY-drop,explodeY=mainExplodeY,delay=0):(peakY=randomY(),explodeY=peakY+drop,delay=randomDelay()),emitter.rotationSign=sign,emitter.x=isMain?cx:cx+randomX()*spawnSide,emitter.y=this.height,spawnSide*=-1;const tl=gsap.timeline({paused:!0}).to(emitter,{duration:2,ease:"none",rotation:"+="+randomRotation()*sign},0).to(emitter,{duration:1,ease:"sine.out",y:peakY},0).to(emitter,{duration:1,ease:"sine.in",y:0},">");tl.time(1,!0);let explodeTime=0;for(let i=0;i<=1;i+=.01){const currentTime=1+1*i;if(tl.time(currentTime,!0),emitter.y>explodeY){emitter.init(),explodeTime=currentTime;break}}tl.progress(0,!0);const progress=explodeTime/tl.duration(),tweener=gsap.to(tl,{duration:this.explodeTime,progress:progress,ease:"none",onStart:()=>{emitter.play()},onComplete:()=>{tl.kill(),emitter.explode(),this.popSound.play()}});this.createTrailParticles({emitter:emitter,startY:emitter.y,endY:explodeY,isMain:isMain,delay:delay}),this.fireworksTimeline.add(tweener,delay)})}createTrailParticles(settings){const{delay:delay,emitter:emitter,endY:endY,isMain:isMain}=settings,{randomColor:randomColor,shapeTextures:shapeTextures}=this,minRotation=360,maxRotation=720,imageSize=Math.min(emitter.image.width,emitter.image.height),maxOffsetX=Math.min(10,imageSize/2),randomDelay=gsap.utils.random(0,.5,!0),randomDrop=gsap.utils.random(100,150,!0),randomOffsetX=gsap.utils.random(50,maxOffsetX,!0),randomOffsetY=gsap.utils.random(.2*endY,.5*endY,!0),randomRotation=gsap.utils.random(360*RAD,720*RAD,!0),size=gsap.utils.mapRange(this.minImageSizeSlider,this.maxImageSizeSlider,this.minTrailParticleSize,this.maxTrailParticleSize,imageSize),scale=size/this.particleSize,count=isMain?gsap.utils.random(6,9,1):gsap.utils.random(2,3,1);for(let i=0;i<count;i++){const color=randomColor(),x=emitter.x+randomOffsetX()*randomChoice(1,-1),shape=this.randomShape(),sign=randomChoice(1,-1),offsetY=randomOffsetY(),startY=emitter.y+offsetY,peakY=endY-offsetY,fadeY=peakY+randomDrop(),particle=new FireworkParticle(this,{color:color,scaleX:scale,scaleY:scale,frame:shapeTextures.getFrame(color,shape),x:x,y:startY,rotation:Math.random()*Math.PI}),duration=1,tl=gsap.timeline({paused:!0}).to(particle,{duration:duration,y:peakY,ease:"sine.out"}).to(particle,{duration:duration,y:0,ease:"sine.in"}).to(particle,{duration:2*duration,rotation:"+="+randomRotation()*sign,ease:"power3.in"},0);let endTime=0;for(let i=0;i<=1;i+=.01){const currentTime=duration+duration*i;if(tl.time(currentTime,!0),particle.y>fadeY){endTime=currentTime;break}}const timeDifference=endTime-duration;tl.to(particle,{ease:"power3.in",duration:2*timeDifference,scaleX:0,scaleY:0},duration-timeDifference),tl.progress(0,!0);const progress=endTime/tl.duration(),minDuration=this.explodeTime+.1,maxDuration=minDuration+.3,tweenerDuration=gsap.utils.random(minDuration,maxDuration),tweener=gsap.timeline({onStart:()=>{particle.alive=!0},onComplete:()=>{particle.alive=!1,tl.kill()}}).to(tl,{duration:tweenerDuration,progress:progress,ease:"none"});this.fireworksTimeline.add(tweener,delay),this.trailParticles.push(particle)}}createVars(){this.particleVars={startAlpha:gsap.utils.random(.5,1,!0),scale:gsap.utils.random(.5,1,!0),duration:gsap.utils.random(1,2,!0),friction:gsap.utils.random(.1,.3,!0),gravity:400,rotation:gsap.utils.random(45*RAD,90*RAD,!0),spread:60,skew:gsap.utils.random(-45*RAD,45*RAD,!0),velocity:gsap.utils.random(800,1100,!0)}}onResize(){this.width=this.canvas.clientWidth,this.height=this.canvas.clientHeight,this.cx=this.width/2,this.cy=this.height/2,this.canvas.width=this.width*this.dpr,this.canvas.height=this.height*this.dpr,this.offsetY=this.height,this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0)}play(){this.canPlay?(this.fireworksTimeline.play(),gsap.ticker.add(this.render)):console.log("*** Fireworks can't play")}kill(){gsap.ticker.remove(this.render)}fireReady(){this.onReady&&this.onReady.call(this,this)}render(){const{ctx:ctx,emitters:emitters,width:width,height:height,trailParticles:trailParticles}=this;let aliveCount=0,i=0;for(this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0),ctx.clearRect(0,0,width,height),ctx.globalAlpha=1,i=0;i<trailParticles.length;i++){const particle=trailParticles[i];particle.alive&&(particle.render(),aliveCount++)}for(i=0;i<emitters.length;i++)emitters[i].update(),aliveCount+=emitters[i].aliveCount;aliveCount||this.kill()}}

    // // FireworkEmitter
    // class FireworkEmitter{constructor(fireworks,image){this.fireworks=fireworks,this.image=new FireworkImage(fireworks,image),this.exploded=!1,this.x=0,this.y=0,this.rotation=0,this.rotationSign=1,this.particles=[],this.aliveCount=1}async prepare(){await this.image.init(),this.createParticles()}play(){this.image.play()}explode(){const particles=this.particles;for(let i=0;i<particles.length;i++)particles[i].play();this.exploded=!0}init(){const{particles:particles,x:x,y:y,rotation:rotation,rotationSign:rotationSign}=this;for(let i=0;i<particles.length;i++)particles[i].init(x,y,rotation,rotationSign)}createParticles(){const fireworks=this.fireworks,{width:width,height:height}=this.image,{numParticles:numParticles,particleSize:particleSize}=this.fireworks;this.addParticles(!1);let len=this.particles.length;if(len)for(this.addParticles(!0);len<numParticles;)this.addParticles(!0),len=this.particles.length}addParticles(centered){const{fireworks:fireworks,image:image}=this,{width:width,height:height}=image,{particleSize:particleSize,shapeTextures:shapeTextures,randomShape:randomShape}=fireworks,cx=width/2,cy=height/2,size=particleSize,offset=size/2;let count=0;for(let y=0;y<height;y+=size)for(let x=0;x<width;x+=size){const color=image.getColor(x,y);if(color.a<.9)continue;const rgb=`rgb(${color.r}, ${color.g}, ${color.b})`;shapeTextures.addColor(rgb);const shape=randomShape(),particle=new FireworkParticle(fireworks,{centered:centered,color:rgb,alpha:color.a,dx:x+offset-cx,dy:y+offset-cy,frame:shapeTextures.getFrame(rgb,shape)});this.particles.push(particle),count++}return count}update(){const{exploded:exploded,image:image,particles:particles,x:x,y:y}=this;let alive=0;if(exploded)for(let i=0;i<particles.length;i++){const particle=particles[i];particle.alive&&(particle.render(),alive++)}else image.x=x,image.y=y,image.rotation=this.rotation,image.render(),alive++;this.aliveCount=alive,alive||image.pause()}}

    // // FireworkParticle
    // class FireworkParticle extends DisplayObject{constructor(fireworks,settings){super(fireworks),Object.assign(this,{alive:!1,alpha:1,centered:!1,dx:0,dy:0},settings),this.size=fireworks.particleSize,this.originX=this.size/2,this.originY=this.size/2}init(cx,cy,currentRotation){const{dx:dx,dy:dy,fireworks:fireworks}=this,{duration:duration,friction:friction,gravity:gravity,scale:scale,skew:skew,spread:spread,startAlpha:startAlpha,rotation:rotation,velocity:velocity}=fireworks.particleVars;this.rotation=Math.random()*Math.PI,this.alpha=startAlpha(),this.scaleX=this.scaleY=scale(),this.skewX=skew(),this.skewY=skew();let angle=0,minAngle=0,maxAngle=360,frictionValue=friction();frictionValue=randomChoice(Math.min(2*frictionValue,.8),frictionValue,.3);const cos=Math.cos(currentRotation),sin=Math.sin(currentRotation);this.x=cos*dx-sin*dy+cx,this.y=cos*dy+sin*dx+cy,angle=Math.atan2(this.y-cy,this.x-cx)*DEG,minAngle=angle-spread,maxAngle=angle+spread,fireworks.clusterParticles&&this.centered&&(this.x=cx,this.y=cy,angle=0,minAngle=0,maxAngle=360),this.timeline=gsap.timeline({paused:!0}).to(this,{duration:duration,alpha:0,onComplete:()=>this.kill()},.2).to(this,{duration:duration,scaleX:0,scaleY:0},0).to(this,{duration:duration,physics2D:{angle:gsap.utils.random(minAngle,maxAngle),friction:frictionValue,velocity:velocity,gravity:gravity}},0)}play(){this.timeline?(this.alive=!0,this.timeline.play()):console.log("*** No particle timeline")}kill(){this.timeline.kill(),this.alive=!1}render(){if(!this.alpha||!this.scaleX&&!this.scaleY)return;const{fireworks:fireworks,frame:frame}=this,ctx=fireworks.ctx;this.setTransform(),ctx.globalAlpha=this.alpha,ctx.drawImage(frame.texture,frame.sx,frame.sy,frame.sSize,frame.sSize,0,0,frame.dSize,frame.dSize)}}

    // // ShapeTextures
    // class ShapeTextures{constructor(fireworks){this.fireworks=fireworks,this.particleSize=fireworks.particleSize,this.shapes={},this.numShapes=0,this.texture=document.createElement("canvas"),this.pad=4;const particleSize=this.particleSize,size=this.size=particleSize+this.pad;this.width=1e3,this.cols=Math.floor(this.width/size),this.rows=1;const p1=new Path2D;p1.rect(0,0,particleSize,particleSize);const p2=new Path2D;p2.moveTo(particleSize/2,0),p2.lineTo(particleSize,particleSize),p2.lineTo(0,particleSize),p2.closePath(),this.rectPath=p1,this.trianglePath=p2}addColor(color){const key1=color+"-rect",key2=color+"-triangle";if(this.shapes[key1])return this;this.shapes[key1]=this.addFrame(color,this.rectPath),this.shapes[key2]=this.addFrame(color,this.trianglePath)}addFrame(color,path){const dpr=this.fireworks.dpr,size=this.size,rows=Math.floor(this.numShapes/this.cols);let x=this.numShapes*size%(this.cols*size),y=rows*size;this.rows=rows+1;const frame={color:color,x:x,y:y,path:path,sSize:this.particleSize*dpr,dSize:this.particleSize,sx:x*dpr,sy:y*dpr,texture:this.texture};return this.numShapes++,frame}getFrame(color,shape="rect"){return this.shapes[`${color}-${shape}`]}generate(){const dpr=this.fireworks.dpr;this.height=this.rows*this.size,this.texture.width=this.width*dpr,this.texture.height=this.rows*this.size*dpr;const ctx=this.texture.getContext("2d");for(const[key,frame]of Object.entries(this.shapes))ctx.setTransform(dpr,0,0,dpr,frame.x*dpr,frame.y*dpr),ctx.fillStyle=frame.color,ctx.fill(frame.path),ctx.fillStyle="rgba(0,0,0,0)",ctx.fillRect(0,0,this.width,this.height)}}
        
    // // FireworkImage
    // class FireworkImage extends DisplayObject{constructor(fireworks,image){super(fireworks),this.origImage=image,this.texture=image,this.imageData=[0,0,0,0],this.isValid=!1,this.isVideo=image instanceof HTMLMediaElement,this.baseWidth=image.naturalWidth||image.videoWidth||image.width,this.baseHeight=image.naturalHeight||image.videoHeight||image.height;const maxSize=this.fireworks.maxImageSize;let ratio=1;this.baseWidth>maxSize?ratio=maxSize/this.baseWidth:this.baseHeight>maxSize&&(ratio=maxSize/this.baseHeight),this.width=Math.floor(this.baseWidth*ratio),this.height=Math.floor(this.baseHeight*ratio),this.originX=this.width/2,this.originY=this.height/2}init(){const texture=this.texture;return new Promise(resolve=>{if(!texture)return console.log("*** FIREWORKS: Invalid Texture"),resolve();if(this.isVideo){const fulfill=()=>{texture.removeEventListener("timeupdate",fulfill),this.resizeImage(),resolve()};texture.addEventListener("timeupdate",fulfill),texture.currentTime=.5*texture.duration}else this.resizeImage(),resolve()})}resizeImage(){const image=this.texture,canvas=document.createElement("canvas"),ctx=canvas.getContext("2d");canvas.width=this.width,canvas.height=this.height,ctx.drawImage(image,0,0,this.baseWidth,this.baseHeight,0,0,this.width,this.height),this.imageData=ctx.getImageData(0,0,canvas.width,canvas.height).data}play(){this.isVideo&&(this.texture.currentTime=0,this.texture.play())}pause(){this.isVideo&&this.texture.pause()}getColor(x=0,y=0){const i=4*(y*this.width+x);return this.imageData[i]?{r:this.imageData[i],g:this.imageData[i+1],b:this.imageData[i+2],a:this.imageData[i+3]/255}:{r:0,g:0,b:0,a:0}}render(){const ctx=this.fireworks.ctx;this.setTransform(),ctx.globalAlpha=1,ctx.drawImage(this.texture,0,0,this.baseWidth,this.baseHeight,0,0,this.width,this.height)}}

    return new Fireworks(settings);    
  }
})();
