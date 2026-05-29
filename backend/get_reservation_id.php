<?php
header("Content-Type: application/json");
require_once "config.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit;
}

$creneau_id = $_GET["creneau_id"] ?? 0;

$stmt = $pdo->prepare("SELECT id FROM reservation WHERE id_creneau = ? AND statut = 'confirmee'");
$stmt->execute([$creneau_id]);
$reservation = $stmt->fetch();

if ($reservation) {
    echo json_encode(["success" => true, "reservation_id" => $reservation["id"]]);
} else {
    echo json_encode(["success" => false, "error" => "Aucune réservation"]);
}
?>