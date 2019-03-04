var version = "0.1";
var port    = 8080;
var server  = require("https");
var fs      = require("fs");

var TankServer = require('./server.js');

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/trackball-game.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/trackball-game.com/cert.pem')
};

server = server.createServer(options);

var io         = require("socket.io").listen(server);
var tankServer = new TankServer(io);

io = io.sockets.on("connection", (socket) => { tankServer.handleSocket(socket); });

server.listen(port);

console.log("Server started");

var width = 3000;
var height = 3000;


var dt;
var lastframetime;
var updateid;
var startTime;
var last_processed_input = [];
var messages = [];
var t = 0;
var pt = 0;
var last_ts;
