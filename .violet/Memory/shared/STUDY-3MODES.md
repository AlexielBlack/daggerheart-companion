# ETUDE — Refactor 3 Modes : Lecture / Edition / Jeu

**Date :** 2026-03-06
**Auteur :** Violet (COO)
**Statut :** Etude exploratoire — en attente de validation 2J

---

## 1. Etat des Lieux — Architecture Actuelle

### 1.1 Routes (27 total)

```
/ → redirect /adversaries
/adversaries          → AdversaryBrowser      [LECTURE]
/environments         → EnvironmentBrowser    [LECTURE]
/encounters           → EncounterBuilder      [EDITION]
/encounters/live      → EncounterLive         [JEU]
/characters           → CharacterBuilder      [EDITION]
/characters/classe    → ClassBrowser          [LECTURE]
/characters/domaines  → DomainBrowser         [LECTURE]
/characters/ascendance→ AncestryBrowser       [LECTURE]
/characters/communaute→ CommunityBrowser      [LECTURE]
/characters/equipement→ EquipmentBrowser      [LECTURE]
/npcs                 → NpcManager            [EDITION]
/dice                 → DiceRoller            [JEU]
/homebrew             → HomebrewHub           [EDITION]
/homebrew/*           → 14 routes CRUD        [EDITION]
/sync                 → SyncManager           [EDITION]
/:pathMatch           → 404
```

**Observation :** Les routes sont plates, sans concept de "mode". La nav actuelle (NAV_ITEMS dans constants.js) a 2 niveaux : items racine + sous-menus dropdown pour Personnages et Homebrew.

### 1.2 Modules (12)

| Module | Vues | Composants | Store(s) | Classification |
|--------|------|------------|----------|----------------|
| adversaries | 1 | ~5 | adversaryStore | LECTURE |
| environments | 1 | ~3 | environmentStore | LECTURE |
| communities | 1 | ~3 | communityStore | LECTURE |
| domains | 1 | ~4 | domainStore | LECTURE |
| equipment | 1 | ~3 | equipmentStore | LECTURE |
| characters | 4 | ~15 | characterStore | MIXTE (Lecture + Edition) |
| npcs | 1 | ~12 | npcStore, homebrewCombatFeatureStore | EDITION |
| encounter | 2 | ~22 | encounterStore, encounterLiveStore, encounterHistoryStore | MIXTE (Edition + Jeu) |
| homebrew | 15 | ~8 | 7 factory stores | EDITION |
| dice | 1 | ~5 | diceStore | JEU |
| levelup | 0 | ~4 | levelUpStore | EDITION |
| sync | 1 | ~2 | syncStore | EDITION |

### 1.3 Stores et Persistance (14 principaux + 7 homebrew)

| Store | Cle localStorage | Dependances cross-modules |
|-------|-----------------|--------------------------|
| characterStore | `dh-characters` | 5 homebrew stores |
| encounterStore | `dh-encounters`, `dh-encounter-current` | characterStore |
| encounterLiveStore | `dh-encounter-live` | characterStore |
| encounterHistoryStore | `dh-encounter-history` | — |
| npcStore | `dh-npcs` | — |
| homebrewCombatFeatureStore | `dh-homebrew-combat-features` | — |
| diceStore | `dh-dice-history` | — |
| syncStore | `dh-sync-history` | — |
| adversaryStore | (pas de persistence) | useAdversaryHomebrewStore |
| communityStore | (pas de persistence) | useCommunityHomebrewStore |
| domainStore | (pas de persistence) | useDomainHomebrewStore |
| environmentStore | (pas de persistence) | useEnvironmentHomebrewStore |
| equipmentStore | (pas de persistence) | useEquipmentHomebrewStore |
| levelUpStore | (pas de persistence) | characterStore |

### 1.4 Graphe de Dependances

```
                     characterStore
                    /      |       \
                   /       |        \
        encounterStore  encounterLiveStore  levelUpStore

   [5 browsing stores] ←── [7 homebrew factory stores]
   adversary, community,    adversary, ancestry, class,
   domain, environment,     community, domain, environment,
   equipment                equipment
```

