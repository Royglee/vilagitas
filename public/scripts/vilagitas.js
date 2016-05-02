$( document ).ready(function() {
    var socket = io();
    $('form').submit(function(){
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('chat message', function(msg){
        var myDiv = $(".chat");
        $("#messages").append($('<li>').text(msg));
        myDiv.animate({ scrollTop: myDiv[0].scrollHeight}, 100);

    });

    (function () {

        var selector = '[data-rangeSlider]',
            elements = document.querySelectorAll(selector);

        // Example functionality to demonstrate a value feedback
        function valueOutput(element) {
            var value = element.value;
            $("#change_input").val(value);
        }

        for (var i = elements.length - 1; i >= 0; i--) {
            valueOutput(elements[i]);
        }

        Array.prototype.slice.call(document.querySelectorAll('input[type="range"]')).forEach(function (el) {
            el.addEventListener('input', function (e) {
                valueOutput(e.target);
            }, false);
        });

        //prog change
        var changeValBtn = document.querySelector('#slider button');
        changeValBtn.addEventListener('click', function (e) {
            var inputRange = changeValBtn.parentNode.querySelector('input[type="range"]'),
                value = changeValBtn.parentNode.querySelector('input[type="number"]').value;

            inputRange.value = value;
            socket.emit('sliderChange', value);
            inputRange.dispatchEvent(new Event('change'));
        }, false);

        socket.on('sliderChange', function(value){
            var changeValBtn = document.querySelector('#slider button');
            var inputRange = changeValBtn.parentNode.querySelector('input[type="range"]');
            inputRange.value = value;
            inputRange.dispatchEvent(new Event('change'));
        });


        // Basic rangeSlider initialization
        rangeSlider.create(elements, {
            min: 0,
            max: 255,
            value : 0,
            borderRadius : 3,
            buffer : 0,
            minEventInterval : 200,

            // Callback function
            onInit: function () {
            },

            // Callback function
            onSlideStart: function (value, percent,  position) {
                //console.info('onSlideStart', 'value: ' + value, 'percent: ' + percent, 'position: ' + position);
            },

            // Callback function
            onSlide: function (value, percent,  position) {
                //console.log('onSlide', 'value: ' + value, 'percent: ' + percent, 'position: ' + position);
                socket.emit('sliderChange', value);
            },

            // Callback function
            onSlideEnd: function (value, percent,  position) {
                //console.warn('onSlideEnd', 'value: ' + value, 'percent: ' + percent, 'position: ' + position);
            }
        });

    })();
});