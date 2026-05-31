<?php
header("Content-Type: application/json");
require_once "config.php";
session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit;
}

$id_activite = $_GET["id_activite"] ?? null;

if (!$id_activite) {
    echo json_encode(["success" => false, "error" => "Activité manquante"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT u.id, u.nom, u.prenom, u.email, u.telephone, ia.date_inscription
        FROM inscription_activite ia
        JOIN utilisateur u ON ia.id_etudiant = u.id
        WHERE ia.id_activite = ?
        ORDER BY ia.date_inscription DESC
    ");
    $stmt->execute([$id_activite]);

    echo json_encode([
        "success" => true,
        "inscrits" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>