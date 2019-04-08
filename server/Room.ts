/**
 * @fileOverview Room class manage the state of existing players and entities.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Player } from './../Shared/Player'
import { Bullet } from './Bullet'
import { World } from './../Shared/World'
import { Server } from './Server' // eslint-disable-line
import { Constants } from './../Shared/Constants'

/** Class represening a room. */
export class Room {
  /**
   * The room ID.
   *
   * @type {Number}
   */
  public id: number

  /**
   * The Server instance Server class.
   *
   * @type {Server}
   */
  public server: Server

  /**
   * The World Object.
   *
   * @type {World}
   */
  public world: World

  /**
   * A collection of players.
   *
   * @type {HashMap}
   */
  public players: Map<number, any>

  /**
   * An array of received message from client.
   *
   * @type {HashMap}
   */
  public messages: any[]

  /**
   * An array of projectiles.
   *
   * @type {HashMap}
   */
  public projectiles: any[]

  /**
   * Number player alive.
   *
   * @type {Number}
   */
  public numberAlive: number

  /**
   * Room need to be deleted or not.
   *
   * @type {Boolean}
   */
  public needToDeleted: boolean

  /**
   * Room is started or not.
   *
   * @type {Boolean}
   */
  public isStarted: boolean

  /**
   * Room is waiting to start or not.
   *
   * @type {Boolean}
   */
  public isWaitingForStart: boolean

  /**
   * Timestamp when try to start the room.
   *
   * @type {Number}
   */
  public timerTryToStart: number

  /**
   * Try to start room or not.
   *
   * @type {Boolean}
   */
  public onTryToStart: boolean
  /**
   * Create a room.
   *
   * Init all properties needed from the room Object.
   *
   * @param {Number} id - The room ID.
   * @param {Server} server - The Server instance Server class.
   */
  constructor (id: number, server: Server) {
    this.id = id
    this.server = server
    this.world = new World(server.ressources['map'])
    this.players = new Map()
    this.messages = []
    this.projectiles = []
    this.numberAlive = 0
    this.needToDeleted = false
    this.isStarted = false
    this.isWaitingForStart = false
    this.timerTryToStart = 0
    this.onTryToStart = false
  }

  /**
   * Add a new player to the collection Players.
   *
   * @param {Socket} socket - The current socket.
   * @param {Object} data   - Data of player.
   *
   * @return {Number}         Return the size of the collection players.
   */
  addNewPlayer (socket: any, data: any): number {
    this.players.set(socket.id, Player.generateNewPlayer(data.name, socket.id, data.screen))

    return this.players.size
  }

  /**
   * Send for all client the position of all players.
   *
   * @param {Number} id - The id of current socket.
   */
  spawn (id: number): void {
    this.numberAlive++
    this.isWaitingForStart = true
    this.onTryToStart = false

    var currentClient = this.server.clients.get(id)
    var currentPlayer = this.players.get(id)

    currentClient.socket.emit('room-spawn', {
      id: id,
      name: currentPlayer.name,
      position: currentPlayer.position,
      orientation: currentPlayer.orientation,
      screen: currentPlayer.screen,
      numberAlive: this.players.size
      // players: this.players.values().filter(function (player: Player) {
      //   if (player.id === currentPlayer.id) {
      //     return false
      //   }
      //
      //   return true
      // })
    })

    var ids: any = this.players.keys()
    for (var i = 0; i < ids.length; i++) {
      var otherClient = this.server.clients.get(ids[i])

      if (id !== ids[i]) {
        otherClient.socket.emit('room-spawn', {
          numberAlive: this.players.size,
          id: id,
          name: currentPlayer.name,
          position: currentPlayer.position
        })
      }
    }
  }

  /**
   * Try to start the room
   */
  tryToStart (): void {
    this.onTryToStart = true
    this.timerTryToStart = (new Date()).getTime()
  }

  /**
   * Start the room. Send the new position to all connected client
   */
  start (): void {
    this.isStarted = true

    var ids: any = this.players.keys()
    for (var i = 0; i < ids.length; i++) {
      var currentClient = this.server.clients.get(ids[i])
      var currentPlayer = this.players.get(ids[i])

      currentPlayer.position = World.getRandomPoint()

      currentClient.socket.emit('room-start', {
        id: ids[i],
        position: currentPlayer.position
      })
    }
  }

  /**
   * Remove a player from the room. And send to all connected socket in the
   * room a message "room-remove-player"
   *
   * Check number alive and check if we need to close the room
   *
   * @param {Number} id - The socket id of the removed player.
   *
   * @return {String}     The name of the removed player.
   */
  removePlayer (id: number): string {
    var name = ''
    if (this.players.has(id)) {
      var player = this.players.get(id)
      name = player.name

      // this.players.remove(id)
      this.server.io.to(this.id).emit('room-remove-player', id)
      this.numberAlive--
      this.checkNumberAlive()
    }

    this.checkCloseRoom()

    return name
  }

  /**
   * Check if we need to delete this room or not.
   */
  checkCloseRoom (): void {
    if (this.players.size === 0) {
      this.needToDeleted = true
    }
  }

