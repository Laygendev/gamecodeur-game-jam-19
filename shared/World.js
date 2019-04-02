/**
 * @fileOverview World class handle collision with the player and the World.
 * Also have static method for get random point in the World.
 *
 * @author BwooGames
 * @version 0.1.0
 */

var SharedConstants = typeof module === 'object' ? require('./Constants') : Constants // eslint-disable-line
var SharedUtil = typeof module === 'object' ? require('./Util') : Util // eslint-disable-line

/** Class representing a World. */
var World = class World {
  /**
   * Initialise data
   *
   * @param {Array} map - The World map.
   */
  constructor (map) {
    /**
     * The World map.
     *
     * @type {Array}
     */
    this.map = map
  }

  /**
   * Get Random point in the World.
   *
   * @return {Array} Random Coordinate beetween WORLD_MIN and WORLD_MAX.
   */
  static getRandomPoint () {
    return [SharedUtil.randRange(SharedConstants.WORLD_MIN,
      SharedConstants.WORLD_MAX),
    SharedUtil.randRange(SharedConstants.WORLD_MIN,
      SharedConstants.WORLD_MAX)]
  }

  /**
   * Check collision between player and World Collision.
   *
   * @param {Array} pos     - The current Pos of the player.
   * @param {Array} nextPos - The future pos of the player.
   *
   * @return {Boolean}        True if collide or false.
   */
  checkCollider (pos, nextPos) {
    var haveCollider = false

    for (var key in this.map.layers) {
      haveCollider = this.map.layers[key].checkCollider(pos, nextPos)

      if (haveCollider) {
        break
      }
    }

    return haveCollider
  }
}

if (typeof module === 'object') {
  module.exports = World // eslint-disable-line
}
