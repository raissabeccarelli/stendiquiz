<?php
    $host = "localhost"; 
    $user = "stendiquiz";
    $password = "";
    $dbname = "my_stendiquiz";

    mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
    $conn = new mysqli($host, $user, $password, $dbname);
    $conn->set_charset('utf8mb4');

    if (!$conn || $conn->connect_error) {
        die("Errore di connessione: " . $conn->connect_error);
    }
?>