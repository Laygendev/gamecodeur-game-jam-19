class Client {
  constructor() {
    this.socket = io('http://51.38.60.46:8080');
    this.game = new Game(this.socket);

    this.socket.on('pong', (ms) => {
      this.game.latency = ms;
    });
  }
}

document.addEventListener('DOMContentLoaded', function() {
  new Client();
});
