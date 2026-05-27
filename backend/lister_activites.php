<?php
header("Content-Type: application/json");

require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit();
}

$stmt = $pdo->prepare("SELECT * FROM activite WHERE id_praticien = ? ORDER BY date_heure ASC");
$stmt->execute([$_SESSION['user_id']]);
$activites = $stmt->fetchAll();

echo json_encode(["success" => true, "activites" => $activites]);
?>