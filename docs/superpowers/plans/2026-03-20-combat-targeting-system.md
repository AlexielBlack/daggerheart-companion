# Système de ciblage combat (Action Bar) — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un bandeau flottant (Action Bar) pour unifier le flux Acteur→Effet→Cibles→Montant→Confirmer, avec support AoE multi-cibles et montants différenciés.

**Architecture:** Nouveau composable singleton `useActionBar` (état module-level) + composant `ActionBar.vue`, intégrés au `encounterLiveStore` existant. Les fonctions store existantes reçoivent un paramètre `{ skipUndo, skipLog }` pour permettre un undo groupé et un logging centralisé dans `applyAction`.

**Tech Stack:** Vue 3 (Options API composants, Composition API stores/composables), Pinia, Vitest

**Spec:** `docs/superpowers/specs/2026-03-20-combat-targeting-system-design.md`

---

## Structure de fichiers

| Action | Fichier | Responsabilité |
|--------|---------|---------------|
| Créer | `src/modules/encounter/composables/useActionBar.js` | Logique du bandeau : état, cibles, validation, dispatch |
| Créer | `src/modules/encounter/components/ActionBar.vue` | UI du bandeau flottant (3 états progressifs) |
| Créer | `src/data/encounters/actionEffects.js` | Constantes ACTION_EFFECTS enum + métadonnées par effet |
| Créer | `src/modules/encounter/composables/__tests__/useActionBar.test.js` | Tests du composable |
| Créer | `src/modules/encounter/components/__tests__/ActionBar.test.js` | Tests du composant |
| Modifier | `src/modules/encounter/stores/encounterLiveStore.js` | Ajouter `skipUndo`/`skipLog` aux fonctions existantes, exposer `pushUndo` |
| Modifier | `src/modules/encounter/composables/useCombatLog.js` | Ajouter `skipUndo`/`skipLog` à toggleCondition, ajouter fonctions de log enrichies |
| Modifier | `src/modules/encounter/components/PcSidebarCard.vue` | Click conditionnel en mode ciblage |
| Modifier | `src/modules/encounter/components/AdversaryTargetPanel.vue` | Click conditionnel en mode ciblage |
| Modifier | `src/modules/encounter/components/ContextPanel.vue` | Bouton "⚡ Action" |
| Modifier | `src/modules/encounter/views/EncounterLive.vue` | Monter `<ActionBar />`, padding-bottom dynamique |

---

## Task 1 : Constantes et enum des effets

**Files:**
- Create: `src/data/encounters/actionEffects.js`

- [ ] **Step 1: Créer le fichier de constantes**

```js
// src/data/encounters/actionEffects.js

export const ACTION_EFFECTS = {
  DAMAGE_HP: 'damage_hp',
  DAMAGE_STRESS: 'damage_stress',
  HEAL_HP: 'heal_hp',
  HEAL_STRESS: 'heal_stress',
  CONDITION: 'condition',
  HOPE: 'hope',
  DOWN: 'down',
  MISS: 'miss'
}

export const ACTION_EFFECT_META = {
  [ACTION_EFFECTS.DAMAGE_HP]: {
    label: 'Dégâts HP',
    emoji: '⚔️',
    hasAmount: true,
    targetTypes: ['adversary', 'pc']
  },
  [ACTION_EFFECTS.DAMAGE_STRESS]: {
    label: 'Dégâts Stress',
    emoji: '💔',
    hasAmount: true,
    targetTypes: ['adversary', 'pc']
  },
  [ACTION_EFFECTS.HEAL_HP]: {
    label: 'Soin HP',
    emoji: '💚',
    hasAmount: true,
    targetTypes: ['pc', 'adversary']
  },
  [ACTION_EFFECTS.HEAL_STRESS]: {
    label: 'Soin Stress',
    emoji: '🩹',
    hasAmount: true,
    targetTypes: ['pc', 'adversary']
  },
  [ACTION_EFFECTS.CONDITION]: {
    label: 'Condition',
    emoji: '⚡',
    hasAmount: false,
    targetTypes: ['adversary', 'pc']
  },
  [ACTION_EFFECTS.HOPE]: {
    label: 'Espoir',
    emoji: '✨',
    hasAmount: true,
    targetTypes: ['pc']
  },
  [ACTION_EFFECTS.DOWN]: {
    label: 'À Terre',
    emoji: '💀',
    hasAmount: false,
    targetTypes: ['adversary', 'pc']
  },
  [ACTION_EFFECTS.MISS]: {
    label: 'Raté',
    emoji: '❌',
    hasAmount: false,
    targetTypes: []
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/data/encounters/actionEffects.js
git commit -m "feat(combat): ajouter constantes ACTION_EFFECTS pour le système de ciblage"
```

---

## Task 2 : Ajouter `{ skipUndo, skipLog }` aux fonctions store et composables

**Files:**
- Modify: `src/modules/encounter/stores/encounterLiveStore.js` (lines 559, 599, 608, 639, 663, 680)
- Modify: `src/modules/encounter/composables/useCombatLog.js` (lines 40, 77 — toggleAdversaryCondition, togglePcCondition)

- [ ] **Step 1: Écrire le test pour skipUndo/skipLog**

