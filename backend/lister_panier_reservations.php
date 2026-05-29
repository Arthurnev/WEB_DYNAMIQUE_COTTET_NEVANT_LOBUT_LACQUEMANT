<?php
header("Content-Type: application/json");
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
    $stmt = $pdo->prepare("
        SELECT 
            r.id AS reservation_id,
            r.statut,
            c.date,
            c.heure_debut,
            c.heure_fin,
            s.nom AS service_nom,
            s.prix,
            u.nom AS praticien_nom,
            u.prenom AS praticien_prenom
        FROM reservation r
        JOIN creneau c ON r.id_creneau = c.id
        JOIN service s ON c.id_service = s.id
        JOIN utilisateur u ON s.id_praticien = u.id
        JOIN panier p ON r.id_panier = p.id
        WHERE r.id_etudiant = ?
        AND r.statut = 'en_attente'
        AND p.statut = 'en_cours'
        ORDER BY c.date, c.heure_debut
    ");

    $stmt->execute([$id_etudiant]);

    echo json_encode([
        "success" => true,
        "reservations" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>