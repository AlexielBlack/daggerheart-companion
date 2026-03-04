import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useClassHomebrewStore } from '../categories/class/useClassHomebrewStore.js'
import { useDomainHomebrewStore } from '../categories/domain/useDomainHomebrewStore.js'

/**
 * @tests Intégration stores homebrew — classes & domaines
 * @description CRUD spécifique aux schémas complexes :
 * arrays imbriqués (cartes, features), GROUP (traits), validations métier.
 */

// ── Fixtures ─────────────────────────────────────────────
const VALID_CLASS = {
  name: 'Psion',
  description: 'Un guerrier psychique qui manipule les esprits.',
  domains: ['Arcana', 'Sage'],
  baseEvasion: 11,
  baseHP: 5,
  baseStress: 6,
  hopeFeature: 'Dépensez 3 Hope pour projeter une onde psychique.',
  classFeatures: [{ name: 'Télékinésie', description: 'Déplacez un objet à distance avec votre esprit.' }],
  suggestedTraits: { agility: 0, strength: -1, finesse: 0, instinct: 1, presence: 2, knowledge: 1 }
}

const VALID_DOMAIN = {
  name: 'Forge',
  description: 'Le domaine du feu et de la création.',
  hasSpells: true,
  emoji: '🔥',
  color: '#dc2626',
  classes: ['Wizard', 'Sorcerer'],
  themes: ['Feu', 'Création'],
  cards: [
    { name: 'Flamme', level: 1, type: 'spell', recallCost: 1, feature: 'Lancez une flamme qui inflige 1d8 dégâts.' },
    { name: 'Bouclier', level: 1, type: 'ability', recallCost: 0, feature: 'Érigez un bouclier de feu protecteur.' },
    { name: 'Météore', level: 5, type: 'spell', recallCost: 3, feature: 'Invoquez un météore dévastateur depuis le ciel.' }
  ]
}

