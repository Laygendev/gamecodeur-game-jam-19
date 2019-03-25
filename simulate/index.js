var sockets = []

for (var i = 0; i < 28; i++) {
  let socket = require('socket.io-client')('http://51.38.60.46:80', { rejectUnauthorized: false })
  socket.latency = 0
  socket.inputSequenceNumber = 0
  socket.startTime = undefined
  socket.lastTS = undefined
  socket.timerToShoot = 0
  socket.alive = true

  socket.on('pong', (ms) => {
    socket.latency = ms
  })

  socket.on('connected', (id) => {
    socket.emit('join-room', {
      name: 'test',
      screen: {
        w: 1000,
        h: 1000,
        hW: 500,
        hH: 500
      }
    })
  })

  sockets.push(socket)
}

setInterval(function () {
  for (var key in sockets) {
    if (sockets[key].alive) {
      var leave = Math.floor(Math.random() * Math.floor(100))

      if (leave >= 98) {
        sockets[key].emit('leave-room')
        continue
      }

      sockets[key].startTime = +Date.now()

      var nowTS = +new Date()
      var lastTS = sockets[key].lastTS || nowTS
      var dt = (nowTS - lastTS) / 1000.0
      sockets[key].lastTS = nowTS

      sockets[key].timerToShoot += dt

      var randomDirection = Math.floor(Math.random() * Math.floor(4))

      var input = []
      input[0] = sockets[key].id
      input[1] = sockets[key].latency
      input[2] = sockets[key].inputSequenceNumber++

      input[8] = 0 // UP
      input[9] = 0 // LEFT
      input[10] = 0 // RIGHT
      input[11] = 0 // DOWN

      switch (randomDirection) {
        case 0:
          input[8] = dt // UP
          break
        case 1:
          input[9] = dt // LEFT
          break
        case 2:
          input[10] = dt // RIGHT
          break
        case 3:
          input[11] = dt // DOWN
          break
      }

      if (sockets[key].timerToShoot >= 1) {
        input[4] = true
        sockets[key].timerToShoot = 0
      }

      input[3] = Math.floor(Math.random() * Math.floor(360))

      sockets[key].emit('player-action', input)
    }
  }
}, 1000 / 30)
