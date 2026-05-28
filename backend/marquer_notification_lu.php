<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once "config.php";

session_start();
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit;
}

$id_utilisateur = $_SESSION["user_id"];
$data = json_decode(file_get_contents("php://input"), true);
$id_notification = $data["id"] ?? 0;

try {
    // Vérifier que la notification appartient bien à l'utilisateur
    $stmt = $pdo->prepare("
        SELECT id FROM notification 
        WHERE id = ? AND id_utilisateur = ?
    ");
    $stmt->execute([$id_notification, $id_utilisateur]);
    if (!$stmt->fetch()) {
        echo json_encode(["success" => false, "error" => "Notification introuvable"]);
        exit;
    }

    $stmt = $pdo->prepare("UPDATE notification SET lu = 1 WHERE id = ?");
    $stmt->execute([$id_notification]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>