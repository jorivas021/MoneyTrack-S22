MoneyTrack – Gestion intelligente des finances personnelles

1. Présentation du projet

MoneyTrack est une application web de gestion des finances personnelles qui permet aux utilisateurs de suivre leurs revenus, leurs dépenses et leurs budgets depuis une interface simple, moderne et intuitive.

L’objectif est d’aider chaque utilisateur à mieux comprendre sa situation financière, à contrôler ses dépenses et à prendre de meilleures décisions dans la gestion de son argent.

L’application utilise le FCFA comme devise de référence pour les données de démonstration.

2. Fonctionnalités principales

Fonctionnalités incluses dans le MVP

* Inscription et connexion des utilisateurs.
* Gestion des sessions et protection des pages privées.
* Tableau de bord financier.
* Enregistrement des revenus et des dépenses.
* Consultation, modification et suppression des transactions.
* Calcul automatique du solde.
* Gestion des catégories de revenus et de dépenses.
* Création et suivi des budgets mensuels.
* Statistiques et graphiques financiers.
* Historique des opérations.
* Gestion du profil utilisateur.
* Interface responsive (ordinateur, tablette et smartphone).

Fonctionnalités hors périmètre

Les fonctionnalités suivantes ne sont pas prévues dans cette première version :

* Transferts d’argent réels.
* Paiements Mobile Money.
* Connexion aux comptes bancaires.
* Conseils financiers générés par intelligence artificielle.
* Application mobile native.
* Gestion de plusieurs devises.

3. Technologies utilisées

Technologie	Utilisation
Next.js App Router	Framework principal et routage
React	Construction des interfaces
TypeScript	Typage du code
Tailwind CSS	Mise en forme et responsive design
Auth.js	Authentification et sessions
PostgreSQL	Base de données
Prisma ORM	Gestion des données
Recharts	Graphiques et statistiques
Lucide React	Icônes
SweetAlert2	Alertes et confirmations
Git et GitHub	Gestion de versions et collaboration
Vercel	Hébergement et déploiement

4. Architecture du projet

Le projet utilise une architecture organisée par responsabilités afin de faciliter le développement et la collaboration.

money-track/
│
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── (dashboard)/
│   └── api/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── features/
│   ├── transactions/
│   ├── budgets/
│   ├── categories/
│   ├── dashboard/
│   └── statistics/
│
├── hooks/
├── lib/
├── types/
├── config/
├── prisma/
├── public/
│
├── AGENTS.md
├── README.md
├── package.json
└── tsconfig.json

Cette arborescence présente l’organisation cible. Elle pourra évoluer selon les besoins techniques validés par l’équipe.

5. Prérequis

Avant de commencer, installer les outils suivants :

* Node.js (version LTS recommandée).
* npm (installé avec Node.js).
* Git.
* Visual Studio Code.
* Un compte GitHub.
* Une base de données PostgreSQL accessible pour la configuration complète.

6. Installation du projet

Étape 1 : Récupérer le projet

git clone URL_DU_DEPOT

Étape 2 : Accéder au dossier

cd money-track

Étape 3 : Installer les dépendances

npm install

Étape 4 : Configurer les variables d’environnement

Créer un fichier .env à partir du fichier .env.example.

DATABASE_URL="URL_DE_CONNEXION_POSTGRESQL"
AUTH_SECRET="VOTRE_SECRET_AUTH"
AUTH_URL="URL_LOCALE_DE_L_APPLICATION"

Les valeurs définitives seront renseignées après la configuration de PostgreSQL et d’Auth.js.

Important : le fichier .env ne doit jamais être envoyé sur GitHub.

Étape 5 : Lancer l’application

npm run dev

Ouvrir ensuite :

http://localhost:3000

7. Base de données

MoneyTrack utilise PostgreSQL pour stocker les informations de manière persistante.

Prisma ORM sera utilisé pour gérer les modèles, les relations et les opérations sur la base de données.

Les principales entités prévues sont :

* User : informations des utilisateurs.
* Transaction : revenus et dépenses.
* Category : catégories financières.
* Budget : limites budgétaires par catégorie et par période.
* Account / Session : données nécessaires à Auth.js selon la configuration retenue.

