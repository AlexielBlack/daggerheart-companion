/**
 * @file combatFeatureCatalogue.test.js
 * @description Tests du catalogue de combat features PNJ :
 * intégrité des données, filtrage, recherche, groupement.
 */

import { describe, it, expect } from 'vitest'
import {
  ADVERSARY_FEATURES,
  DOMAIN_CARD_FEATURES,
  ALL_COMBAT_FEATURES,
  getFeatureById,
  filterFeatures,
  groupByActivationType
} from '../combatFeatureCatalogue.js'
import { validateCombatFeature } from '../combatConstants.js'

// ═══════════════════════════════════════════════════════════
//  Intégrité des données
// ═══════════════════════════════════════════════════════════

describe('Intégrité du catalogue', () => {
  it('contient 23 features adversaire', () => {
    expect(ADVERSARY_FEATURES).toHaveLength(23)
  })

  it('contient 12 features de cartes de domaine', () => {
    expect(DOMAIN_CARD_FEATURES).toHaveLength(12)
  })

  it('ALL_COMBAT_FEATURES = adversaire + domaine', () => {
    expect(ALL_COMBAT_FEATURES).toHaveLength(35)
  })

  it('chaque feature adversaire passe la validation', () => {
    for (const f of ADVERSARY_FEATURES) {
      const result = validateCombatFeature(f)
      expect(result.valid, `${f.id} invalide : ${result.errors.join(', ')}`).toBe(true)
    }
  })

  it('chaque feature domaine passe la validation', () => {
    for (const f of DOMAIN_CARD_FEATURES) {
      const result = validateCombatFeature(f)
      expect(result.valid, `${f.id} invalide : ${result.errors.join(', ')}`).toBe(true)
    }
  })

  it('tous les IDs sont uniques', () => {
    const ids = ALL_COMBAT_FEATURES.map(f => f.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('chaque feature a au moins un tag', () => {
    for (const f of ALL_COMBAT_FEATURES) {
      expect(f.tags.length, `${f.id} n'a pas de tag`).toBeGreaterThanOrEqual(1)
    }
  })

  it('chaque feature a au moins un thème', () => {
    for (const f of ALL_COMBAT_FEATURES) {
      expect(f.themes.length, `${f.id} n'a pas de thème`).toBeGreaterThanOrEqual(1)
    }
  })

  it('toutes les features adversaire ont source "adversary"', () => {
    for (const f of ADVERSARY_FEATURES) {
      expect(f.source).toBe('adversary')
    }
  })

  it('toutes les features domaine ont source "domain_card"', () => {
    for (const f of DOMAIN_CARD_FEATURES) {
      expect(f.source).toBe('domain_card')
    }
  })

  it('les features adversaire ont un sourceRef non vide', () => {
    for (const f of ADVERSARY_FEATURES) {
      expect(f.sourceRef, `${f.id} manque sourceRef`).toBeTruthy()
    }
  })

  it('les features domaine ont un sourceRef non vide', () => {
    for (const f of DOMAIN_CARD_FEATURES) {
      expect(f.sourceRef, `${f.id} manque sourceRef`).toBeTruthy()
    }
  })
})

// ═══════════════════════════════════════════════════════════
//  Cohérence des cooldowns alliés
// ═══════════════════════════════════════════════════════════

describe('Cooldowns alliés', () => {
  it('les features gratuites/stress=1 ont cooldown none', () => {
    const freeCost = ALL_COMBAT_FEATURES.filter(f =>
      (f.cost.type === 'free') ||
      (f.cost.type === 'stress' && f.cost.amount <= 1)
    ).filter(f => !f.frequency || f.frequency === 'atWill')

    for (const f of freeCost) {
      expect(f.allyCooldown, `${f.id} devrait avoir cooldown none`).toBe('none')
    }
  })

  it('les features coûtant 1 hope/fear ont cooldown 2_spotlights', () => {
    const hopeFear1 = ALL_COMBAT_FEATURES.filter(f =>
      (f.cost.type === 'hope' || f.cost.type === 'fear') &&
      f.cost.amount === 1
    ).filter(f => !f.frequency || f.frequency === 'atWill')

    for (const f of hopeFear1) {
      expect(f.allyCooldown, `${f.id} devrait avoir cooldown 2_spotlights`).toBe('2_spotlights')
    }
  })

  it('les features coûtant 2+ hope/fear ont cooldown per_scene', () => {
    const hopeFear2 = ALL_COMBAT_FEATURES.filter(f =>
      (f.cost.type === 'hope' || f.cost.type === 'fear') &&
      f.cost.amount >= 2
    ).filter(f => !f.frequency || f.frequency === 'atWill')

    for (const f of hopeFear2) {
      expect(f.allyCooldown, `${f.id} devrait avoir cooldown per_scene`).toBe('per_scene')
    }
  })

  it('les features oncePerShortRest ont cooldown per_rest', () => {
    const perRest = ALL_COMBAT_FEATURES.filter(f => f.frequency === 'oncePerShortRest')

    for (const f of perRest) {
      expect(f.allyCooldown, `${f.id} devrait avoir cooldown per_rest`).toBe('per_rest')
    }
  })
})

// ═══════════════════════════════════════════════════════════
//  Conditions appliquées
// ═══════════════════════════════════════════════════════════

describe('Conditions', () => {
  it('au moins 3 features appliquent des conditions', () => {
    const withConditions = ALL_COMBAT_FEATURES.filter(f =>
      f.conditions && f.conditions.applies && f.conditions.applies.length > 0
    )
    expect(withConditions.length).toBeGreaterThanOrEqual(3)
  })

  it('Hold Them Down applique restrained et vulnerable', () => {
    const f = getFeatureById('adv-hold-them-down')
    expect(f.conditions.applies).toContain('restrained')
    expect(f.conditions.applies).toContain('vulnerable')
  })

  it('Curse applique cursed', () => {
    const f = getFeatureById('adv-curse')
    expect(f.conditions.applies).toContain('cursed')
  })
})

// ═══════════════════════════════════════════════════════════
//  Countdowns
// ═══════════════════════════════════════════════════════════

describe('Countdowns', () => {
  it('On My Signal a un countdown de 5', () => {
    const f = getFeatureById('adv-on-my-signal')
    expect(f.countdown).toBeDefined()
    expect(f.countdown.value).toBe(5)
    expect(f.countdown.loop).toBe(false)
  })

  it('la plupart des features n\'ont pas de countdown', () => {
    const withCountdown = ALL_COMBAT_FEATURES.filter(f => f.countdown !== null)
    expect(withCountdown.length).toBeLessThanOrEqual(3)
  })
})

// ═══════════════════════════════════════════════════════════
//  getFeatureById
// ═══════════════════════════════════════════════════════════

describe('getFeatureById', () => {
  it('retrouve une feature par son ID', () => {
    const f = getFeatureById('adv-momentum')
    expect(f).not.toBeNull()
    expect(f.name).toBe('Momentum')
  })

  it('retrouve une feature domaine par son ID', () => {
    const f = getFeatureById('dc-whirlwind')
    expect(f).not.toBeNull()
    expect(f.name).toBe('Whirlwind')
  })

  it('retourne null pour un ID inexistant', () => {
    expect(getFeatureById('nope')).toBeNull()
  })
})

// ═══════════════════════════════════════════════════════════
//  filterFeatures
// ═══════════════════════════════════════════════════════════

describe('filterFeatures', () => {
  it('sans filtre retourne tout', () => {
    expect(filterFeatures()).toHaveLength(35)
  })

  it('filtre par source adversary', () => {
    const result = filterFeatures({ source: 'adversary' })
    expect(result).toHaveLength(23)
    result.forEach(f => expect(f.source).toBe('adversary'))
  })

  it('filtre par source domain_card', () => {
    const result = filterFeatures({ source: 'domain_card' })
    expect(result).toHaveLength(12)
  })

  it('filtre par tier (≤ tier donné)', () => {
    const result = filterFeatures({ tier: 1 })
    result.forEach(f => expect(f.tier).toBeLessThanOrEqual(1))
  })

  it('filtre par activationType', () => {
    const actions = filterFeatures({ activationType: 'action' })
    actions.forEach(f => expect(f.activationType).toBe('action'))

    const passives = filterFeatures({ activationType: 'passive' })
    passives.forEach(f => expect(f.activationType).toBe('passive'))
  })

  it('filtre par tags (au moins un match)', () => {
    const result = filterFeatures({ tags: ['défensif'] })
    result.forEach(f => expect(f.tags).toContain('défensif'))
  })

  it('filtre par thèmes', () => {
    const result = filterFeatures({ themes: ['socialIntrigue'] })
    result.forEach(f => expect(f.themes).toContain('socialIntrigue'))
  })

  it('filtre par recherche textuelle', () => {
    const result = filterFeatures({ search: 'momentum' })
    expect(result.length).toBeGreaterThanOrEqual(1)
    expect(result[0].name).toBe('Momentum')
  })

  it('combine plusieurs filtres', () => {
    const result = filterFeatures({
      source: 'adversary',
      activationType: 'action',
      tags: ['offensif'],
      themes: ['humanoid']
    })
    expect(result.length).toBeGreaterThanOrEqual(1)
    result.forEach(f => {
      expect(f.source).toBe('adversary')
      expect(f.activationType).toBe('action')
      expect(f.tags).toContain('offensif')
      expect(f.themes).toContain('humanoid')
    })
  })

  it('retourne tableau vide si rien ne matche', () => {
    const result = filterFeatures({ themes: ['bestial'] })
    expect(result).toHaveLength(0)
  })
})

// ═══════════════════════════════════════════════════════════
//  groupByActivationType
// ═══════════════════════════════════════════════════════════

describe('groupByActivationType', () => {
  it('sépare les features en 3 groupes', () => {
    const groups = groupByActivationType(ALL_COMBAT_FEATURES)
    expect(groups.passives.length).toBeGreaterThan(0)
    expect(groups.actions.length).toBeGreaterThan(0)
    expect(groups.reactions.length).toBeGreaterThan(0)
  })

  it('le total des groupes = total des features', () => {
    const groups = groupByActivationType(ALL_COMBAT_FEATURES)
    const total = groups.passives.length + groups.actions.length + groups.reactions.length
    expect(total).toBe(ALL_COMBAT_FEATURES.length)
  })

  it('fonctionne avec un sous-ensemble filtré', () => {
    const filtered = filterFeatures({ source: 'domain_card' })
    const groups = groupByActivationType(filtered)
    const total = groups.passives.length + groups.actions.length + groups.reactions.length
    expect(total).toBe(filtered.length)
  })
})
