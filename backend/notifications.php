<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit;
}

$id_utilisateur = $_SESSION["user_id"];

try {
    $stmt = $pdo->prepare("
        SELECT id, message, type, lu, created_at as date
        FROM notification
        WHERE id_utilisateur = ?
        ORDER BY created_at DESC
    ");
    $stmt->execute([$id_utilisateur]);
    $notifications = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "notifications" => $notifications
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>