// ── Class Homebrew Store ─────────────────────────────────
describe('useClassHomebrewStore — CRUD', () => {
  let store

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear()
    setActivePinia(createPinia())
    store = useClassHomebrewStore()
    store.clearAll()
  })

  it('crée une classe complète avec succès', () => {
    const result = store.create(VALID_CLASS)
    expect(result.success).toBe(true)
    expect(result.id).toBeTruthy()
    expect(result.item.name).toBe('Psion')
    expect(store.items).toHaveLength(1)
  })

  it('préserve les classFeatures imbriquées', () => {
    const result = store.create(VALID_CLASS)
    expect(result.item.classFeatures).toHaveLength(1)
    expect(result.item.classFeatures[0].name).toBe('Télékinésie')
    expect(result.item.classFeatures[0].description).toContain('objet à distance')
  })

  it('préserve les suggestedTraits (GROUP)', () => {
    const result = store.create(VALID_CLASS)
    expect(result.item.suggestedTraits).toEqual({
      agility: 0, strength: -1, finesse: 0,
      instinct: 1, presence: 2, knowledge: 1
    })
  })

  it('crée une classe avec features multiples', () => {
    const multiFeature = {
      ...VALID_CLASS,
      classFeatures: [
        { name: 'Rage', description: 'Entrez en rage furieuse et destructrice.' },
        { name: 'Parade', description: 'Parez une attaque ennemie avec précision.' },
        { name: 'Cri de guerre', description: 'Vos alliés gagnent +1 à leur prochain jet.' }
      ]
    }
    const result = store.create(multiFeature)
    expect(result.success).toBe(true)
    expect(result.item.classFeatures).toHaveLength(3)
  })

  it('rejette une classe invalide (nom manquant)', () => {
    const result = store.create({ ...VALID_CLASS, name: '' })
    expect(result.success).toBe(false)
    expect(result.errors.some((e) => e.field === 'name')).toBe(true)
    expect(store.items).toHaveLength(0)
  })

  it('met à jour une classe existante (remplacement complet)', () => {
    const created = store.create(VALID_CLASS)
    const updated = store.update(created.id, { ...VALID_CLASS, name: 'Psion Éveillé', baseHP: 7 })
    expect(updated.success).toBe(true)
    expect(updated.item.name).toBe('Psion Éveillé')
    expect(updated.item.baseHP).toBe(7)
    expect(updated.item.description).toBe(VALID_CLASS.description)
  })

  it('met à jour les classFeatures via update', () => {
    const created = store.create(VALID_CLASS)
    const newData = {
      ...VALID_CLASS,
      classFeatures: [
        { name: 'Domination', description: 'Prenez le contrôle de l\'esprit d\'un adversaire.' }
      ]
    }
    const updated = store.update(created.id, newData)
    expect(updated.success).toBe(true)
    expect(updated.item.classFeatures).toHaveLength(1)
    expect(updated.item.classFeatures[0].name).toBe('Domination')
  })

  it('supprime une classe par ID', () => {
    const a = store.create(VALID_CLASS)
    store.create({ ...VALID_CLASS, name: 'Berserker' })
    const result = store.remove(a.id)
    expect(result.success).toBe(true)
    expect(store.items).toHaveLength(1)
    expect(store.items[0].name).toBe('Berserker')
  })

  it('gère plusieurs classes indépendantes', () => {
    store.create({ ...VALID_CLASS, name: 'Psion' })
    store.create({ ...VALID_CLASS, name: 'Shamane' })
    store.create({ ...VALID_CLASS, name: 'Chevalier Noir' })
    expect(store.items).toHaveLength(3)
  })

  it('clearAll vide toutes les classes', () => {
    store.create(VALID_CLASS)
    store.create({ ...VALID_CLASS, name: 'Autre' })
    store.clearAll()
    expect(store.items).toHaveLength(0)
  })

  it('ajoute les métadonnées automatiquement', () => {
    const result = store.create(VALID_CLASS)
    expect(result.item.source).toBe('custom')
    expect(result.item.createdAt).toBeTruthy()
    expect(result.item.updatedAt).toBeTruthy()
  })

  it('duplique une classe avec un nom modifié', () => {
    const created = store.create(VALID_CLASS)
    const dup = store.duplicate(created.id)
    expect(dup.success).toBe(true)
    expect(dup.item.name).toBe('Psion (copie)')
    expect(dup.item.id).not.toBe(created.id)
    expect(store.items).toHaveLength(2)
  })

  it('recherche par nom dans les classes', () => {
    store.create({ ...VALID_CLASS, name: 'Psion' })
    store.create({ ...VALID_CLASS, name: 'Shamane' })
    store.setSearch('psi')
    expect(store.filteredItems).toHaveLength(1)
    expect(store.filteredItems[0].name).toBe('Psion')
  })
})

