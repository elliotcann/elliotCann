<?php
header('Content-Type: application/json');

$countryName = $_GET['countryName'] ?? '';

if (empty($countryName)) {
    echo json_encode(['error' => 'Country name is required']);
    exit;
}

// Format country name for Wikipedia API
$searchTerm = urlencode($countryName);

// First, get the exact page title
$searchUrl = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch={$searchTerm}&format=json&srprop=snippet";
$searchResponse = file_get_contents($searchUrl);

if ($searchResponse === FALSE) {
    echo json_encode(['error' => 'Failed to search Wikipedia']);
    exit;
}

$searchData = json_decode($searchResponse, true);
if (empty($searchData['query']['search'])) {
    echo json_encode(['error' => 'No Wikipedia article found']);
    exit;
}

// Get the first (most relevant) result
$pageTitle = $searchData['query']['search'][0]['title'];
$pageTitle = str_replace(' ', '_', $pageTitle);

// Add this near the top of the file, after getting the page title
$pageUrl = "https://en.wikipedia.org/wiki/{$pageTitle}";

// Get the full content
$contentUrl = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&exintro=1&explaintext=1&pithumbsize=500&titles={$pageTitle}&format=json";
$contentResponse = file_get_contents($contentUrl);

if ($contentResponse === FALSE) {
    echo json_encode(['error' => 'Failed to fetch Wikipedia content']);
    exit;
}

$contentData = json_decode($contentResponse, true);
$pages = $contentData['query']['pages'];
$pageId = array_key_first($pages);
$page = $pages[$pageId];

// Get specific sections for facts
$sectionsUrl = "https://en.wikipedia.org/w/api.php?action=parse&page={$pageTitle}&prop=sections&format=json";
$sectionsResponse = file_get_contents($sectionsUrl);
$sectionsData = json_decode($sectionsResponse, true);

// Find relevant section indices for geography, culture, history
$geographyIndex = null;
$cultureIndex = null;
$historyIndex = null;

if (isset($sectionsData['parse']['sections'])) {
    foreach ($sectionsData['parse']['sections'] as $section) {
        $title = strtolower($section['line']);
        if (strpos($title, 'geography') !== false) {
            $geographyIndex = $section['index'];
        } else if (strpos($title, 'culture') !== false || strpos($title, 'arts') !== false) {
            $cultureIndex = $section['index'];
        } else if (strpos($title, 'history') !== false) {
            $historyIndex = $section['index'];
        }
    }
}

// Prepare the result
$result = [
    'title' => $page['title'],
    'extract' => $page['extract'],
    'url' => $pageUrl,
    'thumbnail' => $page['thumbnail']['source'] ?? ''
];

echo json_encode($result);
?>