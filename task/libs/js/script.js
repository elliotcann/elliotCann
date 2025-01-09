/* JS script for Ocean */
$('#oceanSubmit').click(function() {

    $.ajax({
        url: "libs/php/getOceanInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#lat').val(),
            lng: $('#lng').val()
        },
        success: function(result) {

            console.log(result);

            if (result.status.name == "ok") {
                $('#oceanName').html(result.data.ocean.name);
            }
        
        },
        error: function(jqXHR, textStatus, errorThrown) {
            // your error code
        }
    }); 

});