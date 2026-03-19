// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { createRouter, createMemoryHistory } from 'vue-router'

// On ne peut pas importer le vrai router (createWebHistory necessite un navigateur).
// On recree un router de test avec createMemoryHistory et les memes definitions de routes.

const CompendiumView = { template: '<div><router-view /></div>' }
const TableView = { template: '<div><router-view /></div>' }
const StubComponent = { template: '<div>stub</div>' }

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
  { path: '/', redirect: '/compendium' },
  {
    path: '/compendium',
    component: CompendiumView,
    redirect: '/compendium/adversaires',
    children: [
      { path: 'adversaires/:id?', name: 'compendium-adversaires', component: StubComponent, meta: { title: 'Adversaires', module: 'adversaries', tab: 'adversaires' } },
      { path: 'environnements/:id?', name: 'compendium-environnements', component: StubComponent, meta: { title: 'Environnements', module: 'environments', tab: 'environnements' } },
      { path: 'classes/:id?', name: 'compendium-classes', component: StubComponent, meta: { title: 'Classes', module: 'characters', tab: 'classes' } },
      { path: 'domaines/:id?', name: 'compendium-domaines', component: StubComponent, meta: { title: 'Domaines', module: 'domains', tab: 'domaines' } },
      { path: 'ascendances/:id?', name: 'compendium-ascendances', component: StubComponent, meta: { title: 'Ascendances', module: 'characters', tab: 'ascendances' } },
      { path: 'communautes/:id?', name: 'compendium-communautes', component: StubComponent, meta: { title: 'Communautes', module: 'communities', tab: 'communautes' } },
      { path: 'equipement/:id?', name: 'compendium-equipement', component: StubComponent, meta: { title: 'Equipement', module: 'equipment', tab: 'equipement' } }
    ]
  },
  {
    path: '/table',
    component: TableView,
    redirect: '/table/pjs',
    children: [
      { path: 'pjs', name: 'table-pjs', component: StubComponent, meta: { title: 'Personnages', module: 'characters', tab: 'pjs' } },
      { path: 'pnjs', name: 'table-pnjs', component: StubComponent, meta: { title: 'PNJs', module: 'npcs', tab: 'pnjs' } },
      { path: 'rencontres', name: 'table-rencontres', component: StubComponent, meta: { title: 'Rencontres', module: 'encounter', tab: 'rencontres' } },
      { path: 'combat', name: 'table-combat', component: StubComponent, meta: { title: 'Combat', module: 'encounter', tab: 'combat' } },
      { path: 'des', name: 'table-des', component: StubComponent, meta: { title: 'Des', module: 'dice', tab: 'des' } }
    ]
  },
  { path: '/sync', name: 'sync', component: StubComponent, meta: { title: 'Synchronisation', module: 'sync' } },
  // Redirections legacy
  { path: '/lecture/adversaires', redirect: '/compendium/adversaires' },
  { path: '/lecture/environnements', redirect: '/compendium/environnements' },
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
  { path: '/jeu/table', redirect: '/table' },
  { path: '/jeu/combat', redirect: '/table/combat' },
  { path: '/jeu/des', redirect: '/table/des' },
  { path: '/jeu', redirect: '/table' },
  { path: '/adversaries', redirect: '/compendium/adversaires' },
  { path: '/encounters', redirect: '/table/rencontres' },
  {
    path: '/homebrew/:category?/:id?',
    redirect: (to) => {
      if (!to.params.category) return '/compendium'
      const frCategory = HOMEBREW_CATEGORY_MAP[to.params.category] || to.params.category
      return `/compendium/${frCategory}${to.params.id ? '/' + to.params.id : ''}`
    }
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: StubComponent }
]

async function resolveRoute(path) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  await router.push(path)
  return router.currentRoute.value
}

describe('Router - nouvelles routes', () => {
  it('/ redirige vers /compendium/adversaires', async () => {
    const route = await resolveRoute('/')
    expect(route.path).toBe('/compendium/adversaires')
  })

  it('/compendium redirige vers /compendium/adversaires', async () => {
    const route = await resolveRoute('/compendium')
    expect(route.path).toBe('/compendium/adversaires')
  })

  it('/compendium/adversaires a le bon meta', async () => {
    const route = await resolveRoute('/compendium/adversaires')
    expect(route.name).toBe('compendium-adversaires')
    expect(route.meta.module).toBe('adversaries')
    expect(route.meta.tab).toBe('adversaires')
  })

  it('/table redirige vers /table/pjs', async () => {
    const route = await resolveRoute('/table')
    expect(route.path).toBe('/table/pjs')
  })

  it('/table/combat a le bon meta', async () => {
    const route = await resolveRoute('/table/combat')
    expect(route.name).toBe('table-combat')
    expect(route.meta.module).toBe('encounter')
  })

  it('/sync resout correctement', async () => {
    const route = await resolveRoute('/sync')
    expect(route.name).toBe('sync')
  })
})

describe('Router - redirects legacy', () => {
  it('/lecture/adversaires -> /compendium/adversaires', async () => {
    const route = await resolveRoute('/lecture/adversaires')
    expect(route.path).toBe('/compendium/adversaires')
  })

  it('/edition/personnages -> /table/pjs', async () => {
    const route = await resolveRoute('/edition/personnages')
    expect(route.path).toBe('/table/pjs')
  })

  it('/jeu/combat -> /table/combat', async () => {
    const route = await resolveRoute('/jeu/combat')
    expect(route.path).toBe('/table/combat')
  })

  it('/edition/homebrew -> /compendium', async () => {
    const route = await resolveRoute('/edition/homebrew')
    expect(route.path).toBe('/compendium/adversaires')
  })

  it('/edition/homebrew/adversary -> /compendium/adversaires (traduction EN->FR)', async () => {
    const route = await resolveRoute('/edition/homebrew/adversary')
    expect(route.path).toBe('/compendium/adversaires')
  })

  it('/edition/homebrew/ancestry -> /compendium/ascendances (traduction EN->FR)', async () => {
    const route = await resolveRoute('/edition/homebrew/ancestry')
    expect(route.path).toBe('/compendium/ascendances')
  })

  it('/homebrew/adversary -> /compendium/adversaires (old english)', async () => {
    const route = await resolveRoute('/homebrew/adversary')
    expect(route.path).toBe('/compendium/adversaires')
  })
})
