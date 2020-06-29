
const path = new Path2D();
path.arc(0, 0, 3, 0, Math.PI * 2);

class FireworkParticle {

  constructor(settings) {
    Object.assign(this, settings);

    this.texture = document.createElement("canvas");
    
    const size = 6;
    this.texture.width = this.width = size;
    this.texture.height = this.height = size;
    this.originX = this.width / 2;
    this.originY = this.height / 2;

    const ctx = this.texture.getContext("2d");
    ctx.beginPath();
    ctx.arc(this.originX, this.originY, Math.min(this.originX, this.originY), 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  init(cx, cy, rotation) {

    const dx = this.dx;
    const dy = this.dy;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    this.x = ((cos * dx) - (sin * dy)) + cx;
    this.y = ((cos * dy) + (sin * dx)) + cy;
  }

  update() {

  }

  render(ctx, delta) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.alpha;
    
    // ctx.fillRect(this.x - 1, this.y - 1, 2, 2);
    // ctx.fillRect(this.x - 3, this.y - 3, 6, 6);

    // ctx.translate(this.x + this.originX, this.y + this.originY)
    // ctx.drawImage(this.texture, -this.originX, -this.originY);

    // ctx.drawImage(this.texture, this.x + this.originX, this.y + this.originY);
    // ctx.drawImage(this.texture, this.x - this.originX, this.y - this.originY);
    // ctx.drawImage(this.texture, this.x, this.y);

    ctx.translate(this.x, this.y);
    ctx.fill(path);

    ctx.restore();
  }
}
