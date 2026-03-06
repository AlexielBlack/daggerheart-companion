# HANDOFF — Daggerheart Companion

Append-only cross-session continuity notes.

---

## 2026-03-06 12:00 — Violet

### Migration vers Claude Code
- Système multi-agents Purple Directive Violet mis en place
- 4 agents opérationnels: Frontend, Data, Testing, DevOps
- E.I.K. Advisory Council: Evolution, Improvement, Keenness
- Mémoire partagée initialisée avec l'historique du projet
- Prochaine session: valider que Claude Code charge correctement CLAUDE.md et les agents

## 2026-03-06 15:00 — Violet

### Quick Wins I-03 + I-06 implémentés
- **I-06 Encounter Notes** : champ `encounterNotes` dans encounterStore, textarea dans EncounterConfig
- **I-03 Encounter History** : encounterHistoryStore (useStorage), EncounterHistory.vue, intégré dans EncounterBuilder sidebar
- endEncounter() appelle automatiquement historyStore.add(summary)
- 20 nouveaux tests (store CRUD + composant), 206 tests encounter au total
- Innovation backlog restant : I-01 (Combat Dashboard), I-02 (Adversary Templates), I-04 (Session Timer), I-05 (Encounter Sharing), I-07 (Quick Reference)
- Commit: `b20ea93f`

## 2026-03-06 16:00 — Violet

### 4 innovations valeur moyenne implémentées
- **I-05 Encounter Sharing** : EncounterSharePanel.vue — export Blob+ObjectURL, import FileReader + validation, copie presse-papier
- **I-04 Session Timer** : useSessionTimer.js composable (Date.now() anchoring, useStorage persistence) + SessionTimer.vue compact header
- **I-07 Quick Reference** : quickReference.js (7 sections SRD) + QuickReferencePanel.vue (Teleport body, role="dialog", Escape via document listener)
- **I-02 Adversary Templates** : templates.js (21 templates, 4 tiers, IDs SRD vérifiés) + EncounterTemplatePicker.vue (filtrage tier/tags)
- 109 nouveaux tests dédiés (5 fichiers), 315 tests encounter au total
- 38 exports dans encounter/index.js
- Build: 367 modules, 2.17s
- ESLint vuejs-accessibility contourné pour QuickReferencePanel via document.addEventListener
- Commits: `262c53a5` (features) + `8c01fef4` (tests)
- Innovation backlog restant : **I-01 (Combat Dashboard)** — seul item haute priorité restant

## 2026-03-06 17:00 — Violet

### I-01 Combat Dashboard implémenté — Brainstorm innovation terminé
- **FEAR_HOPE_FROM_ROLL** : constante SRD p.18 dans liveConstants.js (5 résultats de jet → Hope/Fear)
- **useFearHope.js** : composable Fear/Hope persisté (useStorage), add/spend/applyRollResult/reset
- **useLiveStats.js** : stats live computed depuis encounterLiveStore (hitRatio, damageByPc, killsByPc, adversaryStatusSummary)
- **FearHopeTracker.vue** : tokens visuels (cercles ●/○, max 12), boutons ±, 5 boutons de résultat de jet rapide
- **BattlefieldOverview.vue** : barres HP groupées colorées (vert/jaune/rouge), PJs avec conditions, stats live grille 3×2
- **CombatDashboard.vue** : panneau flottant GAUCHE (Teleport body, Escape, slide-in translateX(-100%), 380px, z-index 200)
- Intégré dans EncounterLive.vue header-actions, bouton 📊 avant QuickReferencePanel 📖
- 43 exports (38 → 43), 376 tests (315 → 376, 17 fichiers), build 375 modules
- ESLint clean, build 2.15s
- Commit: `08f79828`
- **Tous les 7 items du brainstorm innovation sont terminés (I-01 à I-07)**
- Backlog restant : H-01 (interface gameplay temps réel), H-02 (subclass rendering gameplay)

## 2026-03-06 18:00 — Violet

