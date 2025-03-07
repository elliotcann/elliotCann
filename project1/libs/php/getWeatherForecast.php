<?php
header('Content-Type: application/json');

// Check if city name is provided
if (isset($_GET['city'])) {
    $city = $_GET['city'];
    $apiKey = '70aa2122f1994c56a6b152248250602'; // Your WeatherAPI.com API key
    
    try {
        // WeatherAPI.com accepts city names as the query parameter
        $weatherUrl = "https://api.weatherapi.com/v1/forecast.json?key=$apiKey&q=" . urlencode($city) . "&days=3&aqi=no&alerts=no";
        
        // Use cURL for the weather API
        $ch = curl_init($weatherUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $weatherResponse = curl_exec($ch);
        
        if (curl_errno($ch)) {
            throw new Exception('Weather API request failed: ' . curl_error($ch));
        }
        
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        if ($httpCode !== 200) {
            throw new Exception("Weather API returned HTTP code $httpCode");
        }
        
        curl_close($ch);
        
        // Test if the response is valid JSON
        $weatherData = json_decode($weatherResponse, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception('Invalid JSON response from weather API: ' . json_last_error_msg());
        }
        
        // Extract country name and capital city from the location data returned by weatherapi.com
        $countryName = isset($weatherData['location']['country']) ? $weatherData['location']['country'] : 'Unknown';
        $capitalCity = isset($weatherData['location']['name']) ? $weatherData['location']['name'] : 'Unknown';
        
        // Add country context (though weatherapi already includes this in the response)
        $weatherData['countryName'] = $countryName;
        $weatherData['capitalCity'] = $capitalCity;
        
        echo json_encode($weatherData);
        
    } catch (Exception $e) {
        echo json_encode(['error' => $e->getMessage()]);
    }
} else {
    echo json_encode(['error' => 'City name is required']);
}
?>