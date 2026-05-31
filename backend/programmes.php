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
            // Récupère toutes les activités avec le nom de l'intervenant (praticien)
            $sql = "SELECT a.id, a.nom, a.description, a.date_heure, a.capacite_max, a.lieu,
                           CONCAT(u.nom, ' ', u.prenom) AS intervenant
                    FROM activite a
                    LEFT JOIN utilisateur u ON a.id_praticien = u.id
                    ORDER BY a.date_heure DESC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $activites = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $activites]);
            break;

        case 'delete':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $input["id"] ?? 0;
            if (!$id) {
                echo json_encode(["success" => false, "error" => "ID manquant"]);
                exit;
            }
            // Vérifier que l'activité existe
            $check = $pdo->prepare("SELECT id FROM activite WHERE id = ?");
            $check->execute([$id]);
            if (!$check->fetch()) {
                echo json_encode(["success" => false, "error" => "Activité non trouvée"]);
                exit;
            }
            // Supprimer (les clés étrangères sont en ON DELETE CASCADE)
            $stmt = $pdo->prepare("DELETE FROM activite WHERE id = ?");
            $stmt->execute([$id]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["success" => false, "error" => "Erreur lors de la suppression"]);
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