var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://localhost');

client.on('connect', function () {
    client.publish('presence', 'Hello!', {retain: false, qa: 1});
    client.end();
});/**
 * Created by rosta on 2016. 05. 02..
 */
