/**
 * @fileOverview Rectangle handle a definition of a rectangle.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a Rectangle. */
export class Rectangle {
  /**
   * The left corner
   *
   * @type {Number}
   */
  left: number

  /**
   * The top corner
   *
   * @type {Number}
   */
  top: number

  /**
   * The width
   *
   * @type {Number}
   */
  width: number

  /**
   * The height
   *
   * @type {Number}
   */
  height: number

  /**
   * The right corner
   *
   * @type {Number}
   */
  right: number

  /**
   * The bottom corner.
   *
   * @type {Number}
   */
  bottom: number
  /**
  * Initialize data.
  *
  * @param {Number} left   - the left corner.
  * @param {number} top    - the top corner.
  * @param {number} width  - the width of the rect.
  * @param {number} height - the height of the rect.
  */
  constructor (left: number, top: number, width?: number, height?: number) {
    this.left = left || 0
    this.top = top || 0
    this.width = width || 0
    this.height = height || 0
    this.right = this.left + this.width
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
  set (left: number, top: number, width?: number, height?: number): void {
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
  within (r: Rectangle): boolean {
    return (r.left <= this.left &&
      r.right >= this.right &&
      r.top <= this.top &&
      r.bottom >= this.bottom)
  }
}