  /**
   * Check number player alive.
   *
   * If only one player is alive, send him "room-update-ui" for display top 1.
   */
  checkNumberAlive (): void {
    if (this.numberAlive <= 1) {
      var alivePlayer = null
      var ids: any = this.players.keys()
      for (var i = 0; i < ids.length; i++) {
        var player = this.players.get(ids[i])

        if (!player.death) {
          alivePlayer = player
          break
        }
      }

      if (alivePlayer) {
        var currentClient = this.server.clients.get(alivePlayer.id)
        currentClient.socket.emit('room-update-ui', { top: this.numberAlive })
      }
    }
  }

  /**
   * Main update loop.
   *
   * Update timer to try to start room.
   * Update projectiles position.
   * Delete projectiles need to be deleted.
   *
   * @param {Number} dt - The deltatime (Needed for update position).
   */
  update (dt: number): void {
    var i
    var currentClient

    if (this.onTryToStart) {
      this.server.io.to(this.id).emit('room-timer-start', {
        message: 'Lancement de la partie dans ' + ((Constants.DEFAULT_TIME_TO_START_ROOM - ((new Date()).getTime() - this.timerTryToStart) / 1000) + 1) + ' secondes'
      })

      if ((new Date()).getTime() > this.timerTryToStart + Constants.DEFAULT_TIME_TO_START_ROOM) {
        this.onTryToStart = false
        this.start()
      }
    }

    for (i = 0; i < this.projectiles.length; ++i) {
      var hitInfo = this.projectiles[i].update(this, this.players, dt)

      if (hitInfo) {
        if (hitInfo.killingPlayer) {
          currentClient = this.server.clients.get(hitInfo.killingPlayer.id)
          currentClient.socket.emit('room-update-ui', { kills: hitInfo.killingPlayer.kills })
        }

        if (hitInfo.hitPlayer.death) {
          this.numberAlive--
          this.server.io.to(this.id).emit('room-update-ui', {
            numberAlive: this.numberAlive,
            message: hitInfo.killingPlayer.name + ' kill ' + hitInfo.hitPlayer.name
          })
          currentClient = this.server.clients.get(hitInfo.hitPlayer.id)
          currentClient.socket.emit('room-update-ui', { top: (this.numberAlive + 1) })
          currentClient.socket.emit('room-u-death')

          this.checkNumberAlive()
        }
      }

      if (this.projectiles[i].needToDeleted) {
        this.projectiles.splice(i, 1)
      }
    }
  }

  /**
   * Receive an action from client and store it with their timestamp in
   * messages array.
   *
   * @param {Socket} socket - The client socket.
   * @param {Client} client - The client.
   * @param {Object} data   - The player data.
   */
  receiveAction (socket: any, client: any, data: any) {
    var now = +new Date()

    var player = this.players.get(socket.id)

    if (player) {
      client.lag = data[1]

      this.messages.push({
        receiveTimestamp: now + data[1],
        payload: data
      })
    }
  }

  /**
   * Get recents message from client
   */
  getAvailableMessage (): void {
    var now = +new Date()
    for (var i = 0; i < this.messages.length; i++) {
      var message = this.messages[i]
      if (message.receiveTimestamp <= now) {
        this.messages.splice(i, 1)
        return message.payload
      }
    }
  }

  /**
   * Handle input received by client.
   */
  processInput (): void {
    while (true) {
      var message: any = this.getAvailableMessage()
      if (!message) {
        break
      }

      var id = message[0]
      var player = this.players.get(id)

      if (player) {
        player.updateOnInput(message, this.world)

        if (message[4] && player.canShoot()) {
          this.projectiles.push(new Bullet(JSON.parse(JSON.stringify(player.position)), player.turretAngle, player.id))

          player.lastShotTime = (new Date()).getTime()
        }

        player.lastProcessedInput = message[2]
      }
    }
  }

  /**
   * Send  to all client, the current state of the projectiles visible to him.
   */
  sendState (): void {
    var currentClient: any
    var currentPlayer: any

    var ids: any = this.players.keys()
    for (var i = 0; i < ids.length; ++i) {
      currentClient = this.server.clients.get(ids[i])
      currentPlayer = this.players.get(ids[i])

      currentClient.socket.emit('room-update', {
        projectiles: this.projectiles.filter(function (projectile) {
          return projectile.isVisibleTo(currentPlayer)
        })
      })
    }
  }

  /**
   * Send to all client, the current state of players visible to him.
   */
  sendPlayersState (): void {
    var currentClient: any
    var currentPlayer: any

    var ids: any = this.players.keys()
    for (var i = 0; i < ids.length; ++i) {
      currentClient = this.server.clients.get(ids[i])
      currentPlayer = this.players.get(ids[i])
      currentPlayer.canSpeed = currentPlayer.canISpeed()

      currentClient.socket.emit('room-messages', {
        1: currentClient.lag
        // worldState: this.players.values().filter(function (player: any) {
        //   if (player.isVisibleTo(currentPlayer)) {
        //     player.isVisible = true
        //     return true
        //   } else {
        //     if (player.isVisible) {
        //       player.isVisible = false
        //       return true
        //     }
        //   }
        //
        //   if (!player.isVisible) {
        //     return false
        //   }
        //
        //   return true
        // })
      })
    }
  }
}
