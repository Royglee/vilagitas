var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mqtt = require('mqtt');
var currentValue = 0;

var client  = mqtt.connect('mqtt://vm.ik.bme.hu:19540');
client.on('connect', function () {
    client.subscribe('Arduino');
});

client.on('message', function (topic, message) {
    if(topic=="Arduino"){client.publish('sliderChange', currentValue.toString());}
    io.emit("chat message",topic +": " + message.toString());
});

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
        client.publish('sliderChange', msg.toString());
        currentValue = msg;
        console.log(msg);
    });
});

//http.listen(3000,"10.9.0.231",function(){
http.listen(80, function(){
    console.log('listening on *:80');
});