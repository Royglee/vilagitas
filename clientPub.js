var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://vm.ik.bme.hu:19540');

client.on('connect', function () {
    client.publish('Arduino', "lel", {retain: false, qa: 1});
    client.end();
});/**
 * Created by rosta on 2016. 05. 02..
 */
