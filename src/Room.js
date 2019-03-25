/**
 * @fileOverview Room class handle message from server room.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a Room. */
window.Room = class Room { // eslint-disable-line
  /**
   * Init data.
   *
   * @param {Game} game     - The Game Object.
   * @param {Socket} socket - The Socket Object.
   */
  constructor (game, socket) {
    /**
     * The Game Object.
     *
     * @type {Game}
     */
    this.game = game

    /**
     * The client Socket
     *
     * @type {Socket}
     */
    this.socket = socket

    /**
     * The World Object
     *
     * @type {Socket}
     */
    this.world = undefined

    /**
     * Message receive by Server
     *
     * @type {Array}
     */
    this.messages = []

    /**
     * Attach event socket
     */
    this.socket.on('room-spawn', (data) => { this.spawn(data) })
    this.socket.on('room-timer-start', (data) => { this.updateTimeToStart(data) })
    this.socket.on('room-start', (data) => { this.start(data) })
    this.socket.on('room-messages', (data) => { this.receiveMessage(data) })
    this.socket.on('room-update', (data) => { this.receiveUpdate(data) })
    this.socket.on('room-update-ui', (data) => { this.receiveUpdateUI(data) })
    this.socket.on('room-remove-player', (id) => { this.removePlayer(id) })
  }

  /**
   * When receive 'room-spawn' event.
   *
   * @param {Object} data - Spawn info.
   */
  spawn (data) {
    this.game.addPlayer(data)

    for (var key in data.players) {
      this.game.addPlayer(data.players[key])
    }

    this.game.htmlUI.updateLeftPlayer(data.numberAlive)
    this.game.htmlUI.updateTimeToStart('En attente d\'autre joueur')
    document.querySelector('.start-game').style.display = 'true'

    this.game.start()
  }

  /**
   * When receive 'room-timer-start' event.
   *
   * @param {Object} data - Timer room info.
   */
  updateTimeToStart (data) {
    this.game.htmlUI.updateTimeToStart(data.message)
  }

  /**
   * When game call load, init World.
   */
  load () {
    this.world = new window.World(this.game.ressources['worldCollider'], this.game)
  }

  /**
   * When receive 'room-start' event.
   *
   * @param {Object} data - Room start event.
   */
  start (data) {
    this.game.tanks[data.id].position = data.position
    this.game.htmlUI.hideStartMessage()
  }

  /**
   * When receive 'room-messages' event.
   *
   * Add action to message array with the timestamp received by server + lag.
   *
   * @param {Object} data - Action players data.
   */
  receiveMessage (data) {
    var receiveTimestamp = +new Date()

    this.messages.push({
      receiveTimestamp: receiveTimestamp + data[1],
      worldState: data.worldState
    })
  }

  /**
   * When receive 'room-update' event.
   *
   * @param {Object} data - Update data.
   */
  receiveUpdate (data) {
    this.game.projectiles = data.projectiles
  }

  /**
   * When receive 'room-update-ui' event.
   *
   * @param {Object} data - Update ui info.
   */
  receiveUpdateUI (data) {
    if (data.hit) {
      this.game.ui.displayDamage(data.hit)
    }

    if (data.numberAlive) {
      this.game.htmlUI.updateLeftPlayer(data.numberAlive)
    }

    if (data.message) {
      this.game.htmlUI.addMessage(data.message)
    }

    if (data.kills) {
      this.game.htmlUI.updateKill(data.kills)
    }

    if (data.top) {
      this.game.htmlUI.displayTop(data.top)
    }
  }

  /**
   * When receive 'room-remove-player' event.
   *
   * @param {Number} id - the ID of the player to remove.
   */
  removePlayer (id) {
    this.game.removePlayer(id)
  }

  /**
   * Main update loop called by game.
   */
  update () {
    this.processServerMessage()
    this.interpolateEntities()
  }

  /**
   * Get recents message from server.
   */
  getAvailableMessage () {
    let now = +new Date()
    for (var i = 0; i < this.messages.length; ++i) {
      let message = this.messages[i]

      if (message.receiveTimestamp <= now) {
        this.messages.splice(i, 1)

        return {
          worldState: message.worldState
        }
      }
    }
  }

  /**
   * Handle server message for update entity state.
   */
  processServerMessage () {
    while (true) {
      var messages = this.getAvailableMessage()

      if (!messages) {
        break
      }

      for (var i = 0; i < messages.worldState.length; ++i) {
        var state = messages.worldState[i]

        var entity = this.game.tanks[state.id]

        if (state.id === this.game.id) {
          entity.position = state.position
          entity.speed = state.speed
          entity.canSpeed = state.canSpeed
          entity.velocity = state.velocity
          entity.orientation = state.orientation
          entity.turretAngle = state.turretAngle
          entity.health = state.health
          entity.death = state.death

          var j = 0
          while (j < this.game.pendingInputs.length) {
            var input = this.game.pendingInputs[j]

            // If message already processed.
            if (input[2] <= state.lastProcessedInput) {
              this.game.pendingInputs.splice(j, 1)
            } else {
              // Or do update.
              entity.updateOnInput(input, this.world)
              j++
            }
          }
        } else {
          if (entity) {
            entity.health = state.health
            entity.death = state.death

            var timestamp = +new Date()

            // Add to positionBuffer for interpolate client.
            entity.positionBuffer.push([
              timestamp,
              state.position[0],
              state.position[1],
              state.orientation,
              state.turretAngle])
          }
        }
      }
    }
  }

  /**
   * Interpolate client position with render timestamp.
   */
  interpolateEntities () {
    var now = +new Date()
    var renderTimestamp = now - (1000.0 / 10)
    for (var i in this.game.tanks) {
      var entity = this.game.tanks[i]

      if (entity.id === this.id) {
        continue
      }

      var buffer = entity.positionBuffer

      // Delete buffer already treated.
      while (buffer.length >= 2 && buffer[1][0] <= renderTimestamp) {
        buffer.shift()
      }

      if (buffer.length >= 2 && buffer[0][0] <= renderTimestamp && renderTimestamp <= buffer[1][0]) {
        var t0 = buffer[0][0]
        var t1 = buffer[1][0]
        var x0 = buffer[0][1]
        var x1 = buffer[1][1]
        var y0 = buffer[0][2]
        var y1 = buffer[1][2]
        var orientation0 = buffer[0][3]
        var orientation1 = buffer[1][3]
        var turretAngle0 = buffer[0][4]
        var turretAngle1 = buffer[1][4]

        entity.position[0] = x0 + (x1 - x0) * (renderTimestamp - t0) / (t1 - t0)
        entity.position[1] = y0 + (y1 - y0) * (renderTimestamp - t0) / (t1 - t0)
        entity.orientation = orientation0 + (orientation1 - orientation0) * (renderTimestamp - t0) / (t1 - t0)
        entity.turretAngle = turretAngle0 + (turretAngle1 - turretAngle0) * (renderTimestamp - t0) / (t1 - t0)
        entity.waitMessage = false
      }
    }
  }
}
