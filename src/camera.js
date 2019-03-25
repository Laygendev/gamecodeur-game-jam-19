/**
 * @fileOverview Camera class manage the viewport of the canvas.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class represening a Camera. */
window.Camera = class Camera { // eslint-disable-line
  /**
   * Initialize data
   *
   * @param {Game} game - The game Object.
   */
  constructor (game) {
    /**
     * The game Object.
     *
     * @type {Game}
     */
    this.game = game

    /**
     * X Coordinate.
     *
     * @type {Number}
     */
    this.x = 0

    /**
     * Y Coordinate.
     *
     * @type {Number}
     */
    this.y = 0

    /**
     * Width canvas.
     *
     * @type {Number}
     */
    this.width = this.game.canvas.width

    /**
     * Height canvas.
     *
     * @type {Number}
     */
    this.height = this.game.canvas.height

    /**
     * X dead zone of camera.
     *
     * @type {Number}
     */
    this.xDeadZone = 0

    /**
     * Y dead zone of camera.
     *
     * @type {Number}
     */
    this.yDeadZone = 0

    /**
     * Target of the camera.
     *
     * @type {Player}
     */
    this.target = null

    /**
     * Viewport Rect.
     *
     * @type {Rectangle}
     */
    this.viewportRect = new window.Rectangle(this.x, this.y, this.width, this.height)
  }

  /**
   * Set the target of the camera.
   *
   * Also set the World Rect Viewport.
   *
   * @param {Player} target    - The target.
   * @param {Number} xDeadZone - The X Dead zone.
   * @param {Number} yDeadZone - The Y Dead zone.
   */
  setTarget (target, xDeadZone, yDeadZone) {
    this.target = target
    this.xDeadZone = xDeadZone
    this.yDeadZone = yDeadZone

    this.worldRect = new window.Rectangle(0, 0, window.Constants.WORLD_MAX, window.Constants.WORLD_MAX)
  }

  /**
   * Update loop of the camera.
   *
   * Set the position of camera by the target position.
   */
  update () {
    if (this.target !== null && this.worldRect !== null) {
      if (this.target.position[0] - this.x + this.xDeadZone > this.width) {
        this.x = this.target.position[0] - (this.width - this.xDeadZone)
      } else if (this.target.position[0] - this.xDeadZone < this.x) {
        this.x = this.target.position[0] - this.xDeadZone
      }

      if (this.target.position[1] - this.y + this.yDeadZone > this.height) {
        this.y = this.target.position[1] - (this.height - this.yDeadZone)
      } else if (this.target.position[1] - this.yDeadZone < this.y) {
        this.y = this.target.position[1] - this.yDeadZone
      }

      this.viewportRect.set(this.x, this.y)

      if (!this.viewportRect.within(this.worldRect)) {
        if (this.viewportRect.left < this.worldRect.left) {
          this.x = this.worldRect.left
        }
        if (this.viewportRect.top < this.worldRect.top) {
          this.y = this.worldRect.top
        }
        if (this.viewportRect.right > this.worldRect.right) {
          this.x = this.worldRect.right - this.width
        }
        if (this.viewportRect.bottom > this.worldRect.bottom) {
          this.y = this.worldRect.bottom - this.height
        }
      }
    }
  }

  /**
   * Check if X and Y is in the canvas viewport.
   *
   * @param {Number} X - X Position.
   * @param {Number} Y - Y Position.
   *
   * @return {Boolean}   True if in viewport or false.
   */
  inViewport (x, y) {
    var inViewport = false
    if (x + 80 >= this.x && x + 80 <= this.x + this.viewportRect.width + 80 &&
      y + 80 >= this.y && y + 80 <= this.y + this.viewportRect.height + 80) {
      inViewport = true
    }

    return inViewport
  }
}
