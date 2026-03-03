/**
 * @module levelup/composables/useLevelUpRules
 * @description Logique pure pour le système de level up Daggerheart.
 *
 * Toutes les fonctions sont stateless et testables indépendamment.
 * Elles n'importent aucune dépendance Vue/Pinia.
 *
 * Règles SRD :
 *   - 10 niveaux répartis en 4 tiers (T1=1, T2=2-4, T3=5-7, T4=8-10)
 *   - Level up = 4 étapes séquentielles :
 *     1. Tier Achievement (niveaux 2, 5, 8)
 *     2. Advancements (2 choix par niveau)
 *     3. Damage Thresholds +1 (automatique)
 *     4. Domain Card (acquérir une carte)
 *   - Multiclass reporté à la V2
 */

// ═══════════════════════════════════════════════════════════
//  Constantes
// ═══════════════════════════════════════════════════════════

/** Niveau maximum de personnage */
export const MAX_LEVEL = 10

/** Niveaux qui déclenchent un Tier Achievement */
export const TIER_ACHIEVEMENT_LEVELS = [2, 5, 8]

/** Niveaux auxquels les marks de traits sont effacés */
export const TRAIT_CLEAR_LEVELS = [5, 8]

/** Types d'advancement disponibles */
export const ADVANCEMENT_TYPES = Object.freeze({
  TRAITS: 'traits',
  HP: 'hp',
  STRESS: 'stress',
  EXPERIENCES: 'experiences',
  DOMAIN_CARD: 'domain_card',
  EVASION: 'evasion',
  SUBCLASS: 'subclass',
  PROFICIENCY: 'proficiency'
  // MULTICLASS: 'multiclass' — V2
})

/** IDs des 6 traits de personnage */
export const TRAIT_IDS = Object.freeze([
  'agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge'
])

/**
 * Définition des pools d'advancement par tier.
 * Chaque type a un nombre max de slots.
 * `doubleSlot: true` signifie que l'advancement consomme les 2 choix du level up.
 * `maxCardLevel` limite le niveau des cartes de domaine.
 * `excludes` empêche la prise d'un autre advancement dans le même tier (V2: multiclass).
 */
export const TIER_ADVANCEMENT_POOLS = Object.freeze({
  2: [
    { type: ADVANCEMENT_TYPES.TRAITS, maxSlots: 3, label: '+1 à deux traits non marqués' },
    { type: ADVANCEMENT_TYPES.HP, maxSlots: 2, label: '+1 slot de Points de Vie' },
    { type: ADVANCEMENT_TYPES.STRESS, maxSlots: 2, label: '+1 slot de Stress' },
    { type: ADVANCEMENT_TYPES.EXPERIENCES, maxSlots: 1, label: '+1 à deux Expériences' },
    { type: ADVANCEMENT_TYPES.DOMAIN_CARD, maxSlots: 1, maxCardLevel: 4, label: 'Carte de domaine supplémentaire (niv. ≤ 4)' },
    { type: ADVANCEMENT_TYPES.EVASION, maxSlots: 1, label: '+1 Évasion' }
  ],
  3: [
    { type: ADVANCEMENT_TYPES.TRAITS, maxSlots: 3, label: '+1 à deux traits non marqués' },
    { type: ADVANCEMENT_TYPES.HP, maxSlots: 2, label: '+1 slot de Points de Vie' },
    { type: ADVANCEMENT_TYPES.STRESS, maxSlots: 2, label: '+1 slot de Stress' },
    { type: ADVANCEMENT_TYPES.EXPERIENCES, maxSlots: 1, label: '+1 à deux Expériences' },
    { type: ADVANCEMENT_TYPES.DOMAIN_CARD, maxSlots: 1, maxCardLevel: 7, label: 'Carte de domaine supplémentaire (niv. ≤ 7)' },
    { type: ADVANCEMENT_TYPES.EVASION, maxSlots: 1, label: '+1 Évasion' },
    { type: ADVANCEMENT_TYPES.SUBCLASS, maxSlots: 1, label: 'Carte de sous-classe améliorée' },
    { type: ADVANCEMENT_TYPES.PROFICIENCY, maxSlots: 2, doubleSlot: true, label: '+1 Maîtrise (coûte 2 choix)' }
  ],
  4: [
    { type: ADVANCEMENT_TYPES.TRAITS, maxSlots: 3, label: '+1 à deux traits non marqués' },
    { type: ADVANCEMENT_TYPES.HP, maxSlots: 2, label: '+1 slot de Points de Vie' },
    { type: ADVANCEMENT_TYPES.STRESS, maxSlots: 2, label: '+1 slot de Stress' },
    { type: ADVANCEMENT_TYPES.EXPERIENCES, maxSlots: 1, label: '+1 à deux Expériences' },
    { type: ADVANCEMENT_TYPES.DOMAIN_CARD, maxSlots: 1, maxCardLevel: null, label: 'Carte de domaine supplémentaire' },
    { type: ADVANCEMENT_TYPES.EVASION, maxSlots: 1, label: '+1 Évasion' },
    { type: ADVANCEMENT_TYPES.SUBCLASS, maxSlots: 1, label: 'Carte de sous-classe améliorée' },
    { type: ADVANCEMENT_TYPES.PROFICIENCY, maxSlots: 2, doubleSlot: true, label: '+1 Maîtrise (coûte 2 choix)' }
  ]
})

