/**
 * @fileOverview Client class is the first class called when DOM is loaded.
 * Create Game and IO.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Game } from './Game'

/** Class representing a Client. */
class Client {
  socket: any
  game: Game
  /**
   * Init Socket and Game
   */
  constructor () {
    /**
     * The socket.
     *
     * @type {Socket}
     */
    this.socket = require('socket.io-client')()

    /**
     * The Game Object.
     *
     * @type {Game}
     */
    this.game = new Game(this.socket)

    this.socket.on('pong', (ms: number) => {
      this.game.latency = ms
    })
  }
}

new Client(); // eslint-disable-line
