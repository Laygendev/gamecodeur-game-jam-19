/**
 * @fileOverview HtmlUI class handle the UI class from HTML Element.
 *
 * @author BwooGames
 * @version 0.1.0
 */

import { Game } from './Game' // eslint-disable-line

/** Class representing a HtmlUI. */
export class HTMLUI {
  /**
   * The game Object
   *
   * @type {Game}
   */
  game: Game

  /**
   * The client Socket
   *
   * @type {Socket}
   */
  socket: any

  /**
   * Looking for room or not ?
   *
   * @type {Boolean}
   */
  isLookingForRoom: boolean

  /**
   * Array of message for the chat.
   *
   * @type {any}
   */
  messages: any

  /**
   * Constuctor init data
   *
   * @param {Game} game     - The game Object.
   * @param {Socket} socket - The socket Object.
   */
  constructor (game: Game, socket: any) {
    this.game = game
    this.socket = socket
    this.isLookingForRoom = false
    this.messages = []

    // Add event listener on socket.
    this.socket.on('connected', (id: number) => { this.displayLoadData(id) })
    this.socket.on('connect_error', () => { this.connectError() })
    this.socket.on('reconnecting', (n: number) => { this.reconnecting(n) })

    // Add event Listener document.
    document.addEventListener('keydown', (e: any) => { this.lookingForRoom(e) })
    document.querySelector('.back').addEventListener('click', () => { this.backToMenu() })
    document.querySelector('.start-game').addEventListener('click', () => { this.askToStart() })
  }

  /**
   * When receive connect_error event.
   */
  connectError (): void {
    let inGame: HTMLElement = document.querySelector('.in-game')
    let menu: HTMLElement = document.querySelector('.menu')
    let mainMenu: HTMLElement = document.querySelector('.main-menu')
    let networkNotReady: HTMLElement = document.querySelector('.network-not-ready')
    let stateText: HTMLElement = document.querySelector('.network-ready .state')

    if (inGame.style.display === 'block') {
      menu.style.display = 'block'
      inGame.style.display = 'none'
      stateText.innerHTML = 'Press enter to looking for a game'
      this.game.stop()
    }

    mainMenu.style.display = 'none'
    networkNotReady.style.display = 'block'
    networkNotReady.innerHTML = 'Server offline'
  }

  /**
   * When receive reconnecting event.
   *
   * @param {Number} n - Number try to recconnect
   */
  reconnecting (n: number): void {
    let networkNotReady: HTMLElement = document.querySelector('.network-not-ready')

    networkNotReady.innerHTML = 'Try reconnecting #' + n
  }

  displayMainMenu (): void {
    let loadingData: HTMLElement = document.querySelector('.loading-data')
    let mainMenu: HTMLElement = document.querySelector('.main-menu')

    loadingData.style.display = 'none'
    mainMenu.style.display = 'block'
  }

  /**
   * When receive "connected" event.
   *
   * @param {Number} id - Socket ID.
   */
  displayLoadData (id: number): void {
    this.game.id = id

    let loadingData: HTMLElement = document.querySelector('.loading-data')
    let networkNotReady: HTMLElement = document.querySelector('.network-not-ready')

    loadingData.style.display = 'block'
    networkNotReady.style.display = 'none'
  }

  /**
   * When press enter for looking a room.
   *
   * @param {Event} e - HTMLEvent.
   */
  lookingForRoom (e: any): void {
    var code = e.keyCode

    if (code === 13) {
      if (!this.isLookingForRoom) {
        let nameInput: HTMLInputElement = document.querySelector('.name')
        var name = nameInput.value

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
   * When joined room, waiting to start
   *
   * @param {string} numberAlive Number player alive.
   */
  startGame (numberAlive: string): void {
    let startGameMenu: HTMLElement = document.querySelector('.start-game')

    this.updateLeftPlayer(numberAlive)
    this.updateTimeToStart('En attente d\'autre joueur')

    startGameMenu.style.display = 'true'
  }

  /**
   * When click "Back to menu".
   *
   * Emit to server "leave-room".
   *
   * @todo: Call reset method.
   */
  backToMenu (): void {
    this.messages = []
    this.updateLeftPlayer('0')
    this.updateKill('0')

    let inGame: HTMLElement = document.querySelector('.in-game')
    let endGame: HTMLElement = document.querySelector('.end-game')
    let menu: HTMLElement = document.querySelector('.menu')
    let stateText: HTMLElement = document.querySelector('.network-ready .state')
    let messages: HTMLElement = document.querySelector('.in-game .messages')

    inGame.style.display = 'none'
    endGame.style.display = 'none'
    menu.style.display = 'block'

    stateText.innerHTML = 'Press enter to looking for a game'
    messages.innerHTML = ''

    this.socket.emit('leave-room')

    this.game.stop()
  }

  /**
   * When click "Start Room" emit 'room-ask-to-start'.
   */
  askToStart (): void {
    this.socket.emit('room-ask-to-start')

    let startGameButton: HTMLElement = document.querySelector('.start-game')
    startGameButton.style.display = 'none'
  }

  /**
   * Update time to start the room
   *
   * @param {String} message - The message for start room receive by server.
   */
  updateTimeToStart (message: string): void {
    document.querySelector('.top-center .message').innerHTML = message
  }

  /**
   * Hide start room message
   */
  hideStartMessage (): void {
    let topCenterDiv: HTMLElement = document.querySelector('.top-center')
    topCenterDiv.style.display = 'none'
  }

  /**
   * Switch UI menu for in-game
   */
  switchUI (): void {
    let menu: HTMLElement = document.querySelector('.menu')
    let inGameMenu: HTMLElement = document.querySelector('in-game')

    menu.style.display = 'none'
    inGameMenu.style.display = 'block'
  }

  /**
   * Display top when player die.
   *
   * @param {String} top - The message like "You are Top 1";
   */
  displayTop (top: string): void {
    let endGame: HTMLElement = document.querySelector('.end-game')

    endGame.style.display = 'block'
    document.querySelector('.end-game h1 span').innerHTML = top
  }

  /**
   * Update number player alive
   *
   * @param {String} number - Number player alive.
   */
  updateLeftPlayer (aliveLeft: string) {
    document.querySelector('.in-game .alives span').innerHTML = aliveLeft
  }

  /**
   * Update number player killed
   *
   * @param {String} number - Number player killed.
   */
  updateKill (kills: string): void {
    document.querySelector('.in-game .kills span').innerHTML = kills
  }

  /**
   * Add a message to the chat
   *
   * @param {String} message - The message to add.
   */
  addMessage (message: string): void {
    let inGame: HTMLElement = document.querySelector('.in-game')

    if (inGame.style.display === 'block') {
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
    document.querySelector('.in-game .alives span').innerHTML = '0'
    document.querySelector('.in-game .kills span').innerHTML = '0'

    this.messages = []
    document.querySelector('.in-game .messages').innerHTML = ''
  }
}
