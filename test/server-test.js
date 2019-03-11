var app = require("http").createServer();
var io = require("socket.io")(app, {
  'pingInterval': 2000,
  'pingTimeout': 5000
});

app.listen(8080);

console.log("Server started");
