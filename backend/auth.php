<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "config.php";

$action = $_GET["action"] ?? "";

try {

    switch ($action) {

        case "register":
            $data = json_decode(file_get_contents("php://input"), true);

            $nom = trim($data["nom"] ?? "");
            $prenom = trim($data["prenom"] ?? "");
            $email = trim($data["email"] ?? "");
            $password = $data["mot_de_passe"] ?? "";
            
            $role = "etudiant";

            if (!$nom || !$prenom || !$email || !$password) {
                echo json_encode([
                    "success" => false,
                    "error" => "Tous les champs sont obligatoires"
                ]);
                exit;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode([
                    "success" => false,
                    "error" => "Format d'email invalide"
                ]);
                exit;
            }

            // DÉTECTION DE L'ADRESSE ADMIN
            if (substr(strtolower($email), -12) === "@vitacare.fr") {
                $role = "admin";
            }

            if (strlen($password) < 6) {
                echo json_encode([
                    "success" => false,
                    "error" => "Le mot de passe doit contenir au moins 6 caractères"
                ]);
                exit;
            }

            $check = $pdo->prepare("SELECT id FROM utilisateur WHERE email = ?");
            $check->execute([$email]);

            if ($check->fetch()) {
                echo json_encode([
                    "success" => false,
                    "error" => "Cet email est déjà utilisé"
                ]);
                exit;
            }

            $hash = password_hash($password, PASSWORD_DEFAULT);

            $stmt = $pdo->prepare("
                INSERT INTO utilisateur 
                (nom, prenom, email, mot_de_passe, role, created_at, telephone, adresse_pro)
                VALUES (?, ?, ?, ?, ?, NOW(), NULL, NULL)
            ");

            $stmt->execute([
                $nom,
                $prenom,
                $email,
                $hash,
                $role
            ]);

            echo json_encode([
                "success" => true,
                "message" => "Compte créé avec succès"
            ]);
            break;

        case "register_praticien":
            $data = json_decode(file_get_contents("php://input"), true);

            $nom = trim($data["nom"] ?? "");
            $prenom = trim($data["prenom"] ?? "");
            $email = trim($data["email"] ?? "");
            $password = $data["mot_de_passe"] ?? "";
            $telephone = trim($data["telephone"] ?? "");
            $adresse = trim($data["adresse"] ?? "");
            $specialite = trim($data["specialite"] ?? "");
            $diplome = trim($data["diplome"] ?? "");
            $rpps = trim($data["rpps"] ?? "");

            if (!$nom || !$prenom || !$email || !$password || !$specialite) {
                echo json_encode([
                    "success" => false,
                    "error" => "Champs obligatoires manquants"
                ]);
                exit;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode([
                    "success" => false,
                    "error" => "Email invalide"
                ]);
                exit;
            }

            if (strlen($password) < 6) {
                echo json_encode([
                    "success" => false,
                    "error" => "Mot de passe trop court"
                ]);
                exit;
            }

            $check = $pdo->prepare("SELECT id FROM utilisateur WHERE email = ?");
            $check->execute([$email]);

            if ($check->fetch()) {
                echo json_encode([
                    "success" => false,
                    "error" => "Cet email est déjà utilisé"
                ]);
                exit;
            }

            $hash = password_hash($password, PASSWORD_DEFAULT);

            $stmt = $pdo->prepare("
                INSERT INTO utilisateur
                (nom, prenom, email, mot_de_passe, role, created_at, telephone, adresse_pro, specialite, diplome, numero_rpps)
                VALUES (?, ?, ?, ?, 'praticien', NOW(), ?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $nom,
                $prenom,
                $email,
                $hash,
                $telephone,
                $adresse,
                $specialite,
                $diplome,
                $rpps
            ]);

            echo json_encode([
                "success" => true,
                "message" => "Compte praticien créé avec succès"
            ]);
            break;

        case "login":
            session_start();

            $data = json_decode(file_get_contents("php://input"), true);

            $email = trim($data["email"] ?? "");
            $password = $data["mot_de_passe"] ?? "";

            if (!$email || !$password) {
                echo json_encode([
                    "success" => false,
                    "error" => "Email et mot de passe obligatoires"
                ]);
                exit;
            }

            $stmt = $pdo->prepare("SELECT * FROM utilisateur WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($password, $user["mot_de_passe"])) {
                echo json_encode([
                    "success" => false,
                    "error" => "Email ou mot de passe incorrect"
                ]);
                exit;
            }

            $_SESSION["user_id"] = $user["id"];
            $_SESSION["nom"] = $user["nom"];
            $_SESSION["prenom"] = $user["prenom"];
            $_SESSION["email"] = $user["email"];
            $_SESSION["role"] = $user["role"];

            // ✅ CORRECTION : redirection vers admin.html (et non admin_vue_densemble.html)
            $redirectPage = "espace_etudiant.html";

            if ($user["role"] === "admin") {
                $redirectPage = "admin.html";
            } elseif ($user["role"] === "praticien") {
                $redirectPage = "espace_praticien.html";
            }

            echo json_encode([
                "success" => true,
                "redirect" => $redirectPage,
                "user" => [
                    "id" => $user["id"],
                    "nom" => $user["nom"],
                    "prenom" => $user["prenom"],
                    "email" => $user["email"],
                    "role" => $user["role"]
                ]
            ]);
            break;

        case "logout":
            session_start();
            session_destroy();

            echo json_encode([
                "success" => true,
                "message" => "Déconnecté"
            ]);
            break;

        default:
            echo json_encode([
                "success" => false,
                "error" => "Action inconnue"
            ]);
            break;
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => "Erreur serveur : " . $e->getMessage()
    ]);
}
?>