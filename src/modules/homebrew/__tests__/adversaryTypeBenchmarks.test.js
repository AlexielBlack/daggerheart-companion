import { describe, it, expect } from 'vitest'
import {
  ADVERSARY_TYPE_BENCHMARKS,
  getBenchmarkForTypeTier,
  getTypeInfo
} from '../data/adversaryTypeBenchmarks.js'

/**
 * @tests adversaryTypeBenchmarks
 * @description Validation exhaustive des données de référence par type × tier.
 */

const ALL_TYPES = [
  'Bruiser', 'Horde', 'Leader', 'Minion', 'Ranged',
  'Skulk', 'Social', 'Solo', 'Standard', 'Support'
]
const ALL_TIERS = [1, 2, 3, 4]

// Battle points attendus selon le SRD
const EXPECTED_BATTLE_POINTS = {
  Bruiser: 4,
  Horde: 2,
  Leader: 3,
  Minion: 1,
  Ranged: 2,
  Skulk: 2,
  Social: 1,
  Solo: 5,
  Standard: 2,
  Support: 1
}

describe('adversaryTypeBenchmarks — structure', () => {
  it('exporte exactement 10 types', () => {
    const types = Object.keys(ADVERSARY_TYPE_BENCHMARKS)
    expect(types).toHaveLength(10)
    expect(types.sort()).toEqual(ALL_TYPES.sort())
  })

  describe.each(ALL_TYPES)('Type %s — métadonnées', (type) => {
    const typeData = ADVERSARY_TYPE_BENCHMARKS[type]

    it('possède une description non vide', () => {
      expect(typeData.description).toBeTruthy()
      expect(typeof typeData.description).toBe('string')
    })

    it('possède des battlePoints numériques positifs', () => {
      expect(typeof typeData.battlePoints).toBe('number')
      expect(typeData.battlePoints).toBeGreaterThan(0)
      expect(typeData.battlePoints).toBeLessThanOrEqual(5)
    })

    it('a les battlePoints corrects selon le SRD', () => {
      expect(typeData.battlePoints).toBe(EXPECTED_BATTLE_POINTS[type])
    })

    it('possède des guidelines (tableau non vide)', () => {
      expect(Array.isArray(typeData.guidelines)).toBe(true)
      expect(typeData.guidelines.length).toBeGreaterThan(0)
      typeData.guidelines.forEach((g) => {
        expect(typeof g).toBe('string')
        expect(g.length).toBeGreaterThan(0)
      })
    })

    it('possède des suggestedFeatures valides', () => {
      expect(Array.isArray(typeData.suggestedFeatures)).toBe(true)
      expect(typeData.suggestedFeatures.length).toBeGreaterThan(0)
      typeData.suggestedFeatures.forEach((f) => {
        expect(f.name).toBeTruthy()
        expect(['Passive', 'Action', 'Reaction']).toContain(f.type)
        expect(f.description).toBeTruthy()
      })
    })

    it('possède exactement 4 tiers', () => {
      expect(Object.keys(typeData.tiers).map(Number).sort()).toEqual(ALL_TIERS)
    })
  })
})

describe('adversaryTypeBenchmarks — tiers', () => {
  describe.each(ALL_TYPES)('Type %s — données par tier', (type) => {
    const typeData = ADVERSARY_TYPE_BENCHMARKS[type]
    const isMinion = type === 'Minion'

    describe.each(ALL_TIERS)('Tier %i', (tier) => {
      const tierData = typeData.tiers[tier]

      it('possède une difficulty valide', () => {
        const diff = tierData.difficulty
        expect(diff).toBeDefined()
        if (typeof diff === 'object') {
          expect(diff.min).toBeLessThanOrEqual(diff.max)
          expect(diff.default).toBeGreaterThanOrEqual(diff.min)
          expect(diff.default).toBeLessThanOrEqual(diff.max)
        } else {
          expect(typeof diff).toBe('number')
          expect(diff).toBeGreaterThan(0)
        }
      })

      if (isMinion) {
        it('n\'a pas de seuils (Minion)', () => {
          expect(tierData.thresholds).toBeNull()
        })
      } else {
        it('possède des seuils major < severe', () => {
          const { major, severe } = tierData.thresholds
          const majorVal = typeof major === 'object' ? major.default : major
          const severeVal = typeof severe === 'object' ? severe.default : severe
          expect(majorVal).toBeLessThan(severeVal)
        })
      }

      it('possède des HP positifs', () => {
        const hp = tierData.hp
        const hpVal = typeof hp === 'object' ? hp.default : hp
        expect(hpVal).toBeGreaterThan(0)
      })

      it('possède du stress >= 0', () => {
        const stress = tierData.stress
        const stressVal = typeof stress === 'object' ? stress.default : stress
        expect(stressVal).toBeGreaterThanOrEqual(0)
      })

      it('possède une attaque avec modifier, damage, range', () => {
        expect(tierData.attack).toBeDefined()
        expect(tierData.attack.modifier).toBeDefined()
        expect(tierData.attack.damage).toBeTruthy()
        expect(tierData.attack.range).toBeTruthy()
      })

      it('possède des experiences valides', () => {
        expect(tierData.experiences).toBeDefined()
        expect(tierData.experiences.count).toBeDefined()
        expect(tierData.experiences.bonus).toBeDefined()
      })
    })
  })
})

