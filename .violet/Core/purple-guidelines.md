# Purple Guidelines — Daggerheart Companion

## Standing Rules

### Git Workflow
- Commits en français
- Sprint flow: implement → ESLint fix → `npx vite build` → tests ciblés → commit → update Memory
- Force-push `dist/` to `gh-pages` branch for deployment
- Token embedded in HTTPS URL for git operations
- `user.email` and `user.name` must be set in each fresh clone

### Testing Policy
- Tests ciblés après chaque changement: `npx vitest run [path]`
- Tests globaux UNIQUEMENT à la demande (> 1 min de traitement)
- `localStorage.clear()` dans `beforeEach` pour les stores `useStorage`
- Constantes hardcodées dans les tests, jamais de getters computed réactifs
- Descriptions de tests en français

### ESLint Policy
- `npx eslint [file]` pour vérification ciblée
- `npx eslint --fix` pour auto-correction
- Zéro warning avant commit
- Les imports inutilisés dans les fichiers test bloquent la CI

### Module Structure
Chaque module expose une API publique via `index.js`:
```
module/
  ├── stores/
  ├── components/
  ├── composables/
  ├── constants/
  └── index.js  ← exports centralisés
```

### SRD Data Extraction
- Les PDFs SRD sont des archives ZIP contenant des `.txt` numérotés
- Extraction fiable: `cp file.pdf dir/file.zip && unzip -o file.zip '*.txt'`
- PyMuPDF retourne des blocs vides sur ces fichiers — ne pas utiliser
- Les PDFs homebrew sont image-only — utiliser project knowledge search

### Deployment
- `gh-pages` branch: copier le contenu de `dist/*` (pas le dossier lui-même) à la racine
- `api.github.com` bloqué par proxy — seules les opérations git directes sur `github.com` fonctionnent

### Cadence
- Medium-scope deliverables: un module complet par session
- Status check avant chaque nouvelle phase
- Résumé structuré en fin de session (tableau)

## Glossary of Project Terms

| Term | Meaning |
|------|---------|
| SRD | System Reference Document — données officielles Daggerheart |
| Homebrew | Contenu personnalisé créé par l'utilisateur |
| Domain Card | Carte de domaine magique avec niveau et effets |
| Duality Dice | 2d12 Hope+Fear, mécanique centrale de Daggerheart |
| PNJ/NPC | Personnage Non-Joueur |
| PJ/PC | Personnage Joueur |
| Adversary | Créature/ennemi avec stat block |
| Community | Communauté d'origine du personnage |
| Ancestry | Race/espèce du personnage |
