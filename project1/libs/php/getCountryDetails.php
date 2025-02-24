<?php
if (isset($_GET['countryCode'])) {
    $countryCode = $_GET['countryCode'];

    // Fetch data from REST Countries API
    $restCountriesUrl = "https://restcountries.com/v3.1/alpha/{$countryCode}";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $restCountriesUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $restCountriesResponse = curl_exec($ch);
    curl_close($ch);
    $restCountriesData = json_decode($restCountriesResponse, true);

    if (isset($restCountriesData[0])) {
        $country = $restCountriesData[0];
        $currencies = [];
        if (isset($country['currencies'])) {
            foreach ($country['currencies'] as $code => $currency) {
                $currencies[] = $code . ' (' . ($currency['symbol'] ?? '') . ')';
            }
        }
        $countryDetails = [
            'countryName' => $country['name']['common'] ?? '',
            'flag' => $country['flags']['png'] ?? '',
            'countryCode' => $countryCode,
            'region' => $country['region'] ?? '',
            'capitalCity' => $country['capital'][0] ?? '',
            'population' => $country['population'] ?? '',
            'area' => ($country['area'] ?? '') . ' km²',
            'nativeLanguages' => implode(', ', array_values($country['languages'] ?? [])),
            'currency' => implode(', ', $currencies),
            'callingCode' => ($country['idd']['root'] ?? '') . ($country['idd']['suffixes'][0] ?? ''),
            'timeZone' => implode(', ', $country['timezones'] ?? [])
        ];
        echo json_encode($countryDetails);
    } else {
        echo json_encode(['error' => 'No data found']);
    }
} else {
    echo json_encode(['error' => 'Country code not provided']);
}
?>