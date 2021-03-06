var mosca = require('mosca')

var ascoltatore = {
    type: 'redis',
    redis: require('redis'),
    db: 12,
    port: 6379,
    return_buffers: true, // to handle binary payloads
    host: "localhost"
};

var moscaSettings = {
    port: 1883,
    backend: ascoltatore,
    persistence: {
        factory: mosca.persistence.Redis
    }
};

var server = new mosca.Server(moscaSettings);

server.on('ready', setup);

server.on('clientConnected', function (client) {
    console.log('client connected', client.id);
});

server.on('clientDisconnected', function (client) {
    console.log('Client Disconnected:', client.id);
    if (client.id == "arduinoClient") {
        var message = {topic: 'Arduino/Disconnected', payload: 'Disconnected', qos: 0, retain: false};
        server.publish(message, function () {
            //console.log('done!');
        });
    }
});

// fired when a message is received
server.on('published', function (packet, client) {
    //console.log(timeStamp() + ' Topic: ' + packet.topic + ' , Payload: ' + packet.payload.toString());
});

// fired when the mqtt server is ready
function setup() {
    console.log('Mosca server is up and running')
}

function timeStamp() {
    var myDate = new Date();
    return ("["+myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds()+"]");

}