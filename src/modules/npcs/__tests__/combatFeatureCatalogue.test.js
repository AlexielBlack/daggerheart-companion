/**
 * @file combatFeatureCatalogue.test.js
 * @description Tests du catalogue de combat features PNJ :
 * intégrité des données, filtrage, recherche, groupement.
 *
 * Phase 4 : catalogue complet (265 adversaire + 129 domaine).
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
import {
  ALL_THEMES,
  ALL_FEATURE_SOURCES
} from '../combatConstants.js'

// ═══════════════════════════════════════════════════════════
//  Intégrité des données
// ═══════════════════════════════════════════════════════════

describe('Intégrité du catalogue', () => {
  it('contient 265 features adversaire', () => {
    expect(ADVERSARY_FEATURES).toHaveLength(265)
  })

  it('contient 129 features de cartes de domaine', () => {
    expect(DOMAIN_CARD_FEATURES).toHaveLength(129)
  })

  it('ALL_COMBAT_FEATURES = 394 features', () => {
    expect(ALL_COMBAT_FEATURES).toHaveLength(394)
  })

  it('tous les IDs sont uniques', () => {
    const ids = ALL_COMBAT_FEATURES.map(f => f.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('chaque feature a un id non vide', () => {
    for (const f of ALL_COMBAT_FEATURES) {
      expect(f.id, `Feature sans id`).toBeTruthy()
    }
  })

  it('chaque feature a un name non vide', () => {
    for (const f of ALL_COMBAT_FEATURES) {
      expect(f.name, `Feature ${f.id} sans name`).toBeTruthy()
    }
  })

  it('chaque feature a une description non vide', () => {
    for (const f of ALL_COMBAT_FEATURES) {
      expect(f.description, `Feature ${f.id} sans description`).toBeTruthy()
    }
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

  it('tous les thèmes sont valides', () => {
    for (const f of ALL_COMBAT_FEATURES) {
      for (const t of f.themes) {
        expect(ALL_THEMES, `Thème invalide « ${t} » dans ${f.id}`).toContain(t)
      }
    }
  })

  it('toutes les sources sont valides', () => {
    for (const f of ALL_COMBAT_FEATURES) {
      expect(ALL_FEATURE_SOURCES, `Source invalide « ${f.source} » dans ${f.id}`).toContain(f.source)
    }
  })

  it('tous les activationType sont valides', () => {
    const valid = ['passive', 'action', 'reaction']
    for (const f of ALL_COMBAT_FEATURES) {
      expect(valid, `activationType invalide « ${f.activationType} » dans ${f.id}`).toContain(f.activationType)
    }
  })

  it('les tiers sont entre 1 et 4', () => {
    for (const f of ALL_COMBAT_FEATURES) {
      expect(f.tier, `Tier invalide dans ${f.id}`).toBeGreaterThanOrEqual(1)
      expect(f.tier, `Tier invalide dans ${f.id}`).toBeLessThanOrEqual(4)
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

  it('chaque feature adversaire a au moins un adversaryType', () => {
    for (const f of ADVERSARY_FEATURES) {
      expect(f.adversaryTypes.length, `${f.id} n'a pas d'adversaryType`).toBeGreaterThanOrEqual(1)
    }
  })

  it('chaque feature a un sourceRef non vide', () => {
    for (const f of ALL_COMBAT_FEATURES) {
      expect(f.sourceRef, `${f.id} manque sourceRef`).toBeTruthy()
    }
  })
})

// ═══════════════════════════════════════════════════════════
//  Couverture thématique
// ═══════════════════════════════════════════════════════════

describe('Couverture thématique', () => {
  it('le thème humanoid est le plus représenté', () => {
    const humanoid = ALL_COMBAT_FEATURES.filter(f => f.themes.includes('humanoid'))
    expect(humanoid.length).toBeGreaterThan(100)
  })

  it('chaque thème a au moins 10 features', () => {
    for (const theme of ALL_THEMES) {
      const count = ALL_COMBAT_FEATURES.filter(f => f.themes.includes(theme)).length
      expect(count, `Thème ${theme} sous-représenté`).toBeGreaterThanOrEqual(10)
    }
  })

  it('les 4 tiers sont couverts par les adversaires', () => {
    for (let tier = 1; tier <= 4; tier++) {
      const count = ADVERSARY_FEATURES.filter(f => f.tier === tier).length
      expect(count, `Tier ${tier} non couvert`).toBeGreaterThan(0)
    }
  })
})

describe('Couverture par type d\'adversaire', () => {
  const types = ['bruiser', 'horde', 'leader', 'minion', 'ranged', 'skulk', 'social', 'solo', 'standard', 'support']

  it('les 10 types d\'adversaire sont couverts', () => {
    for (const type of types) {
      const count = ADVERSARY_FEATURES.filter(f =>
        f.adversaryTypes && f.adversaryTypes.includes(type)
      ).length
      expect(count, `Type ${type} non couvert`).toBeGreaterThan(0)
    }
  })

  it('Momentum est associé à plusieurs types', () => {
    const f = getFeatureById('adv-momentum')
    expect(f.adversaryTypes.length).toBeGreaterThan(1)
  })
})

// ═══════════════════════════════════════════════════════════
//  Cooldowns alliés
// ═══════════════════════════════════════════════════════════

describe('Cooldowns alliés', () => {
  it('chaque feature a un allyCooldown défini', () => {
    const valid = ['none', '2_spotlights', 'per_scene', 'per_rest', 'per_long_rest']
    for (const f of ALL_COMBAT_FEATURES) {
      expect(valid, `allyCooldown invalide « ${f.allyCooldown} » dans ${f.id}`).toContain(f.allyCooldown)
    }
  })

  it('les features avec coût fear ≥ 2 ont cooldown per_scene', () => {
    const fear2 = ALL_COMBAT_FEATURES.filter(f =>
      f.cost.type === 'fear' && f.cost.amount >= 2 &&
      (!f.frequency || f.frequency === 'atWill')
    )
    for (const f of fear2) {
      expect(f.allyCooldown, `${f.id} devrait avoir per_scene`).toBe('per_scene')
    }
  })
})

// ═══════════════════════════════════════════════════════════
//  Enrichissement automatique
// ═══════════════════════════════════════════════════════════

describe('Enrichissement', () => {
  it('au moins 70 features ont des dégâts extraits', () => {
    const withDamage = ALL_COMBAT_FEATURES.filter(f => f.damageFormula)
    expect(withDamage.length).toBeGreaterThanOrEqual(70)
  })

  it('au moins 40 features ont des conditions extraites', () => {
    const withConditions = ALL_COMBAT_FEATURES.filter(f => f.conditions)
    expect(withConditions.length).toBeGreaterThanOrEqual(40)
  })

  it('au moins 3 features ont des countdowns', () => {
    const withCountdown = ALL_COMBAT_FEATURES.filter(f => f.countdown)
    expect(withCountdown.length).toBeGreaterThanOrEqual(3)
  })
})

// ═══════════════════════════════════════════════════════════
//  getFeatureById
// ═══════════════════════════════════════════════════════════

describe('getFeatureById', () => {
  it('retrouve Momentum par ID', () => {
    const f = getFeatureById('adv-momentum')
    expect(f).not.toBeNull()
    expect(f.name).toBe('Momentum')
  })

  it('retrouve une carte domaine par ID', () => {
    const f = getFeatureById('dc-blade-whirlwind')
    expect(f).not.toBeNull()
    expect(f.name).toBe('Whirlwind')
  })

  it('retourne null pour un ID inexistant', () => {
    expect(getFeatureById('nope')).toBeNull()
  })

  it('lookup rapide (index)', () => {
    // Vérifier que tous les IDs sont trouvables
    for (const f of ALL_COMBAT_FEATURES) {
      expect(getFeatureById(f.id)).not.toBeNull()
    }
  })
})

// ═══════════════════════════════════════════════════════════
//  filterFeatures
// ═══════════════════════════════════════════════════════════

describe('filterFeatures', () => {
  it('sans filtre retourne les 394 features', () => {
    expect(filterFeatures()).toHaveLength(394)
  })

  it('filtre par source adversary', () => {
    const result = filterFeatures({ source: 'adversary' })
    expect(result).toHaveLength(265)
  })

  it('filtre par source domain_card', () => {
    const result = filterFeatures({ source: 'domain_card' })
    expect(result).toHaveLength(129)
  })

  it('filtre par tier ≤ 1', () => {
    const result = filterFeatures({ tier: 1 })
    result.forEach(f => expect(f.tier).toBeLessThanOrEqual(1))
    expect(result.length).toBeGreaterThan(0)
  })

  it('filtre par activationType action', () => {
    const result = filterFeatures({ activationType: 'action' })
    result.forEach(f => expect(f.activationType).toBe('action'))
    expect(result.length).toBeGreaterThan(50)
  })

  it('filtre par tag défensif', () => {
    const result = filterFeatures({ tags: ['défensif'] })
    result.forEach(f => expect(f.tags).toContain('défensif'))
    expect(result.length).toBeGreaterThan(10)
  })

  it('filtre par thème humanoid', () => {
    const result = filterFeatures({ themes: ['humanoid'] })
    result.forEach(f => expect(f.themes).toContain('humanoid'))
    expect(result.length).toBeGreaterThan(100)
  })

  it('filtre par recherche textuelle', () => {
    const result = filterFeatures({ search: 'momentum' })
    expect(result.length).toBeGreaterThanOrEqual(1)
  })

  it('combine source + thème + tier', () => {
    const result = filterFeatures({
      source: 'adversary',
      themes: ['humanoid'],
      tier: 2
    })
    result.forEach(f => {
      expect(f.source).toBe('adversary')
      expect(f.themes).toContain('humanoid')
      expect(f.tier).toBeLessThanOrEqual(2)
    })
  })

  it('retourne un tableau vide pour filtre sans résultat', () => {
    const result = filterFeatures({ search: 'xyznonexistent' })
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
    const filtered = filterFeatures({ source: 'domain_card', tier: 2 })
    const groups = groupByActivationType(filtered)
    const total = groups.passives.length + groups.actions.length + groups.reactions.length
    expect(total).toBe(filtered.length)
  })
})
