<?php
// Define the path to the country borders GeoJSON file
define('COUNTRY_BORDERS_FILE', '../geojson/countryBorders.geo.json');

// Returns a JSON object with ISO codes and country names.
function getCountriesAsJSON() {
    // Check if the GeoJSON file exists
    if (!file_exists(COUNTRY_BORDERS_FILE)) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(["error" => "Country borders file not found."]);
        exit;
    }

    // Decode the GeoJSON file
    $data = json_decode(file_get_contents(COUNTRY_BORDERS_FILE), true);
    if (!$data || !isset($data['features'])) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(["error" => "Invalid GeoJSON format."]);
        exit;
    }

    // Extract ISO codes and country names
    $countries = [];
    foreach ($data['features'] as $feature) {
        $iso2 = $feature['properties']['iso_a2'] ?? '';
        $name = $feature['properties']['name'] ?? '';
        if ($iso2 && $name) {
            $countries[] = ["iso2" => $iso2, "name" => $name];
        }
    }

    // Return the JSON response
    header('Content-Type: application/json');
    echo json_encode($countries);
    exit;
}
// Output the JSON response
getCountriesAsJSON();
?>
