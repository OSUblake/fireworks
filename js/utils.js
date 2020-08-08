const utils = {
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
  }
}
