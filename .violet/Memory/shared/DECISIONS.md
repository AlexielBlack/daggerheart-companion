# DECISIONS — Daggerheart Companion

Append-only log of architectural and design decisions.

---

## 2026-03-06 12:00 — Violet
**Decision:** Adopter le système multi-agents Purple Directive Violet pour Claude Code
**Context:** Migration vers Claude Code pour gestion du projet. Système complet avec E.I.K. Advisory + 4 agents opérationnels (Frontend, Data, Testing, DevOps).
**Rationale:** Structurer le travail multi-agents, maintenir la continuité inter-sessions, améliorer la qualité via audit systématique.
**Alternatives considered:** Claude Code vanilla sans structure d'agents.

---

## 2026-03-06 15:00 — Violet
**Decision:** Persister l'historique des rencontres via useStorage('encounter-history')
**Context:** Les résumés de combat (generateSummary) étaient éphémères — perdus au reload. Besoin de traçabilité pour les campagnes longues.
**Rationale:** useStorage + localStorage = pattern existant, pas de backend nécessaire. Store dédié encounterHistoryStore pour séparation des responsabilités.
**Alternatives considered:** Stocker dans encounterStore (trop couplé), IndexedDB (surdimensionné pour ce volume).

---

## 2026-03-06 16:00 — Violet
**Decision:** Date.now() anchoring pour le minuteur de session (useSessionTimer)
**Context:** Besoin d'un minuteur qui survive aux rechargements de page. setInterval-based counting dérive et perd le temps au reload.
**Rationale:** Ancrage absolu via Date.now() + useStorage pour la persistence. setInterval(1000) uniquement pour l'update visuel. Au reload, recalcul précis depuis startedAt + accumulatedMs.
**Alternatives considered:** setInterval counting (imprécis, perd au reload), requestAnimationFrame (overkill pour 1s résolution).

---

## 2026-03-06 16:00 — Violet
**Decision:** Templates d'encounters comme données statiques dans @data/encounters/templates.js
**Context:** 21 templates pré-construits pour faciliter la création de rencontres. Format identique à serializeEncounter().
**Rationale:** Pas de store nécessaire — données en lecture seule. Format compatible direct avec loadEncounter(). adversaryIds vérifiés contre les fichiers SRD tier1-4.json.
**Alternatives considered:** Stocker dans encounterStore (couplage inutile), base de données externe (surdimensionné).

---

## 2026-03-06 16:00 — Violet
**Decision:** Teleport to body + document.addEventListener pour QuickReferencePanel
**Context:** Panneau flottant en overlay pendant le mode live. ESLint vuejs-accessibility/no-static-element-interactions bloque @keydown sur div.
**Rationale:** Teleport body évite les problèmes de z-index/overflow. document.addEventListener('keydown') dans watch + beforeUnmount contourne la règle ESLint sans la désactiver. role="dialog" pour l'accessibilité.
**Alternatives considered:** @keydown.escape inline (bloqué ESLint), portail dans un slot (complexité inutile).

---

