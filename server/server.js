//======================================================
// File: server.js
// Descr: Nodejs server for Wizard Warz.
//
// Author: Magnus Persson
// Date: 2014-01-31
//======================================================

//======================================================
// Configuration
//======================================================
var version = "0.1";
var port = 8080;

//======================================================
// Initialization
//======================================================
var server = require("http");

server = server.createServer();
var io = require("socket.io").listen(server).set('log level',1);
io = io.sockets.on("connection", SocketHandler);
var fs = require("fs");
var path = require("path");
var logger = require('util');
var sys = require('sys');
server.listen(port);

console.log("===================================");
console.log("Server for Tank.io");
logger.log("Started server on port "+port);

var sockets = new Array();
var players = [];
var unique_count = 1;


function SocketHandler(socket, data) {
    var ip = socket.handshake.address;
    logger.log("Incoming connection from "+ip.address+":"+ip.port);

    socket.on('disconnect', Disconnect);
    socket.on('UpdatePlayerPosition', UpdatePlayerPosition);
    // socket.on('PlayerRespawn', PlayerRespawn);

    var player = {};
    player.id = socket.id;
    player.life = 5;
    socket.player = player;
    sockets.push(socket);
    players[socket.id] = player;
    socket.emit("spawnPlayer", { player: player });
    socket.broadcast.emit("addPlayer", { player: player });

    for (var k in players) {
      if (socket.player.id != players[k].id) {
        socket.emit("addPlayer", { player: players[k] } );
      }
    }
}


function Disconnect() {
    var i = sockets.indexOf(this);
    if(this.player != undefined) {
        logger.log("disconnected user: "+this.player.name);
        this.broadcast.emit("RemovePlayer", {player: this.player});
        delete players[this.player.id];
    }
    sockets.splice(i, 1);
}

function Length(obj) {
    return Object.keys(obj).length;
}


// Update player position
function UpdatePlayerPosition(data) {
  if (players[data.id] != undefined) {
    this.broadcast.emit("UpdatePlayerPosition", data);
  }
}
