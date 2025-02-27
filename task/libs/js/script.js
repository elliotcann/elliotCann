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

/* JS script for Earthquake */
$('#eqSubmit').click(function() {

    $.ajax({
        url: "libs/php/getEarthquakeInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            north: $('#eqNorth').val(),
            south: $('#eqSouth').val(),
            east: $('#eqEast').val(),
            west: $('#eqWest').val()
        },
        success: function(result) {

            console.log(JSON.stringify(result));

            if (result.status.name == "ok") {
                $('#eqDateTime').html(result['data']['earthquakes'][0]['datetime']);
                $('#eqSrc').html(result['data']['earthquakes'][0]['src']);
                $('#eqMagnitude').html(result['data']['earthquakes'][0]['magnitude']);
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert( "No earthquakes within these coordinates!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + textStatus );
            console.dir( jqXHR );
        }
    }); 

});

/* JS script for Weather */
$('#weatherSubmit').click(function() {

    $.ajax({
        url: "libs/php/getWeatherInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            north: $('#weatherNorth').val(),
            south: $('#weatherSouth').val(),
            east: $('#weatherEast').val(),
            west: $('#weatherWest').val()
        },
        success: function(result) {

            console.log(JSON.stringify(result));

            if (result.status.name == "ok") {
                $('#weatherDateTime').html(result['data']['weatherObservations'][0]['datetime']);
                $('#weatherTemperature').html(result['data']['weatherObservations'][0]['temperature']);
                $('#weatherHumidity').html(result['data']['weatherObservations'][0]['humidity']);
                $('#weatherClouds').html(result['data']['weatherObservations'][0]['clouds']);
                $('#weatherWindDirection').html(result['data']['weatherObservations'][0]['windDirection']);
                $('#weatherWindSpeed').html(result['data']['weatherObservations'][0]['windSpeed']);
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert( "No weather report here!" );
            console.log( "Error: " + errorThrown );
            console.log( "Status: " + textStatus );
            console.dir( jqXHR );
        }
    }); 

});