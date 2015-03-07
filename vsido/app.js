//httpサーバー立ち上げ
var fs = require('fs');
var i = 0;

var app = require('http').createServer(function(req, res) {
  if ( request.url == '/') {
      response.writeHead(200, {'Content-Type': 'text/plain'});
      res.end(fs.readFileSync('index.html'));
  } else if (request.url == '/play') {
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.write('play.html');
  } else {
      response.writeHead(404, {'Content-Type': 'text/plain'});
      response.write('Error 404: Not Found');
  }

}).listen(4000);

console.log('接続数取得テスト');

//Socket.ioコネクション
var io = require('socket.io').listen(app);
io.sockets.on('connection', function(socket) {
  console.log('コネクション数',socket.client.conn.server.clientsCount);
  io.sockets.emit('count', socket.client.conn.server.clientsCount);

  socket.on('disconnect', function(data) {
    console.log('コネクション数',socket.client.conn.server.clientsCount);
    io.sockets.emit('count', socket.client.conn.server.clientsCount);
  });

  socket.on('number', function(data) {
    console.log('現在のコネクション数',socket.client.conn.server.clientsCount);
    // io.sockets.emit('number', socket.client.conn.server.clientsCount);
     io.sockets.emit('number', ++i);
  });
});

