require('dotenv').config();
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mqtt = require('mqtt');

var currentValue = [];
var lastSensorData = [];
var mode  = 0; //0-manual 1-auto

var client  = mqtt.connect(process.env.MQTT_SERVER);

client.on('connect', function () {
    client.subscribe('Arduino');
    client.subscribe('Arduino/Disconnected');
    client.subscribe('Arduino/Sensor0');
    client.subscribe('Arduino/Sensor1');
    client.subscribe('Arduino/Beavatkozo0');
    client.subscribe('Arduino/Beavatkozo1');
    client.subscribe('Arduino/Feny0');
    client.subscribe('Arduino/Feny1');
    client.subscribe('Arduino/Mode');
});

//----MQTT Client--------------------------------------------
client.on('message', function (topic, message) {
    if(topic=="Arduino"){
        //Kiírom a chatbe, az Arduino csatlakozó üzenetét
        io.emit("chat message",topic +": " + message.toString());

        //Elküldöm az Arduinonak az aktuális világítás értékeket (Feny0,Feny1)
        for (var i = 0; i < currentValue.length; i++) {
            var $this=currentValue[i];
            if($this != undefined && $this != null){
                client.publish('Arduino/Feny'+$this.id, $this.value.toString());
            };
        }

        //Arduinonak a Mode:
        client.publish('Arduino/Mode', mode.toString());
    }
    if(topic=="Arduino/Disconnected"){
        io.emit("chat message","Arduino: " + message.toString());
        lastSensorData = [];
    }
    if(topic=="Arduino/Sensor0" || topic=="Arduino/Sensor1"){
        io.emit("Arduino/Sensor", {data:message.toString(),id:topic.slice(-1)});
        lastSensorData[topic.slice(-1)] = message.toString();
    }
    if(topic=="Arduino/Beavatkozo1" || topic=="Arduino/Beavatkozo0"){
        //console.log(message.toString());
        var id=parseInt(topic.slice(-1))+6;
        io.emit("Arduino/Sensor", {data:message.toString(),id:id});
        lastSensorData[id] = message.toString();
    }
    if(topic=="Arduino/Feny1" || topic=="Arduino/Feny0"){
        //console.log(message.toString());
        var id=parseInt(topic.slice(-1));
        io.emit("Arduino/Sensor", {value:message.toString(),id:id});
        currentValue[id] =  {value:message.toString(),id:id};
    }
    if(topic=="Arduino/Mode"){
        io.emit("Arduino/Mode", message.toString());
        mode = message.toString();
    }


});

//----Webszerver---------------------------------------------
app.use("/public", express.static(__dirname + '/public'));
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

//---Websocket szerver---------------------------------------
io.on('connection', function(socket){
    console.log(timeStamp(),'A user connected, IP:',socket.client.conn.remoteAddress);

    for (var i = 0; i < currentValue.length; i++) {
        var $this=currentValue[i];
        if($this != undefined && $this != null){socket.emit('Arduino/Feny', $this)};
    }
    for (var i = 0; i < lastSensorData.length; i++) {
        var $this=lastSensorData[i];
        if($this != undefined && $this != null) {
            var event = {data: lastSensorData[i], id: i}
            socket.emit("Arduino/Sensor", event);
            //console.log(event);
        }
    }
    socket.emit('Arduino/Mode', mode);

    socket.on('disconnect', function(){
        console.log(timeStamp(),'A user disconnected, IP:',socket.client.conn.remoteAddress);
    });

    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });

    socket.on('Arduino/Feny', function(msg){
        socket.broadcast.emit('Arduino/Feny', msg);
        client.publish('Arduino/Feny'+msg.id, msg.value.toString());
        currentValue[msg.id] = msg;
    });

    socket.on('Arduino/Mode', function(msg){
        io.emit('Arduino/Mode', msg);
        client.publish('Arduino/Mode', msg.toString());
        mode = msg;
    });
});

function timeStamp() {
    var myDate = new Date();
    return ("["+myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds()+"]");

}

http.listen(process.env.HTTP_LISTEN_PORT,process.env.HTTP_LISTEN_IP, function(){
    console.log('listening on '+process.env.HTTP_LISTEN_IP+':'+process.env.HTTP_LISTEN_PORT);
});
