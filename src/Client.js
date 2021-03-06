/**
 * @fileOverview Client class is the first class called when DOM is loaded.
 * Create Game and IO.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a Client. */
class Client {
  /**
   * Init Socket and Game
   */
  constructor () {
    /**
     * The socket.
     *
     * @type {Socket}
     */
    this.socket = window.io()

    /**
     * The Game Object.
     *
     * @type {Game}
     */
    this.game = new window.Game(this.socket)

    this.socket.on('pong', (ms) => {
      this.game.latency = ms
    })
  }
}

document.addEventListener('DOMContentLoaded', function () {
  new Client(); // eslint-disable-line
})
