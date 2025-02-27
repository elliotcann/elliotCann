<?php
header('Content-Type: application/json');

$countryCode = $_GET['countryCode'] ?? '';

if (!$countryCode) {
    echo json_encode(['error' => 'Country code is required']);
    exit;
}

$apiKey = 'pub_6879606accb66b25869ebd1ffdf9126bb991c'; // Replace with your Newsdata.io key
$newsApiUrl = "https://newsdata.io/api/1/latest?country={$countryCode}&category=top&language=en&image=1&removeduplicate=1&apikey={$apiKey}";

$response = file_get_contents($newsApiUrl);
if ($response === FALSE) {
    echo json_encode(['error' => 'Failed to fetch news articles']);
    exit;
}

echo $response;
?>
