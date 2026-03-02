import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/adversaries'
  },
  {
    path: '/adversaries',
    name: 'adversaries',
    component: () => import('@modules/adversaries/views/AdversaryBrowser.vue'),
    meta: { title: 'Adversaires', module: 'adversaries' }
  },
  {
    path: '/environments',
    name: 'environments',
    component: () => import('@modules/environments/views/EnvironmentBrowser.vue'),
    meta: { title: 'Environnements', module: 'environments' }
  },
  {
    path: '/encounters',
    name: 'encounters',
    component: () => import('@modules/encounter/views/EncounterBuilder.vue'),
    meta: { title: 'Rencontres', module: 'encounter' }
  },
  {
    path: '/characters',
    name: 'characters',
    component: () => import('@modules/characters/views/CharacterBuilder.vue'),
    meta: { title: 'Personnages', module: 'characters' }
  },
  {
    path: '/dice',
    name: 'dice',
    component: () => import('@modules/dice/views/DiceRoller.vue'),
    meta: { title: 'Lanceur de Dés', module: 'dice' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@core/components/ErrorFallback.vue'),
    props: {
      error: { message: 'Page introuvable.' },
      module: 'Navigation'
    },
    meta: { title: 'Page introuvable' }
  }
]

const router = createRouter({
  history: createWebHistory('/daggerheart-companion/'),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// Mise à jour du titre de la page
router.afterEach((to) => {
  const title = to.meta?.title
  document.title = title
    ? `${title} — Daggerheart Companion`
    : 'Daggerheart Companion'
})

export default router
