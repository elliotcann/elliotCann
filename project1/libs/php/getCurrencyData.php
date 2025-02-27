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
    } else {
        echo json_encode(['error' => 'Invalid action or missing parameters']);
    }
} else {
    echo json_encode(['error' => 'Action is required']);
}
?>
