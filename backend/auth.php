<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

require_once "config.php";

$action = $_GET["action"] ?? "";

function geocoderAdresse($adresse) {
    if (empty($adresse)) {
        return [null, null];
    }

    $url = "https://nominatim.openstreetmap.org/search?format=json&limit=1&q=" . urlencode($adresse);

    $opts = [
        "http" => [
            "header" => "User-Agent: VitaCareCampus/1.0\r\n"
        ]
    ];

    $context = stream_context_create($opts);
    $response = @file_get_contents($url, false, $context);

    if ($response === false) {
        return [null, null];
    }

    $data = json_decode($response, true);

    if (!empty($data[0]["lat"]) && !empty($data[0]["lon"])) {
        return [$data[0]["lat"], $data[0]["lon"]];
    }

    return [null, null];
}

try {
    switch ($action) {

        case "register":
            $data = json_decode(file_get_contents("php://input"), true);

            $nom = trim($data["nom"] ?? "");
            $prenom = trim($data["prenom"] ?? "");
            $email = trim($data["email"] ?? "");
            $password = $data["mot_de_passe"] ?? "";
            $role = $data["role"] ?? "etudiant";

            if (!$nom || !$prenom || !$email || !$password) {
                echo json_encode(["success" => false, "error" => "Tous les champs sont obligatoires"]);
                exit;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(["success" => false, "error" => "Email invalide"]);
                exit;
            }

            if (strlen($password) < 6) {
                echo json_encode(["success" => false, "error" => "Mot de passe trop court"]);
                exit;
            }

            $check = $pdo->prepare("SELECT id FROM utilisateur WHERE email = ?");
            $check->execute([$email]);

            if ($check->fetch()) {
                echo json_encode(["success" => false, "error" => "Cet email est déjà utilisé"]);
                exit;
            }

            $hash = password_hash($password, PASSWORD_DEFAULT);

            $stmt = $pdo->prepare("
                INSERT INTO utilisateur 
                (nom, prenom, email, mot_de_passe, role)
                VALUES (?, ?, ?, ?, ?)
            ");

            $stmt->execute([$nom, $prenom, $email, $hash, $role]);

            echo json_encode(["success" => true, "message" => "Compte créé avec succès"]);
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
                echo json_encode(["success" => false, "error" => "Champs obligatoires manquants"]);
                exit;
            }

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                echo json_encode(["success" => false, "error" => "Email invalide"]);
                exit;
            }

            if (strlen($password) < 6) {
                echo json_encode(["success" => false, "error" => "Mot de passe trop court"]);
                exit;
            }

            $check = $pdo->prepare("SELECT id FROM utilisateur WHERE email = ?");
            $check->execute([$email]);

            if ($check->fetch()) {
                echo json_encode(["success" => false, "error" => "Cet email est déjà utilisé"]);
                exit;
            }

            [$latitude, $longitude] = geocoderAdresse($adresse);

            $hash = password_hash($password, PASSWORD_DEFAULT);

            $stmt = $pdo->prepare("
                INSERT INTO utilisateur
                (
                    nom, prenom, email, mot_de_passe, role,
                    telephone, adresse_pro, specialite, diplome, numero_rpps,
                    latitude, longitude
                )
                VALUES (?, ?, ?, ?, 'praticien', ?, ?, ?, ?, ?, ?, ?)
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
                $rpps,
                $latitude,
                $longitude
            ]);

            $id_praticien = $pdo->lastInsertId();

            $nom_service = "Consultation";
            $description_service = "Consultation avec un professionnel de santé";
            $categorie = "consultation";
            $duree = 30;
            $prix = 25.00;

            if ($specialite === "psychologie") {
                $nom_service = "Soutien psychologique";
                $categorie = "therapie";
                $duree = 45;
                $prix = 15.00;
            }

            if ($specialite === "nutrition") {
                $nom_service = "Consultation nutritionnelle";
                $categorie = "nutrition";
                $duree = 40;
                $prix = 30.00;
            }

            if ($specialite === "sport") {
                $nom_service = "Séance de coaching sportif";
                $categorie = "sport";
                $duree = 60;
                $prix = 20.00;
            }

            if ($specialite === "bien_etre") {
                $nom_service = "Séance bien-être";
                $categorie = "bien_etre";
                $duree = 60;
                $prix = 20.00;
            }

            $service = $pdo->prepare("
                INSERT INTO service
                (nom, description, duree_min, prix, categorie, id_praticien)
                VALUES (?, ?, ?, ?, ?, ?)
            ");

            $service->execute([
                $nom_service,
                $description_service,
                $duree,
                $prix,
                $categorie,
                $id_praticien
            ]);

            echo json_encode(["success" => true, "message" => "Compte praticien créé"]);
            break;

        case "login":
            session_start();

            $data = json_decode(file_get_contents("php://input"), true);

            $email = trim($data["email"] ?? "");
            $password = $data["mot_de_passe"] ?? "";

            if (!$email || !$password) {
                echo json_encode(["success" => false, "error" => "Email et mot de passe obligatoires"]);
                exit;
            }

            $stmt = $pdo->prepare("SELECT * FROM utilisateur WHERE email = ?");
            $stmt->execute([$email]);
            $user = $stmt->fetch();

            if (!$user || !password_verify($password, $user["mot_de_passe"])) {
                echo json_encode(["success" => false, "error" => "Email ou mot de passe incorrect"]);
                exit;
            }

            $_SESSION["user_id"] = $user["id"];
            $_SESSION["nom"] = $user["nom"];
            $_SESSION["prenom"] = $user["prenom"];
            $_SESSION["email"] = $user["email"];
            $_SESSION["role"] = $user["role"];

            echo json_encode([
                "success" => true,
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

            echo json_encode(["success" => true, "message" => "Déconnecté"]);
            break;

        default:
            echo json_encode(["success" => false, "error" => "Action inconnue"]);
            break;
    }

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => "Erreur serveur : " . $e->getMessage()
    ]);
}
?>