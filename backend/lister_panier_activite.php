<?php
header("Content-Type: application/json");
require_once "config.php";
session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit;
}

$id_etudiant = $_SESSION["user_id"];

$stmt = $pdo->prepare("
    SELECT pa.id, a.id AS id_activite, a.nom, a.description, a.date_heure, a.lieu
    FROM panier_activite pa
    JOIN activite a ON pa.id_activite = a.id
    WHERE pa.id_etudiant = ?
    ORDER BY pa.date_ajout DESC
");

$stmt->execute([$id_etudiant]);

echo json_encode([
    "success" => true,
    "panier" => $stmt->fetchAll(PDO::FETCH_ASSOC)
]);
?>