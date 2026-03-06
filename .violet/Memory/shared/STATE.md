# STATE — Daggerheart Companion

**Last updated:** 2026-03-06 12:00 — Violet

---

## Active Modules

| Module | Status | Tests | Notes |
|--------|--------|-------|-------|
| Classes (8 SRD + 2 homebrew) | ✅ Complet | ✓ | Duelliste + Assassin homebrew |
| Subclasses (22 total) | ✅ Complet | ✓ | spellcastTrait implémenté |
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

## Test Suite
- ~1,934+ passing tests
- 25+ test files
- ESLint clean

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
