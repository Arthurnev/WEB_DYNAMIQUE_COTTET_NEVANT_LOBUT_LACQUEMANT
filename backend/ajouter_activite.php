<?php
header("Content-Type: application/json");

require_once 'config.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["success" => false, "error" => "Non connecté"]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$stmt = $pdo->prepare("INSERT INTO activite (nom, description, date_heure, capacite_max, lieu, id_praticien) VALUES (?, ?, ?, ?, ?, ?)");

if ($stmt->execute([$data['nom'], $data['description'], $data['date_heure'], $data['capacite_max'], $data['lieu'], $_SESSION['user_id']])) {
    echo json_encode(["success" => true, "id" => $pdo->lastInsertId()]);
} else {
    echo json_encode(["success" => false, "error" => "Erreur insertion"]);
}
?>
