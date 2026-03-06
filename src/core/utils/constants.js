/**
 * Constantes globales du jeu Daggerheart.
 */

export const TIER_LABELS = {
  1: 'Tier 1',
  2: 'Tier 2',
  3: 'Tier 3',
  4: 'Tier 4'
}

export const TIER_LEVELS = {
  1: '1-4',
  2: '5-8',
  3: '9-12',
  4: '13-16'
}

export const TRAITS = [
  'agility',
  'strength',
  'finesse',
  'instinct',
  'presence',
  'knowledge'
]

export const TRAIT_LABELS_FR = {
  agility: 'Agilité',
  strength: 'Force',
  finesse: 'Finesse',
  instinct: 'Instinct',
  presence: 'Présence',
  knowledge: 'Savoir'
}

export const DAMAGE_TYPES = {
  phy: 'Physique',
  mag: 'Magique'
}

export const RANGES = ['Melee', 'Close', 'Far', 'Very Far']

export const ADVERSARY_TYPES = [
  'Minion',
  'Standard',
  'Leader',
  'Solo',
  'Horde',
  'Skulk',
  'Social',
  'Support',
  'Bruiser'
]

export const FEATURE_TYPES = {
  action: 'Action',
  reaction: 'Réaction',
  passive: 'Passif'
}

/**
 * Conditions standard SRD (CoreMechanics_SRD.pdf).
 * Daggerheart ne possède que 3 conditions standard.
 */
export const CONDITIONS = [
  'Vulnerable',
  'Restrained',
  'Hidden'
]

export const MAX_FEAR = 12
export const MAX_HOPE = 6    // SRD : "A PC can have a maximum of 6 Hope at one time"

export const GOLD_UNITS = {
  handfuls: 'Poignée(s)',
  bags: 'Sac(s)',
  chests: 'Coffre(s)'
}

export const ENCOUNTER_STATUS = {
  preparation: 'Préparation',
  active: 'En cours',
  completed: 'Terminée'
}

export const NAV_ITEMS = [
  { id: 'adversaries', label: 'Adversaires', icon: '⚔️', route: '/adversaries' },
  { id: 'environments', label: 'Environnements', icon: '🌍', route: '/environments' },
  { id: 'encounters', label: 'Rencontres', icon: '🗺️', route: '/encounters' },
  { id: 'npcs', label: 'PNJs', icon: '🎭', route: '/npcs' },
  {
    id: 'characters',
    label: 'Personnages',
    icon: '🧙',
    route: '/characters',
    children: [
      { id: 'characters-builder', label: 'Fiche', icon: '📝', route: '/characters' },
      { id: 'characters-classe', label: 'Classe', icon: '⚔️', route: '/characters/classe' },
      { id: 'characters-domaines', label: 'Domaines', icon: '🃏', route: '/characters/domaines' },
      { id: 'characters-ascendance', label: 'Ascendance', icon: '🧬', route: '/characters/ascendance' },
      { id: 'characters-communaute', label: 'Communauté', icon: '🏘️', route: '/characters/communaute' },
      { id: 'characters-equipement', label: 'Équipement', icon: '🗡️', route: '/characters/equipement' }
    ]
  },
  { id: 'dice', label: 'Dés', icon: '🎲', route: '/dice' },
  {
    id: 'homebrew',
    label: 'Homebrew',
    icon: '✎',
    route: '/homebrew',
    children: [
      { id: 'homebrew-hub', label: 'Hub', icon: '🏠', route: '/homebrew' },
      { id: 'homebrew-adversary', label: 'Adversaires', icon: '⚔️', route: '/homebrew/adversary' },
      { id: 'homebrew-ancestry', label: 'Ascendances', icon: '🧬', route: '/homebrew/ancestry' },
      { id: 'homebrew-class', label: 'Classes', icon: '🛡️', route: '/homebrew/class' },
      { id: 'homebrew-community', label: 'Communautés', icon: '🏘️', route: '/homebrew/community' },
      { id: 'homebrew-domain', label: 'Domaines', icon: '🃏', route: '/homebrew/domain' },
      { id: 'homebrew-environment', label: 'Environnements', icon: '🏔️', route: '/homebrew/environment' },
      { id: 'homebrew-equipment', label: 'Équipement', icon: '🗡️', route: '/homebrew/equipment' }
    ]
  },
  { id: 'sync', label: 'Synchronisation', icon: '🔄', route: '/sync' }
]

/**
 * Navigation par mode. Chaque mode contient ses items de navigation.
 */
export const MODE_NAV = {
  lecture: [
    { id: 'lecture-adversaires', label: 'Adversaires', icon: '⚔️', route: '/lecture/adversaires' },
    { id: 'lecture-environnements', label: 'Environnements', icon: '🌍', route: '/lecture/environnements' },
    { id: 'lecture-classes', label: 'Classes', icon: '🛡️', route: '/lecture/classes' },
    { id: 'lecture-domaines', label: 'Domaines', icon: '🃏', route: '/lecture/domaines' },
    { id: 'lecture-ascendances', label: 'Ascendances', icon: '🧬', route: '/lecture/ascendances' },
    { id: 'lecture-communautes', label: 'Communautés', icon: '🏘️', route: '/lecture/communautes' },
    { id: 'lecture-equipement', label: 'Équipement', icon: '🗡️', route: '/lecture/equipement' }
  ],
  edition: [
    { id: 'edition-personnages', label: 'Personnages', icon: '🧙', route: '/edition/personnages' },
    { id: 'edition-rencontres', label: 'Rencontres', icon: '🗺️', route: '/edition/rencontres' },
    { id: 'edition-pnjs', label: 'PNJs', icon: '🎭', route: '/edition/pnjs' },
    {
      id: 'edition-homebrew', label: 'Homebrew', icon: '✎', route: '/edition/homebrew',
      children: [
        { id: 'edition-homebrew-hub', label: 'Hub', icon: '🏠', route: '/edition/homebrew' },
        { id: 'edition-homebrew-adversary', label: 'Adversaires', icon: '⚔️', route: '/edition/homebrew/adversary' },
        { id: 'edition-homebrew-ancestry', label: 'Ascendances', icon: '🧬', route: '/edition/homebrew/ancestry' },
        { id: 'edition-homebrew-class', label: 'Classes', icon: '🛡️', route: '/edition/homebrew/class' },
        { id: 'edition-homebrew-community', label: 'Communautés', icon: '🏘️', route: '/edition/homebrew/community' },
        { id: 'edition-homebrew-domain', label: 'Domaines', icon: '🃏', route: '/edition/homebrew/domain' },
        { id: 'edition-homebrew-environment', label: 'Environnements', icon: '🏔️', route: '/edition/homebrew/environment' },
        { id: 'edition-homebrew-equipment', label: 'Équipement', icon: '🗡️', route: '/edition/homebrew/equipment' }
      ]
    },
    { id: 'edition-sync', label: 'Sync', icon: '🔄', route: '/edition/sync' }
  ],
  jeu: [
    { id: 'jeu-combat', label: 'Combat', icon: '⚔️', route: '/jeu/combat' },
    { id: 'jeu-des', label: 'Dés', icon: '🎲', route: '/jeu/des' }
  ]
}
