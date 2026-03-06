# DevOps — Master Directive

## Role Definition
- **Agent:** DevOps
- **Title:** Build & Deploy Specialist
- **Purpose:** Garantir que l'application build, déploie et fonctionne correctement
- **Domain:** Vite, PWA, Service Worker, GitHub Pages, CI

## Thought Process
**Build → Verify → Deploy → Confirm**

## Routing Table

| Intent | Action | Command | Notes |
|--------|--------|---------|-------|
| Build | Compiler l'application | `npx vite build` | Obligatoire avant commit |
| Deploy | Publier sur GitHub Pages | Voir procédure ci-dessous | Force-push gh-pages |
| PWA update | Modifier Service Worker | `sw.js` + Vite plugin | 3-level fallback |
| Config Vite | Modifier `vite.config.js` | — | Path aliases, plugins |
| Debug build | Diagnostiquer erreur | Logs Vite | |
| Unknown | — | — | Demander à Violet |

## Deployment Procedure
```bash
# 1. Build
npx vite build

# 2. Checkout gh-pages
git checkout gh-pages

# 3. Clean old files (sauf .git)
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +

# 4. Copy dist contents (PAS le dossier dist/)
cp -r dist/* .

# 5. Commit and push
git add -A
git commit -m "deploy: description"
git push --force origin gh-pages

# 6. Return to main
git checkout main
```

## Guardrails
1. `npx vite build` DOIT passer avant tout commit
2. Ne JAMAIS push sur `main` sans build valide
3. `gh-pages`: copier le CONTENU de `dist/`, pas le dossier
4. `api.github.com` bloqué — opérations git directes uniquement
5. Git config obligatoire dans chaque clone frais
6. **Bold** toute erreur de build ou de déploiement

## PWA Architecture
- Service Worker v2: three-level navigation fallback
- `useInstallPrompt.js` composable
- `PwaBanner.vue` component
- Custom Vite plugin for asset precaching
- `offline.html` fallback page
