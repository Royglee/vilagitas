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
    socket.on('Arduino/Sensor', function(msg){
        lastData[msg.id] = msg.data;
        $('span.lastData'+msg.id).text(msg.data);
    });

//---------SLIDER-----------------------------
    var $rangeslider =  $('#slider input[type=range]');
    var $amount = $('#slider input[type=number]');
    var prevAm = [];
    $rangeslider
        .rangeslider({
            polyfill: false,
            onSlide: function(position, value) {
                var $idArray = this.$element.prop('id').split('-');
                var $id = $idArray[$idArray.length-1];

                $('#feny-input-'+$id).val(value);

                if (prevAm[$id] != value) {
                    socket.emit("Arduino/Feny", {value: value, id: $id});
                    prevAm[$id] = value;
                }
            }
        })

    $amount.on('change', function() {
        var $idArray = $(this).prop('id').split('-');
        var $id = $idArray[$idArray.length-1];

        $('#feny-range-'+$id).val(this.value).change();
    });

    socket.on('Arduino/Feny', function(msg){
        var $slider = $('#feny-range-'+msg.id);
        //console.log(msg);
       $slider.val(msg.value);
        $slider.rangeslider('update', true, false);

        $('#feny-input-'+msg.id).val(msg.value);
    });

});