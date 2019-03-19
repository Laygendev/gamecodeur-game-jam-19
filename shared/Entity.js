var SharedConstants = typeof module === 'object' ? require('./Constants') : Constants;
var SharedUtil = typeof module === 'object' ? require('./Util') : Util;

class Entity  {
  constructor(position) {
    this.position = position || [0, 0];
  }

  isVisibleTo(player) {
    return SharedUtil.inBound(
      this.getX(),
      player.getX() - player.screen.w,
      player.getX() + player.screen.w) && SharedUtil.inBound(
      this.getY(),
      player.getY() - player.screen.h,
      player.getY() + player.screen.h);
  }

  getX() {
    return this.position[0];
  }

  getY() {
    return this.position[1];
  }
}

if (typeof module === 'object') {
  module.exports = Entity;
}
