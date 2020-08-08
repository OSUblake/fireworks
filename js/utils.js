// const RAD = Math.PI / 180;
// const DEG = 180 / Math.PI;

// function randomChoice(a, b, chance = 0.5) {
//   return Math.random() < chance ? a : b;
// }

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
  }
}
