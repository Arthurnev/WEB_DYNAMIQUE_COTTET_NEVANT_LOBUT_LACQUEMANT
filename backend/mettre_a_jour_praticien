<?php
header("Content-Type: application/json");
require_once "config.php";

session_start();

if (!isset($_SESSION["user_id"]) || $_SESSION["role"] !== 'praticien') {
    echo json_encode(["success" => false, "error" => "Non autorisé"]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$user_id = $_SESSION["user_id"];

$prenom = $data['prenom'] ?? '';
$nom = $data['nom'] ?? '';
$email = $data['email'] ?? '';
$telephone = $data['telephone'] ?? '';
$adresse_pro = $data['adresse_pro'] ?? '';
$specialite = $data['specialite'] ?? '';
$diplome = $data['diplome'] ?? '';
$numero_rpps = $data['numero_rpps'] ?? '';
$new_password = $data['new_password'] ?? null;

try {
    if ($new_password && strlen($new_password) >= 6) {
        $hashed = password_hash($new_password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("
            UPDATE utilisateur 
            SET prenom = ?, nom = ?, email = ?, telephone = ?, adresse_pro = ?, 
                specialite = ?, diplome = ?, numero_rpps = ?, mot_de_passe = ?
            WHERE id = ?
        ");
        $stmt->execute([$prenom, $nom, $email, $telephone, $adresse_pro, $specialite, $diplome, $numero_rpps, $hashed, $user_id]);
    } else {
        $stmt = $pdo->prepare("
            UPDATE utilisateur 
            SET prenom = ?, nom = ?, email = ?, telephone = ?, adresse_pro = ?, 
                specialite = ?, diplome = ?, numero_rpps = ?
            WHERE id = ?
        ");
        $stmt->execute([$prenom, $nom, $email, $telephone, $adresse_pro, $specialite, $diplome, $numero_rpps, $user_id]);
    }
    
    echo json_encode(["success" => true]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>