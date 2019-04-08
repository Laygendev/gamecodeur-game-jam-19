/**
 * @fileOverview Game class handle the main update, drawing tank and bullet and
 * input.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Camera } from './Camera'
import { UI } from './ui'
import { Drawing } from './Drawing'
import { Room } from './Room'
import { HTMLUI } from './HtmlUI'
import { Loader } from './Loader'
import { Input } from './Input'
import { Player } from './../Shared/Player'

/** Class representing a Game. */
export class Game {
  /**
   * The client Socket
   *
   * @type {Socket}
   */
  socket: any

  /**
   * The socket ID.
   *
   * @type {Number}
   */
  id: number

  /**
   * An array with input sending by client.
   *
   * @type {Array}
   */
  pendingInputs: any

  /**
   * Game is started ?
   *
   * @type {Boolean}
   */
  started: boolean

  /**
   * The Canvas
   *
   * @type {HTMLCanvas}
   */
  canvas: any

  /**
   * The Context..
   *
   * @type {HTMLContext2D}
   */
  ctx: any

  /**
   * The game latency
   *
   * @type {number}
   */
  latency: number

  /**
   * The last timestamp in the main Loop.
   *
   * @type {Number}
   */
  lastTimestamp: number

  /**
  * The input sequence number for processInput.
  *
  * @type {Number}
  */
  inputSequenceNumber: number

  /**
  * Array of loaded assets ressource.
  *
  * @type {Array}
  */
  ressources: []

  /**
  * Array of tanks.
  *
  * @type {Array}
  */
  tanks: Player[]

  /**
  * Array of projectiles.
  *
  * @type {Array}
  */
  projectiles: []

  /**
  * Input Object.
  *
  * @type {any}
  */
  input: any

  /**
  * Camera Object.
  *
  * @type {Camera}
  */
  camera: Camera
  /**
  * UI Object.
  *
  * @type {UI}
  */
  ui: UI

  /**
  * Drawing Object
  *
  * @type {Drawing}
  */
  drawing: Drawing

  /**
  * Room Object.
  *
  * @type {Room}
  */
  room: Room

  /**
  * HTML UI Object.
  *
  * @type {htmlUI}
  */
  htmlUI: HTMLUI

  /**
  * Loader object.
  *
  * @type {Loader}
  */
  loader: Loader

  /**
  * Init data and load assets.
  *
  * @param {Socket} socket - The client socket.
  */
  constructor (socket: any) {
    this.socket = socket
    this.id = null
    this.pendingInputs = []
    this.started = false
    this.canvas = document.getElementById('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.lastTimestamp = 0
    this.inputSequenceNumber = 0
    this.latency = 0

    this.canvas.width = window.innerWidth
    this.canvas.height = window.innerHeight

    this.ressources = []
    this.tanks = []
    this.projectiles = []
    this.input = null
    this.camera = undefined
    this.ui = undefined

    this.drawing = new Drawing(this)
    this.room = new Room(this, this.socket)
    this.htmlUI = new HTMLUI(this, this.socket)

    this.loader = new Loader(this)
    this.loader.loadImage('tank', 'asset/tank.png')
    this.loader.loadImage('canon', 'asset/canon.png')
    this.loader.loadImage('fire', 'asset/fire.png')
    this.loader.loadImage('tiles', 'asset/tile.png')
    this.loader.loadImage('endcanon', 'asset/endcanon.png')
    this.loader.loadJSONMap('map', 'asset/maptest.json')
    this.loader.loadJSONTileset('tileset', 'asset/Tiles.json')

    this.loader.start()
  }

  /**
   * Start the game
   */
  start (): void {
    this.started = true

    this.htmlUI.switchUI()

    this.input = new Input(this)
    this.ui = new UI(this)
    this.room.load()

    window.requestAnimationFrame(() => { this.gameLoop() })
  }

  /**
   * Stop the game
   *
   * Reset all data.
   */
  stop (): void {
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
  addPlayer (data: any): void {
    this.tanks[data.id] = new Player(data.position, data.orientation, data.name, data.id, data.screen)

    if (this.id === data.id) {
      this.camera = new Camera(this)
      this.camera.setTarget(this.tanks[this.id], data.screen.hW, data.screen.hH)
      this.start()
    }
  }

  /**
   * Remove a player from the tanks array.
   *
   * @param {Number} id - The Socket ID.
   */
  removePlayer (id: number): void {
    delete this.tanks[id]
  }

  /**
   * Main loop of the game.
   *
   * Update timestamp for get deltaTime.
   *
   * Call update and draw method.
   */
  gameLoop (): void {
    if (this.started) {
      var nowTimestamp = +new Date()
      var lastTimestamp = this.lastTimestamp || nowTimestamp
      var dt = (nowTimestamp - lastTimestamp) / 1000.0
      this.lastTimestamp = nowTimestamp

      this.update(dt)
      this.draw()
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
  update (dt: number): void {
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
  processInput (dt: number): void {
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
   */
  draw (): void {
    var key: any

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    this.drawing.drawTiles()
    // this.drawing.drawWorld()

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
