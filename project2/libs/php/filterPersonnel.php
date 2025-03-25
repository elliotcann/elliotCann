<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

include("config.php");

// Add this line to track execution time
$executionStartTime = microtime(true);

header('Content-Type: application/json; charset=UTF-8');

$output = [];

try {
    $conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

    if(mysqli_connect_errno()) {
        throw new Exception("Database connection failed: " . mysqli_connect_error());
    }

    // Build the SQL query with conditional filtering
    $sql = "SELECT 
        p.id,
        p.lastName,
        p.firstName,
        p.jobTitle,
        p.email,
        p.departmentID,
        d.name AS department,
        d.locationID,
        l.name AS location
    FROM personnel p
    LEFT JOIN department d ON p.departmentID = d.id
    LEFT JOIN location l ON d.locationID = l.id
    WHERE 1=1";

    $bindParams = [];
    $bindTypes = "";

    // Add department filter if provided
    if(isset($_REQUEST['department']) && $_REQUEST['department'] != "") {
        $sql .= " AND p.departmentID = ?";
        $bindParams[] = $_REQUEST['department'];
        $bindTypes .= "i"; // Integer parameter
    }

    // Add location filter if provided
    if(isset($_REQUEST['location']) && $_REQUEST['location'] != "") {
        $sql .= " AND d.locationID = ?";
        $bindParams[] = $_REQUEST['location'];
        $bindTypes .= "i"; // Integer parameter
    }

    $sql .= " ORDER BY p.lastName, p.firstName";

    $query = $conn->prepare($sql);
    
    if (!$query) {
        throw new Exception("Prepare statement failed: " . $conn->error);
    }

    // Only bind parameters if we have any
    if (!empty($bindParams)) {
        // Alternative binding method without spread operator
        $params = array($bindTypes);
        foreach ($bindParams as $key => $value) {
            $params[] = &$bindParams[$key];
        }
        
        if (!call_user_func_array(array($query, 'bind_param'), $params)) {
            throw new Exception("Parameter binding failed: " . $query->error);
        }
    }

    // Execute query
    if (!$query->execute()) {
        throw new Exception("Query execution failed: " . $query->error);
    }

    $result = $query->get_result();
    $data = [];

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

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['data'] = $data;

} catch (Exception $e) {
    $output['status']['code'] = "500";
    $output['status']['name'] = "error";
    $output['status']['description'] = $e->getMessage();
    $output['data'] = [];
}

// Add execution time
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";

// Close connection if it exists
if (isset($conn) && $conn) {
    mysqli_close($conn);
}

echo json_encode($output);
?>