import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEncounterStore } from '../stores/encounterStore'
import { useCharacterStore } from '@modules/characters/stores/characterStore'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i) => Object.keys(store)[i] ?? null)
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('encounterStore — sélection de PJ', () => {
  let encounterStore
  let charStore

  beforeEach(() => {
    localStorageMock.clear()
    setActivePinia(createPinia())
    encounterStore = useEncounterStore()
    charStore = useCharacterStore()
  })

  // ── selectedPcIds état initial ──────────────────────────

  it('selectedPcIds est initialisé vide', () => {
    expect(encounterStore.selectedPcIds).toEqual([])
  })

  // ── setSelectedPcIds ────────────────────────────────────

  it('setSelectedPcIds met à jour les IDs sélectionnés', () => {
    encounterStore.setSelectedPcIds(['abc', 'def'])
    expect(encounterStore.selectedPcIds).toEqual(['abc', 'def'])
  })

  it('setSelectedPcIds avec tableau vide vide la sélection', () => {
    encounterStore.setSelectedPcIds(['abc'])
    encounterStore.setSelectedPcIds([])
    expect(encounterStore.selectedPcIds).toEqual([])
  })

  it('setSelectedPcIds résiste à un paramètre non-tableau', () => {
    encounterStore.setSelectedPcIds(null)
    expect(encounterStore.selectedPcIds).toEqual([])
    encounterStore.setSelectedPcIds(undefined)
    expect(encounterStore.selectedPcIds).toEqual([])
  })

  // ── Synchronisation pcCount ─────────────────────────────

  it('setSelectedPcIds synchronise pcCount avec le nombre de PJ', () => {
    // Créer des personnages dans le character store
    charStore.createCharacter('warrior')
    charStore.createCharacter('wizard')
    charStore.createCharacter('ranger')
    const ids = charStore.characters.map((c) => c.id)

    encounterStore.setSelectedPcIds(ids)
    expect(encounterStore.pcCount).toBe(3)
  })

  it('setSelectedPcIds ne modifie pas pcCount si aucun PJ sélectionné', () => {
    encounterStore.setPcCount(5)
    encounterStore.setSelectedPcIds([])
    expect(encounterStore.pcCount).toBe(5) // inchangé
  })

  // ── Synchronisation tier ────────────────────────────────

  it('setSelectedPcIds dérive le tier du PJ de plus haut niveau', () => {
    charStore.createCharacter('warrior')
    charStore.createCharacter('wizard')
    // Sélectionner et modifier le niveau du 2e personnage pour tier 2
    charStore.selectCharacter(charStore.characters[1].id)
    charStore.updateField('level', 3)

    const ids = charStore.characters.map((c) => c.id)
    encounterStore.setSelectedPcIds(ids)
    expect(encounterStore.selectedTier).toBe(2)
  })

  it('tier reste à 1 pour des PJ de niveau 1', () => {
    charStore.createCharacter('warrior')
    charStore.createCharacter('ranger')

    const ids = charStore.characters.map((c) => c.id)
    encounterStore.setSelectedPcIds(ids)
    expect(encounterStore.selectedTier).toBe(1)
  })

  it('tier se met à 3 si un PJ est niveau 5–7', () => {
    charStore.createCharacter('warrior')
    charStore.selectCharacter(charStore.characters[0].id)
    charStore.updateField('level', 6)

    encounterStore.setSelectedPcIds([charStore.characters[0].id])
    expect(encounterStore.selectedTier).toBe(3)
  })

  it('tier se met à 4 si un PJ est niveau 8+', () => {
    charStore.createCharacter('warrior')
    charStore.selectCharacter(charStore.characters[0].id)
    charStore.updateField('level', 9)

    encounterStore.setSelectedPcIds([charStore.characters[0].id])
    expect(encounterStore.selectedTier).toBe(4)
  })

  // ── availableCharacters ─────────────────────────────────

  it('availableCharacters reflète les personnages du character store', () => {
    expect(encounterStore.availableCharacters).toEqual([])
    charStore.createCharacter('warrior')
    expect(encounterStore.availableCharacters.length).toBe(1)
  })

  // ── selectedPcCharacters ────────────────────────────────

  it('selectedPcCharacters enrichit les données avec tier', () => {
    charStore.createCharacter('warrior')
    charStore.selectCharacter(charStore.characters[0].id)
    charStore.updateField('name', 'Theron')
    charStore.updateField('level', 5)

    encounterStore.setSelectedPcIds([charStore.characters[0].id])
    const pcs = encounterStore.selectedPcCharacters
    expect(pcs).toHaveLength(1)
    expect(pcs[0].name).toBe('Theron')
    expect(pcs[0].tier).toBe(3)
    expect(pcs[0].level).toBe(5)
  })

  it('selectedPcCharacters ignore les IDs invalides', () => {
    encounterStore.setSelectedPcIds(['id-inexistant'])
    expect(encounterStore.selectedPcCharacters).toEqual([])
  })

  // ── derivedPcTier ───────────────────────────────────────

  it('derivedPcTier retourne null sans sélection', () => {
    expect(encounterStore.derivedPcTier).toBeNull()
  })

  it('derivedPcTier retourne le tier max parmi les PJ', () => {
    charStore.createCharacter('warrior')
    charStore.createCharacter('wizard')
    charStore.selectCharacter(charStore.characters[0].id)
    charStore.updateField('level', 2) // tier 2
    charStore.selectCharacter(charStore.characters[1].id)
    charStore.updateField('level', 6) // tier 3

    encounterStore.setSelectedPcIds(charStore.characters.map((c) => c.id))
    expect(encounterStore.derivedPcTier).toBe(3)
  })

  // ── Persistance (serialize / load) ──────────────────────

  it('serializeEncounter inclut selectedPcIds', () => {
    encounterStore.setSelectedPcIds(['aaa', 'bbb'])
    const data = encounterStore.serializeEncounter()
    expect(data.selectedPcIds).toEqual(['aaa', 'bbb'])
  })

  it('loadEncounter restaure selectedPcIds', () => {
    encounterStore.loadEncounter({
      name: 'Test',
      pcCount: 3,
      tier: 2,
      intensity: 'standard',
      selectedPcIds: ['x', 'y', 'z']
    })
    expect(encounterStore.selectedPcIds).toEqual(['x', 'y', 'z'])
  })

  it('loadEncounter gère l\'absence de selectedPcIds', () => {
    encounterStore.setSelectedPcIds(['old-id'])
    encounterStore.loadEncounter({
      name: 'Legacy',
      pcCount: 4,
      tier: 1,
      intensity: 'standard'
    })
    expect(encounterStore.selectedPcIds).toEqual([])
  })

  // ── Reset ───────────────────────────────────────────────

  it('resetEncounter vide selectedPcIds', () => {
    encounterStore.setSelectedPcIds(['abc'])
    encounterStore.resetEncounter()
    expect(encounterStore.selectedPcIds).toEqual([])
  })
})
