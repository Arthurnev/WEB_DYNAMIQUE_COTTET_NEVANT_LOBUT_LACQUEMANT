<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'praticien') {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit();
}

$praticien_id = $_SESSION['user_id'];

try {
    $stmt = $pdo->prepare("
        SELECT DISTINCT 
            u.id, u.nom, u.prenom, u.email, u.telephone,
            COUNT(r.id) as nb_consultations,
            MAX(c.date) as derniere_visite
        FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        JOIN utilisateur u ON r.id_etudiant = u.id
        WHERE c.id_praticien = ?
        GROUP BY u.id
        ORDER BY derniere_visite DESC
    ");
    $stmt->execute([$praticien_id]);
    $patients = $stmt->fetchAll();
    
    echo json_encode(["success" => true, "patients" => $patients]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>