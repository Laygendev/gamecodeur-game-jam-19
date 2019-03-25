/**
 * @fileOverview HtmlUI class handle the UI class from HTML Element.
 *
 * @author BwooGames
 * @version 0.1.0
 */

/** Class representing a HtmlUI. */
window.HtmlUI = class htmlUI {  // eslint-disable-line
  /**
   * Constuctor init data
   *
   * @param {Game} game     - The game Object.
   * @param {Socket} socket - The socket Object.
   */
  constructor (game, socket) {
    /**
     * The game Object
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
     * Looking for room or not ?
     *
     * @type {Boolean}
     */
    this.isLookingForRoom = false

    /**
     * Array of message for the chat.
     *
     * @type {Array}
     */
    this.messages = []

    // Add event listener on socket.
    this.socket.on('connected', (id) => { this.displayConnected(id) })
    this.socket.on('connect_error', () => { this.connectError() })
    this.socket.on('reconnecting', (n) => { this.reconnecting(n) })

    // Add event Listener document.
    document.addEventListener('keydown', (e) => { this.lookingForRoom(e) })
    document.querySelector('.back').addEventListener('click', (e) => { this.backToMenu() })
    document.querySelector('.start-game').addEventListener('click', (e) => { this.askToStart() })
  }

  /**
   * When receive connect_error event.
   */
  connectError () {
    if (document.querySelector('.in-game').style.display === 'block') {
      document.querySelector('.menu').style.display = 'block'
      document.querySelector('.in-game').style.display = 'none'
      document.querySelector('.network-ready .state').innerHTML = 'Press enter to looking for a game'
      this.game.stop()
    }

    document.querySelector('.network-ready').style.display = 'none'
    document.querySelector('.network-not-ready').style.display = 'block'

    document.querySelector('.network-not-ready').innerHTML = 'Server offline'
  }

  /**
   * When receive reconnecting event.
   *
   * @param {Number} n - Number try to recconnect
   */
  reconnecting (n) {
    document.querySelector('.network-not-ready').innerHTML = 'Try reconnecting #' + n
  }

  /**
   * When receive "connected" event.
   *
   * @param {Number} id - Socket ID.
   */
  displayConnected (id) {
    this.game.id = id

    document.querySelector('.network-ready').style.display = 'block'
    document.querySelector('.network-not-ready').style.display = 'none'
  }

  /**
   * When press enter for looking a room.
   *
   * @param {Event} e - HTMLEvent.
   */
  lookingForRoom (e) {
    var code = e.keyCode

    if (code === 13) {
      if (!this.isLookingForRoom) {
        var name = document.querySelector('.name').value

        if (name && name.length < 20) {
          this.isLookingForRoom = true
          this.socket.emit('join-room', {
            name: name,
            screen: {
              w: this.game.canvas.width,
              h: this.game.canvas.height,
              hW: this.game.canvas.width / 2,
              hH: this.game.canvas.height / 2
            }
          })
        } else {
          window.alert('Your name cannot be blank or over 20 characters.')
        }
      }
    }
  }

  /**
   * When click "Back to menu".
   *
   * Emit to server "leave-room".
   *
   * @todo: Call reset method.
   */
  backToMenu () {
    this.messages = []
    this.updateLeftPlayer(0)
    this.updateKill(0)

    document.querySelector('.in-game').style.display = 'none'
    document.querySelector('.end-game').style.display = 'none'
    document.querySelector('.menu').style.display = 'block'
    document.querySelector('.network-ready .state').innerHTML = 'Press enter to looking for a game'
    this.socket.emit('leave-room')
    document.querySelector('.in-game .messages').innerHTML = ''

    this.game.stop()
  }

  /**
   * When click "Start Room" emit 'room-ask-to-start'.
   */
  askToStart () {
    this.socket.emit('room-ask-to-start')

    document.querySelector('.start-game').style.display = 'none'
  }

  /**
   * Update time to start the room
   *
   * @param {String} message - The message for start room receive by server.
   */
  updateTimeToStart (message) {
    document.querySelector('.top-center .message').innerHTML = message
  }

  /**
   * Hide start room message
   */
  hideStartMessage () {
    document.querySelector('.top-center').style.display = 'none'
  }

  /**
   * Switch UI menu for in-game
   */
  switchUI () {
    document.querySelector('.menu').style.display = 'none'
    document.querySelector('.in-game').style.display = 'block'
  }

  /**
   * Display top when player die.
   *
   * @param {String} top - The message like "You are Top 1";
   */
  displayTop (top) {
    document.querySelector('.end-game').style.display = 'block'
    document.querySelector('.end-game h1 span').innerHTML = top
  }

  /**
   * Update number player alive
   *
   * @param {String} number - Number player alive.
   */
  updateLeftPlayer (number) {
    document.querySelector('.in-game .alives span').innerHTML = number
  }

  /**
   * Update number player killed
   *
   * @param {String} number - Number player killed.
   */
  updateKill (number) {
    document.querySelector('.in-game .kills span').innerHTML = number
  }

  /**
   * Add a message to the chat
   *
   * @param {String} message - The message to add.
   */
  addMessage (message) {
    if (document.querySelector('.in-game').style.display === 'block') {
      this.messages.push(message)

      if (this.messages.length > 4) {
        this.messages.splice(0, 1)
      }

      var output = ''

      for (var key in this.messages) {
        output += '<li>' + this.messages[key] + '</li>'
      }

      document.querySelector('.in-game .messages').innerHTML = output
    }
  }

  /**
   * Reset UI HTML to defaut.
   */
  reset () {
    document.querySelector('.in-game .alives span').innerHTML = 0
    document.querySelector('.in-game .kills span').innerHTML = 0

    this.messages = []
    document.querySelector('.in-game .messages').innerHTML = ''
  }
}
