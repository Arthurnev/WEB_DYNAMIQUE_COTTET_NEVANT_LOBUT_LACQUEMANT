<?php
header("Content-Type: application/json");
require_once "config.php";
session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id_activite = $data["id_activite"] ?? null;
$id_etudiant = $_SESSION["user_id"];

if (!$id_activite) {
    echo json_encode(["success" => false, "error" => "Activité manquante"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO panier_activite (id_etudiant, id_activite)
        VALUES (?, ?)
    ");
    $stmt->execute([$id_etudiant, $id_activite]);

    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        echo json_encode(["success" => false, "error" => "Cette activité est déjà dans ton panier"]);
    } else {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
?>