var sockets = [];

function getRandomInt(min, max) {
  	return Math.floor(Math.random() * (max - min)) + min;
}

for (var i = 0; i < 29; i++) {
  let socket = require('socket.io-client')('http://51.38.60.46:8080', { rejectUnauthorized: false });
  socket.latency = 0;
  socket.input_sequence_number = 0;
  socket.startTime;
  socket.room = { id: 0 };
  socket.last_ts;
  socket.timerToShoot = 0;
  socket.alive = true;

  socket.on('pong', (ms) => {
    socket.latency = ms;
  });

  socket.on('HitPlayer', (hitInfo) => {
    if (hitInfo.playerID == socket.id && !hitInfo.player.isAlive) {
      socket.alive = false;
    }
  });


  socket.on('connected', (id) => {
    socket.emit('JoinRoom', {
      id: id,
      pseudo: 'test',
      screen: {
        halfWidth: 500,
        halfHeight: 500
      }
    })
  })

  socket.on('JoinedRoom', (room) => {
    socket.room = room;
  })
  //
  sockets.push(socket);
}

setInterval(function() {
  for (var key in sockets) {
    if (sockets[key].room.id && sockets[key].alive) {
      sockets[key].startTime = +Date.now();

      var now_ts = +new Date();
      var last_ts = sockets[key].last_ts || now_ts;
      var dt_sec = (now_ts - last_ts) / 1000.0;
      sockets[key].last_ts = now_ts;

      sockets[key].timerToShoot += dt_sec;

      var randomDirection = Math.floor(Math.random() * Math.floor(4));

      var input = []
      input[0] = sockets[key].id;
      input[1] = sockets[key].latency;
      input[2] = sockets[key].input_sequence_number++;

      input[8] = 0; // UP
      input[9] = 0; // LEFT
      input[10] = 0; // RIGHT
      input[11] = 0; // DOWN

      switch (randomDirection) {
        case 0:
          input[8] = true; // UP
          break;
        case 1:
          input[9] = true; // LEFT
          break;
        case 2:
          input[10] = true; // RIGHT
          break;
        case 3:
          input[11] = true; // DOWN
          break;
      }

      if (sockets[key].timerToShoot >= 1) {
        input[4] = true;
        sockets[key].timerToShoot = 0;
      }

      input[3] = Math.floor(Math.random() * Math.floor(360));

            this.tanks[this.id].updateOnInput(input, this.room.world)
      this.socket.emit('player-action', input)

      sockets[key].emit(0, input);
    }
  }
}, 1000 / 30 );
