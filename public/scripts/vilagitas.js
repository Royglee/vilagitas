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
    });

    var Auto=$("#autoButton");
    var Manual=$("#manualButton");
    Auto.click(function() {
        socket.emit('Arduino/Mode', 1);
    });
    Manual.click(function() {
        socket.emit('Arduino/Mode', 0);
    });
    socket.on('Arduino/Mode', function(msg){
        if(msg==1){
            Auto.addClass("selected"); Manual.removeClass("selected");
            $("#graph0").removeClass("graphAutoMode");
            $("#graph1").removeClass("graphAutoMode");
            $("#graph_hiba1").show();
            $("#graph_hiba2").show();
            $("#graph_beavatkozo1").show();
            $("#graph_beavatkozo2").show();
            $( window ).resize();
        }
        if(msg==0){
            Auto.removeClass("selected"); Manual.addClass("selected");
            $("#graph0").addClass("graphAutoMode");
            $("#graph1").addClass("graphAutoMode");
            $("#graph_hiba1").hide();
            $("#graph_hiba2").hide();
            $("#graph_beavatkozo1").hide();
            $("#graph_beavatkozo2").hide();
            $( window ).resize();
        }
    });

//---------SLIDER-----------------------------
    function setBG(){
        var val1 = parseInt($('#feny-input-0').val());
        var val2 = parseInt($('#feny-input-1').val());
        var alpha =1-((val1+val2)/510*(0.9)).toString();
        $('body').css({backgroundColor: "rgba(200,228,250,"+alpha+")"});
    }
    var $rangeslider =  $('#slider input[type=range]');
    var $amount = $('#slider input[type=number]');
    prevAm = [];
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

                    setBG();
                }
            }
        })

    $amount.on('change', function() {
        var $idArray = $(this).prop('id').split('-');
        var $id = $idArray[$idArray.length-1];
        //console.log("change",this.value);
        $('#feny-range-'+$id).val(this.value).change();
    });

    socket.on('Arduino/Feny', function(msg){
        var $slider = $('#feny-range-'+msg.id);
        //console.log(msg);
        prevAm[msg.id]=msg.value;
        $slider.val(msg.value);
        $slider.rangeslider('update', true, false);
        $('#feny-input-'+msg.id).val(msg.value);
        setBG();
    });


    $("#submit").click(function(){
        var states = {}
        var array = $( "#SWForm" ).serializeArray();
        var states = {
            "count":"3",
            "states":[
                {
                    "mode":array["mode[0]"].value,
                    "output":array["value[0]"].value,
                    "name":array["name[0]"].value,
                    "active":array["active[0]"].value
                },
                {
                    "mode":array["mode[1]"].value,
                    "output":array["value[1]"].value,
                    "name":array["name[1]"].value,
                    "active":array["active[1]"].value
                },
                {
                    "mode":array["mode[2]"].value,
                    "output":array["value[2]"].value,
                    "name":array["name[2]"].value,
                    "active":array["active[2]"].value
                }
            ]
        };
        console.log(states);

    });

});