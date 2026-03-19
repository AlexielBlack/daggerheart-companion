# Table UX Redesign — Spec de Design

**Date :** 2026-03-19
**Auteur :** Violet
**Statut :** En attente de validation

---

## Contexte & Problème

La section Table actuelle est organisée par **type de donnée** (PJs, PNJs, Rencontres, Combat, Dés) au lieu de **workflow MJ**. En jeu, le MJ a besoin d'accéder simultanément aux PNJs, environnements, fiches PJ et notes narratives — répartis sur plusieurs onglets. Les outils de préparation inter-session (builders, catalogue) sont mélangés avec les outils de jeu en cours.

### Besoins identifiés

| Priorité | Besoin | État actuel |
|----------|--------|-------------|
| En jeu (critique) | Accès rapide fiches PNJs | Onglet dédié, séparé de l'environnement |
| En jeu (critique) | Environnement actif visible | Enfoui dans l'onglet Rencontres |
| En jeu (critique) | Notes narratives / fil d'histoire | `sessionStore.sessionNotes` existe, aucun UI |
| En jeu (important) | Consulter fiche PJ (stats + capacités) | Ouvre le CharacterBuilder complet |
| En jeu (important) | Générer une rencontre rapidement | Templates seulement, pas de générateur |
| En jeu (secondaire) | Catalogue PNJ complet | Fonctionnel mais dans le même onglet que le jeu |
| Inter-session | Montée de niveau PJs | Pas de workflow dédié (futur) |

---

## Nouvelle structure de navigation

### Onglets

```
🎭 Scène | ⚔️ Combat | 🎲 Dés | 📋 Préparation
```

Passe de 5 onglets orientés données à 4 onglets orientés workflow.

### Routes

```
/table              → redirect /table/scene
/table/scene        → SceneView (nouveau)
/table/combat       → TableCombatView (existant, modifié)
/table/des          → DiceRoller (existant, inchangé)
/table/prep         → redirect /table/prep/personnages
/table/prep/personnages  → CharacterBuilder (existant)
/table/prep/pnjs         → NpcManager (existant)
/table/prep/rencontres   → EncounterBuilder (existant)
/table/prep/historique   → EncounterHistory (existant)
```

### Redirections legacy

```
/table/pjs         → /table/prep/personnages
/table/pnjs        → /table/scene
/table/rencontres  → /table/prep/rencontres
/edition/*         → /table/prep/* (correspondances existantes à mettre à jour)
/jeu/*             → /table/* (correspondances existantes à mettre à jour)
```

---

## SceneView — Vue principale en jeu

### Layout

```
┌─────────────────────────────────────────────────┐
│ 🌍 Forêt de Grimveil (Tier 2 · Naturel)    [✏️]│  ← EnvironmentLoader
│ « Brume épaisse, sol spongieux... »             │
├─────────────────────────────────────────────────┤
│ 👤 PNJs en scène          [+ Ajouter] [📋 Tout]│  ← NpcLoader chips
│ [🟢 Kaelen] [🔴 Vrak] [⚪ Mira]               │     clic → drawer fiche
│                                                 │     [📋 Tout] → drawer catalogue
├─────────────────────────────────────────────────┤
│ 🧙 Groupe                                      │  ← PcGroupPanel compact
│ [Lyra ❤️12/16] [Thane ❤️8/14] [Zara ❤️14/14]  │     clic → drawer stats+capacités
├─────────────────────────────────────────────────┤
│ 📝 Notes de scène                          [⛶] │  ← SessionNotes (nouveau)
│ > Le groupe cherche l'artefact de Kaelen        │
│ > Révéler la trahison de Mira après le temple   │
├─────────────────────────────────────────────────┤
│ ⚔️ Rencontre rapide                             │  ← EncounterLauncher simplifié
│ [Lancer sauvegardée ▾]  [⚡ Générer]           │     + bouton générateur
└─────────────────────────────────────────────────┘
```

### Composition

`SceneView` est une vue composant qui orchestre des composants existants et nouveaux :

