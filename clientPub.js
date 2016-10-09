var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://vm.ik.bme.hu:19540');

client.on('connect', function () {
    var rand;
    var i=0;
    var led=1;
    setInterval(function(){
        client.publish('Arduino/Sensor0', (Math.cos(i)*120+130).toString(), {retain: false, qa: 1});
        client.publish('Arduino/Sensor1', (Math.cos(i)*120+130).toString(), {retain: false, qa: 1});

        client.publish('Arduino/Beavatkozo0', (Math.sin(i)*120+130).toString());
        client.publish('Arduino/Beavatkozo1', (Math.sin(i)*120+130).toString());
        i=i+0.1;
        if(i==3.14){i=0}
	led=-led;
	client.publish('inTopic', led.toString());
    }, 200);

    //client.end();
});/**
 * Created by rosta on 2016. 05. 02..
 */
