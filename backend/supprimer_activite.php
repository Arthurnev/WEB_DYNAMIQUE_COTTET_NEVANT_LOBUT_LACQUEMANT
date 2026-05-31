<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit();
}

$id = $_GET['id'] ?? 0;
$stmt = $pdo->prepare("DELETE FROM activite WHERE id = ? AND id_praticien = ?");

if ($stmt->execute([$id, $_SESSION['user_id']])) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false]);
}
?>