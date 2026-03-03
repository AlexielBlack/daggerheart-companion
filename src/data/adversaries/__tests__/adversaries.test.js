/**
 * @module adversaries/__tests__
 * @description Tests d'intégrité des données adversaires — vérification contre le SRD officiel.
 *
 * Source : ADV_sheetsSRD.pdf (Daggerheart SRD)
 */

import { describe, it, expect } from 'vitest'
import { allAdversaries, ADVERSARY_TYPES, RANGES, tier1, tier2, tier3, tier4 } from '../index.js'

// ── Référence SRD : stats critiques vérifiées manuellement ─────────────────

/**
 * Référence SRD — champs vérifiés manuellement contre ADV_sheetsSRD.pdf.
 * Note : le champ `stress` n'est pas inclus ici car il n'a pas été systématiquement
 * vérifié pour tous les adversaires non corrigés en Phase 7.
 */
const SRD_STATS = {
  // Tier 1
  'Acid Burrower':           { tier: 1, type: 'Solo',     difficulty: 14, hp: 8,  major: 8,  severe: 15, atkMod:  3 },
  'Bear':                    { tier: 1, type: 'Bruiser',  difficulty: 14, hp: 7,  major: 9,  severe: 17, atkMod:  1 },
  'Cave Ogre':               { tier: 1, type: 'Solo',     difficulty: 13, hp: 8,  major: 8,  severe: 15, atkMod:  1 },
  'Construct':               { tier: 1, type: 'Solo',     difficulty: 13, hp: 9,  major: 7,  severe: 15, atkMod:  4 },
  'Deeproot Defender':       { tier: 1, type: 'Bruiser',  difficulty: 10, hp: 7,  major: 8,  severe: 14, atkMod:  2 },
  'Dire Wolf':               { tier: 1, type: 'Skulk',    difficulty: 12, hp: 4,  major: 5,  severe:  9, atkMod:  2 },
  'Giant Mosquitoes':        { tier: 1, type: 'Horde',    difficulty: 10, hp: 6,  major: 5,  severe:  9, atkMod: -2 },
  'Giant Rat':               { tier: 1, type: 'Minion',   difficulty: 10, hp: 1,  major: null, severe: null, atkMod: -4 },
  'Glass Snake':             { tier: 1, type: 'Standard', difficulty: 14, hp: 5,  major: 6,  severe: 10, atkMod:  2 },
  'Harrier':                 { tier: 1, type: 'Standard', difficulty: 12, hp: 3,  major: 5,  severe:  9, atkMod:  1 },
  // Guards
  'Archer Guard':            { tier: 1, type: 'Ranged',   difficulty: 10, hp: 3,  major: 4,  severe:  8, atkMod:  1 },
  'Bladed Guard':            { tier: 1, type: 'Standard', difficulty: 12, hp: 5,  major: 5,  severe:  9, atkMod:  1 },
  'Head Guard':              { tier: 1, type: 'Leader',   difficulty: 15, hp: 7,  major: 7,  severe: 13, atkMod:  4 },
  'Sellsword':               { tier: 1, type: 'Minion',   difficulty: 10, hp: 1,  major: null, severe: null, atkMod:  3 },
  'Spellblade':              { tier: 1, type: 'Standard', difficulty: 14, hp: 6,  major: 8,  severe: 14, atkMod:  3 },
  'Weaponmaster':            { tier: 1, type: 'Standard', difficulty: 14, hp: 6,  major: 8,  severe: 15, atkMod:  2 },
  // Skeletons
  'Skeleton Warrior':        { tier: 1, type: 'Standard', difficulty: 10, hp: 3,  major: 4,  severe:  8, atkMod:  0 },
  'Skeleton Archer':         { tier: 1, type: 'Ranged',   difficulty:  9, hp: 3,  major: 4,  severe:  7, atkMod:  2 },
  'Skeleton Knight':         { tier: 1, type: 'Bruiser',  difficulty: 13, hp: 5,  major: 7,  severe: 13, atkMod:  2 },
  'Skeleton Dredge':         { tier: 1, type: 'Minion',   difficulty:  8, hp: 1,  major: null, severe: null, atkMod: -2 },
  // Zombies
  'Shambling Zombie':        { tier: 1, type: 'Standard', difficulty: 10, hp: 4,  major: 4,  severe:  6, atkMod:  0 },
  'Brawny Zombie':           { tier: 1, type: 'Bruiser',  difficulty: 10, hp: 7,  major: 8,  severe: 15, atkMod:  2 },
  'Rotted Zombie':           { tier: 1, type: 'Minion',   difficulty:  8, hp: 1,  major: null, severe: null, atkMod: -3 },
  'Zombie Pack':             { tier: 1, type: 'Horde',    difficulty:  8, hp: 6,  major: 6,  severe: 12, atkMod: -1 },
  'Patchwork Zombie Hulk':   { tier: 1, type: 'Solo',     difficulty: 13, hp: 10, major: 8,  severe: 15, atkMod:  4 },
  // Elementals & Demons
  'Minor Chaos Elemental':   { tier: 1, type: 'Standard', difficulty: 14, hp: 7,  major: 7,  severe: 14, atkMod:  3 },
  'Minor Fire Elemental':    { tier: 1, type: 'Standard', difficulty: 13, hp: 9,  major: 7,  severe: 15, atkMod:  3 },
  'Minor Demon':             { tier: 1, type: 'Standard', difficulty: 14, hp: 8,  major: 8,  severe: 15, atkMod:  3 },
  // Sylvan
  'Young Dryad':             { tier: 1, type: 'Support',  difficulty: 11, hp: 6,  major: 6,  severe: 11, atkMod:  0 },
  'Sylvan Soldier':          { tier: 1, type: 'Standard', difficulty: 11, hp: 4,  major: 6,  severe: 11, atkMod:  0 },
  // Pirates
  'Pirate Captain':          { tier: 1, type: 'Leader',   difficulty: 14, hp: 7,  major: 7,  severe: 14, atkMod:  4 },
  'Pirate Raiders':          { tier: 1, type: 'Horde',    difficulty: 12, hp: 4,  major: 5,  severe: 11, atkMod:  1 },
  'Pirate Tough':            { tier: 1, type: 'Bruiser',  difficulty: 13, hp: 5,  major: 8,  severe: 15, atkMod:  1 },
  // Oozes
  'Green Ooze':              { tier: 1, type: 'Skulk',    difficulty:  8, hp: 5,  major: 5,  severe: 10, atkMod:  1 },
  'Red Ooze':                { tier: 1, type: 'Skulk',    difficulty: 10, hp: 5,  major: 6,  severe: 11, atkMod:  1 },
  // Tiny Oozes : Minions mais HP=2 selon SRD (exception documentée)
  'Tiny Green Ooze':         { tier: 1, type: 'Minion',   difficulty: 14, hp: 2,  major: 4,  severe: null, atkMod: -1 },
  'Tiny Red Ooze':           { tier: 1, type: 'Minion',   difficulty: 11, hp: 2,  major: 5,  severe: null, atkMod: -1 },
  // Brambles
  'Tangle Bramble':          { tier: 1, type: 'Minion',   difficulty: 11, hp: 1,  major: null, severe: null, atkMod: -1 },
  'Tangle Bramble Swarm':    { tier: 1, type: 'Horde',    difficulty: 12, hp: 6,  major: 6,  severe: 11, atkMod:  0 },
  // Misc
  'Swarm of Rats':           { tier: 1, type: 'Horde',    difficulty: 10, hp: 6,  major: 6,  severe: 10, atkMod: -1 },
  'Petty Noble':             { tier: 1, type: 'Social',   difficulty: 14, hp: 3,  major: 6,  severe: 10, atkMod: -3 },

  // Tier 2
  'Elite Soldier':           { tier: 2, type: 'Standard', difficulty: 15, hp: 4,  major:  9, severe: 18, atkMod:  1 },
  'Gorgon':                  { tier: 2, type: 'Solo',     difficulty: 15, hp: 9,  major: 13, severe: 25, atkMod:  4 },
  'Juvenile Flickerfly':     { tier: 2, type: 'Solo',     difficulty: 14, hp: 10, major: 13, severe: 26, atkMod:  3 },
  'Spectral Guardian':       { tier: 2, type: 'Standard', difficulty: 15, hp: 4,  major:  7, severe: 15, atkMod:  1 },
  'War Wizard':              { tier: 2, type: 'Ranged',   difficulty: 16, hp: 5,  major: 11, severe: 23, atkMod:  4 },
  'Minotaur Wrecker':        { tier: 2, type: 'Bruiser',  difficulty: 16, hp: 7,  major: 14, severe: 27, atkMod:  2 },

  // Tier 3
  'Adult Flickerfly':        { tier: 3, type: 'Solo',     difficulty: 17, hp: 12, major: 20, severe: 35, atkMod:  3 },
  'Demon of Jealousy':       { tier: 3, type: 'Ranged',   difficulty: 17, hp: 6,  major: 17, severe: 30, atkMod:  4 },
  'Demon of Wrath':          { tier: 3, type: 'Bruiser',  difficulty: 17, hp: 7,  major: 22, severe: 40, atkMod:  3 },
  'Hydra':                   { tier: 3, type: 'Solo',     difficulty: 18, hp: 10, major: 19, severe: 35, atkMod:  3 },
  'Young Ice Dragon':        { tier: 3, type: 'Solo',     difficulty: 18, hp: 10, major: 21, severe: 41, atkMod:  7 },

  // Tier 4
  'Fallen Warlord: Realm-Breaker':       { tier: 4, type: 'Solo',     difficulty: 20, hp: 8,  major: 36, severe: 66, atkMod:  7 },
  'Fallen Warlord: Undefeated Champion': { tier: 4, type: 'Solo',     difficulty: 18, hp: 11, major: 35, severe: 58, atkMod:  8 },
  'Perfected Zombie':                    { tier: 4, type: 'Standard', difficulty: 20, hp: 9,  major: 40, severe: 70, atkMod:  4 },
  'Zombie Legion':                       { tier: 4, type: 'Horde',    difficulty: 17, hp: 8,  major: 25, severe: 45, atkMod:  2 },
  'Kraken':                              { tier: 4, type: 'Solo',     difficulty: 20, hp: 11, major: 35, severe: 70, atkMod:  7 },
  'Outer Realms Corrupter':              { tier: 4, type: 'Support',  difficulty: 19, hp: 4,  major: 27, severe: 47, atkMod:  7 },
  'High Seraph':                         { tier: 4, type: 'Leader',   difficulty: 20, hp: 7,  major: 37, severe: 70, atkMod:  8 },
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getThresholdMajor(a) {
  if (!a.thresholds) return null
  return a.thresholds.major ?? null
}

function getThresholdSevere(a) {
  if (!a.thresholds) return null
  return a.thresholds.severe ?? null
}

// ── Tests — Structure générale ─────────────────────────────────────────────

describe('Adversaires — structure de données', () => {
  it('contient des données pour les 4 tiers', () => {
    expect(tier1.length).toBeGreaterThan(0)
    expect(tier2.length).toBeGreaterThan(0)
    expect(tier3.length).toBeGreaterThan(0)
    expect(tier4.length).toBeGreaterThan(0)
  })

  it('expose allAdversaries combinant les 4 tiers', () => {
    expect(allAdversaries.length).toBe(tier1.length + tier2.length + tier3.length + tier4.length)
  })

  it('chaque adversaire a un id unique', () => {
    const ids = allAdversaries.map((a) => a.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it.each(allAdversaries.map((a) => [a.id, a]))('%s — champs requis présents', (_id, a) => {
    expect(a).toHaveProperty('id')
    expect(a).toHaveProperty('name')
    expect(a).toHaveProperty('tier')
    expect(a).toHaveProperty('type')
    expect(a).toHaveProperty('difficulty')
    expect(a).toHaveProperty('hp')
    expect(a).toHaveProperty('stress')
    expect(a).toHaveProperty('motives')
    expect(Array.isArray(a.motives)).toBe(true)
    expect(a.motives.length).toBeGreaterThan(0)
  })

  it.each(allAdversaries.map((a) => [a.id, a]))('%s — type valide', (_id, a) => {
    expect(ADVERSARY_TYPES).toContain(a.type)
  })

  it.each(allAdversaries.map((a) => [a.id, a]))('%s — tier entre 1 et 4', (_id, a) => {
    expect(a.tier).toBeGreaterThanOrEqual(1)
    expect(a.tier).toBeLessThanOrEqual(4)
  })

  it.each(allAdversaries.map((a) => [a.id, a]))('%s — seuils de dégâts cohérents', (_id, a) => {
    if (a.type === 'Minion') {
      // Les minions peuvent ne pas avoir de seuils
      return
    }
    expect(a.thresholds).toBeTruthy()
    if (a.thresholds) {
      const { major, severe } = a.thresholds
      if (major !== null && major !== undefined && severe !== null && severe !== undefined) {
        expect(severe).toBeGreaterThan(major)
      }
    }
  })

  it.each(allAdversaries.filter(a => a.attack).map((a) => [a.id, a]))(
    '%s — attaque bien formée', (_id, a) => {
      const atk = a.attack
      expect(atk).toHaveProperty('modifier')
      expect(typeof atk.modifier).toBe('number')
      expect(atk).toHaveProperty('name')
      expect(atk).toHaveProperty('range')
      expect(RANGES).toContain(atk.range)
      expect(atk).toHaveProperty('damage')
      expect(atk).toHaveProperty('damageType')
    }
  )
})

// ── Tests — Conformité SRD ─────────────────────────────────────────────────

describe('Adversaires — conformité SRD', () => {
  const byName = Object.fromEntries(allAdversaries.map((a) => [a.name, a]))

  it.each(Object.entries(SRD_STATS))('%s — stats SRD correctes', (name, expected) => {
    const a = byName[name]
    expect(a, `Adversaire introuvable : "${name}"`).toBeTruthy()

    expect(a.tier).toBe(expected.tier)
    expect(a.type).toBe(expected.type)
    expect(a.difficulty).toBe(expected.difficulty)
    expect(a.hp).toBe(expected.hp)

    // Seuils
    expect(getThresholdMajor(a)).toBe(expected.major)
    expect(getThresholdSevere(a)).toBe(expected.severe)

    // Modificateur d'attaque
    if (a.attack) {
      expect(a.attack.modifier).toBe(expected.atkMod)
    }
  })

  it('aucun adversaire "Corruptor" (orthographe correcte : Corrupter)', () => {
    const found = allAdversaries.find((a) => a.name === 'Outer Realms Corruptor')
    expect(found).toBeUndefined()
  })

  it('Outer Realms Corrupter existe avec la bonne orthographe', () => {
    const found = allAdversaries.find((a) => a.name === 'Outer Realms Corrupter')
    expect(found).toBeTruthy()
    expect(found?.id).toBe('outer-realms-corrupter')
  })
})

// ── Tests — Types spéciaux ─────────────────────────────────────────────────

describe('Adversaires — règles par type', () => {
  const minions = allAdversaries.filter((a) => a.type === 'Minion')
  const nonMinions = allAdversaries.filter((a) => a.type !== 'Minion')

  it('les minions ont 1 HP (sauf Tiny Ooze par règle SRD)', () => {
    // Les Tiny Oozes sont des Minions avec 2 HP selon la règle SRD de scission
    const TINY_OOZE_EXCEPTIONS = new Set(['Tiny Green Ooze', 'Tiny Red Ooze'])
    minions.forEach((a) => {
      if (TINY_OOZE_EXCEPTIONS.has(a.name)) return
      expect(a.hp, `${a.name} devrait avoir 1 HP`).toBe(1)
    })
  })

  it('les Tiny Ooze (Minion) ont 2 HP par règle de scission SRD', () => {
    const tinyGreen = allAdversaries.find((a) => a.name === 'Tiny Green Ooze')
    const tinyRed = allAdversaries.find((a) => a.name === 'Tiny Red Ooze')
    expect(tinyGreen?.hp).toBe(2)
    expect(tinyRed?.hp).toBe(2)
  })

  it('les non-minions ont plus de 1 HP', () => {
    nonMinions.forEach((a) => {
      expect(a.hp, `${a.name} devrait avoir > 1 HP`).toBeGreaterThan(1)
    })
  })

  it('les solos ont plus de HP que les standards (tiers 1–3)', () => {
    // Tier 4 est exclu : Perfected Zombie (Standard, 9 HP) dépasse la moyenne des solos
    for (let tier = 1; tier <= 3; tier++) {
      const solos = allAdversaries.filter((a) => a.tier === tier && a.type === 'Solo')
      const standards = allAdversaries.filter((a) => a.tier === tier && a.type === 'Standard')
      if (solos.length > 0 && standards.length > 0) {
        const avgSoloHp = solos.reduce((s, a) => s + a.hp, 0) / solos.length
        const avgStdHp = standards.reduce((s, a) => s + a.hp, 0) / standards.length
        expect(avgSoloHp, `Tier ${tier}: solos HP moyen doit dépasser standards HP moyen`).toBeGreaterThan(avgStdHp)
      }
    }
  })

  it('la difficulté augmente avec le tier', () => {
    const avgDiff = [1, 2, 3, 4].map((tier) => {
      const entries = allAdversaries.filter((a) => a.tier === tier && a.type !== 'Minion')
      return entries.reduce((s, a) => s + a.difficulty, 0) / entries.length
    })
    for (let i = 1; i < avgDiff.length; i++) {
      expect(avgDiff[i]).toBeGreaterThan(avgDiff[i - 1])
    }
  })
})

// ── Tests — Attacks spécifiques ───────────────────────────────────────────

describe('Adversaires — attaques notables', () => {
  const byName = Object.fromEntries(allAdversaries.map((a) => [a.name, a]))

  it('Pirate Raiders utilise "Cutlass" (singulier)', () => {
    const a = byName['Pirate Raiders']
    expect(a?.attack?.name).toBe('Cutlass')
  })

  it('Brawny Zombie utilise "Slam" en Very Close', () => {
    const a = byName['Brawny Zombie']
    expect(a?.attack?.name).toBe('Slam')
    expect(a?.attack?.range).toBe('Very Close')
  })

  it('Sellsword (Minion) fait 3 dégâts physiques', () => {
    const a = byName['Sellsword']
    expect(a?.attack?.damage).toBe('3')
    expect(a?.attack?.damageType).toBe('phy')
  })

  it('Tangle Bramble (Minion) fait 2 dégâts physiques', () => {
    const a = byName['Tangle Bramble']
    expect(a?.attack?.damage).toBe('2')
    expect(a?.attack?.damageType).toBe('phy')
  })
})
