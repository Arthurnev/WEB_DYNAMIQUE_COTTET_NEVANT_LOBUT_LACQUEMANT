<?php
header("Content-Type: application/json");
require_once "config.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit;
}

$id_etudiant = $_SESSION["user_id"];

try {
    $stmt = $pdo->prepare("
        SELECT 
            a.id,
            a.nom,
            a.description,
            a.date_heure,
            a.capacite_max,
            a.lieu,

            u.nom AS praticien_nom,
            u.prenom AS praticien_prenom,

            CASE WHEN pa.id IS NOT NULL THEN 1 ELSE 0 END AS est_panier,
            CASE WHEN ia.id IS NOT NULL THEN 1 ELSE 0 END AS est_inscrit

        FROM activite a

        JOIN utilisateur u 
            ON a.id_praticien = u.id

        LEFT JOIN panier_activite pa
            ON pa.id_activite = a.id
            AND pa.id_etudiant = ?

        LEFT JOIN inscription_activite ia
            ON ia.id_activite = a.id
            AND ia.id_etudiant = ?

        ORDER BY a.date_heure ASC
    ");

    $stmt->execute([$id_etudiant, $id_etudiant]);

    echo json_encode([
        "success" => true,
        "activites" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>