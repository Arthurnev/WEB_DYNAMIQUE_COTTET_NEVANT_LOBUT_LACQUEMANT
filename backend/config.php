<?php
$host = "localhost";
$dbname = "vitacare";
$username = "root";
$password = "root";

try {
    $pdo = new PDO(
        "mysql:host=$host;dbname=$dbname;charset=utf8",
        $username,
        $password
    );

    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    header("Content-Type: application/json");
    echo json_encode([
        "success" => false,
        "error" => "Erreur de connexion à la base de données : " . $e->getMessage()
    ]);
    exit;
}
?>
