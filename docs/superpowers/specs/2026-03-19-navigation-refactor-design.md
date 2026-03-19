# Navigation Refactor — Spec de design

**Date :** 2026-03-19
**Statut :** Validé
**Auteur :** Violet

## Contexte et problème

La navigation actuelle repose sur 3 modes mutuellement exclusifs (Lecture / Édition / Jeu) avec un `ModeSelector` et un `AppNav` dynamique. Cela engendre :

- **Profondeur excessive** : 3 clics minimum pour atteindre une section (mode → nav → page)
- **Cloisonnement artificiel** : le contenu Lecture (browsers SRD) et Édition (homebrew) concerne les mêmes entités, séparées sans raison fonctionnelle
- **Perte de contexte** : changer de mode ramène toujours à une route par défaut

## Vision

Navigation plate à 3 entrées : **Compendium / Table / Sync**. Suppression totale des modes. Unification SRD + homebrew dans le Compendium. Centralisation de tous les outils de jeu (personnages, PNJs, rencontres, combat, dés) dans la Table.

## Architecture cible

### 1. Header simplifié

```
🗡️ DC    [Compendium]  [Table]  [Sync]           🎲
```

- Logo à gauche, 3 liens au centre, raccourci dés à droite
- `ModeSelector` supprimé
- `AppNav` réduit à 3 items statiques — plus de `MODE_NAV`, plus de dropdowns
- `route.meta.mode` supprimé
- `route.meta.module` conservé — utilisé par `ModuleBoundary` pour les error boundaries
- `MODE_NAV` et `NAV_ITEMS` dans `constants.js` supprimés — remplacés par 3 liens statiques dans `AppNav`
- L'icône 🔄 Sync est retirée du header (redondante avec le lien Sync dans la nav)
- Sur mobile : hamburger avec 3 liens, pas de dropdown

**Template `AppShell` cible :**

```
<header>
  <button class="menu-toggle" @click="toggleNav">☰</button>  <!-- mobile -->
  <router-link to="/" class="logo">🗡️ DC</router-link>
  <AppNav />                                                    <!-- 3 liens -->
  <router-link to="/table/des" class="shortcut">🎲</router-link>
</header>
<main id="main-content">
  <router-view />
</main>
```

### 2. Compendium (`/compendium`)

Page unique avec 7 onglets correspondant aux catégories d'entités.

**Sous-routes :**

```
/compendium              → redirige vers /compendium/adversaires
/compendium/adversaires
/compendium/environnements
/compendium/classes
/compendium/domaines
/compendium/ascendances
/compendium/communautes
/compendium/equipement
```

**Layout :**

```
[Adversaires] [Environnements] [Classes] [Domaines] [Ascendances] [Communautés] [Équipement]

┌────────────────────────────────┬───────────────────────────────────┐
│ 🔍 Recherche    [Filtres]      │ Panneau de détail                │
│ [+ Créer un custom]           │                                   │
├────────────────────────────────┤ (lecture seule SRD               │
│ Liste unifiée SRD + homebrew  │  ou édition inline homebrew)      │
│                                │                                   │
│ ⚔️ Loup des cendres    SRD   │                                   │
│ ⚔️ Mon dragon      CUSTOM ✏️ │                                   │
└────────────────────────────────┴───────────────────────────────────┘
```

**Comportement :**

- Liste unifiée SRD + homebrew avec badge visuel (tag "CUSTOM")
- Filtre rapide : Tous / SRD / Custom
- Clic sur item SRD → détail lecture seule dans le panneau droit
- Clic sur item custom → détail avec bouton "Modifier" → édition inline dans le panneau
- Bouton "+ Créer" → panneau droit en mode formulaire vide
- Les composants browser existants nécessitent un refactoring moyen : extraire la logique liste/filtres/détail de chaque browser pour l'intégrer dans le layout unifié du Compendium. La logique métier et les stores restent inchangés, mais la couche présentation est restructurée.
- Deep-linking homebrew : `/compendium/adversaires/:id` affiche directement l'item dans le panneau de détail (mode édition si custom, lecture si SRD). Ceci permet de partager des URLs vers des items spécifiques.

### 3. Table de jeu (`/table`)

Hub central avec 5 onglets internes.

**Sous-routes :**

```
/table                   → redirige vers /table/pjs
/table/pjs
/table/pnjs
/table/rencontres
/table/combat
/table/des
```

**Layout :**

```
┌──────────────────────────────────┬──────────────────────────────┐
│ Zone principale                  │ Panneau contextuel           │
│ (contenu selon onglet actif)     │ (détail PJ/PNJ/rencontre)   │
│                                  │                               │
└──────────────────────────────────┴──────────────────────────────┘
  [🧙 PJs] [👤 PNJs] [⚔️ Renc.] [🎯 Combat] [🎲 Dés]
```

**Comportement :**

- **PJs** : liste des personnages + ajout/édition (reprend CharacterBuilder)
- **PNJs** : gestion des PNJs (reprend NpcManager)
- **Rencontres** : liste + création/édition (reprend EncounterBuilder)
- **Combat** : combat live — intègre la vue EncounterLive complète (BattlefieldOverview, FearHopeTracker, CombatDashboard, ContextPanel, BottomDrawer). Le panneau contextuel affiche le tracker d'initiative et les détails de la créature sélectionnée.
- **Dés** : lanceur de dés (reprend DiceRoller)
- Panneau contextuel à droite (~40% largeur), s'ouvre au clic sur un élément (PJ, PNJ, rencontre). Un seul panneau ouvert à la fois. Fermeture par bouton ✕ ou Escape. Composant partagé `TableContextPanel` avec contenu dynamique selon l'onglet actif.

