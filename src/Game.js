/**
 * @fileOverview Game class handle the main update, drawing tank and bullet and
 * input.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a Game. */
window.Game = class Game { // eslint-disable-line

  /**
   * Init data and load assets.
   *
   * @param {Socket} socket - The client socket.
   */
  constructor (socket) {
    /**
     * The client Socket
     *
     * @type {Socket}
     */
    this.socket = socket

    /**
     * The socket ID.
     *
     * @type {Number}
     */
    this.id = null

    /**
     * An array with input sending by client.
     *
     * @type {Array}
     */
    this.pendingInputs = []

    /**
     * Game is started ?
     *
     * @type {Boolean}
     */
    this.started = false

    /**
     * The Canvas
     *
     * @type {HTMLCanvas}
     */
    this.canvas = document.getElementById('canvas')

    /**
     * The Context..
     *
     * @type {HTMLContext2D}
     */
    this.ctx = this.canvas.getContext('2d')

    /**
     * The last timestamp in the main Loop.
     *
     * @type {Number}
     */
    this.lastTimestamp = 0

    /**
     * The input sequence number for processInput.
     *
     * @type {Number}
     */
    this.inputSequenceNumber = 0

    /**
     * The canvas Width.
     *
     * @type {Number}
     */
    this.canvas.width = window.innerWidth

    /**
     * The canvas Height.
     *
     * @type {Number}
     */
    this.canvas.height = window.innerHeight

    /**
     * Array of loaded assets ressource.
     *
     * @type {Array}
     */
    this.ressources = []

    /**
     * Array of tanks.
     *
     * @type {Array}
     */
    this.tanks = []

    /**
     * Array of projectiles.
     *
     * @type {Array}
     */
    this.projectiles = []

    /**
     * Input Object.
     *
     * @type {Input}
     */
    this.input = null

    /**
     * Camera Object.
     *
     * @type {Camera}
     */
    this.camera = undefined

    /**
     * UI Object.
     *
     * @type {UI}
     */
    this.ui = undefined

    /**
     * Drawing Object
     *
     * @type {Drawing}
     */
    this.drawing = new window.Drawing(this)

    /**
     * Room Object.
     *
     * @type {Room}
     */
    this.room = new window.Room(this, this.socket)

    /**
     * HTML UI Object.
     *
     * @type {htmlUI}
     */
    this.htmlUI = new window.HtmlUI(this, this.socket)

    /**
     * The position.
     *
     * @type {Array}
     */
    this.loader = new window.Loader(this)
    this.loader.loadImage('tile', 'asset/tile.png')
    this.loader.loadImage('tank', 'asset/tank.png')
    this.loader.loadImage('canon', 'asset/canon.png')
    this.loader.loadImage('fire', 'asset/fire.png')
    this.loader.loadImage('endcanon', 'asset/endcanon.png')
    this.loader.loadImage('ile', 'asset/ile.png')
    this.loader.loadJSON('worldCollider', 'asset/worldCollider.json')

    this.loader.start()
  }

  /**
   * Start the game
   */
  start () {
    this.started = true

    this.htmlUI.switchUI()

    this.input = new window.Input(this)
    this.ui = new window.UI(this)
    this.room.load()

    window.requestAnimationFrame(() => { this.gameLoop() })
  }

  /**
   * Stop the game
   *
   * Reset all data.
   */
  stop () {
    this.started = false
    this.htmlUI.isLookingForRoom = false

    this.tanks = []
    this.projectiles = []
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Add new Player
   *
   * @param {Object} data - Data of the current player.
   */
  addPlayer (data) {
    this.tanks[data.id] = new window.Player(data.position, data.orientation, data.name, data.id, data.screen)

    if (this.id === data.id) {
      this.camera = new window.Camera(this)
      this.camera.setTarget(this.tanks[this.id], data.screen.hW, data.screen.hH)
      this.start()
    }
  }

  /**
   * Remove a player from the tanks array.
   *
   * @param {Number} id - The Socket ID.
   */
  removePlayer (id) {
    delete this.tanks[id]
  }

  /**
   * Main loop of the game.
   *
   * Update timestamp for get deltaTime.
   *
   * Call update and draw method.
   */
  gameLoop () {
    if (this.started) {
      var nowTimestamp = +new Date()
      var lastTimestamp = this.lastTimestamp || nowTimestamp
      var dt = (nowTimestamp - lastTimestamp) / 1000.0
      this.lastTimestamp = nowTimestamp

      this.update(dt)
      this.draw(dt)
    }

    window.requestAnimationFrame(() => { this.gameLoop() })
  }

  /**
   * For UI, Camera, Room, call Update.
   *
   * And processInput.
   *
   * @param {Number} dt - The deltaTime.
   */
  update (dt) {
    this.ui.update(dt)
    this.processInput(dt)
    this.camera.update()
    this.room.update()
  }

  /**
   * Process input key and emit to the server.
   *
   * Handle turretAngle.
   *
   * @param {Number} dt - The deltaTime.
   */
  processInput (dt) {
    this.tanks[this.id].turretAngle = Math.atan2((this.input.mousePosition.y + this.camera.y) - this.tanks[this.id].position[1],
      (this.input.mousePosition.x + this.camera.x) - this.tanks[this.id].position[0])

    var input = {}

    input[0] = this.id
    input[1] = this.latency
    input[2] = this.inputSequenceNumber++
    input[3] = this.tanks[this.id].turretAngle
    input[4] = this.input.leftClickPressed

    input[8] = 0 // UP
    input[9] = 0 // LEFT
    input[10] = 0 // RIGHT
    input[11] = 0 // DOWN
    input[12] = false // Space

    if (this.input.keyPressed.up || this.input.keyPressed.Z) {
      input[8] = dt
    }

    if (this.input.keyPressed.left || this.input.keyPressed.Q) {
      input[9] = dt
    }

    if (this.input.keyPressed.right || this.input.keyPressed.D) {
      input[10] = dt
    }

    if (this.input.keyPressed.down || this.input.keyPressed.S) {
      input[11] = dt
    }

    if (this.input.keyPressed.space && this.tanks[this.id].canSpeed) {
      input[12] = true
    }

    this.tanks[this.id].updateOnInput(input, this.room.world)
    this.socket.emit('player-action', input)

    this.pendingInputs.push(input)
  }

  /**
   * Draw tile, map, bullets, tank.
   *
   * @param {Number} dt - The deltaTime.
   */
  draw (dt) {
    var key

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.drawing.drawTiles()
    this.drawing.drawWorld()

    for (key in this.projectiles) {
      this.drawing.drawBullet(this.projectiles[key])
    }

    for (key in this.tanks) {
      this.drawing.drawTank(this.tanks[key])
    }

    if (this.tanks[this.id]) {
      this.drawing.drawText()
    }

    this.ui.draw()
  }
}
