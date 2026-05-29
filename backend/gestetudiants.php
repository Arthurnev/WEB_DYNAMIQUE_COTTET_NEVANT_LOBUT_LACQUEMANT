<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "config.php";

$action = $_GET["action"] ?? "";

try {
    switch ($action) {
        case 'list':
            // On ne sélectionne que les colonnes utiles (pas campus, filiere, annee)
            $sql = "SELECT id, nom, prenom, email FROM utilisateur WHERE role = 'etudiant' ORDER BY nom ASC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $etudiants = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $etudiants]);
            break;

        case 'delete':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $input["id"] ?? 0;
            if (!$id) {
                echo json_encode(["success" => false, "error" => "ID manquant"]);
                exit;
            }
            // Vérifier que c'est bien un étudiant
            $check = $pdo->prepare("SELECT role FROM utilisateur WHERE id = ?");
            $check->execute([$id]);
            if ($check->fetchColumn() !== 'etudiant') {
                echo json_encode(["success" => false, "error" => "Cet utilisateur n'est pas un étudiant"]);
                exit;
            }
            // Supprimer (les clés étrangères sont en ON DELETE CASCADE)
            $stmt = $pdo->prepare("DELETE FROM utilisateur WHERE id = ?");
            $stmt->execute([$id]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["success" => false, "error" => "Étudiant non trouvé"]);
            }
            break;

        default:
            echo json_encode(["success" => false, "error" => "Action inconnue"]);
            break;
    }
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => "Erreur SQL : " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>