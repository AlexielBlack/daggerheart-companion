/**
 * @module data/domainCardModifiers
 * @description Registre des cartes de domaine qui modifient les stats du personnage.
 *
 * Chaque entrée décrit l'effet mécanique d'une carte sur les stats de la fiche.
 * Le moteur de calcul dans statModifiers.js utilise ce registre pour
 * calculer les bonus des cartes dans le loadout du personnage.
 *
 * Types de modificateurs :
 * - 'passive'       : toujours actif tant que la carte est dans le loadout
 * - 'conditional'   : actif si une condition vérifiable sur la fiche est remplie
 * - 'touched'       : actif si 4+ cartes du même domaine sont dans le loadout
 * - 'toggle'        : activable/désactivable par le joueur (condition d'environnement)
 * - 'activable'     : bouton d'activation avec durée et coûts
 * - 'permanent'     : modifie la fiche une seule fois (choix à l'acquisition)
 *
 * Sources : DomainCards_SRD.pdf
 */

/**
 * Renvoie le tier Daggerheart selon le niveau du personnage.
 * @param {number} level
 * @returns {number} 1–4
 */
export function getTier(level) {
  if (level <= 1) return 1
  if (level <= 4) return 2
  if (level <= 7) return 3
  return 4
}

/**
 * Seuils de dégâts Bare Bones par tier (sans armure).
 */
export const BARE_BONES_THRESHOLDS = {
  1: { major: 9, severe: 19 },
  2: { major: 11, severe: 24 },
  3: { major: 13, severe: 31 },
  4: { major: 15, severe: 38 }
}

/**
 * Registre principal des cartes qui modifient les stats.
 * Clé = cardId, valeur = descripteur de modificateur.
 */
