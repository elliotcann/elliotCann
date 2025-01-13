/* JS script for Ocean */
$('#oceanSubmit').click(function() {

    $.ajax({
        url: "php/getOceanInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#oceanLat').val(),
            lng: $('#oceanLng').val()
        },
        success: function(result) {

            console.log(JSON.stringify(result));

            if (result.status.name == "ok") {
                $('#oceanName').html(result['ocean']['name']);
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // your error code
            alert( "Sorry, there was a problem!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + textStatus );
            console.dir( jqXHR );
        }
    }); 

});