<?php
    // Set JSON content type
    header('Content-Type: application/json');
    
    // Call the Open Notify API to get ISS position
    $url = 'http://api.open-notify.org/iss-now.json';
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $response = curl_exec($ch);
    
    if(curl_errno($ch)) {
        echo json_encode(['error' => 'Failed to get ISS position: ' . curl_error($ch)]);
    } else {
        echo $response;
    }
    
    curl_close($ch);
?>