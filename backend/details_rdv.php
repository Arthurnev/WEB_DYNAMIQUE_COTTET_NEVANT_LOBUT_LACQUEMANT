<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'praticien') {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit();
}

$reservation_id = $_GET['id'] ?? 0;

if (!$reservation_id) {
    echo json_encode(["success" => false, "error" => "ID réservation manquant"]);
    exit();
}

try {
    // Détails du rendez-vous
    $stmt = $pdo->prepare("
        SELECT 
            r.id,
            r.statut,
            c.date,
            c.heure_debut,
            c.heure_fin,
            s.nom as service_nom,
            s.duree_min,
            u.id as patient_id,
            u.nom as patient_nom,
            u.prenom as patient_prenom,
            u.email,
            u.telephone
        FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        JOIN service s ON c.id_service = s.id
        JOIN utilisateur u ON r.id_etudiant = u.id
        WHERE r.id = ? AND c.id_praticien = ?
    ");
    $stmt->execute([$reservation_id, $_SESSION['user_id']]);
    $rdv = $stmt->fetch();
    
    if (!$rdv) {
        echo json_encode(["success" => false, "error" => "Rendez-vous non trouvé"]);
        exit();
    }
    
    $rdv['patient_nom'] = $rdv['patient_prenom'] . ' ' . $rdv['patient_nom'];
    
    // Historique des consultations du patient
    $stmt = $pdo->prepare("
        SELECT c.date, s.nom as service_nom
        FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        JOIN service s ON c.id_service = s.id
        WHERE r.id_etudiant = ? AND r.id != ? AND (r.statut = 'terminee' OR r.statut = 'confirmee')
        ORDER BY c.date DESC
        LIMIT 5
    ");
    $stmt->execute([$rdv['patient_id'], $reservation_id]);
    $historique = $stmt->fetchAll();
    
    // Note existante
    $stmt = $pdo->prepare("SELECT * FROM consultation_commentaires WHERE reservation_id = ?");
    $stmt->execute([$reservation_id]);
    $note = $stmt->fetch();
    
    echo json_encode([
        "success" => true,
        "rdv" => $rdv,
        "historique" => $historique,
        "note" => $note
    ]);
    
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>