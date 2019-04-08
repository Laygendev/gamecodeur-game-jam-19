/**
 * @fileOverview World class handle collision with the player and the World.
 * Also have static method for get random point in the World.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Map } from './Map' // eslint-disable-line
import { Constants } from './Constants'
import { Util } from './Util'

/** Class representing a World. */
export class World {
  public map: Map
  /**
   * Initialise data
   *
   * @param {Array} map - The World map.
   */
  constructor (map: Map) {
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
  static getRandomPoint (): number[] {
    return [Util.randRange(Constants.WORLD_MIN,
      Constants.WORLD_MAX),
    Util.randRange(Constants.WORLD_MIN,
      Constants.WORLD_MAX)]
  }

  /**
   * Check collision between player and World Collision.
   *
   * @param {Array} pos     - The current Pos of the player.
   * @param {Array} nextPos - The future pos of the player.
   *
   * @return {Boolean}        True if collide or false.
   */
  checkCollider (pos: Array<Number>, nextPos: Array<Number>): boolean {
    var haveCollider = false

    // for (var key: any in this.map.layers) {
    //   // haveCollider = this.map.layers[key].intersectAABB(pos, nextPos)
    //
    //   if (haveCollider) {
    //     break
    //   }
    // }

    return haveCollider
  }
}
