# Navigation Refactor — Phase 1 : Infrastructure

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remplacer la navigation par modes (Lecture/Edition/Jeu) par une navigation plate a 3 entrees (Compendium/Table/Sync). Cette Phase 1 couvre l'infrastructure de navigation. La Phase 2 (plan separe) couvrira l'unification SRD+homebrew, les panneaux contextuels, le deep-linking, et la decomposition de SessionHome.

**Architecture:** Restructuration du router en 13 routes pages + redirects legacy. Deux nouvelles vues conteneurs (CompendiumView, TableView) avec onglets internes et sous-routes. Les composants metier existants sont reutilises sans modification de leur logique interne.

**Tech Stack:** Vue 3 (Options API composants, Composition API stores), Vue Router 4, Pinia, Vite, Vitest

**Spec:** `docs/superpowers/specs/2026-03-19-navigation-refactor-design.md`

---

## Phases du projet

| Phase | Scope | Plan |
|-------|-------|------|
| **Phase 1 (ce plan)** | Infrastructure navigation : router, AppShell, AppNav, CompendiumView (onglets), TableView (onglets), suppression des modes, redirects legacy | Ce document |
| **Phase 2 (plan separe)** | Unification SRD+homebrew dans les browsers (badges, filtres, edition inline), panneau contextuel Table, deep-linking `:id`, decomposition SessionHome en onglets Table | A planifier apres Phase 1 |

A la fin de Phase 1, l'app fonctionne avec la nouvelle navigation mais les browsers restent en lecture SRD seule (comme avant), et la Table affiche les vues existantes telles quelles dans des onglets.

---

## File Structure

### Files to CREATE

| File | Responsibility |
|------|---------------|
| `src/core/components/CompendiumView.vue` | Conteneur a onglets pour les 7 browsers. Rend le browser actif via `<router-view />`. |
| `src/core/components/TableView.vue` | Conteneur a onglets pour les 5 outils de jeu. Rend la vue active via `<router-view />`. |
| `src/core/components/__tests__/AppNav.test.js` | Tests du nouveau AppNav |
| `src/core/components/__tests__/CompendiumView.test.js` | Tests CompendiumView |
| `src/core/components/__tests__/TableView.test.js` | Tests TableView |
| `src/router/__tests__/router.test.js` | Tests des routes et redirects legacy |

### Files to MODIFY

| File | Changes |
|------|---------|
| `src/router/index.js` | Remplacement complet des routes : 13 routes pages + redirects legacy |
| `src/core/components/AppShell.vue` | Suppression ModeSelector, icone sync. Header simplifie. |
| `src/core/components/AppNav.vue` | Remplacement complet : 3 liens statiques, plus de dropdown/MODE_NAV |
| `src/core/utils/constants.js` | Suppression MODE_NAV et NAV_ITEMS |
| `src/modules/adversaries/views/AdversaryBrowser.vue` | Retrait ModuleBoundary wrapper (gere par CompendiumView) |
| `src/modules/environments/views/EnvironmentBrowser.vue` | Idem |
| `src/modules/characters/views/ClassBrowser.vue` | Idem |
| `src/modules/characters/views/AncestryBrowser.vue` | Idem |
| `src/modules/communities/views/CommunityBrowser.vue` | Idem |
| `src/modules/domains/views/DomainBrowser.vue` | Idem |
| `src/modules/equipment/views/EquipmentBrowser.vue` | Idem |
| `src/modules/characters/views/CharacterBuilder.vue` | Retrait ModuleBoundary |
| `src/modules/npcs/views/NpcManager.vue` | Idem |
| `src/modules/encounter/views/EncounterBuilder.vue` | Idem |
| `src/modules/encounter/views/EncounterLive.vue` | Retrait ModuleBoundary, correction liens internes |
| `src/modules/dice/views/DiceRoller.vue` | Retrait ModuleBoundary |
| `src/modules/sync/views/SyncManager.vue` | Retrait ModuleBoundary si present |
| `src/modules/homebrew/index.js` | Retirer export HomebrewHub |
| `src/modules/session/index.js` | Retirer export SessionHome |
| Tous les fichiers avec liens `/edition/*`, `/jeu/*`, `/lecture/*` | Mise a jour vers les nouvelles routes |

### Files to DELETE

| File | Reason |
|------|--------|
| `src/core/components/ModeSelector.vue` | Plus de modes |
| `src/modules/homebrew/views/HomebrewHub.vue` | Gateway remplacee par onglets Compendium |
| `src/modules/homebrew/__tests__/HomebrewHub.test.js` | Test du composant supprime |

### Files CONSERVES pour Phase 2

Les 14 vues homebrew (HomebrewAdversaryList/Editor, etc.) restent dans le code. Elles ne sont plus accessibles via le router en Phase 1 mais seront reintegrees dans les browsers du Compendium en Phase 2 (edition inline).

---

## Task 1: Simplifier AppNav — 3 liens statiques

**Files:**
- Modify: `src/core/components/AppNav.vue`
- Modify: `src/core/utils/constants.js`
- Create: `src/core/components/__tests__/AppNav.test.js`

- [ ] **Step 1: Creer le repertoire de tests si necessaire**

```bash
mkdir -p src/core/components/__tests__
```

- [ ] **Step 2: Ecrire le test pour le nouveau AppNav**