// ═══════════════════════════════════════════════════════════
//  Fonctions utilitaires — Tiers & Niveaux
// ═══════════════════════════════════════════════════════════

/**
 * Retourne le tier correspondant à un niveau donné.
 * @param {number} level - Niveau du personnage (1–10)
 * @returns {number} Tier (1–4)
 */
export function getTierForLevel(level) {
  if (level < 1 || level > MAX_LEVEL) return 0
  if (level <= 1) return 1
  if (level <= 4) return 2
  if (level <= 7) return 3
  return 4
}

/**
 * Vérifie si un niveau déclenche un Tier Achievement.
 * @param {number} level
 * @returns {boolean}
 */
export function hasTierAchievement(level) {
  return TIER_ACHIEVEMENT_LEVELS.includes(level)
}

/**
 * Vérifie si les marks de traits doivent être effacés à ce niveau.
 * @param {number} level
 * @returns {boolean}
 */
export function shouldClearTraits(level) {
  return TRAIT_CLEAR_LEVELS.includes(level)
}

/**
 * Retourne le détail d'un Tier Achievement pour un niveau donné.
 * @param {number} level
 * @returns {Object|null} { newExperience: true, proficiencyIncrease: true, traitsCleared: boolean }
 */
export function getTierAchievement(level) {
  if (!hasTierAchievement(level)) return null
  return {
    newExperience: true,
    proficiencyIncrease: true,
    traitsCleared: shouldClearTraits(level)
  }
}

/**
 * Vérifie si un personnage peut monter de niveau.
 * @param {Object} character
 * @returns {{ canLevel: boolean, reason: string }}
 */
export function canLevelUp(character) {
  if (!character) return { canLevel: false, reason: 'Personnage invalide.' }
  if (character.level >= MAX_LEVEL) return { canLevel: false, reason: 'Niveau maximum atteint (10).' }
  return { canLevel: true, reason: '' }
}

// ═══════════════════════════════════════════════════════════
//  Fonctions utilitaires — Slots d'advancement
// ═══════════════════════════════════════════════════════════

/**
 * Compte les slots déjà utilisés pour un type d'advancement dans un tier donné.
 * @param {Array} levelHistory - Historique des level ups
 * @param {number} tier - Tier cible (2, 3 ou 4)
 * @param {string} type - Type d'advancement (ADVANCEMENT_TYPES)
 * @returns {number} Nombre de slots marqués
 */
