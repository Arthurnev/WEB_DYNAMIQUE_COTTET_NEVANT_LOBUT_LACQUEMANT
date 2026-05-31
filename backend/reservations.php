<?php
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once "config.php";

$action = $_GET["action"] ?? "";

try {
    switch ($action) {
        case 'list':
            $sql = "SELECT 
                        r.id,
                        CONCAT(e.nom, ' ', e.prenom) AS etudiant,
                        CONCAT(p.nom, ' ', p.prenom) AS praticien,
                        s.nom AS service,
                        c.date,
                        c.heure_debut AS horaire,
                        r.statut
                    FROM reservation r
                    JOIN creneau c ON r.id_creneau = c.id
                    JOIN utilisateur e ON r.id_etudiant = e.id
                    JOIN utilisateur p ON c.id_praticien = p.id
                    JOIN service s ON c.id_service = s.id
                    ORDER BY c.date DESC, c.heure_debut ASC";
            $stmt = $pdo->prepare($sql);
            $stmt->execute();
            $reservations = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(["success" => true, "data" => $reservations]);
            break;

        case 'delete':
            $input = json_decode(file_get_contents("php://input"), true);
            $id = $input["id"] ?? 0;
            if (!$id) {
                echo json_encode(["success" => false, "error" => "ID manquant"]);
                exit;
            }
            $stmt = $pdo->prepare("DELETE FROM reservation WHERE id = ?");
            $stmt->execute([$id]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(["success" => true]);
            } else {
                echo json_encode(["success" => false, "error" => "Réservation non trouvée ou déjà supprimée"]);
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