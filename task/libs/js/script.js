/* JS script for Ocean */
$('#oceanSubmit').click(function() {

    $.ajax({
        url: "libs/php/getOceanInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#oceanLat').val(),
            lng: $('#oceanLng').val()
        },
        success: function(result) {

            console.log(JSON.stringify(result));

            if (result.status.name == "ok") {
                $('#oceanName').html(result['data']['name']);
                $('#oceanId').html(result['data']['geonameId']);
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert( "Coordinates are over land!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + textStatus );
            console.dir( jqXHR );
        }
    }); 

});

/* JS script for Earthquakes */
