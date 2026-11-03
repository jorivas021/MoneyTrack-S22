---
name: backend-database
description: Use when designing or changing MoneyTrack server-side business logic, feature services, data validation, PostgreSQL, Prisma models or queries, migrations, or Next.js server operations.
---

# Backend and Database — MoneyTrack

## Objectif et portée

Guider l'implémentation serveur des domaines MoneyTrack : revenus, dépenses, transactions, budgets, catégories et statistiques. Lire et appliquer `AGENTS.md` avant d'agir. Cette skill ne configure ni Prisma ni Auth.js à elle seule et ne remplace jamais le schéma réel par un exemple.

Respecter le périmètre utilisateur du MVP, les responsabilités de l'équipe et l'architecture en place. Ne pas installer de dépendance, lancer de migration destructive ou changer de contrat sans autorisation et coordination requises.

## Technologies et séparation des responsabilités

- Next.js côté serveur et TypeScript; PostgreSQL est la base relationnelle officielle.
- Prisma est l'ORM prévu, mais vérifier sa présence, sa version, sa configuration et la documentation locale avant tout usage.
- `features/<domaine>/services/` contient les opérations métier et l'accès aux données propres au domaine.
- `features/<domaine>/schemas/` définit les validations réutilisables des entrées.
- `features/<domaine>/types/` définit les types du domaine, sans dupliquer les types partagés.
- `lib/` contient utilitaires et configurations partagés.
- `prisma/` est réservé au schéma et aux migrations; `app/api/` contient les Route Handlers uniquement si une API HTTP est nécessaire.
- Un composant présente l'interface, un schéma valide des données et un service applique une opération métier sur des données validées.

Ne pas créer un endpoint par opération CRUD par réflexe : choisir une Server Action ou un Route Handler selon l'usage, la version de Next.js installée, les clients concernés et les conventions existantes.

## Services et erreurs

Un service accepte des entrées typées et déjà validées, applique les règles métier, contrôle les autorisations côté serveur et utilise la couche de données. Il ne dépend pas d'un composant React ou d'un état navigateur.

- Utiliser `async`/`await` et propager ou traduire les erreurs de manière explicite.
- Distinguer une validation invalide, une absence de ressource, un accès refusé et une erreur inattendue.
- Ne pas retourner un succès factice, capturer toutes les erreurs sans les traiter ou divulguer les détails internes.
- Limiter les données sélectionnées; éviter les requêtes N+1 et les lectures inutiles.
- Lier chaque lecture et mutation à l'utilisateur authentifié. Ne pas accepter un `userId` client comme preuve d'accès.

Exemple pédagogique, en supposant qu'un schéma validé et `requireUser()` existent réellement :

```ts
export async function createTransaction(input: CreateTransactionInput) {
  const user = await requireUser();
  const data = createTransactionSchema.parse(input);

  return prisma.transaction.create({
    data: {
      userId: user.id,
      amount: data.amount,
      type: data.type,
      description: data.description,
      categoryId: data.categoryId,
    },
  });
}
```

Les noms et objets montrés sont conceptuels. Vérifier l'API Auth.js, les modèles et les schémas réellement installés avant toute réutilisation.

## Validation des données

Valider chaque entrée non fiable côté serveur avant toute lecture ou mutation. Définir les champs requis, limites, longueurs, énumérations, formats et relations admises selon les besoins réels. Valider aussi les identifiants référencés et vérifier que la ressource liée appartient au même utilisateur.

Retourner des erreurs utiles et non sensibles; ne jamais interpréter l'absence de validation client comme une validation serveur. Réutiliser une validation centrale lorsqu'elle existe plutôt que de réécrire des règles divergentes.

## PostgreSQL, Prisma et migrations

PostgreSQL stocke des données relationnelles persistantes; Prisma mappe des modèles TypeScript vers les opérations de base de données. Un schéma Prisma définit modèles, champs, contraintes, relations et enums. Les migrations versionnent les modifications du schéma et doivent être revues avant application.

