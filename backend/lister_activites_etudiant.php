<?php
header("Content-Type: application/json");
require_once "config.php";

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
            u.prenom AS praticien_prenom
        FROM activite a
        JOIN utilisateur u ON a.id_praticien = u.id
        WHERE a.date_heure >= NOW()
        ORDER BY a.date_heure ASC
    ");

    $stmt->execute();
    $activites = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "activites" => $activites
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>