export function getUsedSlots(levelHistory, tier, type) {
  if (!Array.isArray(levelHistory)) return 0
  let count = 0
  for (const entry of levelHistory) {
    if (!Array.isArray(entry.advancements)) continue
    for (const adv of entry.advancements) {
      if (adv.type === type && adv.tier === tier) {
        count++
      }
    }
  }
  return count
}

/**
 * Retourne la définition d'un advancement dans un pool de tier.
 * @param {number} tier
 * @param {string} type
 * @returns {Object|null}
 */
export function getAdvancementDef(tier, type) {
  const pool = TIER_ADVANCEMENT_POOLS[tier]
  if (!pool) return null
  return pool.find((a) => a.type === type) || null
}

/**
 * Retourne les slots restants pour un advancement donné dans un tier.
 * @param {Array} levelHistory
 * @param {number} tier
 * @param {string} type
 * @returns {number}
 */
export function getRemainingSlots(levelHistory, tier, type) {
  const def = getAdvancementDef(tier, type)
  if (!def) return 0
  return Math.max(0, def.maxSlots - getUsedSlots(levelHistory, tier, type))
}

// ═══════════════════════════════════════════════════════════
//  Fonctions principales — Advancements disponibles
// ═══════════════════════════════════════════════════════════

/**
 * Retourne tous les advancements disponibles pour un personnage,
 * en tenant compte du tier courant, des tiers inférieurs et des slots restants.
 *
 * @param {Object} character - Personnage complet
 * @returns {Array<Object>} Liste d'options avec { type, tier, label, remainingSlots, maxSlots, doubleSlot, disabled, disabledReason }
 */
export function getAvailableAdvancements(character) {
  if (!character) return []

  const targetLevel = character.level + 1
  const targetTier = getTierForLevel(targetLevel)
  const history = character.levelHistory || []
  const markedTraits = character.markedTraits || []

  // Après un tier achievement qui clear les traits, les traits seront effacés
  // AVANT la sélection des advancements → simuler le clear
  const effectiveMarkedTraits = shouldClearTraits(targetLevel)
    ? []
    : [...markedTraits]

  const results = []

  // Parcourir tous les tiers accessibles (tier courant + inférieurs, sauf T1 qui n'a pas d'advancements)
  for (let tier = 2; tier <= targetTier; tier++) {
    const pool = TIER_ADVANCEMENT_POOLS[tier]
    if (!pool) continue

    for (const def of pool) {
      const remaining = getRemainingSlots(history, tier, def.type)
      if (remaining <= 0) continue

      const option = {
        type: def.type,
        tier,
        label: def.label,
        remainingSlots: remaining,
        maxSlots: def.maxSlots,
        doubleSlot: def.doubleSlot || false,
        maxCardLevel: def.maxCardLevel ?? null,
        disabled: false,
        disabledReason: ''
      }

      // Cas spécial : traits — vérifier qu'il reste au moins 2 traits non marqués
      if (def.type === ADVANCEMENT_TYPES.TRAITS) {
        const unmarkedCount = TRAIT_IDS.filter((t) => !effectiveMarkedTraits.includes(t)).length
        if (unmarkedCount < 2) {
          option.disabled = true
          option.disabledReason = 'Moins de 2 traits non marqués disponibles.'
        }
      }

      results.push(option)
    }
  }

  return results
}

