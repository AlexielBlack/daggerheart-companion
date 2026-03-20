import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useCombatLog } from '../useCombatLog'

describe('nouvelles fonctions de log enrichies', () => {
  function makeLog () {
    const combatLog = ref([])
    const encounterLog = ref([])
    const pcDownStatus = ref({})
    const pcConditions = ref({})
    const pushUndo = () => {}
    const persistState = () => {}
    return {
      ...useCombatLog({ combatLog, encounterLog, pcDownStatus, pcConditions, pushUndo, persistState }),
      combatLog,
      encounterLog
    }
  }

  it('logActionEntry crée une entrée avec actionId et actorId', () => {
    const { logActionEntry, combatLog } = makeLog()

    logActionEntry({
      action: 'damage',
      instanceId: 'goblin_0',
      advName: 'Gobelin',
      type: 'hp',
      amount: 3,
      actionId: 'act_123_1',
      actorId: 'kael',
      actorName: 'Kael'
    })

    expect(combatLog.value[0]).toMatchObject({
      action: 'damage',
      actionId: 'act_123_1',
      actorId: 'kael',
      actorName: 'Kael',
      amount: 3
    })
    expect(combatLog.value[0].timestamp).toBeDefined()
  })

  it('logActionEntry supporte les nouveaux types heal_hp, hope_change, down', () => {
    const { logActionEntry, combatLog } = makeLog()

    logActionEntry({ action: 'heal_hp', pcId: 'lyra', pcName: 'Lyra', amount: 2 })
    logActionEntry({ action: 'hope_change', pcId: 'kael', pcName: 'Kael', amount: 1 })
    logActionEntry({ action: 'down', instanceId: 'troll_0', advName: 'Troll' })

    expect(combatLog.value).toHaveLength(3)
    expect(combatLog.value[0].action).toBe('heal_hp')
    expect(combatLog.value[1].action).toBe('hope_change')
    expect(combatLog.value[2].action).toBe('down')
  })

  it('logActionEntry push dans combatLog ET encounterLog', () => {
    const { logActionEntry, combatLog, encounterLog } = makeLog()

    logActionEntry({ action: 'damage', amount: 1 })

    expect(combatLog.value).toHaveLength(1)
    expect(encounterLog.value).toHaveLength(1)
  })
})
