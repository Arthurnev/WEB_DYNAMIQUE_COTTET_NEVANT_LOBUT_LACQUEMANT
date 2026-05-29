<?php
header("Content-Type: application/json");
require_once "config.php";

session_start();

// Vérifier que l'utilisateur est connecté (praticien ou étudiant)
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id_reservation = $data["id"] ?? 0;

$user_id = $_SESSION["user_id"];
$user_role = $_SESSION["role"];

try {
    // Vérifier que la réservation existe
    if ($user_role === 'praticien') {
        // Vérifier que le créneau appartient au praticien
        $stmt = $pdo->prepare("
            SELECT r.id FROM reservation r
            JOIN creneau c ON r.id_creneau = c.id
            WHERE r.id = ? AND c.id_praticien = ? AND r.statut = 'confirmee'
        ");
        $stmt->execute([$id_reservation, $user_id]);
    } else {
        // Étudiant : vérifier que la réservation lui appartient
        $stmt = $pdo->prepare("
            SELECT id FROM reservation 
            WHERE id = ? AND id_etudiant = ? AND statut = 'confirmee'
        ");
        $stmt->execute([$id_reservation, $user_id]);
    }
    
    if (!$stmt->fetch()) {
        echo json_encode(["success" => false, "error" => "Réservation introuvable ou déjà annulée"]);
        exit;
    }

    // Annuler la réservation
    $stmt = $pdo->prepare("UPDATE reservation SET statut = 'annulee' WHERE id = ?");
    $stmt->execute([$id_reservation]);

    // Remettre le créneau disponible
    $stmt = $pdo->prepare("
        UPDATE creneau c 
        JOIN reservation r ON c.id = r.id_creneau 
        SET c.statut = 'disponible' 
        WHERE r.id = ?
    ");
    $stmt->execute([$id_reservation]);

    echo json_encode(["success" => true]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>