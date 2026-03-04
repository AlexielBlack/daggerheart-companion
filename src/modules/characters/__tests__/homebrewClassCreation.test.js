import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCharacterStore, useClassHomebrewStore } from '../stores/characterStore'

describe('homebrew class creation', () => {
  let store
  let hbStore

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    store = useCharacterStore()
    hbStore = useClassHomebrewStore()
  })

  it('classHomebrewStore starts empty', () => {
    console.log('items:', hbStore.items)
    console.log('count:', hbStore.count)
    expect(hbStore.items).toEqual([])
  })

  it('can create a homebrew class', () => {
    const result = hbStore.create({
      name: 'Necromancer',
      emoji: '💀',
      description: 'Un maître des morts et de la nécromancie.',
      domains: ['Bone', 'Midnight'],
      baseEvasion: 10,
      baseHP: 5,
      baseStress: 6,
      hopeFeature: 'Dark Pact : Dépensez 3 Espoirs pour relever un mort.',
      classFeatures: [
        { name: 'Soul Harvest', description: 'Quand vous tuez un ennemi, gagnez 1 Espoir.', tags: ['offensif'] }
      ],
      suggestedTraits: { agility: -1, strength: 0, finesse: 0, instinct: 1, presence: 2, knowledge: 1 }
    })
    console.log('create result:', result)
    expect(result.success).toBe(true)
    expect(result.id).toBeTruthy()
    console.log('items after create:', hbStore.items.length)
    console.log('item id:', hbStore.items[0]?.id)
  })

  it('allClasses includes homebrew class', () => {
    const result = hbStore.create({
      name: 'Necromancer',
      emoji: '💀',
      description: 'Un maître des morts.',
      domains: ['Bone', 'Midnight'],
      baseEvasion: 10,
      baseHP: 5,
      baseStress: 6,
      hopeFeature: 'Dark Pact : Dépensez 3 Espoirs pour relever un mort.',
      classFeatures: [{ name: 'X', description: 'Y', tags: ['offensif'] }],
      suggestedTraits: { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 }
    })
    console.log('allClasses count:', store.allClasses.length)
    const found = store.allClasses.find(c => c.id === result.id)
    console.log('found in allClasses:', !!found, found?.source)
    expect(found).toBeTruthy()
    expect(found.source).toBe('custom')
  })

  it('can create character from homebrew class', () => {
    const result = hbStore.create({
      name: 'Necromancer',
      emoji: '💀',
      description: 'Un maître des morts.',
      domains: ['Bone', 'Midnight'],
      baseEvasion: 10,
      baseHP: 5,
      baseStress: 6,
      hopeFeature: 'Dark Pact : Dépensez 3 Espoirs pour relever un mort.',
      classFeatures: [{ name: 'X', description: 'Y', tags: ['offensif'] }],
      suggestedTraits: { agility: -1, strength: 0, finesse: 0, instinct: 1, presence: 2, knowledge: 1 }
    })
    console.log('homebrew class id:', result.id)
    
    const charId = store.createCharacter(result.id)
    console.log('charId:', charId)
    console.log('characters:', store.characters.length)
    if (charId) {
      const char = store.characters.find(c => c.id === charId)
      console.log('char classId:', char?.classId)
      console.log('char className:', char?.className)
      console.log('char evasion:', char?.evasion)
      console.log('char maxHP:', char?.maxHP)
    }
    expect(charId).toBeTruthy()
  })
})
