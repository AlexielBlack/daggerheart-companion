<template>
  <div class="dice-roller">
    <div class="roller-layout">
      <!-- ═══ Main panels ═══ -->
      <div class="roller-main">
        <DualityPanel
          ref="dualityPanel"
          @roll="onDualityRoll"
        />
        <div class="panels-row">
          <DamagePanel
            ref="damagePanel"
            @roll="onDamageRoll"
          />
          <QuickDice
            ref="quickDice"
            @roll-quick="onQuickRoll"
            @roll-g-m="onGMRoll"
          />
        </div>
      </div>

      <!-- ═══ Sidebar: History ═══ -->
      <div class="roller-sidebar">
        <DiceHistory
          :entries="store.history"
          @clear="store.clearHistory()"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useDiceStore } from '../stores/diceStore'
import DualityPanel from '../components/DualityPanel.vue'
import DamagePanel from '../components/DamagePanel.vue'
import QuickDice from '../components/QuickDice.vue'
import DiceHistory from '../components/DiceHistory.vue'

export default {
  name: 'DiceRoller',
  components: { DualityPanel, DamagePanel, QuickDice, DiceHistory },
  setup() {
    const store = useDiceStore()
    const dualityPanel = ref(null)
    const damagePanel = ref(null)
    const quickDice = ref(null)

    function onDualityRoll(options) {
      const result = store.rollDuality(options)
      if (dualityPanel.value) {
        dualityPanel.value.setResult(result)
      }
    }

    function onDamageRoll(options) {
      const result = store.rollDamage(options)
      if (result && damagePanel.value) {
        damagePanel.value.setResult(result)
      }
    }

    function onQuickRoll(sides) {
      const result = store.rollQuick(sides)
      if (quickDice.value) {
        quickDice.value.setQuickResult(result)
      }
    }

    function onGMRoll(options) {
      const result = store.rollGM(options)
      if (quickDice.value) {
        quickDice.value.setGMResult(result)
      }
    }

    return {
      store,
      dualityPanel, damagePanel, quickDice,
      onDualityRoll, onDamageRoll, onQuickRoll, onGMRoll
    }
  }
}
</script>

<style scoped>
.dice-roller {
  min-height: 100%;
}

.roller-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: var(--space-lg);
  align-items: start;
}

@media (max-width: 800px) {
  .roller-layout { grid-template-columns: 1fr; }
}

.roller-main {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.panels-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

@media (max-width: 600px) {
  .panels-row { grid-template-columns: 1fr; }
}

.roller-sidebar {
  position: sticky;
  top: var(--space-md);
}
</style>
