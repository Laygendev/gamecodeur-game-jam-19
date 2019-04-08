/**
 * @fileOverview Input handle the event keydown, keyup, mousvemove, mousedown,
 * mouse up and resize.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Game } from './Game' // eslint-disable-line

/** Class representing a Input. */
export class Input {
  /**
   * Game Object
   *
   * @type {Game}
   */
  game: Game

  /**
   * Define keyPressed Obejct
   *
   * @type {Object}
   */
  keyPressed: any

  /**
   * Define mouse position
   *
   * @type {Object}
   */
  mousePosition: any

  /**
   * Left click is pressed ?
   *
   * @type {Boolean}
   */
  leftClickPressed: boolean

  /**
  * Construtor init data
  */
  constructor (game: Game) {
    this.game = game
    this.keyPressed = {
      up: false,
      down: false,
      right: false,
      left: false,
      space: false,
      Z: false,
      Q: false,
      S: false,
      D: false
    }

    this.mousePosition = {
      x: 0,
      y: 0
    }

    this.leftClickPressed = false

    /**
     * Attach events listener
     */
    window.addEventListener('keydown', (e) => { this.keydown(e) }, false)
    window.addEventListener('keyup', (e) => { this.keyup(e) }, false)
    window.addEventListener('mousemove', (e) => { this.mousemove(e) }, false)
    window.addEventListener('mousedown', (e) => { this.mousedown(e) }, false)
    window.addEventListener('mouseup', (e) => { this.mouseup(e) }, false)
    window.addEventListener('resize', () => { this.resizeCanvas() }, false)
  }

  /**
   * Called when i key is pressed
   *
   * @param {KeyboardEvent} e - Keyboard info.
   */
  keydown (e: KeyboardEvent) {
    var code = e.keyCode

    switch (code) {
      case 32:
        this.keyPressed.space = true
        break
      case 38:
        this.keyPressed.up = true
        break
      case 40:
        this.keyPressed.down = true
        break
      case 39:
        this.keyPressed.right = true
        break
      case 37:
        this.keyPressed.left = true
        break
      case 81: // Q
        this.keyPressed.Q = true
        break
      case 83: // S
        this.keyPressed.S = true
        break
      case 90: // Z
        this.keyPressed.Z = true
        break
      case 68: // D
        this.keyPressed.D = true
        break
    }
  }

  /**
   * Called when a key is unpressed
   *
   * @param {KeyboardEvent} e - Keyboard info.
   */
  keyup (e: KeyboardEvent) {
    var code = e.keyCode

    switch (code) {
      case 32:
        this.keyPressed.space = false
        break
      case 38:
        this.keyPressed.up = false
        break
      case 40:
        this.keyPressed.down = false
        break
      case 39:
        this.keyPressed.right = false
        break
      case 37:
        this.keyPressed.left = false
        break
      case 81: // Q
        this.keyPressed.Q = false
        break
      case 83: // S
        this.keyPressed.S = false
        break
      case 90: // Z
        this.keyPressed.Z = false
        break
      case 68: // D
        this.keyPressed.D = false
        break
    }
  }

  /**
   * Called when mouse move
   *
   * @param {MouseEvent} e - Mouse info.
   */
  mousemove (e: MouseEvent) {
    this.mousePosition.x = e.offsetX
    this.mousePosition.y = e.offsetY
  }

  /**
   * Called when a mouse button is down
   *
   * @param {MouseEvent} e - Mouse info.
   */
  mousedown (e: MouseEvent) {
    if (e.which === 1) {
      this.leftClickPressed = true
    }
  }

  /**
   * Called when a mouse button is up
   *
   * @param {MouseEvent} e - Mouse info.
   */
  mouseup (e: MouseEvent) {
    if (e.which === 1) {
      this.leftClickPressed = false
    }
  }

  /**
   * Called when the browser is resized
   */
  resizeCanvas (): void {
    this.game.canvas.width = window.innerWidth
    this.game.canvas.height = window.innerHeight
    this.game.camera.width = this.game.canvas.width
    this.game.camera.xDeadZone = this.game.canvas.width / 2
    this.game.camera.yDeadZone = this.game.canvas.height / 2
    this.game.camera.viewportRect.width = this.game.canvas.width
    this.game.camera.viewportRect.height = this.game.canvas.height
  }
}
