<?php
if (isset($_GET['countryName'])) {
  $countryName = str_replace(' ', '_', $_GET['countryName']);
  $wikipediaUrl = "https://en.wikipedia.org/wiki/$countryName";

  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $wikipediaUrl);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  $response = curl_exec($ch);
  curl_close($ch);

  if ($response !== false) {
    echo json_encode(['url' => $wikipediaUrl]);
  } else {
    echo json_encode(['error' => 'Failed to fetch Wikipedia URL']);
  }
} else {
  echo json_encode(['error' => 'Country name not provided']);
}
?>