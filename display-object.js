class DisplayObject {

  constructor(fireworks) {

    this.fireworks = fireworks;

    this.originX = 0;
    this.originY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this._skewX = 0;
    this._skewY = 0;
    this._rotation = 0;
    this.x = 0;
    this.y = 0;

    this._cx = 1;
    this._sx = 0;
    this._cy = 0;
    this._sy = 1;
    this.updateId = 0;
  }

  get skewX() {
    return this._skewX;
  }

  set skewX(value) {

    if (this._skewX !== value) {
      this._skewX = value;
      this.updateId++;
    }
  }

  get skewY() {
    return this._skewY;
  }

  set skewY(value) {

    if (this._skewY !== value) {
      this._skewY = value;
      this.updateId++;
    }
  }

  get rotation() {
    return this._rotation;
  }

  set rotation(value) {
    if (this._rotation !== value) {
      this._rotation = value;
      this.updateId++;
    }
  }

  updateSkew() {
    this._cx = Math.cos(this._rotation + this._skewY);
    this._sx = Math.sin(this._rotation + this._skewY);
    this._cy = -Math.sin(this._rotation - this._skewX); 
    this._sy = Math.cos(this._rotation - this._skewX); 
  }

  setTransform() {

    const { fireworks, originX, originY, rotation, scaleX, scaleY, skewX, skewY, x, y } = this;
    const { ctx, dpr, offsetY } = fireworks;

    if (this.updateId) {
      this.updateSkew();
      this.updateId = 0;
    }

    let x1 = x - originX;
    let y1 = offsetY + (y - originY);

    const a = this._cx * scaleX;
    const b = this._sx * scaleX;
    const c = this._cy * scaleY;
    const d = this._sy * scaleY;         
    const e = x1 + originX - (originX * a + originY * c);
    const f = y1 + originY - (originX * b + originY * d);

    ctx.setTransform(
      a * dpr,
      b * dpr,
      c * dpr,
      d * dpr,
      e * dpr,
      f * dpr,
    );
  }
}
