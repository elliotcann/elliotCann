<?php
// filepath: /c:/coding/apps/XAMPP/htdocs/itCareerSwitch/elliotCann/project1/libs/php/getWeatherForecast.php

header('Content-Type: application/json');

// Check if country code is provided
if (isset($_GET['countryCode'])) {
    $countryCode = $_GET['countryCode'];
    $apiKey = '3df0b2b00e2af7d37b2b7a44d3eff705'; // Your OpenWeather API key
    
    // First get country details
    // You may need to adjust this part based on how you're getting country details
    $countryDetailsUrl = "https://restcountries.com/v3.1/alpha/$countryCode";
    $countryDetails = file_get_contents($countryDetailsUrl);
    $countryData = json_decode($countryDetails, true);
    
    if (!$countryData || empty($countryData)) {
        echo json_encode(['error' => 'Failed to retrieve country data']);
        exit;
    }
    
    // Extract required country information
    $countryName = $countryData[0]['name']['common'];
    $capitalCity = isset($countryData[0]['capital'][0]) ? $countryData[0]['capital'][0] : null;
    $latlng = $countryData[0]['latlng']; // [lat, lng]
    $lat = $latlng[0];
    $lng = $latlng[1];
    
    // Now get weather data
    $weatherUrl = "https://api.openweathermap.org/data/2.5/forecast?lat=$lat&lon=$lng&units=metric&appid=$apiKey";
    $weatherResponse = file_get_contents($weatherUrl);
    
    if ($weatherResponse === FALSE) {
        echo json_encode(['error' => 'Failed to retrieve weather data']);
        exit;
    }
    
    // Combine country and weather data
    $weatherData = json_decode($weatherResponse, true);
    $weatherData['countryName'] = $countryName;
    $weatherData['capitalCity'] = $capitalCity;
    $weatherData['lat'] = $lat;
    $weatherData['lng'] = $lng;
    
    echo json_encode($weatherData);
    
} else {
    echo json_encode(['error' => 'Country code is required']);
}
?>