**Observation cle :** Les 5 browsing stores importent les homebrew stores pour merger SRD + contenu custom. Ce couplage est VOULU — en mode Lecture, on veut voir ses propres creations melangees aux donnees SRD.

### 1.5 Navigation Actuelle

```
Header: [☰] [🗡️ DC] [Nav horizontale]

Nav: ⚔️Adversaires | 🌍Environnements | 🗺️Rencontres | 🎭PNJs
     🧙Personnages▼ | 🎲Des | ✎Homebrew▼ | 🔄Sync
        └─ Fiche, Classe, Domaines,     └─ Hub, Adversaires, Ascendances,
           Ascendance, Communaute,          Classes, Communautes, Domaines,
           Equipement                       Environnements, Equipement
```

### 1.6 Composants les plus volumineux

| Composant | Lignes | Module |
|-----------|--------|--------|
| NpcCombatPanel.vue | 1,511 | npcs |
| CharacterSheet.vue | 1,460 | characters |
| EncounterLive.vue | 998 | encounter |
| EncounterBuilder.vue | ~800 | encounter |
| AdversaryBrowser.vue | ~600 | adversaries |
| NpcManager.vue | ~550 | npcs |

---

## 2. Architecture Proposee — 3 Modes

### 2.1 Vue d'ensemble

