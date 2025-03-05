<?php
$apiKey = '60eb9283c9d94495a8ba4a7a4a730e34'; // Replace with your OpenExchangeRates API key

if (isset($_GET['action'])) {
    $action = $_GET['action'];

    if ($action === 'getCurrencies') {
        // Fetch the list of currencies
        $url = "https://openexchangerates.org/api/currencies.json";
        $response = file_get_contents($url);
        if ($response === FALSE) {
            echo json_encode(['error' => 'Failed to retrieve currencies']);
        } else {
            echo $response;
        }
    } elseif ($action === 'getExchangeRate' && isset($_GET['from']) && isset($_GET['to'])) {
        // Fetch the exchange rate
        $from = $_GET['from'];
        $to = $_GET['to'];
        $url = "https://openexchangerates.org/api/latest.json?app_id=$apiKey";
        $response = file_get_contents($url);
        if ($response === FALSE) {
            echo json_encode(['error' => 'Failed to retrieve exchange rate']);
        } else {
            $data = json_decode($response, true);
            if (isset($data['rates'][$from]) && isset($data['rates'][$to])) {
                $rate = $data['rates'][$to] / $data['rates'][$from];
                echo json_encode(['rate' => $rate]);
            } else {
                echo json_encode(['error' => 'Invalid currency codes']);
            }
        }
    } elseif ($action === 'getAllRates') {
        // Get both currencies and rates in one request
        $currencies_url = "https://openexchangerates.org/api/currencies.json";
        $rates_url = "https://openexchangerates.org/api/latest.json?app_id=$apiKey";
        
        $currencies_response = file_get_contents($currencies_url);
        $rates_response = file_get_contents($rates_url);
        
        if ($currencies_response === FALSE || $rates_response === FALSE) {
            echo json_encode(['error' => 'Failed to retrieve currency data']);
        } else {
            $currencies = json_decode($currencies_response, true);
            $rates_data = json_decode($rates_response, true);
            
            echo json_encode([
                'currencies' => $currencies,
                'rates' => $rates_data['rates'],
                'base' => $rates_data['base']
            ]);
        }
    } else {
        echo json_encode(['error' => 'Invalid action or missing parameters']);
    }
} else {
    echo json_encode(['error' => 'Action is required']);
}
?>