### H-01 + H-02 Interface gameplay enrichie + spellcastTrait intégration
- **Fusionné** : H-01 (gameplay temps réel) + H-02 (spellcastTrait) car domain cards = système de sorts
- **encounterLiveStore.js** : participantPcs étendu avec `traits` (6 stats) + `spellcastTrait` (via getSubclassById)
- **usePlayerActions.js** : nouveau composable — spellcastInfo, enrichedFeatures (isDomainCard, isSpell, resolvedTraitModifier, resolvedTraitLabel), domainCardCount, spellCount
- **FeatureCard.vue** : badges 🔮 Sort + 🎯 Trait (props showSpellBadge + traitLabel)
- **ContextPanel.vue** : section spellcast "🔮 Spellcast: Instinct +3", enrichedFeatures → tag filtering + enrichment lookup pour FeatureCard
- **EncounterLive.vue** : import usePlayerActions, connexion playerActions → ContextPanel via spellcast-info + enriched-features
- 44 exports (43 → 44), 392 tests (376 → 392, 18 fichiers), build 376 modules
- ESLint clean, build 2.50s
- Normalisation casing : spellcastTrait 'Instinct' → traits['instinct'] via .toLowerCase()
- **Tous les items horizon sont terminés — aucun backlog restant**

## 2026-03-06 19:00 — Violet

