<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit();
}

$id = $_GET['id'] ?? 0;
$praticien_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("DELETE FROM creneau WHERE id = ? AND id_praticien = ? AND statut != 'reserve'");
    
    if ($stmt->execute([$id, $praticien_id])) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "Erreur suppression"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>