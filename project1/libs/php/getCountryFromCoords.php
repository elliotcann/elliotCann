<?php
// This script gets the country code from the coordinates using OpenCageData API.
define('OPENCAGE_API_KEY', 'a71ed27af1ad4276912e03b08c436a60');

if (isset($_GET['lat']) && isset($_GET['lng'])) {
    $lat = $_GET['lat'];
    $lng = $_GET['lng'];

    $url = "https://api.opencagedata.com/geocode/v1/json?q={$lat}+{$lng}&key=" . OPENCAGE_API_KEY;

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode !== 200 || $response === FALSE) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(["error" => "Failed to get data from OpenCageData API."]);
        exit;
    }

    $data = json_decode($response, true);
    if (!$data || !isset($data['results'][0]['components']['country_code'])) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(["error" => "Invalid response from OpenCageData API."]);
        exit;
    }

    $countryCode = strtoupper($data['results'][0]['components']['country_code']);
    header('Content-Type: application/json');
    echo json_encode(["countryCode" => $countryCode]);
    exit;
} else {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Invalid request"]);
    exit;
}
?>