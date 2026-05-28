<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'praticien') {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit();
}

$praticien_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("
        SELECT a.*, 
        COALESCE(a.prix, 0) as prix,
        (SELECT COUNT(*) FROM inscription i WHERE i.id_activite = a.id) as inscrits
        FROM activite a
        WHERE a.id_praticien = ?
        ORDER BY a.date_heure ASC
    ");
    $stmt->execute([$praticien_id]);
    $activites = $stmt->fetchAll();
    
    echo json_encode(["success" => true, "activites" => $activites]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>