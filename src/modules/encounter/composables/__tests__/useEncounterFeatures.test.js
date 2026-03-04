/**
 * @module encounter/composables/__tests__/useEncounterFeatures.test
 * @description Tests du composable de filtrage contextuel des features.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import {
  useEncounterFeatures,
  classifyAdversaryFeatures,
  normalizeFeature,
  collectClassFeatures,
  collectSubclassFeatures,
  collectAncestryFeatures,
  collectCommunityFeatures,
  collectDomainCardFeatures,
  computePriorityScore
} from '../useEncounterFeatures'
import {
  SCENE_MODE_PC_ATTACK,
  SCENE_MODE_ADVERSARY_ATTACK,
  SCENE_MODE_SOCIAL,
  SCENE_MODE_META
} from '@data/encounters/liveConstants'

beforeEach(() => {
  localStorage.clear()
})

// ═══════════════════════════════════════════════════════════
//  normalizeFeature
// ═══════════════════════════════════════════════════════════

describe('normalizeFeature', () => {
  it('normalise une feature brute avec tous les champs', () => {
    const raw = {
      name: 'Test Feature',
      description: 'Une description',
      tags: ['offensif', 'défensif'],
      activationType: 'action',
      cost: { type: 'hope', amount: 2 },
      frequency: 'atWill',
      range: 'close',
      trigger: 'Quand vous attaquez',
      trait: 'strength'
    }
    const result = normalizeFeature(raw, 'class', 'Guardian')
    expect(result.name).toBe('Test Feature')
    expect(result.description).toBe('Une description')
    expect(result.source).toBe('class')
    expect(result.sourceLabel).toBe('Guardian')
    expect(result.tags).toEqual(['offensif', 'défensif'])
    expect(result.activationType).toBe('action')
    expect(result.cost).toEqual({ type: 'hope', amount: 2 })
    expect(result.frequency).toBe('atWill')
    expect(result.range).toBe('close')
    expect(result.trigger).toBe('Quand vous attaquez')
    expect(result.trait).toBe('strength')
  })

  it('fournit des valeurs par défaut pour les champs manquants', () => {
    const result = normalizeFeature({}, 'test', 'Test')
    expect(result.name).toBe('—')
    expect(result.description).toBe('')
    expect(result.tags).toEqual([])
    expect(result.activationType).toBe('passive')
    expect(result.cost).toEqual({ type: 'free', amount: 0 })
    expect(result.frequency).toBeNull()
  })

  it('fusionne les champs extra', () => {
    const result = normalizeFeature({ name: 'X' }, 'domain', 'Blade', { cardId: 'blade-x', cardLevel: 3 })
    expect(result.cardId).toBe('blade-x')
    expect(result.cardLevel).toBe(3)
  })

  it('ne mute pas les tags de la source', () => {
    const raw = { tags: ['offensif'] }
    const result = normalizeFeature(raw, 'test', 'T')
    result.tags.push('défensif')
    expect(raw.tags).toEqual(['offensif'])
  })
})

// ═══════════════════════════════════════════════════════════
//  collectClassFeatures
// ═══════════════════════════════════════════════════════════

describe('collectClassFeatures', () => {
  it('retourne les features du Guardian (hopeFeature + classFeatures)', () => {
    const features = collectClassFeatures('guardian')
    expect(features.length).toBeGreaterThanOrEqual(2) // hopeFeature + au moins 1 classFeature
    expect(features[0].source).toBe('class')
    expect(features[0].sourceLabel).toBe('Guardian')
    // La hopeFeature est marquée
    expect(features[0].isHopeFeature).toBe(true)
  })

  it('retourne [] pour un classId invalide', () => {
    expect(collectClassFeatures('zzz')).toEqual([])
    expect(collectClassFeatures('')).toEqual([])
    expect(collectClassFeatures(null)).toEqual([])
  })

  it('chaque feature a un nom et une description', () => {
    const features = collectClassFeatures('warrior')
    for (const f of features) {
      expect(f.name).toBeTruthy()
      expect(f.description).toBeTruthy()
    }
  })
})

// ═══════════════════════════════════════════════════════════
//  collectSubclassFeatures
// ═══════════════════════════════════════════════════════════

describe('collectSubclassFeatures', () => {
  it('ne retourne que foundation par défaut', () => {
    const features = collectSubclassFeatures('guardian', 'stalwart', 'foundation')
    expect(features.length).toBeGreaterThan(0)
    expect(features.every((f) => f.subclassTier === 'foundation')).toBe(true)
  })

  it('retourne foundation + specialization au niveau specialization', () => {
    const features = collectSubclassFeatures('guardian', 'stalwart', 'specialization')
    const tiers = [...new Set(features.map((f) => f.subclassTier))]
    expect(tiers).toContain('foundation')
    expect(tiers).toContain('specialization')
    expect(tiers).not.toContain('mastery')
  })

  it('retourne les 3 tiers au niveau mastery', () => {
    const features = collectSubclassFeatures('guardian', 'stalwart', 'mastery')
    const tiers = [...new Set(features.map((f) => f.subclassTier))]
    expect(tiers).toContain('foundation')
    expect(tiers).toContain('specialization')
    expect(tiers).toContain('mastery')
  })

  it('retourne [] pour un subclassId invalide', () => {
    expect(collectSubclassFeatures('guardian', 'zzz', 'foundation')).toEqual([])
  })

  it('retourne [] sans classId', () => {
    expect(collectSubclassFeatures('', 'stalwart', 'foundation')).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════
//  collectAncestryFeatures
// ═══════════════════════════════════════════════════════════

describe('collectAncestryFeatures', () => {
  it('retourne 2 features pour une ascendance standard', () => {
    const features = collectAncestryFeatures({ ancestryId: 'clank' })
    expect(features).toHaveLength(2)
    expect(features[0].source).toBe('ancestry')
    expect(features[0].sourceLabel).toBe('Clank')
  })

  it('retourne 2 features pour Mixed Ancestry', () => {
    const pc = {
      ancestryId: 'mixed',
      mixedAncestryData: {
        firstAncestryId: 'clank',
        firstFeatureSlot: 'top',
        secondAncestryId: 'drakona',
        secondFeatureSlot: 'bottom'
      }
    }
    const features = collectAncestryFeatures(pc)
    expect(features).toHaveLength(2)
    expect(features[0].sourceLabel).toBe('Clank')
    expect(features[1].sourceLabel).toBe('Drakona')
  })

  it('retourne [] sans ancestryId', () => {
    expect(collectAncestryFeatures({})).toEqual([])
    expect(collectAncestryFeatures({ ancestryId: '' })).toEqual([])
  })

  it('retourne [] pour null', () => {
    expect(collectAncestryFeatures(null)).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════
//  collectCommunityFeatures
// ═══════════════════════════════════════════════════════════

describe('collectCommunityFeatures', () => {
  it('retourne 1 feature pour Highborne', () => {
    const features = collectCommunityFeatures('highborne')
    expect(features).toHaveLength(1)
    expect(features[0].source).toBe('community')
    expect(features[0].name).toBe('Privilege')
  })

  it('retourne [] pour un communityId invalide', () => {
    expect(collectCommunityFeatures('zzz')).toEqual([])
    expect(collectCommunityFeatures('')).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════
//  collectDomainCardFeatures
// ═══════════════════════════════════════════════════════════

describe('collectDomainCardFeatures', () => {
  it('retourne les features des cartes du loadout', () => {
    const features = collectDomainCardFeatures({ loadout: ['blade-whirlwind'], vault: [] })
    expect(features).toHaveLength(1)
    expect(features[0].source).toBe('domain')
    expect(features[0].name).toBe('Whirlwind')
    expect(features[0].cardId).toBe('blade-whirlwind')
  })

  it('ignore les cartes inconnues', () => {
    const features = collectDomainCardFeatures({ loadout: ['zzz', 'blade-whirlwind'], vault: [] })
    expect(features).toHaveLength(1)
  })

  it('retourne [] sans domainCards', () => {
    expect(collectDomainCardFeatures(null)).toEqual([])
    expect(collectDomainCardFeatures({})).toEqual([])
    expect(collectDomainCardFeatures({ loadout: [] })).toEqual([])
  })
})

// ═══════════════════════════════════════════════════════════
//  computePriorityScore
// ═══════════════════════════════════════════════════════════

describe('computePriorityScore', () => {
  const pcAttackMeta = SCENE_MODE_META[SCENE_MODE_PC_ATTACK]

  it('score élevé pour feature offensive en mode PJ Attaque', () => {
    const f = normalizeFeature({
      name: 'X', tags: ['offensif'], activationType: 'action'
    }, 'test', 'T')
    const score = computePriorityScore(f, pcAttackMeta)
    expect(score).toBeGreaterThanOrEqual(15) // 10 (tag offensif) + 5 (action)
  })

  it('score moyen pour feature défensive en mode PJ Attaque', () => {
    const f = normalizeFeature({
      name: 'X', tags: ['défensif'], activationType: 'reaction'
    }, 'test', 'T')
    const score = computePriorityScore(f, pcAttackMeta)
    expect(score).toBe(5) // 3 (tag secondaire) + 2 (reaction)
  })

  it('score minimal pour passive sans tag pertinent', () => {
    const f = normalizeFeature({
      name: 'X', tags: [], activationType: 'passive'
    }, 'test', 'T')
    const score = computePriorityScore(f, pcAttackMeta)
    expect(score).toBe(1) // 1 (passive bonus)
  })

  it('score élevé pour feature sociale en mode Social', () => {
    const socialMeta = SCENE_MODE_META[SCENE_MODE_SOCIAL]
    const f = normalizeFeature({
      name: 'X', tags: ['social'], activationType: 'action'
    }, 'test', 'T')
    const score = computePriorityScore(f, socialMeta)
    expect(score).toBeGreaterThanOrEqual(15)
  })

  it('cumule les scores pour multi-tags', () => {
    const f = normalizeFeature({
      name: 'X', tags: ['offensif', 'défensif'], activationType: 'action'
    }, 'test', 'T')
    const score = computePriorityScore(f, pcAttackMeta)
    // 10 (offensif primaire) + 3 (défensif secondaire) + 5 (action) = 18
    expect(score).toBe(18)
  })
})

// ═══════════════════════════════════════════════════════════
//  useEncounterFeatures (composable)
// ═══════════════════════════════════════════════════════════

describe('useEncounterFeatures', () => {
  const GUARDIAN_PC = {
    classId: 'guardian',
    subclassId: 'stalwart',
    subclassProgression: 'foundation',
    ancestryId: 'clank',
    communityId: 'highborne',
    domainCards: { loadout: ['blade-whirlwind'], vault: [] }
  }

  it('collecte toutes les features d\'un PJ complet', () => {
    const pcRef = ref(GUARDIAN_PC)
    const modeRef = ref(SCENE_MODE_PC_ATTACK)
    const { allFeatures, featureCount } = useEncounterFeatures(pcRef, modeRef)
    // Guardian: 1 hopeFeature + 1 classFeature + 2 subclass foundation
    // + 2 ancestry (Clank) + 1 community (Highborne) + 1 domain card
    expect(featureCount.value).toBeGreaterThanOrEqual(6)
    const sources = [...new Set(allFeatures.value.map((f) => f.source))]
    expect(sources).toContain('class')
    expect(sources).toContain('subclass')
    expect(sources).toContain('ancestry')
    expect(sources).toContain('community')
    expect(sources).toContain('domain')
  })

  it('retourne des tableaux vides pour un PJ null', () => {
    const pcRef = ref(null)
    const modeRef = ref(SCENE_MODE_PC_ATTACK)
    const { allFeatures, primaryFeatures, passiveFeatures } = useEncounterFeatures(pcRef, modeRef)
    expect(allFeatures.value).toEqual([])
    expect(primaryFeatures.value).toEqual([])
    expect(passiveFeatures.value).toEqual([])
  })

  it('priorise les features offensives en mode PJ Attaque', () => {
    const pcRef = ref(GUARDIAN_PC)
    const modeRef = ref(SCENE_MODE_PC_ATTACK)
    const { primaryFeatures, scoredFeatures } = useEncounterFeatures(pcRef, modeRef)
    // Whirlwind (offensif) doit être dans les primary
    const whirlwind = primaryFeatures.value.find((f) => f.name === 'Whirlwind')
    expect(whirlwind).toBeTruthy()
    // Le premier scoré doit avoir un score > 0
    expect(scoredFeatures.value[0]._score).toBeGreaterThan(0)
  })

  it('priorise les features défensives en mode Adversaire Attaque', () => {
    const pcRef = ref(GUARDIAN_PC)
    const modeRef = ref(SCENE_MODE_ADVERSARY_ATTACK)
    const { primaryFeatures } = useEncounterFeatures(pcRef, modeRef)
    // Les features avec tag 'défensif' et activationType non-passive doivent être dans primary
    for (const f of primaryFeatures.value) {
      expect(f.tags).toContain('défensif')
    }
  })

  it('sépare passives et réactions', () => {
    const pcRef = ref(GUARDIAN_PC)
    const modeRef = ref(SCENE_MODE_PC_ATTACK)
    const { passiveFeatures, reactionFeatures } = useEncounterFeatures(pcRef, modeRef)
    for (const f of passiveFeatures.value) {
      expect(f.activationType).toBe('passive')
    }
    for (const f of reactionFeatures.value) {
      expect(f.activationType).toBe('reaction')
    }
  })

  it('place les features sociales passives dans passiveFeatures en mode Social', () => {
    const pcRef = ref(GUARDIAN_PC)
    const modeRef = ref(SCENE_MODE_SOCIAL)
    const { passiveFeatures, scoredFeatures } = useEncounterFeatures(pcRef, modeRef)
    // Highborne Privilege (social + passive) doit être dans passiveFeatures
    const privilege = passiveFeatures.value.find((f) => f.name === 'Privilege')
    expect(privilege).toBeTruthy()
    // Et doit avoir un score élevé grâce au tag social
    const scored = scoredFeatures.value.find((f) => f.name === 'Privilege')
    expect(scored._score).toBeGreaterThanOrEqual(10)
  })

  it('recalcule quand le mode change', () => {
    const pcRef = ref(GUARDIAN_PC)
    const modeRef = ref(SCENE_MODE_PC_ATTACK)
    const { primaryFeatures } = useEncounterFeatures(pcRef, modeRef)
    const countPcAttack = primaryFeatures.value.length

    modeRef.value = SCENE_MODE_SOCIAL
    const countSocial = primaryFeatures.value.length
    // Les features primaires diffèrent entre combat et social
    expect(countPcAttack).not.toBe(countSocial)
  })

  it('gère les sous-classes avec progression mastery', () => {
    const pc = { ...GUARDIAN_PC, subclassProgression: 'mastery' }
    const pcRef = ref(pc)
    const modeRef = ref(SCENE_MODE_PC_ATTACK)
    const { allFeatures } = useEncounterFeatures(pcRef, modeRef)
    const subFeatures = allFeatures.value.filter((f) => f.source === 'subclass')
    const tiers = [...new Set(subFeatures.map((f) => f.subclassTier))]
    expect(tiers).toContain('foundation')
    expect(tiers).toContain('specialization')
    expect(tiers).toContain('mastery')
  })

  it('gère un PJ sans domainCards', () => {
    const pc = { ...GUARDIAN_PC, domainCards: null }
    const pcRef = ref(pc)
    const modeRef = ref(SCENE_MODE_PC_ATTACK)
    const { allFeatures } = useEncounterFeatures(pcRef, modeRef)
    // Ne crashe pas, et les autres sources sont présentes
    expect(allFeatures.value.length).toBeGreaterThan(0)
    expect(allFeatures.value.some((f) => f.source === 'domain')).toBe(false)
  })
})

// ═══════════════════════════════════════════════════════════
//  classifyAdversaryFeatures
// ═══════════════════════════════════════════════════════════

describe('classifyAdversaryFeatures', () => {
  const MOCK_ADVERSARY = {
    name: 'Test Beast',
    features: [
      { name: 'Claw Attack', description: 'Griffes', tags: ['offensif'], activationType: 'action', cost: { type: 'free', amount: 0 } },
      { name: 'Tough Hide', description: 'Peau résistante', tags: ['défensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
      { name: 'Counterattack', description: 'Contre-attaque', tags: ['offensif'], activationType: 'reaction', cost: { type: 'fear', amount: 1 }, trigger: 'Quand un PJ rate une attaque' },
      { name: 'Intimidate', description: 'Intimidation', tags: ['social'], activationType: 'action', cost: { type: 'free', amount: 0 } }
    ]
  }

  it('classifie toutes les features par type d\'activation', () => {
    const result = classifyAdversaryFeatures(MOCK_ADVERSARY)
    // 2 actions (Claw Attack + Intimidate), 1 passive (Tough Hide), 1 reaction (Counterattack)
    expect(result.actionFeatures).toHaveLength(2)
    expect(result.actionFeatures[0].name).toBe('Claw Attack')
    expect(result.actionFeatures[1].name).toBe('Intimidate')
    expect(result.passiveFeatures).toHaveLength(1)
    expect(result.passiveFeatures[0].name).toBe('Tough Hide')
    expect(result.reactionFeatures).toHaveLength(1)
    expect(result.reactionFeatures[0].name).toBe('Counterattack')
  })

  it('retourne des tableaux vides pour adversaire null', () => {
    const result = classifyAdversaryFeatures(null)
    expect(result.actionFeatures).toEqual([])
    expect(result.passiveFeatures).toEqual([])
    expect(result.reactionFeatures).toEqual([])
  })

  it('retourne des tableaux vides pour adversaire sans features', () => {
    const result = classifyAdversaryFeatures({ name: 'Empty', features: [] })
    expect(result.actionFeatures).toEqual([])
  })

  it('affiche TOUTES les features quel que soit leurs tags', () => {
    // Vérification que rien n'est filtré — le bug original masquait
    // les features utilitaires comme Cloaked
    const advWithUtility = {
      name: 'Shadow',
      features: [
        { name: 'Backstab', tags: ['offensif'], activationType: 'passive' },
        { name: 'Cloaked', tags: ['utilitaire'], activationType: 'action' }
      ]
    }
    const result = classifyAdversaryFeatures(advWithUtility)
    expect(result.actionFeatures).toHaveLength(1)
    expect(result.actionFeatures[0].name).toBe('Cloaked')
    expect(result.passiveFeatures).toHaveLength(1)
    expect(result.passiveFeatures[0].name).toBe('Backstab')
  })
})
