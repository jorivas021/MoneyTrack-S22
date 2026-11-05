
# Consignes générales MoneyTrack

Ces règles s’appliquent à tout travail effectué dans le projet. En cas d’ambiguïté ou de décision architecturale importante, demander la validation du Team Lead avant de poursuivre.

## Présentation et périmètre

MoneyTrack est une application web de gestion des finances personnelles, destinée notamment au marché congolais. Elle permet de gérer les revenus, dépenses, transactions, budgets, catégories, statistiques, historiques financiers et profils.

- Les données de démonstration utilisent le FCFA.
- Le MVP comprend uniquement un espace utilisateur classique. Ne pas développer d’espace administrateur sans validation.
- Respecter le périmètre attribué à chaque membre de l’équipe; coordonner tout changement qui touche le travail d’un autre membre.

## Technologies et bibliothèques

La stack officielle est Next.js avec App Router, TypeScript, Tailwind CSS, Auth.js, PostgreSQL, Prisma et Recharts. Le déploiement cible Vercel et le code est hébergé sur GitHub.

- Utiliser exclusivement `lucide-react` pour les icônes.
- Utiliser `sweetalert2` pour les alertes, confirmations et notifications de l’application.
- Ne pas utiliser Font Awesome, Heroicons, une autre bibliothèque d’icônes, ni les fonctions natives `alert()` et `confirm()` du navigateur.
- Ces choix ne garantissent pas que les paquets ou services sont déjà configurés. Vérifier l’état du projet et ne pas installer de dépendance ni configurer un service sans que la tâche l’autorise.

## Identité visuelle

Respecter la palette officielle : bleu marine `#14213D`, vert `#16A36A`, rouge doux `#E85D5D`, fond `#F5F7FA` et blanc `#FFFFFF`. Utiliser Inter ou Manrope. L’interface doit rester moderne, professionnelle, responsive et cohérente.

## Architecture

Respecter l’architecture existante et les conventions de Next.js App Router; ne pas déplacer, supprimer ou renommer de dossier sans validation.

- `app/` : pages, layouts et routes.
- `components/` : composants partagés et éléments visuels; `ui/`, `layout/` et `shared/` gardent leurs rôles dédiés.
- `features/` : code organisé par fonctionnalité métier.
- `hooks/` : hooks personnalisés.
- `lib/` : configurations et utilitaires partagés.
- `types/` : types globaux.
- `config/` : configuration générale de l’application.
- `prisma/` : schéma et migrations.
- `public/` : ressources statiques.

## Conventions de développement

- Utiliser TypeScript et éviter `any`; privilégier les types précis.
- Préférer les Server Components et n’ajouter `"use client"` que lorsqu’il est nécessaire.
- Séparer les composants, la logique métier et l’accès aux données; réutiliser l’existant et éviter les duplications.
- Valider les données avant traitement et suivre les bonnes pratiques de la version de Next.js du projet.
- Respecter PascalCase pour les noms de composants et kebab-case pour les noms de fichiers, selon les conventions requises par le framework.
- Vérifier les scripts et conventions du projet avant de choisir les commandes de validation.

## Rendu et cache

- La page d’accueil publique est générée en SSG.
- La page publique de conseils et FAQ utilise ISR.
- Le tableau de bord personnalisé utilise SSR.
- Ne jamais mettre en cache publiquement des données financières privées.

## Sécurité

- Chaque utilisateur ne peut accéder qu’à ses propres données.
- Vérifier identité et autorisations côté serveur et protéger toutes les routes privées.
- Ne jamais faire confiance uniquement aux données envoyées par le navigateur.
- Ne pas exposer de secrets ou de clés privées; utiliser les variables d’environnement et ne pas les divulguer.

## Collaboration Git

- Travailler sur des branches dédiées aux noms explicites; respecter la branche principale.
- Ne pas pousser directement sur la branche principale sans autorisation.
- Écrire des commits compréhensibles et ne pas écraser le travail d’un autre membre.
- Ne pas effectuer de reset destructif ni de push forcé sans autorisation explicite.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->
