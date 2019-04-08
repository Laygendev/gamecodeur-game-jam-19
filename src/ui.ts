/**
 * @fileOverview UI Class handle UI Text in game with effect like velocity,
 * alpha.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Game } from './Game' // eslint-disable-line

/** Class representing a UI. */
export class UI {
  /**
   * The Game Object
   *
   * @type {Object}
   */
  game: Game

  /**
   * An array of entities correspond to UI text, or UI Image, or UI Whatever.
   *
   * @type {Array}
   */
  entities: any

  /**
   * Init data
   *
   * @param {Game} game - the Game Object.
   */
  constructor (game: Game) {
    this.game = game
    this.entities = []
  }

  /**
   * Add an entity
   *
   * @param {UIText} entity - An UI Text.
   */
  add (entity: any): void {
    entity.ui = this
    this.entities[entity.id] = entity
  }

  /**
   * For each entity, call update with the deltaTime.
   *
   * @param {number} dt The deltatime
   */
  update (dt: number): void {
    for (var key in this.entities) {
      this.entities[key].update(dt)
    }
  }

  /**
   * For each entity, call draw with
   */
  draw (): void {
    for (var key in this.entities) {
      this.entities[key].draw(this.game)
    }
  }

  /**
   * Delete by the entityID from the entities array.
   *
   * @param {Number} entityID - The ID of the entity to delete.
   */
  destroy (entityID: number): void {
    delete this.entities[entityID]
  }

  /**
   * Display Damage (Nothing to do here)
   * Called when player receive damage.
   *
   * @param {Object} data - The position of the UI Text.
   */
  displayDamage (data: any): void {
    var text = new UIText(data.position, '10')
    this.add(text)
  }
}

/** Class representing a UIText. */
class UIText {
  /**
   * The ID
   *
   * @type {Number}
   */
  id: number

  /**
   * UI Object
   *
   * @param {UI}
   */
  ui: UI

  /**
   * The text to display
   *
   * @type {String}
   */
  text: string

  /**
   * The position
   *
   * @type {Array}
   */
  pos: any

  /**
   * Alpha
   *
   * @type {Number}
   */
  alpha: number

  /**
   * Angle
   *
   * @type {Object}
   */
   angle: number

  /**
  * Speed
  *
  * @type {Object}
  */
  speed: number

  /**
   * The Velocity.
   *
   * @type {Object}
   */
  velocity: any

  /**
   * The timestamp when created.
   *
   * @type {Number}
   */
  createdTime: number

  /**
   * Last time timestamp updated
   *
   * @type {Object}
   */
  lastTime: number

  /**
   * The lifetime of the UI.
   *
   * @type {Number}
   */
  lifetime: number

  /**
   * Time already lived
   *
   * @type {Number}
   */
  timeElapsed: number

  /**
   * Init Data
   *
   * @param {Array} pos   - The position.
   * @param {String} text - The text.
   */
  constructor (pos: any, text: string) {
    this.id = +Date.now()
    this.text = text
    this.pos = pos
    this.alpha = 1
    this.angle = 1
    this.speed = 100
    this.velocity = { x: 0.2, y: -1 }
    this.createdTime = +Date.now()
    this.lastTime = +Date.now()
    this.lifetime = 1000
    this.timeElapsed = 0
  }

  /**
   * Update the position.
   *
   * Check if this UI need to be deleted.
   *
   * @param {Number} dt - The deltaTime.
   */
  update (dt: number): void {
    this.lastTime = +Date.now()

    this.timeElapsed = this.lastTime - this.createdTime

    this.pos[0] += dt * this.speed * this.velocity.x * Math.cos(this.angle)
    this.pos[1] += dt * this.speed * this.velocity.y * Math.sin(this.angle)

    if (this.timeElapsed >= this.lifetime) {
      this.ui.destroy(this.id)
    }
  }

  /**
   * Draw the UI
   *
   * @param {Game} game - The Game Object.
   */
  draw (game: Game): void {
    this.alpha = (this.lifetime - this.timeElapsed) / 1000 * 1
    game.ctx.save()
    game.ctx.globalAlpha = this.alpha
    game.ctx.fillStyle = '#eb2f06'
    game.ctx.fillText('-10', this.pos[0] - game.camera.x, this.pos[1] - game.camera.y)
    game.ctx.restore()
  }
}
