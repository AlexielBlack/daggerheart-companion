# STATE — Daggerheart Companion

**Last updated:** 2026-03-06 18:00 — Violet

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

## Test Suite
- 392 encounter tests (18 fichiers)
- ~2,660+ tests totaux estimés
- ESLint clean
- Build Vite: 376 modules, 2.50s

## Tech Stack
- Vue 3 + Vite + Pinia
- Options API (components) / Composition API (stores/views)
- Path aliases: @core, @modules, @data
- GitHub Pages deployment

## Known Issues
- Aucun bug connu actuellement

## Repository
- Main branch: `main`
- Deploy branch: `gh-pages`
- URL: github.com/AlexielBlack/daggerheart-companion
