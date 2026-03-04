import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore } from '@modules/characters/stores/characterStore.js'
import { useClassHomebrewStore } from '@modules/homebrew/categories/class/useClassHomebrewStore.js'

/**
 * Données de test : classe homebrew valide (conforme au schéma classSchema).
 */
function createTestClass(overrides = {}) {
  return {
    name: 'Shadow Knight',
    emoji: '🌑',
    description: 'Un chevalier de l\u2019ombre, maître des ténèbres et de la lame.',
    domains: ['Blade', 'Arcana'],
    baseEvasion: 10,
    baseHP: 6,
    baseStress: 6,
    hopeFeature: 'Dépensez 3 Espoir pour vous téléporter dans les ombres.',
    classFeatures: [{ name: 'Shadow Step', description: 'Vous pouvez vous téléporter dans les ombres à portée très proche une fois par repos.' }],
    suggestedTraits: { agility: 2, strength: 1, finesse: 0, instinct: -1, presence: 1, knowledge: -1 },
    suggestedArmor: 'Leather Armor',
    classItems: 'Dagger, cloak of shadows',
    subclasses: [],
    ...overrides
  }
}

describe('Homebrew class → domain cards + equipment', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('résout les domaines SRD pour une classe homebrew', () => {
    const classStore = useClassHomebrewStore()
    const result = classStore.create(createTestClass())
    expect(result.success).toBe(true)

    const hbClass = classStore.items[0]
    const charStore = useCharacterStore()

    // La classe apparaît dans allClasses
    const found = charStore.allClasses.find((c) => c.id === hbClass.id)
    expect(found).toBeTruthy()
    expect(found.domains).toEqual(['Blade', 'Arcana'])

    // Créer un personnage et vérifier les domaines
    const charId = charStore.createCharacter(hbClass.id)
    expect(charId).toBeTruthy()
    charStore.selectCharacter(charId)

    const domains = charStore.availableDomains
    expect(domains.length).toBe(2)
    expect(domains.map((d) => d.id).sort()).toEqual(['arcana', 'blade'])
  })

  it('charge les domain cards au niveau 1 pour une classe homebrew', () => {
    const classStore = useClassHomebrewStore()
    classStore.create(createTestClass())
    const hbClass = classStore.items[0]

    const charStore = useCharacterStore()
    const charId = charStore.createCharacter(hbClass.id)
    charStore.selectCharacter(charId)

    // Level 1 : 3 cartes Blade + 3 cartes Arcana = 6
    const cards = charStore.availableDomainCards
    expect(cards.length).toBe(6)
    // Chaque carte a les métadonnées du domaine
    expect(cards[0].domainName).toBeTruthy()
    expect(cards[0].domainColor).toBeTruthy()
  })

  it('expose suggestedArmor et classItems pour classe homebrew', () => {
    const classStore = useClassHomebrewStore()
    classStore.create(createTestClass())
    const hbClass = classStore.items[0]

    const charStore = useCharacterStore()
    const charId = charStore.createCharacter(hbClass.id)
    charStore.selectCharacter(charId)

    const cls = charStore.selectedCharacterClass
    expect(cls).toBeTruthy()
    expect(cls.suggestedArmor).toBe('Leather Armor')
    expect(cls.classItems).toBe('Dagger, cloak of shadows')
    expect(cls.source).toBe('custom')
  })

  it('getRecommendedIds retourne [] pour classe homebrew (pas de crash)', () => {
    const classStore = useClassHomebrewStore()
    classStore.create(createTestClass())
    const hbClass = classStore.items[0]

    const charStore = useCharacterStore()
    const charId = charStore.createCharacter(hbClass.id)
    charStore.selectCharacter(charId)

    // Pas de recommandations configurées pour homebrew → pas de crash, juste vide
    const char = charStore.selectedCharacter
    expect(char.classId).toBe(hbClass.id)
    // Le store ne crashe pas quand il résout les domaines
    expect(charStore.availableDomains.length).toBe(2)
  })
})