/**
 * Valide un ensemble de choix d'advancements pour un level up.
 *
 * Règles :
 *  - Exactement 2 "points" d'advancement consommés (1 doubleSlot = 2 points)
 *  - Chaque choix doit avoir des slots restants
 *  - Les traits nécessitent 2 traits non marqués chacun
 *  - Un doubleSlot doit être le seul choix
 *
 * @param {Object} character
 * @param {Array<Object>} choices - [{ type, tier, ...data }]
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateAdvancementChoices(character, choices) {
  const errors = []

  if (!character) {
    return { valid: false, errors: ['Personnage invalide.'] }
  }
  if (!Array.isArray(choices) || choices.length === 0) {
    return { valid: false, errors: ['Aucun advancement sélectionné.'] }
  }

  const history = character.levelHistory || []
  const markedTraits = character.markedTraits || []
  const targetLevel = character.level + 1
  const targetTier = getTierForLevel(targetLevel)
  const effectiveMarkedTraits = shouldClearTraits(targetLevel)
    ? []
    : [...markedTraits]

  // Vérifier le nombre de points
  let totalPoints = 0
  for (const choice of choices) {
    const def = getAdvancementDef(choice.tier, choice.type)
    if (!def) {
      errors.push(`Advancement inconnu : ${choice.type} (tier ${choice.tier}).`)
      continue
    }
    totalPoints += def.doubleSlot ? 2 : 1
  }

  if (totalPoints !== 2) {
    errors.push(`Exactement 2 points d'advancement requis, ${totalPoints} fournis.`)
  }

  // Vérifier que chaque choix a des slots restants
  // Compter combien de fois chaque (tier, type) apparaît dans les choix
  const choiceCounts = {}
  for (const choice of choices) {
    const key = `${choice.tier}:${choice.type}`
    choiceCounts[key] = (choiceCounts[key] || 0) + 1
  }

  for (const [key, count] of Object.entries(choiceCounts)) {
    const [tierStr, type] = key.split(':')
    const tier = Number(tierStr)
    const remaining = getRemainingSlots(history, tier, type)
    if (count > remaining) {
      errors.push(`Pas assez de slots pour "${type}" au tier ${tier} (${remaining} restant(s), ${count} demandé(s)).`)
    }
  }

  // Vérifier que les tiers des choix sont accessibles
  for (const choice of choices) {
    if (choice.tier < 2 || choice.tier > targetTier) {
      errors.push(`Le tier ${choice.tier} n'est pas accessible au niveau ${targetLevel}.`)
    }
  }

  // Vérifier les traits : assez de traits non marqués
  const traitsChoices = choices.filter((c) => c.type === ADVANCEMENT_TYPES.TRAITS)
  if (traitsChoices.length > 0) {
    // Simuler les marquages successifs
    const simulatedMarked = [...effectiveMarkedTraits]
    for (const tc of traitsChoices) {
      if (!Array.isArray(tc.traits) || tc.traits.length !== 2) {
        errors.push('Chaque advancement "traits" doit spécifier exactement 2 traits.')
        continue
      }
      for (const traitId of tc.traits) {
        if (!TRAIT_IDS.includes(traitId)) {
          errors.push(`Trait inconnu : "${traitId}".`)
        } else if (simulatedMarked.includes(traitId)) {
          errors.push(`Le trait "${traitId}" est déjà marqué.`)
        } else {
          simulatedMarked.push(traitId)
        }
      }
    }
  }

  // Vérifier le double slot : doit être le seul choix
  const doubleSlotChoices = choices.filter((c) => {
    const def = getAdvancementDef(c.tier, c.type)
    return def && def.doubleSlot
  })
  if (doubleSlotChoices.length > 0 && choices.length > 1) {
    errors.push('Un advancement double-slot doit être le seul choix du level up.')
  }

  return { valid: errors.length === 0, errors }
}

// ═══════════════════════════════════════════════════════════
//  Construction & Application d'un Level Up
// ═══════════════════════════════════════════════════════════

/**
 * Construit un objet levelHistory entry à partir des choix du joueur.
 *
 * @param {number} targetLevel - Nouveau niveau (ex: 2)
 * @param {Object|null} tierAchievement - Résultat de getTierAchievement()
 * @param {Array<Object>} advancements - Choix validés [{ type, tier, traits?, ... }]
 * @param {string|null} domainCardId - ID de la carte de domaine acquise (étape 4)
 * @returns {Object} Entrée d'historique
 */
export function buildLevelUpEntry(targetLevel, tierAchievement, advancements, domainCardId) {
  return {
    level: targetLevel,
    tier: getTierForLevel(targetLevel),
    tierAchievement: tierAchievement || null,
    advancements: advancements.map((a) => ({ ...a })),
    domainCard: domainCardId || null,
    timestamp: new Date().toISOString()
  }
}

