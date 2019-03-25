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
   * @param {Array} collider - The World collider.
   * @param {Game} game      - The Game Object from Client side.
   */
  constructor (collider, game) {
    /**
     * The World collider.
     *
     * @type {Array}
     */
    this.collider = collider

    /**
     * The Game Object from Client side.
     *
     * @type {Game}
     */
    this.game = game

    if (typeof module === 'object') {
      this.collider = require('./../asset/worldCollider.json')
    }
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
    for (var key in this.collider) {
      for (var i = 0; i < this.collider[key].length; i++) {
        var A = this.collider[key][i]
        var B
        if (i === this.collider[key].length - 1) {
          B = this.collider[key][0]
        } else {
          B = this.collider[key][i + 1]
        }

        A[0] = A.x
        A[1] = A.y
        B[0] = B.x
        B[1] = B.y
        haveCollider = SharedUtil.CollisionSegSeg(pos, nextPos, A, B)

        if (haveCollider) {
          break
        }
      }

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
