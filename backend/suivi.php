<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

require_once "config.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "error" => "Non connecté"
    ]);
    exit;
}

$id_etudiant = $_SESSION["user_id"];

try {

    // =====================================
    // PROCHAINS RENDEZ-VOUS
    // =====================================

    $stmt = $pdo->prepare("
        SELECT
            r.id,
            r.statut,
            r.date_reservation,

            c.date AS date_creneau,
            c.heure_debut,
            c.heure_fin,

            s.nom AS service_nom,
            s.categorie,

            u.prenom AS praticien_prenom,
            u.nom AS praticien_nom,
            u.specialite

        FROM reservation r

        JOIN creneau c
            ON r.id_creneau = c.id

        JOIN service s
            ON c.id_service = s.id

        JOIN utilisateur u
            ON s.id_praticien = u.id

        WHERE r.id_etudiant = ?
        AND r.statut IN ('confirmee', 'en_attente')

        ORDER BY c.date ASC, c.heure_debut ASC
    ");

    $stmt->execute([$id_etudiant]);
    $prochains = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // =====================================
    // RENDEZ-VOUS PASSES
    // =====================================

    $stmt = $pdo->prepare("
        SELECT
            r.id,
            r.statut,
            r.date_reservation,

            c.date AS date_creneau,
            c.heure_debut,
            c.heure_fin,

            s.nom AS service_nom,
            s.categorie,

            u.prenom AS praticien_prenom,
            u.nom AS praticien_nom,
            u.specialite

        FROM reservation r

        JOIN creneau c
            ON r.id_creneau = c.id

        JOIN service s
            ON c.id_service = s.id

        JOIN utilisateur u
            ON s.id_praticien = u.id

        WHERE r.id_etudiant = ?
        AND r.statut IN ('terminee', 'annulee')

        ORDER BY c.date DESC, c.heure_debut DESC
    ");

    $stmt->execute([$id_etudiant]);
    $passes = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // =====================================
    // ACTIVITES INSCRITES
    // =====================================

    $stmt = $pdo->prepare("
        SELECT
            ia.id,

            a.id AS activite_id,
            a.nom AS activite_nom,
            a.description,
            a.date_heure,
            a.lieu,

            u.prenom AS praticien_prenom,
            u.nom AS praticien_nom

        FROM inscription_activite ia

        JOIN activite a
            ON ia.id_activite = a.id

        JOIN utilisateur u
            ON a.id_praticien = u.id

        WHERE ia.id_etudiant = ?

        ORDER BY a.date_heure ASC
    ");

    $stmt->execute([$id_etudiant]);
    $activites = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // =====================================
    // HISTORIQUE
    // =====================================

    $historique = [];

    foreach ($prochains as $rdv) {

        $historique[] = [
            "titre" => "Consultation",
            "detail" =>
                $rdv["service_nom"] .
                " avec " .
                $rdv["praticien_prenom"] .
                " " .
                $rdv["praticien_nom"],

            "date" =>
                $rdv["date_creneau"] .
                " " .
                $rdv["heure_debut"]
        ];
    }

    foreach ($passes as $rdv) {

        $historique[] = [
            "titre" => "Consultation terminée",
            "detail" =>
                $rdv["service_nom"] .
                " avec " .
                $rdv["praticien_prenom"] .
                " " .
                $rdv["praticien_nom"],

            "date" =>
                $rdv["date_creneau"] .
                " " .
                $rdv["heure_debut"]
        ];
    }

    foreach ($activites as $act) {

        $historique[] = [
            "titre" => "Activité",
            "detail" => $act["activite_nom"],
            "date" => $act["date_heure"]
        ];
    }

    usort($historique, function ($a, $b) {
        return strtotime($b["date"]) - strtotime($a["date"]);
    });

    // =====================================
    // INTERVENANTS CONSULTES
    // =====================================

    $stmt = $pdo->prepare("
        SELECT
            u.id,
            u.prenom,
            u.nom,
            u.specialite,

            COUNT(r.id) AS nb_visites

        FROM reservation r

        JOIN creneau c
            ON r.id_creneau = c.id

        JOIN service s
            ON c.id_service = s.id

        JOIN utilisateur u
            ON s.id_praticien = u.id

        WHERE r.id_etudiant = ?
        AND r.statut != 'annulee'

        GROUP BY u.id

        ORDER BY nb_visites DESC
    ");

    $stmt->execute([$id_etudiant]);
    $intervenants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "prochains" => $prochains,
        "passes" => $passes,
        "activites" => $activites,
        "historique" => $historique,
        "intervenants" => $intervenants
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>