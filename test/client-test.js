var sockets = [];

for (var i = 0; i < 99; i++) {
  let socket = require('socket.io-client')('http://trackball-game.com:8080', { rejectUnauthorized: false });
  sockets.push(socket);

  socket.on('pong', function(ms) {
    console.log(ms);
  })
}

setInterval(function() {
  for (var key in sockets) {

  }
}, 1000 / 60 );
