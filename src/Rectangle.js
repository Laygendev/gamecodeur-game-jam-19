/**
 * @fileOverview Rectangle handle a definition of a rectangle.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a Rectangle. */
window.Rectangle = class Rectangle { // eslint-disable-line
  /**
  * Initialize data.
  *
  * @param {Number} left   - the left corner.
  * @param {number} top    - the top corner.
  * @param {number} width  - the width of the rect.
  * @param {number} height - the height of the rect.
  */
  constructor (left, top, width, height) {
    /**
     * The left corner
     *
     * @type {Number}
     */
    this.left = left || 0

    /**
     * The top corner
     *
     * @type {Number}
     */
    this.top = top || 0

    /**
     * The width
     *
     * @type {Number}
     */
    this.width = width || 0

    /**
     * The height
     *
     * @type {Number}
     */
    this.height = height || 0

    /**
     * The right corner
     *
     * @type {Number}
     */
    this.right = this.left + this.width

    /**
     * The bottom corner.
     *
     * @type {Number}
     */
    this.bottom = this.top + this.height
  }

  /**
  * Reset left top width and height of the rect.
  *
  * @param {Number} left   - the left corner.
  * @param {number} top    - the top corner.
  * @param {number} width  - the width of the rect.
  * @param {number} height - the height of the rect.
  */
  set (left, top, width, height) {
    this.left = left
    this.top = top
    this.width = width || this.width
    this.height = height || this.height
    this.right = (this.left + this.width)
    this.bottom = (this.top + this.height)
  }

  /**
   * @todo Need to understand
   *
   * @param {Rectangle} r - Other rectangle.
   *
   * @return {Boolean}      Is in ?
   */
  within (r) {
    return (r.left <= this.left &&
      r.right >= this.right &&
      r.top <= this.top &&
      r.bottom >= this.bottom)
  }
}
