# CORRECTIONS — Daggerheart Companion

Append-only log of errors found and corrections applied.

---

## 2026-03-06 12:00 — Violet (initialized from project history)

### SRD Data Fabrication (CRITICAL — multiple occurrences)
**Error:** Multiple past sessions produced fabricated game data not present in official SRD
**Correction:** All data modules now verified against official SRD PDFs
**Prevention:** Agent Data has mandatory PDF verification reflex. Never trust unverified data.

### Test Isolation Failures
**Error:** Tests using `useStorage`-backed Pinia stores leaked state between test cases
**Correction:** Added `localStorage.clear()` in `beforeEach` for all affected test suites
**Prevention:** Testing agent checks for this pattern in every new test file

### Null-Safety on Minion Adversaries
**Error:** Minion-type adversaries have `thresholds: null`, causing crashes in templates accessing sub-properties
**Correction:** All template and store code guards with `adversary.thresholds &&` before accessing
**Prevention:** Data agent flags all optional fields, Frontend agent adds null guards

### Glossary False Positives (French)
**Error:** French word "standard" falsely matched adversary type glossary entry
**Correction:** Added word-level context checking in glossary regex matcher
**Prevention:** Keenness watches for similar cross-language matching issues

### ArrayFieldEditor Initialization
**Error:** `tags` and `multi_select` fields initialized as `''` instead of `[]`
**Correction:** `ArrayFieldEditor` now initializes these fields as empty arrays
**Prevention:** Data agent schema validation enforces array initialization

### CI Lint Failures from Test Files
**Error:** Unused imports in test files blocked CI deployment pipeline
**Correction:** ESLint check added to test files before commit
**Prevention:** Testing agent always runs `npx eslint` on test files

### PDF Extraction Method
**Error:** PyMuPDF returns empty blocks on SRD PDF files
**Correction:** Use ZIP extraction: `cp file.pdf dir/file.zip && unzip -o file.zip '*.txt'`
**Prevention:** DevOps agent documents correct extraction method in directives

### Domain Card Level-Gate Filter
**Error:** Only 2 cards appearing at level 1 due to filtering bug
**Correction:** Bug resolved (details in project history)
**Prevention:** Data agent verifies filter logic against expected card counts

### Arrondi moitiés : floor → ceil (règle SRD par défaut)
**Error:** `bone-untouchable` utilisait `Math.floor(agility / 2)` alors que la règle SRD par défaut est d'arrondir au supérieur
**Correction:** Changé en `Math.ceil(agility / 2)`. Le SRD ne mentionne pas explicitement "arrondi inférieur" pour cette carte.
**Prevention:** Toute division par 2 pour un bonus/malus doit utiliser `Math.ceil` sauf mention contraire explicite dans le texte SRD. Audit réalisé : 1 calcul corrigé, 6 textes narratifs non-impactés.

### Persistance localStorage avalée silencieusement (homebrew CRUD)
**Date:** 2026-06-20 12:12 — Violet
**Error:** `useStorage.save()` (`src/core/composables/useStorage.js`) attrapait les erreurs d'écriture (QuotaExceededError, corruption) sans les remonter. Le factory store homebrew (`useHomebrewStore.js`) mutait `storedItems.value` et retournait `success: true` sans vérifier que l'écriture disque avait réussi. Symptômes signalés par 2J : « impossible de créer plus de 3 adversaires custom, le 4è ne s'enregistre pas » + « adversaires custom non synchronisés à l'export ». Cause racine commune : l'écriture échouait (probablement quota localStorage saturé à la limite ~5 Mo), l'item restait en mémoire (count++) mais jamais sur disque → invisible après rechargement ET absent de `exportAllData()` qui lit localStorage directement.
**Correction:** `save()` retourne désormais un booléen. Ajout d'un helper `commit()` dans le factory store : toutes les mutations (create/update/remove/createFromTemplate/importItems/clearAll) écrivent via `commit()` et retournent `{ success: false, error }` si la persistance échoue — sans laisser d'item fantôme en mémoire. L'éditeur (`HomebrewAdversaryEditor.vue`) affiche déjà `submitError`, donc l'utilisateur voit maintenant le vrai message (ex. « Espace de stockage insuffisant ») au lieu de « rien ne se passe ». 2 tests de régression ajoutés (create/update sous quota). 223 tests verts, ESLint clean, build OK.
**Prevention:** Toute écriture localStorage critique doit vérifier le retour de `save()`. Ne jamais considérer une mutation réussie sans confirmation de persistance. NB : le correctif rend l'échec visible mais NE libère PAS l'espace — si le quota est réellement saturé, l'utilisateur doit purger des données (diagnostic console fourni). Bug connexe NON corrigé : `encounterStore.js:88` & `:429` résolvent les slots uniquement contre `allAdversaries` (SRD) → un adversaire custom ajouté à une rencontre disparaît silencieusement (`filter(Boolean)` l.113).

### [MAJ] Cause racine CONFIRMÉE : persistance asynchrone, pas le quota
**Date:** 2026-06-20 12:35 — Violet
**Confirmation:** Diagnostic interactif avec 2J (localStorage total = 79.5 Ko → quota EXCLU). Test d'isolation décisif : (1) un MARQUEUR posé puis F5 → préservé ; (2) création d'un adversaire → le nouvel item N'EST PAS écrit sur disque (seul le MARQUEUR reste), bien que l'écran revienne à la liste (create « réussi » en mémoire). **La persistance reposait sur le watcher asynchrone de `useStorage` ; `create()` enchaînait `router.push()` avant que le watcher ne flush → écriture perdue.** D'où : items visibles en session mais absents au rechargement ET de l'export (qui lit le disque). Le « 3 » était fortuit (items persistés à un moment antérieur). NB : 2J est en prod GitHub Pages — le Service Worker servait l'ancien bundle.
**Correction (déployée):** `commit()` écrit de façon SYNCHRONE et vérifiée dans `create/update/remove/createFromTemplate/importItems/clearAll`. Test de régression « écrit sur disque immédiatement sans tick » ajouté. + Bug connexe corrigé : `encounterStore` & `encounterLiveStore` résolvent désormais les adversaires custom (helper `resolveAdversary` = SRD + homebrew) aux lignes de slots/renforts — avant, un adversaire custom dans une rencontre disparaissait. 2927 tests verts, build OK.
**Incident:** Pendant le diagnostic, une commande console de test a écrasé la vraie clé `dh-homebrew-adversaires` (3 adversaires de 2J perdus : Veylentis, Sanglot Errant, Murmure amer). Leçon : NE JAMAIS utiliser la clé de prod pour un marqueur de test — utiliser une clé temporaire dédiée.
**Sécurité:** Le remote git de 2J contient un PAT GitHub en clair dans l'URL (`.git/config`). Recommandé : révoquer + passer à un credential helper / SSH.
