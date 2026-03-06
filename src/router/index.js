import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  // Racine — redirige vers le combat en cours
  {
    path: '/',
    redirect: '/jeu/combat'
  },

  // ─────────────────────────────────────────────
  // MODE LECTURE
  // ─────────────────────────────────────────────
  {
    path: '/lecture/adversaires',
    name: 'lecture-adversaires',
    component: () => import('@modules/adversaries/views/AdversaryBrowser.vue'),
    meta: { mode: 'lecture', title: 'Adversaires', module: 'adversaries' }
  },
  {
    path: '/lecture/environnements',
    name: 'lecture-environnements',
    component: () => import('@modules/environments/views/EnvironmentBrowser.vue'),
    meta: { mode: 'lecture', title: 'Environnements', module: 'environments' }
  },
  {
    path: '/lecture/classes',
    name: 'lecture-classes',
    component: () => import('@modules/characters/views/ClassBrowser.vue'),
    meta: { mode: 'lecture', title: 'Classes & Spécialisations', module: 'characters' }
  },
  {
    path: '/lecture/domaines',
    name: 'lecture-domaines',
    component: () => import('@modules/domains/views/DomainBrowser.vue'),
    meta: { mode: 'lecture', title: 'Domaines', module: 'domains' }
  },
  {
    path: '/lecture/ascendances',
    name: 'lecture-ascendances',
    component: () => import('@modules/characters/views/AncestryBrowser.vue'),
    meta: { mode: 'lecture', title: 'Ascendances', module: 'characters' }
  },
  {
    path: '/lecture/communautes',
    name: 'lecture-communautes',
    component: () => import('@modules/communities/views/CommunityBrowser.vue'),
    meta: { mode: 'lecture', title: 'Communautés', module: 'communities' }
  },
  {
    path: '/lecture/equipement',
    name: 'lecture-equipement',
    component: () => import('@modules/equipment/views/EquipmentBrowser.vue'),
    meta: { mode: 'lecture', title: 'Équipement', module: 'equipment' }
  },

  // ─────────────────────────────────────────────
  // MODE ÉDITION
  // ─────────────────────────────────────────────
  {
    path: '/edition/personnages',
    name: 'edition-personnages',
    component: () => import('@modules/characters/views/CharacterBuilder.vue'),
    meta: { mode: 'edition', title: 'Personnages', module: 'characters' }
  },
  {
    path: '/edition/rencontres',
    name: 'edition-rencontres',
    component: () => import('@modules/encounter/views/EncounterBuilder.vue'),
    meta: { mode: 'edition', title: 'Rencontres', module: 'encounter' }
  },
  {
    path: '/edition/pnjs',
    name: 'edition-pnjs',
    component: () => import('@modules/npcs/views/NpcManager.vue'),
    meta: { mode: 'edition', title: 'PNJs', module: 'npcs' }
  },
  {
    path: '/edition/homebrew',
    name: 'edition-homebrew',
    component: () => import('@modules/homebrew/views/HomebrewHub.vue'),
    meta: { mode: 'edition', title: 'Homebrew', module: 'homebrew' }
  },

  // Homebrew — Adversaires
  {
    path: '/edition/homebrew/adversary',
    name: 'edition-homebrew-adversary-list',
    component: () => import('@modules/homebrew/views/HomebrewAdversaryList.vue'),
    meta: { mode: 'edition', title: 'Adversaires custom', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/adversary/new',
    name: 'edition-homebrew-adversary-create',
    component: () => import('@modules/homebrew/views/HomebrewAdversaryEditor.vue'),
    meta: { mode: 'edition', title: 'Nouvel adversaire', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/adversary/:id',
    name: 'edition-homebrew-adversary-edit',
    component: () => import('@modules/homebrew/views/HomebrewAdversaryEditor.vue'),
    meta: { mode: 'edition', title: 'Modifier adversaire', module: 'homebrew' }
  },

  // Homebrew — Ascendances
  {
    path: '/edition/homebrew/ancestry',
    name: 'edition-homebrew-ancestry-list',
    component: () => import('@modules/homebrew/views/HomebrewAncestryList.vue'),
    meta: { mode: 'edition', title: 'Ascendances custom', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/ancestry/new',
    name: 'edition-homebrew-ancestry-create',
    component: () => import('@modules/homebrew/views/HomebrewAncestryEditor.vue'),
    meta: { mode: 'edition', title: 'Nouvelle ascendance', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/ancestry/:id',
    name: 'edition-homebrew-ancestry-edit',
    component: () => import('@modules/homebrew/views/HomebrewAncestryEditor.vue'),
    meta: { mode: 'edition', title: 'Modifier ascendance', module: 'homebrew' }
  },

  // Homebrew — Classes
  {
    path: '/edition/homebrew/class',
    name: 'edition-homebrew-class-list',
    component: () => import('@modules/homebrew/views/HomebrewClassList.vue'),
    meta: { mode: 'edition', title: 'Classes custom', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/class/new',
    name: 'edition-homebrew-class-create',
    component: () => import('@modules/homebrew/views/HomebrewClassEditor.vue'),
    meta: { mode: 'edition', title: 'Nouvelle classe', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/class/:id',
    name: 'edition-homebrew-class-edit',
    component: () => import('@modules/homebrew/views/HomebrewClassEditor.vue'),
    meta: { mode: 'edition', title: 'Modifier classe', module: 'homebrew' }
  },

  // Homebrew — Communautés
  {
    path: '/edition/homebrew/community',
    name: 'edition-homebrew-community-list',
    component: () => import('@modules/homebrew/views/HomebrewCommunityList.vue'),
    meta: { mode: 'edition', title: 'Communautés custom', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/community/new',
    name: 'edition-homebrew-community-create',
    component: () => import('@modules/homebrew/views/HomebrewCommunityEditor.vue'),
    meta: { mode: 'edition', title: 'Nouvelle communauté', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/community/:id',
    name: 'edition-homebrew-community-edit',
    component: () => import('@modules/homebrew/views/HomebrewCommunityEditor.vue'),
    meta: { mode: 'edition', title: 'Modifier communauté', module: 'homebrew' }
  },

  // Homebrew — Domaines
  {
    path: '/edition/homebrew/domain',
    name: 'edition-homebrew-domain-list',
    component: () => import('@modules/homebrew/views/HomebrewDomainList.vue'),
    meta: { mode: 'edition', title: 'Domaines custom', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/domain/new',
    name: 'edition-homebrew-domain-create',
    component: () => import('@modules/homebrew/views/HomebrewDomainEditor.vue'),
    meta: { mode: 'edition', title: 'Nouveau domaine', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/domain/:id',
    name: 'edition-homebrew-domain-edit',
    component: () => import('@modules/homebrew/views/HomebrewDomainEditor.vue'),
    meta: { mode: 'edition', title: 'Modifier domaine', module: 'homebrew' }
  },

  // Homebrew — Environnements
  {
    path: '/edition/homebrew/environment',
    name: 'edition-homebrew-environment-list',
    component: () => import('@modules/homebrew/views/HomebrewEnvironmentList.vue'),
    meta: { mode: 'edition', title: 'Environnements custom', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/environment/new',
    name: 'edition-homebrew-environment-create',
    component: () => import('@modules/homebrew/views/HomebrewEnvironmentEditor.vue'),
    meta: { mode: 'edition', title: 'Nouvel environnement', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/environment/:id',
    name: 'edition-homebrew-environment-edit',
    component: () => import('@modules/homebrew/views/HomebrewEnvironmentEditor.vue'),
    meta: { mode: 'edition', title: 'Modifier environnement', module: 'homebrew' }
  },

  // Homebrew — Équipement
  {
    path: '/edition/homebrew/equipment',
    name: 'edition-homebrew-equipment-list',
    component: () => import('@modules/homebrew/views/HomebrewEquipmentList.vue'),
    meta: { mode: 'edition', title: 'Équipement custom', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/equipment/new',
    name: 'edition-homebrew-equipment-create',
    component: () => import('@modules/homebrew/views/HomebrewEquipmentEditor.vue'),
    meta: { mode: 'edition', title: 'Nouvel équipement', module: 'homebrew' }
  },
  {
    path: '/edition/homebrew/equipment/:id',
    name: 'edition-homebrew-equipment-edit',
    component: () => import('@modules/homebrew/views/HomebrewEquipmentEditor.vue'),
    meta: { mode: 'edition', title: 'Modifier équipement', module: 'homebrew' }
  },

  // Synchronisation
  {
    path: '/edition/sync',
    name: 'edition-sync',
    component: () => import('@modules/sync/views/SyncManager.vue'),
    meta: { mode: 'edition', title: 'Synchronisation', module: 'sync' }
  },

  // ─────────────────────────────────────────────
  // MODE JEU
  // ─────────────────────────────────────────────
  {
    path: '/jeu/combat',
    name: 'jeu-combat',
    component: () => import('@modules/encounter/views/EncounterLive.vue'),
    meta: { mode: 'jeu', title: 'Combat en cours', module: 'encounter' }
  },
  {
    path: '/jeu/des',
    name: 'jeu-des',
    component: () => import('@modules/dice/views/DiceRoller.vue'),
    meta: { mode: 'jeu', title: 'Lanceur de Dés', module: 'dice' }
  },

  // ─────────────────────────────────────────────
  // REDIRECTIONS LEGACY
  // ─────────────────────────────────────────────
  { path: '/adversaries', redirect: '/lecture/adversaires' },
  { path: '/environments', redirect: '/lecture/environnements' },
  { path: '/characters', redirect: '/edition/personnages' },
  { path: '/characters/classe', redirect: '/lecture/classes' },
  { path: '/characters/domaines', redirect: '/lecture/domaines' },
  { path: '/characters/ascendance', redirect: '/lecture/ascendances' },
  { path: '/characters/communaute', redirect: '/lecture/communautes' },
  { path: '/characters/equipement', redirect: '/lecture/equipement' },
  { path: '/encounters', redirect: '/edition/rencontres' },
  { path: '/encounters/live', redirect: '/jeu/combat' },
  { path: '/npcs', redirect: '/edition/pnjs' },
  { path: '/dice', redirect: '/jeu/des' },
  { path: '/homebrew', redirect: '/edition/homebrew' },
  { path: '/homebrew/adversary', redirect: '/edition/homebrew/adversary' },
  { path: '/homebrew/adversary/new', redirect: '/edition/homebrew/adversary/new' },
  { path: '/homebrew/adversary/:id', redirect: (to) => `/edition/homebrew/adversary/${to.params.id}` },
  { path: '/homebrew/ancestry', redirect: '/edition/homebrew/ancestry' },
  { path: '/homebrew/ancestry/new', redirect: '/edition/homebrew/ancestry/new' },
  { path: '/homebrew/ancestry/:id', redirect: (to) => `/edition/homebrew/ancestry/${to.params.id}` },
  { path: '/homebrew/class', redirect: '/edition/homebrew/class' },
  { path: '/homebrew/class/new', redirect: '/edition/homebrew/class/new' },
  { path: '/homebrew/class/:id', redirect: (to) => `/edition/homebrew/class/${to.params.id}` },
  { path: '/homebrew/community', redirect: '/edition/homebrew/community' },
  { path: '/homebrew/community/new', redirect: '/edition/homebrew/community/new' },
  { path: '/homebrew/community/:id', redirect: (to) => `/edition/homebrew/community/${to.params.id}` },
  { path: '/homebrew/domain', redirect: '/edition/homebrew/domain' },
  { path: '/homebrew/domain/new', redirect: '/edition/homebrew/domain/new' },
  { path: '/homebrew/domain/:id', redirect: (to) => `/edition/homebrew/domain/${to.params.id}` },
  { path: '/homebrew/environment', redirect: '/edition/homebrew/environment' },
  { path: '/homebrew/environment/new', redirect: '/edition/homebrew/environment/new' },
  { path: '/homebrew/environment/:id', redirect: (to) => `/edition/homebrew/environment/${to.params.id}` },
  { path: '/homebrew/equipment', redirect: '/edition/homebrew/equipment' },
  { path: '/homebrew/equipment/new', redirect: '/edition/homebrew/equipment/new' },
  { path: '/homebrew/equipment/:id', redirect: (to) => `/edition/homebrew/equipment/${to.params.id}` },
  { path: '/sync', redirect: '/edition/sync' },

  // ─────────────────────────────────────────────
  // 404
  // ─────────────────────────────────────────────
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
