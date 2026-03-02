/**
 * @module equipment/data
 * @description Équipement SRD Daggerheart : armes, armures, loot & consommables.
 * Sources : SRD_EQUIPMENT.pdf, SRD_LOOTCONSUMABLES.pdf
 */

/** Catégories d'équipement */
export const EQUIPMENT_CATEGORIES = {
  weapon: 'Arme',
  armor: 'Armure',
  loot: 'Loot',
  consumable: 'Consommable'
}

/** Types de dégâts */
export const DAMAGE_TYPES = {
  phy: 'Physique',
  mag: 'Magique'
}

/** Portées */
export const RANGES = {
  melee: 'Mêlée',
  veryClose: 'Très Proche',
  close: 'Proche',
  far: 'Loin',
  veryFar: 'Très Loin'
}

/** Tags d'armes */
export const WEAPON_TAGS = {
  twoHanded: 'Deux mains',
  heavy: 'Lourd',
  thrown: 'Lanceable',
  loading: 'Rechargement',
  reach: 'Portée étendue',
  finesse: 'Finesse',
  light: 'Léger'
}

/** ═══ ARMES ═══ */
export const WEAPONS = [
  // Armes de mêlée
  {
    id: 'dagger',
    name: 'Dague',
    category: 'weapon',
    emoji: '🗡️',
    trait: 'Finesse',
    range: 'melee',
    damageFormula: 'd8+2',
    damageType: 'phy',
    burden: 1,
    tags: ['thrown', 'light'],
    feature: 'Peut être lancée jusqu\'à Portée Proche.',
    price: '2 poignées'
  },
  {
    id: 'shortsword',
    name: 'Épée courte',
    category: 'weapon',
    emoji: '⚔️',
    trait: 'Agilité',
    range: 'melee',
    damageFormula: 'd8+3',
    damageType: 'phy',
    burden: 1,
    tags: ['finesse'],
    feature: 'Finesse : utilisez Agilité ou Finesse pour les jets d\'attaque.',
    price: '3 poignées'
  },
  {
    id: 'longsword',
    name: 'Épée longue',
    category: 'weapon',
    emoji: '⚔️',
    trait: 'Agilité',
    range: 'melee',
    damageFormula: 'd8+3',
    damageType: 'phy',
    burden: 2,
    tags: [],
    feature: 'Peut être utilisée à une main ou à deux mains (d10+4 à deux mains).',
    price: '4 poignées'
  },
  {
    id: 'greatsword',
    name: 'Épée à deux mains',
    category: 'weapon',
    emoji: '⚔️',
    trait: 'Force',
    range: 'melee',
    damageFormula: 'd12+6',
    damageType: 'phy',
    burden: 3,
    tags: ['twoHanded', 'heavy'],
    feature: 'Deux mains requises. Lourd : -1 à l\'Évasion.',
    price: '6 poignées'
  },
  {
    id: 'spear',
    name: 'Lance',
    category: 'weapon',
    emoji: '🏹',
    trait: 'Force',
    range: 'melee',
    damageFormula: 'd8+3',
    damageType: 'phy',
    burden: 2,
    tags: ['thrown', 'reach'],
    feature: 'Portée étendue : peut attaquer à Portée Très Proche. Lanceable jusqu\'à Portée Proche.',
    price: '3 poignées'
  },
  {
    id: 'hammer',
    name: 'Marteau de guerre',
    category: 'weapon',
    emoji: '🔨',
    trait: 'Force',
    range: 'melee',
    damageFormula: 'd10+4',
    damageType: 'phy',
    burden: 3,
    tags: ['heavy'],
    feature: 'Lourd : -1 à l\'Évasion. Sur une réussite critique, la cible est repoussée à Portée Très Proche.',
    price: '5 poignées'
  },
  {
    id: 'handaxe',
    name: 'Hachette',
    category: 'weapon',
    emoji: '🪓',
    trait: 'Force',
    range: 'melee',
    damageFormula: 'd6+2',
    damageType: 'phy',
    burden: 1,
    tags: ['thrown', 'light'],
    feature: 'Lanceable jusqu\'à Portée Proche.',
    price: '2 poignées'
  },
  // Armes à distance
  {
    id: 'shortbow',
    name: 'Arc court',
    category: 'weapon',
    emoji: '🏹',
    trait: 'Finesse',
    range: 'far',
    damageFormula: 'd8+2',
    damageType: 'phy',
    burden: 2,
    tags: ['twoHanded'],
    feature: 'Peut tirer jusqu\'à Portée Très Loin avec désavantage.',
    price: '3 poignées'
  },
  {
    id: 'longbow',
    name: 'Arc long',
    category: 'weapon',
    emoji: '🏹',
    trait: 'Finesse',
    range: 'veryFar',
    damageFormula: 'd8+4',
    damageType: 'phy',
    burden: 2,
    tags: ['twoHanded'],
    feature: 'Deux mains. Portée maximale : Très Loin.',
    price: '5 poignées'
  },
  {
    id: 'crossbow',
    name: 'Arbalète',
    category: 'weapon',
    emoji: '🏹',
    trait: 'Finesse',
    range: 'far',
    damageFormula: 'd12+3',
    damageType: 'phy',
    burden: 3,
    tags: ['twoHanded', 'loading'],
    feature: 'Rechargement : peut tirer une fois par round uniquement (sauf avec une capacité spéciale).',
    price: '6 poignées'
  },
  // Armes magiques
  {
    id: 'staff',
    name: 'Bâton de mage',
    category: 'weapon',
    emoji: '🪄',
    trait: 'Savoir',
    range: 'melee',
    damageFormula: 'd6+1',
    damageType: 'mag',
    burden: 2,
    tags: [],
    feature: 'Les dégâts sont magiques. Peut être utilisé comme focalisateur pour les sorts.',
    price: '4 poignées'
  },
  {
    id: 'wand',
    name: 'Baguette',
    category: 'weapon',
    emoji: '🪄',
    trait: 'Savoir',
    range: 'close',
    damageFormula: 'd4+1',
    damageType: 'mag',
    burden: 1,
    tags: ['light'],
    feature: 'Léger. Focalisateur magique portatif.',
    price: '3 poignées'
  }
]