- `EnvironmentLoader` — existant, inchangé
- `NpcLoader` — existant, modifié (clic chip → émet événement au lieu de naviguer)
- `PcGroupPanel` — existant, modifié (clic carte → émet événement)
- `SessionNotes` — **nouveau**
- `EncounterLauncher` — existant, simplifié (retrait du builder, ajout bouton générateur)
- `SceneDrawer` — **nouveau**, panneau latéral partagé

---

## SceneDrawer — Panneau latéral

### Comportement

- **Position :** coulisse depuis la droite
- **Largeur :** ~400px desktop, plein écran mobile (<768px)
- **Fermeture :** bouton ✕, clic overlay, touche Escape (le keydown Escape est capturé au niveau du drawer inconditionnellement — les composants enfants ne consomment pas Escape)
- **Transition :** remplacement du contenu sans fermer/rouvrir
- **Mode :** lecture seule — bouton [✏️ Éditer] redirige vers Préparation

### 3 modes de contenu

#### Mode 1 — Fiche PNJ

Déclenché par clic sur chip PNJ dans la Scène ou dans le Combat.

Contenu affiché :
- Nom, statut (Allié/Neutre/Hostile/Mort/Disparu), titre
- Faction, lieu
- Description
- Relations PJ
- Profil combat (si hostile)
- Bouton [✏️ Éditer → Préparation]

#### Mode 2 — Fiche PJ rapide

Déclenché par clic sur carte PJ dans le bandeau Groupe.

Contenu affiché :
- Nom, classe, sous-classe, tier
- Stats vitales : HP courants/max, Stress courants/max, Armure, Espoir
- Seuils : Évasion, Seuil majeur/sévère
- Cartes de domaine actives (loadout) — nom + description courte
- Capacités de sous-classe — nom + description
- Bouton [✏️ Éditer → Préparation]

Ce qui n'est PAS affiché : inventaire, armes, historique, section création.

#### Mode 3 — Catalogue PNJ

Déclenché par bouton [📋 Tout] dans la section PNJs.

Contenu :
- Barre de recherche (nom, titre, faction, lieu)
- Liste complète des PNJs avec badge statut
- Clic sur un PNJ → bascule en Mode 1 avec bouton [← Retour à la liste]

Réutilise la logique du `NpcManager` existant pour la recherche et le filtrage.

---

## SessionNotes — Nouveau composant

**Fichier :** `src/modules/session/components/SessionNotes.vue`

### Fonctionnement

