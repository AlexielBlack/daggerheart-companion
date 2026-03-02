# 🗡️ Daggerheart Companion

Outil compagnon pour le **Maître du Jeu** de [Daggerheart](https://dfrpg.com/).

Application web statique déployée sur GitHub Pages.

## Fonctionnalités

- **Bibliothèque d'adversaires** — Consultez et filtrez les adversaires par tier, type, et nom
- **Constructeur de rencontres** — Préparez vos combats en amont de la session
- **Tracker de combat** — Gérez HP, Stress, Fear, et Countdowns en temps réel
- **Fiches de personnages** — Consultez et modifiez les fiches PJ
- **Lanceur de dés** — Duality Dice, pools, avantage/désavantage

## Stack technique

- **Vue 3** + Composition API
- **Vite** (build + dev server)
- **Pinia** (state management)
- **Vue Router** (lazy loading par module)
- **ESLint** (flat config + vue + accessibility)
- **Vitest** (tests unitaires)

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

## Lint & Tests

```bash
npm run lint
npm run test:run
```

## Architecture

```
src/
├── core/           # Module noyau (layout, composables, utils)
├── data/           # Données de jeu (JSON statique)
├── modules/
│   ├── adversaries/    # Bibliothèque d'adversaires
│   ├── encounter/      # Constructeur & tracker de rencontres
│   ├── characters/     # Fiches PJ
│   └── dice/           # Lanceur de dés
├── router/
└── styles/
```

Chaque module est isolé avec un **error boundary** : un crash dans un module ne casse pas les autres.

## Licence

Usage personnel — basé sur le SRD de Daggerheart.
