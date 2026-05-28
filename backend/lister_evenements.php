<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'praticien') {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit();
}

$praticien_id = $_SESSION['user_id'];
$events = [];

// 1. Rendez-vous avec nom du patient (renvoyer l'ID de réservation)
$sql = "SELECT 
            r.id as reservation_id,
            c.id as creneau_id,
            c.date, 
            c.heure_debut, 
            c.heure_fin, 
            'reservation' as type,
            COALESCE(s.nom, 'Rendez-vous') as titre,
            CONCAT(u.prenom, ' ', u.nom) as patient
        FROM creneau c
        JOIN reservation r ON c.id = r.id_creneau
        JOIN utilisateur u ON r.id_etudiant = u.id
        LEFT JOIN service s ON c.id_service = s.id
        WHERE c.id_praticien = :praticien_id AND c.statut = 'reserve'";
$stmt = $pdo->prepare($sql);
$stmt->execute(['praticien_id' => $praticien_id]);
$reservations = $stmt->fetchAll();

foreach ($reservations as $r) {
    $events[] = [
        'id' => $r['reservation_id'],  // ← ICI : ID de la réservation
        'date' => $r['date'],
        'heure_debut' => $r['heure_debut'],
        'heure_fin' => $r['heure_fin'],
        'type' => 'reservation',
        'titre' => $r['titre'],
        'patient' => $r['patient'] ?? 'Patient inconnu'
    ];
}

// 2. Créneaux disponibles
$sql = "SELECT id, date, heure_debut, heure_fin, 'disponible' as type, 'Disponible' as titre, 'Libre' as patient 
        FROM creneau 
        WHERE id_praticien = :praticien_id AND statut = 'disponible'";
$stmt = $pdo->prepare($sql);
$stmt->execute(['praticien_id' => $praticien_id]);
$disponibles = $stmt->fetchAll();

foreach ($disponibles as $d) {
    $events[] = [
        'id' => $d['id'],
        'date' => $d['date'],
        'heure_debut' => $d['heure_debut'],
        'heure_fin' => $d['heure_fin'],
        'type' => 'disponible',
        'titre' => 'Disponible',
        'patient' => 'Libre'
    ];
}

// 3. Activités
$sql = "SELECT id, date_heure as date, TIME(date_heure) as heure_debut, 'activite' as type, nom as titre, lieu as patient 
        FROM activite 
        WHERE id_praticien = :praticien_id";
$stmt = $pdo->prepare($sql);
$stmt->execute(['praticien_id' => $praticien_id]);
$activites = $stmt->fetchAll();

foreach ($activites as $a) {
    $date = substr($a['date'], 0, 10);
    $heure = substr($a['heure_debut'], 0, 5);
    $events[] = [
        'id' => $a['id'],
        'date' => $date,
        'heure_debut' => $heure,
        'heure_fin' => date('H:i:s', strtotime($heure) + 3600),
        'type' => 'activite',
        'titre' => $a['titre'],
        'patient' => $a['patient']
    ];
}

// Trier par date et heure
usort($events, function($a, $b) {
    if ($a['date'] != $b['date']) return strcmp($a['date'], $b['date']);
    return strcmp($a['heure_debut'], $b['heure_debut']);
});

echo json_encode(["success" => true, "evenements" => $events]);
?>