var mqtt    = require('mqtt');
var client  = mqtt.connect('mqtt://vm.ik.bme.hu:19540');

client.on('connect', function () {
    var rand;
    var i=0;
    var states = {
        "count":"3",
        "states":[
            {
                "mode":"0",
                "output":"220",
                "name":"Dóri",
                "active":"true"
            },
            {
                "mode":"0",
                "output":"200",
                "name":"Dynamic2",
                "active":"true"
            },
            {
                "mode":"0",
                "output":"20",
                "name":"Dynamic3",
                "active":"true"
            }
        ]
    }
    setInterval(function(){
        //client.publish('Arduino/Sensor0', (Math.cos(i)*120+130).toString(), {retain: false, qa: 1});
        //client.publish('Arduino/Sensor1', (Math.cos(i)*120+130).toString(), {retain: false, qa: 1});
        //
        //client.publish('Arduino/Beavatkozo0', (Math.sin(i)*120+130).toString());
        //client.publish('Arduino/Beavatkozo1', (Math.sin(i)*120+130).toString());
        //i=i+0.1;
        //if(i==3.14){i=0}

        //client.publish("Switch/States", "{\"count\":\"3\",\"states\":[{\"mode\":\"0\",\"output\":\"200\",\"name\":\"Napos\"},{\"mode\":\"0\",\"output\":\"200\",\"name\":\"Napos\"},{\"mode\":\"0\",\"output\":\"200\",\"name\":\"Napos\"}]}");
        client.publish("Switch/States", JSON.stringify(states));
        //client.publish("Switch/States", "");
        //client.publish("Arduino/Feny0", "0");
        console.log(addslashes(JSON.stringify(states)));

    }, 1000);

    function addslashes(string) {
        return string.replace(/\\/g, '\\\\').
            replace(/\u0008/g, '\\b').
            replace(/\t/g, '\\t').
            replace(/\n/g, '\\n').
            replace(/\f/g, '\\f').
            replace(/\r/g, '\\r').
            replace(/'/g, '\\\'').
            replace(/"/g, '\\"');
    }

    //client.end();
});/**
 * Created by rosta on 2016. 05. 02..
 */
