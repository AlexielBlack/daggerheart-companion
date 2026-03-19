import { createRouter, createWebHistory } from 'vue-router'

const CompendiumView = () => import('@core/components/CompendiumView.vue')
const TableView = () => import('@core/components/TableView.vue')

// Browsers (onglets Compendium)
const AdversaryBrowser = () => import('@modules/adversaries/views/AdversaryBrowser.vue')
const EnvironmentBrowser = () => import('@modules/environments/views/EnvironmentBrowser.vue')
const ClassBrowser = () => import('@modules/characters/views/ClassBrowser.vue')
const DomainBrowser = () => import('@modules/domains/views/DomainBrowser.vue')
const AncestryBrowser = () => import('@modules/characters/views/AncestryBrowser.vue')
const CommunityBrowser = () => import('@modules/communities/views/CommunityBrowser.vue')
const EquipmentBrowser = () => import('@modules/equipment/views/EquipmentBrowser.vue')

// Onglets Table de jeu (vues wrapper integrant les composants session)
const TablePjsView = () => import('@modules/session/views/TablePjsView.vue')
const TablePnjsView = () => import('@modules/session/views/TablePnjsView.vue')
const TableRencontresView = () => import('@modules/session/views/TableRencontresView.vue')
const TableCombatView = () => import('@modules/session/views/TableCombatView.vue')
const DiceRoller = () => import('@modules/dice/views/DiceRoller.vue')

// Standalone
const SyncManager = () => import('@modules/sync/views/SyncManager.vue')
const ErrorFallback = () => import('@core/components/ErrorFallback.vue')

/** Map des categories homebrew anglais vers chemins compendium francais */
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
  // --- Redirection racine ---
  { path: '/', redirect: '/compendium' },

  // --- Compendium (7 browsers en routes imbriquees) ---
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

  // --- Table de jeu (5 outils en routes imbriquees) ---
  {
    path: '/table',
    component: TableView,
    redirect: '/table/pjs',
    children: [
      { path: 'pjs', name: 'table-pjs', component: TablePjsView, meta: { title: 'Personnages', module: 'characters', tab: 'pjs' } },
      { path: 'pnjs', name: 'table-pnjs', component: TablePnjsView, meta: { title: 'PNJs', module: 'npcs', tab: 'pnjs' } },
      { path: 'rencontres', name: 'table-rencontres', component: TableRencontresView, meta: { title: 'Rencontres', module: 'encounter', tab: 'rencontres' } },
      { path: 'combat', name: 'table-combat', component: TableCombatView, meta: { title: 'Combat', module: 'encounter', tab: 'combat' } },
      { path: 'des', name: 'table-des', component: DiceRoller, meta: { title: 'Des', module: 'dice', tab: 'des' } }
    ]
  },

  // --- Sync ---
  { path: '/sync', name: 'sync', component: SyncManager, meta: { title: 'Synchronisation', module: 'sync' } },

  // --- Redirections legacy : lecture -> compendium ---
  { path: '/lecture/adversaires', redirect: '/compendium/adversaires' },
  { path: '/lecture/environnements', redirect: '/compendium/environnements' },
  { path: '/lecture/classes', redirect: '/compendium/classes' },
  { path: '/lecture/domaines', redirect: '/compendium/domaines' },
  { path: '/lecture/ascendances', redirect: '/compendium/ascendances' },
  { path: '/lecture/communautes', redirect: '/compendium/communautes' },
  { path: '/lecture/equipement', redirect: '/compendium/equipement' },

  // --- Redirections legacy : edition -> table/compendium ---
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

  // --- Redirections legacy : jeu -> table ---
  { path: '/jeu/table', redirect: '/table' },
  { path: '/jeu/combat', redirect: '/table/combat' },
  { path: '/jeu/des', redirect: '/table/des' },
  { path: '/jeu', redirect: '/table' },

  // --- Redirections legacy : anciennes routes anglaises ---
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
