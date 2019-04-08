/**
 * @fileOverview Server class manage basic socket message and dispatch it to
 * room Object.
 *
 * Also manage two intervals: the main update, and the updatePlayers.
 * Also manage new player connection and room creation.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import express from 'express'
import io from 'socket.io-client' // eslint-disable-line
import path from 'path'

import { Room } from './Room'
import { Load } from './Load'
import { Constants } from './../shared/Constants'

/** Class represening a server. */
export class Server {
  /**
   * Express Server
   *
   * @type {express.Application}
   */
  public app: express.Application

  /**
   * The Server instance from http node module with io.
   *
   * @type {Server}
   */
  public io: any

  /**
   * A collection of clients.
   *
   * @type {HashMap}
   */
  public clients: Map<number, any>

  /**
   * A collection of rooms.
   *
   * @type {HashMap}
   */
  public rooms: Map<number, any>

  public ressources: any

  public load: Load

  /**
   * Last timestamp in the update loop. This property help to calcul deltatime.
   *
   * @type {Number}
   */
  public lastTimestamp: number

  /**
   * Create a server.
   *
   * Init clients, room and lastTimestamp properties.
   * Set interval update and updatePlayers.
   */
  constructor () {
    this.app = express()

    var server = this.app.listen(80, function () {
      console.log('Listening on *:80')
    })

    let io = require('socket.io')(server, { pingInterval: 2000 })

    io.on('connection', (socket: any) => { this.handleSocket(socket) })

    this.clients = new Map()
    this.rooms = new Map()
    this.ressources = []
    this.load = new Load(this)
    this.lastTimestamp = 0

    setInterval(() => { this.update() }, 1000 / 60)
    setInterval(() => { this.updatePlayers() }, 1000 / 10)

    this.config()
    this.route()
  }

  config () {
    this.app.use('/main.bundle.js', express.static('dist/main.bundle.js'))
    this.app.use('/lib', express.static('lib'))
    this.app.use('/dist', express.static('dist'))
    this.app.use('/asset', express.static('dist/asset'))
  }

  route () {
    this.app.get('/', function (req, res) {
      res.sendFile(path.resolve('dist/index.html'))
    })
  }

  /**
   * Initialize events listener.
   *
   * Send connected to the current socket when this method is called.
   *
   * @param {Socket} socket - The current socket.
   */
  handleSocket (socket: any): void {
    socket.on('join-room', (data: any) => { this.joinRoom(socket, data) })
    socket.on('leave-room', () => { this.leaveRoom(socket) })
    socket.on('room-ask-to-start', () => { this.askToStart(socket) })
    socket.on('player-action', (data: any) => { this.receivePlayerAction(socket, data) })
    socket.on('disconnect', () => { this.disconnect(socket) })

    socket.emit('connected', socket.id)
  }

  /**
   * When socket receive message "join-room".
   *
   * Looking for a room not full. If all rooms is full, create a new room.
   * Add the new player to the foundedRoom.
   *
   * @todo: Passer les variables au lieu d'un objet, car la c'est pas trop
   * compréhensible pour le coup.
   *
   * @param {Socket} socket - The current socket.
   * @param {Object} data   -
   */
  joinRoom (socket: any, data: Object): void {
    var foundedRoom = null

    var ids: any = this.rooms.keys()
    for (var key in ids) {
      var currentRoom = this.rooms.get(ids[key])
      if (currentRoom && !currentRoom.isStarted) {
        foundedRoom = currentRoom
        break
      }
    }

    if (!foundedRoom) {
      var roomID = (new Date()).getTime()
      this.rooms.set(roomID, new Room(roomID, this))

      foundedRoom = this.rooms.get(roomID)
    }

    this.clients.set(socket.id, {
      socket: socket,
      room: foundedRoom
    })

    // Now, we can add new player in the founded room.
    var numberPlayer = foundedRoom.addNewPlayer(socket, data)

    socket.join(foundedRoom.id)

    foundedRoom.spawn(socket.id)

    if (numberPlayer === Constants.DEFAULT_ROOM_MAX_PLAYER) {
      foundedRoom.start()
    }
  }

  /**
   * When socked receive message "leave-room".
   *
   * Found the room by this socket.id and call removePlayer method.
   * Send a message "player left" by "room-update-ui" to all connected client
   * in this room.
   *
   * Check if the room need to be close. (No more client is connected to it).
   *
   * @param {Socket} socket - The current socket.
   */
  leaveRoom (socket: any): void {
    var client = this.clients.get(socket.id)

    if (client) {
      var room = this.rooms.get(client.room.id)

      if (room) {
        var name = room.removePlayer(socket.id)
        this.io.to(client.room.id).emit('room-update-ui', {
          message: name + ' is disconnected',
          numberAlive: room.numberAlive
        })
        room.checkCloseRoom()
      }
    }
  }

  /**
   * When socket receive message "room-ask-to-start".
   *
   * Found the room by this socket.id and call tryToStart method.
   *
   * @param {Socket} socket - The current socket.
   */
  askToStart (socket: any): void {
    var client = this.clients.get(socket.id)

    if (client) {
      var room = this.rooms.get(client.room.id)

      if (room) {
        room.tryToStart()
      }
    }
  }

  /**
   * When socked receive message "player-action".
   *
   * Found the room by this.socket.id and call receiveAction method
   */
  receivePlayerAction (socket: any, data: Object): void {
    var client = this.clients.get(socket.id)

    if (client) {
      var room = this.rooms.get(client.room.id)

      if (room) {
        room.receiveAction(socket, client, data)
      }
    }
  }

  /**
   * When socket receive message "disconnect".
   *
   * Found the room and player by this.socket.id. If the room is founded (The
   * player is not in a room ) call removePlayer method.
   *
   * Whatever, remove the client from the clients array.
   *
   * @param {Socket} socket - The current socket.
   */
  disconnect (socket: any): void {
    var client = this.clients.get(socket.id)

    if (client) {
      var room = this.rooms.get(client.room.id)
      if (room) {
        var player = room.players.get(socket.id)
        if (player) {
          var name = room.removePlayer(socket.id)

          this.io.to(client.room.id).emit('room-update-ui', {
            message: name + ' is disconnected',
            numberAlive: room.numberAlive
          })
        }
      }

      // this.clients.remove(socket.id)
    }
  }

  /**
   * The main update loop (Called 60ms)
   *
   * Call for each room started, the processInput, update and sendState method.
   *
   * If a room need to be deleted (because, no player connected to it), remove
   * it by call remove method from HashMap Object.
   */
  update (): void {
    var nowTimestamp = +new Date()
    var lastTimestamp = this.lastTimestamp || nowTimestamp
    var dt = (nowTimestamp - lastTimestamp) / 1000.0
    this.lastTimestamp = nowTimestamp

    var ids: any = this.rooms.keys()
    for (var i = 0; i < ids.length; ++i) {
      var currentRoom = this.rooms.get(ids[i])
      if (currentRoom.isStarted || currentRoom.isWaitingForStart) {
        currentRoom.processInput()
        currentRoom.update(dt)
        currentRoom.sendState()

        if (currentRoom.needToDeleted) {
          // this.rooms.remove(currentRoom.id)
        }
      }
    }
  }

  /**
   * Update players loop (Called 10ms)
   *
   * Call for each room started, the state of players.
   */
  updatePlayers (): void {
    var ids: any = this.rooms.keys()
    for (var i = 0; i < ids.length; ++i) {
      var currentRoom = this.rooms.get(ids[i])
      if (currentRoom.isStarted || currentRoom.isWaitingForStart) {
        currentRoom.sendPlayersState()
      }
    }
  }
}
