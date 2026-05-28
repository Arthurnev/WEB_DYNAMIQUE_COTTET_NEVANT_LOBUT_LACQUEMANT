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
    // Vérifier si une note existe déjà
    $stmt = $pdo->prepare("SELECT id FROM consultation_commentaires WHERE reservation_id = ?");
    $stmt->execute([$reservation_id]);
    
    if ($stmt->fetch()) {
        // Mettre à jour
        $stmt = $pdo->prepare("UPDATE consultation_commentaires SET commentaire = ? WHERE reservation_id = ?");
        $stmt->execute([$commentaire, $reservation_id]);
    } else {
        // Insérer
        $stmt = $pdo->prepare("INSERT INTO consultation_commentaires (reservation_id, praticien_id, commentaire) VALUES (?, ?, ?)");
        $stmt->execute([$reservation_id, $praticien_id, $commentaire]);
    }
    
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>