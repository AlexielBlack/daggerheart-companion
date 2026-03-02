/**
 * @module classes/data
 * @description Données SRD des 9 classes officielles Daggerheart.
 * Source : OfficialClasses_SRD.pdf, CharacterSheets_SRD.pdf
 */

/** 6 traits de personnage */
export const TRAITS = [
  { id: 'agility', label: 'Agilité', skills: ['Sprint', 'Leap', 'Maneuver'] },
  { id: 'strength', label: 'Force', skills: ['Lift', 'Smash', 'Grapple'] },
  { id: 'finesse', label: 'Finesse', skills: ['Control', 'Hide', 'Tinker'] },
  { id: 'instinct', label: 'Instinct', skills: ['Perceive', 'Sense', 'Navigate'] },
  { id: 'presence', label: 'Présence', skills: ['Charm', 'Perform', 'Deceive'] },
  { id: 'knowledge', label: 'Savoir', skills: ['Recall', 'Analyze', 'Comprehend'] }
]

/**
 * Conditions standard SRD.
 * Source : CoreMechanics_SRD.pdf — Conditions
 * Note : Daggerheart ne possède que 3 conditions standard.
 * Certaines features appliquent des conditions spéciales décrites dans leur texte.
 */
export const CONDITIONS = [
  { id: 'vulnerable', label: 'Vulnérable', description: 'Tous les jets ciblant cette créature ont avantage.' },
  { id: 'restrained', label: 'Entravé', description: 'Vous ne pouvez pas vous déplacer, mais vous pouvez toujours effectuer des actions depuis votre position actuelle.' },
  { id: 'hidden', label: 'Caché', description: 'Tant que vous êtes hors de vue de tous les ennemis et qu\'ils ne connaissent pas votre position, vous obtenez la condition Caché. Tous les jets contre une créature Cachée ont désavantage. Après qu\'un adversaire se déplace là où il vous verrait, que vous entrez dans sa ligne de vue, ou que vous attaquez, vous n\'êtes plus Caché.' }
]

/** Domaines Daggerheart */
export const DOMAINS = [
  'Arcana', 'Blade', 'Bone', 'Codex',
  'Grace', 'Midnight', 'Sage', 'Splendor', 'Valor'
]

/** Maximum de slots */
export const MAX_HP = 12
export const MAX_STRESS = 12
export const MAX_ARMOR = 12
export const MAX_HOPE = 6    // SRD : "A PC can have a maximum of 6 Hope at one time"
export const MAX_CHARACTERS = 8

/**
 * Classes officielles SRD.
 * Chaque classe inclut ses stats de départ, domaines, features et suggestions.
 */
