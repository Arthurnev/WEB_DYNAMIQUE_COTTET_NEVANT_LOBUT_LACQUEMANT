<?php
header("Content-Type: application/json");
require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);

$id_etudiant = intval($data["id_etudiant"] ?? 0);
$id_creneau = intval($data["id_creneau"] ?? 0);
$date = $data["date"] ?? "";
$heure_debut = $data["heure_debut"] ?? "";
$heure_fin = $data["heure_fin"] ?? "";

if (!$id_etudiant || !$id_creneau || !$date || !$heure_debut || !$heure_fin) {
    echo json_encode(["success" => false, "error" => "Données manquantes"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT *
        FROM creneau
        WHERE id = ?
        AND statut = 'disponible'
    ");
    $stmt->execute([$id_creneau]);
    $plage = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$plage) {
        echo json_encode(["success" => false, "error" => "Cette plage n'est plus disponible"]);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT id
        FROM reservation
        WHERE id_creneau = ?
        AND date(heure_debut_reservation) IS NOT NULL
        AND statut IN ('en_attente', 'confirmee')
        AND heure_debut_reservation = ?
        AND heure_fin_reservation = ?
        LIMIT 1
    ");
    $stmt->execute([$id_creneau, $heure_debut, $heure_fin]);

    if ($stmt->fetch()) {
        echo json_encode(["success" => false, "error" => "Cet horaire est déjà pris"]);
        exit;
    }

    $stmt = $pdo->prepare("
        SELECT id
        FROM panier
        WHERE id_etudiant = ?
        AND statut = 'en_cours'
        LIMIT 1
    ");
    $stmt->execute([$id_etudiant]);
    $panier = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($panier) {
        $id_panier = $panier["id"];
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO panier (statut, total, id_etudiant)
            VALUES ('en_cours', 0, ?)
        ");
        $stmt->execute([$id_etudiant]);
        $id_panier = $pdo->lastInsertId();
    }

    $stmt = $pdo->prepare("
        INSERT INTO reservation
        (
            date_reservation,
            statut,
            id_etudiant,
            id_creneau,
            id_panier,
            heure_debut_reservation,
            heure_fin_reservation
        )
        VALUES (NOW(), 'en_attente', ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $id_etudiant,
        $id_creneau,
        $id_panier,
        $heure_debut,
        $heure_fin
    ]);

    echo json_encode([
        "success" => true,
        "message" => "Réservation ajoutée au panier"
    ]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>