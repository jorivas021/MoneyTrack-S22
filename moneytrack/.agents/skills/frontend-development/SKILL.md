---
name: frontend-development
description: Use when implementing or reviewing MoneyTrack pages, layouts, React components, forms, charts, responsive styling, or frontend behavior with Next.js App Router, TypeScript, Tailwind CSS, Lucide React, SweetAlert2, or Recharts.
---

# Frontend Development — MoneyTrack

## Objectif et règles applicables

Concevoir des interfaces MoneyTrack accessibles, cohérentes et performantes. Lire et respecter `AGENTS.md` avant d'intervenir. Cette skill complète ces consignes et ne les remplace pas. Ses exemples sont pédagogiques : ils ne signifient pas que les paquets ou les composants cités sont déjà installés ou présents.

Ne pas ajouter de fonctionnalités hors du MVP utilisateur, modifier le périmètre d'un autre membre, déplacer l'architecture ou installer une dépendance sans autorisation et coordination nécessaires.

## Technologies et architecture

- Next.js App Router, React, TypeScript et Tailwind CSS.
- `lucide-react` exclusivement pour les icônes; `sweetalert2` pour les alertes et confirmations; Recharts pour les graphiques.
- `app/` porte les conventions du framework : `page.tsx` déclare une page, `layout.tsx` partage une interface entre ses segments. Les Route Groups, par exemple `(public)` ou `(auth)`, organisent les routes sans ajouter leur nom à l'URL.
- `components/ui/` héberge les contrôles visuels génériques; `components/layout/`, les éléments de structure comme la navigation; `components/shared/`, les composants transversaux.
- `features/<domaine>/components/` héberge les composants attachés à un domaine; éviter d'y dupliquer un composant générique.
- Garder la logique métier et les accès aux données côté serveur, dans les emplacements définis par l'architecture.

Avant d'utiliser une API Next.js, consulter les guides fournis avec la version réellement installée, comme demandé par le bloc généré dans `AGENTS.md`. Ne pas déduire une API de mémoire si la documentation locale indique une différence.

## Rendu et composants App Router

Les composants sont des Server Components par défaut. Ils conviennent au rendu initial et à la récupération de données côté serveur. Un Client Component est nécessaire pour les interactions navigateur, l'état React, les événements ou certaines bibliothèques visuelles.

- Ajouter `"use client"` au point d'entrée client le plus étroit possible; tout son graphe d'import devient client.
- Ne jamais transmettre de secrets, accès base de données ou fonctions serveur au navigateur.
- Garder une frontière claire entre données sérialisables du serveur et interactions client.
- Utiliser `next/link` pour la navigation déclarative et `next/navigation` pour les redirections ou la navigation impérative dans les composants adaptés.
- Utiliser `loading.tsx` pour l'état de chargement d'un segment et `error.tsx` pour une frontière d'erreur client conforme aux conventions de la version installée.
- La page d'accueil publique est SSG; Conseils/FAQ est ISR; le dashboard personnalisé est SSR et ne doit jamais exposer de données privées par cache public.
- Vérifier les règles de cache et de fraîcheur de données du Next.js installé; ne pas appliquer un cache partagé à du contenu financier utilisateur.

## TypeScript et composants

Donner des noms explicites, définir les propriétés publiques et représenter honnêtement les valeurs absentes avec `null` ou `undefined`. Réutiliser les types de domaine, sans utiliser `any` pour contourner une erreur. Ne transformer une valeur externe qu'après validation.

Exemple pédagogique :

```tsx
interface BalanceCardProps {
  label: string;
  amount: number;
  currency: "XAF";
}

export function BalanceCard({
  label,
  amount,
  currency,
}: BalanceCardProps) {
  return (
    <section aria-label={label}>
      <h2>{label}</h2>
      <p>{new Intl.NumberFormat("fr-FR").format(amount)} {currency}</p>
    </section>
  );
}
```

Le formatage ci-dessus n'est pas une règle d'arrondi ni une représentation de stockage monétaire. Utiliser les types et formats de montant établis côté domaine; ne pas faire de calculs financiers en flottants sans justification.

## Tailwind, identité visuelle et accessibilité

Respecter la palette : bleu marine `#14213D`, vert `#16A36A`, rouge doux `#E85D5D`, fond `#F5F7FA`, blanc `#FFFFFF`. Utiliser Inter ou Manrope si la police est configurée. Ne pas introduire une palette ou une police contradictoire.

- Composer des classes Tailwind responsives, lisibles et cohérentes avec les composants existants.
- Extraire un composant partagé lorsque cela évite une duplication réelle; ne pas abstraire une interface unique sans besoin.
- Prévoir petits écrans, états de focus visibles, contraste, labels explicites et navigation clavier.
- Utiliser les éléments HTML adaptés, associer les erreurs aux champs et annoncer les changements d'état lorsque nécessaire.
- Ne pas utiliser un emoji pour remplacer une icône fonctionnelle.