/** ═══ ARMURES ═══ */
export const ARMORS = [
  {
    id: 'gambeson',
    name: 'Gambison',
    category: 'armor',
    emoji: '🥻',
    thresholdMinor: 5,
    thresholdMajor: 11,
    baseScore: 3,
    burden: 1,
    feature: 'Flexible : +1 à l\'Évasion.',
    price: '2 poignées'
  },
  {
    id: 'leather',
    name: 'Armure de cuir',
    category: 'armor',
    emoji: '🧥',
    thresholdMinor: 6,
    thresholdMajor: 13,
    baseScore: 3,
    burden: 2,
    feature: 'Équilibrée entre protection et mobilité.',
    price: '3 poignées'
  },
  {
    id: 'studded_leather',
    name: 'Cuir clouté',
    category: 'armor',
    emoji: '🧥',
    thresholdMinor: 7,
    thresholdMajor: 14,
    baseScore: 4,
    burden: 2,
    feature: 'Protection améliorée sans pénalité majeure.',
    price: '4 poignées'
  },
  {
    id: 'chainmail',
    name: 'Cotte de mailles',
    category: 'armor',
    emoji: '🛡️',
    thresholdMinor: 7,
    thresholdMajor: 15,
    baseScore: 4,
    burden: 3,
    feature: 'Lourd : -1 à l\'Évasion.',
    price: '5 poignées'
  },
  {
    id: 'half_plate',
    name: 'Demi-armure de plaques',
    category: 'armor',
    emoji: '⚔️',
    thresholdMinor: 8,
    thresholdMajor: 17,
    baseScore: 5,
    burden: 3,
    feature: 'Lourd : -1 à l\'Évasion. Protection solide pour les combattants de première ligne.',
    price: '7 poignées'
  },
  {
    id: 'full_plate',
    name: 'Armure de plates complète',
    category: 'armor',
    emoji: '🏰',
    thresholdMinor: 9,
    thresholdMajor: 18,
    baseScore: 6,
    burden: 4,
    feature: 'Très Lourd : -2 à l\'Évasion. La protection maximale disponible.',
    price: '1 sac'
  },
  {
    id: 'mage_robes',
    name: 'Robes de mage',
    category: 'armor',
    emoji: '👘',
    thresholdMinor: 4,
    thresholdMajor: 10,
    baseScore: 2,
    burden: 1,
    feature: 'Légères. Arcanique : +1 aux jets de Sort.',
    price: '3 poignées'
  },
  {
    id: 'druid_hide',
    name: 'Cuir de druide',
    category: 'armor',
    emoji: '🌿',
    thresholdMinor: 6,
    thresholdMajor: 12,
    baseScore: 3,
    burden: 2,
    feature: 'Naturelle : compatible avec les capacités de transformation.',
    price: '3 poignées'
  }
]

