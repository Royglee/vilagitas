var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://vm.ik.bme.hu:19540');

client.on('connect', function () {
    client.subscribe('Arduino/Feny0');
    client.subscribe('Arduino/Feny1');
    client.subscribe('Arduino/Mode');
    client.subscribe('Switch/States');

    client.on('message', function (topic, message) {
        console.log(topic +": " + message.toString());
    });
});/**
 * Created by rosta on 2016. 05. 03..
 */