## Icônes Lucide React

N'utiliser aucune autre bibliothèque d'icônes, y compris Font Awesome et Heroicons. Exemple pédagogique :

```tsx
import { Pencil } from "lucide-react";

export function EditAction() {
  return (
    <button type="button" aria-label="Modifier">
      <Pencil aria-hidden="true" size={18} />
    </button>
  );
}
```

Une icône seule doit avoir un nom accessible. Vérifier si `lucide-react` est installé avant de l'importer; ne pas installer le paquet sans autorisation.

## Alertes et confirmations SweetAlert2

Utiliser SweetAlert2 pour les confirmations, suppressions, succès, erreurs et avertissements. Ces appels exigent un environnement client; ne pas importer le module dans du code serveur. Ne jamais utiliser `alert()` ou `confirm()` natifs.

Exemple pédagogique de confirmation :

```tsx
"use client";

import Swal from "sweetalert2";

export async function confirmDeletion(): Promise<boolean> {
  const result = await Swal.fire({
    title: "Supprimer cette transaction ?",
    text: "Cette action ne peut pas être annulée.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Supprimer",
    cancelButtonText: "Annuler",
  });

  return result.isConfirmed;
}
```

Cette confirmation n'est pas une autorisation : le serveur doit valider les entrées, l'identité, les droits et la propriété des données pour chaque mutation.

## Formulaires et états d'interface

Un formulaire doit fournir des libellés, des contraintes et des erreurs compréhensibles. Valider à nouveau côté serveur toutes les données soumises; la validation d'interface améliore l'expérience, mais ne sécurise pas l'opération.

Pour chaque chargement ou mutation, distinguer les états de chargement, réussite, erreur et absence de données. Désactiver les actions incompatibles pendant l'envoi, éviter les doubles soumissions et conserver un retour d'erreur exploitable sans exposer de détails internes.

## Graphiques Recharts

Utiliser Recharts seulement si le paquet est effectivement configuré et que le besoin justifie du code client. Construire des graphiques responsives, lisibles et correctement libellés, avec couleurs MoneyTrack, unités explicites, états vides et infobulles compréhensibles.

Exemple d'orientation (à adapter aux versions et données réelles) :

```tsx
<ResponsiveContainer width="100%" height={280}>
  <LineChart data={points}>
    <CartesianGrid stroke="#E5E7EB" />
    <XAxis dataKey="period" />
    <YAxis />
    <Tooltip />
    <Line dataKey="amount" stroke="#16A36A" />
  </LineChart>
</ResponsiveContainer>
```

Fournir au graphique des données agrégées explicitement autorisées; ne jamais supposer que des données privées peuvent être mises en cache ou calculées dans un composant client. Adapter les imports et types à la version installée.

## Performance et ressources

- Limiter la surface client et les bibliothèques lourdes; éviter les états globaux inutiles et les re-renders coûteux.
- Utiliser `next/image` pour les images lorsque cela convient au type de ressource et à la configuration Next.js; ne pas l'appliquer à des icônes SVG React.
- Privilégier la composition, des listes de taille raisonnable et des données déjà limitées côté serveur.
- Garder les contrôles accessibles et fonctionnels même si une animation ou un graphique échoue.

## Erreurs à éviter

- Ajouter `"use client"` au layout ou à la page entière par facilité.
- Faire confiance à une validation client, masquer un bouton ou demander confirmation comme seul contrôle d'autorisation.
- Afficher un emoji à la place d'une icône, appeler `alert()`/`confirm()`, ou introduire une autre librairie visuelle.
- Cacher des données financières privées publiquement, utiliser des montants flottants sans politique de précision, ou inventer des données réelles.
- Employer une API Next.js, une dépendance ou un pattern qui ne correspond pas à la version réellement présente.

## Checklist

- [ ] `AGENTS.md` et l'architecture existante ont été respectés.
- [ ] Server Component par défaut; frontière client limitée et justifiée.
- [ ] Typage explicite, gestion des valeurs absentes, aucune utilisation injustifiée de `any`.
- [ ] Couleurs, police, responsive et accessibilité conformes.
- [ ] Icônes Lucide exclusivement; messages interactifs via SweetAlert2.
- [ ] Validation, authentification et autorisation restent garanties côté serveur.
- [ ] SSG/ISR/SSR et cache respectent la confidentialité du contenu.
- [ ] États vide, chargement, succès et erreur sont traités.
- [ ] Dépendances et versions ont été vérifiées; aucun paquet n'a été ajouté sans autorisation.
- [ ] Les vérifications disponibles ont réellement été exécutées et leurs résultats rapportés.