export const DOMAIN_CARD_MODIFIERS = {
  // ═══════════════════════════════════════════════════════
  //  PASSIFS PURS (toujours actifs dans le loadout)
  // ═══════════════════════════════════════════════════════

  'bone-untouchable': {
    cardId: 'bone-untouchable',
    name: 'Untouchable',
    domain: 'bone',
    type: 'passive',
    icon: '💨',
    description: 'Évasion +½ Agilité (arrondi sup.)',
    /**
     * @param {Object} char - Personnage
     * @returns {{ evasion?: number, source: string }}
     */
    compute(char) {
      const agility = char.traits?.agility || 0
      const bonus = Math.ceil(agility / 2)
      return bonus > 0
        ? { evasion: bonus, source: `Untouchable (+${bonus} Évasion)` }
        : { source: 'Untouchable (Agilité trop basse)' }
    }
  },

  'valor-rise-up': {
    cardId: 'valor-rise-up',
    name: 'Rise Up',
    domain: 'valor',
    type: 'passive',
    icon: '🛡️',
    description: 'Seuil Sévère +Proficiency',
    compute(char) {
      const prof = char.proficiency || 1
      return { thresholds: { major: 0, severe: prof }, source: `Rise Up (+${prof} Sévère)` }
    }
  },

  // ═══════════════════════════════════════════════════════
  //  PASSIFS CONDITIONNELS (auto si condition de fiche)
  // ═══════════════════════════════════════════════════════

  'valor-bare-bones': {
    cardId: 'valor-bare-bones',
    name: 'Bare Bones',
    domain: 'valor',
    type: 'conditional',
    icon: '🦴',
    condition: 'unarmored',
    conditionLabel: 'Sans armure',
    description: 'Score d\'Armure = 3+Force ; seuils spéciaux par tier',
    /**
     * Renvoie les stats de remplacement quand le personnage ne porte pas d'armure.
     * Attention : cette carte remplace les seuils de base, pas un bonus additif.
     */
    compute(char) {
      const strength = char.traits?.strength || 0
      const tier = getTier(char.level || 1)
      const thresholds = BARE_BONES_THRESHOLDS[tier]
      return {
        armorScoreOverride: 3 + strength,
        thresholdsOverride: { major: thresholds.major, severe: thresholds.severe },
        source: `Bare Bones (Armure ${3 + strength}, Seuils ${thresholds.major}/${thresholds.severe})`
      }
    },
    isActive(char) {
      return !char.armorId || char.armorId === ''
    }
  },

  'blade-fortified-armor': {
    cardId: 'blade-fortified-armor',
    name: 'Fortified Armor',
    domain: 'blade',
    type: 'conditional',
    icon: '⚔️',
    condition: 'armored',
    conditionLabel: 'Armure portée',
    description: 'Seuils de dégâts +2',
    compute() {
      return { thresholds: { major: 2, severe: 2 }, source: 'Fortified Armor (+2 seuils)' }
    },
    isActive(char) {
      return char.armorId && char.armorId !== ''
    }
  },

  'valor-armorer': {
    cardId: 'valor-armorer',
    name: 'Armorer',
    domain: 'valor',
    type: 'conditional',
    icon: '🛡️',
    condition: 'armored',
    conditionLabel: 'Armure portée',
    description: 'Score d\'Armure +1',
    compute() {
      return { armorScore: 1, source: 'Armorer (+1 Armure)' }
    },
    isActive(char) {
      return char.armorId && char.armorId !== ''
    }
  },

  'splendor-voice-of-reason': {
    cardId: 'splendor-voice-of-reason',
    name: 'Voice of Reason',
    domain: 'splendor',
    type: 'conditional',
    icon: '✨',
    condition: 'allStressMarked',
    conditionLabel: 'Stress max',
    description: '+1 Proficiency aux jets de dégâts (quand tout le Stress est marqué)',
    compute() {
      return { proficiencyDamage: 1, source: 'Voice of Reason (+1 Prof. dégâts)' }
    },
    isActive(char) {
      return char.currentStress > 0 && char.currentStress >= char.maxStress
    }
  },

  'bone-on-the-brink': {
    cardId: 'bone-on-the-brink',
    name: 'On the Brink',
    domain: 'bone',
    type: 'conditional',
    icon: '💀',
    condition: 'lowHP',
    conditionLabel: '≤2 HP libres',
    description: 'Immunité aux dégâts Minor (quand ≤2 HP non marqués)',
    compute() {
      return { immuneMinor: true, source: 'On the Brink (immunité Minor)' }
    },
    isActive(char) {
      const unmarkedHP = char.maxHP - char.currentHP
      return unmarkedHP <= 2
    }
  },

  // ═══════════════════════════════════════════════════════
  //  TOGGLES (condition d'environnement, activation manuelle)
  // ═══════════════════════════════════════════════════════

  'midnight-shadowhunter': {
    cardId: 'midnight-shadowhunter',
    name: 'Shadowhunter',
    domain: 'midnight',
    type: 'toggle',
    icon: '🌑',
    toggleLabel: 'En obscurité',
    description: '+1 Évasion, avantage aux attaques (en obscurité)',
    compute() {
      return { evasion: 1, attackAdvantage: true, source: 'Shadowhunter (+1 Évasion)' }
    }
  },

  // ═══════════════════════════════════════════════════════
  //  PASSIFS "-TOUCHED" (4+ cartes du domaine dans le loadout)
  // ═══════════════════════════════════════════════════════

  'arcana-arcana-touched': {
    cardId: 'arcana-arcana-touched',
    name: 'Arcana-Touched',
    domain: 'arcana',
    type: 'touched',
    icon: '🔮',
    requiredDomain: 'arcana',
    description: '+1 Spellcast Rolls (partie passive)',
    compute() {
      return { spellcastBonus: 1, source: 'Arcana-Touched (+1 Spellcast)' }
    }
  },

  'blade-blade-touched': {
    cardId: 'blade-blade-touched',
    name: 'Blade-Touched',
    domain: 'blade',
    type: 'touched',
    icon: '⚔️',
    requiredDomain: 'blade',
    description: '+2 attaque, +4 Seuil Sévère',
    compute() {
      return {
        attackBonus: 2,
        thresholds: { major: 0, severe: 4 },
        source: 'Blade-Touched (+2 attaque, +4 Sévère)'
      }
    }
  },

  'bone-bone-touched': {
    cardId: 'bone-bone-touched',
    name: 'Bone-Touched',
    domain: 'bone',
    type: 'touched',
    icon: '💨',
    requiredDomain: 'bone',
    description: '+1 Agilité',
    compute() {
      return { traitBonus: { agility: 1 }, source: 'Bone-Touched (+1 Agilité)' }
    }
  },

  'sage-sage-touched': {
    cardId: 'sage-sage-touched',
    name: 'Sage-Touched',
    domain: 'sage',
    type: 'touched',
    icon: '🌿',
    requiredDomain: 'sage',
    hasToggle: true,
    toggleLabel: 'Environnement naturel',
    description: '+2 Spellcast Rolls (en environnement naturel)',
    compute() {
      return { spellcastBonus: 2, source: 'Sage-Touched (+2 Spellcast)' }
    }
  },

  'splendor-splendor-touched': {
    cardId: 'splendor-splendor-touched',
    name: 'Splendor-Touched',
    domain: 'splendor',
    type: 'touched',
    icon: '✨',
    requiredDomain: 'splendor',
    description: '+3 Seuil Sévère',
    compute() {
      return { thresholds: { major: 0, severe: 3 }, source: 'Splendor-Touched (+3 Sévère)' }
    }
  },

  'valor-valor-touched': {
    cardId: 'valor-valor-touched',
    name: 'Valor-Touched',
    domain: 'valor',
    type: 'touched',
    icon: '🛡️',
    requiredDomain: 'valor',
    description: '+1 Score d\'Armure',
    compute() {
      return { armorScore: 1, source: 'Valor-Touched (+1 Armure)' }
    }
  },

  // ═══════════════════════════════════════════════════════
  //  ACTIVABLES (bouton, durée limitée)
  // ═══════════════════════════════════════════════════════

  'blade-deadly-focus': {
    cardId: 'blade-deadly-focus',
    name: 'Deadly Focus',
    domain: 'blade',
    type: 'activable',
    icon: '🎯',
    description: '+1 Proficiency (1/repos, jusqu\'à changement de cible)',
    frequency: '1/rest',
    cost: null,
    compute() {
      return { proficiency: 1, source: 'Deadly Focus (+1 Proficiency)' }
    }
  },

  'blade-frenzy': {
    cardId: 'blade-frenzy',
    name: 'Frenzy',
    domain: 'blade',
    type: 'activable',
    icon: '🔥',
    description: '+10 dégâts, +8 Sévère, perte Armor Slots (1/long repos)',
    frequency: '1/long rest',
    cost: null,
    compute() {
      return {
        damageBonus: 10,
        thresholds: { major: 0, severe: 8 },
        disableArmor: true,
        source: 'Frenzy (+10 dégâts, +8 Sévère, ⚠ pas d\'Armure)'
      }
    }
  },

  'valor-full-surge': {
    cardId: 'valor-full-surge',
    name: 'Full Surge',
    domain: 'valor',
    type: 'activable',
    icon: '⚡',
    description: '+2 à tous les traits (1/long repos, coûte 3 Stress)',
    frequency: '1/long rest',
    cost: { stress: 3 },
    compute() {
      return {
        traitBonus: {
          agility: 2, strength: 2, finesse: 2,
          instinct: 2, presence: 2, knowledge: 2
        },
        source: 'Full Surge (+2 tous traits)'
      }
    }
  },

  'splendor-overwhelming-aura': {
    cardId: 'splendor-overwhelming-aura',
    name: 'Overwhelming Aura',
    domain: 'splendor',
    type: 'activable',
    icon: '👑',
    description: 'Presence = Spellcast trait (1/long repos, Spellcast Roll requis)',
    frequency: '1/long rest',
    cost: { hope: 2 },
    compute(_char) {
      return { presenceOverride: true, source: 'Overwhelming Aura (Presence = Spellcast)' }
    }
  },

  'grace-notorious': {
    cardId: 'grace-notorious',
    name: 'Notorious',
    domain: 'grace',
    type: 'activable',
    icon: '🎭',
    description: '+10 au roll (par utilisation, coûte 1 Stress)',
    frequency: 'per use',
    cost: { stress: 1 },
    compute() {
      return { rollBonus: 10, source: 'Notorious (+10 au roll)' }
    }
  },

  // ═══════════════════════════════════════════════════════
  //  PERMANENTS (one-shot, vault définitif)
  // ═══════════════════════════════════════════════════════

  'blade-vitality': {
    cardId: 'blade-vitality',
    name: 'Vitality',
    domain: 'blade',
    type: 'permanent',
    icon: '💪',
    description: 'Choix 2 parmi : +1 Stress slot, +1 HP slot, +2 seuils',
    choices: [
      { id: 'stress', label: '+1 Stress slot', effect: { maxStress: 1 } },
      { id: 'hp', label: '+1 HP slot', effect: { maxHP: 1 } },
      { id: 'thresholds', label: '+2 seuils de dégâts', effect: { thresholds: { major: 2, severe: 2 } } }
    ],
    maxChoices: 2
  },

  'grace-master-of-the-craft': {
    cardId: 'grace-master-of-the-craft',
    name: 'Master of the Craft',
    domain: 'grace',
    type: 'permanent',
    icon: '🎭',
    description: '+2 à 2 Expériences OU +3 à 1 Expérience',
    choices: [
      { id: 'two_exp', label: '+2 à deux Expériences', effect: { experienceBonus: { count: 2, value: 2 } } },
      { id: 'one_exp', label: '+3 à une Expérience', effect: { experienceBonus: { count: 1, value: 3 } } }
    ],
    maxChoices: 1
  }
}

