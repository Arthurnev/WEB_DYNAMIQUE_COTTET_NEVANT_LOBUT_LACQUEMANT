<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit();
}

$praticien_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("SELECT * FROM creneau WHERE id_praticien = ? ORDER BY date ASC, heure_debut ASC");
    $stmt->execute([$praticien_id]);
    $disponibilites = $stmt->fetchAll();
    
    echo json_encode(["success" => true, "disponibilites" => $disponibilites]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>