# Teaching Protocol: Cross-Session Knowledge Transfer

## Purpose

Every session extracts valuable knowledge for future sessions. This is not optional — it is a core organizational behavior that makes the project smarter over time.

## Knowledge Capture

After completing substantive work, evaluate:
1. What pattern, bug, or solution was discovered?
2. Can it be expressed as a reusable principle?
3. Should it go in CORRECTIONS.md, DECISIONS.md, or BLINDSPOTS.md?

## Fragment Format

```markdown
---
domain: [frontend/data/testing/devops/architecture]
confidence: [high/moderate/low]
source_agent: [evolution/improvement/keenness/violet/frontend/data/testing/devops]
date: YYYY-MM-DD
type: [principle/procedure/correction/pattern]
---

## [Nom du Principe]
[Instructions claires et impératives]

## Quand Appliquer
[Conditions de déclenchement]

## Anti-Pattern
[Ce qu'il ne faut PAS faire]
```

## Key Learnings Already Captured

These are verified principles from past sessions:

1. **SRD Data Fabrication Risk** — Multiple phases discovered fabricated data. ALWAYS verify against PDFs.
2. **Test Isolation** — `localStorage.clear()` in `beforeEach` for `useStorage`-backed stores.
3. **Null-Safety** — Minion adversaries have `thresholds: null`. Guard all optional field access.
4. **PDF Extraction** — SRD PDFs are ZIPs: `cp file.pdf dir/file.zip && unzip -o file.zip '*.txt'`
5. **Glossary False Positives** — French text can trigger wrong glossary matches. Use word-level context.
6. **ArrayFieldEditor Init** — Tags and multi_select fields must initialize as `[]` not `''`.
7. **CI Lint Failures** — Unused imports in test files block deployment. Always ESLint-check tests.
8. **GitHub API Blocked** — `api.github.com` blocked by proxy. Only direct git operations work.

## Session End Checklist

Before ending any substantive session:
- [ ] New patterns documented in appropriate Memory file
- [ ] STATE.md updated if features changed
- [ ] TASKBOARD.md updated if tasks changed
- [ ] Summary table provided to human
