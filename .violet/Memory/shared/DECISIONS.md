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