/** ═══ LOOT ═══ */
export const LOOT = [
  {
    id: 'torch',
    name: 'Torche',
    category: 'loot',
    emoji: '🔦',
    description: 'Illumine une zone Proche pendant 1 heure.',
    price: '1 poignée'
  },
  {
    id: 'rope',
    name: 'Corde (15 m)',
    category: 'loot',
    emoji: '🪢',
    description: 'Corde robuste de 15 mètres. Utile pour l\'escalade, l\'attachement, etc.',
    price: '1 poignée'
  },
  {
    id: 'lockpick',
    name: 'Crochets de serrurier',
    category: 'loot',
    emoji: '🔑',
    description: 'Kit de crochetage pour serrures ordinaires. +1 aux jets de Finesse pour crocheter.',
    price: '2 poignées'
  },
  {
    id: 'thieves_tools',
    name: 'Outils de voleur',
    category: 'loot',
    emoji: '🛠️',
    description: 'Set complet : crochets, miroir, pied de biche léger, etc. +2 aux jets de Finesse appropriés.',
    price: '3 poignées'
  },
  {
    id: 'grappling_hook',
    name: 'Grappin',
    category: 'loot',
    emoji: '⚓',
    description: 'Grappin avec 9 m de corde. Peut accrocher des rebords jusqu\'à Portée Lointaine.',
    price: '2 poignées'
  },
  {
    id: 'map_case',
    name: 'Étui à cartes',
    category: 'loot',
    emoji: '🗺️',
    description: 'Protège les cartes et parchemins. Peut contenir jusqu\'à 10 cartes roulées.',
    price: '1 poignée'
  },
  {
    id: 'spyglass',
    name: 'Longue-vue',
    category: 'loot',
    emoji: '🔭',
    description: 'Permet d\'observer à Portée Très Loin avec clarté. +1 aux jets de Perception à longue portée.',
    price: '5 poignées'
  },
  {
    id: 'healing_kit',
    name: 'Kit de soins',
    category: 'loot',
    emoji: '⛑️',
    description: 'Bandages, herbes médicinales, fil de suture. Permet d\'effectuer des soins basiques hors combat.',
    price: '3 poignées'
  },
  {
    id: 'signal_whistle',
    name: 'Sifflet de signal',
    category: 'loot',
    emoji: '🎵',
    description: 'Son audible jusqu\'à Portée Très Loin. Utilisé pour coordonner les groupes.',
    price: '1 poignée'
  },
  {
    id: 'disguise_kit',
    name: 'Kit de déguisement',
    category: 'loot',
    emoji: '🎭',
    description: '+2 aux jets de Présence pour se faire passer pour quelqu\'un d\'autre.',
    price: '4 poignées'
  }
]

