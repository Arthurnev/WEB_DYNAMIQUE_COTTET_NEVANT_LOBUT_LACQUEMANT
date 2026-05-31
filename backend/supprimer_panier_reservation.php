<?php
header("Content-Type: application/json");
require_once "config.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit;
}

$id_etudiant = $_SESSION["user_id"];
$data = json_decode(file_get_contents("php://input"), true);
$id_reservation = intval($data["id_reservation"] ?? 0);

if (!$id_reservation) {
    echo json_encode(["success" => false, "error" => "Réservation manquante"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        DELETE r
        FROM reservation r
        JOIN panier p ON r.id_panier = p.id
        WHERE r.id = ?
        AND r.id_etudiant = ?
        AND r.statut = 'en_attente'
        AND p.statut = 'en_cours'
    ");

    $stmt->execute([$id_reservation, $id_etudiant]);

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>