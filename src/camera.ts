/**
 * @fileOverview Camera class manage the viewport of the canvas.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Game } from './Game' // eslint-disable-line
import { Player } from './../Shared/Player' // eslint-disable-line
import { Rectangle } from './Rectangle'
import { Constants } from './../Shared/Constants'

/** Class represening a Camera. */
export class Camera {
  /**
   * The game Object.
   *
   * @type {Game}
   */
  game: Game

  /**
   * X Coordinate.
   *
   * @type {Number}
   */
  x: number

  /**
   * Y Coordinate.
   *
   * @type {Number}
   */
  y: number

  /**
   * Width canvas.
   *
   * @type {Number}
   */
  width: number

  /**
   * Height canvas.
   *
   * @type {Number}
   */
  height: number

  /**
   * X dead zone of camera.
   *
   * @type {Number}
   */
  xDeadZone: number

  /**
   * Y dead zone of camera.
   *
   * @type {Number}
   */
  yDeadZone: number

  /**
   * Target of the camera.
   *
   * @type {Player}
   */
  target: Player

  /**
   * Viewport Rect.
   *
   * @type {Rectangle}
   */
  viewportRect: Rectangle

  /**
   * World Rect
   *
   * @type {Rectangle}
   */
  worldRect: Rectangle

  /**
   * Initialize data
   *
   * @param {Game} game - The game Object.
   */
  constructor (game: Game) {
    this.game = game
    this.x = 0
    this.y = 0
    this.width = this.game.canvas.width
    this.height = this.game.canvas.height
    this.xDeadZone = 0
    this.yDeadZone = 0
    this.target = null
    this.viewportRect = new Rectangle(this.x, this.y, this.width, this.height)
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
  setTarget (target: Player, xDeadZone: number, yDeadZone: number): void {
    this.target = target
    this.xDeadZone = xDeadZone
    this.yDeadZone = yDeadZone

    this.worldRect = new Rectangle(0, 0, Constants.WORLD_MAX, Constants.WORLD_MAX)
  }

  /**
   * Update loop of the camera.
   *
   * Set the position of camera by the target position.
   */
  update (): void {
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
  inViewport (x: number, y: number): boolean {
    var inViewport = false
    if (x + 80 >= this.x && x + 80 <= this.x + this.viewportRect.width + 80 &&
      y + 80 >= this.y && y + 80 <= this.y + this.viewportRect.height + 80) {
      inViewport = true
    }

    return inViewport
  }
}
