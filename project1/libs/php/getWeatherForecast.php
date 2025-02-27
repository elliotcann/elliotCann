<?php
// filepath: /c:/coding/apps/XAMPP/htdocs/itCareerSwitch/elliotCann/project1/libs/php/getWeatherForecast.php

header('Content-Type: application/json');

if (isset($_GET['lat']) && isset($_GET['lng'])) {
    $lat = $_GET['lat'];
    $lng = $_GET['lng'];
    $apiKey = '3df0b2b00e2af7d37b2b7a44d3eff705'; // Replace with your OpenWeather API key

    $url = "https://api.openweathermap.org/data/2.5/forecast?lat=$lat&lon=$lng&units=metric&appid=$apiKey";

    $response = file_get_contents($url);
    if ($response === FALSE) {
        echo json_encode(['error' => 'Failed to retrieve weather data']);
    } else {
        echo $response;
    }
} else {
    echo json_encode(['error' => 'Latitude and longitude are required']);
}
?>