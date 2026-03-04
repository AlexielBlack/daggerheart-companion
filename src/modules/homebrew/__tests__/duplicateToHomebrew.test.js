import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

/* ── Stubs ── */
const routerPushMock = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: routerPushMock })
}))

/* ── Stores homebrew ── */
import { useAdversaryHomebrewStore } from '@modules/homebrew/categories/adversary/useAdversaryHomebrewStore.js'
import { useAncestryHomebrewStore } from '@modules/homebrew/categories/ancestry/useAncestryHomebrewStore.js'
import { useClassHomebrewStore } from '@modules/homebrew/categories/class/useClassHomebrewStore.js'
import { useCommunityHomebrewStore } from '@modules/homebrew/categories/community/useCommunityHomebrewStore.js'
import { useDomainHomebrewStore } from '@modules/homebrew/categories/domain/useDomainHomebrewStore.js'
import { useEnvironmentHomebrewStore } from '@modules/homebrew/categories/environment/useEnvironmentHomebrewStore.js'
import { useEquipmentHomebrewStore } from '@modules/homebrew/categories/equipment/useEquipmentHomebrewStore.js'

describe('createFromTemplate — integration stores homebrew', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    routerPushMock.mockClear()
  })

  const storeConfigs = [
    {
      label: 'Adversaire',
      useStore: useAdversaryHomebrewStore,
      data: { name: 'Gobelin', tier: 1, difficulty: 8, hp: 3, stress: 1, type: 'Minion' }
    },
    {
      label: 'Ancestralite',
      useStore: useAncestryHomebrewStore,
      data: { name: 'Humain', description: 'Versatile', topFeature: { name: 'Adapt', description: 'Bonus' }, bottomFeature: { name: 'Endure', description: 'Resist' } }
    },
    {
      label: 'Classe',
      useStore: useClassHomebrewStore,
      data: { name: 'Guerrier', domains: ['Blade', 'Bone'], baseHP: 6, baseEvasion: 10, hopeFeature: 'Rage', classFeatures: ['Strike'] }
    },
    {
      label: 'Communaute',
      useStore: useCommunityHomebrewStore,
      data: { name: 'Guilde Marchande', description: 'Commerce', feature: { name: 'Negocier', description: 'Avantage commerce' }, adjectives: ['ruse', 'calculateur'] }
    },
    {
      label: 'Domaine',
      useStore: useDomainHomebrewStore,
      data: { name: 'Lame', description: 'Le domaine des armes' }
    },
    {
      label: 'Environnement',
      useStore: useEnvironmentHomebrewStore,
      data: { name: 'Foret Sombre', tier: 1, difficulty: 10, hp: 4, stress: 2, type: 'Standard' }
    },
    {
      label: 'Equipement',
      useStore: useEquipmentHomebrewStore,
      data: { name: 'Epee Longue', category: 'primary', trait: 'Slash', damage: 'd8', damageType: 'phy' }
    }
  ]

  storeConfigs.forEach(({ label, useStore, data }) => {
    describe(label, () => {
      it('cree un item homebrew a partir de donnees SRD', () => {
        const store = useStore()
        const srdData = { ...data, id: 'srd-123', source: 'srd' }

        const result = store.createFromTemplate(srdData)

        expect(result.success).toBe(true)
        expect(result.item.name).toContain('(copie)')
        expect(result.item.source).toBe('custom')
        expect(result.item.id).not.toBe('srd-123')
      })

      it('conserve les donnees utiles apres copie', () => {
        const store = useStore()
        const result = store.createFromTemplate(data)

        expect(result.success).toBe(true)
        // Le nom est prefixe (copie)
        const expectedName = `${data.name} (copie)`
        expect(result.item.name).toBe(expectedName)
      })

      it('incremente le compteur du store', () => {
        const store = useStore()
        expect(store.count).toBe(0)

        store.createFromTemplate(data)
        expect(store.count).toBe(1)

        store.createFromTemplate(data)
        expect(store.count).toBe(2)
      })
    })
  })
})
