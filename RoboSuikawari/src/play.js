var express = require('express');
var http = require('http');
var app = express();
var chatmsgs = new Array();
var playerno = 0;

app.use('/less', express.static(__dirname + '/less'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/img', express.static(__dirname + '/img'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

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

app.get('/newplayer', function(req, res) {
    res.send('{ "newnumber" : ' + ++playerno + ' } '); 
});

server = http.createServer(app)
server.listen(4000);

var socketio = require('socket.io');
var io = socketio.listen(server);

io.sockets.on('connection', function(socket) {
    io.sockets.emit('count', socket.client.conn.server.clientsCount);

    socket.on('disconnect', function(data) {
      console.log('disconnected');
    });

    socket.on('message', function(data) {
        chatmsgs.push(data);
        //console.log(data);
        io.sockets.emit('message', chatmsgs);
    });

    socket.on('kickstart', function(data) {
        io.sockets.emit('start', null);
    });



});