/**
 * Applique un level up complet au personnage (mutation in-place).
 *
 * Étapes :
 *  1. Incrémente le niveau
 *  2. Applique le tier achievement (expérience, proficiency, clear traits)
 *  3. Applique chaque advancement
 *  4. Incrémente les damage thresholds (+1 automatique — géré par le store via `level`)
 *  5. Enregistre l'entrée dans levelHistory
 *
 * @param {Object} character - Personnage mutable
 * @param {Object} levelUpEntry - Résultat de buildLevelUpEntry()
 * @returns {Object} Le personnage muté (pour chaînage)
 */
export function applyLevelUp(character, levelUpEntry) {
  if (!character || !levelUpEntry) return character

  // ── Étape 0 : s'assurer des structures ──
  if (!Array.isArray(character.levelHistory)) character.levelHistory = []
  if (!Array.isArray(character.markedTraits)) character.markedTraits = []

  // ── Étape 1 : incrémenter le niveau ──
  character.level = levelUpEntry.level

  // ── Étape 2 : Tier Achievement ──
  const ta = levelUpEntry.tierAchievement
  if (ta) {
    // Nouvelle expérience à +2
    if (ta.newExperience) {
      if (!Array.isArray(character.experiences)) character.experiences = []
      character.experiences.push({ name: '', bonus: 2 })
    }
    // +1 Proficiency
    if (ta.proficiencyIncrease) {
      character.proficiency = (character.proficiency || 1) + 1
    }
    // Clear marked traits (niveaux 5, 8)
    if (ta.traitsCleared) {
      character.markedTraits = []
    }
  }

  // ── Étape 3 : Advancements ──
  for (const adv of levelUpEntry.advancements) {
    _applyAdvancement(character, adv)
  }

  // ── Étape 4 : Damage Thresholds ──
  // Note : Le recalcul des thresholds est automatique dans le store
  // via `char.level` qui est déjà incrémenté. Pas de champ dédié ici.

  // ── Étape 5 : Historique ──
  character.levelHistory.push(levelUpEntry)

  return character
}

/**
 * Applique un advancement individuel au personnage.
 * @param {Object} character
 * @param {Object} advancement
 * @private
 */
function _applyAdvancement(character, advancement) {
  switch (advancement.type) {
    case ADVANCEMENT_TYPES.TRAITS:
      if (Array.isArray(advancement.traits)) {
        for (const traitId of advancement.traits) {
          if (character.traits && typeof character.traits[traitId] === 'number') {
            character.traits[traitId] += 1
          }
          if (!character.markedTraits.includes(traitId)) {
            character.markedTraits.push(traitId)
          }
        }
      }
      break

    case ADVANCEMENT_TYPES.HP:
      character.maxHP = (character.maxHP || 0) + 1
      break

    case ADVANCEMENT_TYPES.STRESS:
      character.maxStress = (character.maxStress || 0) + 1
      break

    case ADVANCEMENT_TYPES.EXPERIENCES:
      if (Array.isArray(advancement.experiences)) {
        for (const idx of advancement.experiences) {
          if (character.experiences && character.experiences[idx]) {
            character.experiences[idx].bonus += 1
          }
        }
      }
      break

    case ADVANCEMENT_TYPES.EVASION:
      character.evasion = (character.evasion || 0) + 1
      break

    case ADVANCEMENT_TYPES.PROFICIENCY:
      character.proficiency = (character.proficiency || 1) + 1
      break

    case ADVANCEMENT_TYPES.SUBCLASS:
      // La progression de sous-classe est gérée séparément
      // On enregistre simplement le fait dans l'historique
      character.subclassProgression = _nextSubclassStage(character.subclassProgression)
      break

    case ADVANCEMENT_TYPES.DOMAIN_CARD:
      // La carte est ajoutée par le store via l'ID dans domainCard
      // Pas de mutation ici — c'est le store qui gère les cartes
      break

    default:
      break
  }
}

