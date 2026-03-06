/**
 * @file homebrewCombatFeature.test.js
 * @description Tests du store homebrew combat features :
 * CRUD, validation, duplication, import/export.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHomebrewCombatFeatureStore } from '../stores/homebrewCombatFeatureStore.js'

const VALID_FEATURE = {
  name: 'Coup de pommeau',
  description: 'Frappez avec le pommeau de votre arme pour étourdir la cible.',
  activationType: 'action',
  tier: 1,
  tags: ['offensif'],
  themes: ['humanoid'],
  cost: { type: 'stress', amount: 1 },
  frequency: 'atWill',
  allyCooldown: 'none',
  range: 'melee'
}

describe('Homebrew Combat Feature Store', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    store = useHomebrewCombatFeatureStore()
  })

  // ── CRUD ──

  describe('create', () => {
    it('crée une feature valide', () => {
      const result = store.create(VALID_FEATURE)
      expect(result.success).toBe(true)
      expect(result.id).toBeTruthy()
      expect(result.item.name).toBe('Coup de pommeau')
      expect(result.item.source).toBe('homebrew')
      expect(result.item.sourceRef).toBe('homebrew')
      expect(store.count).toBe(1)
    })

    it('génère un ID unique avec préfixe hb-', () => {
      const r1 = store.create(VALID_FEATURE)
      const r2 = store.create({ ...VALID_FEATURE, name: 'Feinte' })
      expect(r1.id).toMatch(/^hb-/)
      expect(r2.id).toMatch(/^hb-/)
      expect(r1.id).not.toBe(r2.id)
    })

    it('rejette une feature sans nom', () => {
      const result = store.create({ ...VALID_FEATURE, name: '' })
      expect(result.success).toBe(false)
      expect(result.errors.some(e => e.includes('name'))).toBe(true)
    })

    it('rejette une feature sans description', () => {
      const result = store.create({ ...VALID_FEATURE, description: '' })
      expect(result.success).toBe(false)
    })

    it('rejette un tier invalide', () => {
      const result = store.create({ ...VALID_FEATURE, tier: 5 })
      expect(result.success).toBe(false)
    })

    it('rejette un thème invalide', () => {
      const result = store.create({ ...VALID_FEATURE, themes: ['alien'] })
      expect(result.success).toBe(false)
    })

    it('persiste en localStorage', () => {
      store.create(VALID_FEATURE)
      expect(store.count).toBe(1)

      // Recréer le store pour vérifier la persistance
      const store2 = useHomebrewCombatFeatureStore()
      expect(store2.count).toBe(1)
      expect(store2.features[0].name).toBe('Coup de pommeau')
    })

    it('ajoute createdAt et updatedAt', () => {
      const result = store.create(VALID_FEATURE)
      const feature = store.getById(result.id)
      expect(feature.createdAt).toBeTruthy()
      expect(feature.updatedAt).toBeTruthy()
    })
  })

  describe('update', () => {
    let featureId

    beforeEach(() => {
      const result = store.create(VALID_FEATURE)
      featureId = result.id
    })

    it('met à jour le nom', () => {
      const result = store.update(featureId, {
        ...VALID_FEATURE,
        name: 'Coup de pommeau amélioré'
      })
      expect(result.success).toBe(true)
      expect(store.getById(featureId).name).toBe('Coup de pommeau amélioré')
    })

    it('préserve createdAt', () => {
      const before = store.getById(featureId).createdAt
      store.update(featureId, { ...VALID_FEATURE, name: 'Modifié' })
      expect(store.getById(featureId).createdAt).toBe(before)
    })

    it('met à jour updatedAt', () => {
      const result = store.update(featureId, { ...VALID_FEATURE, name: 'Modifié' })
      expect(result.success).toBe(true)
      const feature = store.getById(featureId)
      expect(feature.updatedAt).toBeTruthy()
      expect(feature.name).toBe('Modifié')
    })

    it('rejette un ID inexistant', () => {
      const result = store.update('nope', VALID_FEATURE)
      expect(result.success).toBe(false)
    })

    it('force la source à homebrew', () => {
      store.update(featureId, { ...VALID_FEATURE, source: 'adversary' })
      expect(store.getById(featureId).source).toBe('homebrew')
    })
  })

  describe('remove', () => {
    it('supprime une feature existante', () => {
      const { id } = store.create(VALID_FEATURE)
      expect(store.count).toBe(1)
      const result = store.remove(id)
      expect(result.success).toBe(true)
      expect(store.count).toBe(0)
    })

    it('rejette un ID inexistant', () => {
      const result = store.remove('nope')
      expect(result.success).toBe(false)
    })
  })

  describe('duplicate', () => {
    it('duplique une feature avec nom (copie)', () => {
      const { id } = store.create(VALID_FEATURE)
      const dupe = store.duplicate(id)
      expect(dupe.success).toBe(true)
      expect(dupe.id).not.toBe(id)
      expect(store.getById(dupe.id).name).toBe('Coup de pommeau (copie)')
      expect(store.count).toBe(2)
    })

    it('rejette un ID inexistant', () => {
      const result = store.duplicate('nope')
      expect(result.success).toBe(false)
    })
  })

  describe('getById', () => {
    it('retourne la feature par ID', () => {
      const { id } = store.create(VALID_FEATURE)
      const feature = store.getById(id)
      expect(feature).not.toBeNull()
      expect(feature.name).toBe('Coup de pommeau')
    })

    it('retourne null pour un ID inexistant', () => {
      expect(store.getById('nope')).toBeNull()
    })
  })

  // ── Import / Export ──

  describe('Import / Export', () => {
    it('exporte et réimporte des features', () => {
      store.create(VALID_FEATURE)
      store.create({ ...VALID_FEATURE, name: 'Feinte' })
      expect(store.count).toBe(2)

      const json = store.exportFeatures()
      store.clearAll()
      expect(store.count).toBe(0)

      const result = store.importFeatures(json)
      expect(result.success).toBe(true)
      expect(result.imported).toBe(2)
      expect(store.count).toBe(2)
    })

    it('skip les doublons à l\'import', () => {
      store.create(VALID_FEATURE)
      const json = store.exportFeatures()

      const result = store.importFeatures(json)
      expect(result.imported).toBe(0)
      expect(result.skipped).toBe(1)
      expect(store.count).toBe(1)
    })

    it('rejette un JSON invalide', () => {
      const result = store.importFeatures('not json')
      expect(result.success).toBe(false)
    })

    it('rejette un format sans items', () => {
      const result = store.importFeatures('{"data": []}')
      expect(result.success).toBe(false)
    })
  })

  describe('clearAll', () => {
    it('supprime toutes les features', () => {
      store.create(VALID_FEATURE)
      store.create({ ...VALID_FEATURE, name: 'Feinte' })
      expect(store.count).toBe(2)

      store.clearAll()
      expect(store.count).toBe(0)
    })
  })
})