```js
// src/modules/encounter/stores/__tests__/encounterLiveStore.skipUndo.test.js

import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEncounterLiveStore } from '../encounterLiveStore'

describe('skipUndo/skipLog parameter', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useEncounterLiveStore()
    store.liveAdversaries = [{
      instanceId: 'goblin_0',
      adversaryId: 'goblin',
      name: 'Gobelin',
      type: 'Standard',
      tier: 1,
      maxHP: 5,
      maxStress: 3,
      markedHP: 0,
      markedStress: 0,
      conditions: [],
      isDefeated: false,
      difficulty: 10,
      thresholds: { major: 3, severe: 5 }
    }]
    store.isActive = true
  })

  it('markAdversaryHP avec skipUndo ne push pas dans le undo stack', () => {
    const undoBefore = store.undoStack.length
    store.markAdversaryHP('goblin_0', 1, { skipUndo: true })
    expect(store.undoStack.length).toBe(undoBefore)
    expect(store.liveAdversaries[0].markedHP).toBe(1)
  })

  it('markAdversaryHP avec skipLog ne log pas dans combatLog', () => {
    const logBefore = store.combatLog.length
    store.markAdversaryHP('goblin_0', 1, { skipLog: true })
    expect(store.combatLog.length).toBe(logBefore)
    expect(store.liveAdversaries[0].markedHP).toBe(1)
  })

  it('markAdversaryHP sans options conserve le comportement existant', () => {
    const undoBefore = store.undoStack.length
    store.markAdversaryHP('goblin_0', 1)
    expect(store.undoStack.length).toBe(undoBefore + 1)
  })

  it('clearAdversaryHP avec skipUndo ne push pas', () => {
    store.liveAdversaries[0].markedHP = 3
    const undoBefore = store.undoStack.length
    store.clearAdversaryHP('goblin_0', 1, { skipUndo: true })
    expect(store.undoStack.length).toBe(undoBefore)
    expect(store.liveAdversaries[0].markedHP).toBe(2)
  })

  it('markAdversaryStress avec skipUndo ne push pas', () => {
    const undoBefore = store.undoStack.length
    store.markAdversaryStress('goblin_0', 1, { skipUndo: true })
    expect(store.undoStack.length).toBe(undoBefore)
  })

  it('clearAdversaryStress avec skipUndo ne push pas', () => {
    store.liveAdversaries[0].markedStress = 2
    const undoBefore = store.undoStack.length
    store.clearAdversaryStress('goblin_0', 1, { skipUndo: true })
    expect(store.undoStack.length).toBe(undoBefore)
  })

  it('defeatAdversary avec skipUndo ne push pas', () => {
    const undoBefore = store.undoStack.length
    store.defeatAdversary('goblin_0', { skipUndo: true })
    expect(store.undoStack.length).toBe(undoBefore)
    expect(store.liveAdversaries[0].isDefeated).toBe(true)
  })

  it('toggleAdversaryCondition avec skipUndo ne push pas', () => {
    const undoBefore = store.undoStack.length
    store.toggleAdversaryCondition('goblin_0', 'vulnerable', { skipUndo: true })
    expect(store.undoStack.length).toBe(undoBefore)
    expect(store.liveAdversaries[0].conditions).toContain('vulnerable')
  })
})
```

- [ ] **Step 2: Lancer le test, vérifier qu'il échoue**

Run: `npx vitest run src/modules/encounter/stores/__tests__/encounterLiveStore.skipUndo.test.js`
Expected: FAIL

- [ ] **Step 3: Modifier les fonctions dans encounterLiveStore.js**

Pour chaque fonction, ajouter un paramètre `options` avec `{ skipUndo, skipLog }` :

```js
// Pattern appliqué à chaque fonction :
// AVANT:
function markAdversaryHP(instanceId, amount = 1)
// APRÈS:
function markAdversaryHP(instanceId, amount = 1, { skipUndo = false, skipLog = false } = {})

// Conditionner le pushUndo et le logging :
if (!skipUndo) pushUndo('+' + amount + ' HP ' + advShortName(instanceId))
// ... mutation ...
if (!skipLog) { combatLog.value.push(...); encounterLog.value.push(...) }
```

Appliquer le même pattern à :
- `markAdversaryHP` (ligne 559)
- `clearAdversaryHP` (ligne 599)
- `markAdversaryStress` (ligne 608)
- `clearAdversaryStress` (ligne 639)
- `defeatAdversary` (ligne 663) : `function defeatAdversary(instanceId, { skipUndo = false, skipLog = false } = {})`
- `reviveAdversary` (ligne 680) : `function reviveAdversary(instanceId, { skipUndo = false, skipLog = false } = {})`

**Exposer `pushUndo` dans le return du store** (ligne ~1082) :
```js
// Ajouter à l'objet return :
pushUndo,
```

- [ ] **Step 4: Modifier useCombatLog.js pour skipUndo sur les conditions**

Les fonctions `toggleAdversaryCondition` (ligne 40) et `togglePcCondition` (ligne 77) appellent `pushUndo()` en interne. Ajouter le même pattern :

```js
// AVANT:
function toggleAdversaryCondition(instanceId, condition) {
  pushUndo(...)
// APRÈS:
function toggleAdversaryCondition(instanceId, condition, { skipUndo = false } = {}) {
  if (!skipUndo) pushUndo(...)
```

Idem pour `togglePcCondition`.

- [ ] **Step 5: Lancer le test, vérifier qu'il passe**

Run: `npx vitest run src/modules/encounter/stores/__tests__/encounterLiveStore.skipUndo.test.js`
Expected: PASS

- [ ] **Step 6: Vérifier non-régression**