```
┌──────────────────────────────────────────────────────────┐
│  🗡️ Daggerheart Companion                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│  │ 📖       │  │ ✏️        │  │ 🎮       │               │
│  │ Lecture  │  │ Edition  │  │ Jeu      │               │
│  │          │  │          │  │          │               │
│  └──────────┘  └──────────┘  └──────────┘               │
│                                                          │
│  [Navigation contextuelle selon le mode actif]           │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │                                                  │    │
│  │               Contenu du mode                    │    │
│  │                                                  │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Mode 1 — Lecture (📖 Compendium)

**But :** Consultation rapide des regles et donnees SRD + homebrew.
**Public :** Joueurs et MJ en preparation ou pendant une session.
**Etat :** 100% lecture, aucune mutation de donnees.

| Route | Vue | Source actuelle |
|-------|-----|-----------------|
| `/lecture` | (redirect) | `/lecture/adversaires` |
| `/lecture/adversaires` | AdversaryBrowser | `/adversaries` |
| `/lecture/environnements` | EnvironmentBrowser | `/environments` |
| `/lecture/classes` | ClassBrowser | `/characters/classe` |
| `/lecture/domaines` | DomainBrowser | `/characters/domaines` |
| `/lecture/ascendances` | AncestryBrowser | `/characters/ascendance` |
| `/lecture/communautes` | CommunityBrowser | `/characters/communaute` |
| `/lecture/equipement` | EquipmentBrowser | `/characters/equipement` |

**7 routes, 7 vues existantes** (zero creation).

**Stores impliques :** adversaryStore, communityStore, domainStore, environmentStore, equipmentStore (tous lecture seule, avec merge homebrew).

**Ce qui change :** Les browsers qui etaient sous `/characters/*` deviennent autonomes sous `/lecture/*`. Ils ne font QUE consulter — pas de lien vers edition.

### 2.3 Mode 2 — Edition (✏️ Atelier)

**But :** Creer et modifier du contenu (PJs, PNJs, rencontres, homebrew).
**Public :** Principalement MJ, joueurs pour leur fiche.
**Etat :** CRUD complet, persistance localStorage.

| Route | Vue | Source actuelle |
|-------|-----|-----------------|
| `/edition` | (redirect) | `/edition/personnages` |
| `/edition/personnages` | CharacterBuilder | `/characters` |
| `/edition/pnjs` | NpcManager | `/npcs` |
| `/edition/rencontres` | EncounterBuilder | `/encounters` |
| `/edition/homebrew` | HomebrewHub | `/homebrew` |
| `/edition/homebrew/*` | 14 routes CRUD | `/homebrew/*` |
| `/edition/sync` | SyncManager | `/sync` |

**18 routes, 18 vues existantes** (zero creation).

**Stores impliques :** characterStore, npcStore, encounterStore, 7 homebrew stores, syncStore, levelUpStore.

### 2.4 Mode 3 — Jeu (🎮 Table de Jeu)

**But :** Session de jeu en direct. Le coeur de l'experience MJ.
**Public :** MJ pendant la session.
**Etat :** Interactif, temps reel, persistance pour resilience.

| Route | Vue | Source |
|-------|-----|--------|
| `/jeu` | **SessionHome** (NOUVEAU) | A creer |
| `/jeu/combat` | EncounterLive | `/encounters/live` |
| `/jeu/des` | DiceRoller | `/dice` |

**3 routes, 1 vue a creer (SessionHome), 2 vues existantes.**

#### 2.4.1 SessionHome — Concept detaille

La vision de 2J : "De base, juste les informations des PJs. Permet de charger des environnements, des pnjs, et de lancer des rencontres : bascule en mode combat."

```
┌─────────────────────────────────────────────────────┐
│  🎮 Table de Jeu                           🎲 Des  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │  👥 Groupe de PJs (depuis characterStore)    │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │    │
│  │  │ PC 1 │ │ PC 2 │ │ PC 3 │ │ PC 4 │       │    │
│  │  │HP/S/A│ │HP/S/A│ │HP/S/A│ │HP/S/A│       │    │
│  │  └──────┘ └──────┘ └──────┘ └──────┘       │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────────┐     │
│  │ 🌍 Environnement  │  │ 🎭 PNJs charges      │     │
│  │ [Charger...]     │  │ [Charger...]        │     │
│  │                  │  │ • Taverniere Elma   │     │
│  │ Foret Sombre     │  │ • Guide Orek       │     │
│  │ Tier 2, Hostiles │  │                    │     │
│  └──────────────────┘  └──────────────────────┘     │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ ⚔️ Lancer une Rencontre                     │    │
│  │ [Rencontre sauvegardee v] [Depuis template] │    │
│  │                   [🚀 Lancer le combat]      │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  📜 Session Timer  |  📊 Historique combat          │
└─────────────────────────────────────────────────────┘
```

**Fonctionnalites SessionHome :**
1. **Resume PJs** — Lecture seule depuis characterStore (HP, Stress, Armure, traits cles)
2. **Chargeur d'environnement** — Picker rapide (environmentStore, lecture seule)
3. **Chargeur de PNJs** — Multi-select depuis npcStore (lecture seule)
4. **Lanceur de rencontre** — Choix parmi les rencontres sauvegardees OU templates, puis navigation vers `/jeu/combat`
5. **Session Timer** — Reutilisation du composable useSessionTimer existant
6. **Historique** — Dernieres rencontres (encounterHistoryStore)

---

## 3. Plan de Migration — Routes et Navigation

### 3.1 Nouvelle structure de routes

```js
const routes = [
  // Redirection racine
  { path: '/', redirect: '/jeu' },

  // ── MODE LECTURE ──
  { path: '/lecture', redirect: '/lecture/adversaires' },
  { path: '/lecture/adversaires', name: 'lecture-adversaires', component: () => import('...AdversaryBrowser.vue'), meta: { mode: 'lecture', title: 'Adversaires' } },
  { path: '/lecture/environnements', ... },
  { path: '/lecture/classes', ... },
  { path: '/lecture/domaines', ... },
  { path: '/lecture/ascendances', ... },
  { path: '/lecture/communautes', ... },
  { path: '/lecture/equipement', ... },

  // ── MODE EDITION ──
  { path: '/edition', redirect: '/edition/personnages' },
  { path: '/edition/personnages', name: 'edition-personnages', component: () => import('...CharacterBuilder.vue'), meta: { mode: 'edition', title: 'Personnages' } },
  { path: '/edition/pnjs', ... },
  { path: '/edition/rencontres', ... },
  { path: '/edition/homebrew', ... },
  { path: '/edition/homebrew/*', ... },  // 14 routes CRUD
  { path: '/edition/sync', ... },

  // ── MODE JEU ──
  { path: '/jeu', name: 'jeu-home', component: () => import('...SessionHome.vue'), meta: { mode: 'jeu', title: 'Table de Jeu' } },
  { path: '/jeu/combat', name: 'jeu-combat', component: () => import('...EncounterLive.vue'), meta: { mode: 'jeu', title: 'Combat', parent: 'jeu-home' } },
  { path: '/jeu/des', name: 'jeu-des', component: () => import('...DiceRoller.vue'), meta: { mode: 'jeu', title: 'Des' } },

  // 404
  { path: '/:pathMatch(.*)*', ... }
]
```

**Total : 28 routes** (actuellement 27, +1 SessionHome).

### 3.2 Nouvelle navigation

La navigation actuelle (barre horizontale plate) est remplacee par un systeme a 2 niveaux :

```
Niveau 1 : Mode Selector (toujours visible)
┌──────────────────────────────────────────────┐
│ 🗡️ DC  │ 📖 Lecture │ ✏️ Edition │ 🎮 Jeu    │
└──────────────────────────────────────────────┘

Niveau 2 : Nav contextuelle (depend du mode)
┌──────────────────────────────────────────────┐
│ Mode Lecture: Adversaires | Environnements | Classes | Domaines | Ascendances | Communautes | Equipement
│ Mode Edition: Personnages | PNJs | Rencontres | Homebrew▼ | Sync
│ Mode Jeu: Table | Combat | Des
└──────────────────────────────────────────────┘
```

### 3.3 Implementation navigation

**Option A — Mode Selector externe, nav interne :**
- AppShell contient un `ModeSelector` (3 boutons/tabs permanents)
- `AppNav` recoit `mode` en prop, filtre NAV_ITEMS par mode
- NAV_ITEMS evolue de tableau plat a objet par mode

**Option B — Layouts par mode (vue-router nested) :**
- 3 layouts: `LectureLayout.vue`, `EditionLayout.vue`, `JeuLayout.vue`
- Chaque layout a sa propre nav interne
- Route nesting: `{ path: '/lecture', component: LectureLayout, children: [...] }`

**Recommandation : Option A** — Plus simple, moins de code, un seul AppShell. Le mode est determine par `route.meta.mode` ou par le prefix de chemin.

### 3.4 Nouvelle structure NAV_ITEMS

```js
export const MODE_NAV = {
  lecture: {
    label: 'Lecture', icon: '📖',
    items: [
      { id: 'lecture-adversaires', label: 'Adversaires', icon: '⚔️', route: '/lecture/adversaires' },
      { id: 'lecture-environnements', label: 'Environnements', icon: '🌍', route: '/lecture/environnements' },
      { id: 'lecture-classes', label: 'Classes', icon: '🛡️', route: '/lecture/classes' },
      { id: 'lecture-domaines', label: 'Domaines', icon: '🃏', route: '/lecture/domaines' },
      { id: 'lecture-ascendances', label: 'Ascendances', icon: '🧬', route: '/lecture/ascendances' },
      { id: 'lecture-communautes', label: 'Communautes', icon: '🏘️', route: '/lecture/communautes' },
      { id: 'lecture-equipement', label: 'Equipement', icon: '🗡️', route: '/lecture/equipement' }
    ]
  },
  edition: {
    label: 'Edition', icon: '✏️',
    items: [
      { id: 'edition-personnages', label: 'Personnages', icon: '🧙', route: '/edition/personnages' },
      { id: 'edition-pnjs', label: 'PNJs', icon: '🎭', route: '/edition/pnjs' },
      { id: 'edition-rencontres', label: 'Rencontres', icon: '🗺️', route: '/edition/rencontres' },
      { id: 'edition-homebrew', label: 'Homebrew', icon: '✎', route: '/edition/homebrew',
        children: [/* hub, adversaires, ascendances, classes, communautes, domaines, environnements, equipement */]
      },
      { id: 'edition-sync', label: 'Sync', icon: '🔄', route: '/edition/sync' }
    ]
  },
  jeu: {
    label: 'Jeu', icon: '🎮',
    items: [
      { id: 'jeu-home', label: 'Table', icon: '🎮', route: '/jeu' },
      { id: 'jeu-combat', label: 'Combat', icon: '⚔️', route: '/jeu/combat' },
      { id: 'jeu-des', label: 'Des', icon: '🎲', route: '/jeu/des' }
    ]
  }
}
```

---

## 4. Analyse d'Impact

### 4.1 Fichiers a modifier

| Fichier | Nature du changement | Complexite |
|---------|---------------------|------------|
| `src/router/index.js` | Restructuration complete des routes | Elevee |
| `src/core/utils/constants.js` | NAV_ITEMS → MODE_NAV | Moyenne |
| `src/core/components/AppShell.vue` | Ajout ModeSelector | Moyenne |
| `src/core/components/AppNav.vue` | Filtrage par mode, restructuration | Elevee |
| `src/App.vue` | Aucun changement | — |
| `src/main.js` | Aucun changement | — |

### 4.2 Fichiers a creer

| Fichier | Description |
|---------|-------------|
| `src/core/components/ModeSelector.vue` | 3 tabs de mode (Lecture/Edition/Jeu) |
| `src/modules/session/views/SessionHome.vue` | Page d'accueil du mode Jeu (NOUVEAU) |
| `src/modules/session/stores/sessionStore.js` | Etat de session (PJs charges, env, PNJs) |
| `src/modules/session/components/PcGroupPanel.vue` | Resume du groupe de PJs |
| `src/modules/session/components/EnvironmentLoader.vue` | Chargeur d'environnement |
| `src/modules/session/components/NpcLoader.vue` | Chargeur de PNJs |
| `src/modules/session/components/EncounterLauncher.vue` | Lanceur de rencontre |

### 4.3 Fichiers NON modifies

Les composants et stores des modules existants ne changent PAS :
- Les 5 browsing stores restent identiques
- Les vues browsers (AdversaryBrowser, etc.) restent identiques
- characterStore, npcStore, encounterStore — aucun changement
- Tous les composants internes des modules — aucun changement
- Les 392 tests encounter — aucun changement
- Les styles (variables.css, base.css, utilities.css) — aucun changement

**C'est un refactor de ROUTING et NAVIGATION, pas de logique metier.**

### 4.4 Dependances croisees — Impact

| Dependance | Impact |
|-----------|--------|
| Browsing stores → Homebrew stores | Aucun : le merge SRD+homebrew est desire en Lecture |
| encounterStore → characterStore | Aucun : les 2 sont dans Edition (builder) et Jeu (live) |
| encounterLiveStore → characterStore | Aucun : les 2 sont dans Jeu |
| levelUpStore → characterStore | Aucun : les 2 sont dans Edition |

**Zero decoupage de store necessaire.** Les dependances existantes sont correctement alignees avec les 3 modes.

### 4.5 Modules qui chevauchent les modes

| Module | Lecture | Edition | Jeu | Resolution |
|--------|---------|---------|-----|------------|
| characters | ClassBrowser, AncestryBrowser | CharacterBuilder | — | Vues browsers → Lecture, Builder → Edition |
| encounter | — | EncounterBuilder | EncounterLive | Builder → Edition, Live → Jeu |
| domains | DomainBrowser | — | — | 100% Lecture |
| communities | CommunityBrowser | — | — | 100% Lecture |
| npcs | — | NpcManager | (via SessionHome) | Manager → Edition, loader read-only → Jeu |
| dice | — | — | DiceRoller | 100% Jeu |
| homebrew | — | 100% | — | 100% Edition |

**Aucun composant ne doit etre duplique.** Les vues sont simplement referencees depuis des routes differentes.

---

## 5. Risques et Points d'Attention

### 5.1 Risque FAIBLE — Redirections et bookmarks

Les anciennes URLs (`/adversaries`, `/characters/classe`, etc.) cesseront de fonctionner.

**Mitigation :** Ajouter des redirections permanentes :
```js
{ path: '/adversaries', redirect: '/lecture/adversaires' },
{ path: '/characters/classe', redirect: '/lecture/classes' },
// ... etc
```

### 5.2 Risque FAIBLE — Tests existants

Les 2,660+ tests ne testent PAS le routing. Ils testent :
- Logique de store (mocks internes)
- Composants (mount isole)
- Composables (effectScope)

**Impact : zero test casse** par le refactor routes/nav.

Seuls les tests du module `core/` (s'il y en a) et les tests de AppNav/AppShell seraient impactes.

### 5.3 Risque MOYEN — PWA et Service Worker

Le Service Worker precache les routes. Si les paths changent, le cache SW doit etre invalide.

**Mitigation :** Incrementer la version du SW + les redirections gerent le fallback.

### 5.4 Risque MOYEN — Taille du nouveau module `session`

Le SessionHome doit charger des donnees de TROIS stores existants (characters, environments, npcs) + proposer un lanceur de rencontre. C'est un composant d'orchestration potentiellement volumineux.

**Mitigation :** Architecture en sous-composants (PcGroupPanel, EnvironmentLoader, NpcLoader, EncounterLauncher) — chaque panel est autonome.

### 5.5 Risque NUL — Persistance localStorage

Les cles localStorage (`dh-characters`, `dh-encounters`, etc.) ne changent pas. Les stores sont des singletons Pinia independants du routing.

---

## 6. Strategie de Migration

### Phase 1 — Fondations (1 session)
1. Creer `ModeSelector.vue` (3 tabs)
2. Restructurer `constants.js` (NAV_ITEMS → MODE_NAV)
3. Adapter `AppNav.vue` (filtrage par mode)
4. Adapter `AppShell.vue` (integration ModeSelector)
5. Restructurer `router/index.js` (nouvelles routes + redirections)
6. Tests navigation

### Phase 2 — Mode Jeu (1-2 sessions)
1. Creer le module `session/` (store + vue + composants)
2. Creer `SessionHome.vue` avec les 4 panels
3. Connecter le lanceur de rencontre a EncounterLive
4. Tester le flux complet : SessionHome → charger env/PNJs → lancer combat → retour
5. Tests SessionHome

### Phase 3 — Polish (1 session)
1. Redirection par defaut (`/` → `/jeu`)
2. Redirections legacy (toutes les anciennes URLs)
3. Verifier PWA + SW
4. ESLint + build + tests globaux
5. Deploiement

**Estimation totale : 3-4 sessions.**

---

## 7. Decisions Architecturales a Prendre

| # | Question | Options | Recommandation |
|---|----------|---------|----------------|
| 1 | Layouts par mode vs nav filtree ? | A: Nav filtree (1 AppShell) / B: 3 Layouts nested | **A** — Plus simple, moins de code |
| 2 | Redirection par defaut ? | `/` → `/jeu` ou `/lecture` ou `/edition` | **`/jeu`** — C'est l'outil de session live |
| 3 | Le mode Jeu doit-il persister la session ? | A: oui (sessionStore avec useStorage) / B: non (ephemere) | **A** — Resilience si refresh |
| 4 | Bouton Des accessible depuis tous les modes ? | A: Uniquement mode Jeu / B: Accessible partout (FAB ou raccourci) | **B** — Les des sont utiles partout |
| 5 | Quick Reference (regles SRD) dans quel mode ? | A: Lecture / B: Jeu (panel flottant actuel) / C: Les deux | **C** — Lecture pour consulter, Jeu pour reference rapide |
| 6 | Le module `session/` ou placer ? | A: `src/modules/session/` / B: Dans encounter existant | **A** — Module autonome, separation claire |

---

## 8. Metriques

| Metrique | Avant | Apres |
|----------|-------|-------|
| Routes | 27 | 28 (+1 SessionHome) |
| Redirections | 1 (/ → /adversaries) | ~15 (1 par mode + legacy) |
| Vues | 29 | 30 (+1 SessionHome) |
| Composants nouveaux | — | ~5 (ModeSelector, SessionHome panels) |
| Stores | 14+7 | 15+7 (+1 sessionStore) |
| Tests impactes | 0 | ~0 (routing non teste) |
| Modules | 12 | 13 (+session) |
| Fichiers modifies | — | ~5 (router, constants, AppShell, AppNav, + redirections) |
| Fichiers crees | — | ~8 (ModeSelector + module session/) |
| Fichiers supprimes | — | 0 |

---

*Violet — 2026-03-06*