/**
 * Retourne la prochaine étape de progression de sous-classe.
 * @param {string} current
 * @returns {string}
 * @private
 */
function _nextSubclassStage(current) {
  switch (current) {
    case 'foundation': return 'specialization'
    case 'specialization': return 'mastery'
    default: return current
  }
}

// ═══════════════════════════════════════════════════════════
//  Rollback — Annulation du dernier level up
// ═══════════════════════════════════════════════════════════

/**
 * Vérifie si un rollback est possible.
 * @param {Object} character
 * @returns {{ canRollback: boolean, reason: string }}
 */
export function canRollback(character) {
  if (!character) return { canRollback: false, reason: 'Personnage invalide.' }
  if (!Array.isArray(character.levelHistory) || character.levelHistory.length === 0) {
    return { canRollback: false, reason: 'Aucun level up à annuler.' }
  }
  if (character.level <= 1) {
    return { canRollback: false, reason: 'Impossible de descendre en dessous du niveau 1.' }
  }
  return { canRollback: true, reason: '' }
}

/**
 * Annule le dernier level up (mutation in-place).
 *
 * Inverse toutes les opérations de applyLevelUp dans l'ordre inverse.
 *
 * @param {Object} character - Personnage mutable
 * @returns {{ success: boolean, removedEntry: Object|null, error: string }}
 */
export function rollbackLevelUp(character) {
  const check = canRollback(character)
  if (!check.canRollback) {
    return { success: false, removedEntry: null, error: check.reason }
  }

  const entry = character.levelHistory.pop()

  // ── Inverser les advancements (en ordre inverse) ──
  const reversedAdv = [...entry.advancements].reverse()
  for (const adv of reversedAdv) {
    _reverseAdvancement(character, adv)
  }

  // ── Inverser le tier achievement ──
  const ta = entry.tierAchievement
  if (ta) {
    if (ta.traitsCleared) {
      // Restaurer les markedTraits depuis l'historique restant
      character.markedTraits = _rebuildMarkedTraits(character.levelHistory, character.level - 1)
    }
    if (ta.proficiencyIncrease) {
      character.proficiency = Math.max(1, (character.proficiency || 1) - 1)
    }
    if (ta.newExperience && Array.isArray(character.experiences)) {
      // Retirer la dernière expérience ajoutée (celle à +2)
      const lastIdx = _findLastAddedExperienceIndex(character.experiences)
      if (lastIdx >= 0) {
        character.experiences.splice(lastIdx, 1)
      }
    }
  }

  // ── Décrémenter le niveau ──
  character.level = Math.max(1, character.level - 1)

  return { success: true, removedEntry: entry, error: '' }
}

/**
 * Inverse un advancement individuel.
 * @param {Object} character
 * @param {Object} advancement
 * @private
 */
function _reverseAdvancement(character, advancement) {
  switch (advancement.type) {
    case ADVANCEMENT_TYPES.TRAITS:
      if (Array.isArray(advancement.traits)) {
        for (const traitId of advancement.traits) {
          if (character.traits && typeof character.traits[traitId] === 'number') {
            character.traits[traitId] -= 1
          }
          // Retirer du markedTraits seulement si ce trait a été marqué par cet advancement
          const idx = character.markedTraits.indexOf(traitId)
          if (idx >= 0) {
            character.markedTraits.splice(idx, 1)
          }
        }
      }
      break

    case ADVANCEMENT_TYPES.HP:
      character.maxHP = Math.max(0, (character.maxHP || 0) - 1)
      break

    case ADVANCEMENT_TYPES.STRESS:
      character.maxStress = Math.max(0, (character.maxStress || 0) - 1)
      break

    case ADVANCEMENT_TYPES.EXPERIENCES:
      if (Array.isArray(advancement.experiences)) {
        for (const idx of advancement.experiences) {
          if (character.experiences && character.experiences[idx]) {
            character.experiences[idx].bonus = Math.max(0, character.experiences[idx].bonus - 1)
          }
        }
      }
      break

    case ADVANCEMENT_TYPES.EVASION:
      character.evasion = Math.max(0, (character.evasion || 0) - 1)
      break

    case ADVANCEMENT_TYPES.PROFICIENCY:
      character.proficiency = Math.max(1, (character.proficiency || 1) - 1)
      break

    case ADVANCEMENT_TYPES.SUBCLASS:
      character.subclassProgression = _prevSubclassStage(character.subclassProgression)
      break

    default:
      break
  }
}

