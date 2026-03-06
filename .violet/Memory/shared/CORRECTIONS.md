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
