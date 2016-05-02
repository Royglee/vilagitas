var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');

client.on('connect', function () {
    client.subscribe('presence');

    client.on('message', function (topic, message) {
        console.log(topic +": " + message.toString());
    });
});/**
 * Created by rosta on 2016. 05. 03..
 */
