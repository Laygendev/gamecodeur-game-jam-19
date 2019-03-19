var SharedConstants = typeof module === 'object' ? require('./Constants') : Constants;
var SharedUtil = typeof module === 'object' ? require('./Util') : Util;

class World {
  static getRandomPoint() {
      return [SharedUtil.randRange(SharedConstants.WORLD_MIN,
                              SharedConstants.WORLD_MAX),
              SharedUtil.randRange(SharedConstants.WORLD_MIN,
                              SharedConstants.WORLD_MAX)];
  }
}

if (typeof module === 'object') {
  module.exports = World;
}
