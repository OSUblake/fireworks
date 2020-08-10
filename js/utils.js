const utils = {
  debugEnabled: true,
  RAD: Math.PI / 180,
  DEG: 180 / Math.PI,
  randomChoice(a, b, chance = 0.5) {
    return Math.random() < chance ? a : b;
  },
  randomSign(chance = 0.5) {
    return Math.random() < chance ? 1 : -1;
  },
  nextPow2(value){
    return Math.pow(2, Math.ceil(Math.log(value) / Math.log(2))); 
  },
  getScale(width, height, size) {
    return Math.min(size / width, size / height);
  },
  createStats() {
    const stats = new Stats();
    stats.showPanel(0);
    document.body.appendChild(stats.dom);
    stats.dom.style.left = "unset";
    stats.dom.style.right = "0px";
    return stats;
  },
  log(...args) {
    this.debugEnabled && console.log(...args);
  },
  time(id) {
    this.debugEnabled && console.time(id);
  },
  timeEnd(id) {
    this.debugEnabled && console.timeEnd(id);
  },
  logShade(c, p) {
    var i=parseInt,r=Math.round,[a,b,c,d]=c.split(","),P=p<0,t=P?0:p*255**2,P=P?1+p:1-p;
    return"rgb"+(d?"a(":"(")+r((P*i(a[3]=="a"?a.slice(5):a.slice(4))**2+t)**0.5)+","+r((P*i(b)**2+t)**0.5)+","+r((P*i(c)**2+t)**0.5)+(d?","+d:")");
  }
};