```javascript
// src/core/components/__tests__/AppNav.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppNav from '../AppNav.vue'

function makeRouter(initialRoute = '/compendium/adversaires') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/compendium/:rest(.*)?', name: 'compendium', component: { template: '<div/>' } },
      { path: '/table/:rest(.*)?', name: 'table', component: { template: '<div/>' } },
      { path: '/sync', name: 'sync', component: { template: '<div/>' } }
    ]
  })
  router.push(initialRoute)
  return router
}

describe('AppNav', () => {
  it('affiche exactement 3 liens de navigation', async () => {
    const router = makeRouter()
    await router.isReady()
    const wrapper = mount(AppNav, {
      props: { isOpen: true },
      global: { plugins: [router] }
    })
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(3)
    expect(links[0].text()).toContain('Compendium')
    expect(links[1].text()).toContain('Table')
    expect(links[2].text()).toContain('Sync')
  })

  it('marque le lien actif avec aria-current=page', async () => {
    const router = makeRouter('/compendium/adversaires')
    await router.isReady()
    const wrapper = mount(AppNav, {
      props: { isOpen: true },
      global: { plugins: [router] }
    })
    const compendiumLink = wrapper.findAll('a')[0]
    expect(compendiumLink.attributes('aria-current')).toBe('page')
  })

  it('n\'a pas de dropdown ni de bouton', async () => {
    const router = makeRouter()
    await router.isReady()
    const wrapper = mount(AppNav, {
      props: { isOpen: true },
      global: { plugins: [router] }
    })
    expect(wrapper.findAll('button')).toHaveLength(0)
    expect(wrapper.findAll('[role="menu"]')).toHaveLength(0)
  })
})
```

- [ ] **Step 3: Verifier que le test echoue**

Run: `npx vitest run src/core/components/__tests__/AppNav.test.js`
Expected: FAIL (AppNav actuel a plus de 3 liens)

- [ ] **Step 4: Reecrire AppNav en 3 liens statiques**

Remplacer le contenu de `src/core/components/AppNav.vue` :

```vue
<template>
  <nav
    class="app-nav"
    :class="{ 'app-nav--open': isOpen }"
    aria-label="Navigation principale"
  >
    <ul class="app-nav__list">
      <li v-for="item in navItems" :key="item.id">
        <router-link
          :to="item.route"
          class="app-nav__link"
          :aria-current="isActive(item) ? 'page' : undefined"
          @click="$emit('navigate')"
        >
          <span class="app-nav__icon" aria-hidden="true">{{ item.icon }}</span>
          <span class="app-nav__label">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
import { useRoute } from 'vue-router'

const NAV_ITEMS = [
  { id: 'compendium', label: 'Compendium', icon: '📖', route: '/compendium', matchPrefix: '/compendium' },
  { id: 'table', label: 'Table', icon: '🎮', route: '/table', matchPrefix: '/table' },
  { id: 'sync', label: 'Sync', icon: '🔄', route: '/sync', matchPrefix: '/sync' }
]

export default {
  name: 'AppNav',
  props: {
    isOpen: { type: Boolean, default: false }
  },
  emits: ['navigate'],
  setup() {
    const route = useRoute()

    function isActive(item) {
      return route.path.startsWith(item.matchPrefix)
    }

    return { navItems: NAV_ITEMS, isActive }
  }
}
</script>

<style scoped>
.app-nav__list {
  display: flex;
  gap: var(--space-md, 1rem);
  list-style: none;
  margin: 0;
  padding: 0;
}

.app-nav__link {
  display: flex;
  align-items: center;
  gap: var(--space-xs, 0.25rem);
  padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
  color: var(--color-text-secondary, #aaa);
  text-decoration: none;
  border-radius: var(--radius-sm, 4px);
  transition: color var(--transition-fast, 0.15s), background var(--transition-fast, 0.15s);
}

.app-nav__link:hover {
  color: var(--color-text, #fff);
  background: var(--color-surface-hover, rgba(255,255,255,0.08));
}

.app-nav__link[aria-current='page'] {
  color: var(--color-hope, #f0c040);
  font-weight: 600;
}

.app-nav__icon { font-size: 1.1em; }

/* Mobile */
@media (max-width: 768px) {
  .app-nav {
    display: none;
    position: fixed;
    top: var(--header-height, 3.5rem);
    left: 0;
    right: 0;
    background: var(--color-surface, #1a1a2e);
    padding: var(--space-md, 1rem);
    z-index: 300;
    box-shadow: var(--shadow-lg);
  }
  .app-nav--open { display: block; }
  .app-nav__list { flex-direction: column; }
  .app-nav__link { padding: var(--space-sm, 0.5rem) var(--space-md, 1rem); }
}
</style>
```

- [ ] **Step 5: Supprimer MODE_NAV et NAV_ITEMS de constants.js**

Dans `src/core/utils/constants.js`, supprimer les exports `MODE_NAV` (lignes 129-163) et `NAV_ITEMS` (lignes 87-124). Conserver toutes les autres constantes (TIER_LABELS, TRAITS, etc.).

- [ ] **Step 6: Verifier que le test passe**

