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

    if (count($items) === 0) {
        throw new Exception("Aucune activité à valider");
    }

    foreach ($items as $item) {
        $stmt = $pdo->prepare("
            INSERT IGNORE INTO inscription_activite
            (id_etudiant, id_activite)
            VALUES (?, ?)
        ");
        $stmt->execute([$id_etudiant, $item["id_activite"]]);
    }

    $stmt = $pdo->prepare("
        DELETE FROM panier_activite
        WHERE id_etudiant = ?
    ");
    $stmt->execute([$id_etudiant]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Activités validées"
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
?>