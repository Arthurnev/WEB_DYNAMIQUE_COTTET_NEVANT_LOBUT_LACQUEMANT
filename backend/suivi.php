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

try {
    // 1. Prochains rendez-vous (à venir ou confirmés)
    $stmt = $pdo->prepare("
        SELECT r.id, r.statut, r.date_reservation,
               c.date as date_creneau, c.heure_debut, c.heure_fin,
               s.nom as service_nom, s.categorie,
               u.prenom as praticien_prenom, u.nom as praticien_nom, u.specialite
        FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        JOIN service s ON c.id_service = s.id
        JOIN utilisateur u ON s.id_praticien = u.id
        WHERE r.id_etudiant = ?
          AND (r.statut = 'confirmee' OR r.statut = 'en_attente')
        ORDER BY c.date ASC, c.heure_debut ASC
    ");
    $stmt->execute([$id_etudiant]);
    $prochains = $stmt->fetchAll();

    // 2. Rendez-vous passés (terminés ou annulés)
    $stmt = $pdo->prepare("
        SELECT r.id, r.statut, r.date_reservation,
               c.date as date_creneau, c.heure_debut, c.heure_fin,
               s.nom as service_nom, s.categorie,
               u.prenom as praticien_prenom, u.nom as praticien_nom, u.specialite
        FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        JOIN service s ON c.id_service = s.id
        JOIN utilisateur u ON s.id_praticien = u.id
        WHERE r.id_etudiant = ?
          AND (r.statut = 'terminee' OR r.statut = 'annulee')
        ORDER BY c.date DESC, c.heure_debut DESC
    ");
    $stmt->execute([$id_etudiant]);
    $passes = $stmt->fetchAll();

    // 3. Activités inscrites
    $stmt = $pdo->prepare("
        SELECT i.id, i.statut, a.nom as activite_nom, a.date_heure, a.lieu,
               u.prenom as praticien_prenom, u.nom as praticien_nom
        FROM inscription i
        JOIN activite a ON i.id_activite = a.id
        JOIN utilisateur u ON a.id_praticien = u.id
        WHERE i.id_etudiant = ?
        ORDER BY a.date_heure ASC
    ");
    $stmt->execute([$id_etudiant]);
    $activites = $stmt->fetchAll();

    // 4. Historique des interactions (pour la timeline)
    $historique = [];
    // À implémenter selon ta BDD
    // Exemple : combiner réservations et inscriptions

    // 5. Intervenants consultés
    $stmt = $pdo->prepare("
        SELECT u.id, u.prenom, u.nom, u.specialite, COUNT(r.id) as nb_visites
        FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        JOIN service s ON c.id_service = s.id
        JOIN utilisateur u ON s.id_praticien = u.id
        WHERE r.id_etudiant = ?
          AND r.statut != 'annulee'
        GROUP BY u.id
        ORDER BY nb_visites DESC
    ");
    $stmt->execute([$id_etudiant]);
    $intervenants = $stmt->fetchAll();

    echo json_encode([
        "success" => true,
        "prochains" => $prochains,
        "passes" => $passes,
        "activites" => $activites,
        "historique" => $historique,
        "intervenants" => $intervenants
    ]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>