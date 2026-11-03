---
name: git-testing-quality
description: Use when preparing MoneyTrack changes in Git, choosing branches or commits, collaborating across team ownership, selecting tests, reviewing quality, or reporting verification results.
---

# Git, Testing and Quality — MoneyTrack

## Objectif et règles générales

Préserver la qualité du code et le travail partagé des cinq membres de MoneyTrack. Lire et appliquer `AGENTS.md`. Respecter le périmètre attribué et demander coordination avant de modifier le travail d'un autre membre ou une décision architecturale.

Les commandes et exemples sont des repères; vérifier le dépôt, les scripts, les outils installés et les permissions actuelles avant de les exécuter.

## Collaboration Git et GitHub

Avant un changement, vérifier le dépôt et la branche actifs, l'état de l'arbre de travail et les fichiers concernés. Distinguer les modifications préexistantes de celles de la tâche; ne jamais les écraser, les réinitialiser ou les inclure dans un commit sans autorisation.

- Utiliser une branche dédiée et un nom explicite, par exemple `feat/dashboard`, `feat/transactions`, `feat/authentication`, `feat/budgets`, `fix/transaction-validation`, `refactor/shared-components` ou `test/transactions`.
- Ne pas pousser directement sur la branche principale sans autorisation.
- Synchroniser les branches en suivant les règles de l'équipe; examiner les conflits et les résoudre sans supprimer le travail d'autrui.
- Préparer une pull request compréhensible : objectif, portée, choix importants, tests réellement exécutés et limites restantes.
- Ne jamais effectuer de reset destructif, de push forcé ou d'écrasement de branche sans autorisation explicite.
- Ne pas changer de branche ni committer automatiquement si cela n'a pas été demandé.

## Commits

Utiliser des messages courts, compréhensibles et cohérents, par exemple :

- `feat: add transaction filters`
- `fix: validate transaction amount`
- `refactor: reuse shared form controls`
- `test: cover budget ownership`
- `docs: clarify dashboard rendering`
- `chore: update lint configuration`

Un commit doit représenter un changement cohérent, ne pas inclure des secrets ni des fichiers générés inutiles, et ne pas contenir des changements locaux d'un autre membre. Respecter les consignes de trailer du dépôt si un commit est autorisé.

## Organisation des tests

Adapter la stratégie aux outils déjà installés :

- **Unitaires** : logique métier isolée, validations et calculs.
- **Intégration** : interaction entre service, stockage et permissions.
- **Composants** : rendu, accessibilité et interactions UI.
- **Fonctionnels/de bout en bout** : parcours importants utilisateur.
- **Sécurité** : authentification, autorisations, isolation entre comptes.

Ne pas ajouter ou imposer une bibliothèque de test avant d'avoir examiné les dépendances, scripts et conventions du projet. Si aucun test n'existe, ne pas prétendre avoir testé; proposer le contrôle minimal possible selon le contexte.

## Cas métier MoneyTrack

Prévoir, selon le périmètre de la modification, des tests pour :

- créer, modifier et supprimer une transaction;
- calculer les soldes et suivre un budget avec des montants exacts;
- valider les champs et traiter les saisies invalides;
- isoler les données et empêcher l'accès inter-utilisateurs;
- afficher les listes vides, chargements, succès et erreurs.

Les vérifications financières doivent couvrir les limites, règles de précision, dates et cas d'erreur définis par le domaine. Ne pas inventer de données réelles.

## Contrôle qualité

Avant de sélectionner une commande, lire `package.json` et la configuration active. Exécuter uniquement les scripts pertinents et disponibles, par exemple TypeScript, ESLint, tests ou build Next.js. Ne pas supposer qu'un script `test` existe.

Pour une modification d'instructions ou de documentation uniquement, une vérification de diff et de formatage peut suffire. Pour du code, valider le comportement ciblé; élargir les tests si une dépendance ou un résultat l'exige.

- Vérifier les erreurs TypeScript et lint dans le périmètre utile.
- Lire la sortie complète des tests/build; distinguer un échec lié au changement d'un problème préexistant.
- Revoir le diff pour confirmer l'absence de changements non voulus, secrets ou artefacts.
- Ne jamais déclarer une vérification réussie si elle n'a pas été exécutée.
- Si une commande ne peut pas être exécutée, expliquer pourquoi et ce qui reste à vérifier.

## Avant et après le travail

Avant :

1. Confirmer la branche et l'état de travail sans les modifier.
2. Lire les consignes du projet, identifier le propriétaire et les fichiers inclus dans le périmètre.
3. Vérifier outils, dépendances et scripts existants.

Après :

1. Inspecter le diff et l'état Git.
2. Exécuter les vérifications adaptées.
3. Rapporter le travail réalisé, les fichiers créés/modifiés, les tests réellement lancés et leurs résultats, les problèmes rencontrés et les points restants.
4. Laisser intact tout changement local hors périmètre.

## Erreurs à éviter

- Pousser sur la branche principale, forcer, réinitialiser ou écraser sans permission.
- Mélanger dans un commit les travaux d'autres membres ou des changements préexistants.
- Installer un framework de tests ou prétendre qu'un test absent a réussi.
- Tester uniquement le rendu nominal en oubliant calculs et contrôle d'accès.
- Cacher un échec de build, annoncer des tests non lancés ou ignorer le diff final.

## Checklist

- [ ] Branche, état Git, propriété de la tâche et périmètre ont été vérifiés.
- [ ] Les modifications locales préexistantes ont été préservées.
- [ ] Aucun changement de branche, commit, push ou opération destructive n'a été effectué sans autorisation.
- [ ] Tests choisis selon les outils et scripts déjà présents.
- [ ] Calculs financiers, validations et permissions testés lorsque pertinents.
- [ ] ESLint, TypeScript, tests ou build annoncés uniquement s'ils ont été réellement exécutés.
- [ ] Diff final et fichiers inclus ont été examinés.
- [ ] Le compte rendu décrit résultats, limites et points restant à traiter.
