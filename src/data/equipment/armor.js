/**
 * @module equipment/armor
 * @description Armures SRD Daggerheart — toutes les tiers.
 * Source : SRD_EQUIPMENT.pdf (pages 6)
 */

export const ARMOR = [
  // ═══════════════════════════════════════════
  //  TIER 1 (Level 1)
  // ═══════════════════════════════════════════
  {
    id: 'gambeson-t1',
    name: 'Gambeson Armor',
    tier: 1,
    thresholds: { major: 5, severe: 11 },
    baseScore: 3,
    feature: 'Flexible : +1 en Évasion',
    featureKey: 'Flexible',
    tags: ['défensif']
  },
  {
    id: 'leather-t1',
    name: 'Leather Armor',
    tier: 1,
    thresholds: { major: 6, severe: 13 },
    baseScore: 3,
    feature: null,
    featureKey: null,
    tags: ['défensif']
  },
  {
    id: 'chainmail-t1',
    name: 'Chainmail Armor',
    tier: 1,
    thresholds: { major: 7, severe: 15 },
    baseScore: 4,
    feature: 'Heavy : −1 en Évasion',
    featureKey: 'Heavy',
    tags: ['défensif']
  },
  {
    id: 'full-plate-t1',
    name: 'Full Plate Armor',
    tier: 1,
    thresholds: { major: 8, severe: 17 },
    baseScore: 4,
    feature: 'Very Heavy : −2 en Évasion ; −1 en Agilité',
    featureKey: 'Very Heavy',
    tags: ['défensif']
  },

  // ═══════════════════════════════════════════
  //  TIER 2 (Levels 2–4)
  // ═══════════════════════════════════════════
  {
    id: 'gambeson-t2',
    name: 'Improved Gambeson Armor',
    tier: 2,
    thresholds: { major: 7, severe: 16 },
    baseScore: 4,
    feature: 'Flexible : +1 en Évasion',
    featureKey: 'Flexible',
    tags: ['défensif']
  },
  {
    id: 'leather-t2',
    name: 'Improved Leather Armor',
    tier: 2,
    thresholds: { major: 9, severe: 20 },
    baseScore: 4,
    feature: null,
    featureKey: null,
    tags: ['défensif']
  },
  {
    id: 'chainmail-t2',
    name: 'Improved Chainmail Armor',
    tier: 2,
    thresholds: { major: 11, severe: 24 },
    baseScore: 5,
    feature: 'Heavy : −1 en Évasion',
    featureKey: 'Heavy',
    tags: ['défensif']
  },
  {
    id: 'full-plate-t2',
    name: 'Improved Full Plate Armor',
    tier: 2,
    thresholds: { major: 13, severe: 28 },
    baseScore: 5,
    feature: 'Very Heavy : −2 en Évasion ; −1 en Agilité',
    featureKey: 'Very Heavy',
    tags: ['défensif']
  },
  {
    id: 'elundrian-chain-t2',
    name: 'Elundrian Chain Armor',
    tier: 2,
    thresholds: { major: 9, severe: 21 },
    baseScore: 4,
    feature: 'Warded : Vous réduisez les dégâts magiques entrants de votre Score d’armure avant de les appliquer à vos seuils de dégâts.',
    featureKey: 'Warded',
    tags: ['défensif']
  },
  {
    id: 'harrowbone-t2',
    name: 'Harrowbone Armor',
    tier: 2,
    thresholds: { major: 9, severe: 21 },
    baseScore: 4,
    feature: 'Resilient : Avant de cocher votre dernier Emplacement d’armure, lancez un d6. Sur un résultat de 6, réduisez la gravité d’un seuil sans cocher d’Emplacement d’armure.',
    featureKey: 'Resilient',
    tags: ['défensif']
  },
  {
    id: 'irontree-breastplate-t2',
    name: 'Irontree Breastplate Armor',
    tier: 2,
    thresholds: { major: 9, severe: 20 },
    baseScore: 4,
    feature: 'Reinforced : Quand vous cochez votre dernier Emplacement d’armure, augmentez vos seuils de dégâts de +2 jusqu’à ce que vous libériez au moins 1 Emplacement d’armure.',
    featureKey: 'Reinforced',
    tags: ['défensif']
  },
  {
    id: 'runetan-floating-t2',
    name: 'Runetan Floating Armor',
    tier: 2,
    thresholds: { major: 9, severe: 20 },
    baseScore: 4,
    feature: 'Shifting : Quand vous êtes ciblé par une attaque, vous pouvez cocher un Emplacement d’armure pour imposer un désavantage au jet d’attaque contre vous.',
    featureKey: 'Shifting',
    tags: ['défensif']
  },
  {
    id: 'tyris-soft-t2',
    name: 'Tyris Soft Armor',
    tier: 2,
    thresholds: { major: 8, severe: 18 },
    baseScore: 5,
    feature: 'Quiet : Vous obtenez un bonus de +2 aux jets pour vous déplacer silencieusement.',
    featureKey: 'Quiet',
    tags: ['défensif']
  },
  {
    id: 'rosewild-t2',
    name: 'Rosewild Armor',
    tier: 2,
    thresholds: { major: 11, severe: 23 },
    baseScore: 5,
    feature: 'Hopeful : Quand vous devriez dépenser un Espoir, vous pouvez cocher un Emplacement d’armure à la place.',
    featureKey: 'Hopeful',
    tags: ['défensif']
  },

  // ═══════════════════════════════════════════
  //  TIER 3 (Levels 5–7)
  // ═══════════════════════════════════════════
  {
    id: 'gambeson-t3',
    name: 'Advanced Gambeson Armor',
    tier: 3,
    thresholds: { major: 9, severe: 23 },
    baseScore: 5,
    feature: 'Flexible : +1 en Évasion',
    featureKey: 'Flexible',
    tags: ['défensif']
  },
  {
    id: 'leather-t3',
    name: 'Advanced Leather Armor',
    tier: 3,
    thresholds: { major: 11, severe: 27 },
    baseScore: 5,
    feature: null,
    featureKey: null,
    tags: ['défensif']
  },
  {
    id: 'chainmail-t3',
    name: 'Advanced Chainmail Armor',
    tier: 3,
    thresholds: { major: 13, severe: 31 },
    baseScore: 6,
    feature: 'Heavy : −1 en Évasion',
    featureKey: 'Heavy',
    tags: ['défensif']
  },
  {
    id: 'full-plate-t3',
    name: 'Advanced Full Plate Armor',
    tier: 3,
    thresholds: { major: 15, severe: 35 },
    baseScore: 6,
    feature: 'Very Heavy : −2 en Évasion ; −1 en Agilité',
    featureKey: 'Very Heavy',
    tags: ['défensif']
  },
  {
    id: 'bellamoi-fine-t3',
    name: 'Bellamoi Fine Armor',
    tier: 3,
    thresholds: { major: 11, severe: 27 },
    baseScore: 5,
    feature: 'Gilded : +1 en Présence',
    featureKey: 'Gilded',
    tags: ['défensif']
  },
  {
    id: 'dragonscale-t3',
    name: 'Dragonscale Armor',
    tier: 3,
    thresholds: { major: 11, severe: 27 },
    baseScore: 5,
    feature: 'Impenetrable : Une fois par repos court, quand vous devriez cocher votre dernier Point de vie, vous pouvez cocher un Stress à la place.',
    featureKey: 'Impenetrable',
    tags: ['défensif']
  },
  {
    id: 'spiked-plate-t3',
    name: 'Spiked Plate Armor',
    tier: 3,
    thresholds: { major: 10, severe: 25 },
    baseScore: 5,
    feature: 'Sharp : Sur une attaque réussie contre une cible à portée de Mêlée, ajoutez un d4 au jet de dégâts.',
    featureKey: 'Sharp',
    tags: ['défensif']
  },
  {
    id: 'bladefare-t3',
    name: 'Bladefare Armor',
    tier: 3,
    thresholds: { major: 16, severe: 39 },
    baseScore: 6,
    feature: 'Physical : Vous ne pouvez pas cocher un Emplacement d\u2019armure pour réduire les dégâts magiques.',
    featureKey: 'Physical',
    tags: ['défensif']
  },
  {
    id: 'monetts-cloak-t3',
    name: 'Monett\'s Cloak',
    tier: 3,
    thresholds: { major: 16, severe: 39 },
    baseScore: 6,
    feature: 'Magic : Vous ne pouvez pas cocher un Emplacement d\u2019armure pour réduire les dégâts physiques.',
    featureKey: 'Magic',
    tags: ['défensif']
  },
  {
    id: 'runes-fortification-t3',
    name: 'Runes of Fortification',
    tier: 3,
    thresholds: { major: 17, severe: 43 },
    baseScore: 6,
    feature: 'Painful : Chaque fois que vous cochez un Emplacement d’armure, vous devez cocher un Stress.',
    featureKey: 'Painful',
    tags: ['défensif']
  },

  // ═══════════════════════════════════════════
  //  TIER 4 (Levels 8–10)
  // ═══════════════════════════════════════════
  {
    id: 'gambeson-t4',
    name: 'Legendary Gambeson Armor',
    tier: 4,
    thresholds: { major: 11, severe: 32 },
    baseScore: 6,
    feature: 'Flexible : +1 en Évasion',
    featureKey: 'Flexible',
    tags: ['défensif']
  },
  {
    id: 'leather-t4',
    name: 'Legendary Leather Armor',
    tier: 4,
    thresholds: { major: 13, severe: 36 },
    baseScore: 6,
    feature: null,
    featureKey: null,
    tags: ['défensif']
  },
  {
    id: 'chainmail-t4',
    name: 'Legendary Chainmail Armor',
    tier: 4,
    thresholds: { major: 15, severe: 40 },
    baseScore: 7,
    feature: 'Heavy : −1 en Évasion',
    featureKey: 'Heavy',
    tags: ['défensif']
  },
  {
    id: 'full-plate-t4',
    name: 'Legendary Full Plate Armor',
    tier: 4,
    thresholds: { major: 17, severe: 44 },
    baseScore: 7,
    feature: 'Very Heavy : −2 en Évasion ; −1 en Agilité',
    featureKey: 'Very Heavy',
    tags: ['défensif']
  },
  {
    id: 'dunamis-silkchain-t4',
    name: 'Dunamis Silkchain',
    tier: 4,
    thresholds: { major: 13, severe: 36 },
    baseScore: 7,
    feature: 'Timeslowing : Cochez un Emplacement d’armure pour lancer un d4 et ajouter son résultat en bonus à votre Évasion contre une attaque entrante.',
    featureKey: 'Timeslowing',
    tags: ['défensif']
  },
  {
    id: 'channeling-t4',
    name: 'Channeling Armor',
    tier: 4,
    thresholds: { major: 13, severe: 36 },
    baseScore: 5,
    feature: 'Channeling : +1 aux jets de Sorts',
    featureKey: 'Channeling',
    tags: ['défensif']
  },
  {
    id: 'emberwoven-t4',
    name: 'Emberwoven Armor',
    tier: 4,
    thresholds: { major: 13, severe: 36 },
    baseScore: 6,
    feature: 'Burning : Quand un adversaire vous attaque à portée de Mêlée, il coche un Stress.',
    featureKey: 'Burning',
    tags: ['défensif']
  },
  {
    id: 'full-fortified-t4',
    name: 'Full Fortified Armor',
    tier: 4,
    thresholds: { major: 15, severe: 40 },
    baseScore: 4,
    feature: 'Fortified : Quand vous cochez un Emplacement d’armure, vous réduisez la gravité d’une attaque de deux seuils au lieu d’un.',
    featureKey: 'Fortified',
    tags: ['défensif']
  },
  {
    id: 'veritas-opal-t4',
    name: 'Veritas Opal Armor',
    tier: 4,
    thresholds: { major: 13, severe: 36 },
    baseScore: 6,
    feature: 'Truthseeking : Cette armure brille quand une autre créature à portée Proche ment.',
    featureKey: 'Truthseeking',
    tags: ['défensif']
  },
  {
    id: 'savior-chainmail-t4',
    name: 'Savior Chainmail',
    tier: 4,
    thresholds: { major: 18, severe: 48 },
    baseScore: 8,
    feature: 'Difficult : −1 à tous les traits de personnage et à l’Évasion',
    featureKey: 'Difficult',
    tags: ['défensif']
  }
]

/**
 * Retourne les armures par tier.
 * @param {number} tier
 * @returns {Object[]}
 */
export function getArmorByTier(tier) {
  return ARMOR.filter((a) => a.tier === tier)
}

/**
 * Retourne une armure par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getArmorById(id) {
  return ARMOR.find((a) => a.id === id) || null
}