/** ═══ CONSOMMABLES ═══ */
export const CONSUMABLES = [
  {
    id: 'minor_stamina_potion',
    name: 'Potion de Vigueur Mineure',
    category: 'consumable',
    emoji: '🧪',
    description: 'Effacez 1 emplacement de Stress marqué.',
    uses: 1,
    price: '2 poignées'
  },
  {
    id: 'major_stamina_potion',
    name: 'Potion de Vigueur Majeure',
    category: 'consumable',
    emoji: '🧪',
    description: 'Effacez 2 emplacements de Stress marqués.',
    uses: 1,
    price: '4 poignées'
  },
  {
    id: 'minor_health_potion',
    name: 'Potion de Santé Mineure',
    category: 'consumable',
    emoji: '❤️',
    description: 'Effacez 1 emplacement de PV marqué.',
    uses: 1,
    price: '3 poignées'
  },
  {
    id: 'major_health_potion',
    name: 'Potion de Santé Majeure',
    category: 'consumable',
    emoji: '💖',
    description: 'Effacez 2 emplacements de PV marqués.',
    uses: 1,
    price: '6 poignées'
  },
  {
    id: 'antidote',
    name: 'Antidote',
    category: 'consumable',
    emoji: '🌿',
    description: 'Supprime l\'effet d\'un poison actif ou d\'une maladie de courte durée.',
    uses: 1,
    price: '3 poignées'
  },
  {
    id: 'smoke_bomb',
    name: 'Bombe fumigène',
    category: 'consumable',
    emoji: '💨',
    description: 'Crée un écran de fumée à Portée Proche. Toutes les créatures dans la zone sont Cachées jusqu\'à la fin du round ou jusqu\'à ce que le vent dissipe la fumée.',
    uses: 1,
    price: '2 poignées'
  },
  {
    id: 'alchemist_fire',
    name: 'Feu alchimique',
    category: 'consumable',
    emoji: '🔥',
    description: 'Lancez sur une cible à Portée Proche. En cas de succès (Finesse vs. Évasion), inflige 1d6 dégâts magiques par round pendant 3 rounds. Un allié peut éteindre les flammes avec une action.',
    uses: 1,
    price: '4 poignées'
  },
  {
    id: 'holy_water',
    name: 'Eau bénite',
    category: 'consumable',
    emoji: '💧',
    description: 'Aspergez une créature morte-vivante ou démoniaque à Portée Très Proche. Elle subit 2d6 dégâts magiques.',
    uses: 1,
    price: '3 poignées'
  },
  {
    id: 'flash_powder',
    name: 'Poudre aveuglante',
    category: 'consumable',
    emoji: '✨',
    description: 'Lancez au sol à Portée Très Proche. Toutes les créatures à Portée Très Proche (sauf vous) sont Désorientées jusqu\'à la fin de leur prochain tour.',
    uses: 1,
    price: '3 poignées'
  },
  {
    id: 'ration',
    name: 'Ration de voyage',
    category: 'consumable',
    emoji: '🍞',
    description: 'Nourriture sèche pour 1 jour. Nécessaire pour effectuer un Repos Long sans pénalité.',
    uses: 1,
    price: '5 pièces'
  }
]

/** Tout l'équipement combiné */
export const ALL_EQUIPMENT = [...WEAPONS, ...ARMORS, ...LOOT, ...CONSUMABLES]

/**
 * Retourne un équipement par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getEquipmentById(id) {
  return ALL_EQUIPMENT.find((e) => e.id === id) || null
}

/**
 * Retourne l'équipement filtré par catégorie.
 * @param {string} category
 * @returns {Object[]}
 */
export function getEquipmentByCategory(category) {
  return ALL_EQUIPMENT.filter((e) => e.category === category)
}