/**
 * Retourne l'étape précédente de progression de sous-classe.
 * @param {string} current
 * @returns {string}
 * @private
 */
function _prevSubclassStage(current) {
  switch (current) {
    case 'mastery': return 'specialization'
    case 'specialization': return 'foundation'
    default: return 'foundation'
  }
}

/**
 * Reconstruit la liste des traits marqués à partir de l'historique
 * restant, en tenant compte des clears aux niveaux 5 et 8.
 *
 * @param {Array} levelHistory - Historique après suppression de la dernière entrée
 * @param {number} currentLevel - Niveau après rollback (avant décrément)
 * @returns {string[]} Traits marqués
 */
function _rebuildMarkedTraits(levelHistory, _currentLevel) {
  const marked = []

  for (const entry of levelHistory) {
    // Si cette entrée a effacé les traits, on repart de zéro
    if (entry.tierAchievement && entry.tierAchievement.traitsCleared) {
      marked.length = 0
    }
    // Ajouter les traits marqués par les advancements de cette entrée
    for (const adv of entry.advancements) {
      if (adv.type === ADVANCEMENT_TYPES.TRAITS && Array.isArray(adv.traits)) {
        for (const traitId of adv.traits) {
          if (!marked.includes(traitId)) {
            marked.push(traitId)
          }
        }
      }
    }
  }

  // Si le niveau courant (post-rollback) n'a pas de clear, garder les marks tels quels
  // Sinon, un clear sera re-appliqué au prochain level up
  return marked
}

/**
 * Trouve l'index de la dernière expérience "vide" avec bonus=2 (celle ajoutée par un tier achievement).
 * @param {Array} experiences
 * @returns {number} Index ou -1
 * @private
 */
function _findLastAddedExperienceIndex(experiences) {
  // Chercher en partant de la fin : la dernière expérience à bonus=2 avec nom vide
  for (let i = experiences.length - 1; i >= 0; i--) {
    if (experiences[i].bonus === 2 && experiences[i].name === '') {
      return i
    }
  }
  // Sinon, chercher la dernière expérience à bonus=2 tout court
  for (let i = experiences.length - 1; i >= 0; i--) {
    if (experiences[i].bonus === 2) {
      return i
    }
  }
  return -1
}

// ═══════════════════════════════════════════════════════════
//  Export groupé pour usage composable Vue
// ═══════════════════════════════════════════════════════════

/**
 * Composable Vue exposant toutes les fonctions de règles de level up.
 * Aucun état réactif — fonctions pures uniquement.
 *
 * @returns {Object}
 */
export function useLevelUpRules() {
  return {
    // Constantes
    MAX_LEVEL,
    TIER_ACHIEVEMENT_LEVELS,
    TRAIT_CLEAR_LEVELS,
    ADVANCEMENT_TYPES,
    TRAIT_IDS,
    TIER_ADVANCEMENT_POOLS,

    // Tiers & Niveaux
    getTierForLevel,
    hasTierAchievement,
    shouldClearTraits,
    getTierAchievement,
    canLevelUp,

    // Slots
    getUsedSlots,
    getAdvancementDef,
    getRemainingSlots,

    // Advancements
    getAvailableAdvancements,
    validateAdvancementChoices,

    // Application
    buildLevelUpEntry,
    applyLevelUp,

    // Rollback
    canRollback,
    rollbackLevelUp
  }
}
