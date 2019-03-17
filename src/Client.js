class Client {
  constructor() {
    this.socket = io('http://51.38.60.46:8080');
    this.game = new Game(this.socket);
    this.input = new Input(this.game);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  new Client();
});