**Réutilisation :**

- La logique métier de chaque vue existante (CharacterBuilder, NpcManager, EncounterBuilder, EncounterLive, DiceRoller) est conservée
- Les stores de données restent inchangés ; `appStore.setActiveModule()` sera mis à jour pour fonctionner avec les nouvelles valeurs `meta.module`
- La présentation est restructurée en composants intégrés à TableView
- **LevelUp** : reste intégré dans le flux PJs (accessible depuis la fiche personnage), pas d'onglet dédié
- **SessionHome** actuel est décomposé : PcGroupPanel → onglet PJs, EncounterLauncher → onglet Rencontres, NpcLoader → onglet PNJs, EnvironmentLoader → onglet Rencontres (contexte), CombatResumeBanner → onglet Combat, SessionHistoryPanel → supprimé ou intégré dans le panneau contextuel

### 4. Sync (`/sync`)

Inchangé fonctionnellement. Accessible depuis le lien Sync dans la nav principale (l'icône 🔄 du header est supprimée car redondante).

### 5. Routes complètes

```
/                        → redirige vers /compendium
/compendium              → redirige vers /compendium/adversaires
/compendium/adversaires
/compendium/environnements
/compendium/classes
/compendium/domaines
/compendium/ascendances
/compendium/communautes
/compendium/equipement
/table                   → redirige vers /table/pjs
/table/pjs
/table/pnjs
/table/rencontres
/table/combat
/table/des
/sync
```

= 13 routes pages + 3 redirects internes. Les deep-links `/:id` sont des variantes paramétrées des 7 routes Compendium (même composant, param optionnel), pas des routes séparées.

**Route 404 :** `/:pathMatch(.*)*` → NotFound (conservée telle quelle).

**Deep-links Compendium :** chaque onglet supporte `/:id` optionnel :

```
/compendium/adversaires/:id   → ouvre l'item dans le panneau détail
/compendium/classes/:id       → idem
... (même pattern pour les 7 catégories)
```

### 6. Composants supprimés

- `ModeSelector` — plus de modes
- `MODE_NAV` dans `constants.js` — remplacé par 3 liens statiques
- `HomebrewHub` — gateway supprimée
- Les 7 vues HomebrewList/HomebrewEditor séparées — intégrées au Compendium
- Les routes `/lecture/*`, `/edition/*`, `/jeu/*` deviennent des redirects legacy :

**Table de correspondance legacy :**

| Ancienne route | Nouvelle route |
|---|---|
| `/lecture/adversaires` | `/compendium/adversaires` |
| `/lecture/environnements` | `/compendium/environnements` |
| `/lecture/classes` | `/compendium/classes` |
| `/lecture/domaines` | `/compendium/domaines` |
| `/lecture/ascendances` | `/compendium/ascendances` |
| `/lecture/communautes` | `/compendium/communautes` |
| `/lecture/equipement` | `/compendium/equipement` |
| `/edition/personnages` | `/table/pjs` |
| `/edition/rencontres` | `/table/rencontres` |
| `/edition/pnjs` | `/table/pnjs` |
| `/edition/homebrew` | `/compendium` |
| `/edition/homebrew/adversary` | `/compendium/adversaires` |
| `/edition/homebrew/ancestry` | `/compendium/ascendances` |
| `/edition/homebrew/class` | `/compendium/classes` |
| `/edition/homebrew/community` | `/compendium/communautes` |
| `/edition/homebrew/domain` | `/compendium/domaines` |
| `/edition/homebrew/environment` | `/compendium/environnements` |
| `/edition/homebrew/equipment` | `/compendium/equipement` |
| `/edition/sync` | `/sync` |
| `/jeu/table` | `/table` |
| `/jeu/combat` | `/table/combat` |
| `/jeu/des` | `/table/des` |
| Anciennes routes anglaises (`/adversaries`, etc.) | Vers les nouvelles routes correspondantes |

## Responsive

### Tablette paysage 13" (cible principale)

- Header fin, une seule ligne
- Compendium et Table : layout deux colonnes (liste/onglets + panneau contextuel)
- Panneau contextuel ~40% de la largeur

### Desktop

- Identique à tablette, le contenu s'étire naturellement

### Mobile portrait

- Header : logo + hamburger + 🎲
- Menu hamburger = 3 liens, pas de dropdown
- Onglets scrollables horizontalement
- Panneau détail/contextuel en overlay/modal

## Accessibilite

- Skip link "Aller au contenu principal" — inchangé
- Onglets Compendium et Table : `role="tablist"` / `role="tab"` / `aria-selected`
- Panneau contextuel : `role="complementary"`, `aria-label` descriptif
- Navigation header : `role="navigation"` (simplifié, plus de `menubar`)
- Items homebrew éditables : `aria-label` incluant "modifier"

## Hors scope

- Toasts, `ModuleBoundary`, `ConfirmDialog`, `PwaBanner` — inchangés
- Stores Pinia — inchangés
- Logique métier des browsers/builders — conservée, présentation adaptée
