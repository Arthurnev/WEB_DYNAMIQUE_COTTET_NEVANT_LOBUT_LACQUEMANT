<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'praticien') {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);
$reservation_id = $data['reservation_id'] ?? 0;
$commentaire = trim($data['commentaire'] ?? '');
$praticien_id = $_SESSION['user_id'];

if (!$reservation_id) {
    echo json_encode(["success" => false, "error" => "ID réservation manquant"]);
    exit();
}

if (empty($commentaire)) {
    echo json_encode(["success" => false, "error" => "Commentaire vide"]);
    exit();
}

try {
    $stmt = $pdo->prepare("INSERT INTO consultation_commentaires (reservation_id, praticien_id, commentaire) VALUES (?, ?, ?)");
    
    if ($stmt->execute([$reservation_id, $praticien_id, $commentaire])) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "error" => "Erreur insertion"]);
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>