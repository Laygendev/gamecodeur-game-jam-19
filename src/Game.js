/**
 * @fileOverview Game class handle the main update, drawing tank and bullet and
 * input.
 *
 * @author BwooGames
 * @version 0.1.0
 */

var Room = window.Room
var HtmlUI = window.htmlUI
var Loader = window.Loader
var Input = window.Input
var UI = window.UI
var Player = window.Player
var Camera = window.Camera
var Constants = window.Constants
var Util = window.Util
var requestAnimationFrame = window.requestAnimationFrame

/** Class representing a Game. */
class Game { // eslint-disable-line

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
     * Room Object.
     *
     * @type {Room}
     */
    this.room = new Room(this, this.socket)

    /**
     * HTML UI Object.
     *
     * @type {htmlUI}
     */
    this.htmlUI = new HtmlUI(this, this.socket)

    /**
     * The position.
     *
     * @type {Array}
     */
    this.loader = new Loader(this)
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

    this.input = new Input(this)
    this.ui = new UI(this)
    this.room.load()

    requestAnimationFrame(() => { this.gameLoop() })
  }

  /**
   * Stop the game
   *
   * Reset all data.
   */
  stop () {
    this.started = false
    this.tanks = []
    this.projectiles = []
    this.htmlUI.isLookingForRoom = false
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
  }

  /**
   * Add new Player
   *
   * @param {Object} data - Data of the current player.
   */
  addPlayer (data) {
    this.tanks[data.id] = new Player(data.position, data.orientation, data.name, data.id, data.screen)

    if (this.id === data.id) {
      this.camera = new Camera(this)
      this.camera.setTarget(this.tanks[this.id], data.screen.hW, data.screen.hH)
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

    requestAnimationFrame(() => { this.gameLoop() })
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
    var tile = 0 // eslint-disable-line
    var key

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    for (var x = 0; x < Constants.WORLD_MAX; x += 40) {
      for (var y = 0; y < Constants.WORLD_MAX; y += 40) {
        if (this.camera.inViewport(x, y)) {
          this.ctx.drawImage(this.ressources['tile'], x - this.camera.x, y - this.camera.y)
          tile++
        }
      }
    }

    this.ctx.drawImage(this.ressources['ile'], 2000 - this.camera.x, 2000 - this.camera.y)

    for (key in this.projectiles) {
      this.drawBullets(this.projectiles[key], dt)
    }

    for (key in this.tanks) {
      this.drawTanks(this.tanks[key])
    }

    if (this.tanks[this.id]) {
      this.ctx.save()
      this.ctx.font = '20px Arial'
      this.ctx.fillText('X: ' + parseInt(this.tanks[this.id].position[0]) + ' Y: ' + parseInt(this.tanks[this.id].position[1]), 20, 40)
      this.ctx.restore()
    }

    this.ui.draw()
  }

  /**
   * Draw a Tank
   *
   * @param {Array} tank - Tank info: coordinate...
   */
  drawTanks (tank) {
    if ((tank.isVisibleTo(this.tanks[this.id]) && !tank.waitMessage) || tank.id === this.id) {
      this.ctx.save()
      this.ctx.translate(tank.position[0] - this.camera.x, tank.position[1] - this.camera.y)
      this.ctx.rotate(tank.orientation)

      if (tank.death) {
        this.ctx.globalAlpha = 0.5
      }

      this.ctx.drawImage(this.ressources['tank'], -70 / 2, -60 / 2)
      this.ctx.restore()

      this.ctx.save()
      this.ctx.translate(tank.position[0] - this.camera.x, tank.position[1] - this.camera.y)
      this.ctx.rotate(tank.turretAngle)

      if (tank.death) {
        this.ctx.globalAlpha = 0.5
      }

      this.ctx.drawImage(this.ressources['canon'], 20 + -this.ressources['canon'].width / 2, -this.ressources['canon'].height / 2)
      this.ctx.restore()

      if (!tank.death) {
        this.ctx.fillRect(tank.position[0] - this.camera.x - 50, tank.position[1] - this.camera.y - 50, 100, 10)
        this.ctx.save()
        this.ctx.fillStyle = '#556B2F'
        this.ctx.fillRect(tank.position[0] - this.camera.x - 50, tank.position[1] - this.camera.y - 50, tank.health * 100 / Constants.PLAYER_MAX_HEALTH, 10)
        this.ctx.restore()

        this.ctx.font = '26px Arial'
        this.ctx.fillText(tank.name, tank.position[0] - this.camera.x - this.ctx.measureText(tank.name).width / 2, tank.position[1] - this.camera.y - 70)
      }
    } else {
      tank.waitMessage = true
    }
  }

  /**
   * Draw a bullet
   *
   * @param {Array} bullet - Bullet info: coordinate...
   * @param {Number} dt    - The deltaTime.
   */
  drawBullets (bullet, dt) {
    var distance = Math.sqrt(Util.sqr(bullet.initPos[1] - bullet.position[1]) + Util.sqr(bullet.initPos[0] - bullet.position[0]))
    distance *= 0.3

    if (distance > 100) {
      distance = 100
    }

    for (var i = 0; i < distance; i++) {
      this.ctx.save()

      var copy = {
        x: bullet.position[0],
        y: bullet.position[1]
      }

      copy.x -= i * 200 * dt * Math.cos(bullet.angle)
      copy.y -= i * 200 * dt * Math.sin(bullet.angle)

      this.ctx.translate(copy.x - this.camera.x + this.ressources['fire'].width, copy.y - this.camera.y + this.ressources['fire'].height)
      this.ctx.rotate(bullet.angle)
      this.ctx.globalAlpha = (0.9 / i)

      this.ctx.drawImage(this.ressources['fire'], -this.ressources['fire'].width / 2, -this.ressources['fire'].height / 2)
      this.ctx.restore()
    }

    this.ctx.save()

    this.ctx.translate(bullet.position[0] - this.camera.x + this.ressources['fire'].width, bullet.position[1] - this.camera.y + this.ressources['fire'].height)
    this.ctx.rotate(bullet.angle)

    this.ctx.drawImage(this.ressources['fire'], -this.ressources['fire'].width / 2, -this.ressources['fire'].height / 2)
    this.ctx.restore()
  }
}
