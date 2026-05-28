<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'praticien') {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit();
}

$activite_id = $_GET['id'] ?? 0;

if (!$activite_id) {
    echo json_encode(["success" => false, "error" => "ID activité manquant"]);
    exit();
}

try {
    // Détails de l'activité
    $stmt = $pdo->prepare("SELECT * FROM activite WHERE id = ? AND id_praticien = ?");
    $stmt->execute([$activite_id, $_SESSION['user_id']]);
    $activite = $stmt->fetch();
    
    if (!$activite) {
        echo json_encode(["success" => false, "error" => "Activité non trouvée"]);
        exit();
    }
    
    // Liste des inscrits
    $stmt = $pdo->prepare("
        SELECT u.id, u.nom, u.prenom, u.email
        FROM inscription i
        JOIN utilisateur u ON i.id_etudiant = u.id
        WHERE i.id_activite = ?
        ORDER BY i.date_inscription ASC
    ");
    $stmt->execute([$activite_id]);
    $inscrits = $stmt->fetchAll();
    
    echo json_encode([
        "success" => true,
        "activite" => $activite,
        "inscrits" => $inscrits
    ]);
    
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>