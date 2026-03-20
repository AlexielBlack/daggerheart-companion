<template>
  <BottomDrawer
    :model-value="modelValue"
    title="📜 Journal de combat"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="clog__inner">
      <!-- Compteur + bouton vider -->
      <div class="clog__toolbar">
        <span class="clog__count">
          {{ entries.length }} action{{ entries.length > 1 ? 's' : '' }}
        </span>
        <button
          v-if="entries.length > 0"
          class="clog__clear-btn"
          aria-label="Vider le journal courant"
          @click="$emit('clear')"
        >
          Vider
        </button>
      </div>

      <!-- Liste des entrées (groupées par actionId) -->
      <ul
        v-if="entries.length > 0"
        class="clog__list"
        aria-label="Entrées du journal de combat"
      >
        <template
          v-for="(group, gIdx) in groupedLog"
          :key="group.actionId || group.entries[0]?.timestamp || gIdx"
        >
          <!-- Groupe multi-entrées (Action Bar) -->
          <li
            v-if="group.actionId && group.entries.length > 1"
            class="clog__group"
          >
            <div class="clog__group-header">
              {{ group.actorName || 'Action' }}
            </div>
            <div
              v-for="(entry, idx) in group.entries"
              :key="entry.timestamp || idx"
              class="clog__group-entry clog__entry"
              :class="'clog__entry--' + entry.action"
            >
              <span class="clog__icon">{{ actionIcon(entry) }}</span>
              <span class="clog__text">{{ actionText(entry) }}</span>
              <span class="clog__time">{{ formatTime(entry.timestamp) }}</span>
            </div>
          </li>
          <!-- Entrée(s) simple(s) (legacy ou non groupée) -->
          <template v-else>
            <li
              v-for="(entry, idx) in group.entries"
              :key="entry.timestamp || idx"
              class="clog__entry"
              :class="'clog__entry--' + entry.action"
            >
              <span class="clog__icon">{{ actionIcon(entry) }}</span>
              <span class="clog__text">{{ actionText(entry) }}</span>
              <span class="clog__time">{{ formatTime(entry.timestamp) }}</span>
            </li>
          </template>
        </template>
      </ul>

      <!-- État vide -->
      <div
        v-else
        class="clog__empty"
      >
        <p>Aucune action enregistrée.</p>
      </div>
    </div>
  </BottomDrawer>
</template>

<script>
import { computed } from 'vue'
import BottomDrawer from './BottomDrawer.vue'

const ACTION_ICONS = {
  damage: '⚔️',
  pc_hit: '🩸',
  pc_armor: '🛡️',
  miss: '💨',
  adv_down: '💀',
  pc_down: '🔻',
  pc_down_cancelled: '↩',
  pc_revive: '💚',
  condition_added: '⚡',
  condition_removed: '✖️',
  damage_removed: '↩',
  reinforcement: '➕',
  heal_hp: '💚',
  heal_stress: '🩹',
  hope_change: '✨',
  down: '💀',
  condition_add: '⚡',
  condition_remove: '⚡',
  round_complete: '🔔'
}

