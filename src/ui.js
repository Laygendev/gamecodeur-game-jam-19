/**
 * @fileOverview UI Class handle UI Text in game with effect like velocity,
 * alpha.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a UI. */
class UI { // eslint-disable-line
  /**
   * Init data
   *
   * @param {Game} game - the Game Object.
   */
  constructor (game) {
    /**
     * The Game Object
     *
     * @type {Object}
     */
    this.game = game

    /**
     * An array of entities correspond to UI text, or UI Image, or UI Whatever.
     *
     * @type {Array}
     */
    this.entities = []
  }

  /**
   * Add an entity
   *
   * @param {UIText} entity - An UI Text.
   */
  add (entity) {
    entity.ui = this
    this.entities[entity.id] = entity
  }

  /**
   * For each entity, call update with the deltaTime.
   */
  update (dt) {
    for (var key in this.entities) {
      this.entities[key].update(dt)
    }
  }

  /**
   * For each entity, call draw with
   */
  draw () {
    for (var key in this.entities) {
      this.entities[key].draw(this.game)
    }
  }

  /**
   * Delete by the entityID from the entities array.
   *
   * @param {Number} entityID - The ID of the entity to delete.
   */
  destroy (entityID) {
    delete this.entities[entityID]
  }

  /**
   * Display Damage (Nothing to do here)
   * Called when player receive damage.
   *
   * @param {Object} data - The position of the UI Text.
   */
  displayDamage (data) {
    var text = new UIText(data.position, 10)
    this.add(text)
  }
}

/** Class representing a UIText. */
class UIText {
  /**
   * Init Data
   *
   * @param {Array} pos   - The position.
   * @param {String} text - The text.
   */
  constructor (pos, text) {
    /**
     * The ID
     *
     * @type {Number}
     */
    this.id = +Date.now()

    /**
     * The text to display
     *
     * @type {String}
     */
    this.text = text

    /**
     * The position
     *
     * @type {Array}
     */
    this.pos = pos

    /**
     * Alpha
     *
     * @type {Number}
     */
    this.alpha = 1

    /**
     * Angle
     *
     * @type {Object}
     */
    this.angle = 1

    /**
     * Speed
     *
     * @type {Object}
     */
    this.speed = 100

    /**
     * The Velocity.
     *
     * @type {Object}
     */
    this.velocity = { x: 0.2, y: -1 }

    /**
     * The timestamp when created.
     *
     * @type {Number}
     */
    this.createdTime = +Date.now()

    /**
     * Last time timestamp updated
     *
     * @type {Object}
     */
    this.lastTime = +Date.now()

    /**
     * The lifetime of the UI.
     *
     * @type {Number}
     */
    this.lifetime = 1000

    /**
     * Time already lived
     *
     * @type {Number}
     */
    this.timeElapsed = 0
  }

  /**
   * Update the position.
   *
   * Check if this UI need to be deleted.
   *
   * @param {Number} dt - The deltaTime.
   */
  update (dt) {
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
  draw (game) {
    this.alpha = (this.lifetime - this.timeElapsed) / 1000 * 1
    game.ctx.save()
    game.ctx.globalAlpha = this.alpha
    game.ctx.fillStyle = '#eb2f06'
    game.ctx.fillText('-10', this.pos[0] - game.camera.x, this.pos[1] - game.camera.y)
    game.ctx.restore()
  }
}