### Phase 1 — Architecture 3 modes (Routing & Navigation) implémentée
- **ModeSelector.vue** : nouveau composant (tablist ARIA, 3 tabs 📖/✏️/🎮, router-link vers defaultRoute par mode)
- **MODE_NAV** : ajouté dans constants.js (lecture: 7 items, edition: 5 items dont homebrew avec 8 children, jeu: 2 items)
- **router/index.js** : réécriture complète — 7 routes Lecture, 26 routes Édition, 2 routes Jeu, 36 redirections legacy, 404
- **AppNav.vue** : filtrage par mode via computed navItems + watch currentMode pour reset openGroups
- **AppShell.vue** : intégration ModeSelector dans header + bouton 🎲 raccourci dés
- **67+ chemins programmatiques** mis à jour dans 26 fichiers (HomebrewHub, 7 Lists, 7 Editors, 7 Browsers, EncounterBuilder, EncounterLive)
- **HomebrewHub.test.js** : assertions mises à jour pour les nouveaux chemins /edition/homebrew/*
- Vérification complète : ESLint clean, build 378 modules, 2658 tests OK, grep audit clean
- **NAV_ITEMS** conservé dans constants.js pour référence (non utilisé par le code actif)
- Commit: `241482a1`
- **Phase 2 à venir** : SessionHome.vue + sessionStore (pas encore commencé, attend direction de 2J)
- **Étude détaillée** : `.violet/Memory/shared/STUDY-3MODES.md` contient l'analyse complète et le plan Phase 2

## 2026-03-06 20:00 — Violet

### Phase 2 — Session Module (Mode Jeu) implémenté
- **sessionStore.js** : Pinia Composition API, useStorage pour persistence (4 clés localStorage: dh-session-env/npcs/notes/last-encounter)
- **SessionHome.vue** : vue hub MJ, layout 2 colonnes (main+sidebar sticky), responsive 768px breakpoint
- **PcGroupPanel.vue** : grille lecture seule PJs (HP/Stress bars colorées, Evasion, Armor, Conditions)
- **EnvironmentLoader.vue** : sélecteur env SRD+homebrew via environmentStore.allItems (PAS le EnvironmentPicker existant)
- **NpcLoader.vue** : multi-select PNJs avec chips colorées par statut (allié/hostile/neutre/mort/disparu)
- **EncounterLauncher.vue** : rencontres sauvegardées + templates, injection contexte session (env+PCs) avant lancement
- **CombatResumeBanner.vue** : bannière conditionnelle "combat en cours" → /jeu/combat (role="alert")
- **SessionHistoryPanel.vue** : wrapper EncounterHistory (API: historyStore.all, pas entries)
- **Route** : `/jeu/table` (défaut), `/jeu` → redirect, `/` → `/jeu/table`
- **MODE_NAV.jeu** : 3 items (Table/Combat/Dés), ModeSelector defaultRoute → `/jeu/table`
- **Module index** : 9 exports (1 store + 1 vue + 7 composants)
- 10 fichiers créés, 3 modifiés, 31 tests sessionStore, 2689 tests totaux
- ESLint clean, build 405 modules 2.30s
- **Architecture 3 modes complète** — Phase 1 + Phase 2 terminées
- **Backlog vide** — aucune tâche en attente, direction de 2J requise

## 2026-03-06 21:00 — Violet

### PcGroupPanel v2 — Fiche PJ enrichie pour le mode Table
- **useCharacterComputed.js** : `resolveCharacterDisplay(pc)` pure function — résout stats effectives, seuils, données classe/ascendance/communauté/armes/cartes pour n'importe quel PJ (contourne la limitation du selectedCharacterIdx du characterStore)
- **Formules stats** : effectiveMaxHP, effectiveMaxStress, effectiveEvasion, effectiveArmorScore, thresholds major/severe — identiques au characterStore
- **Homebrew fallback** : resolveClass() cherche SRD puis useClassHomebrewStore (même pattern characterStore lignes 91-99)
- **PcGroupPanel.vue** : réécriture complète (98 → 1115 lignes)
  - Header toujours visible : identité + HP/Stress bars + Armure/Hope + Évasion/Seuils + Conditions + 6 Traits compact
  - 4 sections `<details>/<summary>` : ⚔️ Armes, 🃏 Cartes Loadout, ✨ Capacités (Hope+Class+Ancestry+Community+Subclass par tier), 🎒 Inventaire & Or
  - Bouton global "Tout déplier / Tout replier" avec nextTick + querySelectorAll
  - Grid `repeat(auto-fill, minmax(340px, 1fr))` — 2 colonnes tablette, 1 mobile
  - Touch targets 44px, ARIA, responsive 768px breakpoint
- **characters/index.js** : export ajouté pour resolveCharacterDisplay + useCharacterComputed
- 20 tests unitaires (stats, ancestry bonuses, thresholds, data resolution, null-safety, reactive wrapper)
- Build: 406 modules, 2.28s — SessionHome chunk 31.13 kB
- 2709 tests totaux (97 fichiers), 0 régression
- Commit: `4868f2c4`, pushé sur origin/main

## 2026-03-06 22:00 — Violet

### PcGroupPanel — 4 améliorations UX pour le mode Table
- **Grille configurable** : sélecteur 2/3/4 colonnes (radiogroup ARIA), persisté via `useStorage('pcgroup-columns', 2)`, classes BEM `--cols-2/3/4` avec minmax 340px/260px/200px, masqué sur mobile
- **Cartes de domaine enrichies** : en-tête (emoji activation + nom + Nv.X + type + domaine), meta badges (coût/portée/fréquence/rappel), tags en pills, texte feature complet. Import `getDomainById` pour résolution nom domaine.
- **Sources des capacités** : headers `.pc-card__feature-source` par groupe — "Feature d'Espoir — Classe", "Classe — X", "Ascendance — X", "Communauté — X", "Spécialisation — X · Fondation/Spécialisation/Maîtrise"
- **Onglets ARIA par carte** : 3 tabs (⚔️ Combat / ✨ Capacités / 🎒 Inventaire) remplacent les 4 `<details>`. Pattern WAI-ARIA tablist/tab/tabpanel avec navigation clavier. `v-show` pour panels. Inventaire enrichi : or + armure + items + empty state.
- Suppression bouton "Tout déplier/replier" (obsolète avec les onglets)
- Build: 406 modules, 2.39s — SessionHome chunk 36.72 kB (+5.6 kB)
- 2709 tests totaux (97 fichiers), 0 régression
- Commit: `5a879238`, pushé sur origin/main

## 2026-03-06 23:00 — Violet

### Gestion interactive PVs / Stress / Armure / Espoir en mode Jeu
- **patchCharacterById(charId, updates)** : nouvelle action characterStore — mutation par ID sans changer selectedCharacter, Object.assign + persist()
- **8 helpers dans PcGroupPanel** : incrementHP/decrementHP, incrementStress/decrementStress, incrementArmor/decrementArmor, incrementHope/decrementHope — clamping côté composant (effectiveMax*)
- **Barres HP/Stress interactives** : boutons −/+ de part et d'autre (44px touch), disabled aux bornes, ARIA labels descriptifs
- **Armure/Espoir interactifs** : boutons mini (28px) compacts de part et d'autre des valeurs
- **Sémantique Daggerheart** : HP+ = marquer dégât, HP− = soigner, Stress+ = marquer, Armure+ = utiliser slot, Espoir+ = gagner
- **Chaîne réactivité** : clic → helper → patchCharacterById → persist → enrichedCharacters recomputed → template re-rendu
- 4 tests patchCharacterById (mutation par ID, updatedAt, no-op invalide, persistance)
- 2713 tests totaux (97 fichiers), 0 régression
- Build: 406 modules, 2.48s — SessionHome chunk 39.73 kB

## 2026-03-06 23:30 — Violet

### Gestion interactive PVs / Stress / Armure / Espoir en mode Combat
- **encounterLiveStore.js** : +4 champs dans participantPcs computed — `currentHP`, `currentStress`, `armorSlotsMarked`, `hope` (lus depuis charStore.characters réactif)
- **PcSidebarCard.vue** : +HP/Stress compacts avec mini-boutons ±, `@click.stop` pour éviter la propagation vers la sélection PJ, 1.75rem touch targets
- **ContextPanel.vue** : +4 stats interactives avec barres de progression (HP rouge, Stress jaune) + Armure/Espoir compacts, 8 helpers increment/decrement, 3 helpers fillPercent, boutons 44px touch-min et 2rem compacts
- **Chaîne réactivité identique** : clic → helper → characterStore.patchCharacterById → persist → encounterLiveStore.participantPcs recomputed → template re-rendu
- 3 tests ajoutés (currentHP/currentStress/armorSlotsMarked/hope exposés, valeurs par défaut 0, réactivité via patchCharacterById)
- 2716 tests totaux (97 fichiers), 0 régression
- Build: 406 modules, 2.56s
- **Stats interactives disponibles en mode Table ET en mode Combat** — feature complète

## 2026-03-06 23:45 — Violet

### FIX : Calcul BP des Minions corrigé (règle SRD)
- **Règle SRD** : 1 groupe de minions = pcCount individus = 1 BP (avant : chaque minion comptait 1 BP)
- **constants.js** : `calculateAdversaryCost(type, quantity, pcCount=4)` — Minion : `Math.ceil(quantity / pcCount)`, autres types inchangés
- **encounterStore.js** : `adversarySlotsDetailed` utilise `calculateAdversaryCost()` + `minionGroupSize` ajouté aux slots
- **encounterLiveStore.js** : `liveBpSpent` utilise `calculateAdversaryCost()` avec pcCount dynamique
- **EncounterSlotList.vue** : affichage "1 BP/X min" pour minions, tooltip "X minions ÷ Y PJ = Z BP"
- **AdversaryPicker.vue** : affichage "1 BP/grp" pour minions
- **Tests** : +2 tests Minion spécifiques (groupes complets/partiels, pcCount par défaut)
- 2718 tests totaux (97 fichiers), 0 régression
- Build: 406 modules, 2.43s
- Commit: `b7cdabfa`, pushé sur origin/main

## 2026-03-06 24:00 — Violet

### FIX : Arrondi moitiés au supérieur (règle SRD par défaut)
- **Audit complet** : recherche de toutes les divisions par 2 dans le codebase (calculs, narratifs, UI)
- **1 calcul corrigé** : `bone-untouchable` — `Math.floor(agility / 2)` → `Math.ceil(agility / 2)`
  - SRD : "Gagnez un bonus à votre Évasion égal à la moitié de votre Agilité." — pas de mention explicite d'arrondi inférieur
  - Impact : Agilité impaire donne +1 de plus (ex: Agilité 3 → +2 Évasion au lieu de +1)
- **6 textes narratifs** mentionnent "la moitié" mais ne sont pas calculés en code (half damage sur saves, half proficiency, half card level)
- Test mis à jour : "arrondie vers le bas" → "arrondie au supérieur", attendu 2 au lieu de 1
- 2718 tests totaux, 0 régression
- Commit: `7967d5cf`, pushé sur origin/main

## 2026-03-06 25:00 — Violet

### FEATURE : Système de modulation de tier des adversaires (Tier Scaling)
- **Approche delta-based** : `statScalée = statOriginale + (benchmarkCible - benchmarkSource)` — utilise les benchmarks SRD existants (`ADVERSARY_TYPE_BENCHMARKS`)
- **tierScaling.js** (CRÉÉ) : 5 fonctions pures — `parseDamage`, `buildDamage`, `scaleStat`, `scaleDamage`, `scaleAdversaryToTier`
  - Scale : difficulty, thresholds, hp, stress, attack.modifier, attack.damage
  - Ne touche PAS : features, motives, experiences, description, focusProfile, attack.name/range/damageType
  - Minion : HP toujours 1, thresholds toujours null
  - Damage : count=targetTier (pattern SRD 1d→2d→3d→4d), die size=préservée, bonus+=delta
- **encounterStore.js** : `setSlotTierOverride(adversaryId, tier)`, `adversarySlotsDetailed` enrichi avec `originalTier` + scaling, `warnings` ignore tier mismatch si override
- **encounterLiveStore.js** : `startEncounter` applique le tierOverride avant `createLiveAdversary`
- **EncounterSlotList.vue** : sélecteur `<select>` tier (T1-T4) par slot, badge `T1→T3` violet si override, styles + CSS
- **EncounterBuilder.vue** : wiring `@set-tier-override`
- **encounter/index.js** : export `scaleAdversaryToTier` (45 exports total)
- 50 tests tierScaling, 2768+ tests totaux, 0 régression
- Build: 407 modules, 2.58s — ESLint clean
- **Limites** : features non scalées (narratives), builder uniquement (pas en combat live), BP cost inchangé (lié au type pas au tier)

## 2026-03-07 02:00 — Violet

### FEATURE : Coût BP ajusté par différentiel de tier (Approche C)
- **Formule** : `effectiveCost = max(1, baseCost + tierDelta) × quantity` où `tierDelta = adversaryTier − encounterTier`
- **Minions exemptés** : toujours `ceil(quantity/pcCount)` — coût groupe fixe indépendant du tier
- **Adversaires scalés** (tierOverride actif) : `tierDelta = 0` — stats ajustées au tier cible, coût normal
- **constants.js** : `calculateTierAdjustedCost()` fonction pure ajoutée, `lower-tier` passé de `autoDetect: true` à `autoDetect: false`
- **encounterStore.js** : `adversarySlotsDetailed` enrichi avec `tierDelta`, `adjustedUnitCost`, utilise `calculateTierAdjustedCost`, warning ≥2 tiers, `calculateAdversaryCost` retiré des imports
- **EncounterSlotList.vue** : affichage coût ajusté + base, indicateurs ↓ vert / ↑ rouge, tooltip math détaillée
- **15 nouveaux tests** : 6 calculateTierAdjustedCost + 6 store integration + 3 warning
- Tests `lower-tier` existants mis à jour (auto → manuel)
- 68 tests encounterStore, 50 tests tierScaling, build 407 modules 2.76s
- Commit: `6dbb4caf`, pushé sur origin/main
- **Résout** la dernière limite du TIER-SCALE : le coût BP reflète maintenant le différentiel de tier