export const CLASSES = [
  {
    id: 'guardian',
    name: 'Guardian',
    emoji: '🛡️',
    domains: ['Valor', 'Blade'],
    baseEvasion: 9,
    baseHP: 7,
    baseStress: 6,
    hopeFeature: 'Frontline Tank: Spend 3 Hope to clear 2 Armor Slots.',
    classFeatures: [
      'Unstoppable: Once per long rest, become Unstoppable. Gain an Unstoppable Die (d4 at lvl 1, d6 at lvl 5). After dealing 1+ HP, increase die value. While Unstoppable: reduce physical damage severity by 1 threshold, add die value to damage, can\'t be Restrained or Vulnerable.'
    ],
    suggestedTraits: { agility: 0, strength: 2, finesse: 0, instinct: 1, presence: 1, knowledge: -1 },
    suggestedArmor: 'Chainmail Armor — Thresholds 7/15 — Score 4 — Heavy: -1 to Evasion',
    source: 'srd'
  },
  {
    id: 'seraph',
    name: 'Seraph',
    emoji: '✨',
    domains: ['Splendor', 'Valor'],
    baseEvasion: 9,
    baseHP: 7,
    baseStress: 6,
    hopeFeature: 'Life Support: Spend 3 Hope to clear a Hit Point on an ally within Close range.',
    classFeatures: [
      'Prayer Dice: At session start, roll d4s equal to Spellcast trait. Spend to: reduce incoming damage, add to a roll, or gain Hope equal to result. Clear at session end.'
    ],
    suggestedTraits: { agility: 0, strength: 2, finesse: 0, instinct: 1, presence: 1, knowledge: -1 },
    suggestedArmor: 'Chainmail Armor — Thresholds 7/15 — Score 4 — Heavy: -1 to Evasion',
    source: 'srd'
  },
  {
    id: 'warrior',
    name: 'Warrior',
    emoji: '⚔️',
    domains: ['Blade', 'Bone'],
    baseEvasion: 11,
    baseHP: 6,
    baseStress: 6,
    hopeFeature: 'No Mercy: Spend 3 Hope to gain +1 to attack rolls until next rest.',
    classFeatures: [
      'Attack of Opportunity: When adversary in Melee leaves range, reaction roll. On success choose: stop them, deal primary weapon damage, or move with them. Crit: choose two.',
      'Combat Training: Ignore burden on weapons. Add level to physical damage rolls.'
    ],
    suggestedTraits: { agility: 1, strength: 2, finesse: 1, instinct: 0, presence: 0, knowledge: -1 },
    suggestedArmor: 'Leather Armor — Thresholds 6/13 — Score 3',
    source: 'srd'
  },
  {
    id: 'rogue',
    name: 'Rogue',
    emoji: '🗡️',
    domains: ['Midnight', 'Grace'],
    baseEvasion: 12,
    baseHP: 5,
    baseStress: 6,
    hopeFeature: 'Rogue\'s Dodge: Spend 3 Hope to gain +2 Evasion until next successful attack against you or next rest.',
    classFeatures: [
      'Cloaked: Hidden becomes Cloaked — remain unseen if stationary when adversary moves to see you. Ends after attack or move in line of sight.',
      'Sneak Attack: When attacking while Cloaked or ally in Melee of target, add d6s equal to tier to damage.'
    ],
    suggestedTraits: { agility: 2, strength: -1, finesse: 2, instinct: 0, presence: 1, knowledge: -1 },
    suggestedArmor: 'Leather Armor — Thresholds 6/13 — Score 3',
    source: 'srd'
  },
  {
    id: 'bard',
    name: 'Bard',
    emoji: '🎵',
    domains: ['Grace', 'Codex'],
    baseEvasion: 10,
    baseHP: 5,
    baseStress: 6,
    hopeFeature: 'Make a Scene: Spend 3 Hope to temporarily Distract a target within Close range, giving -2 to their Difficulty.',
    classFeatures: [
      'Rally: Once per session, give yourself and each ally a Rally Die (d6 at lvl 1, d8 at lvl 5). Spend to add to action/reaction/damage roll or clear Stress equal to result. Clear at session end.'
    ],
    suggestedTraits: { agility: 0, strength: -1, finesse: 1, instinct: 0, presence: 2, knowledge: 1 },
    suggestedArmor: 'Leather Armor — Thresholds 6/13 — Score 3',
    source: 'srd'
  },
  {
    id: 'druid',
    name: 'Druid',
    emoji: '🌿',
    domains: ['Sage', 'Arcana'],
    baseEvasion: 10,
    baseHP: 6,
    baseStress: 6,
    hopeFeature: 'Evolution: Spend 3 Hope to transform into Beastform without marking Stress. Choose one trait to raise by +1 until you drop out.',
    classFeatures: [
      'Beastform: Mark a Stress to transform into creature of your tier or lower. Gain Beastform features, add Evasion bonus, use specified trait for attacks. Can\'t use weapons/spells from domain cards while transformed.',
      'Wildtouch: Perform harmless, subtle nature effects at will (grow flower, gust of wind, start campfire).'
    ],
    suggestedTraits: { agility: 0, strength: 0, finesse: -1, instinct: 2, presence: 1, knowledge: 1 },
    suggestedArmor: 'Leather Armor — Thresholds 6/13 — Score 3',
    source: 'srd'
  },
  {
    id: 'ranger',
    name: 'Ranger',
    emoji: '🏹',
    domains: ['Bone', 'Sage'],
    baseEvasion: 12,
    baseHP: 6,
    baseStress: 6,
    hopeFeature: 'Hold Them Off: Spend 3 Hope on successful weapon attack to use same roll against 2 additional adversaries in range.',
    classFeatures: [
      'Ranger\'s Focus: Spend a Hope + attack a target. On success: deal normal damage, target becomes Focus. Against Focus: know their direction, they mark Stress on damage, can end Focus to reroll on failed attack.'
    ],
    suggestedTraits: { agility: 1, strength: 0, finesse: 1, instinct: 2, presence: -1, knowledge: 0 },
    suggestedArmor: 'Leather Armor — Thresholds 6/13 — Score 3',
    source: 'srd'
  },
  {
    id: 'wizard',
    name: 'Wizard',
    emoji: '🔮',
    domains: ['Codex', 'Splendor'],
    baseEvasion: 11,
    baseHP: 5,
    baseStress: 6,
    hopeFeature: 'Not This Time: Spend 3 Hope to force an adversary within Far range to reroll an attack or damage roll.',
    classFeatures: [
      'Prestidigitation: Perform harmless, subtle magical effects at will (change color, create smell, light candle, float tiny object, illuminate room, repair small object).',
      'Strange Patterns: Choose a number 1–12. When you roll it on a Duality Die, gain a Hope or clear a Stress. Change on long rest.'
    ],
    suggestedTraits: { agility: -1, strength: -1, finesse: 0, instinct: 1, presence: 1, knowledge: 2 },
    suggestedArmor: 'Gambeson Armor — Thresholds 5/11 — Score 3 — Flexible: +1 to Evasion',
    source: 'srd'
  },
  // ═══ Classes personnalisées ═══
  {
    id: 'assassin',
    name: 'Assassin',
    emoji: '🗡️',
    domains: ['Midnight', 'Blade'],
    baseEvasion: 12,
    baseHP: 5,
    baseStress: 6,
    hopeFeature: 'Shadow Contract: Spend 3 Hope to designate a target. Your next successful attack against them this scene deals maximum damage.',
    classFeatures: [
      'Mark: When you enter a scene, you can designate one adversary as your Mark. While they are your Mark, you have advantage on attack rolls against them and add +1d6 to damage.',
      'Vanish: When you successfully hit your Mark, you can mark a Stress to immediately become Hidden.'
    ],
    suggestedTraits: { agility: 2, strength: 0, finesse: 2, instinct: 1, presence: -1, knowledge: -1 },
    suggestedArmor: 'Leather Armor — Thresholds 6/13 — Score 3',
    source: 'custom'
  },
  {
    id: 'duellist',
    name: 'Duellist',
    emoji: '🤺',
    domains: ['Bone', 'Grace'],
    baseEvasion: 12,
    baseHP: 5,
    baseStress: 6,
    hopeFeature: 'Parkour: Spend 3 Hope, then work with the GM to create a pathway to quickly move around the area (chandelier, bookcase ladder, etc.). Gain advantage on rolls related to this pathway.',
    classFeatures: [
      'Boast: Mark a Stress to gain advantage on an action roll. If you roll with Hope, gain an additional Hope; if you roll with Fear, the GM gains an additional Fear.',
      'Flash of Rivalry: Spend a Hope to make a Presence roll against an adversary within Far range — on success, they become your Rival until end of scene. Rivals have disadvantage when targeting creatures other than you. Add d6 to damage dealt between you and a Rival. Can have Rivals equal to your tier.'
    ],
    suggestedTraits: { agility: 1, strength: 0, finesse: 2, instinct: 1, presence: 2, knowledge: -1 },
    suggestedArmor: 'Leather Armor — Thresholds 6/13 — Score 3',
    source: 'custom'
  }
]

