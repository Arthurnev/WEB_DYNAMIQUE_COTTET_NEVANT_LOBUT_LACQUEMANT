<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'praticien') {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$date = $data['date'] ?? '';
$heure_debut = $data['heure_debut'] ?? '';
$heure_fin = $data['heure_fin'] ?? '';
$praticien_id = $_SESSION['user_id'];
$id_service = 1;

if (empty($date) || empty($heure_debut) || empty($heure_fin)) {
    echo json_encode(["success" => false, "error" => "Champs obligatoires"]);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO creneau (date, heure_debut, heure_fin, statut, id_praticien, id_service) VALUES (?, ?, ?, 'disponible', ?, ?)");
    if ($stmt->execute([$date, $heure_debut, $heure_fin, $praticien_id, $id_service])) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "Erreur insertion"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>