## 2026-03-06 17:00 — Violet
**Decision:** CombatDashboard panneau flottant GAUCHE, miroir du QuickReferencePanel (DROIT)
**Context:** Le Combat Dashboard doit coexister avec le QuickReferencePanel pendant le mode live. Les deux panneaux peuvent être ouverts simultanément.
**Rationale:** Panneau gauche (translateX(-100%), left:0, 380px) pour le Dashboard, panneau droit (translateX(100%), right:0, 340px) pour la Référence. Même z-index (200), même pattern Teleport+Escape. Pas de conflit visuel ni fonctionnel.
**Alternatives considered:** Un seul panneau partagé (confusion UX), modal centré (bloque l'interaction live), tabs dans le même panneau (trop de contexte switching).

---

## 2026-03-06 17:00 — Violet
**Decision:** Fear/Hope comme composable standalone avec useStorage, pas dans le store live
**Context:** L'économie Fear/Hope persiste indépendamment de l'état de rencontre active. Un MJ peut vouloir conserver ses tokens entre les scènes.
**Rationale:** useFearHope() composable autonome avec useStorage('fear-hope') — séparé du encounterLiveStore. Le composable est invoqué dans CombatDashboard.vue setup(), pas dans le store. Reset explicite au lieu d'auto-clear.
**Alternatives considered:** Intégrer dans encounterLiveStore (couplage, perdu au endEncounter), store Pinia dédié (overkill pour 4 valeurs).

---

## 2026-03-06 17:30 — Violet
**Decision:** Un seul commit par feature, mémoire partagée incluse
**Context:** Le workflow faisait systématiquement 2 commits — feature puis mémoire. Le second interrompt le premier dans l'historique git.
**Rationale:** Les fichiers `.violet/Memory/shared/` sont mis à jour dans le même commit que la feature. Un changement logique = un commit. Plus propre dans l'historique, pas de commit orphelin mémoire.
**Alternatives considered:** Commit mémoire séparé (historique pollué), mémoire en fin de session uniquement (risque de perte si session interrompue).

---

## 2026-03-06 18:00 — Violet
**Decision:** Fusionner H-01 et H-02 en une seule implémentation
**Context:** H-01 (interface gameplay temps réel) et H-02 (spellcastTrait rendering) sont interdépendants. Les domain cards sont le système de sorts dans Daggerheart.
**Rationale:** usePlayerActions résout le spellcastTrait + enrichit les features en une seule passe. Pas de duplication de logique. Un composable unique (usePlayerActions) sert les deux besoins.
**Alternatives considered:** Deux implémentations séparées (duplication de la résolution de trait), enrichissement dans useEncounterFeatures directement (couplage avec le scoring par mode de scène).

---

## 2026-03-06 18:00 — Violet
**Decision:** Enrichment lookup map dans ContextPanel pour les features classifiées
**Context:** ContextPanel reçoit les features classifiées (primaryFeatures, etc.) depuis useEncounterFeatures ET les enrichedFeatures depuis usePlayerActions. Les features classifiées ne sont pas enrichies directement.
**Rationale:** Un Map<key, enrichedFeature> permet de résoudre l'enrichissement en O(1) pour chaque FeatureCard en mode classifié, sans modifier useEncounterFeatures ni créer un couplage entre les deux composables.
**Alternatives considered:** Enrichir dans useEncounterFeatures (couplage), passer seulement des enriched features (perte de la classification par mode de scène), double filtrage (duplication).

---

## Pre-migration decisions (from project history)

### Options API vs Composition API
**Decision:** Options API pour les composants .vue, Composition API pour les stores et vues
**Rationale:** Clarté de séparation, familiarité, lisibilité

### Declarative Homebrew Schemas
**Decision:** Schémas déclaratifs via FIELD_TYPES avec factory store `createHomebrewStore()`
**Rationale:** Réduire la duplication, uniformiser les 7 catégories homebrew

### Tag System Design
**Decision:** 4 tags multi-assignables (Offensif, Défensif, Social, Utilitaire) sur features et équipement
**Rationale:** Préparation de l'interface gameplay future

### NPC Module Architecture
**Decision:** Relations PJ/PNJ uni/bidirectionnelles + profil combat (lien adversaire) + build lite
**Rationale:** Flexibilité pour campagnes complexes, pont entre narration et mécanique

### PWA Strategy
**Decision:** Service Worker v2 avec three-level navigation fallback + custom Vite plugin precaching
**Rationale:** Support offline robuste sans dépendance à Workbox

---

## 2026-03-06 19:00 — Violet
**Decision:** Architecture 3 modes via route.meta.mode — Phase 1 routing-only
**Context:** L'app avait 27 routes plates sans concept de mode. Le refactor restructure en 3 modes (Lecture/Édition/Jeu) pour améliorer la navigation et préparer les futures features session.
**Rationale:** route.meta.mode sur chaque route + computed dans ModeSelector/AppNav. Pas de store global nécessaire — le router est la source de vérité. 36 redirections legacy pour backward-compat. Phase 1 = routing+nav seulement, zéro changement logique métier.
**Alternatives considered:** Store global mode (couplage inutile, désynchronisation possible avec le router), guards de navigation (trop restrictif, empêche la navigation cross-mode pour les browsers→homebrew).

---

## 2026-03-06 19:00 — Violet
**Decision:** Chemins hybrides FR/EN — top-level en français, homebrew sous-chemins en anglais
**Context:** Les routes top-level utilisent le français (/lecture/adversaires, /edition/personnages) mais les sous-chemins homebrew restent en anglais (/edition/homebrew/adversary).
**Rationale:** Cohérence avec le schéma de données homebrew (clés anglaises dans les stores et localStorage). Les utilisateurs ne voient pas les sous-chemins homebrew dans la navigation principale. Évite une migration de données complexe.
**Alternatives considered:** Tout en français (nécessite migration localStorage), tout en anglais (incohérent avec le reste de l'app).

---

## 2026-03-06 20:00 — Violet
**Decision:** sessionStore stocke uniquement des IDs, résolution via stores existants
**Context:** Le module session a besoin de référencer des environnements, PNJs et rencontres. Ces entités sont déjà gérées par environmentStore, npcStore et encounterStore.
**Rationale:** Stocker des IDs (pas des objets) évite la duplication de données et les désynchronisations. Les getters computed (`loadedEnvironment`, `loadedNpcs`) résolvent en O(1) via les stores existants. Si un PNJ est supprimé, le getter filtre automatiquement les IDs orphelins.
**Alternatives considered:** Copier les objets dans sessionStore (duplication, désynchronisation), store commun encounter+session (couplage excessif).

---

## 2026-03-06 20:00 — Violet
**Decision:** EnvironmentLoader custom au lieu de réutiliser EnvironmentPicker existant
**Context:** L'EnvironmentPicker existant importe `allEnvironments` (SRD uniquement) en dur. Le SessionHome a besoin de SRD + homebrew.
**Rationale:** EnvironmentLoader lit `environmentStore.allItems` qui fusionne SRD + homebrew. Modifier EnvironmentPicker aurait impacté EncounterBuilder et ses tests. Un nouveau composant simple (select + search) est plus propre qu'un refactor transversal.
**Alternatives considered:** Refactorer EnvironmentPicker pour accepter une source configurable (impact EncounterBuilder), passer les items en prop (API lourde).

---

## 2026-03-06 20:00 — Violet
**Decision:** `/jeu/table` comme route par défaut de l'app (remplace `/jeu/combat`)
**Context:** Avec le module session, le hub MJ (SessionHome) est le point d'entrée naturel du mode Jeu. Le combat live est un état transitoire, pas un point de départ.
**Rationale:** `/` → `/jeu/table` car le MJ commence par sa table (voir PJs, charger env/PNJs, lancer rencontre). Le combat est accessible via le lanceur ou la bannière de reprise. MODE_NAV.jeu met "Table" en première position.
**Alternatives considered:** Garder `/jeu/combat` comme défaut (confus sans rencontre active), page d'accueil dédiée hors du mode (complexité inutile).
