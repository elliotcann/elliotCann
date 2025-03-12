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

// Now get the full content we need
$contentUrl = "https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|info&exintro=1&explaintext=1&inprop=url&pithumbsize=500&titles={$pageTitle}&format=json";
$contentResponse = file_get_contents($contentUrl);

if ($contentResponse === FALSE) {
    echo json_encode(['error' => 'Failed to fetch Wikipedia content']);
    exit;
}

$contentData = json_decode($contentResponse, true);
$pages = $contentData['query']['pages'];
$pageId = array_key_first($pages);
$page = $pages[$pageId];

// Get sections (table of contents)
$sectionsUrl = "https://en.wikipedia.org/w/api.php?action=parse&page={$pageTitle}&prop=sections&format=json";
$sectionsResponse = file_get_contents($sectionsUrl);
$sectionsData = json_decode($sectionsResponse, true);

$sections = [];
if (isset($sectionsData['parse']['sections'])) {
    // Get only the main sections (up to 5)
    $count = 0;
    foreach ($sectionsData['parse']['sections'] as $section) {
        if ($section['toclevel'] == 1 && $count < 5) {
            $sections[] = [
                'title' => $section['line'],
                'index' => $section['index']
            ];
            $count++;
        }
    }
}

// Prepare the result
$result = [
    'title' => $page['title'],
    'extract' => $page['extract'],
    'thumbnail' => $page['thumbnail']['source'] ?? '',
    'fullurl' => $page['fullurl'] ?? "https://en.wikipedia.org/wiki/{$pageTitle}",
    'sections' => $sections
];

echo json_encode($result);
?>