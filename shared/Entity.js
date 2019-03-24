/**
 * @fileOverview Entity class handle method all entities need.
 *
 * @author BwooGames
 * @version 0.1.0
 */

var SharedUtil = typeof module === 'object' ? require('./Util') : Util // eslint-disable-line

/** Class represening an Entity. */
class Entity {
  /**
   * Initialize the position
   *
   * @param {Array} position - The position.
   */
  constructor (position) {
    /**
     * Initialize position
     *
     * @type {Array}
     */
    this.position = position || [0, 0]
  }

  /**
   * Check if the entity other is visible by this entity
   *
   * @param {Entity} other - The other entity
   *
   * @return {Boolean}       True is visible, or false.
   */
  isVisibleTo (other) {
    return SharedUtil.inBound(
      this.getX(),
      other.getX() - other.screen.w,
      other.getX() + other.screen.w) && SharedUtil.inBound(
      this.getY(),
      other.getY() - other.screen.h,
      other.getY() + other.screen.h)
  }

  /**
   * Return X
   *
   * @return {Number} X position.
   */
  getX () {
    return this.position[0]
  }

  /**
   * Return Y
   *
   * @return {Number} Y position.
   */
  getY () {
    return this.position[1]
  }
}

if (typeof module === 'object') {
  module.exports = Entity
}