- Centraliser le client Prisma dans l'emplacement partagé prévu, en respectant le pattern de l'environnement.
- Utiliser contraintes et relations pour renforcer l'intégrité, sans compter sur elles comme substitut à l'autorisation.
- Utiliser les transactions de base de données quand plusieurs écritures doivent réussir ou échouer ensemble.
- Vérifier le schéma actuel, les migrations et la version de Prisma avant de modifier ou de générer quoi que ce soit.
- Ne jamais exécuter une migration destructive ou modifier des données sans autorisation.

Exemple de modèles **conceptuel uniquement**; il n'est pas une migration ni une proposition de remplacer le schéma réel :

```prisma
model User {
  id           String        @id @default(cuid())
  transactions Transaction[]
  budgets      Budget[]
  categories   Category[]
}

model Category {
  id           String        @id @default(cuid())
  userId       String
  name         String
  user         User          @relation(fields: [userId], references: [id])
  transactions Transaction[]
  @@unique([userId, name])
}

model Transaction {
  id         String   @id @default(cuid())
  userId     String
  categoryId String?
  amount     Decimal  @db.Decimal(18, 2)
  type       String
  occurredAt DateTime
  user       User     @relation(fields: [userId], references: [id])
  category   Category? @relation(fields: [categoryId], references: [id])
}

model Budget {
  id        String   @id @default(cuid())
  userId    String
  amount    Decimal  @db.Decimal(18, 2)
  period    String
  user      User     @relation(fields: [userId], references: [id])
}
```

Les besoins de connexion Auth.js, les unités monétaires, contraintes, champs de dates et relations exacts doivent être décidés à partir du projet et validés par le Team Lead. Ne pas copier ces modèles dans le schéma réel sans validation architecturale.

## Montants et règles financières

Les données de démonstration sont en FCFA, mais ne pas inventer de données financières réelles ni supposer la règle de stockage ou d'arrondi. Fixer la précision et la devise avec le domaine avant de coder. Éviter les flottants binaires pour les sommes financières; privilégier une représentation exacte (par exemple Decimal côté base ou une unité entière adaptée si la règle métier l'autorise).

- Rejeter les valeurs non finies, nulles ou négatives lorsque la règle du champ l'exige.
- Définir explicitement signe et type revenu/dépense; ne pas déduire les soldes de conventions implicites.
- Calculer budgets et historiques sur des plages de dates et des catégories définies.
- Utiliser une transaction SQL lorsque la mise à jour d'une transaction entraîne plusieurs mutations liées.
- Tester arrondis, limites, fuseaux horaires et combinaisons de types selon les besoins spécifiés.

## Server Components, Server Actions et Route Handlers

Les Server Components rendent et chargent des données côté serveur, mais ne remplacent pas la validation d'autorisation dans chaque opération serveur. Les Server Actions traitent des mutations déclenchées par l'application; les Route Handlers exposent des routes HTTP pour les cas où un client ou un contrat HTTP l'exige.

Garder le code de base de données dans des modules serveur. Ne jamais l'importer dans un Client Component; ne retourner au navigateur que les champs nécessaires et sérialisables. Utiliser les primitives et protections adaptées à la version installée de Next.js.

## Erreurs à éviter

- Faire confiance à un `userId`, un montant ou un identifiant de catégorie fourni par le navigateur sans vérification.
- Lire ou modifier une ligne sans filtrer par propriétaire authentifié.
- Ajouter un modèle illustrative en production, une migration destructive ou une nouvelle dépendance sans validation.
- Calculer l'argent avec des flottants non maîtrisés, inventer des données ou retourner trop de champs.
- Appeler Prisma côté client, créer des APIs inutiles ou masquer les erreurs serveur.

## Checklist

- [ ] `AGENTS.md`, architecture et périmètre d'équipe sont respectés.
- [ ] Schéma, migrations, versions et documentation locale ont été inspectés.
- [ ] Entrées et relations sont validées côté serveur.
- [ ] Authentification, autorisation et propriété sont vérifiées pour chaque opération.
- [ ] Précision monétaire, devise, dates et règles métier sont explicites.
- [ ] Accès DB centralisés, requêtes limitées et mutations atomiques si nécessaire.
- [ ] Aucun secret ni accès DB ne passe au navigateur.
- [ ] Aucune configuration ou dépendance n'a été ajoutée implicitement.
- [ ] Types, lint, tests et build disponibles ont été réellement exécutés et rapportés.
