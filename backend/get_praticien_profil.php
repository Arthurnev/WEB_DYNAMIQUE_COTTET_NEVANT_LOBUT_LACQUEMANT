<?php
header("Content-Type: application/json");
require_once "config.php";

session_start();

if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== 'praticien') {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit;
}

$user_id = $_SESSION["user_id"];

$stmt = $pdo->prepare("SELECT id, prenom, nom, email, telephone, adresse_pro, specialite, diplome, numero_rpps FROM utilisateur WHERE id = ?");
$stmt->execute([$user_id]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user) {
    echo json_encode(["success" => true, "profil" => $user]);
} else {
    echo json_encode(["success" => false, "error" => "Utilisateur non trouvé"]);
}
?>