<?php
header("Content-Type: application/json");
require_once "config.php";

session_start();

if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== "praticien") {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit;
}

$id_praticien = $_SESSION["user_id"];

try {
    $today = date("Y-m-d");

    $stmt = $pdo->prepare("
        SELECT 
            r.id,
            r.statut,
            c.date,
            COALESCE(r.heure_debut_reservation, c.heure_debut) AS heure_debut,
            COALESCE(r.heure_fin_reservation, c.heure_fin) AS heure_fin,
            s.nom AS service_nom,
            u.id AS patient_id,
            u.nom AS patient_nom,
            u.prenom AS patient_prenom
        FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        JOIN service s ON c.id_service = s.id
        JOIN utilisateur u ON r.id_etudiant = u.id
        WHERE c.id_praticien = ?
        AND r.statut != 'annulee'
        AND c.date >= ?
        ORDER BY c.date ASC, heure_debut ASC
        LIMIT 10
    ");
    $stmt->execute([$id_praticien, $today]);
    $agenda = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("
        SELECT 
            r.id,
            r.statut,
            c.date,
            COALESCE(r.heure_debut_reservation, c.heure_debut) AS heure_debut,
            COALESCE(r.heure_fin_reservation, c.heure_fin) AS heure_fin,
            s.nom AS service_nom,
            u.id AS patient_id,
            u.nom AS patient_nom,
            u.prenom AS patient_prenom
        FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        JOIN service s ON c.id_service = s.id
        JOIN utilisateur u ON r.id_etudiant = u.id
        WHERE c.id_praticien = ?
        AND r.statut != 'annulee'
        AND c.date = ?
        ORDER BY heure_debut ASC
    ");
    $stmt->execute([$id_praticien, $today]);
    $reservations_jour = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("
        SELECT 
            c.id,
            c.date,
            c.heure_debut,
            c.heure_fin,
            c.statut
        FROM creneau c
        WHERE c.id_praticien = ?
        AND c.statut = 'disponible'
        AND c.date >= ?
        ORDER BY c.date ASC, c.heure_debut ASC
        LIMIT 5
    ");
    $stmt->execute([$id_praticien, $today]);
    $disponibilites = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("
        SELECT 
            u.id,
            u.nom,
            u.prenom,
            MAX(c.date) AS derniere_visite,
            COUNT(r.id) AS nb_consultations
        FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        JOIN utilisateur u ON r.id_etudiant = u.id
        WHERE c.id_praticien = ?
        AND r.statut != 'annulee'
        GROUP BY u.id, u.nom, u.prenom
        ORDER BY derniere_visite DESC
        LIMIT 4
    ");
    $stmt->execute([$id_praticien]);
    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("
        SELECT 
            a.id,
            a.nom,
            a.date_heure,
            a.capacite_max,
            COUNT(ia.id) AS nb_inscrits
        FROM activite a
        LEFT JOIN inscription_activite ia ON ia.id_activite = a.id
        WHERE a.id_praticien = ?
        GROUP BY a.id, a.nom, a.date_heure, a.capacite_max
        ORDER BY a.date_heure ASC
        LIMIT 4
    ");
    $stmt->execute([$id_praticien]);
    $activites = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "agenda" => $agenda,
        "reservations_jour" => $reservations_jour,
        "disponibilites" => $disponibilites,
        "patients" => $patients,
        "activites" => $activites
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>