// ── Domain Homebrew Store ────────────────────────────────
describe('useDomainHomebrewStore — CRUD', () => {
  let store

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear()
    setActivePinia(createPinia())
    store = useDomainHomebrewStore()
    store.clearAll()
  })

  it('crée un domaine complet avec cartes', () => {
    const result = store.create(VALID_DOMAIN)
    expect(result.success).toBe(true)
    expect(result.item.name).toBe('Forge')
    expect(result.item.cards).toHaveLength(3)
  })

  it('préserve la structure des cartes imbriquées', () => {
    const result = store.create(VALID_DOMAIN)
    const spell = result.item.cards.find((c) => c.name === 'Flamme')
    expect(spell.level).toBe(1)
    expect(spell.type).toBe('spell')
    expect(spell.recallCost).toBe(1)
    expect(spell.feature).toContain('1d8')
  })

  it('préserve les métadonnées optionnelles', () => {
    const result = store.create(VALID_DOMAIN)
    expect(result.item.emoji).toBe('🔥')
    expect(result.item.color).toBe('#dc2626')
    expect(result.item.classes).toEqual(['Wizard', 'Sorcerer'])
    expect(result.item.themes).toEqual(['Feu', 'Création'])
  })

  it('crée un domaine minimal sans cartes', () => {
    const minimal = {
      name: 'Shadow',
      description: 'Le domaine des ombres et des secrets.',
      hasSpells: false,
      cards: []
    }
    const result = store.create(minimal)
    expect(result.success).toBe(true)
    expect(result.item.cards).toEqual([])
  })

  it('crée un domaine avec 21 cartes (SRD standard)', () => {
    const manyCards = Array.from({ length: 21 }, (_, i) => ({
      name: `Carte ${i + 1}`,
      level: Math.min(Math.ceil((i + 1) / 2), 10),
      type: i % 3 === 0 ? 'spell' : i % 3 === 1 ? 'ability' : 'grimoire',
      recallCost: i % 4,
      feature: `Effet mécanique de la carte numéro ${i + 1}.`
    }))
    const result = store.create({ ...VALID_DOMAIN, cards: manyCards })
    expect(result.success).toBe(true)
    expect(result.item.cards).toHaveLength(21)
  })

  it('rejette un domaine invalide (nom manquant)', () => {
    const result = store.create({ ...VALID_DOMAIN, name: '' })
    expect(result.success).toBe(false)
    expect(store.items).toHaveLength(0)
  })

  it('met à jour les cartes d\'un domaine', () => {
    const created = store.create(VALID_DOMAIN)
    const newCards = [
      { name: 'Nouvelle carte', level: 3, type: 'grimoire', recallCost: 2, feature: 'Un effet tout nouveau et différent.' }
    ]
    const updated = store.update(created.id, { ...VALID_DOMAIN, cards: newCards })
    expect(updated.success).toBe(true)
    expect(updated.item.cards).toHaveLength(1)
    expect(updated.item.cards[0].name).toBe('Nouvelle carte')
  })

  it('met à jour hasSpells sans perdre les cartes', () => {
    const created = store.create(VALID_DOMAIN)
    const updated = store.update(created.id, { ...VALID_DOMAIN, hasSpells: false })
    expect(updated.success).toBe(true)
    expect(updated.item.hasSpells).toBe(false)
    expect(updated.item.cards).toHaveLength(3)
  })

  it('supprime un domaine par ID', () => {
    const a = store.create(VALID_DOMAIN)
    store.create({ ...VALID_DOMAIN, name: 'Storm' })
    store.remove(a.id)
    expect(store.items).toHaveLength(1)
    expect(store.items[0].name).toBe('Storm')
  })

  it('gère plusieurs domaines indépendants', () => {
    store.create({ ...VALID_DOMAIN, name: 'Forge' })
    store.create({ ...VALID_DOMAIN, name: 'Storm' })
    store.create({ ...VALID_DOMAIN, name: 'Shadow' })
    expect(store.items).toHaveLength(3)
  })

  it('clearAll vide tous les domaines', () => {
    store.create(VALID_DOMAIN)
    store.create({ ...VALID_DOMAIN, name: 'Storm' })
    store.clearAll()
    expect(store.items).toHaveLength(0)
  })

  it('duplique un domaine avec ses cartes', () => {
    const created = store.create(VALID_DOMAIN)
    const dup = store.duplicate(created.id)
    expect(dup.success).toBe(true)
    expect(dup.item.name).toBe('Forge (copie)')
    expect(dup.item.cards).toHaveLength(3)
    expect(store.items).toHaveLength(2)
  })

  it('getById retourne un domaine avec ses cartes intactes', () => {
    const created = store.create(VALID_DOMAIN)
    const found = store.getById(created.id)
    expect(found).not.toBeNull()
    expect(found.name).toBe('Forge')
    expect(found.cards).toHaveLength(3)
  })

  it('export/import round-trip préserve les cartes', () => {
    store.create(VALID_DOMAIN)
    const json = store.exportItems()
    store.clearAll()
    expect(store.items).toHaveLength(0)

    const result = store.importItems(json)
    expect(result.success).toBe(true)
    expect(result.imported).toBe(1)
    expect(store.items[0].cards).toHaveLength(3)
    expect(store.items[0].cards[0].name).toBe('Flamme')
  })
})
