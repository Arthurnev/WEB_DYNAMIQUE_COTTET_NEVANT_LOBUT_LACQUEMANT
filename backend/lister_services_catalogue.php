<?php
header("Content-Type: application/json");
require_once "config.php";

try {
    $stmt = $pdo->prepare("
        SELECT DISTINCT
            s.id,
            s.nom,
            s.description,
            s.duree_min,
            s.prix,
            s.categorie,
            u.id AS id_praticien,
            u.nom AS praticien_nom,
            u.prenom AS praticien_prenom,
            u.specialite,
            u.adresse_pro
        FROM service s
        JOIN utilisateur u ON s.id_praticien = u.id
        JOIN creneau c ON c.id_service = s.id
        WHERE u.role = 'praticien'
        AND c.statut = 'disponible'
        ORDER BY s.id DESC
    ");

    $stmt->execute();

    echo json_encode([
        "success" => true,
        "services" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>