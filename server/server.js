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
var server = require("https");
var fs = require("fs");

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/trackball-game.com/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/trackball-game.com/cert.pem')
};

server = server.createServer(options);

var io = require("socket.io").listen(server).set('log level',1);

io = io.sockets.on("connection", SocketHandler);


var path = require("path");
var logger = require('util');
var sys = require('sys');
server.listen(port);
console.log("===================================");
console.log("Server for Tank.io");
logger.log("Started server on port "+port);

var sockets = new Array();
var players = [];
var bullets = [];
var unique_count = 1;

var width = 3000;
var height = 3000;

global.window = global.document = global;

var frame_time = 60/1000; // run the local game at 16ms/ 60hz

if('undefined' != typeof(global)) frame_time = 45; //on server we run at 45ms, 22hz
console.log(frame_time);
( function () {

    var lastTime = 0;
    var vendors = [ 'ms', 'moz', 'webkit', 'o' ];

    for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++ x ) {
        window.requestAnimationFrame = window[ vendors[ x ] + 'RequestAnimationFrame' ];
        window.cancelAnimationFrame = window[ vendors[ x ] + 'CancelAnimationFrame' ] || window[ vendors[ x ] + 'CancelRequestAnimationFrame' ];
    }

    if ( !window.requestAnimationFrame ) {
        window.requestAnimationFrame = function ( callback, element ) {
            var currTime = Date.now(), timeToCall = Math.max( 0, frame_time - ( currTime - lastTime ) );
            var id = window.setTimeout( function() { callback( currTime + timeToCall ); }, timeToCall );
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if ( !window.cancelAnimationFrame ) {
        window.cancelAnimationFrame = function ( id ) { clearTimeout( id ); };
    }

}() );


function SocketHandler(socket, data) {
    var ip = socket.handshake.address;
    logger.log("Incoming connection from "+ip.address+":"+ip.port);

    socket.on('disconnect', Disconnect);
    socket.on('UpdatePlayerPosition', UpdatePlayerPosition);
    socket.on('Shoot', Shoot);
    
    socket.emit("connected");

    // var player = {};
    // player.id = socket.id;
    // player.life = 5;
    // player.isAlive = true;
    // player.pos = {
    //     x: Math.floor(Math.random() * (width - 100)) + 100,
    //     y: Math.floor(Math.random() * (height - 100)) + 100,
    // };
    // 
    // socket.player = player;
    // sockets.push(socket);
    // players[socket.id] = player;
    // socket.emit("spawnPlayer", {
    //   player: player,
    //   map: {
    //     width: width,
    //     height: height,
    //   }
    // });
    // socket.broadcast.emit("addPlayer", { player: player });
    // 
    // for (var k in players) {
    //   if (socket.player.id != players[k].id) {
    //     socket.emit("addPlayer", { player: players[k] } );
    //   }
    // }
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

function Shoot(data) {
    if (players[data.id] != undefined) {
        var bullet = {
            'id': data.id,
            'bulletid': new Date().getTime(),
            'basePos': JSON.parse(JSON.stringify(players[data.id].info.posCanonServer)),
            'speed': 500,
            'distanceMax': 600,
            'endcanonangle': radians_to_degrees(players[data.id].info.canonAngle),
            'angleRadians': players[data.id].info.canonAngle,
            'pos': JSON.parse(JSON.stringify(players[data.id].info.posCanonServer))
        };

        bullets.push(bullet);

      io.emit("Shoot", bullet);
    }
}

Number.prototype.fixed = function(n) { n = n || 3; return parseFloat(this.toFixed(n)); };

// Update player position
function UpdatePlayerPosition(data) {
  if (players[data.id] != undefined) {
      players[data.id].info = data;
    this.broadcast.emit("UpdatePlayerPosition", data);
  }
}

function degrees_to_radians(degrees)
{
  var pi = Math.PI;
  return degrees * (pi/180);
}

function radians_to_degrees(radians)
{
  var pi = Math.PI;
  return radians * (180/pi);
}

var dt;
var lastframetime;
var updateid;

function update(t) {

    dt = lastframetime ? ( (t - lastframetime)/1000.0).fixed() : 0.016;
    lastframetime = t;

    for (var key in bullets) {
        bullets[key].pos.x += bullets[key].speed * Math.cos(bullets[key].angleRadians) * dt;
        bullets[key].pos.y += bullets[key].speed * Math.sin(bullets[key].angleRadians) * dt;

        var destroyBullet = false;

        var playerHit = undefined

        for(var key_player in players) {
            if ( players[key_player].id != bullets[key].id && players[key_player].isAlive && players[key_player].info && players[key_player].info.colliderPointServer ) {
                if (collision(players[key_player].info.colliderPointServer, bullets[key].pos)) {
                  players[key_player].life--;

                  if (players[key_player].life <= 0) {
                    players[key_player].isAlive = false;
                  }
                    var hit = {
                        bulletID: bullets[key].bulletid,
                        playerID: players[key_player].id,
                        player: players[key_player]
                    };

                    io.emit("HitPlayer", hit);
                    bullets.splice(key, 1);
                    destroyBullet = true;
                    break;
                }
            }
        }

        if ( destroyBullet ) {
            continue;
        }

        var dist = Math.sqrt( Math.pow((bullets[key].basePos.x-bullets[key].pos.x), 2) + Math.pow((bullets[key].basePos.y-bullets[key].pos.y), 2) );
        if (dist >= bullets[key].distanceMax) {
            io.emit("MissileDelete", bullets[key]);
            bullets.splice(key, 1);
        }
    }

    updateid = window.requestAnimationFrame( update.bind(this), this.viewport );
}

update(new Date().getTime() );

function collision(tab, P) {
    for (i = 0; i < 4; i++) {
        var A = tab[i].pos;
        var B;
  		if (i == 3) {
  			B = tab[0].pos
  		} else {
            B = tab[i + 1].pos;
        }
  		var D = {X: 0, Y: 0};
  		var T = {X: 0, Y: 0};

  		D.X = B.x - A.x;
  		D.Y = B.y - A.y;
  		T.X = P.x - A.x;
  		T.Y = P.y - A.y;
  		var d = D.X*T.Y - D.Y*T.X;
  		if (d > 0) {
  			return false;
  		}
    }

    return true;
}
