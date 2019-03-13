var version = "0.1";
var port    = 8080;
var server  = require("http");
var fs      = require("fs");
const url = require('url');
const path = require('path');

var TankServer = require('./server.js');

server = server.createServer(function(req, res) {
  const parsedUrl = url.parse(req.url);

  const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[\/\\])+/, '');
  let pathname = path.join(__dirname, sanitizePath);

  fs.exists(pathname, function (exist) {
    if(!exist) {
      // if the file is not found, return 404
      res.statusCode = 404;
      res.end(`File ${pathname} not found!`);
      return;
    }

    // if is a directory, then look for index.html
    if (fs.statSync(pathname).isDirectory()) {
      pathname += '../index.html';
    }

    // read file from file system
    fs.readFile(pathname, function(err, data){
      if(err){
        res.statusCode = 500;
        res.end(`Error getting the file: ${err}.`);
      } else {
        // based on the URL path, extract the file extention. e.g. .js, .doc, ...
        const ext = path.parse(pathname).ext;
        // if the file is found, set Content-type and send data
        res.setHeader('Content-type', mimeType[ext] || 'text/plain' );
        res.end(data);
      }
    });
  });
});

var io = require("socket.io")(server, {
  'pingInterval': 2000,
});
var tankServer = new TankServer(io);

io = io.sockets.on("connection", (socket) => { tankServer.handleSocket(socket); });

server.listen(port);

console.log("Server started");