Run: `npx vitest run src/core/components/__tests__/AppNav.test.js`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/core/components/AppNav.vue src/core/utils/constants.js src/core/components/__tests__/AppNav.test.js
git commit -m "refactor(nav): remplacer AppNav dynamique par 3 liens statiques"
```

---

## Task 2: Simplifier AppShell — supprimer ModeSelector et icone Sync

**Files:**
- Modify: `src/core/components/AppShell.vue`
- Delete: `src/core/components/ModeSelector.vue`

- [ ] **Step 1: Modifier AppShell.vue**

Dans le template, supprimer :
- La ligne `<ModeSelector @navigate="closeNav" />`
- Le bloc `<router-link to="/edition/sync" class="app-shell__sync-shortcut">🔄</router-link>`
- Mettre a jour le lien dice : `to="/jeu/des"` → `to="/table/des"`

Dans le script :
- Supprimer l'import de `ModeSelector`
- Supprimer `ModeSelector` de la liste `components`

Dans le style :
- Supprimer les classes CSS relatives a `.mode-selector` et `.app-shell__sync-shortcut`

- [ ] **Step 2: Supprimer ModeSelector.vue**

```bash
git rm src/core/components/ModeSelector.vue
```

- [ ] **Step 3: Verifier que le build passe**

Run: `npx vite build`
Expected: Build success (pas de reference cassee a ModeSelector)

- [ ] **Step 4: Commit**

```bash
git add src/core/components/AppShell.vue
git commit -m "refactor(nav): simplifier AppShell, supprimer ModeSelector et icone Sync"
```

---

## Task 3: Creer les stubs CompendiumView et TableView

Ces fichiers doivent exister AVANT la restructuration du router (Task 4) car le router les importe.

**Files:**
- Create: `src/core/components/CompendiumView.vue`
- Create: `src/core/components/TableView.vue`

- [ ] **Step 1: Creer CompendiumView stub**

```vue
<!-- src/core/components/CompendiumView.vue -->
<template>
  <div class="compendium-view">
    <router-view />
  </div>
</template>

<script>
export default { name: 'CompendiumView' }
</script>
```

- [ ] **Step 2: Creer TableView stub**

```vue
<!-- src/core/components/TableView.vue -->
<template>
  <div class="table-view">
    <router-view />
  </div>
</template>

<script>
export default { name: 'TableView' }
</script>
```

- [ ] **Step 3: Commit**

```bash
git add src/core/components/CompendiumView.vue src/core/components/TableView.vue
git commit -m "refactor(nav): creer stubs CompendiumView et TableView"
```

---

## Task 4: Restructurer le router — nouvelles routes + redirects legacy

**Files:**
- Modify: `src/router/index.js`
- Create: `src/router/__tests__/router.test.js`

- [ ] **Step 1: Reecrire le router**

Remplacer le contenu de `src/router/index.js`. Note : la map `HOMEBREW_CATEGORY_MAP` traduit les noms de categories anglais vers les chemins francais pour les redirects legacy.

```javascript
import { createRouter, createWebHistory } from 'vue-router'

const CompendiumView = () => import('@core/components/CompendiumView.vue')
const TableView = () => import('@core/components/TableView.vue')

// Browsers (Compendium tabs)
const AdversaryBrowser = () => import('@modules/adversaries/views/AdversaryBrowser.vue')
const EnvironmentBrowser = () => import('@modules/environments/views/EnvironmentBrowser.vue')
const ClassBrowser = () => import('@modules/characters/views/ClassBrowser.vue')
const DomainBrowser = () => import('@modules/domains/views/DomainBrowser.vue')
const AncestryBrowser = () => import('@modules/characters/views/AncestryBrowser.vue')
const CommunityBrowser = () => import('@modules/communities/views/CommunityBrowser.vue')
const EquipmentBrowser = () => import('@modules/equipment/views/EquipmentBrowser.vue')

// Table tabs
const CharacterBuilder = () => import('@modules/characters/views/CharacterBuilder.vue')
const NpcManager = () => import('@modules/npcs/views/NpcManager.vue')
const EncounterBuilder = () => import('@modules/encounter/views/EncounterBuilder.vue')
const EncounterLive = () => import('@modules/encounter/views/EncounterLive.vue')
const DiceRoller = () => import('@modules/dice/views/DiceRoller.vue')

// Standalone
const SyncManager = () => import('@modules/sync/views/SyncManager.vue')
const ErrorFallback = () => import('@core/components/ErrorFallback.vue')

/** Map des categories homebrew anglais → chemins compendium francais */
const HOMEBREW_CATEGORY_MAP = {
  adversary: 'adversaires',
  ancestry: 'ascendances',
  class: 'classes',
  community: 'communautes',
  domain: 'domaines',
  environment: 'environnements',
  equipment: 'equipement'
}