Run: `npx vitest run src/modules/encounter/`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/modules/encounter/stores/encounterLiveStore.js src/modules/encounter/composables/useCombatLog.js src/modules/encounter/stores/__tests__/encounterLiveStore.skipUndo.test.js
git commit -m "feat(combat): ajouter skipUndo/skipLog aux fonctions de mutation, exposer pushUndo"
```

---

## Task 3 : Ajouter fonctions de log enrichies dans useCombatLog

**Files:**
- Modify: `src/modules/encounter/composables/useCombatLog.js`
- Create: `src/modules/encounter/composables/__tests__/useCombatLog.actionId.test.js`

**Contexte :** Le logging de dégâts se fait actuellement inline dans les fonctions store (`markAdversaryHP`, etc.). Il n'existe pas de `logDamage()`. Puisque `applyAction` appelle ces fonctions avec `{ skipLog: true }`, il doit ensuite logger lui-même via de nouvelles fonctions dédiées dans useCombatLog.

- [ ] **Step 1: Écrire le test**

```js
// src/modules/encounter/composables/__tests__/useCombatLog.actionId.test.js

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
})
```

- [ ] **Step 2: Lancer le test, vérifier l'échec**

Run: `npx vitest run src/modules/encounter/composables/__tests__/useCombatLog.actionId.test.js`
Expected: FAIL (logActionEntry n'existe pas)

- [ ] **Step 3: Ajouter `logActionEntry` dans useCombatLog.js**

Ajouter une fonction générique qui accepte tous les champs et les push dans combatLog + encounterLog :

```js
function logActionEntry (entry) {
  const logEntry = {
    ...entry,
    timestamp: Date.now()
  }
  combatLog.value.push(logEntry)
  encounterLog.value.push(logEntry)
  persistState()
}
```

Ajouter `logActionEntry` au return du composable.

- [ ] **Step 4: Lancer le test, vérifier le pass**

Run: `npx vitest run src/modules/encounter/composables/__tests__/useCombatLog.actionId.test.js`
Expected: PASS

- [ ] **Step 5: Vérifier non-régression**

Run: `npx vitest run src/modules/encounter/`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/modules/encounter/composables/useCombatLog.js src/modules/encounter/composables/__tests__/useCombatLog.actionId.test.js
git commit -m "feat(combat): ajouter logActionEntry enrichi avec actionId/actorId"
```

---

## Task 4 : Composable useActionBar

**Files:**
- Create: `src/modules/encounter/composables/useActionBar.js`
- Create: `src/modules/encounter/composables/__tests__/useActionBar.test.js`

- [ ] **Step 1: Écrire les tests**

```js
// src/modules/encounter/composables/__tests__/useActionBar.test.js

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, nextTick } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { useActionBar } from '../useActionBar'
import { ACTION_EFFECTS } from '@data/encounters/actionEffects'

// Mock encounterLiveStore
vi.mock('../../stores/encounterLiveStore', () => ({
  useEncounterLiveStore: () => ({
    activePcId: ref('kael'),
    activeAdversaryId: ref(null),
    spotlight: ref('pc'),
    liveAdversaries: ref([
      { instanceId: 'goblin_0', name: 'Gobelin A', isDefeated: false },
      { instanceId: 'goblin_1', name: 'Gobelin B', isDefeated: false },
      { instanceId: 'troll_0', name: 'Troll', isDefeated: true }
    ]),
    participantPcs: ref([
      { id: 'kael', name: 'Kael' },
      { id: 'lyra', name: 'Lyra' }
    ]),
    pcDownStatus: ref({}),
    combatLog: ref([]),
    markAdversaryHP: vi.fn(),
    clearAdversaryHP: vi.fn(),
    markAdversaryStress: vi.fn(),
    clearAdversaryStress: vi.fn(),
    defeatAdversary: vi.fn(),
    reviveAdversary: vi.fn(),
    pushUndo: vi.fn(),
    toggleAdversaryCondition: vi.fn(),
    togglePcCondition: vi.fn(),
    logActionEntry: vi.fn()
  })
}))

describe('useActionBar', () => {
  let bar

  beforeEach(() => {
    setActivePinia(createPinia())
    bar = useActionBar()
  })

  it('est fermé par défaut', () => {
    expect(bar.isOpen.value).toBe(false)
    expect(bar.pendingAction.value).toBeNull()
  })

  it('openAction initialise avec l acteur spotlight', () => {
    bar.openAction()
    expect(bar.isOpen.value).toBe(true)
    expect(bar.pendingAction.value.actorId).toBe('kael')
    expect(bar.pendingAction.value.actorType).toBe('pc')
  })

  it('setEffect change l effet', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    expect(bar.pendingAction.value.effect).toBe('damage_hp')
  })

  it('toggleTarget ajoute et retire une cible', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    expect(bar.pendingAction.value.targets).toHaveLength(1)
    bar.toggleTarget('goblin_0', 'adversary')
    expect(bar.pendingAction.value.targets).toHaveLength(0)
  })

  it('selectAllAdversaries sélectionne tous les non-vaincus', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.selectAllAdversaries()
    expect(bar.pendingAction.value.targets).toHaveLength(2)
    expect(bar.pendingAction.value.targets.map(t => t.id)).toEqual(['goblin_0', 'goblin_1'])
  })

  it('setDefaultAmount change le montant de toutes les cibles', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    bar.toggleTarget('goblin_1', 'adversary')
    bar.setDefaultAmount(5)
    expect(bar.pendingAction.value.targets[0].amount).toBe(5)
    expect(bar.pendingAction.value.targets[1].amount).toBe(5)
  })

  it('setTargetAmount override le montant d une seule cible', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    bar.toggleTarget('goblin_1', 'adversary')
    bar.setDefaultAmount(3)
    bar.setTargetAmount('goblin_1', 1)
    expect(bar.pendingAction.value.targets[0].amount).toBe(3)
    expect(bar.pendingAction.value.targets[1].amount).toBe(1)
  })

  it('cancelAction remet tout à null', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.cancelAction()
    expect(bar.isOpen.value).toBe(false)
    expect(bar.pendingAction.value).toBeNull()
  })

  it('canApply est false sans cible', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    expect(bar.canApply.value).toBe(false)
  })

  it('canApply est true avec au moins une cible', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    expect(bar.canApply.value).toBe(true)
  })

  it('canApply est true pour miss sans cible', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.MISS)
    expect(bar.canApply.value).toBe(true)
  })

  it('isTargetSelected retourne true si la cible est sélectionnée', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    expect(bar.isTargetSelected('goblin_0')).toBe(true)
    expect(bar.isTargetSelected('goblin_1')).toBe(false)
  })
})
```

