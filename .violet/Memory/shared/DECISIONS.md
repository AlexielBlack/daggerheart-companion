# DECISIONS — Daggerheart Companion

Append-only log of architectural and design decisions.

---

## 2026-03-06 12:00 — Violet
**Decision:** Adopter le système multi-agents Purple Directive Violet pour Claude Code
**Context:** Migration vers Claude Code pour gestion du projet. Système complet avec E.I.K. Advisory + 4 agents opérationnels (Frontend, Data, Testing, DevOps).
**Rationale:** Structurer le travail multi-agents, maintenir la continuité inter-sessions, améliorer la qualité via audit systématique.
**Alternatives considered:** Claude Code vanilla sans structure d'agents.

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
