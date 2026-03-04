/**
 * @vitest
 * Tests du composable useAdversaryFocus.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ref } from 'vue'
import {
  useAdversaryFocus,
  estimateAverageDamage,
  goldToHandfuls
} from '../composables/useAdversaryFocus.js'

// ── Helpers ──────────────────────────────────────────────

function makeAdversary (overrides = {}) {
  return {
    id: 'adv-test',
    name: 'Test Adversary',
    type: 'Standard',
    attack: { range: 'Melee', damageType: 'phy', damage: '1d8+2' },
    focusProfile: {
      lowHP: 0,
      lowArmor: 0,
      lowEvasion: 0,
      highThreat: 0,
      highPresence: 0,
      highGold: 0,
      nearest: 0,
      ...overrides.focusProfile
    },
    ...overrides
  }
}

function makePc (overrides = {}) {
  return {
    id: overrides.id || 'pc-' + Math.random().toString(36).slice(2, 6),
    name: overrides.name || 'Héros',
    maxHP: 6,
    currentHP: 0,
    armorScore: 3,
    armorSlotsMarked: 0,
    evasion: 10,
    evasionBonus: 0,
    traits: { agility: 1, strength: 0, finesse: 2, instinct: 0, presence: 1, knowledge: 0 },
    primaryWeapon: { damage: '1d8' },
    gold: { handfuls: 0, bags: 0, chests: 0 },
    ...overrides
  }
}

// ── estimateAverageDamage ────────────────────────────────

describe('estimateAverageDamage', () => {
  it('calcule la moyenne de 1d8 → 4.5', () => {
    expect(estimateAverageDamage('1d8')).toBeCloseTo(4.5)
  })

  it('calcule la moyenne de 2d6+3 → 10', () => {
    expect(estimateAverageDamage('2d6+3')).toBeCloseTo(10)
  })

  it('calcule la moyenne de d12 (sans préfixe) → 6.5', () => {
    expect(estimateAverageDamage('d12')).toBeCloseTo(6.5)
  })

  it('retourne 0 pour chaîne vide', () => {
    expect(estimateAverageDamage('')).toBe(0)
  })

  it('retourne 0 pour null', () => {
    expect(estimateAverageDamage(null)).toBe(0)
  })

  it('calcule la moyenne de 4d10+12 → 34', () => {
    expect(estimateAverageDamage('4d10+12')).toBeCloseTo(34)
  })
})

// ── goldToHandfuls ───────────────────────────────────────

describe('goldToHandfuls', () => {
  it('convertit correctement les poignées seules', () => {
    expect(goldToHandfuls({ handfuls: 5, bags: 0, chests: 0 })).toBe(5)
  })

  it('convertit 1 bag = 10 handfuls', () => {
    expect(goldToHandfuls({ handfuls: 0, bags: 1, chests: 0 })).toBe(10)
  })

  it('convertit 1 chest = 100 handfuls', () => {
    expect(goldToHandfuls({ handfuls: 0, bags: 0, chests: 1 })).toBe(100)
  })

  it('combine tous les tiers', () => {
    expect(goldToHandfuls({ handfuls: 3, bags: 2, chests: 1 })).toBe(123)
  })

  it('retourne 0 pour null', () => {
    expect(goldToHandfuls(null)).toBe(0)
  })
})

// ── useAdversaryFocus ────────────────────────────────────

describe('useAdversaryFocus', () => {
  let adversaryRef, charactersRef

  beforeEach(() => {
    adversaryRef = ref(null)
    charactersRef = ref([])
  })

  it('retourne un tableau vide si aucun adversaire', () => {
    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    expect(focusResults.value).toEqual([])
  })

  it('retourne un tableau vide si aucun PJ', () => {
    adversaryRef.value = makeAdversary({ focusProfile: { lowHP: 2 } })
    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    expect(focusResults.value).toEqual([])
  })

  it('retourne un score de 0 si tous les poids sont à 0', () => {
    adversaryRef.value = makeAdversary()
    charactersRef.value = [makePc({ name: 'Kaël' })]
    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    expect(focusResults.value).toHaveLength(1)
    expect(focusResults.value[0].score).toBe(0)
  })

  // ── Focus lowHP ──

  it('priorise le PJ le plus blessé avec lowHP', () => {
    adversaryRef.value = makeAdversary({ focusProfile: { lowHP: 3 } })
    charactersRef.value = [
      makePc({ id: 'pc-a', name: 'Kaël', maxHP: 6, currentHP: 5 }), // très blessé
      makePc({ id: 'pc-b', name: 'Lyra', maxHP: 6, currentHP: 1 }) // peu blessé
    ]
    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    expect(focusResults.value[0].characterName).toBe('Kaël')
    expect(focusResults.value[0].score).toBeGreaterThan(focusResults.value[1].score)
  })

  // ── Focus lowArmor ──

  it('priorise le PJ sans armure avec lowArmor', () => {
    adversaryRef.value = makeAdversary({ focusProfile: { lowArmor: 3 } })
    charactersRef.value = [
      makePc({ id: 'pc-a', name: 'Mage', armorScore: 0, armorSlotsMarked: 0 }),
      makePc({ id: 'pc-b', name: 'Tank', armorScore: 6, armorSlotsMarked: 0 })
    ]
    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    expect(focusResults.value[0].characterName).toBe('Mage')
  })

  // ── Focus lowEvasion ──

  it('priorise le PJ à évasion basse avec lowEvasion', () => {
    adversaryRef.value = makeAdversary({ focusProfile: { lowEvasion: 3 } })
    charactersRef.value = [
      makePc({ id: 'pc-a', name: 'Lourd', evasion: 8, evasionBonus: 0 }),
      makePc({ id: 'pc-b', name: 'Agile', evasion: 15, evasionBonus: 0 })
    ]
    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    expect(focusResults.value[0].characterName).toBe('Lourd')
    expect(focusResults.value[0].score).toBeGreaterThan(focusResults.value[1].score)
  })

  // ── Focus highThreat ──

  it('priorise le PJ avec la plus grosse arme avec highThreat', () => {
    adversaryRef.value = makeAdversary({ focusProfile: { highThreat: 3 } })
    charactersRef.value = [
      makePc({ id: 'pc-a', name: 'Guerrier', primaryWeapon: { damage: '2d10+3' } }),
      makePc({ id: 'pc-b', name: 'Barde', primaryWeapon: { damage: '1d4' } })
    ]
    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    expect(focusResults.value[0].characterName).toBe('Guerrier')
  })

  // ── Focus highPresence ──

  it('priorise le PJ avec Presence haute avec highPresence', () => {
    adversaryRef.value = makeAdversary({ focusProfile: { highPresence: 3 } })
    charactersRef.value = [
      makePc({ id: 'pc-a', name: 'Leader', traits: { presence: 4 } }),
      makePc({ id: 'pc-b', name: 'Ermite', traits: { presence: -1 } })
    ]
    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    expect(focusResults.value[0].characterName).toBe('Leader')
  })

  // ── Focus highGold ──

  it('priorise le PJ le plus riche avec highGold', () => {
    adversaryRef.value = makeAdversary({ focusProfile: { highGold: 3 } })
    charactersRef.value = [
      makePc({ id: 'pc-a', name: 'Riche', gold: { handfuls: 5, bags: 3, chests: 1 } }),
      makePc({ id: 'pc-b', name: 'Pauvre', gold: { handfuls: 2, bags: 0, chests: 0 } })
    ]
    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    expect(focusResults.value[0].characterName).toBe('Riche')
  })

  // ── Focus nearest (override GM) ──

  it('priorise le PJ marqué à portée via setPcInRange', () => {
    adversaryRef.value = makeAdversary({ focusProfile: { nearest: 3 } })
    const pcA = makePc({ id: 'pc-a', name: 'Proche' })
    const pcB = makePc({ id: 'pc-b', name: 'Loin' })
    charactersRef.value = [pcA, pcB]

    const { focusResults, setPcInRange } = useAdversaryFocus(adversaryRef, charactersRef)

    // Avant toggle : tous à 0
    expect(focusResults.value[0].score).toBe(0)

    // Toggle PJ-A à portée
    setPcInRange('pc-a', true)
    expect(focusResults.value[0].characterName).toBe('Proche')
    expect(focusResults.value[0].score).toBe(100)
    expect(focusResults.value[1].score).toBe(0)
  })

  // ── Combinaison multi-facteurs ──

  it('combine plusieurs facteurs pour un classement cohérent', () => {
    adversaryRef.value = makeAdversary({
      focusProfile: { lowHP: 2, lowArmor: 2, nearest: 1 }
    })
    const pcA = makePc({
      id: 'pc-a',
      name: 'Blessé&SansArmure',
      maxHP: 6,
      currentHP: 4,
      armorScore: 0
    })
    const pcB = makePc({
      id: 'pc-b',
      name: 'Intact&Blindé',
      maxHP: 6,
      currentHP: 0,
      armorScore: 6
    })
    charactersRef.value = [pcA, pcB]

    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    expect(focusResults.value[0].characterName).toBe('Blessé&SansArmure')
    expect(focusResults.value[0].score).toBeGreaterThan(50)
    expect(focusResults.value[1].score).toBeLessThan(20)
  })

  // ── Raisons ──

  it('fournit des raisons explicatives triées par contribution', () => {
    adversaryRef.value = makeAdversary({
      focusProfile: { lowHP: 3, highPresence: 1 }
    })
    charactersRef.value = [
      makePc({
        id: 'pc-a',
        name: 'Test',
        maxHP: 6,
        currentHP: 6,
        traits: { presence: 3 }
      })
    ]
    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    const reasons = focusResults.value[0].reasons
    expect(reasons.length).toBeGreaterThanOrEqual(1)
    // lowHP devrait être le premier (poids 3 × 100% HP marqués)
    expect(reasons[0].factor).toBe('lowHP')
    expect(reasons[0].icon).toBe('💔')
  })

  // ── Résultat trié par score décroissant ──

  it('trie les résultats par score décroissant', () => {
    adversaryRef.value = makeAdversary({ focusProfile: { lowHP: 3 } })
    charactersRef.value = [
      makePc({ id: 'pc-a', name: 'PeuBlessé', maxHP: 6, currentHP: 1 }),
      makePc({ id: 'pc-b', name: 'TrèsBlessé', maxHP: 6, currentHP: 5 }),
      makePc({ id: 'pc-c', name: 'MoyBlessé', maxHP: 6, currentHP: 3 })
    ]
    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    const names = focusResults.value.map((r) => r.characterName)
    expect(names).toEqual(['TrèsBlessé', 'MoyBlessé', 'PeuBlessé'])
  })

  // ── Réactivité ──

  it(`réagit aux changements de l'adversaire`, () => {
    adversaryRef.value = makeAdversary({ focusProfile: { lowHP: 3 } })
    charactersRef.value = [
      makePc({ id: 'pc-a', name: 'Kaël', maxHP: 6, currentHP: 3 })
    ]
    const { focusResults } = useAdversaryFocus(adversaryRef, charactersRef)
    expect(focusResults.value[0].score).toBe(50)

    // Changer l'adversaire pour un profil highPresence
    adversaryRef.value = makeAdversary({ focusProfile: { highPresence: 3 } })
    // Le score doit changer (presence = 1 → (1+1)/5 = 0.4 → 40%)
    expect(focusResults.value[0].score).toBe(40)
  })
})
