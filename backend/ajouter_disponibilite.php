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

$data = json_decode(file_get_contents("php://input"), true);

$date = $data["date"] ?? "";
$heure_debut = $data["heure_debut"] ?? "";
$heure_fin = $data["heure_fin"] ?? "";

$id_praticien = $_SESSION["user_id"];

if (empty($date) || empty($heure_debut) || empty($heure_fin)) {
    echo json_encode([
        "success" => false,
        "error" => "Champs obligatoires manquants"
    ]);
    exit;
}

if ($heure_debut >= $heure_fin) {
    echo json_encode([
        "success" => false,
        "error" => "L'heure de début doit être avant l'heure de fin"
    ]);
    exit;
}

try {
    // Vérifie s'il existe déjà un créneau qui chevauche celui demandé
    $stmtCheck = $pdo->prepare("
        SELECT id
        FROM creneau
        WHERE id_praticien = ?
        AND date = ?
        AND statut != 'annule'
        AND (
            heure_debut < ?
            AND heure_fin > ?
        )
        LIMIT 1
    ");

    $stmtCheck->execute([
        $id_praticien,
        $date,
        $heure_fin,
        $heure_debut
    ]);

    if ($stmtCheck->fetch()) {
        echo json_encode([
            "success" => false,
            "error" => "Impossible d'ajouter cette disponibilité : elle chevauche déjà un créneau existant."
        ]);
        exit;
    }

    $stmtService = $pdo->prepare("
        SELECT id
        FROM service
        WHERE id_praticien = ?
        LIMIT 1
    ");

    $stmtService->execute([$id_praticien]);
    $service = $stmtService->fetch();

    if (!$service) {
        echo json_encode([
            "success" => false,
            "error" => "Aucun service trouvé pour ce praticien"
        ]);
        exit;
    }

    $id_service = $service["id"];

    $stmt = $pdo->prepare("
        INSERT INTO creneau
        (date, heure_debut, heure_fin, statut, id_praticien, id_service)
        VALUES (?, ?, ?, 'disponible', ?, ?)
    ");

    $stmt->execute([
        $date,
        $heure_debut,
        $heure_fin,
        $id_praticien,
        $id_service
    ]);

    echo json_encode([
        "success" => true,
        "id" => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>