export default {
  name: 'CombatLogDrawer',
  components: { BottomDrawer },
  props: {
    modelValue: { type: Boolean, default: false },
    entries: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue', 'clear'],
  setup(props) {
    const reversedEntries = computed(() => [...props.entries].reverse())

    // Groupement des entrées par actionId (actions groupées depuis l'Action Bar)
    const groupedLog = computed(() => {
      const entries = reversedEntries.value || []
      const groups = []
      let currentGroup = null

      for (const entry of entries) {
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

      return groups
    })

    function actionIcon(entry) {
      return ACTION_ICONS[entry.action] || '•'
    }

    function actionText(entry) {
      // Source = actorName (ActionBar) ou fallback legacy (pcName/advName)
      const src = entry.actorName || entry.pcName || entry.advName || '?'

      switch (entry.action) {
      case 'damage':
        return entry.type === 'hp'
          ? `${src} → ${entry.advName} : ${entry.amount} HP`
          : `${src} → ${entry.advName} : ${entry.amount} Stress`
      case 'pc_hit':
        return `${src} → ${entry.pcName} : ${entry.amount || entry.hpMarked} ${entry.type === 'stress' ? 'Stress' : 'HP'}`
      case 'pc_armor':
        return `${entry.pcName} utilise un slot d'armure`
      case 'miss':
        return entry.attackerType === 'pc'
          ? `${entry.pcName || src} rate ${entry.advName}`
          : `${entry.advName || src} rate ${entry.pcName}`
      case 'adv_down':
        return `${entry.advName} vaincu` + (entry.pcName ? ` par ${entry.pcName}` : '')
      case 'pc_down':
        return `${entry.pcName} est à terre`
      case 'pc_down_cancelled':
        return `${entry.pcName} n'est plus à terre`
      case 'pc_revive':
        return `${entry.pcName} réanimé`
      case 'condition_added':
        return `${entry.entityName} : +${entry.condition}`
      case 'condition_removed':
        return `${entry.entityName} : −${entry.condition}`
      case 'damage_removed':
        return `Dégâts annulés : ${entry.advName || entry.pcName}`
      case 'heal_hp':
        return `${src} → ${entry.advName || entry.pcName || '?'} : ${entry.amount} Soin HP`
      case 'heal_stress':
        return `${src} → ${entry.advName || entry.pcName || '?'} : ${entry.amount} Soin Stress`
      case 'hope_change':
        return `${entry.pcName || src} : +${entry.amount} Espoir`
      case 'down':
        return `${src} → ${entry.advName || entry.pcName || '?'} : À Terre`
      case 'condition_add':
        return `${src} → ${entry.advName || entry.pcName || '?'} : +${entry.condition}`
      case 'condition_remove':
        return `${src} → ${entry.advName || entry.pcName || '?'} : -${entry.condition}`
      case 'round_complete': {
        const secs = Math.floor((entry.durationMs || 0) / 1000)
        const min = Math.floor(secs / 60)
        const sec = secs % 60
        const time = min > 0 ? `${min}m${String(sec).padStart(2, '0')}s` : `${sec}s`
        return `Fin du tour ${entry.round} (${time})`
      }
      default:
        return entry.action
      }
    }

    function formatTime(timestamp) {
      if (!timestamp) return ''
      const d = new Date(timestamp)
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }

    return { reversedEntries, groupedLog, actionIcon, actionText, formatTime }
  }
}
</script>

<style scoped>
.clog__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ── Toolbar ── */
.clog__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.clog__count {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.clog__clear-btn {
  padding: var(--space-xs) var(--space-sm);
  min-height: var(--touch-min);
  border: none;
  background: transparent;
  color: var(--color-accent-danger);
  font-size: var(--font-size-xs);
  cursor: pointer;
  touch-action: manipulation;
  border-radius: var(--radius-sm);
}

.clog__clear-btn:hover { background: rgba(244, 67, 54, 0.1); }

/* ── Liste ── */
.clog__list {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  list-style: none;
  margin: 0;
  padding: 0;
}

.clog__entry {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--color-border);
  min-height: var(--touch-min);
}

.clog__entry--adv_down { background: rgba(244, 67, 54, 0.05); }
.clog__entry--pc_down { background: rgba(200, 75, 49, 0.08); }
.clog__entry--pc_hit { background: rgba(255, 152, 0, 0.05); }
.clog__entry--miss { opacity: 0.6; }

.clog__icon {
  font-size: var(--font-size-md);
  flex-shrink: 0;
  width: 1.5rem;
  text-align: center;
}

.clog__text {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
}

.clog__time {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Groupes (Action Bar) ── */
.clog__group {
  border-left: 3px solid var(--color-accent, #a855f7);
  padding-left: 8px;
  margin-bottom: 4px;
}

.clog__group-header {
  font-size: var(--font-size-xs);
  color: var(--color-accent, #a855f7);
  font-weight: bold;
  margin-bottom: 2px;
  padding: var(--space-xs) 0;
}

.clog__group-entry {
  padding-left: 4px;
}

/* ── État vide ── */
.clog__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: var(--space-lg);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.clog__empty p { margin: 0; }
</style>