const routes = [
  // --- Root redirect ---
  { path: '/', redirect: '/compendium' },

  // --- Compendium (7 browsers as nested routes) ---
  {
    path: '/compendium',
    component: CompendiumView,
    redirect: '/compendium/adversaires',
    children: [
      { path: 'adversaires/:id?', name: 'compendium-adversaires', component: AdversaryBrowser, meta: { title: 'Adversaires', module: 'adversaries', tab: 'adversaires' } },
      { path: 'environnements/:id?', name: 'compendium-environnements', component: EnvironmentBrowser, meta: { title: 'Environnements', module: 'environments', tab: 'environnements' } },
      { path: 'classes/:id?', name: 'compendium-classes', component: ClassBrowser, meta: { title: 'Classes', module: 'characters', tab: 'classes' } },
      { path: 'domaines/:id?', name: 'compendium-domaines', component: DomainBrowser, meta: { title: 'Domaines', module: 'domains', tab: 'domaines' } },
      { path: 'ascendances/:id?', name: 'compendium-ascendances', component: AncestryBrowser, meta: { title: 'Ascendances', module: 'characters', tab: 'ascendances' } },
      { path: 'communautes/:id?', name: 'compendium-communautes', component: CommunityBrowser, meta: { title: 'Communautes', module: 'communities', tab: 'communautes' } },
      { path: 'equipement/:id?', name: 'compendium-equipement', component: EquipmentBrowser, meta: { title: 'Equipement', module: 'equipment', tab: 'equipement' } }
    ]
  },

  // --- Table de jeu (5 tools as nested routes) ---
  {
    path: '/table',
    component: TableView,
    redirect: '/table/pjs',
    children: [
      { path: 'pjs', name: 'table-pjs', component: CharacterBuilder, meta: { title: 'Personnages', module: 'characters', tab: 'pjs' } },
      { path: 'pnjs', name: 'table-pnjs', component: NpcManager, meta: { title: 'PNJs', module: 'npcs', tab: 'pnjs' } },
      { path: 'rencontres', name: 'table-rencontres', component: EncounterBuilder, meta: { title: 'Rencontres', module: 'encounter', tab: 'rencontres' } },
      { path: 'combat', name: 'table-combat', component: EncounterLive, meta: { title: 'Combat', module: 'encounter', tab: 'combat' } },
      { path: 'des', name: 'table-des', component: DiceRoller, meta: { title: 'Des', module: 'dice', tab: 'des' } }
    ]
  },

  // --- Sync ---
  { path: '/sync', name: 'sync', component: SyncManager, meta: { title: 'Synchronisation', module: 'sync' } },

  // --- Legacy redirects: lecture → compendium ---
  { path: '/lecture/adversaires', redirect: '/compendium/adversaires' },
  { path: '/lecture/environnements', redirect: '/compendium/environnements' },
  { path: '/lecture/classes', redirect: '/compendium/classes' },
  { path: '/lecture/domaines', redirect: '/compendium/domaines' },
  { path: '/lecture/ascendances', redirect: '/compendium/ascendances' },
  { path: '/lecture/communautes', redirect: '/compendium/communautes' },
  { path: '/lecture/equipement', redirect: '/compendium/equipement' },

  // --- Legacy redirects: edition → table/compendium ---
  { path: '/edition/personnages', redirect: '/table/pjs' },
  { path: '/edition/rencontres', redirect: '/table/rencontres' },
  { path: '/edition/pnjs', redirect: '/table/pnjs' },
  { path: '/edition/homebrew', redirect: '/compendium' },
  {
    path: '/edition/homebrew/:category/:id?',
    redirect: (to) => {
      const frCategory = HOMEBREW_CATEGORY_MAP[to.params.category] || to.params.category
      return `/compendium/${frCategory}${to.params.id ? '/' + to.params.id : ''}`
    }
  },
  { path: '/edition/sync', redirect: '/sync' },

  // --- Legacy redirects: jeu → table ---
  { path: '/jeu/table', redirect: '/table' },
  { path: '/jeu/combat', redirect: '/table/combat' },
  { path: '/jeu/des', redirect: '/table/des' },
  { path: '/jeu', redirect: '/table' },

  // --- Legacy redirects: old english routes ---
  { path: '/adversaries', redirect: '/compendium/adversaires' },
  { path: '/environments', redirect: '/compendium/environnements' },
  { path: '/characters', redirect: '/table/pjs' },
  { path: '/characters/classe', redirect: '/compendium/classes' },
  { path: '/characters/domaines', redirect: '/compendium/domaines' },
  { path: '/characters/ascendance', redirect: '/compendium/ascendances' },
  { path: '/characters/communaute', redirect: '/compendium/communautes' },
  { path: '/characters/equipement', redirect: '/compendium/equipement' },
  { path: '/encounters', redirect: '/table/rencontres' },
  { path: '/encounters/live', redirect: '/table/combat' },
  { path: '/npcs', redirect: '/table/pnjs' },
  { path: '/dice', redirect: '/table/des' },
  {
    path: '/homebrew/:category?/:id?',
    redirect: (to) => {
      if (!to.params.category) return '/compendium'
      const frCategory = HOMEBREW_CATEGORY_MAP[to.params.category] || to.params.category
      return `/compendium/${frCategory}${to.params.id ? '/' + to.params.id : ''}`
    }
  },

  // --- 404 ---
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: ErrorFallback,
    meta: { title: 'Page non trouvee' }
  }
]

