class Room {
  constructor(game, socket) {
    this.game = game;
    this.socket = socket;

    this.socket.on('room-started', () => { this.start(); });
  }

  start() {
    this.game.start();
  }
}
