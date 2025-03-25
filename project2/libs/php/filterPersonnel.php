<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include configuration file
include("config.php");

// Track execution time
$executionStartTime = microtime(true);

// Set content type header
header('Content-Type: application/json; charset=UTF-8');

// Initialize output array
$output = [];

// Connect to the database
$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

// Check connection
if(mysqli_connect_errno()) {
    $output['status']['code'] = "500";
    $output['status']['name'] = "error";
    $output['status']['description'] = "Database connection failed: " . mysqli_connect_error();
    $output['data'] = [];
    
    // Add execution time
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    echo json_encode($output);
    exit;
}

// Build the SQL query with conditional filtering
$sql = "SELECT 
    p.id, p.lastName, p.firstName, p.jobTitle, p.email, p.departmentID,
    d.name AS department, d.locationID, l.name AS location
FROM personnel p
LEFT JOIN department d ON p.departmentID = d.id
LEFT JOIN location l ON d.locationID = l.id
WHERE 1=1";

// Add filters
$params = [];

// Department filter
if(isset($_REQUEST['department']) && $_REQUEST['department'] != "") {
    $sql .= " AND p.departmentID = ?";
    $params[] = $_REQUEST['department'];
}

// Location filter
if(isset($_REQUEST['location']) && $_REQUEST['location'] != "") {
    $sql .= " AND d.locationID = ?";
    $params[] = $_REQUEST['location'];
}

$sql .= " ORDER BY p.lastName, p.firstName";

// Prepare statement
$stmt = $conn->prepare($sql);

// Bind parameters if needed
if (!empty($params)) {
    $types = str_repeat('i', count($params)); // All params are integers
    $stmt->bind_param($types, ...$params);
}

// Execute query
$stmt->execute();
$result = $stmt->get_result();
$data = [];

// Process results
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'id' => $row['id'],
        'lastName' => $row['lastName'],
        'firstName' => $row['firstName'],
        'jobTitle' => $row['jobTitle'],
        'email' => $row['email'],
        'departmentID' => $row['departmentID'],
        'department' => $row['department'],
        'locationID' => $row['locationID'],
        'location' => $row['location'] 
    ];
}

// Set success output
$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['data'] = $data;

// Add execution time
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";

// Close connection
mysqli_close($conn);

// Return JSON response
echo json_encode($output);
?>