require('dotenv').config();
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mqtt = require('mqtt');

var currentValue = [];
var lastSensorData = [];
var mode  = 0; //0-manual 1-auto
var AndroidSessionDuration = 60*1000;

var consumeFeny = new Date().getTime();
var tokens = [];

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
    client.subscribe('Auth/newToken');
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
        var now = Date.now();
        if(now-consumeFeny > 50){ //Ha az elõzõ általunk küldött üzenet óta eltelt legalább 50ms akkor dolgozzuk csak fel
            //console.log(message.toString());
            var id=parseInt(topic.slice(-1));
            io.emit("Arduino/Feny", {value:message.toString(),id:id});
            currentValue[id] =  {value:message.toString(),id:id};
        }
    }
    if(topic=="Arduino/Mode"){
        io.emit("Arduino/Mode", message.toString());
        mode = message.toString();
    }

    if(topic=="Auth/newToken"){
        now = Date.now();
        //Az érkezett azonosító kulcs mentése az aktuális idõbélyeggel
        tokens.push([message.toString(),now]);

        //A lejárt kulcsok kitörlése a tömbbõl
            for(var i = tokens.length-1; i>=0; i--) {
                if(now - tokens[i][1] >  AndroidSessionDuration) {
                    tokens.splice(i, 1);
                }
            }
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
    socket.emit('Auth/tokenRequest', "Send your auth token to Auth/Token");

    socket.on('disconnect', function(){
        console.log(timeStamp(),'A user disconnected, IP:',socket.client.conn.remoteAddress);
    });

    socket.on('chat message', function(msg){
        console.log('message: ' + msg);
        io.emit('chat message', msg);
    });

    socket.on('Arduino/Feny', function(msg){
        if (typeof socket['SWAuthToken'] !== 'undefined') {
            if(!isTokenValid(socket['SWAuthToken'])){
                socket.emit('Auth/tokenStatus', "INVALID");
                console.log('invalid token');
                return;
            }
        } else {
            socket.emit('Auth/tokenRequest', "Token was not provided.");
        }

        socket.broadcast.emit('Arduino/Feny', msg);
        client.publish('Arduino/Feny'+msg.id, msg.value.toString());
        currentValue[msg.id] = msg;
        consumeFeny = Date.now();

    });

    socket.on('Arduino/Mode', function(msg){
        if (typeof socket['SWAuthToken'] !== 'undefined') {
            if(!isTokenValid(socket['SWAuthToken'])){
                socket.emit('Auth/tokenStatus', "INVALID");
                console.log('invalid token');
                return;
            }
        } else {
            socket.emit('Auth/tokenRequest', "Token was not provided.");
        }
        io.emit('Arduino/Mode', msg);
        client.publish('Arduino/Mode', msg.toString());
        mode = msg;
    });

    socket.on('Auth/Token', function(msg){
        var token = msg.toString();
        var duration;
        socket['SWAuthToken'] = token;
	//console.log(token);
	//console.log(tokens);
	//console.log(isTokenValid(token));
        if(!isTokenValid(token)){
            socket.emit('Auth/tokenStatus', "INVALID");
        } else{
            duration = getMillisUntilExpire(token).toString();
            socket.emit('Auth/tokenStatus', duration);

        }

    });
});

function timeStamp() {
    var myDate = new Date();
    return ("["+myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds()+"]");

}

function isTokenValid(token){
	var isValid = false;
    var now = Date.now();
    tokens.forEach(function(value, index){
	//console.log(value[0],token);
        if(value[0].toString() == token.toString() && now-value[1] < AndroidSessionDuration) {
		console.log("match");
		isValid =  true;}
    });
    return isValid;
}

function getMillisUntilExpire(token){
    var savedIndex = -1;
    tokens.forEach(function(value, index){
        if(value[0].toString() == token.toString()) {
            savedIndex =  index;}
    });
    if (savedIndex > -1){
        var duration = AndroidSessionDuration-(Date.now() - tokens[savedIndex][1]);
        return duration;
    } else{
        return "INVALID"
    }
}

http.listen(process.env.HTTP_LISTEN_PORT,process.env.HTTP_LISTEN_IP, function(){
    console.log('listening on '+process.env.HTTP_LISTEN_IP+':'+process.env.HTTP_LISTEN_PORT);
});