- [ ] **Step 2: Lancer les tests, vérifier l'échec**

Run: `npx vitest run src/modules/encounter/composables/__tests__/useActionBar.test.js`
Expected: FAIL (module n'existe pas)

- [ ] **Step 3: Implémenter useActionBar.js**

```js
// src/modules/encounter/composables/useActionBar.js

import { ref, computed } from 'vue'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import { ACTION_EFFECTS, ACTION_EFFECT_META } from '@data/encounters/actionEffects'

// État module-level = singleton partagé entre tous les consommateurs
const pendingAction = ref(null)
let actionCounter = 0

export function useActionBar () {
  const store = useEncounterLiveStore()

  const isOpen = computed(() => pendingAction.value !== null)

  const hasTargets = computed(() =>
    pendingAction.value?.targets?.length > 0
  )

  const canApply = computed(() => {
    if (!pendingAction.value?.effect) return false
    if (pendingAction.value.effect === ACTION_EFFECTS.MISS) return true
    return hasTargets.value
  })

  function openAction () {
    const isPC = store.spotlight === 'pc'
    pendingAction.value = {
      actorId: isPC ? store.activePcId : store.activeAdversaryId,
      actorType: isPC ? 'pc' : 'adversary',
      effect: null,
      condition: null,
      targets: [],
      defaultAmount: 1
    }
  }

  function setEffect (effect) {
    if (!pendingAction.value) return
    pendingAction.value.effect = effect
    pendingAction.value.condition = null
    pendingAction.value.targets = []
  }

  function setCondition (conditionId) {
    if (!pendingAction.value) return
    pendingAction.value.condition = conditionId
  }

  function toggleTarget (id, type) {
    if (!pendingAction.value) return
    const targets = pendingAction.value.targets
    const idx = targets.findIndex(t => t.id === id)
    if (idx >= 0) {
      targets.splice(idx, 1)
    } else {
      targets.push({ id, type, amount: pendingAction.value.defaultAmount })
    }
  }

  function selectAllPcs () {
    if (!pendingAction.value) return
    const pcDown = store.pcDownStatus || {}
    pendingAction.value.targets = store.participantPcs
      .filter(pc => !pcDown[pc.id])
      .map(pc => ({ id: pc.id, type: 'pc', amount: pendingAction.value.defaultAmount }))
  }

  function selectAllAdversaries () {
    if (!pendingAction.value) return
    pendingAction.value.targets = store.liveAdversaries
      .filter(a => !a.isDefeated)
      .map(a => ({ id: a.instanceId, type: 'adversary', amount: pendingAction.value.defaultAmount }))
  }

  function selectSelf () {
    if (!pendingAction.value) return
    const { actorId, actorType } = pendingAction.value
    pendingAction.value.targets = [{ id: actorId, type: actorType, amount: pendingAction.value.defaultAmount }]
  }

  function setDefaultAmount (n) {
    if (!pendingAction.value) return
    pendingAction.value.defaultAmount = n
    pendingAction.value.targets.forEach(t => { t.amount = n })
  }

  function setTargetAmount (id, n) {
    if (!pendingAction.value) return
    const target = pendingAction.value.targets.find(t => t.id === id)
    if (target) target.amount = n
  }

  function generateActionId () {
    actionCounter++
    return `act_${Date.now()}_${actionCounter}`
  }

  function isTargetSelected (id) {
    if (!pendingAction.value) return false
    return pendingAction.value.targets.some(t => t.id === id)
  }

  function getActorName () {
    const { actorId, actorType } = pendingAction.value
    if (actorType === 'pc') {
      const pc = store.participantPcs.find(p => p.id === actorId)
      return pc?.name || actorId
    }
    const adv = store.liveAdversaries.find(a => a.instanceId === actorId)
    return adv?.name || actorId
  }

  function cancelAction () {
    pendingAction.value = null
  }

  return {
    pendingAction,
    isOpen,
    hasTargets,
    canApply,
    openAction,
    setEffect,
    setCondition,
    toggleTarget,
    selectAllPcs,
    selectAllAdversaries,
    selectSelf,
    setDefaultAmount,
    setTargetAmount,
    isTargetSelected,
    generateActionId,
    getActorName,
    cancelAction
  }
}

// Export pour les tests : reset du singleton
export function _resetActionBar () {
  pendingAction.value = null
  actionCounter = 0
}
```

**Note importante :** `pendingAction` est défini au niveau module (hors de la fonction) pour que tous les composants appelant `useActionBar()` partagent le même état. C'est le pattern singleton Vue. Un `_resetActionBar()` est exporté pour les tests.

- [ ] **Step 4: Lancer les tests, vérifier qu'ils passent**

Run: `npx vitest run src/modules/encounter/composables/__tests__/useActionBar.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/encounter/composables/useActionBar.js src/modules/encounter/composables/__tests__/useActionBar.test.js
git commit -m "feat(combat): composable useActionBar — logique du bandeau de ciblage"
```

---

## Task 5 : Dispatch applyAction dans useActionBar

**Files:**
- Modify: `src/modules/encounter/composables/useActionBar.js`
- Modify: `src/modules/encounter/composables/__tests__/useActionBar.test.js`

- [ ] **Step 1: Écrire les tests pour applyAction**

Ajouter au fichier de test existant :

```js
describe('applyAction dispatch', () => {
  let bar, store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useEncounterLiveStore()
    bar = useActionBar()
  })

  it('damage_hp sur adversaire appelle markAdversaryHP avec skipUndo', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    bar.setDefaultAmount(3)
    bar.applyAction()

    expect(store.pushUndo).toHaveBeenCalledTimes(1)
    expect(store.markAdversaryHP).toHaveBeenCalledWith('goblin_0', 3, { skipUndo: true })
    expect(bar.isOpen.value).toBe(false)
  })

  it('damage_hp AoE multi-cibles appelle markAdversaryHP pour chaque cible', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('goblin_0', 'adversary')
    bar.toggleTarget('goblin_1', 'adversary')
    bar.setDefaultAmount(2)
    bar.applyAction()

    expect(store.pushUndo).toHaveBeenCalledTimes(1)
    expect(store.markAdversaryHP).toHaveBeenCalledTimes(2)
    expect(store.markAdversaryHP).toHaveBeenCalledWith('goblin_0', 2, { skipUndo: true })
    expect(store.markAdversaryHP).toHaveBeenCalledWith('goblin_1', 2, { skipUndo: true })
  })

  it('miss log directement et ferme le bandeau', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.MISS)
    bar.applyAction()

    expect(bar.isOpen.value).toBe(false)
    // Le log miss est vérifié via l'intégration avec useCombatLog
  })

  it('condition sur adversaire appelle toggleAdversaryCondition', () => {
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.CONDITION)
    bar.setCondition('vulnerable')
    bar.toggleTarget('goblin_0', 'adversary')
    bar.applyAction()

    expect(store.toggleAdversaryCondition).toHaveBeenCalledWith('goblin_0', 'vulnerable', { skipUndo: true })
  })
})
```

- [ ] **Step 2: Lancer les tests, vérifier l'échec**

Run: `npx vitest run src/modules/encounter/composables/__tests__/useActionBar.test.js`
Expected: FAIL (applyAction n'existe pas encore)

- [ ] **Step 3: Implémenter applyAction dans useActionBar.js**

Ajouter dans le composable, avant le `return` :

```js
function applyAction () {
  if (!pendingAction.value || !canApply.value) return

  const { effect, condition, targets, actorId, actorType } = pendingAction.value
  const actionId = generateActionId()
  const actorName = getActorName()

  // Un seul pushUndo avant toutes les mutations
  if (effect !== ACTION_EFFECTS.MISS) {
    store.pushUndo(`Action: ${ACTION_EFFECT_META[effect]?.label || effect}`)
  }

  // skipUndo + skipLog : les mutations store ne font ni undo ni log
  // Le logging est centralisé ici via logActionEntry
  const skipOpt = { skipUndo: true, skipLog: true }
  const logCtx = { actionId, actorId, actorName }

  switch (effect) {
    case ACTION_EFFECTS.DAMAGE_HP:
      for (const t of targets) {
        if (t.type === 'adversary') {
          store.markAdversaryHP(t.id, t.amount, skipOpt)
          const adv = store.liveAdversaries.find(a => a.instanceId === t.id)
          store.logActionEntry({ ...logCtx, action: 'damage', instanceId: t.id, advName: adv?.name, type: 'hp', amount: t.amount })
        }
        // PJ: implémenté en Task 7
      }
      break

    case ACTION_EFFECTS.DAMAGE_STRESS:
      for (const t of targets) {
        if (t.type === 'adversary') {
          store.markAdversaryStress(t.id, t.amount, skipOpt)
          const adv = store.liveAdversaries.find(a => a.instanceId === t.id)
          store.logActionEntry({ ...logCtx, action: 'damage', instanceId: t.id, advName: adv?.name, type: 'stress', amount: t.amount })
        }
      }
      break

    case ACTION_EFFECTS.HEAL_HP:
      for (const t of targets) {
        if (t.type === 'adversary') {
          store.clearAdversaryHP(t.id, t.amount, skipOpt)
          const adv = store.liveAdversaries.find(a => a.instanceId === t.id)
          store.logActionEntry({ ...logCtx, action: 'heal_hp', instanceId: t.id, advName: adv?.name, amount: t.amount })
        }
      }
      break

    case ACTION_EFFECTS.HEAL_STRESS:
      for (const t of targets) {
        if (t.type === 'adversary') {
          store.clearAdversaryStress(t.id, t.amount, skipOpt)
          const adv = store.liveAdversaries.find(a => a.instanceId === t.id)
          store.logActionEntry({ ...logCtx, action: 'heal_stress', instanceId: t.id, advName: adv?.name, amount: t.amount })
        }
      }
      break

    case ACTION_EFFECTS.CONDITION:
      for (const t of targets) {
        if (t.type === 'adversary') {
          store.toggleAdversaryCondition(t.id, condition, { skipUndo: true })
        } else {
          store.togglePcCondition(t.id, condition, { skipUndo: true })
        }
        store.logActionEntry({ ...logCtx, action: 'condition_add', instanceId: t.type === 'adversary' ? t.id : undefined, pcId: t.type === 'pc' ? t.id : undefined, condition })
      }
      break

    case ACTION_EFFECTS.DOWN:
      for (const t of targets) {
        if (t.type === 'adversary') {
          const adv = store.liveAdversaries.find(a => a.instanceId === t.id)
          if (adv?.isDefeated) {
            store.reviveAdversary(t.id, { skipUndo: true, skipLog: true })
          } else {
            store.defeatAdversary(t.id, { skipUndo: true, skipLog: true })
          }
          store.logActionEntry({ ...logCtx, action: 'down', instanceId: t.id, advName: adv?.name })
        }
        // PJ: implémenté en Task 7
      }
      break

    case ACTION_EFFECTS.HOPE:
      // Per-PJ hope via characterStore — implémenté en Task 7
      break

    case ACTION_EFFECTS.MISS:
      store.logActionEntry({ ...logCtx, action: 'miss' })
      break
  }

  cancelAction()
}
```

Ajouter `applyAction` au `return` du composable.

**Note :** `store.logActionEntry` est la nouvelle fonction ajoutée dans Task 3 à useCombatLog, qui est exposée via le store.

- [ ] **Step 4: Lancer les tests, vérifier qu'ils passent**

Run: `npx vitest run src/modules/encounter/composables/__tests__/useActionBar.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/encounter/composables/useActionBar.js src/modules/encounter/composables/__tests__/useActionBar.test.js
git commit -m "feat(combat): applyAction — dispatch des effets vers les fonctions store"
```

---

## Task 6 : Composant ActionBar.vue

**Files:**
- Create: `src/modules/encounter/components/ActionBar.vue`

- [ ] **Step 1: Créer le composant ActionBar.vue**

Le composant utilise Options API (convention du projet). Il consomme `useActionBar()` et rend le bandeau en 3 états progressifs.

Structure template :
- `<Transition name="slide-up">` wrappant le bandeau entier
- `v-if="isOpen"` sur le root
- Rangée 1 : Header (acteur + annuler) + boutons d'effet (`role="radiogroup"`)
- Rangée 2 (si effet choisi) : Sous-sélection condition (si applicable) + raccourcis cibles + chips des cibles sélectionnées
- Rangée 3 (si cibles > 0 ou miss) : Boutons montant rapide + champs individuels + bouton Appliquer

Implémenter les attributs ARIA de la spec :
- Bandeau : `role="dialog"`, `aria-label="Action en cours"`, `aria-modal="false"`
- Boutons d'effet : `role="radiogroup"` + `role="radio"` + `aria-checked`
- Combattant chips : `role="list"` + `role="listitem"`
- Montant : `type="number"`, `min="1"`, `aria-label="Montant pour [Nom]"`
- Bouton Appliquer : `:aria-disabled="!canApply"`

Gestion clavier :
- `@keydown.escape="cancelAction"`
- `@keydown.enter="applyAction"` (si canApply)

Gestion focus :
- Au montage (via `mounted` hook ou `watch` sur `isOpen`), appeler `nextTick(() => this.$refs.firstEffectBtn?.focus())` pour focus automatique sur le premier bouton d'effet

CSS :
- `position: fixed; bottom: 0; left: 0; right: 0; z-index: 1100` (au-dessus de BottomDrawer z-index)
- Background dark avec border-top accent
- Scroll horizontal sur la rangée d'effets (mobile) : `overflow-x: auto; white-space: nowrap`
- Transition slide-up : `transform: translateY(100%)` → `translateY(0)`

- [ ] **Step 2: Vérifier le build**

Run: `npx vite build`
Expected: Build réussi sans erreur

- [ ] **Step 3: Commit**

```bash
git add src/modules/encounter/components/ActionBar.vue
git commit -m "feat(combat): composant ActionBar — bandeau flottant de ciblage"
```

---

## Task 7 : Intégration PJ (characterStore) dans applyAction

**Files:**
- Modify: `src/modules/encounter/composables/useActionBar.js`

- [ ] **Step 1: Écrire les tests pour les effets PJ**

```js
// Ajouter aux tests existants dans useActionBar.test.js

import { useCharacterStore } from '@modules/characters/stores/characterStore'

// Ajouter au mock ou mocker characterStore
vi.mock('@modules/characters/stores/characterStore', () => ({
  useCharacterStore: () => ({
    patchCharacterById: vi.fn(),
    characters: ref([
      { id: 'kael', name: 'Kael', currentHP: 10, maxHP: 15, currentStress: 3, maxStress: 6, hope: 2 },
      { id: 'lyra', name: 'Lyra', currentHP: 8, maxHP: 12, currentStress: 1, maxStress: 4, hope: 0 }
    ])
  })
}))

describe('applyAction effets PJ', () => {
  it('damage_hp sur PJ appelle patchCharacterById (currentHP augmente = dégâts marqués)', () => {
    const charStore = useCharacterStore()
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.DAMAGE_HP)
    bar.toggleTarget('lyra', 'pc')
    bar.setDefaultAmount(2)
    bar.applyAction()

    // currentHP=8, damage 2 → currentHP=10 (marqué 2 de plus, plafonné à maxHP=12)
    expect(charStore.patchCharacterById).toHaveBeenCalledWith('lyra', { currentHP: 10 })
  })

  it('hope sur PJ appelle patchCharacterById avec hope incrémenté', () => {
    const charStore = useCharacterStore()
    bar.openAction()
    bar.setEffect(ACTION_EFFECTS.HOPE)
    bar.toggleTarget('kael', 'pc')
    bar.setDefaultAmount(1)
    bar.applyAction()

    expect(charStore.patchCharacterById).toHaveBeenCalledWith('kael', { hope: 3 })
  })
})
```

- [ ] **Step 2: Lancer les tests, vérifier l'échec**

Run: `npx vitest run src/modules/encounter/composables/__tests__/useActionBar.test.js`
Expected: FAIL (les branches PJ ne sont pas implémentées)

- [ ] **Step 3: Implémenter les branches PJ dans applyAction**

Ajouter `import { useCharacterStore } from '@modules/characters/stores/characterStore'` dans useActionBar.js.

**IMPORTANT — Sémantique des champs PJ :** `currentHP` et `currentStress` sont initialisés à 0 et représentent les points **marqués** (dégâts pris). `maxHP`/`maxStress` = capacité totale. Donc :
- **Damage** = **augmenter** currentHP/currentStress (on marque plus de dégâts)
- **Heal** = **diminuer** currentHP/currentStress (on retire des dégâts marqués)

Vérifier en regardant comment les boutons +/- existants dans `PcSidebarCard.vue` appellent `patchCharacterById`. Adapter si la sémantique diffère.

Compléter les `switch` cases avec les branches PJ :

```js
// Dans DAMAGE_HP:
if (t.type === 'pc') {
  const char = charStore.characters.find(c => c.id === t.id)
  if (char) {
    charStore.patchCharacterById(t.id, { currentHP: Math.min(char.currentHP + t.amount, char.maxHP) })
    store.logActionEntry({ ...logCtx, action: 'pc_hit', pcId: t.id, pcName: char.name, type: 'hp', amount: t.amount })
  }
}

// Dans DAMAGE_STRESS:
if (t.type === 'pc') {
  const char = charStore.characters.find(c => c.id === t.id)
  if (char) {
    charStore.patchCharacterById(t.id, { currentStress: Math.min(char.currentStress + t.amount, char.maxStress) })
    store.logActionEntry({ ...logCtx, action: 'pc_hit', pcId: t.id, pcName: char.name, type: 'stress', amount: t.amount })
  }
}

// Dans HEAL_HP:
if (t.type === 'pc') {
  const char = charStore.characters.find(c => c.id === t.id)
  if (char) {
    charStore.patchCharacterById(t.id, { currentHP: Math.max(0, char.currentHP - t.amount) })
    store.logActionEntry({ ...logCtx, action: 'heal_hp', pcId: t.id, pcName: char.name, amount: t.amount })
  }
}

// Dans HEAL_STRESS:
if (t.type === 'pc') {
  const char = charStore.characters.find(c => c.id === t.id)
  if (char) {
    charStore.patchCharacterById(t.id, { currentStress: Math.max(0, char.currentStress - t.amount) })
    store.logActionEntry({ ...logCtx, action: 'heal_stress', pcId: t.id, pcName: char.name, amount: t.amount })
  }
}

// Dans HOPE:
for (const t of targets) {
  const char = charStore.characters.find(c => c.id === t.id)
  if (char) {
    charStore.patchCharacterById(t.id, { hope: char.hope + t.amount })
    store.logActionEntry({ ...logCtx, action: 'hope_change', pcId: t.id, pcName: char.name, amount: t.amount })
  }
}

// Dans DOWN:
if (t.type === 'pc') {
  const current = store.pcDownStatus[t.id] || false
  store.pcDownStatus[t.id] = !current
  const pc = store.participantPcs.find(p => p.id === t.id)
  store.logActionEntry({ ...logCtx, action: current ? 'pc_revive' : 'pc_down', pcId: t.id, pcName: pc?.name })
}
```

- [ ] **Step 4: Lancer les tests, vérifier le pass**

Run: `npx vitest run src/modules/encounter/composables/__tests__/useActionBar.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/encounter/composables/useActionBar.js src/modules/encounter/composables/__tests__/useActionBar.test.js
git commit -m "feat(combat): intégration PJ dans applyAction (HP, Stress, Hope, Down)"
```

---

## Task 8 : Intégrer ActionBar dans EncounterLive.vue

**Files:**
- Modify: `src/modules/encounter/views/EncounterLive.vue` (lignes 435-452 imports, template)

- [ ] **Step 1: Importer et monter le composant**

Dans les imports (après ligne 452), ajouter :
```js
import ActionBar from '../components/ActionBar.vue'
```

Dans le `components` de l'Options API, ajouter `ActionBar`.

Dans le template, après le dernier drawer (ligne ~240) et avant les modals, ajouter :
```html
<ActionBar />
```

- [ ] **Step 2: Ajouter le padding-bottom dynamique**

Dans le template root `<div class="live">`, ajouter un style conditionnel :
```html
<div class="live" :style="actionBarOpen ? { paddingBottom: '160px' } : {}">
```

Dans le setup/data, exposer `actionBarOpen` depuis `useActionBar().isOpen`.

- [ ] **Step 3: Vérifier le build**

Run: `npx vite build`
Expected: Build réussi

- [ ] **Step 4: Commit**

```bash
git add src/modules/encounter/views/EncounterLive.vue
git commit -m "feat(combat): intégrer ActionBar dans la vue combat live"
```

---

## Task 9 : Mode ciblage sur PcSidebarCard et AdversaryTargetPanel

**Files:**
- Modify: `src/modules/encounter/components/PcSidebarCard.vue` (props, template)
- Modify: `src/modules/encounter/components/AdversaryTargetPanel.vue` (template ligne 72)

- [ ] **Step 1: PcSidebarCard — ajouter la prop et le style ciblage**

Ajouter les props :
```js
isTargeting: { type: Boolean, default: false },
isTargeted: { type: Boolean, default: false }
```

Dans le template, sur le root `<div>` (ligne 2), ajouter les classes conditionnelles et ARIA :
```html
:class="{ 'pc-sidebar--targeting': isTargeting, 'pc-sidebar--targeted': isTargeted }"
:aria-pressed="isTargeting ? isTargeted : undefined"
:aria-label="isTargeting ? 'Sélectionner ' + pc.name + ' comme cible' : undefined"
```

Modifier le `onClick` (ligne 165) pour émettre un événement ciblage si en mode targeting :
```js
onClick () {
  if (this.isTargeting) {
    this.$emit('toggle-target', this.pc.id, 'pc')
    return
  }
  this.$emit('select', this.pc.id)
}
```

Ajouter l'emit : `emits: ['select', 'toggle-target']`

CSS :
```css
.pc-sidebar--targeting {
  cursor: crosshair;
  border: 2px dashed var(--color-accent);
}
.pc-sidebar--targeted {
  border: 2px solid var(--color-success);
  background: rgba(34, 197, 94, 0.1);
}
```

- [ ] **Step 2: AdversaryTargetPanel — ajouter le mode ciblage**

Sur le v-for des instances (ligne 72), ajouter les classes conditionnelles, ARIA et le click ciblage :
```html
:class="{ 'adv-panel__instance--targeted': isTargetSelected(inst.instanceId) }"
:aria-pressed="isTargeting ? isTargetSelected(inst.instanceId) : undefined"
:aria-label="isTargeting ? 'Sélectionner ' + inst.name + ' comme cible' : undefined"
@click="isTargeting ? $emit('toggle-target', inst.instanceId, 'adversary') : selectInstance(inst.instanceId)"
```

Ajouter les props/emits nécessaires :
```js
isTargeting: { type: Boolean, default: false }
isTargetSelected: { type: Function, default: () => false }
```

CSS :
```css
.adv-panel__instance--targeted {
  border: 2px solid var(--color-success);
  background: rgba(34, 197, 94, 0.1);
}
```

- [ ] **Step 3: EncounterLive.vue — connecter les props ciblage**

Mettre à jour les `<PcSidebarCard>` (ligne ~143) et `<AdversaryTargetPanel>` avec les props de ciblage depuis `useActionBar` :

```html
<PcSidebarCard
  ...
  :is-targeting="actionBarOpen"
  :is-targeted="isTargetSelected(pc.id)"
  @toggle-target="toggleTarget"
/>
```

- [ ] **Step 4: Vérifier le build**

Run: `npx vite build`
Expected: Build réussi

- [ ] **Step 5: Commit**

```bash
git add src/modules/encounter/components/PcSidebarCard.vue src/modules/encounter/components/AdversaryTargetPanel.vue src/modules/encounter/views/EncounterLive.vue
git commit -m "feat(combat): mode ciblage visuel sur PcSidebarCard et AdversaryTargetPanel"
```

---

## Task 10 : Bouton "Action" dans ContextPanel

**Files:**
- Modify: `src/modules/encounter/components/ContextPanel.vue` (template)

- [ ] **Step 1: Ajouter le bouton**

Dans le ContextPanel, ajouter un bouton visible quand le bandeau est fermé. Placement : en haut de la section PC (après ligne ~61) et de la section adversaire (après ligne ~468).

```html
<button
  v-if="!actionBarOpen"
  class="ctx-panel__action-btn"
  aria-label="Ouvrir le panneau d'action"
  @click="$emit('open-action')"
>
  ⚡ Action
</button>
```

Ajouter la prop :
```js
actionBarOpen: { type: Boolean, default: false }
```

Ajouter l'emit : `'open-action'`

CSS :
```css
.ctx-panel__action-btn {
  width: 100%;
  min-height: 44px;
  padding: 8px 16px;
  margin-bottom: 8px;
  border: 2px solid var(--color-accent);
  border-radius: 8px;
  background: transparent;
  color: var(--color-accent);
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
}
.ctx-panel__action-btn:hover {
  background: rgba(168, 85, 247, 0.1);
}
```

- [ ] **Step 2: EncounterLive.vue — connecter l'événement**

Sur le `<ContextPanel>` (ligne ~209), ajouter :
```html
:action-bar-open="actionBarOpen"
@open-action="openAction"
```

- [ ] **Step 3: Vérifier le build**

Run: `npx vite build`
Expected: Build réussi

- [ ] **Step 4: Commit**

```bash
git add src/modules/encounter/components/ContextPanel.vue src/modules/encounter/views/EncounterLive.vue
git commit -m "feat(combat): bouton Action dans le ContextPanel pour ouvrir le bandeau"
```

---

## Task 11 : Groupement dans CombatLogDrawer

**Files:**
- Modify: `src/modules/encounter/components/CombatLogDrawer.vue` (ligne 30 — v-for sur `reversedEntries`)

- [ ] **Step 1: Ajouter le groupement par actionId**

Créer un computed qui groupe les entrées :
```js
const groupedLog = computed(() => {
  const groups = []
  let currentGroup = null

  for (const entry of combatLog.value) {
    if (entry.actionId && currentGroup?.actionId === entry.actionId) {
      currentGroup.entries.push(entry)
    } else {
      currentGroup = {
        actionId: entry.actionId || null,
        actorName: entry.actorName || null,
        entries: [entry]
      }
      groups.push(currentGroup)
    }
  }

  return groups.reverse()
})
```

- [ ] **Step 2: Template — afficher les groupes**

Pour les groupes avec actionId (multi-entrées), afficher avec bordure gauche et indent :
```html
<div v-for="group in groupedLog" :key="group.actionId || group.entries[0].timestamp">
  <div v-if="group.actionId && group.entries.length > 1" class="log-group">
    <div class="log-group__header">{{ group.actorName }}</div>
    <div v-for="entry in group.entries" :key="entry.timestamp" class="log-group__entry">
      <!-- rendu existant de l'entrée -->
    </div>
  </div>
  <div v-else>
    <!-- rendu existant pour les entrées individuelles -->
  </div>
</div>
```

- [ ] **Step 3: Vérifier le build**

Run: `npx vite build`
Expected: Build réussi

- [ ] **Step 4: Commit**

```bash
git add src/modules/encounter/components/CombatLogDrawer.vue
git commit -m "feat(combat): groupement des entrées combat log par actionId"
```

---

## Task 12 : ESLint + build final + test global

**Files:** Tous les fichiers modifiés/créés

- [ ] **Step 1: ESLint sur tous les fichiers modifiés**

Run: `npx eslint src/modules/encounter/composables/useActionBar.js src/modules/encounter/components/ActionBar.vue src/data/encounters/actionEffects.js src/modules/encounter/stores/encounterLiveStore.js src/modules/encounter/composables/useCombatLog.js src/modules/encounter/components/PcSidebarCard.vue src/modules/encounter/components/AdversaryTargetPanel.vue src/modules/encounter/components/ContextPanel.vue src/modules/encounter/views/EncounterLive.vue`
Expected: Aucune erreur. Si erreurs, corriger.

- [ ] **Step 2: Build complet**

Run: `npx vite build`
Expected: Build réussi

- [ ] **Step 3: Tests ciblés**

Run: `npx vitest run src/modules/encounter/`
Expected: Tous les tests passent

- [ ] **Step 4: Corriger si nécessaire et commit final**

```bash
git add -A
git commit -m "fix(combat): corrections ESLint et ajustements finaux du système de ciblage"
```
