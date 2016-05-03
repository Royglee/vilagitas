$(function() {
    // We use an inline data source in the example, usually data would
    // be fetched from a server
    lastData=0;
    var data = [],
        totalPoints = 300;
    function getRandomData() {
        if (data.length > 0)
            data = data.slice(1);
        // Do a random walk
        while (data.length < totalPoints) {
            data.push(lastData);
        }
        // Zip the generated y values with the x values
        var res = [];
        for (var i = 0; i < data.length; ++i) {
            res.push([i, data[i]])
        }
        return res;
    }
    // Set up the control widget
    var updateInterval = 30;
    var plot = $.plot("#placeholder", [ getRandomData() ], {
        series: {
            shadowSize: 0	// Drawing is faster without shadows
        },
        yaxis: {
            min: 400,
            max: 1023
        },
        xaxis: {
            show: true
        }
    });
    function update() {
        plot.setData([getRandomData()]);
        // Since the axes don't change, we don't need to call plot.setupGrid()
        plot.draw();
        setTimeout(update, updateInterval);
    }
    update();
});