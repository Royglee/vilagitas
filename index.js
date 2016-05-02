var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var currentValue = 0;

app.use("/public", express.static(__dirname + '/public'));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
    console.log('a user connected');
    socket.emit('sliderChange', currentValue);

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });

    socket.on('sliderChange', function(msg){
        socket.broadcast.emit('sliderChange', msg);
        currentValue = msg;
        console.log(msg);
    });
});

http.listen(80, function(){
    console.log('listening on *:80');
});