/**
 * Compte le nombre de cartes d'un domaine spécifique dans le loadout.
 * @param {string[]} loadout - IDs des cartes du loadout
 * @param {string} domainId - ID du domaine à compter
 * @param {Function} getCardById - Fonction pour résoudre un cardId en données
 * @returns {number}
 */
export function countDomainCardsInLoadout(loadout, domainId, getCardById) {
  if (!loadout || !domainId) return 0
  return loadout.filter((cardId) => {
    const card = getCardById(cardId)
    return card && card.domain === domainId
  }).length
}

/**
 * Détermine si une carte "-Touched" a sa condition de 4+ cartes remplie.
 * @param {Object} mod - Descripteur du modificateur
 * @param {string[]} loadout - IDs des cartes du loadout
 * @param {Function} getCardById - Fonction pour résoudre un cardId en données
 * @returns {boolean}
 */
export function isTouchedActive(mod, loadout, getCardById) {
  if (mod.type !== 'touched' || !mod.requiredDomain) return false
  return countDomainCardsInLoadout(loadout, mod.requiredDomain, getCardById) >= 4
}

/**
 * Liste les IDs des cartes modificatrices.
 * @returns {string[]}
 */
export function getModifierCardIds() {
  return Object.keys(DOMAIN_CARD_MODIFIERS)
}
