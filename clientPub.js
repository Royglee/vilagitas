var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://vm.ik.bme.hu:19540');

client.on('connect', function () {
    var rand;
    rand = Math.floor(Math.random() * 600) + 400;
    client.publish('Arduino/Sensor0', rand.toString(), {retain: false, qa: 1});
    rand = Math.floor(Math.random() * 600) + 400;
    client.publish('Arduino/Sensor1', rand.toString(), {retain: false, qa: 1});
    client.end();
});/**
 * Created by rosta on 2016. 05. 02..
 */
