# STATE — Daggerheart Companion

**Last updated:** 2026-03-06 21:00 — Violet

---

## Active Modules

| Module | Status | Tests | Notes |
|--------|--------|-------|-------|
| Classes (8 SRD + 2 homebrew) | ✅ Complet | ✓ | Duelliste + Assassin homebrew |
| Subclasses (22 total) | ✅ Complet | ✓ | spellcastTrait implémenté + gameplay intégré |
| Ancestries | ✅ Complet | ✓ | Données SRD vérifiées |
| Communities (9) | ✅ Complet | ✓ | Données SRD vérifiées |
| Domains | ✅ Complet | ✓ | Bug filtrage cartes résolu |
| Adversaries (129) | ✅ Complet | ✓ | Null-safety thresholds |
| Environments (19) | ✅ Complet | ✓ | Données SRD vérifiées |
| Equipment | ✅ Complet | ✓ | Primary/secondary/armor/loot/consumables |
| Homebrew CRUD (7 catégories) | ✅ Complet | ✓ | Schemas déclaratifs, factory stores |
| HomebrewHub Dashboard | ✅ Complet | ✓ | Import/export JSON global |
| Character Sheet | ✅ Complet | ✓ | HP/Stress/Armor, 8 personnages simultanés |
| Domain Card Picker | ✅ Complet | ✓ | Loadout/vault/catalogue |
| Dice Roller | ✅ Complet | ✓ | Duality + damage + GM d20 |
| Glossary System | ✅ Complet | ✓ | Regex + GlossaryText.vue |
| PWA | ✅ Complet | ✓ | SW v2, offline.html, PwaBanner |
| Tag System | ✅ Complet | ✓ | 4 tags: Offensif/Défensif/Social/Utilitaire |
| NPC Module | ✅ Complet | ✓ | CRUD, relations PJ/PNJ, combat profile, 35 PNJs campagne |
| Combat Features | ✅ Complet | ✓ | 394 features, catalogue SRD+homebrew |
| Encounter Notes | ✅ Complet | ✓ | Notes libres sur rencontres (I-06) |
| Encounter History | ✅ Complet | ✓ | Historique persisté, stats agrégées (I-03) |
| Encounter Sharing | ✅ Complet | ✓ | Export JSON, import fichier, copie presse-papier (I-05) |
| Session Timer | ✅ Complet | ✓ | Minuteur Date.now() anchoring + rounds, useSessionTimer composable (I-04) |
| Quick Reference | ✅ Complet | ✓ | Panneau flottant 7 sections SRD, Teleport body (I-07) |
| Encounter Templates | ✅ Complet | ✓ | 21 templates pré-construits, filtrage tier/tags (I-02) |
| Combat Dashboard | ✅ Complet | ✓ | Fear/Hope tracker, battlefield overview, live stats (I-01) |
| Player Actions Gameplay | ✅ Complet | ✓ | spellcastTrait intégré, badges Sort/Trait, features enrichies (H-01+H-02) |
| **3 Modes Phase 1** | ✅ Complet | ✓ | Routing /lecture/* /edition/* /jeu/*, ModeSelector, AppNav mode-aware, 36 redirections legacy |
| **Session Module (Phase 2)** | ✅ Complet | ✓ | sessionStore, SessionHome, 6 sous-composants, hub MJ mode Jeu (3M-P2) |
| **PcGroupPanel v2** | ✅ Complet | ✓ | Fiche PJ enrichie : resolveCharacterDisplay pure function, stats/seuils/armes/cartes/capacités/inventaire, 4 sections dépliables, 20 tests |

## Architecture 3 Modes

### Phase 1 — Routing & Navigation
- **📖 Lecture** : 7 browsers SRD sous `/lecture/*` (adversaires, environnements, classes, domaines, ascendances, communautés, équipement)
- **✏️ Édition** : personnages, rencontres, PNJs, homebrew (7 catégories CRUD), sync sous `/edition/*`
- **🎮 Jeu** : table de jeu + combat live + dés sous `/jeu/*`
- **ModeSelector.vue** : tablist ARIA dans le header (3 onglets avec icônes)
- **AppNav.vue** : filtrage dynamique par `route.meta.mode`
- **36 redirections legacy** : backward-compat pour toutes les anciennes URLs

### Phase 2 — Session Module (Mode Jeu)
- **SessionHome.vue** : hub MJ — vue PJs, chargement environnement/PNJs, lanceur de rencontres
- **sessionStore** : Pinia Composition API, stocke uniquement des IDs (env, NPCs, notes), résout via stores existants
- **PcGroupPanel v2** : fiche PJ enrichie (resolveCharacterDisplay), header compact + 4 sections dépliables (Armes/Cartes/Capacités/Inventaire)
- **EnvironmentLoader** : sélecteur environnement SRD+homebrew (via environmentStore.allItems)
- **NpcLoader** : multi-select PNJs avec chips colorées par statut
- **EncounterLauncher** : rencontres sauvegardées + templates, injection contexte session
- **CombatResumeBanner** : bannière "combat en cours" → /jeu/combat
- **SessionHistoryPanel** : wrapper autour de EncounterHistory
- **Route** : `/jeu/table` (défaut mode Jeu), `/jeu` → redirect `/jeu/table`, `/` → `/jeu/table`
- **MODE_NAV.jeu** : 3 items (Table, Combat, Dés)

## Test Suite
- 392 encounter tests (18 fichiers)
- 31 session tests (1 fichier)
- 20 useCharacterComputed tests (1 fichier)
- 2,709 tests totaux (97 fichiers)
- ESLint clean
- Build Vite: 406 modules, 2.28s

## Tech Stack
- Vue 3 + Vite + Pinia
- Options API (components) / Composition API (stores/views)
- Path aliases: @core, @modules, @data
- 3-mode routing: route.meta.mode ('lecture'|'edition'|'jeu')
- GitHub Pages deployment

## Known Issues
- Aucun bug connu actuellement

## Repository
- Main branch: `main`
- Deploy branch: `gh-pages`
- URL: github.com/AlexielBlack/daggerheart-companion
