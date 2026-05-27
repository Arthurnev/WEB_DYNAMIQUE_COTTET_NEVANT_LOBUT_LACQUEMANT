<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "config.php";

$action = $_GET["action"] ?? "";

try {
    switch ($action) {

        case "update_profile":
            $data = json_decode(file_get_contents("php://input"), true);

            $id        = intval($data["id"] ?? 0);
            $prenom    = trim($data["prenom"]    ?? "");
            $nom       = trim($data["nom"]       ?? "");
            $email     = trim($data["email"]     ?? "");
            $telephone = trim($data["telephone"] ?? "");
            $adresse   = trim($data["adresse"]   ?? "");
            $campus    = trim($data["campus"]    ?? "");
            $filiere   = trim($data["filiere"]   ?? "");
            $annee     = trim($data["annee"]     ?? "");

            if (!$id || !$prenom || !$nom || !$email) {
                echo json_encode(["success" => false, "error" => "Champs obligatoires manquants"]);
                exit;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(["success" => false, "error" => "Email invalide"]);
                exit;
            }

            // Vérifie que l'email n'est pas déjà pris par un autre compte
            $stmt = $pdo->prepare("SELECT id FROM utilisateur WHERE email = ? AND id != ?");
            $stmt->execute([$email, $id]);
            if ($stmt->fetch()) {
                echo json_encode(["success" => false, "error" => "Cet email est déjà utilisé"]);
                exit;
            }

            $stmt = $pdo->prepare("
                UPDATE utilisateur
                SET prenom = ?, nom = ?, email = ?, telephone = ?,
                    adresse_pro = ?, campus = ?, filiere = ?, annee = ?
                WHERE id = ?
            ");
            $stmt->execute([$prenom, $nom, $email, $telephone, $adresse, $campus, $filiere, $annee, $id]);

            echo json_encode(["success" => true, "message" => "Profil mis à jour"]);
            break;

        case "change_password":
            $data = json_decode(file_get_contents("php://input"), true);

            $id      = intval($data["id"] ?? 0);
            $actuel  = $data["mot_de_passe_actuel"]   ?? "";
            $nouveau = $data["nouveau_mot_de_passe"]  ?? "";

            if (!$id || !$actuel || !$nouveau) {
                echo json_encode(["success" => false, "error" => "Champs manquants"]);
                exit;
            }

            if (strlen($nouveau) < 6) {
                echo json_encode(["success" => false, "error" => "Mot de passe trop court"]);
                exit;
            }

            $stmt = $pdo->prepare("SELECT mot_de_passe FROM utilisateur WHERE id = ?");
            $stmt->execute([$id]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($actuel, $user["mot_de_passe"])) {
                echo json_encode(["success" => false, "error" => "Mot de passe actuel incorrect"]);
                exit;
            }

            $hash = password_hash($nouveau, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("UPDATE utilisateur SET mot_de_passe = ? WHERE id = ?");
            $stmt->execute([$hash, $id]);

            echo json_encode(["success" => true, "message" => "Mot de passe modifié"]);
            break;

        default:
            echo json_encode(["success" => false, "error" => "Action inconnue"]);
            break;
    }

} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => "Erreur serveur : " . $e->getMessage()]);
}
?>