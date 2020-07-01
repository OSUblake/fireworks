class DisplayObject {

  constructor(fireworks) {

    this.fireworks = fireworks;

    this.originX = 0;
    this.originY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.skewX = 0;
    this.skewY = 0;
    this.rotation = 0;
    this.x = 0;
    this.y = 0;
  }

  setTransform() {

    const { fireworks, originX, originY, rotation, scaleX, scaleY, skewX, skewY, x, y } = this;

    let x1 = x - originX;
    let y1 = fireworks.offsetY + (y - originY);

    const a =  Math.cos(rotation + skewY) * scaleX;
    const b =  Math.sin(rotation + skewY) * scaleX;
    const c = -Math.sin(rotation - skewX) * scaleY;
    const d =  Math.cos(rotation - skewX) * scaleY;         
    const e = (x1 + originX) - ((originX * a) + (originY * c));
    const f = (y1 + originY) - ((originX * b) + (originY * d));

    fireworks.resetTransform().setTransform(a, b, c, d, e, f);

    return this;
  }
}
