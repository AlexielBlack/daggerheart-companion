/**
 * @vitest-environment jsdom
 *
 * Tests de la gestion de plusieurs rencontres simultanées (multi-battle).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'

const BUILDER_A = {
  id: 'enc-a',
  name: 'Rencontre A',
  tier: 1,
  adversarySlots: [{ adversaryId: 'acid-burrower', quantity: 1 }],
  environmentId: null,
  selectedPcIds: ['pc-1', 'pc-2']
}

const BUILDER_B = {
  id: 'enc-b',
  name: 'Rencontre B',
  tier: 2,
  adversarySlots: [{ adversaryId: 'bear', quantity: 2 }],
  environmentId: null,
  selectedPcIds: ['pc-1', 'pc-2', 'pc-3']
}

describe('encounterLiveStore — multi-rencontres', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    store = useEncounterLiveStore()
  })

  describe('création de rencontres parallèles', () => {
    it('la première rencontre crée une seule entrée active', () => {
      store.startEncounter(BUILDER_A)
      expect(store.battles).toHaveLength(1)
      expect(store.battleList).toHaveLength(1)
      expect(store.battleList[0].isActive).toBe(true)
      expect(store.battleList[0].name).toBe('Rencontre A')
      expect(store.hasMultipleBattles).toBe(false)
      expect(store.activeBattleId).toBe(store.battles[0].id)
    })

    it('lancer une 2e rencontre ajoute une rencontre parallèle sans écraser la 1re', () => {
      store.startEncounter(BUILDER_A)
      store.startEncounter(BUILDER_B)

      expect(store.battles).toHaveLength(2)
      expect(store.hasMultipleBattles).toBe(true)
      // La rencontre active est la nouvelle (B)
      expect(store.encounterName).toBe('Rencontre B')
      expect(store.encounterTier).toBe(2)
      expect(store.liveAdversaries).toHaveLength(2) // 2 ours
      // La rencontre A est conservée en arrière-plan avec son snapshot
      const bgA = store.battles.find((b) => b.name === 'Rencontre A')
      expect(bgA.snapshot).not.toBeNull()
      expect(bgA.snapshot.liveAdversaries).toHaveLength(1)
    })
  })

  describe('switchToBattle', () => {
    it('bascule entre rencontres en préservant l\'état de combat', () => {
      store.startEncounter(BUILDER_A)
      const idA = store.activeBattleId
      // Inflige des dégâts à l\'adversaire de A
      const advA = store.liveAdversaries[0]
      store.markAdversaryStress(advA.instanceId, 1)
      expect(store.liveAdversaries[0].markedStress).toBe(1)

      // Lance B en parallèle puis revient sur A
      store.startEncounter(BUILDER_B)
      expect(store.encounterName).toBe('Rencontre B')

      store.switchToBattle(idA)
      expect(store.activeBattleId).toBe(idA)
      expect(store.encounterName).toBe('Rencontre A')
      expect(store.liveAdversaries).toHaveLength(1)
      expect(store.liveAdversaries[0].markedStress).toBe(1) // état préservé
    })

    it('switchToBattle vers l\'id actif ne fait rien', () => {
      store.startEncounter(BUILDER_A)
      const id = store.activeBattleId
      store.switchToBattle(id)
      expect(store.activeBattleId).toBe(id)
      expect(store.isActive).toBe(true)
    })

    it('switchToBattle vers un id inconnu ne fait rien', () => {
      store.startEncounter(BUILDER_A)
      store.switchToBattle('inexistant')
      expect(store.encounterName).toBe('Rencontre A')
    })
  })

  describe('closeBattle', () => {
    it('ferme une rencontre en arrière-plan', () => {
      store.startEncounter(BUILDER_A)
      const idA = store.activeBattleId
      store.startEncounter(BUILDER_B) // B active, A en fond
      store.closeBattle(idA)
      expect(store.battles).toHaveLength(1)
      expect(store.encounterName).toBe('Rencontre B') // active inchangée
      expect(store.isActive).toBe(true)
    })

    it('fermer la rencontre active bascule vers une autre', () => {
      store.startEncounter(BUILDER_A)
      store.startEncounter(BUILDER_B)
      const idB = store.activeBattleId
      store.closeBattle(idB)
      expect(store.battles).toHaveLength(1)
      expect(store.encounterName).toBe('Rencontre A')
      expect(store.isActive).toBe(true)
    })

    it('fermer la dernière rencontre réinitialise tout', () => {
      store.startEncounter(BUILDER_A)
      store.closeBattle(store.activeBattleId)
      expect(store.isActive).toBe(false)
      expect(store.battles).toHaveLength(0)
      expect(store.liveAdversaries).toHaveLength(0)
    })
  })

  describe('endEncounter multi-rencontres', () => {
    it('termine la rencontre active et bascule vers la suivante', () => {
      store.startEncounter(BUILDER_A)
      store.startEncounter(BUILDER_B) // B active
      store.endEncounter()
      // Il restait A → on reste actif sur A
      expect(store.isActive).toBe(true)
      expect(store.battles).toHaveLength(1)
      expect(store.encounterName).toBe('Rencontre A')
    })

    it('termine la dernière rencontre = réinitialisation complète', () => {
      store.startEncounter(BUILDER_A)
      store.endEncounter()
      expect(store.isActive).toBe(false)
      expect(store.battles).toHaveLength(0)
    })
  })

  describe('renameBattle', () => {
    it('renomme la rencontre active et met à jour encounterName', () => {
      store.startEncounter(BUILDER_A)
      store.renameBattle(store.activeBattleId, 'Embuscade')
      expect(store.battleList[0].name).toBe('Embuscade')
      expect(store.encounterName).toBe('Embuscade')
    })
  })

  describe('battleList — compteurs', () => {
    it('reflète les adversaires actifs et vaincus', () => {
      store.startEncounter(BUILDER_B) // 2 ours
      const inst = store.liveAdversaries[0]
      store.defeatAdversary(inst.instanceId)
      const entry = store.battleList[0]
      expect(entry.activeCount).toBe(1)
      expect(entry.defeatedCount).toBe(1)
    })
  })

  describe('persistance multi-rencontres', () => {
    it('restaure plusieurs rencontres après un refresh', () => {
      vi.useFakeTimers()
      store.startEncounter(BUILDER_A)
      store.startEncounter(BUILDER_B)
      vi.advanceTimersByTime(500) // flush debounce

      // Simule un refresh
      setActivePinia(createPinia())
      const fresh = useEncounterLiveStore()
      const restored = fresh.restoreState()

      expect(restored).toBe(true)
      expect(fresh.battles).toHaveLength(2)
      expect(fresh.encounterName).toBe('Rencontre B') // active = la dernière
      // On peut rebasculer sur A et retrouver son adversaire
      const idA = fresh.battles.find((b) => b.name === 'Rencontre A').id
      fresh.switchToBattle(idA)
      expect(fresh.liveAdversaries).toHaveLength(1)
      vi.useRealTimers()
    })

    it('migre une sauvegarde héritée (mono-rencontre) en une rencontre unique', () => {
      vi.useFakeTimers()
      store.startEncounter(BUILDER_A)
      vi.advanceTimersByTime(500)
      // Simule l\'absence de la collection (ancienne version)
      localStorage.removeItem('dh-encounter-battles')

      setActivePinia(createPinia())
      const fresh = useEncounterLiveStore()
      const restored = fresh.restoreState()

      expect(restored).toBe(true)
      expect(fresh.battles).toHaveLength(1)
      expect(fresh.battleList[0].isActive).toBe(true)
      expect(fresh.encounterName).toBe('Rencontre A')
      vi.useRealTimers()
    })
  })
})
