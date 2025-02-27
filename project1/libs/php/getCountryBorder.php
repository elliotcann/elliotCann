<?php
// Path to the countryBorders.geo.json file
define('COUNTRY_BORDERS_FILE', '../geojson/countryBorders.geo.json');

// Returns a JSON object with the borders of the specified country.
function getCountryBorderAsJSON($iso2) {
    if (!file_exists(COUNTRY_BORDERS_FILE)) {
        http_response_code(404);
        header('Content-Type: application/json');
        echo json_encode(["error" => "Country borders file not found."]);
        exit;
    }

    $data = json_decode(file_get_contents(COUNTRY_BORDERS_FILE), true);
    if (!$data || !isset($data['features'])) {
        http_response_code(500);
        header('Content-Type: application/json');
        echo json_encode(["error" => "Invalid GeoJSON format."]);
        exit;
    }

    $borders = array_filter($data['features'], function ($feature) use ($iso2) {
        return $feature['properties']['iso_a2'] === $iso2;
    });

    // Return the JSON response
    header('Content-Type: application/json');
    echo json_encode(array_values($borders));
    exit;
}

if (isset($_GET['iso2'])) {
    getCountryBorderAsJSON($_GET['iso2']);
} else {
    http_response_code(400);
    header('Content-Type: application/json');
    echo json_encode(["error" => "Invalid request"]);
    exit;
}
?>
