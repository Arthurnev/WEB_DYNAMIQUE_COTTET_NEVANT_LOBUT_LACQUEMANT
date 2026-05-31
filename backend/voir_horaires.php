<?php
header("Content-Type: application/json");
require_once "config.php";

$id_service = intval($_GET["id_service"] ?? 0);

if (!$id_service) {
    echo json_encode(["success" => false, "error" => "Service manquant"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT 
            s.id,
            s.nom,
            s.description,
            s.prix,
            s.duree_min,
            s.id_praticien,
            u.nom AS praticien_nom,
            u.prenom AS praticien_prenom
        FROM service s
        JOIN utilisateur u ON s.id_praticien = u.id
        WHERE s.id = ?
    ");
    $stmt->execute([$id_service]);
    $service = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$service) {
        echo json_encode(["success" => false, "error" => "Service introuvable"]);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT id, date, heure_debut, heure_fin
        FROM creneau
        WHERE id_service = ?
        AND statut = 'disponible'
        AND date >= CURDATE()
        ORDER BY date, heure_debut
    ");
    $stmt->execute([$id_service]);
    $plages = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $pdo->prepare("
        SELECT 
            id_creneau,
            heure_debut_reservation,
            heure_fin_reservation
        FROM reservation
        WHERE statut IN ('en_attente', 'confirmee')
    ");
    $stmt->execute();
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $horairesPris = [];

    foreach ($reservations as $reservation) {
        $cle = $reservation["id_creneau"] . "_" .
               substr($reservation["heure_debut_reservation"], 0, 5) . "_" .
               substr($reservation["heure_fin_reservation"], 0, 5);

        $horairesPris[$cle] = true;
    }

    $dureeSecondes = intval($service["duree_min"]) * 60;
    $creneauxDecoupes = [];

    foreach ($plages as $plage) {
        $debut = strtotime($plage["date"] . " " . $plage["heure_debut"]);
        $fin = strtotime($plage["date"] . " " . $plage["heure_fin"]);

        while (($debut + $dureeSecondes) <= $fin) {
            $heureDebut = date("H:i", $debut);
            $heureFin = date("H:i", $debut + $dureeSecondes);

            $cle = $plage["id"] . "_" . $heureDebut . "_" . $heureFin;

            if (!isset($horairesPris[$cle])) {
                $creneauxDecoupes[] = [
                    "id_creneau" => $plage["id"],
                    "date" => $plage["date"],
                    "heure_debut" => $heureDebut,
                    "heure_fin" => $heureFin
                ];
            }

            $debut += $dureeSecondes;
        }
    }

    echo json_encode([
        "success" => true,
        "service" => $service,
        "creneaux" => $creneauxDecoupes
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>