/**
 * Classes officielles SRD uniquement (sans homebrew).
 * @type {Object[]}
 */
export const SRD_CLASSES = CLASSES.filter((c) => c.source === 'srd')

/**
 * Retourne une classe par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getClassById(id) {
  return CLASSES.find((c) => c.id === id) || null
}

/**
 * Crée un personnage vierge avec les valeurs par défaut de la classe.
 * @param {string} classId
 * @returns {Object}
 */
export function createDefaultCharacter(classId) {
  const cls = getClassById(classId)
  if (!cls) return null

  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: '',
    pronouns: '',
    heritage: '',
    classId: cls.id,
    className: cls.name,
    subclass: '',
    level: 1,
    proficiency: 1,

    // Traits — préremplis avec suggestions
    traits: {
      agility: cls.suggestedTraits.agility,
      strength: cls.suggestedTraits.strength,
      finesse: cls.suggestedTraits.finesse,
      instinct: cls.suggestedTraits.instinct,
      presence: cls.suggestedTraits.presence,
      knowledge: cls.suggestedTraits.knowledge
    },

    // Combat
    evasion: cls.baseEvasion,
    evasionBonus: 0,
    armorName: '',
    armorBaseThresholds: { major: 0, severe: 0 },
    armorScore: 0,
    armorSlotsMarked: 0,

    // Santé
    maxHP: cls.baseHP,
    currentHP: 0, // slots marqués (0 = pleine santé)
    maxStress: cls.baseStress,
    currentStress: 0, // slots marqués

    // Hope
    hope: 0,

    // Expériences
    experiences: [
      { name: '', bonus: 0 },
      { name: '', bonus: 0 }
    ],

    // Armes
    primaryWeapon: { name: '', trait: '', range: '', damage: '', feature: '' },
    secondaryWeapon: { name: '', trait: '', range: '', damage: '', feature: '' },

    // Inventaire
    inventory: [],
    gold: { handfuls: 0, bags: 0, chests: 0 },

    // Conditions actives
    conditions: [],

    // Notes libres
    notes: '',

    // Métadonnées
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}
