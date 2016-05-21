$(function() {
    // We use an inline data source in the example, usually data would
    // be fetched from a server
    lastData=[];
    lastData[0]=0; //sensor1
    lastData[1]=0; //sensor2
    lastData[2]=0; //alapjel1
    lastData[3]=0; //alapjel2
    lastData[4]=0; //h1
    lastData[5]=0; //h2
    lastData[6]=0; //b1
    lastData[7]=0; //b2

    var data = [[],[],[],[],[],[],[],[]],
        totalPoints = 1000;
    function insertLastData(dataSet) {
        if (data[dataSet].length > 0)
            data[dataSet] = data[dataSet].slice(1);

        while (data[dataSet].length < totalPoints) {
            data[dataSet].push(lastData[dataSet]);
        }

        var res = [];
        for (var i = 0; i < data[dataSet].length; ++i) {
            res.push([i, data[dataSet][i]])
        }
        return res;
    }
    // Set up the control widget
    var updateInterval = 30;
    var plot0,plot1,plot_h1,plot_h2,plot_b1,plot_b2;
        function plotInit(){
            plot0 = $.plot("#graph0",[{label:"szenzor1",data:insertLastData(0)},{label:"alapjel1",data:insertLastData(2)} ], {
                series: {shadowSize: 0},
                yaxis: {min: 0, max: 255},
                xaxis: {show: true},
                colors: ["rgb(240,205,103)","#7D7"],
                legend:{
                    position:"nw"
                }

            });
            plot1= $.plot("#graph1",[{label:"szenzor2",data:insertLastData(1)}, {label:"alapjel2",data:insertLastData(3)} ], {
                series: {shadowSize: 0},
                yaxis: {min: 0, max: 255},
                xaxis: {show: true},
                colors: ["rgb(240,205,103)","#7D7"],
                legend:{
                    position:"nw"
                }
            });
            plot_h1= $.plot("#graph_hiba1", [{label:"hiba1",data:insertLastData(4)}], {
                series: {shadowSize: 0},
                yaxis: {min: -255, max: 255},
                xaxis: {show: true},
                colors: ["rgb(255,100,100)"],
                legend:{
                    position:"nw"
                }
            });
            plot_h2= $.plot("#graph_hiba2", [{label:"hiba2",data:insertLastData(5)}], {
                series: {shadowSize: 0},
                yaxis: {min: -255, max: 255},
                xaxis: {show: true},
                colors: ["rgb(255,100,100)"],
                legend:{
                    position:"nw"
                }
            });
            plot_b1= $.plot("#graph_beavatkozo1", [{label:"beavatkozo1",data:insertLastData(6)}], {
                series: {shadowSize: 0},
                yaxis: {min: 0, max: 255},
                xaxis: {show: true},
                colors: ["rgb(255,186,100)"],
                legend:{
                    position:"nw"
                }
            });
            plot_b2= $.plot("#graph_beavatkozo2", [ {label:"beavatkozo2",data:insertLastData(7)}], {
                series: {shadowSize: 0},
                yaxis: {min: 0, max: 255},
                xaxis: {show: true},
                colors: ["rgb(255,186,100)"],
                legend:{
                    position:"nw"
                }
            });
        }
    plotInit();
    function update() {
        lastData[2]=0|prevAm[0]; //alapjel1
        lastData[3]=0|prevAm[1]; //alapjel2
        lastData[4]=0|lastData[2]-lastData[0]; //hiba1
        lastData[5]=0|lastData[3]-lastData[1]; //hiba2
        plot0.setData([insertLastData(0),insertLastData(2)]);
        plot1.setData([insertLastData(1),insertLastData(3)]);

        plot_h1.setData([insertLastData(4)]);
        plot_h2.setData([insertLastData(5)]);

        plot_b1.setData([insertLastData(6)]);
        plot_b2.setData([insertLastData(7)]);
        // Since the axes don't change, we don't need to call plot.setupGrid()
        plot0.draw();
        plot1.draw();

        plot_h1.draw();
        plot_h2.draw();

        plot_b1.draw();
        plot_b2.draw();
        setTimeout(update, updateInterval);
    }
    update();

    $( window ).resize(function() {
        plotInit();
    });
});