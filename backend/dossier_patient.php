<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'praticien') {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit();
}

$praticien_id = $_SESSION['user_id'];
$patient_id = $_GET['id'] ?? 0;

if (!$patient_id) {
    echo json_encode(["success" => false, "error" => "ID patient manquant"]);
    exit();
}

try {
    $stmt = $pdo->prepare("SELECT * FROM utilisateur WHERE id = ? AND role = 'etudiant'");
    $stmt->execute([$patient_id]);
    $patient = $stmt->fetch();

    if (!$patient) {
        echo json_encode(["success" => false, "error" => "Patient non trouvé"]);
        exit();
    }

    $stmt = $pdo->prepare("
        SELECT r.id, r.statut, c.date, c.heure_debut, c.heure_fin, s.nom AS service_nom
        FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        JOIN service s ON c.id_service = s.id
        WHERE r.id_etudiant = ? 
        AND c.id_praticien = ?
        ORDER BY c.date DESC
    ");
    $stmt->execute([$patient_id, $praticien_id]);
    $consultations = $stmt->fetchAll();

    $stmt = $pdo->prepare("
        SELECT ia.id, a.nom AS activite_nom, a.date_heure, a.lieu
        FROM inscription_activite ia
        JOIN activite a ON ia.id_activite = a.id
        WHERE ia.id_etudiant = ? 
        AND a.id_praticien = ?
        AND r.statut != 'annulee'
        ORDER BY a.date_heure DESC
    ");
    $stmt->execute([$patient_id, $praticien_id]);
    $activites = $stmt->fetchAll();

    $stmt = $pdo->prepare("
        SELECT cc.*, c.date AS date_consultation
        FROM consultation_commentaires cc
        JOIN reservation r ON cc.reservation_id = r.id
        JOIN creneau c ON r.id_creneau = c.id
        WHERE r.id_etudiant = ? 
        AND cc.praticien_id = ?
        ORDER BY cc.reservation_id DESC
    ");
    $stmt->execute([$patient_id, $praticien_id]);
    $commentaires = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "patient" => $patient,
        "consultations" => $consultations,
        "activites" => $activites,
        "commentaires" => $commentaires
    ]);

} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>