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

$id_activite = $data["id_activite"] ?? null;
$id_etudiant = $_SESSION["user_id"];

if (!$id_activite) {
    echo json_encode([
        "success" => false,
        "error" => "Activité manquante"
    ]);
    exit;
}

try {

    // Vérifier si déjà inscrit
    $check = $pdo->prepare("
        SELECT id
        FROM inscription
        WHERE id_activite = ?
        AND id_etudiant = ?
    ");

    $check->execute([$id_activite, $id_etudiant]);

    if ($check->fetch()) {

        echo json_encode([
            "success" => false,
            "error" => "Déjà inscrit à cette activité"
        ]);

        exit;
    }

    // Ajouter inscription
    $stmt = $pdo->prepare("
        INSERT INTO inscription
        (date_inscription, statut, id_etudiant, id_activite)
        VALUES
        (NOW(), 'confirmé', ?, ?)
    ");

    $stmt->execute([
        $id_etudiant,
        $id_activite
    ]);

    echo json_encode([
        "success" => true
    ]);

} catch (Exception $e) {

    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);

}
?>