var express = require('express');
var http = require('http');
var app = express();
var chatmsgs = new Array();

app.use('/less', express.static(__dirname + '/less'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));

app.get('/play', function (req, res) {
  res.sendfile(__dirname + '/play.html');
});

app.get('/end', function (req, res) {
  res.sendfile(__dirname + '/end.html');
});

app.use(function(req, res, next){
    res.status(404);
    console.log("404 =>" + req.url);
});

server = http.createServer(app)
server.listen(4000);

var socketio = require('socket.io');
var io = socketio.listen(server);

io.sockets.on('connection', function(socket) {

    socket.on('message', function(data) {
        chatmsgs.push(data);
        console.log(data);
        io.sockets.emit('message', chatmsgs);
    });
});
