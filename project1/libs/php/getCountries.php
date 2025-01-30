<?php
// Path to the countryBorders.geo.json file
define('COUNTRY_BORDERS_FILE', '../geojson/countryBorders.geo.json');

/**
 * Returns a JSON object with ISO codes and country names.
 *
 * @return string JSON string with an array of country data
 */
function getCountriesAsJSON() {
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

    $countries = [];
    foreach ($data['features'] as $feature) {
        $iso2 = $feature['properties']['iso_a2'] ?? '';
        $name = $feature['properties']['name'] ?? '';
        if ($iso2 && $name) {
            $countries[] = [
                "iso2" => $iso2,
                "name" => $name
            ];
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
