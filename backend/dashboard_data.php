<?php
header("Content-Type: application/json");
require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'praticien') {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit();
}

$praticien_id = $_SESSION['user_id'];
$response = [];

try {
    // 1. Agenda de la semaine (regroupé par jour)
    $stmt = $pdo->prepare("
        SELECT DAYOFWEEK(c.date) as jour, TIME(c.heure_debut) as heure, CONCAT(u.prenom, ' ', u.nom) as patient
        FROM creneau c
        JOIN reservation r ON c.id = r.id_creneau
        JOIN utilisateur u ON r.id_etudiant = u.id
        WHERE c.id_praticien = ? AND c.statut = 'reserve' AND YEARWEEK(c.date) = YEARWEEK(CURDATE())
        ORDER BY c.date ASC, c.heure_debut ASC
    ");
    $stmt->execute([$praticien_id]);
    $rdv = $stmt->fetchAll();
    
    $agenda = [];
    $jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    for ($i = 1; $i <= 7; $i++) {
        $agenda[$i] = ['jour' => $jours[$i-1], 'evenements' => []];
    }
    foreach ($rdv as $r) {
        $agenda[$r['jour']]['evenements'][] = [
            'heure' => substr($r['heure'], 0, 5),
            'patient' => $r['patient']
        ];
    }
    $response['agenda_semaine'] = array_values($agenda);
    
    // 2. Réservations du jour
    $stmt = $pdo->prepare("
        SELECT TIME(c.heure_debut) as heure, CONCAT(u.prenom, ' ', u.nom) as patient, s.nom as service, r.statut, r.id
        FROM creneau c
        JOIN reservation r ON c.id = r.id_creneau
        JOIN utilisateur u ON r.id_etudiant = u.id
        JOIN service s ON c.id_service = s.id
        WHERE c.id_praticien = ? AND c.date = CURDATE() AND c.statut = 'reserve'
        ORDER BY c.heure_debut ASC
    ");
    $stmt->execute([$praticien_id]);
    $reservations = $stmt->fetchAll();
    foreach ($reservations as &$r) {
        $r['heure'] = substr($r['heure'], 0, 5);
    }
    $response['reservations_jour'] = $reservations;
    
    // 3. Disponibilités à venir
    $stmt = $pdo->prepare("
        SELECT date, heure_debut, heure_fin
        FROM creneau
        WHERE id_praticien = ? AND statut = 'disponible' AND date >= CURDATE()
        ORDER BY date ASC, heure_debut ASC
        LIMIT 3
    ");
    $stmt->execute([$praticien_id]);
    $response['disponibilites_prochaines'] = $stmt->fetchAll();
    
    // 4. Patients récents
    $stmt = $pdo->prepare("
        SELECT DISTINCT u.id, u.nom, u.prenom, COUNT(r.id) as nb_consultations
        FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        JOIN utilisateur u ON r.id_etudiant = u.id
        WHERE c.id_praticien = ?
        GROUP BY u.id
        ORDER BY MAX(c.date) DESC
        LIMIT 4
    ");
    $stmt->execute([$praticien_id]);
    $response['patients_recents'] = $stmt->fetchAll();
    
    // 5. Activités récentes
    $stmt = $pdo->prepare("
        SELECT a.id, a.nom, a.date_heure, a.capacite_max,
        (SELECT COUNT(*) FROM inscription i WHERE i.id_activite = a.id) as inscrits
        FROM activite a
        WHERE a.id_praticien = ?
        ORDER BY a.date_heure ASC
        LIMIT 2
    ");
    $stmt->execute([$praticien_id]);
    $response['activites_recentes'] = $stmt->fetchAll();
    
    // 6. Stats
    $response['rdv_aujourdhui'] = count($reservations);
    
    $stmt = $pdo->prepare("
        SELECT COUNT(*) as total FROM creneau c
        JOIN reservation r ON c.id = r.id_creneau
        WHERE c.id_praticien = ? AND YEARWEEK(c.date) = YEARWEEK(CURDATE()) AND c.statut = 'reserve'
    ");
    $stmt->execute([$praticien_id]);
    $response['rdv_semaine'] = $stmt->fetch()['total'] ?? 0;
    
    $stmt = $pdo->prepare("
        SELECT COUNT(DISTINCT r.id_etudiant) as total FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        WHERE c.id_praticien = ?
    ");
    $stmt->execute([$praticien_id]);
    $response['total_patients'] = $stmt->fetch()['total'] ?? 0;
    
    $stmt = $pdo->prepare("SELECT COUNT(*) as total FROM activite WHERE id_praticien = ?");
    $stmt->execute([$praticien_id]);
    $response['total_activites'] = $stmt->fetch()['total'] ?? 0;
    
    echo json_encode(["success" => true, "data" => $response]);
    
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>