const router = createRouter({
  history: createWebHistory('/daggerheart-companion/'),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} — Daggerheart Companion`
    : 'Daggerheart Companion'
})

export default router
```

- [ ] **Step 2: Ecrire les tests du router**

```javascript
// src/router/__tests__/router.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import router from '../index.js'

// On utilise le router reel exporte. Pour les tests de redirection,
// on pousse une route et on verifie le chemin resultant.

describe('Router - nouvelles routes', () => {
  it('/ redirige vers /compendium/adversaires', async () => {
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/compendium/adversaires')
  })

  it('/compendium redirige vers /compendium/adversaires', async () => {
    await router.push('/compendium')
    expect(router.currentRoute.value.path).toBe('/compendium/adversaires')
  })

  it('/compendium/adversaires a le bon meta', async () => {
    await router.push('/compendium/adversaires')
    expect(router.currentRoute.value.name).toBe('compendium-adversaires')
    expect(router.currentRoute.value.meta.module).toBe('adversaries')
    expect(router.currentRoute.value.meta.tab).toBe('adversaires')
  })

  it('/table redirige vers /table/pjs', async () => {
    await router.push('/table')
    expect(router.currentRoute.value.path).toBe('/table/pjs')
  })

  it('/table/combat a le bon meta', async () => {
    await router.push('/table/combat')
    expect(router.currentRoute.value.name).toBe('table-combat')
    expect(router.currentRoute.value.meta.module).toBe('encounter')
  })

  it('/sync resout correctement', async () => {
    await router.push('/sync')
    expect(router.currentRoute.value.name).toBe('sync')
  })
})

describe('Router - redirects legacy', () => {
  it('/lecture/adversaires → /compendium/adversaires', async () => {
    await router.push('/lecture/adversaires')
    expect(router.currentRoute.value.path).toBe('/compendium/adversaires')
  })

  it('/edition/personnages → /table/pjs', async () => {
    await router.push('/edition/personnages')
    expect(router.currentRoute.value.path).toBe('/table/pjs')
  })

  it('/jeu/combat → /table/combat', async () => {
    await router.push('/jeu/combat')
    expect(router.currentRoute.value.path).toBe('/table/combat')
  })

  it('/edition/homebrew → /compendium', async () => {
    await router.push('/edition/homebrew')
    expect(router.currentRoute.value.path).toBe('/compendium/adversaires')
  })

  it('/edition/homebrew/adversary → /compendium/adversaires (traduction EN→FR)', async () => {
    await router.push('/edition/homebrew/adversary')
    expect(router.currentRoute.value.path).toBe('/compendium/adversaires')
  })

  it('/edition/homebrew/ancestry → /compendium/ascendances (traduction EN→FR)', async () => {
    await router.push('/edition/homebrew/ancestry')
    expect(router.currentRoute.value.path).toBe('/compendium/ascendances')
  })

  it('/homebrew/adversary → /compendium/adversaires (old english)', async () => {
    await router.push('/homebrew/adversary')
    expect(router.currentRoute.value.path).toBe('/compendium/adversaires')
  })
})
```

- [ ] **Step 3: Verifier que les tests passent**

Run: `npx vitest run src/router/__tests__/router.test.js`
Expected: PASS

- [ ] **Step 4: Verifier le build**

Run: `npx vite build`
Expected: Build success

- [ ] **Step 5: Commit**

```bash
mkdir -p src/router/__tests__
git add src/router/index.js src/router/__tests__/router.test.js
git commit -m "refactor(router): restructurer les routes en Compendium/Table/Sync avec redirects legacy"
```

---

## Task 5: Implementer CompendiumView — onglets

**Files:**
- Modify: `src/core/components/CompendiumView.vue`
- Create: `src/core/components/__tests__/CompendiumView.test.js`

- [ ] **Step 1: Ecrire les tests**

```javascript
// src/core/components/__tests__/CompendiumView.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import CompendiumView from '../CompendiumView.vue'

const StubBrowser = { template: '<div class="stub-browser">Browser</div>' }

function makeRouter(initialRoute = '/compendium/adversaires') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{
      path: '/compendium',
      component: CompendiumView,
      redirect: '/compendium/adversaires',
      children: [
        { path: 'adversaires', name: 'compendium-adversaires', component: StubBrowser, meta: { tab: 'adversaires', title: 'Adversaires' } },
        { path: 'classes', name: 'compendium-classes', component: StubBrowser, meta: { tab: 'classes', title: 'Classes' } }
      ]
    }]
  })
  router.push(initialRoute)
  return router
}

describe('CompendiumView', () => {
  it('affiche les onglets de navigation', async () => {
    const router = makeRouter()
    await router.isReady()
    const wrapper = mount(CompendiumView, { global: { plugins: [router] } })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs.length).toBe(7)
  })

  it('marque l\'onglet actif avec aria-selected', async () => {
    const router = makeRouter('/compendium/adversaires')
    await router.isReady()
    const wrapper = mount(CompendiumView, { global: { plugins: [router] } })
    const activeTab = wrapper.find('[aria-selected="true"]')
    expect(activeTab.exists()).toBe(true)
    expect(activeTab.text()).toContain('Adversaires')
  })

  it('contient un router-view pour le browser actif', async () => {
    const router = makeRouter('/compendium/adversaires')
    await router.isReady()
    const wrapper = mount(CompendiumView, { global: { plugins: [router] } })
    expect(wrapper.find('.stub-browser').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Verifier que les tests echouent**

Run: `npx vitest run src/core/components/__tests__/CompendiumView.test.js`
Expected: FAIL (CompendiumView est un stub sans onglets)

- [ ] **Step 3: Implementer CompendiumView**

```vue
<!-- src/core/components/CompendiumView.vue -->
<template>
  <ModuleBoundary :module-name="currentTitle" :module-id="`compendium-${currentTab}`">
    <div class="compendium-view">
      <nav class="compendium-view__tabs" aria-label="Categories du compendium">
        <ul role="tablist">
          <li v-for="tab in tabs" :key="tab.id" role="presentation">
            <router-link
              :to="`/compendium/${tab.id}`"
              role="tab"
              :aria-selected="currentTab === tab.id ? 'true' : 'false'"
              class="compendium-view__tab"
              :class="{ 'compendium-view__tab--active': currentTab === tab.id }"
            >
              <span class="compendium-view__tab-icon" aria-hidden="true">{{ tab.icon }}</span>
              <span class="compendium-view__tab-label">{{ tab.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>

      <div class="compendium-view__content">
        <router-view />
      </div>
    </div>
  </ModuleBoundary>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ModuleBoundary from './ModuleBoundary.vue'

const COMPENDIUM_TABS = [
  { id: 'adversaires', label: 'Adversaires', icon: '⚔️' },
  { id: 'environnements', label: 'Environnements', icon: '🌍' },
  { id: 'classes', label: 'Classes', icon: '🗡️' },
  { id: 'domaines', label: 'Domaines', icon: '🃏' },
  { id: 'ascendances', label: 'Ascendances', icon: '🧬' },
  { id: 'communautes', label: 'Communautes', icon: '🏘️' },
  { id: 'equipement', label: 'Equipement', icon: '🛡️' }
]

export default {
  name: 'CompendiumView',
  components: { ModuleBoundary },
  setup() {
    const route = useRoute()
    const currentTab = computed(() => route.meta?.tab || 'adversaires')
    const currentTitle = computed(() => {
      const tab = COMPENDIUM_TABS.find(t => t.id === currentTab.value)
      return tab ? tab.label : 'Compendium'
    })

    return { tabs: COMPENDIUM_TABS, currentTab, currentTitle }
  }
}
</script>

<style scoped>
.compendium-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.compendium-view__tabs ul {
  display: flex;
  gap: var(--space-xs, 0.25rem);
  list-style: none;
  margin: 0;
  padding: var(--space-sm, 0.5rem) var(--space-md, 1rem) 0;
  border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.1));
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.compendium-view__tab {
  display: flex;
  align-items: center;
  gap: var(--space-xs, 0.25rem);
  padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
  color: var(--color-text-secondary, #aaa);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  transition: color var(--transition-fast, 0.15s), border-color var(--transition-fast, 0.15s);
}

.compendium-view__tab:hover {
  color: var(--color-text, #fff);
}

.compendium-view__tab--active {
  color: var(--color-hope, #f0c040);
  border-bottom-color: var(--color-hope, #f0c040);
  font-weight: 600;
}

.compendium-view__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md, 1rem);
}

@media (max-width: 768px) {
  .compendium-view__tab-label { display: none; }
  .compendium-view__tab-icon { font-size: 1.3em; }
  .compendium-view__tab { padding: var(--space-sm, 0.5rem); }
}
</style>
```

- [ ] **Step 4: Verifier que les tests passent**

Run: `npx vitest run src/core/components/__tests__/CompendiumView.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/components/CompendiumView.vue src/core/components/__tests__/CompendiumView.test.js
git commit -m "feat(compendium): implementer CompendiumView avec onglets"
```

---

## Task 6: Implementer TableView — onglets

**Files:**
- Modify: `src/core/components/TableView.vue`
- Create: `src/core/components/__tests__/TableView.test.js`

- [ ] **Step 1: Ecrire les tests**

```javascript
// src/core/components/__tests__/TableView.test.js
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import TableView from '../TableView.vue'

const StubTab = { template: '<div class="stub-tab">Tab</div>' }

function makeRouter(initialRoute = '/table/pjs') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{
      path: '/table',
      component: TableView,
      redirect: '/table/pjs',
      children: [
        { path: 'pjs', name: 'table-pjs', component: StubTab, meta: { tab: 'pjs', title: 'Personnages' } },
        { path: 'pnjs', name: 'table-pnjs', component: StubTab, meta: { tab: 'pnjs', title: 'PNJs' } },
        { path: 'rencontres', name: 'table-rencontres', component: StubTab, meta: { tab: 'rencontres', title: 'Rencontres' } },
        { path: 'combat', name: 'table-combat', component: StubTab, meta: { tab: 'combat', title: 'Combat' } },
        { path: 'des', name: 'table-des', component: StubTab, meta: { tab: 'des', title: 'Des' } }
      ]
    }]
  })
  router.push(initialRoute)
  return router
}

