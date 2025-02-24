<?php
header('Content-Type: application/json');

$lat = $_GET['lat'] ?? '';
$lng = $_GET['lng'] ?? '';

if (!$lat || !$lng) {
    echo json_encode(['error' => 'Latitude and longitude are required']);
    exit;
}

$apiUrl = "https://en.wikipedia.org/w/api.php?action=query&format=json&prop=coordinates|pageimages|pageterms&generator=geosearch&ggscoord={$lat}|{$lng}&ggsradius=10000&ggs&piprop=thumbnail&pithumbsize=200";

$response = file_get_contents($apiUrl);
if ($response === FALSE) {
    echo json_encode(['error' => 'Failed to fetch Wikipedia articles']);
    exit;
}

$data = json_decode($response, true);
$articles = [];

if (isset($data['query']['pages'])) {
    foreach ($data['query']['pages'] as $page) {
        if (isset($page['coordinates'][0])) {
            $articles[] = [
                'title' => $page['title'],
                'lat' => $page['coordinates'][0]['lat'],
                'lng' => $page['coordinates'][0]['lon'],
                'url' => "https://en.wikipedia.org/?curid=" . $page['pageid'],
                'thumbnail' => $page['thumbnail']['source'] ?? ''
            ];
        }
    }
}

echo json_encode(['articles' => $articles]);
?>
