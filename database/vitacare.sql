-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 26 mai 2026 à 17:15
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `vitacare`
--



-- --------------------------------------------------------

--
-- Structure de la table `activite`
--

CREATE TABLE `activite` (
  `id` int(11) NOT NULL,
  `nom` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `date_heure` datetime NOT NULL,
  `capacite_max` int(11) NOT NULL DEFAULT 20,
  `lieu` varchar(200) DEFAULT NULL,
  `id_praticien` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `activite`
--

INSERT INTO `activite` (`id`, `nom`, `description`, `date_heure`, `capacite_max`, `lieu`, `id_praticien`) VALUES
(1, 'Yoga doux', 'Séance de yoga pour débutants', '2026-05-30 10:00:00', 15, 'Salle Zen', 3),
(2, 'Méditation guidée', 'Séance de méditation et pleine conscience', '2026-05-31 12:00:00', 20, 'Salle Sérénité', 2),
(3, 'Atelier nutrition équilibrée', 'Apprenez à manger sainement', '2026-06-01 14:00:00', 12, 'Salle Nutrition', 3);

-- --------------------------------------------------------

--
-- Structure de la table `creneau`
--

CREATE TABLE `creneau` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `heure_debut` time NOT NULL,
  `heure_fin` time NOT NULL,
  `statut` enum('disponible','reserve','annule') NOT NULL DEFAULT 'disponible',
  `id_praticien` int(11) NOT NULL,
  `id_service` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `creneau`
--

INSERT INTO `creneau` (`id`, `date`, `heure_debut`, `heure_fin`, `statut`, `id_praticien`, `id_service`) VALUES
(1, '2026-05-28', '09:00:00', '09:30:00', 'disponible', 2, 1),
(2, '2026-05-28', '10:00:00', '10:30:00', 'disponible', 2, 1),
(3, '2026-05-28', '14:00:00', '15:00:00', 'disponible', 2, 2),
(4, '2026-05-29', '09:00:00', '09:45:00', 'disponible', 3, 3),
(5, '2026-05-29', '11:00:00', '12:00:00', 'disponible', 3, 4);

-- --------------------------------------------------------

--
-- Structure de la table `inscription`
--

CREATE TABLE `inscription` (
  `id` int(11) NOT NULL,
  `date_inscription` datetime DEFAULT current_timestamp(),
  `statut` enum('en_attente','confirmee','annulee') NOT NULL DEFAULT 'en_attente',
  `id_etudiant` int(11) NOT NULL,
  `id_activite` int(11) NOT NULL,
  `id_panier` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL,
  `message` text NOT NULL,
  `type` enum('confirmation','rappel','annulation','info') NOT NULL DEFAULT 'info',
  `lu` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `id_utilisateur` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `panier`
--

CREATE TABLE `panier` (
  `id` int(11) NOT NULL,
  `statut` enum('en_cours','valide','annule') NOT NULL DEFAULT 'en_cours',
  `date_validation` datetime DEFAULT NULL,
  `total` decimal(8,2) DEFAULT 0.00,
  `id_etudiant` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reservation`
--

CREATE TABLE `reservation` (
  `id` int(11) NOT NULL,
  `date_reservation` datetime DEFAULT current_timestamp(),
  `statut` enum('en_attente','confirmee','annulee','terminee') NOT NULL DEFAULT 'en_attente',
  `id_etudiant` int(11) NOT NULL,
  `id_creneau` int(11) NOT NULL,
  `id_panier` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;



CREATE TABLE `service` (
  `id` int(11) NOT NULL,
  `nom` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `duree_min` int(11) NOT NULL,
  `prix` decimal(6,2) NOT NULL,
  `categorie` enum('consultation','therapie','nutrition','sport','bien_etre') NOT NULL,
  `id_praticien` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `service`
--

INSERT INTO `service` (`id`, `nom`, `description`, `duree_min`, `prix`, `categorie`, `id_praticien`) VALUES
(1, 'Consultation générale', 'Consultation médicale générale', 30, 25.00, 'consultation', 2),
(2, 'Soutien psychologique', 'Séance de soutien avec psychologue', 60, 45.00, 'therapie', 2),
(3, 'Atelier nutrition', 'Conseils personnalisés en nutrition', 45, 30.00, 'nutrition', 3),
(4, 'Séance de relaxation', 'Sophrologie et relaxation guidée', 60, 20.00, 'bien_etre', 3),
(5, 'Coaching bien-être', 'Programme personnalisé bien-être', 60, 50.00, 'bien_etre', 2);


CREATE TABLE `utilisateur` (
  `id` int(11) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `mot_de_passe` varchar(255) NOT NULL,
  `role` enum('etudiant','praticien','admin') NOT NULL DEFAULT 'etudiant',
  `created_at` datetime DEFAULT current_timestamp(),
  `telephone` varchar(20) DEFAULT NULL,
  `adresse_pro` varchar(255) DEFAULT NULL,
  `specialite` varchar(100) DEFAULT NULL,
  `diplome` varchar(150) DEFAULT NULL,
  `numero_rpps` varchar(50) DEFAULT NULL
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


INSERT INTO `utilisateur` (`id`, `nom`, `prenom`, `email`, `mot_de_passe`, `role`, `created_at`, `telephone`, `adresse_pro`, `specialite`, `diplome`, `numero_rpps`) VALUES
(2, 'Martin', 'Sophie', 'sophie@vitacare.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'praticien', '2026-05-25 22:45:30', NULL, NULL, NULL, NULL, NULL),
(3, 'Garnier', 'Elise', 'elise@vitacare.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'praticien', '2026-05-25 22:45:30', NULL, NULL, NULL, NULL, NULL),
(4, 'Dupont', 'Julie', 'julie@ece.fr', '$2y$10$.wuP75m6qNvOeHVYJzhPseNfYUfja/NPMIzO/sVH.Raf0gnlRkZSi', 'etudiant', '2026-05-25 22:45:30', NULL, NULL, NULL, NULL, NULL),
(5, 'Leroy', 'Thomas', 'thomas@ece.fr', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'etudiant', '2026-05-25 22:45:30', NULL, NULL, NULL, NULL, NULL),
(6, 'Lobut', 'Juliette', 'juliette.lobut@edu.ece.fr', '$2y$10$Sd.0VXP9lIVUeqVyoJyH/u4z9tH5mbMBZhq2NqsfWCLA8FaIh1OtC', 'praticien', '2026-05-26 10:33:21', NULL, NULL, NULL, NULL, NULL),
(7, 'Lobut', 'Juliette', 'juliette.lobut@icloud.com', '$2y$10$FvdWQsZsT7q4BW3jq4uo.uN5hho3vteB1E5bh5WQn0THAyIWm6RZK', 'praticien', '2026-05-26 10:50:00', NULL, NULL, NULL, NULL, NULL);



--
-- Index pour les tables déchargées
--

--
-- Index pour la table `activite`
--
ALTER TABLE `activite`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_praticien` (`id_praticien`);

--
-- Index pour la table `creneau`
--
ALTER TABLE `creneau`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_praticien` (`id_praticien`),
  ADD KEY `id_service` (`id_service`);

--
-- Index pour la table `inscription`
--
ALTER TABLE `inscription`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_etudiant` (`id_etudiant`),
  ADD KEY `id_activite` (`id_activite`),
  ADD KEY `id_panier` (`id_panier`);

--
-- Index pour la table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_utilisateur` (`id_utilisateur`);

--
-- Index pour la table `panier`
--
ALTER TABLE `panier`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_etudiant` (`id_etudiant`);

--
-- Index pour la table `reservation`
--
ALTER TABLE `reservation`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_etudiant` (`id_etudiant`),
  ADD KEY `id_creneau` (`id_creneau`),
  ADD KEY `id_panier` (`id_panier`);

--
-- Index pour la table `service`
--
ALTER TABLE `service`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_praticien` (`id_praticien`);

--
-- Index pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `activite`
--
ALTER TABLE `activite`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `creneau`
--
ALTER TABLE `creneau`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `inscription`
--
ALTER TABLE `inscription`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `panier`
--
ALTER TABLE `panier`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `reservation`
--
ALTER TABLE `reservation`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `service`
--
ALTER TABLE `service`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `utilisateur`
--
ALTER TABLE `utilisateur`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `activite`
--
ALTER TABLE `activite`
  ADD CONSTRAINT `activite_ibfk_1` FOREIGN KEY (`id_praticien`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `creneau`
--
ALTER TABLE `creneau`
  ADD CONSTRAINT `creneau_ibfk_1` FOREIGN KEY (`id_praticien`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `creneau_ibfk_2` FOREIGN KEY (`id_service`) REFERENCES `service` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `inscription`
--
ALTER TABLE `inscription`
  ADD CONSTRAINT `inscription_ibfk_1` FOREIGN KEY (`id_etudiant`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inscription_ibfk_2` FOREIGN KEY (`id_activite`) REFERENCES `activite` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inscription_ibfk_3` FOREIGN KEY (`id_panier`) REFERENCES `panier` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_ibfk_1` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `panier`
--
ALTER TABLE `panier`
  ADD CONSTRAINT `panier_ibfk_1` FOREIGN KEY (`id_etudiant`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `reservation`
--
ALTER TABLE `reservation`
  ADD CONSTRAINT `reservation_ibfk_1` FOREIGN KEY (`id_etudiant`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservation_ibfk_2` FOREIGN KEY (`id_creneau`) REFERENCES `creneau` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservation_ibfk_3` FOREIGN KEY (`id_panier`) REFERENCES `panier` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `service`
--
ALTER TABLE `service`
  ADD CONSTRAINT `service_ibfk_1` FOREIGN KEY (`id_praticien`) REFERENCES `utilisateur` (`id`) ON DELETE CASCADE;

-- --------------------------------------------------------

--
-- Structure de la table `service`
--

CREATE TABLE inscription_activite (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_activite INT NOT NULL,
  id_etudiant INT NOT NULL,
  date_inscription TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_inscription (id_activite, id_etudiant),

  FOREIGN KEY (id_activite) REFERENCES activite(id) ON DELETE CASCADE,
  FOREIGN KEY (id_etudiant) REFERENCES utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE panier_activite (
  id INT AUTO_INCREMENT PRIMARY KEY,

  id_etudiant INT NOT NULL,

  id_activite INT NOT NULL,

  date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE KEY unique_panier_activite (id_etudiant, id_activite),

  FOREIGN KEY (id_etudiant)
    REFERENCES utilisateur(id)
    ON DELETE CASCADE,

  FOREIGN KEY (id_activite)
    REFERENCES activite(id)
    ON DELETE CASCADE
);




COMMIT;



/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;