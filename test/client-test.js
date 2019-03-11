var sockets = [];

for (var i = 0; i < 1; i++) {
  let socket = require('socket.io-client')('http://trackball-game.com:8080', { rejectUnauthorized: false });
  socket.latency = 0;

  sockets.push(socket);

  socket.on('pong', (ms) => {
    socket.latency = ms;
  });
}

setInterval(function() {
  for (var key in sockets) {
    sockets[key].emit('test');
  }
}, 1000 / 60)
