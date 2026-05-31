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

try {
    $stmt = $pdo->prepare("UPDATE notification SET lu = 1 WHERE id_utilisateur = ?");
    $stmt->execute([$id_utilisateur]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>