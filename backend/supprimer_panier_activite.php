<?php
header("Content-Type: application/json");
require_once "config.php";

session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$id_etudiant = $_SESSION["user_id"];
$id_activite = intval($data["id_activite"] ?? 0);

if (!$id_activite) {
    echo json_encode(["success" => false, "error" => "Activité manquante"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        DELETE FROM panier_activite
        WHERE id_etudiant = ?
        AND id_activite = ?
    ");

    $stmt->execute([$id_etudiant, $id_activite]);

    echo json_encode(["success" => true]);

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>