describe('adversaryTypeBenchmarks — progression par tier', () => {
  /** Extrait la valeur par défaut d'un champ */
  function val(field) {
    if (field === null || field === undefined) return null
    if (typeof field === 'number') return field
    if (typeof field === 'object' && 'default' in field) return field.default
    return null
  }

  describe.each(ALL_TYPES)('Type %s — scaling', (type) => {
    const typeData = ADVERSARY_TYPE_BENCHMARKS[type]

    it('la difficulty augmente ou reste stable entre les tiers', () => {
      for (let t = 1; t < 4; t++) {
        const current = val(typeData.tiers[t].difficulty)
        const next = val(typeData.tiers[t + 1].difficulty)
        expect(next).toBeGreaterThanOrEqual(current)
      }
    })

    it('le modifier d\'attaque augmente ou reste stable entre les tiers', () => {
      for (let t = 1; t < 4; t++) {
        const current = val(typeData.tiers[t].attack.modifier)
        const next = val(typeData.tiers[t + 1].attack.modifier)
        expect(next).toBeGreaterThanOrEqual(current)
      }
    })
  })
})

describe('adversaryTypeBenchmarks — comparatifs entre types', () => {
  function val(field) {
    if (field === null || field === undefined) return null
    if (typeof field === 'number') return field
    if (typeof field === 'object' && 'default' in field) return field.default
    return null
  }

  it('Bruiser a plus de HP que Standard au T1', () => {
    const bruiserHp = val(ADVERSARY_TYPE_BENCHMARKS.Bruiser.tiers[1].hp)
    const standardHp = val(ADVERSARY_TYPE_BENCHMARKS.Standard.tiers[1].hp)
    expect(bruiserHp).toBeGreaterThanOrEqual(standardHp)
  })

  it('Minion a toujours 1 HP', () => {
    ALL_TIERS.forEach((tier) => {
      const hp = val(ADVERSARY_TYPE_BENCHMARKS.Minion.tiers[tier].hp)
      expect(hp).toBe(1)
    })
  })

  it('Solo a les battlePoints les plus élevés (5)', () => {
    expect(ADVERSARY_TYPE_BENCHMARKS.Solo.battlePoints).toBe(5)
    ALL_TYPES.forEach((type) => {
      expect(ADVERSARY_TYPE_BENCHMARKS[type].battlePoints).toBeLessThanOrEqual(5)
    })
  })

  it('Minion, Social, Support ont 1 battlePoint', () => {
    expect(ADVERSARY_TYPE_BENCHMARKS.Minion.battlePoints).toBe(1)
    expect(ADVERSARY_TYPE_BENCHMARKS.Social.battlePoints).toBe(1)
    expect(ADVERSARY_TYPE_BENCHMARKS.Support.battlePoints).toBe(1)
  })
})

describe('getBenchmarkForTypeTier()', () => {
  it('retourne les données pour un type/tier valide', () => {
    const result = getBenchmarkForTypeTier('Bruiser', 1)
    expect(result).toBeDefined()
    expect(result.difficulty).toBeDefined()
    expect(result.attack).toBeDefined()
  })

  it('retourne null pour un type inexistant', () => {
    expect(getBenchmarkForTypeTier('Inexistant', 1)).toBeNull()
  })

  it('retourne null pour un tier inexistant', () => {
    expect(getBenchmarkForTypeTier('Bruiser', 99)).toBeNull()
  })

  it('retourne null pour un type undefined', () => {
    expect(getBenchmarkForTypeTier(undefined, 1)).toBeNull()
  })

  it.each(ALL_TYPES)('retourne des données pour %s tier 1', (type) => {
    const result = getBenchmarkForTypeTier(type, 1)
    expect(result).not.toBeNull()
    expect(result.difficulty).toBeDefined()
  })
})

describe('getTypeInfo()', () => {
  it('retourne les infos pour un type valide', () => {
    const info = getTypeInfo('Bruiser')
    expect(info).toBeDefined()
    expect(info.description).toBeTruthy()
    expect(info.battlePoints).toBe(4)
    expect(Array.isArray(info.guidelines)).toBe(true)
    expect(Array.isArray(info.suggestedFeatures)).toBe(true)
  })

  it('retourne null pour un type inexistant', () => {
    expect(getTypeInfo('Inexistant')).toBeNull()
  })

  it('ne retourne pas les tiers (données allégées)', () => {
    const info = getTypeInfo('Standard')
    expect(info.tiers).toBeUndefined()
  })

  it.each(ALL_TYPES)('retourne des infos pour %s', (type) => {
    const info = getTypeInfo(type)
    expect(info).not.toBeNull()
    expect(info.description).toBeTruthy()
    expect(info.battlePoints).toBeGreaterThan(0)
  })
})
