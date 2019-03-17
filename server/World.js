var Util = require('./Util');
var Constants = require('./Constants');

class World {
  static getRandomPoint() {
      return [Util.randRange(Constants.WORLD_MIN,
                              Constants.WORLD_MAX),
              Util.randRange(Constants.WORLD_MIN,
                              Constants.WORLD_MAX)];
  }
}

module.exports = World;
