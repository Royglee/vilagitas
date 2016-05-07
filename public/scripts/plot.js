$(function() {
    // We use an inline data source in the example, usually data would
    // be fetched from a server
    lastData=[];
    lastData[0]=0;
    lastData[1]=0;
    var data = [[],[]],
        totalPoints = 1000;
    function insertLastData(dataSet) {
        if (data[dataSet].length > 0)
            data[dataSet] = data[dataSet].slice(1);
        // Do a random walk
        while (data[dataSet].length < totalPoints) {
            data[dataSet].push(lastData[dataSet]);
        }
        // Zip the generated y values with the x values
        var res = [];
        for (var i = 0; i < data[dataSet].length; ++i) {
            res.push([i, data[dataSet][i]])
        }
        return res;
    }
    // Set up the control widget
    var updateInterval = 30;
    var plot0 = $.plot("#graph0", [ insertLastData(0) ], {
        series: {shadowSize: 0},
        yaxis: {min: 400, max: 1023},
        xaxis: {show: true}
    });
    var plot1= $.plot("#graph1", [ insertLastData(1) ], {
        series: {shadowSize: 0},
        yaxis: {min: 400, max: 1023},
        xaxis: {show: true}
    });
    function update() {
        plot0.setData([insertLastData(0)]);
        plot1.setData([insertLastData(1)]);
        // Since the axes don't change, we don't need to call plot.setupGrid()
        plot0.draw();
        plot1.draw();
        setTimeout(update, updateInterval);
    }
    update();
});