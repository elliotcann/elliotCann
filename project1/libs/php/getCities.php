<?php
// This script gets the cities from the country code using the GeoNames API.
if (isset($_GET['country'])) {
    $country = $_GET['country'];
    $username = 'elliotcann';
    $minPopulation = 100000; // Minimum population to filter cities
    $maxRows = 100; // Limit the number of cities returned

    $url = "http://api.geonames.org/searchJSON?country=$country&featureClass=P&username=$username&maxRows=$maxRows";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        echo json_encode(['error' => curl_error($ch)]);
    } else {
        $data = json_decode($response, true);
        $filteredCities = array_filter($data['geonames'], function($city) use ($minPopulation) {
            return $city['population'] >= $minPopulation;
        });
        echo json_encode(['geonames' => array_values($filteredCities)]);
    }
    curl_close($ch);
} else {
    echo json_encode(['error' => 'Country code not provided']);
}
?>