<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
require_once "config.php";

session_start();
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit;
}

$id_etudiant = $_SESSION["user_id"];
$data = json_decode(file_get_contents("php://input"), true);
$id_reservation = $data["id"] ?? 0;

try {
    // Vérifier que la réservation appartient bien à l'étudiant
    $stmt = $pdo->prepare("
        SELECT id FROM reservation 
        WHERE id = ? AND id_etudiant = ? AND statut = 'confirmee'
    ");
    $stmt->execute([$id_reservation, $id_etudiant]);
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