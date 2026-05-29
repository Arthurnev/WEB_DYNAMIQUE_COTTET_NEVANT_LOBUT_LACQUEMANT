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
        SELECT id
        FROM panier
        WHERE id_etudiant = ?
        AND statut = 'en_cours'
        LIMIT 1
    ");
    $stmt->execute([$id_etudiant]);
    $panier = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$panier) {
        throw new Exception("Aucun panier en cours");
    }

    $id_panier = $panier["id"];

    $stmt = $pdo->prepare("
        SELECT id
        FROM reservation
        WHERE id_panier = ?
        AND id_etudiant = ?
        AND statut = 'en_attente'
    ");
    $stmt->execute([$id_panier, $id_etudiant]);
    $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (count($reservations) === 0) {
        throw new Exception("Aucune consultation à valider");
    }

    foreach ($reservations as $reservation) {
        $stmt = $pdo->prepare("
            UPDATE reservation
            SET statut = 'confirmee'
            WHERE id = ?
        ");
        $stmt->execute([$reservation["id"]]);
    }

    $stmt = $pdo->prepare("
        UPDATE panier
        SET statut = 'valide',
            date_validation = NOW()
        WHERE id = ?
    ");
    $stmt->execute([$id_panier]);

    $pdo->commit();

    echo json_encode([
        "success" => true,
        "message" => "Panier validé"
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }

    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>