describe('TableView', () => {
  it('affiche 5 onglets', async () => {
    const router = makeRouter()
    await router.isReady()
    const wrapper = mount(TableView, { global: { plugins: [router] } })
    const tabs = wrapper.findAll('[role="tab"]')
    expect(tabs).toHaveLength(5)
  })

  it('marque l\'onglet actif', async () => {
    const router = makeRouter('/table/pjs')
    await router.isReady()
    const wrapper = mount(TableView, { global: { plugins: [router] } })
    const activeTab = wrapper.find('[aria-selected="true"]')
    expect(activeTab.exists()).toBe(true)
    expect(activeTab.text()).toContain('PJs')
  })

  it('contient un router-view', async () => {
    const router = makeRouter('/table/pjs')
    await router.isReady()
    const wrapper = mount(TableView, { global: { plugins: [router] } })
    expect(wrapper.find('.stub-tab').exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Verifier que les tests echouent**

Run: `npx vitest run src/core/components/__tests__/TableView.test.js`
Expected: FAIL

- [ ] **Step 3: Implementer TableView**

```vue
<!-- src/core/components/TableView.vue -->
<template>
  <ModuleBoundary :module-name="currentTitle" :module-id="`table-${currentTab}`">
    <div class="table-view">
      <div class="table-view__content">
        <router-view />
      </div>

      <nav class="table-view__tabs" aria-label="Outils de jeu">
        <ul role="tablist">
          <li v-for="tab in tabs" :key="tab.id" role="presentation">
            <router-link
              :to="`/table/${tab.id}`"
              role="tab"
              :aria-selected="currentTab === tab.id ? 'true' : 'false'"
              class="table-view__tab"
              :class="{ 'table-view__tab--active': currentTab === tab.id }"
            >
              <span class="table-view__tab-icon" aria-hidden="true">{{ tab.icon }}</span>
              <span class="table-view__tab-label">{{ tab.label }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>
  </ModuleBoundary>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import ModuleBoundary from './ModuleBoundary.vue'

const TABLE_TABS = [
  { id: 'pjs', label: 'PJs', icon: '🧙' },
  { id: 'pnjs', label: 'PNJs', icon: '👤' },
  { id: 'rencontres', label: 'Rencontres', icon: '⚔️' },
  { id: 'combat', label: 'Combat', icon: '🎯' },
  { id: 'des', label: 'Des', icon: '🎲' }
]

export default {
  name: 'TableView',
  components: { ModuleBoundary },
  setup() {
    const route = useRoute()
    const currentTab = computed(() => route.meta?.tab || 'pjs')
    const currentTitle = computed(() => {
      const tab = TABLE_TABS.find(t => t.id === currentTab.value)
      return tab ? `Table — ${tab.label}` : 'Table de jeu'
    })

    return { tabs: TABLE_TABS, currentTab, currentTitle }
  }
}
</script>

<style scoped>
.table-view {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.table-view__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-md, 1rem);
}

.table-view__tabs {
  border-top: 1px solid var(--color-border, rgba(255,255,255,0.1));
  background: var(--color-surface, #1a1a2e);
}

.table-view__tabs ul {
  display: flex;
  justify-content: center;
  gap: var(--space-xs, 0.25rem);
  list-style: none;
  margin: 0;
  padding: var(--space-xs, 0.25rem) 0;
}

.table-view__tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
  color: var(--color-text-secondary, #aaa);
  text-decoration: none;
  border-radius: var(--radius-sm, 4px);
  transition: color var(--transition-fast, 0.15s), background var(--transition-fast, 0.15s);
  font-size: 0.8em;
}

.table-view__tab:hover {
  color: var(--color-text, #fff);
  background: var(--color-surface-hover, rgba(255,255,255,0.08));
}

.table-view__tab--active {
  color: var(--color-hope, #f0c040);
  font-weight: 600;
}

.table-view__tab-icon { font-size: 1.4em; }
</style>
```

- [ ] **Step 4: Verifier que les tests passent**

Run: `npx vitest run src/core/components/__tests__/TableView.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/core/components/TableView.vue src/core/components/__tests__/TableView.test.js
git commit -m "feat(table): implementer TableView avec onglets"
```

---

## Task 7: Adapter les browsers — retirer ModuleBoundary

Les 7 browsers ont leur propre `ModuleBoundary` wrapper. Puisque `CompendiumView` fournit deja le `ModuleBoundary`, il faut retirer le wrapper redondant.

**Files:**
- Modify: 7 fichiers browser (voir liste ci-dessous)

- [ ] **Step 1: Pour chaque browser, retirer le wrapper ModuleBoundary**

Pattern a appliquer sur chaque fichier — retirer la balise `<ModuleBoundary>` qui enveloppe le contenu, retirer l'import et la declaration `components: { ModuleBoundary }` dans le script.

Fichiers :
1. `src/modules/adversaries/views/AdversaryBrowser.vue`
2. `src/modules/environments/views/EnvironmentBrowser.vue`
3. `src/modules/characters/views/ClassBrowser.vue`
4. `src/modules/characters/views/AncestryBrowser.vue`
5. `src/modules/communities/views/CommunityBrowser.vue`
6. `src/modules/domains/views/DomainBrowser.vue`
7. `src/modules/equipment/views/EquipmentBrowser.vue`

- [ ] **Step 2: Verifier le build**

Run: `npx vite build`
Expected: Build success

- [ ] **Step 3: Lancer les tests existants**

Run: `npx vitest run src/modules/adversaries/ src/modules/environments/ src/modules/communities/`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/modules/adversaries/views/ src/modules/environments/views/ src/modules/characters/views/ClassBrowser.vue src/modules/characters/views/AncestryBrowser.vue src/modules/communities/views/ src/modules/domains/views/ src/modules/equipment/views/
git commit -m "refactor(browsers): retirer ModuleBoundary des browsers (gere par CompendiumView)"
```

---

## Task 8: Adapter les vues Table — retirer ModuleBoundary et corriger les liens

**Files:**
- Modify: 5 fichiers vues + tous fichiers avec anciennes routes

- [ ] **Step 1: Pour chaque vue Table, retirer le wrapper ModuleBoundary**

Fichiers :
1. `src/modules/characters/views/CharacterBuilder.vue`
2. `src/modules/npcs/views/NpcManager.vue`
3. `src/modules/encounter/views/EncounterBuilder.vue`
4. `src/modules/encounter/views/EncounterLive.vue`
5. `src/modules/dice/views/DiceRoller.vue`

- [ ] **Step 2: Grep et corriger toutes les references aux anciennes routes**

Chercher dans tout `src/` (hors `router/index.js`) les references aux anciennes routes et les remplacer :

```bash
grep -rn "'/edition/" src/ --include="*.vue" --include="*.js" | grep -v router/index.js
grep -rn "'/jeu/" src/ --include="*.vue" --include="*.js" | grep -v router/index.js
grep -rn "'/lecture/" src/ --include="*.vue" --include="*.js" | grep -v router/index.js
grep -rn 'meta.mode' src/ --include="*.vue" --include="*.js" | grep -v router/index.js
```

Remplacements :
- `'/edition/rencontres'` → `'/table/rencontres'`
- `'/edition/personnages'` → `'/table/pjs'`
- `'/edition/pnjs'` → `'/table/pnjs'`
- `'/edition/homebrew'` → `'/compendium'`
- `'/edition/homebrew/adversary'` → `'/compendium/adversaires'`
- `'/edition/homebrew/ancestry'` → `'/compendium/ascendances'`
- `'/edition/homebrew/class'` → `'/compendium/classes'`
- `'/edition/homebrew/community'` → `'/compendium/communautes'`
- `'/edition/homebrew/domain'` → `'/compendium/domaines'`
- `'/edition/homebrew/environment'` → `'/compendium/environnements'`
- `'/edition/homebrew/equipment'` → `'/compendium/equipement'`
- `'/edition/sync'` → `'/sync'`
- `'/jeu/table'` → `'/table'`
- `'/jeu/combat'` → `'/table/combat'`
- `'/jeu/des'` → `'/table/des'`
- `'/lecture/adversaires'` → `'/compendium/adversaires'`
- (etc. pour toutes les routes lecture)
- Toute reference a `route.meta.mode` → supprimer ou remplacer

Attention : les 14 vues homebrew (HomebrewAdversaryList, HomebrewAdversaryEditor, etc.) contiennent aussi des liens `/edition/homebrew/*`. Les mettre a jour meme si ces vues ne sont pas routees en Phase 1 — elles seront reintegrees en Phase 2.

- [ ] **Step 3: Verifier le build**

Run: `npx vite build`
Expected: Build success

- [ ] **Step 4: Lancer les tests impactes**

Run: `npx vitest run src/modules/encounter/ src/modules/characters/ src/modules/npcs/ src/modules/dice/`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add -u src/modules/
git commit -m "refactor(vues): adapter vues Table et corriger liens internes vers nouvelles routes"
```

---

## Task 9: Supprimer les composants obsoletes

**Files:**
- Delete: `src/modules/homebrew/views/HomebrewHub.vue`
- Delete: `src/modules/homebrew/__tests__/HomebrewHub.test.js`
- Delete: `src/modules/session/views/SessionHome.vue`
- Modify: `src/modules/homebrew/index.js`
- Modify: `src/modules/session/index.js`

- [ ] **Step 1: Verifier les references restantes**

```bash
grep -rn "HomebrewHub" src/ --include="*.vue" --include="*.js" | grep -v __tests__
grep -rn "SessionHome" src/ --include="*.vue" --include="*.js"
```

Si des references existent dans les index.js des modules, les retirer.

- [ ] **Step 2: Mettre a jour les index de module**

`src/modules/homebrew/index.js` — retirer l'export de HomebrewHub.
`src/modules/session/index.js` — retirer l'export de SessionHome.

- [ ] **Step 3: Supprimer les fichiers**

```bash
git rm src/modules/homebrew/views/HomebrewHub.vue
git rm src/modules/homebrew/__tests__/HomebrewHub.test.js
git rm src/modules/session/views/SessionHome.vue
```

Note : les composants de session (`PcGroupPanel`, `EncounterLauncher`, `EnvironmentLoader`, `NpcLoader`, `CombatResumeBanner`, `SessionHistoryPanel`) dans `src/modules/session/components/` sont CONSERVES. Ils seront reintegres dans les onglets de la Table en Phase 2.

- [ ] **Step 4: Verifier le build**

Run: `npx vite build`
Expected: Build success

- [ ] **Step 5: Lancer les tests**

Run: `npx vitest run src/modules/homebrew/ src/modules/session/`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git commit -m "refactor(cleanup): supprimer HomebrewHub et SessionHome (remplaces par CompendiumView et TableView)"
```

---

## Task 10: Verification finale et nettoyage

- [ ] **Step 1: Grep pour les references obsoletes restantes**

```bash
grep -rn "'/lecture/" src/ --include="*.vue" --include="*.js" | grep -v router/index.js
grep -rn "'/edition/" src/ --include="*.vue" --include="*.js" | grep -v router/index.js
grep -rn "'/jeu/" src/ --include="*.vue" --include="*.js" | grep -v router/index.js
grep -rn "ModeSelector" src/ --include="*.vue" --include="*.js"
grep -rn "MODE_NAV" src/ --include="*.vue" --include="*.js"
grep -rn "NAV_ITEMS" src/ --include="*.vue" --include="*.js"
grep -rn "meta.mode" src/ --include="*.vue" --include="*.js"
```

Expected: Aucune occurrence. Corriger toute reference trouvee.

- [ ] **Step 2: Lancer ESLint**

Run: `npx eslint src/ --ext .vue,.js`
Corriger les erreurs.

- [ ] **Step 3: Lancer le build complet**

Run: `npx vite build`
Expected: Build success

- [ ] **Step 4: Lancer tous les tests**

Run: `npx vitest run`
Expected: PASS. Tests susceptibles de casser :
- Tests qui importent `MODE_NAV` ou `NAV_ITEMS` depuis constants.js → supprimer ces imports/tests
- Tests qui referent des routes `/lecture/*`, `/edition/*`, `/jeu/*` → mettre a jour les routes
- `HomebrewHub.test.js` → deja supprime en Task 9

- [ ] **Step 5: Test manuel rapide**

Ouvrir l'app dans le navigateur et verifier :
1. `/` redirige vers `/compendium/adversaires`
2. Les 7 onglets du Compendium fonctionnent
3. `/table` redirige vers `/table/pjs`
4. Les 5 onglets de la Table fonctionnent
5. `/sync` fonctionne
6. Le raccourci 🎲 dans le header amene a `/table/des`
7. Les anciennes URLs (`/lecture/adversaires`, `/edition/personnages`, `/jeu/combat`) redirigent correctement
8. `/edition/homebrew/adversary` redirige vers `/compendium/adversaires` (traduction EN→FR)
9. Navigation mobile (hamburger) fonctionne

- [ ] **Step 6: Commit final**

```bash
git add -u
git commit -m "refactor(nav): finaliser Phase 1 du refactoring de navigation Compendium/Table/Sync"
```
