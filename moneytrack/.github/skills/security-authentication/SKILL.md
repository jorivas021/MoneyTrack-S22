---
name: security-authentication
description: Use when implementing or reviewing MoneyTrack sign-in, sessions, Auth.js, private routes, server authorization, user-owned financial data, sensitive information, or security tests.
---

# Security and Authentication — MoneyTrack

## Objectif et limites

Protéger les comptes et les données financières personnelles de chaque utilisateur MoneyTrack. Lire et respecter `AGENTS.md`; cette skill le complète. Auth.js est la technologie officielle prévue, mais sa configuration, ses fournisseurs et ses dépendances ne sont pas présumés présents.

Ne pas choisir un fournisseur, une politique d'inscription ou un mécanisme d'identité sans besoin confirmé. Ne pas élargir le MVP à un espace administrateur. Toute décision d'architecture importante doit être validée par le Team Lead.

## Authentification et autorisation

- **Authentification** : établir quelle identité est à l'origine de la requête.
- **Autorisation** : déterminer côté serveur si cette identité peut exécuter l'action sur cette ressource.

Être connecté ne confère pas automatiquement l'accès à toutes les données. Un contrôle d'interface ou une redirection n'est pas une autorisation.

## Auth.js et sessions

Avant d'intervenir, vérifier la version installée d'Auth.js, les fichiers de configuration et la documentation correspondante. Ne pas inventer un fournisseur, une stratégie de session, un modèle d'adaptateur ni un flux d'inscription.

- Charger et vérifier la session côté serveur avec l'API de la version du projet.
- Gérer connexion, déconnexion, erreurs et expiration sans divulguer si un compte existe ou révéler des secrets.
- Protéger les routes privées et revalider l'identité dans chaque action ou service sensible.
- Les redirections peuvent améliorer l'expérience, mais l'API ou l'opération serveur doit toujours refuser un accès non autorisé.
- Ne jamais placer un secret ou un jeton privilégié dans une prop client, le HTML rendu ou les journaux.

Exemple conceptuel seulement, à adapter à la version présente :

```ts
const session = await auth();
const userId = session?.user?.id;

if (!userId) {
  throw new Error("UNAUTHORIZED");
}
```

Ne pas copier cet exemple sans vérifier la configuration et le type de session effectivement définis.

## Protection des routes et opérations

Toute route privée doit appliquer un contrôle côté serveur. Pour une page, vérifier l'identité avant de charger ses données et rediriger ou afficher l'état non autorisé selon le comportement existant. Pour une mutation, revérifier identité, entrées et permissions dans l'opération serveur.

Exemple conceptuel de lecture isolée :

```ts
const transactions = await prisma.transaction.findMany({
  where: { userId: authenticatedUser.id },
});
```

Pour une création, dériver le propriétaire de la session côté serveur; ignorer ou rejeter un `userId` arbitraire du navigateur. Pour lire, modifier ou supprimer une ressource, inclure son propriétaire dans le filtre et contrôler les relations. Si aucune ligne n'est trouvée, ne pas divulguer l'existence d'une ressource privée.

## Isolation des données financières

Règle inviolable : chaque utilisateur accède uniquement à ses propres transactions, budgets, catégories, statistiques et profil. Vérifier la propriété à chaque lecture et mutation, y compris lorsqu'un identifiant est non devinable.

- Filtrer les requêtes et opérations Prisma par l'utilisateur authentifié.
- Vérifier qu'une catégorie ou une transaction associée appartient aussi à cet utilisateur.
- Ne pas laisser un client choisir un autre propriétaire via champs cachés ou paramètres d'URL.
- Ne pas compter sur le filtrage visuel, le middleware seul ou la validation d'un formulaire.
- S'assurer que les agrégations et statistiques sont également limitées à l'utilisateur.
- Ne pas mettre en cache publiquement des données privées, même si les pages sont rendues côté serveur.

## Secrets, mots de passe et informations sensibles

- Utiliser les variables d'environnement; ne pas les committer, exposer au navigateur ou afficher dans les logs.
- Les variables exposées volontairement au client ne doivent contenir aucun secret.
- Si l'application stocke des mots de passe, utiliser une stratégie de hachage adaptée déjà approuvée; ne jamais stocker de mot de passe en clair ni inventer un algorithme maison.
- Traiter les sessions, jetons, identifiants et informations financières comme sensibles.
- Retourner des messages d'erreur minimaux à l'utilisateur; journaliser sans secrets, mots de passe, jetons ni données financières personnelles superflues.
- Valider et normaliser les entrées côté serveur et utiliser les requêtes paramétrées fournies par les APIs reconnues.

## Scénarios de test

Adapter les tests aux outils déjà présents, sans imposer de dépendance :

1. Un utilisateur authentifié lit uniquement ses transactions.
2. L'accès d'un utilisateur aux transactions d'un autre est refusé côté serveur.
3. Un utilisateur non connecté ne peut ni charger le dashboard ni appeler ses mutations.
4. La modification d'un budget appartenant à un autre compte est refusée.
5. La suppression d'une transaction d'un autre compte est refusée.
6. Un identifiant de catégorie appartenant à un autre utilisateur ne peut pas être lié.
7. Les statistiques ne contiennent que les données du compte courant.
8. Les erreurs ne divulguent pas l'existence d'un compte, un secret ou des détails de base de données.

Tester les refus, pas seulement le parcours nominal. Toute violation doit être bloquée côté serveur.

## Erreurs à éviter

- Confondre une session valide avec l'autorisation sur chaque ressource.
- Accepter un propriétaire envoyé par le client ou se fier à un bouton masqué.
- Protéger la page mais oublier une Server Action, un Route Handler ou un service.
- Exposer une donnée financière dans cache partagé, logs, erreurs ou props non nécessaires.
- Inventer une configuration Auth.js ou un fournisseur absent du projet.

## Checklist

- [ ] Version et configuration Auth.js réelles ont été vérifiées.
- [ ] Identité et autorisations sont contrôlées côté serveur à chaque opération sensible.
- [ ] Toute requête est isolée par l'utilisateur authentifié, y compris relations et agrégations.
- [ ] Les accès anonymes et inter-comptes sont refusés côté serveur.
- [ ] Aucun secret ou renseignement privé n'est exposé au navigateur ou aux logs.
- [ ] Les entrées non fiables et erreurs sont traitées avec prudence.
- [ ] Aucune donnée privée n'est publiquement mise en cache.
- [ ] Les scénarios positifs et négatifs ont été réellement testés et rapportés.
