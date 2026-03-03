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
    feature: 'Flexible: +1 to Evasion',
    featureKey: 'Flexible'
  },
  {
    id: 'leather-t1',
    name: 'Leather Armor',
    tier: 1,
    thresholds: { major: 6, severe: 13 },
    baseScore: 3,
    feature: null,
    featureKey: null
  },
  {
    id: 'chainmail-t1',
    name: 'Chainmail Armor',
    tier: 1,
    thresholds: { major: 7, severe: 15 },
    baseScore: 4,
    feature: 'Heavy: −1 to Evasion',
    featureKey: 'Heavy'
  },
  {
    id: 'full-plate-t1',
    name: 'Full Plate Armor',
    tier: 1,
    thresholds: { major: 8, severe: 17 },
    baseScore: 4,
    feature: 'Very Heavy: −2 to Evasion; −1 to Agility',
    featureKey: 'Very Heavy'
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
    feature: 'Flexible: +1 to Evasion',
    featureKey: 'Flexible'
  },
  {
    id: 'leather-t2',
    name: 'Improved Leather Armor',
    tier: 2,
    thresholds: { major: 9, severe: 20 },
    baseScore: 4,
    feature: null,
    featureKey: null
  },
  {
    id: 'chainmail-t2',
    name: 'Improved Chainmail Armor',
    tier: 2,
    thresholds: { major: 11, severe: 24 },
    baseScore: 5,
    feature: 'Heavy: −1 to Evasion',
    featureKey: 'Heavy'
  },
  {
    id: 'full-plate-t2',
    name: 'Improved Full Plate Armor',
    tier: 2,
    thresholds: { major: 13, severe: 28 },
    baseScore: 5,
    feature: 'Very Heavy: −2 to Evasion; −1 to Agility',
    featureKey: 'Very Heavy'
  },
  {
    id: 'elundrian-chain-t2',
    name: 'Elundrian Chain Armor',
    tier: 2,
    thresholds: { major: 9, severe: 21 },
    baseScore: 4,
    feature: 'Warded: You reduce incoming magic damage by your Armor Score before applying it to your damage thresholds.',
    featureKey: 'Warded'
  },
  {
    id: 'harrowbone-t2',
    name: 'Harrowbone Armor',
    tier: 2,
    thresholds: { major: 9, severe: 21 },
    baseScore: 4,
    feature: 'Resilient: Before you mark your last Armor Slot, roll a d6. On a result of 6, reduce the severity by one threshold without marking an Armor Slot.',
    featureKey: 'Resilient'
  },
  {
    id: 'irontree-breastplate-t2',
    name: 'Irontree Breastplate Armor',
    tier: 2,
    thresholds: { major: 9, severe: 20 },
    baseScore: 4,
    feature: 'Reinforced: When you mark your last Armor Slot, increase your damage thresholds by +2 until you clear at least 1 Armor Slot.',
    featureKey: 'Reinforced'
  },
  {
    id: 'runetan-floating-t2',
    name: 'Runetan Floating Armor',
    tier: 2,
    thresholds: { major: 9, severe: 20 },
    baseScore: 4,
    feature: 'Shifting: When you are targeted for an attack, you can mark an Armor Slot to give the attack roll against you disadvantage.',
    featureKey: 'Shifting'
  },
  {
    id: 'tyris-soft-t2',
    name: 'Tyris Soft Armor',
    tier: 2,
    thresholds: { major: 8, severe: 18 },
    baseScore: 5,
    feature: 'Quiet: You gain a +2 bonus to rolls you make to move silently.',
    featureKey: 'Quiet'
  },
  {
    id: 'rosewild-t2',
    name: 'Rosewild Armor',
    tier: 2,
    thresholds: { major: 11, severe: 23 },
    baseScore: 5,
    feature: 'Hopeful: When you would spend a Hope, you can mark an Armor Slot instead.',
    featureKey: 'Hopeful'
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
    feature: 'Flexible: +1 to Evasion',
    featureKey: 'Flexible'
  },
  {
    id: 'leather-t3',
    name: 'Advanced Leather Armor',
    tier: 3,
    thresholds: { major: 11, severe: 27 },
    baseScore: 5,
    feature: null,
    featureKey: null
  },
  {
    id: 'chainmail-t3',
    name: 'Advanced Chainmail Armor',
    tier: 3,
    thresholds: { major: 13, severe: 31 },
    baseScore: 6,
    feature: 'Heavy: −1 to Evasion',
    featureKey: 'Heavy'
  },
  {
    id: 'full-plate-t3',
    name: 'Advanced Full Plate Armor',
    tier: 3,
    thresholds: { major: 15, severe: 35 },
    baseScore: 6,
    feature: 'Very Heavy: −2 to Evasion; −1 to Agility',
    featureKey: 'Very Heavy'
  },
  {
    id: 'bellamoi-fine-t3',
    name: 'Bellamoi Fine Armor',
    tier: 3,
    thresholds: { major: 11, severe: 27 },
    baseScore: 5,
    feature: 'Gilded: +1 to Presence',
    featureKey: 'Gilded'
  },
  {
    id: 'dragonscale-t3',
    name: 'Dragonscale Armor',
    tier: 3,
    thresholds: { major: 11, severe: 27 },
    baseScore: 5,
    feature: 'Impenetrable: Once per short rest, when you would mark your last Hit Point, you can instead mark a Stress.',
    featureKey: 'Impenetrable'
  },
  {
    id: 'spiked-plate-t3',
    name: 'Spiked Plate Armor',
    tier: 3,
    thresholds: { major: 10, severe: 25 },
    baseScore: 5,
    feature: 'Sharp: On a successful attack against a target within Melee range, add a d4 to the damage roll.',
    featureKey: 'Sharp'
  },
  {
    id: 'bladefare-t3',
    name: 'Bladefare Armor',
    tier: 3,
    thresholds: { major: 16, severe: 39 },
    baseScore: 6,
    feature: 'Physical: You can\'t mark an Armor Slot to reduce magic damage.',
    featureKey: 'Physical'
  },
  {
    id: 'monetts-cloak-t3',
    name: 'Monett\'s Cloak',
    tier: 3,
    thresholds: { major: 16, severe: 39 },
    baseScore: 6,
    feature: 'Magic: You can\'t mark an Armor Slot to reduce physical damage.',
    featureKey: 'Magic'
  },
  {
    id: 'runes-fortification-t3',
    name: 'Runes of Fortification',
    tier: 3,
    thresholds: { major: 17, severe: 43 },
    baseScore: 6,
    feature: 'Painful: Each time you mark an Armor Slot, you must mark a Stress.',
    featureKey: 'Painful'
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
    feature: 'Flexible: +1 to Evasion',
    featureKey: 'Flexible'
  },
  {
    id: 'leather-t4',
    name: 'Legendary Leather Armor',
    tier: 4,
    thresholds: { major: 13, severe: 36 },
    baseScore: 6,
    feature: null,
    featureKey: null
  },
  {
    id: 'chainmail-t4',
    name: 'Legendary Chainmail Armor',
    tier: 4,
    thresholds: { major: 15, severe: 40 },
    baseScore: 7,
    feature: 'Heavy: −1 to Evasion',
    featureKey: 'Heavy'
  },
  {
    id: 'full-plate-t4',
    name: 'Legendary Full Plate Armor',
    tier: 4,
    thresholds: { major: 17, severe: 44 },
    baseScore: 7,
    feature: 'Very Heavy: −2 to Evasion; −1 to Agility',
    featureKey: 'Very Heavy'
  },
  {
    id: 'dunamis-silkchain-t4',
    name: 'Dunamis Silkchain',
    tier: 4,
    thresholds: { major: 13, severe: 36 },
    baseScore: 7,
    feature: 'Timeslowing: Mark an Armor Slot to roll a d4 and add its result as a bonus to your Evasion against an incoming attack.',
    featureKey: 'Timeslowing'
  },
  {
    id: 'channeling-t4',
    name: 'Channeling Armor',
    tier: 4,
    thresholds: { major: 13, severe: 36 },
    baseScore: 5,
    feature: 'Channeling: +1 to Spellcast Rolls',
    featureKey: 'Channeling'
  },
  {
    id: 'emberwoven-t4',
    name: 'Emberwoven Armor',
    tier: 4,
    thresholds: { major: 13, severe: 36 },
    baseScore: 6,
    feature: 'Burning: When an adversary attacks you within Melee range, they mark a Stress.',
    featureKey: 'Burning'
  },
  {
    id: 'full-fortified-t4',
    name: 'Full Fortified Armor',
    tier: 4,
    thresholds: { major: 15, severe: 40 },
    baseScore: 4,
    feature: 'Fortified: When you mark an Armor Slot, you reduce the severity of an attack by two thresholds instead of one.',
    featureKey: 'Fortified'
  },
  {
    id: 'veritas-opal-t4',
    name: 'Veritas Opal Armor',
    tier: 4,
    thresholds: { major: 13, severe: 36 },
    baseScore: 6,
    feature: 'Truthseeking: This armor glows when another creature within Close range tells a lie.',
    featureKey: 'Truthseeking'
  },
  {
    id: 'savior-chainmail-t4',
    name: 'Savior Chainmail',
    tier: 4,
    thresholds: { major: 18, severe: 48 },
    baseScore: 8,
    feature: 'Difficult: −1 to all character traits and Evasion',
    featureKey: 'Difficult'
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
