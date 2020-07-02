const RAD = Math.PI / 180;

function randomChoice(a, b, chance = 0.5) {
  return Math.random() < chance ? a : b;
}
