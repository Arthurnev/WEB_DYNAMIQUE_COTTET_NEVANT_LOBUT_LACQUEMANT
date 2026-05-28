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
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        SELECT id_activite
        FROM panier_activite
        WHERE id_etudiant = ?
    ");
    $stmt->execute([$id_etudiant]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($items as $item) {
        $insert = $pdo->prepare("
            INSERT IGNORE INTO inscription_activite (id_activite, id_etudiant)
            VALUES (?, ?)
        ");
        $insert->execute([$item["id_activite"], $id_etudiant]);
    }

    $delete = $pdo->prepare("DELETE FROM panier_activite WHERE id_etudiant = ?");
    $delete->execute([$id_etudiant]);

    $pdo->commit();

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>