Chaque transaction et chaque budget doivent être associés à leur propriétaire. Les données financières d’un utilisateur doivent rester privées.

8. Stratégies de rendu Next.js

Le projet doit démontrer trois stratégies de rendu :

Stratégie	Page concernée	Utilisation
SSG	Page d’accueil	Génération du contenu public à la construction
ISR	FAQ ou conseils financiers	Régénération périodique du contenu public
SSR	Tableau de bord	Affichage des données personnalisées de l’utilisateur connecté

Les données financières privées ne doivent jamais être exposées dans un cache public.

9. Répartition des responsabilités

Le projet est développé par une équipe de cinq membres.

Membre	Rôle	Responsabilités
Membre 1	Team Lead	Dashboard et Budgets
Membre 2	Repository Admin	Transactions, gestion GitHub et coordination du déploiement
Membre 3	Développeur Authentification	Inscription, Connexion et Profil
Membre 4	Développeur Rendu & Performance	Accueil, Présentation, FAQ, SSG, ISR et optimisation
Membre 5	Développeur Fonctionnalités	Catégories et Statistiques / Historique

Comptes GitHub de l’équipe

Membre	Compte GitHub
Team Lead	À compléter
Repository Admin	À compléter
Développeur 3	À compléter
Développeur 4	À compléter
Développeur 5	À compléter

10. Organisation Git et collaboration

Pour faciliter le travail en équipe, les règles suivantes doivent être respectées :

* La branche main contient les versions stables.
* La branche develop sert à intégrer les développements.
* Chaque fonctionnalité doit être développée sur une branche dédiée.
* Les Pull Requests doivent être relues par un autre membre.
* Aucun développement ne doit être envoyé directement sur main sans autorisation.
* Chaque membre doit disposer d’au moins une Pull Request fusionnée et relue.
* Les conflits doivent être signalés et résolus en coordination avec l’équipe.

Convention de nommage des branches

feat/dashboard-budgets
feat/transactions
feat/auth
feat/public-pages-rendering
feat/categories-statistics

11. Tests et qualité

Les fonctionnalités doivent être vérifiées avant leur intégration.

Les principaux contrôles concernent :

* Inscription, connexion et déconnexion.
* Protection des routes privées.
* Création, modification et suppression des transactions.
* Exactitude du calcul du solde.
* Gestion et suivi des budgets.
* Isolation des données entre utilisateurs.
* Affichage responsive.
* Cohérence des graphiques et statistiques.

L’audit Lighthouse mobile doit atteindre au minimum :

* Performance : 80.
* Accessibilité : 80.

12. Déploiement

L’application sera hébergée sur Vercel.

Le déploiement nécessitera :

1. La connexion du dépôt GitHub à Vercel.
2. La configuration des variables d’environnement.
3. La connexion à la base PostgreSQL.
4. La vérification du fonctionnement de l’application en production.

URL de production : À compléter.

13. Compte de démonstration

Les identifiants de démonstration seront ajoutés après la mise en place de l’authentification.

Information	Valeur
Adresse e-mail	À compléter
Mot de passe	À communiquer de manière sécurisée

14. Checklist finale du projet

* [ ]	Application Next.js fonctionnelle.
* [ ]	Authentification Auth.js opérationnelle.
* [ ]	Connexion et déconnexion vérifiées.
* [ ]	Routes privées protégées.
* [ ]	Base PostgreSQL opérationnelle.
* [ ]	Transactions fonctionnelles.
* [ ]	Calcul automatique du solde.
* [ ]	Budgets et catégories opérationnels.
* [ ]	Statistiques et historique fonctionnels.
* [ ]	Stratégies SSG, ISR et SSR démontrées.
* [ ]	Au moins 70 % des fonctionnalités prioritaires terminées.
* [ ]	Tests et audit Lighthouse effectués.
* [ ]	Pull Request fusionnée pour chaque membre.
* [ ]	Application déployée sur Vercel.
* [ ]	Documentation et compte de démonstration complétés.

⸻

MoneyTrack – Une meilleure gestion de vos finances, un pas vers une meilleure maîtrise de votre avenir.