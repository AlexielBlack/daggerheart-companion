/**
 * @module encounters/templates
 * @description Templates de rencontres pré-construites.
 * Chaque template correspond à une composition SRD équilibrée.
 * Les adversaryIds réfèrent aux données dans @data/adversaries tier1-4.json.
 *
 * ATTENTION : Tous les IDs doivent correspondre à des adversaires existants.
 */

export const ENCOUNTER_TEMPLATES = [
  // ══════════════════════════════════════════════════════
  // TIER 1
  // ══════════════════════════════════════════════════════
  {
    id: 'bandit-ambush-t1',
    name: 'Embuscade de bandits',
    description: 'Un groupe de bandits du Jagged Knife tend une embuscade sur la route.',
    tier: 1,
    pcCount: 4,
    intensity: 'standard',
    tags: ['combat', 'embuscade'],
    adversarySlots: [
      { adversaryId: 'jagged-knife-lackey', quantity: 2 },
      { adversaryId: 'jagged-knife-bandit', quantity: 2 },
      { adversaryId: 'jagged-knife-lieutenant', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Les lackeys chargent en premier. Le lieutenant reste en retrait et commande.'
  },
  {
    id: 'skeleton-crypt-t1',
    name: 'La crypte des squelettes',
    description: 'Des morts-vivants gardent une ancienne crypte.',
    tier: 1,
    pcCount: 4,
    intensity: 'standard',
    tags: ['combat', 'donjon', 'morts-vivants'],
    adversarySlots: [
      { adversaryId: 'skeleton-dredge', quantity: 2 },
      { adversaryId: 'skeleton-warrior', quantity: 2 },
      { adversaryId: 'skeleton-archer', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Les dredges en première ligne, les archers en hauteur.'
  },
  {
    id: 'zombie-horde-t1',
    name: 'Marée de zombies',
    description: 'Une horde de morts-vivants déferle sur le groupe.',
    tier: 1,
    pcCount: 4,
    intensity: 'major',
    tags: ['combat', 'horde', 'morts-vivants'],
    adversarySlots: [
      { adversaryId: 'rotted-zombie', quantity: 3 },
      { adversaryId: 'zombie-pack', quantity: 2 },
      { adversaryId: 'brawny-zombie', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Submersion par le nombre. Le brawny zombie est la menace principale.'
  },
  {
    id: 'pirate-raid-t1',
    name: 'Raid pirate',
    description: 'Des pirates attaquent un navire marchand ou un port.',
    tier: 1,
    pcCount: 4,
    intensity: 'standard',
    tags: ['combat', 'pirates'],
    adversarySlots: [
      { adversaryId: 'pirate-raiders', quantity: 1 },
      { adversaryId: 'pirate-tough', quantity: 1 },
      { adversaryId: 'pirate-captain', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Le capitaine motive ses troupes. Combat sur les ponts d\'un navire.'
  },
  {
    id: 'cave-ogre-boss-t1',
    name: 'Antre de l\'ogre',
    description: 'Un ogre des cavernes a élu domicile et terrorise la région.',
    tier: 1,
    pcCount: 4,
    intensity: 'major',
    tags: ['combat', 'boss', 'donjon'],
    adversarySlots: [
      { adversaryId: 'giant-rat', quantity: 3 },
      { adversaryId: 'cave-ogre', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'L\'ogre est un boss Solo. Les rats servent de distraction.'
  },
  {
    id: 'forest-creatures-t1',
    name: 'Périls de la forêt',
    description: 'La forêt elle-même semble hostile aux voyageurs.',
    tier: 1,
    pcCount: 4,
    intensity: 'minor',
    tags: ['combat', 'nature'],
    adversarySlots: [
      { adversaryId: 'tangle-bramble', quantity: 3 },
      { adversaryId: 'tangle-bramble-swarm', quantity: 1 },
      { adversaryId: 'green-ooze', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Rencontre d\'introduction dans une forêt enchantée.'
  },

  // ══════════════════════════════════════════════════════
  // TIER 2
  // ══════════════════════════════════════════════════════
  {
    id: 'cult-ritual-t2',
    name: 'Rituel du culte',
    description: 'Un culte démoniaque prépare un rituel sombre.',
    tier: 2,
    pcCount: 4,
    intensity: 'standard',
    tags: ['combat', 'culte', 'donjon'],
    adversarySlots: [
      { adversaryId: 'cult-initiate', quantity: 3 },
      { adversaryId: 'cult-fang', quantity: 1 },
      { adversaryId: 'cult-adept', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Les initiés protègent l\'adepte qui canalise le rituel.'
  },
  {
    id: 'assassin-guild-t2',
    name: 'Guilde des assassins',
    description: 'Une équipe d\'assassins cible le groupe.',
    tier: 2,
    pcCount: 4,
    intensity: 'major',
    tags: ['combat', 'embuscade', 'urbain'],
    adversarySlots: [
      { adversaryId: 'apprentice-assassin', quantity: 3 },
      { adversaryId: 'assassin-poisoner', quantity: 1 },
      { adversaryId: 'master-assassin', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Embuscade en milieu urbain. Le maître assassin frappe en dernier.'
  },
  {
    id: 'gorgon-lair-t2',
    name: 'Repaire de la gorgone',
    description: 'La gorgone légendaire hante les ruines anciennes.',
    tier: 2,
    pcCount: 4,
    intensity: 'major',
    tags: ['combat', 'boss', 'donjon'],
    adversarySlots: [
      { adversaryId: 'conscript', quantity: 3 },
      { adversaryId: 'gorgon', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Les conscripts sont pétrifiés — ils attaquent sans volonté. La gorgone est le boss Solo.'
  },
  {
    id: 'spectral-fortress-t2',
    name: 'Forteresse spectrale',
    description: 'Les fantômes d\'une garnison oubliée se réveillent.',
    tier: 2,
    pcCount: 4,
    intensity: 'standard',
    tags: ['combat', 'morts-vivants', 'donjon'],
    adversarySlots: [
      { adversaryId: 'spectral-guardian', quantity: 2 },
      { adversaryId: 'spectral-archer', quantity: 1 },
      { adversaryId: 'spectral-captain', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Les gardiens tiennent la ligne. Le capitaine coordonne les tirs des archers.'
  },
  {
    id: 'noble-court-t2',
    name: 'Intrigues à la cour',
    description: 'Négociations tendues dans un palais royal.',
    tier: 2,
    pcCount: 4,
    intensity: 'standard',
    tags: ['social', 'politique'],
    adversarySlots: [
      { adversaryId: 'merchant-baron', quantity: 1 },
      { adversaryId: 'courtesan', quantity: 1 },
      { adversaryId: 'royal-advisor', quantity: 1 },
      { adversaryId: 'spy', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Rencontre sociale. Chaque PNJ a ses propres objectifs et secrets.'
  },

  // ══════════════════════════════════════════════════════
  // TIER 3
  // ══════════════════════════════════════════════════════
  {
    id: 'demon-incursion-t3',
    name: 'Incursion démoniaque',
    description: 'Des démons traversent une brèche dimensionnelle.',
    tier: 3,
    pcCount: 4,
    intensity: 'major',
    tags: ['combat', 'démons', 'épique'],
    adversarySlots: [
      { adversaryId: 'elemental-spark', quantity: 3 },
      { adversaryId: 'demon-of-wrath', quantity: 1 },
      { adversaryId: 'demon-of-hubris', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Les sparks explosent au contact. Le démon d\'orgueil commande l\'assaut.'
  },
  {
    id: 'hydra-swamp-t3',
    name: 'L\'hydre du marais',
    description: 'Une hydre colossale bloque le passage à travers le marais.',
    tier: 3,
    pcCount: 4,
    intensity: 'climactic',
    tags: ['combat', 'boss', 'nature'],
    adversarySlots: [
      { adversaryId: 'dire-bat', quantity: 2 },
      { adversaryId: 'hydra', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'L\'hydre est un boss Solo redoutable. Les chauves-souris harcèlent à distance.'
  },
  {
    id: 'vampire-coven-t3',
    name: 'Le cercle vampirique',
    description: 'Un ancien vampire et sa cour menacent la cité.',
    tier: 3,
    pcCount: 4,
    intensity: 'major',
    tags: ['combat', 'morts-vivants', 'boss'],
    adversarySlots: [
      { adversaryId: 'vampire', quantity: 2 },
      { adversaryId: 'head-vampire', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Le vampire en chef est un Leader puissant. Ses serviteurs protègent et flanquent.'
  },
  {
    id: 'treant-grove-t3',
    name: 'Le bosquet éveillé',
    description: 'Les gardiens de la forêt ancestrale défendent leur territoire.',
    tier: 3,
    pcCount: 4,
    intensity: 'standard',
    tags: ['combat', 'nature'],
    adversarySlots: [
      { adversaryId: 'treant-sapling', quantity: 3 },
      { adversaryId: 'stag-knight', quantity: 1 },
      { adversaryId: 'dryad', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'La dryade commande les tréants. Le stag knight est le champion du bosquet.'
  },
  {
    id: 'ice-dragon-t3',
    name: 'Le dragon de glace',
    description: 'Un jeune dragon de glace terrorise les montagnes.',
    tier: 3,
    pcCount: 4,
    intensity: 'climactic',
    tags: ['combat', 'boss', 'dragon', 'épique'],
    adversarySlots: [
      { adversaryId: 'elemental-spark', quantity: 4 },
      { adversaryId: 'young-ice-dragon', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Combat épique contre un dragon. Les sparks de glace protègent son antre.'
  },

  // ══════════════════════════════════════════════════════
  // TIER 4
  // ══════════════════════════════════════════════════════
  {
    id: 'necromancer-siege-t4',
    name: 'Le siège du nécromancien',
    description: 'L\'arch-nécromancien lance son armée de morts contre la cité.',
    tier: 4,
    pcCount: 4,
    intensity: 'climactic',
    tags: ['combat', 'morts-vivants', 'boss', 'épique'],
    adversarySlots: [
      { adversaryId: 'fallen-shock-troop', quantity: 3 },
      { adversaryId: 'perfected-zombie', quantity: 1 },
      { adversaryId: 'fallen-sorcerer', quantity: 1 },
      { adversaryId: 'arch-necromancer', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Le nécromancien relève les morts tombés. Priorité : éliminer le sorcier d\'abord.'
  },
  {
    id: 'kraken-depths-t4',
    name: 'Le kraken des profondeurs',
    description: 'Un kraken ancestral attaque en pleine mer.',
    tier: 4,
    pcCount: 4,
    intensity: 'climactic',
    tags: ['combat', 'boss', 'mer', 'épique'],
    adversarySlots: [
      { adversaryId: 'zombie-legion', quantity: 1 },
      { adversaryId: 'kraken', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Combat naval épique. Les légions sont des marins noyés réanimés par le kraken.'
  },
  {
    id: 'outer-realms-breach-t4',
    name: 'Brèche des Royaumes Extérieurs',
    description: 'Des abominations d\'un autre monde envahissent la réalité.',
    tier: 4,
    pcCount: 4,
    intensity: 'climactic',
    tags: ['combat', 'horreur', 'épique'],
    adversarySlots: [
      { adversaryId: 'outer-realms-thrall', quantity: 3 },
      { adversaryId: 'outer-realms-corrupter', quantity: 1 },
      { adversaryId: 'outer-realms-abomination', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Le corrupter transforme les alliés en thralls. L\'abomination est le tank.'
  },
  {
    id: 'volcanic-dragon-t4',
    name: 'Le dragon volcanique',
    description: 'Un ancien dragon volcanique émerge de son volcan.',
    tier: 4,
    pcCount: 4,
    intensity: 'climactic',
    tags: ['combat', 'boss', 'dragon', 'épique'],
    adversarySlots: [
      { adversaryId: 'hallowed-soldier', quantity: 3 },
      { adversaryId: 'volcanic-dragon-obsidian-predator', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'Combat final contre un dragon ancien. Les soldats sacrés tentent de le contenir.'
  },
  {
    id: 'oracle-doom-t4',
    name: 'L\'Oracle de la Destruction',
    description: 'Un oracle fou a vu la fin du monde et cherche à l\'accomplir.',
    tier: 4,
    pcCount: 4,
    intensity: 'climactic',
    tags: ['combat', 'boss', 'épique'],
    adversarySlots: [
      { adversaryId: 'hallowed-archer', quantity: 2 },
      { adversaryId: 'high-seraph', quantity: 1 },
      { adversaryId: 'oracle-of-doom', quantity: 1 }
    ],
    environmentId: null,
    adjustments: [],
    notes: 'L\'oracle est un Solo puissant. Le High Seraph renforce ses défenses.'
  }
]

/**
 * Filtre les templates par critères.
 * @param {Object} filters - { tier?, pcCount?, tag? }
 * @returns {Array} Templates filtrés
 */
export function filterTemplates(filters = {}) {
  return ENCOUNTER_TEMPLATES.filter((t) => {
    if (filters.tier && t.tier !== filters.tier) return false
    if (filters.pcCount && t.pcCount !== filters.pcCount) return false
    if (filters.tag && !t.tags.includes(filters.tag)) return false
    return true
  })
}