- `<textarea>` simple (pas d'éditeur riche)
- Lié à `sessionStore.sessionNotes` (existe déjà dans le store)
- Auto-save via debounce (~500ms) — le store persiste en localStorage via `useStorage`
- Toggle hauteur compacte (~4 lignes) / étendue (~12 lignes) via bouton [⛶]
- Placeholder : "Quêtes, secrets, rappels..."

### Ce qui est exclu

- Rendu markdown
- Historique / versioning
- Notes multiples / onglets

---

## Générateur de rencontres contextuel

### Accès

Bouton [⚡ Générer] dans la zone "Rencontre rapide" de SceneView. S'ouvre dans le SceneDrawer.

### Étape 1 — Paramètres

```
┌──────────────────────────┐
│ ✕  Générer une rencontre │
│──────────────────────────│
│ Tier : [Auto (T2) ▾]    │
│ Thème : [▾ Choisir]     │
│   · Embuscade            │
│   · Créatures sauvages   │
│   · Bandits / Pillards   │
│   · Mort-vivants         │
│   · Gardiens / Boss      │
│   · Aléatoire            │
│ Difficulté :             │
│  [Facile] [Standard] [Difficile] │
│ PJs : 3 (auto-détecté)  │
│ [⚡ Générer]             │
└──────────────────────────┘
```

**Pré-remplissage contextuel :**
- **Tier :** déduit de l'environnement chargé, sinon tier moyen des PJs, sinon manuel
- **PJs :** `characterStore.characters.length`, automatique
- **Thèmes :** dérivés des `genres` existants sur les adversaires du catalogue (voir mapping dans la section Algorithme)

### Étape 2 — Résultat

Affiche la rencontre générée avec :
- Nom auto-généré (thème + environnement)
- Budget BP et validation
- Liste des adversaires avec quantité, rôle, coût BP
- Actions : [🔄 Régénérer], [⚔️ Lancer le combat], [💾 Sauvegarder], [✏️ Modifier → Prep]

### Algorithme — composable `useEncounterGenerator`

**Fichier :** `src/modules/encounter/composables/useEncounterGenerator.js`

1. **Calculer le budget BP** via `calculateBaseBattlePoints(pcCount)` existant dans `@data/encounters/constants`, puis appliquer un modificateur de difficulté via les constantes `SCENE_INTENSITY` existantes :
   - Facile : intensité basse (budget réduit)
   - Standard : intensité normale (budget de base)
   - Difficile : intensité haute (budget augmenté)
2. **Filtrer les adversaires** du `adversaryStore` par :
   - Tier (tier cible ± 1)
   - Genre (`genres`) correspondant au thème choisi — mapping explicite :
     - Créatures sauvages → `bete`
     - Bandits / Pillards → `humanoide`
     - Mort-vivants → `mort-vivant`
     - Gardiens / Boss → filtrage par type `Leader` ou `Boss` (tous genres)
     - Embuscade → filtrage par type `Skulk` ou `Ranged` (tous genres)
     - Aléatoire → pas de filtre genre
3. **Assemblage contraint :**
   - Sélectionner 1 adversaire Standard ou Leader comme menace principale
   - Compléter le budget avec Minions (groupes de pcCount = 1 BP) et Standards
   - Maximum 1 Leader par rencontre
   - Appliquer `calculateTierAdjustedCost` existant pour le coût
4. **Randomisation :** tirage aléatoire parmi les adversaires éligibles à chaque slot

### Contraintes

- **Aucune donnée inventée** — pioche exclusivement dans `adversaryStore` (SRD + homebrew)
- Utilise les fonctions de coût BP existantes (`calculateTierAdjustedCost`)
- Respecte les ratios SRD (Minions groupés par pcCount)

---

## Modifications Combat

### Ajout PNJs session dans ContextPanel

Dans `EncounterLive.vue`, le `ContextPanel` existant reçoit une nouvelle section "PNJs en scène" :
- Liste les `sessionStore.loadedNpcs` en chips lecture seule
- Clic chip → ouvre le SceneDrawer avec la fiche PNJ (Mode 1)
- Le SceneDrawer doit être disponible aussi depuis l'onglet Combat

### SceneDrawer dans le Combat

`SceneDrawer` est monté dans `TableCombatView.vue` (à côté de `EncounterLive`), pas dans `EncounterLive` lui-même. L'état du drawer (ouvert/fermé, mode, ID sélectionné) est géré par un composable `useSceneDrawer` partagé entre `SceneView` et `TableCombatView`.

### Bouton retour Scène

Lien "← Retour à la Scène" (`/table/scene`) ajouté en haut de `TableCombatView.vue`, au-dessus de `EncounterLive`. Pas dans `CombatResumeBanner` (qui est affiché sur les *autres* onglets pour reprendre un combat).

---

## Onglet Préparation

### Layout

```
┌─────────────────────────────────────────────────┐
│ [Personnages] [PNJs] [Rencontres] [Historique]  │  ← sous-tabs
├─────────────────────────────────────────────────┤
│         <contenu du sous-tab actif>             │
└─────────────────────────────────────────────────┘
```

### Contenu

Ré-hébergement des composants existants sans modification :

| Sous-tab | Route | Composant |
|----------|-------|-----------|
| Personnages | `/table/prep/personnages` | `CharacterBuilder` |
| PNJs | `/table/prep/pnjs` | `NpcManager` |
| Rencontres | `/table/prep/rencontres` | `EncounterBuilder` |
| Historique | `/table/prep/historique` | `EncounterHistory` |

### Montée de niveau (hors scope)

Sera un futur sous-tab ou une section du sous-tab Personnages.

### Navigation sous-tabs

L'état du sous-tab actif est piloté par l'URL (Vue Router). Naviguer vers un autre onglet puis revenir restaure le dernier sous-tab via l'URL du navigateur. La redirection `/table/prep` → `/table/prep/personnages` ne s'applique que lors d'un accès direct à `/table/prep` (pas de mémorisation en mémoire).

---

## Composants — Résumé création/modification

### Nouveaux composants

| Composant | Fichier | Rôle |
|-----------|---------|------|
| `SceneView` | `src/modules/session/views/SceneView.vue` | Vue principale onglet Scène |
| `PrepView` | `src/modules/session/views/PrepView.vue` | Vue conteneur onglet Préparation |
| `SceneDrawer` | `src/modules/session/components/SceneDrawer.vue` | Panneau latéral 3 modes |
| `NpcPreviewSheet` | `src/modules/session/components/NpcPreviewSheet.vue` | Fiche PNJ lecture seule (drawer mode 1) |
| `PcQuickSheet` | `src/modules/session/components/PcQuickSheet.vue` | Fiche PJ rapide (drawer mode 2) |
| `SessionNotes` | `src/modules/session/components/SessionNotes.vue` | Notes de scène textarea |
| `EncounterGenerator` | `src/modules/session/components/EncounterGenerator.vue` | UI générateur dans drawer |
| `useEncounterGenerator` | `src/modules/encounter/composables/useEncounterGenerator.js` | Logique génération rencontre |
| `useSceneDrawer` | `src/modules/session/composables/useSceneDrawer.js` | État partagé du drawer (mode, ID, ouvert/fermé) |

### Composants modifiés

| Composant | Modification |
|-----------|-------------|
| `TableView.vue` | 4 onglets au lieu de 5, nouvelles routes |
| `NpcLoader.vue` | Clic chip émet événement `@select-npc` au lieu de naviguer. Mettre à jour le router-link empty-state : `/table/pnjs` → `/table/prep/pnjs` |
| `PcGroupPanel.vue` | Clic carte émet événement `@select-pc` au lieu de router. Mettre à jour les `router-link` internes : `/table/pjs` → `/table/prep/personnages` (édition + empty-state création) |
| `EncounterLauncher.vue` | Simplifié (retrait builder inline), ajout bouton [⚡ Générer]. Conserver le lien "Ouvrir le constructeur" en pointant vers `/table/prep/rencontres`. Mettre à jour le lien empty-state : `/table/rencontres` → `/table/prep/rencontres` |
| `ContextPanel` (encounter) | Ajout section PNJs session, clic chip émet événement vers `TableCombatView` |
| `TableCombatView.vue` | Ajout `SceneDrawer` + lien retour Scène en haut + intégration `useSceneDrawer` |
| `CombatResumeBanner.vue` | Inchangé (conserve son rôle sur les autres onglets) |
| `router/index.js` | Nouvelles routes + redirections legacy |

### Composants supprimés (fusionnés)

| Composant | Raison |
|-----------|--------|
| `TablePjsView.vue` | Remplacé par SceneView (PJs) + PrepView (builder) |
| `TablePnjsView.vue` | Remplacé par SceneView (PNJs) + PrepView (catalogue) |
| `TableRencontresView.vue` | Remplacé par SceneView (launcher) + PrepView (builder) |

`TableCombatView.vue` est conservé.

---

## Stores — Aucun nouveau store

- `sessionStore` — existant, déjà fonctionnel (`sessionNotes`, `loadedNpcIds`, `environmentId`)
- `adversaryStore` — existant, utilisé par le générateur
- `characterStore` — existant, utilisé par PcQuickSheet et le générateur
- `npcStore` — existant, utilisé par NpcPreviewSheet et le catalogue

Le composable `useEncounterGenerator` n'est pas un store — c'est une fonction pure qui consomme les stores existants.

---

## Accessibilité

- `SceneDrawer` : `role="dialog"`, `aria-modal="true"`, focus trap, fermeture Escape
- Sous-tabs Préparation : `role="tablist"` + `role="tab"` + `role="tabpanel"`
- `SessionNotes` : `<label>` associé au textarea, `aria-expanded` pour le toggle
- Conservation des attributs ARIA existants sur tous les composants réutilisés

---

## Hors scope

- Workflow montée de niveau guidé
- Rendu markdown des notes
- Notes multiples / structurées
- Génération narrative IA
- Nouveaux adversaires générés (hors catalogue)
- Modifications du Compendium
- Modifications du DiceRoller
