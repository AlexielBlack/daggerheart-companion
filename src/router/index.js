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
    path: '/characters/classe',
    name: 'characters-classe',
    component: () => import('@modules/characters/views/ClassBrowser.vue'),
    meta: { title: 'Classes & Spécialisations', module: 'characters', parent: 'characters' }
  },
  {
    path: '/characters/domaines',
    name: 'characters-domaines',
    component: () => import('@modules/domains/views/DomainBrowser.vue'),
    meta: { title: 'Domaines', module: 'domains', parent: 'characters' }
  },
  {
    path: '/characters/ascendance',
    name: 'characters-ascendance',
    component: () => import('@modules/characters/views/AncestryBrowser.vue'),
    meta: { title: 'Ascendances', module: 'characters', parent: 'characters' }
  },
  {
    path: '/characters/communaute',
    name: 'characters-communaute',
    component: () => import('@modules/communities/views/CommunityBrowser.vue'),
    meta: { title: 'Communautés', module: 'characters', parent: 'characters' }
  },
  {
    path: '/characters/equipement',
    name: 'characters-equipement',
    component: () => import('@modules/equipment/views/EquipmentBrowser.vue'),
    meta: { title: 'Équipement', module: 'equipment', parent: 'characters' }
  },
  {
    path: '/dice',
    name: 'dice',
    component: () => import('@modules/dice/views/DiceRoller.vue'),
    meta: { title: 'Lanceur de Dés', module: 'dice' }
  },
  {
    path: '/homebrew/adversary',
    name: 'homebrew-adversary-list',
    component: () => import('@modules/homebrew/views/HomebrewAdversaryList.vue'),
    meta: { title: 'Adversaires custom', module: 'homebrew' }
  },
  {
    path: '/homebrew/adversary/new',
    name: 'homebrew-adversary-create',
    component: () => import('@modules/homebrew/views/HomebrewAdversaryEditor.vue'),
    meta: { title: 'Nouvel adversaire', module: 'homebrew' }
  },
  {
    path: '/homebrew/adversary/:id',
    name: 'homebrew-adversary-edit',
    component: () => import('@modules/homebrew/views/HomebrewAdversaryEditor.vue'),
    meta: { title: 'Modifier adversaire', module: 'homebrew' }
  },
  {
    path: '/homebrew/ancestry',
    name: 'homebrew-ancestry-list',
    component: () => import('@modules/homebrew/views/HomebrewAncestryList.vue'),
    meta: { title: 'Ascendances custom', module: 'homebrew' }
  },
  {
    path: '/homebrew/ancestry/new',
    name: 'homebrew-ancestry-create',
    component: () => import('@modules/homebrew/views/HomebrewAncestryEditor.vue'),
    meta: { title: 'Nouvelle ascendance', module: 'homebrew' }
  },
  {
    path: '/homebrew/ancestry/:id',
    name: 'homebrew-ancestry-edit',
    component: () => import('@modules/homebrew/views/HomebrewAncestryEditor.vue'),
    meta: { title: 'Modifier ascendance', module: 'homebrew' }
  },
  {
    path: '/homebrew/community',
    name: 'homebrew-community-list',
    component: () => import('@modules/homebrew/views/HomebrewCommunityList.vue'),
    meta: { title: 'Communautés custom', module: 'homebrew' }
  },
  {
    path: '/homebrew/community/new',
    name: 'homebrew-community-create',
    component: () => import('@modules/homebrew/views/HomebrewCommunityEditor.vue'),
    meta: { title: 'Nouvelle communauté', module: 'homebrew' }
  },
  {
    path: '/homebrew/community/:id',
    name: 'homebrew-community-edit',
    component: () => import('@modules/homebrew/views/HomebrewCommunityEditor.vue'),
    meta: { title: 'Modifier communauté', module: 'homebrew' }
  },
  {
    path: '/homebrew/environment',
    name: 'homebrew-environment-list',
    component: () => import('@modules/homebrew/views/HomebrewEnvironmentList.vue'),
    meta: { title: 'Environnements custom', module: 'homebrew' }
  },
  {
    path: '/homebrew/environment/new',
    name: 'homebrew-environment-create',
    component: () => import('@modules/homebrew/views/HomebrewEnvironmentEditor.vue'),
    meta: { title: 'Nouvel environnement', module: 'homebrew' }
  },
  {
    path: '/homebrew/environment/:id',
    name: 'homebrew-environment-edit',
    component: () => import('@modules/homebrew/views/HomebrewEnvironmentEditor.vue'),
    meta: { title: 'Modifier environnement', module: 'homebrew' }
  },
  {
    path: '/homebrew/equipment',
    name: 'homebrew-equipment-list',
    component: () => import('@modules/homebrew/views/HomebrewEquipmentList.vue'),
    meta: { title: 'Équipement custom', module: 'homebrew' }
  },
  {
    path: '/homebrew/equipment/new',
    name: 'homebrew-equipment-create',
    component: () => import('@modules/homebrew/views/HomebrewEquipmentEditor.vue'),
    meta: { title: 'Nouvel équipement', module: 'homebrew' }
  },
  {
    path: '/homebrew/equipment/:id',
    name: 'homebrew-equipment-edit',
    component: () => import('@modules/homebrew/views/HomebrewEquipmentEditor.vue'),
    meta: { title: 'Modifier équipement', module: 'homebrew' }
  },
  {
    path: '/homebrew/class',
    name: 'homebrew-class-list',
    component: () => import('@modules/homebrew/views/HomebrewClassList.vue'),
    meta: { title: 'Classes custom', module: 'homebrew' }
  },
  {
    path: '/homebrew/class/new',
    name: 'homebrew-class-create',
    component: () => import('@modules/homebrew/views/HomebrewClassEditor.vue'),
    meta: { title: 'Nouvelle classe', module: 'homebrew' }
  },
  {
    path: '/homebrew/class/:id',
    name: 'homebrew-class-edit',
    component: () => import('@modules/homebrew/views/HomebrewClassEditor.vue'),
    meta: { title: 'Modifier classe', module: 'homebrew' }
  },
  {
    path: '/homebrew/domain',
    name: 'homebrew-domain-list',
    component: () => import('@modules/homebrew/views/HomebrewDomainList.vue'),
    meta: { title: 'Domaines custom', module: 'homebrew' }
  },
  {
    path: '/homebrew/domain/new',
    name: 'homebrew-domain-create',
    component: () => import('@modules/homebrew/views/HomebrewDomainEditor.vue'),
    meta: { title: 'Nouveau domaine', module: 'homebrew' }
  },
  {
    path: '/homebrew/domain/:id',
    name: 'homebrew-domain-edit',
    component: () => import('@modules/homebrew/views/HomebrewDomainEditor.vue'),
    meta: { title: 'Modifier domaine', module: 'homebrew' }
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

router.afterEach((to) => {
  const title = to.meta?.title
  document.title = title
    ? `${title} — Daggerheart Companion`
    : 'Daggerheart Companion'
})

export default router
