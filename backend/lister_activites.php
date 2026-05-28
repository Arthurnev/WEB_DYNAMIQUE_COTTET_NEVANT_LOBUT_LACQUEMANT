<?php
header("Content-Type: application/json");
require_once "config.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit;
}

$id_praticien = $_SESSION["user_id"];

try {
    $stmt = $pdo->prepare("
        SELECT 
            a.*,
            COUNT(ia.id) AS inscrits
        FROM activite a
        LEFT JOIN inscription_activite ia 
            ON ia.id_activite = a.id
        WHERE a.id_praticien = ?
        GROUP BY a.id
        ORDER BY a.date_heure ASC
    ");

    $stmt->execute([$id_praticien]);

    echo json_encode([
        "success" => true,
        "activites" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);

} catch (PDOException $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>