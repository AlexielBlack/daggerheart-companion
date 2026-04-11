<template>
  <BottomDrawer
    :model-value="modelValue"
    title="📜 Journal de combat"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="clog__inner">
      <!-- Onglets -->
      <nav class="clog__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="clog__tab"
          :class="{ 'clog__tab--active': activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          {{ tab.emoji }} {{ tab.label }}
        </button>
      </nav>

      <!-- ══ TAB : Timeline ══ -->
      <div
        v-if="activeTab === 'timeline'"
        class="clog__panel"
      >
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

        <ul
          v-if="entries.length > 0"
          class="clog__list"
          aria-label="Entrées du journal de combat"
        >
          <template
            v-for="(group, gIdx) in groupedLog"
            :key="group.actionId || group.entries[0]?.timestamp || gIdx"
          >
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

        <div
          v-else
          class="clog__empty"
        >
          <p>Aucune action enregistrée.</p>
        </div>
      </div>

      <!-- ══ TAB : Stats PJ ══ -->
      <div
        v-if="activeTab === 'stats-pj'"
        class="clog__panel"
      >
        <table
          v-if="pcStatsRows.length > 0"
          class="clog__table"
        >
          <thead>
            <tr>
              <th>PJ</th>
              <th title="HP infligés">
                ⚔️
              </th>
              <th title="Stress infligé">
                💢→
              </th>
              <th title="Kills">
                💀
              </th>
              <th title="Touches / Ratés">
                🎯
              </th>
              <th title="HP reçus">
                🩸
              </th>
              <th title="Armure utilisée">
                🛡️
              </th>
              <th title="À terre">
                ⬇️
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in pcStatsRows"
              :key="row.pcId"
            >
              <td class="clog__table-name">
                {{ row.name }}
              </td>
              <td>{{ row.hpDealt }}</td>
              <td>{{ row.stressDealt }}</td>
              <td>{{ row.kills }}</td>
              <td>{{ row.hits }}/{{ row.misses }}</td>
              <td>{{ row.hpReceived }}</td>
              <td>{{ row.armorUsed }}</td>
              <td>{{ row.downs }}</td>
            </tr>
          </tbody>
        </table>
        <div
          v-else
          class="clog__empty"
        >
          <p>Pas encore de données.</p>
        </div>
      </div>

      <!-- ══ TAB : Stats Adversaires ══ -->
      <div
        v-if="activeTab === 'stats-adv'"
        class="clog__panel"
      >
        <table
          v-if="advStatsRows.length > 0"
          class="clog__table"
        >
          <thead>
            <tr>
              <th>Adversaire</th>
              <th>Type</th>
              <th title="HP marqués / HP total">
                ❤️
              </th>
              <th title="Vaincus / Total">
                💀
              </th>
              <th>%HP</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in advStatsRows"
              :key="row.adversaryId"
              :class="{ 'clog__row--defeated': row.defeated === row.total }"
            >
              <td class="clog__table-name">
                {{ row.name }}
              </td>
              <td class="clog__table-type">
                {{ row.type }}
              </td>
              <td>{{ row.markedHP }}/{{ row.totalHP }}</td>
              <td>{{ row.defeated }}/{{ row.total }}</td>
              <td :class="hpPercentClass(row)">
                {{ row.hpPercent }}%
              </td>
            </tr>
          </tbody>
        </table>
        <div
          v-else
          class="clog__empty"
        >
          <p>Pas encore de données.</p>
        </div>
      </div>

      <!-- ══ TAB : Résumé ══ -->
      <div
        v-if="activeTab === 'resume'"
        class="clog__panel"
      >
        <div class="clog__summary">
          <div class="clog__summary-grid">
            <div class="clog__summary-card">
              <span class="clog__summary-val">{{ stats.adversaryStatus.defeated }}</span>
              <span class="clog__summary-label">💀 Vaincus</span>
            </div>
            <div class="clog__summary-card">
              <span class="clog__summary-val">{{ stats.adversaryStatus.active }}</span>
              <span class="clog__summary-label">🔴 Restants</span>
            </div>
            <div class="clog__summary-card">
              <span class="clog__summary-val">{{ stats.totalDamage }}</span>
              <span class="clog__summary-label">⚔️ HP infligés</span>
            </div>
            <div class="clog__summary-card">
              <span class="clog__summary-val">{{ stats.totalStress }}</span>
              <span class="clog__summary-label">💢 Stress infligé</span>
            </div>
            <div class="clog__summary-card">
              <span class="clog__summary-val">{{ stats.hitRatio }}%</span>
              <span class="clog__summary-label">🎯 Précision</span>
            </div>
            <div class="clog__summary-card">
              <span class="clog__summary-val">{{ stats.pcDowns }}</span>
              <span class="clog__summary-label">⬇️ PJ à terre</span>
            </div>
            <div class="clog__summary-card">
              <span class="clog__summary-val">{{ stats.armorUsed }}</span>
              <span class="clog__summary-label">🛡️ Armure</span>
            </div>
            <div class="clog__summary-card">
              <span class="clog__summary-val">{{ stats.conditions }}</span>
              <span class="clog__summary-label">⚡ Conditions</span>
            </div>
          </div>

          <!-- MVP -->
          <div
            v-if="mvp"
            class="clog__mvp"
          >
            <span class="clog__mvp-label">⭐ MVP</span>
            <span class="clog__mvp-name">{{ mvp.name }}</span>
            <span class="clog__mvp-detail">{{ mvp.hp }} HP · {{ mvp.kills }} 💀</span>
          </div>
        </div>
      </div>
    </div>
  </BottomDrawer>
</template>

<script>
import { ref, computed } from 'vue'
import BottomDrawer from './BottomDrawer.vue'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import { useLiveStats } from '../composables/useLiveStats'

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
  adv_revive: '💚',
  condition_add: '⚡',
  condition_remove: '⚡',
  round_complete: '🔔',
  countdown_tick: '⏳',
  countdown_reset: '🔄',
  countdown_removed: '🗑️',
  scene_mode: '🔄',
  fear_hope: '🌗',
  fear_hope_spent: '🌗'
}

const TABS = [
  { id: 'timeline', emoji: '📋', label: 'Timeline' },
  { id: 'stats-pj', emoji: '🧑', label: 'PJ' },
  { id: 'stats-adv', emoji: '👹', label: 'Adv.' },
  { id: 'resume', emoji: '📊', label: 'Résumé' }
]

export default {
  name: 'CombatLogDrawer',
  components: { BottomDrawer },
  props: {
    modelValue: { type: Boolean, default: false },
    entries: { type: Array, default: () => [] }
  },
  emits: ['update:modelValue', 'clear'],
  setup(props) {
    const activeTab = ref('timeline')
    const store = useEncounterLiveStore()
    const liveStats = useLiveStats(store)

    const reversedEntries = computed(() => [...props.entries].reverse())

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

    // ── Stats PJ tabulées ──
    const pcStatsRows = computed(() => {
      const pcs = store.participantPcs
      const dealt = liveStats.damageByPc.value
      const received = liveStats.damageReceivedByPc.value
      const kills = liveStats.killsByPc.value

      return pcs.map(pc => {
        const d = dealt[pc.id] || { hp: 0, stress: 0 }
        const r = received[pc.id] || { hitsReceived: 0, hpTaken: 0, armorUsed: 0, downs: 0 }
        const k = kills[pc.id] || { count: 0 }
        // Comptage hits/misses par PJ
        const hits = props.entries.filter(e => e.action === 'damage' && e.pcId === pc.id).length
        const misses = props.entries.filter(e => e.action === 'miss' && e.pcId === pc.id).length
        return {
          pcId: pc.id,
          name: pc.name,
          hpDealt: d.hp,
          stressDealt: d.stress,
          kills: k.count,
          hits,
          misses,
          hpReceived: r.hpTaken,
          armorUsed: r.armorUsed,
          downs: r.downs
        }
      })
    })

    // ── Stats adversaires tabulées ──
    const advStatsRows = computed(() => {
      const groups = liveStats.damageByAdversaryGroup.value
      return Object.entries(groups).map(([adversaryId, g]) => ({
        adversaryId,
        ...g,
        hpPercent: g.totalHP > 0 ? Math.round((g.markedHP / g.totalHP) * 100) : 0
      }))
    })

    // ── Résumé global ──
    const stats = computed(() => ({
      totalDamage: liveStats.totalDamageDealt.value,
      totalStress: liveStats.totalStressDealt.value,
      hitRatio: liveStats.hitRatio.value,
      pcDowns: liveStats.totalPcDowns.value,
      armorUsed: liveStats.totalArmorUsed.value,
      conditions: liveStats.conditionsAdded.value,
      adversaryStatus: liveStats.adversaryStatusSummary.value
    }))

    // ── MVP (PJ ayant infligé le plus de HP) ──
    const mvp = computed(() => {
      const dealt = liveStats.damageByPc.value
      const kills = liveStats.killsByPc.value
      let best = null
      for (const [pcId, d] of Object.entries(dealt)) {
        const k = kills[pcId]?.count || 0
        if (!best || d.hp > best.hp) {
          best = { pcId, name: d.pcName, hp: d.hp, kills: k }
        }
      }
      return best
    })

    function actionIcon(entry) {
      return ACTION_ICONS[entry.action] || '•'
    }

    function actionText(entry) {
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
        return `${entry.advName} vaincu` + (entry.actorName ? ` par ${entry.actorName}` : entry.pcName ? ` par ${entry.pcName}` : '')
      case 'adv_revive':
        return `${entry.advName} réanimé` + (entry.actorName ? ` par ${entry.actorName}` : '')
      case 'pc_down':
        return `${entry.pcName} est à terre` + (entry.actorName ? ` (${entry.actorName})` : '')
      case 'pc_down_cancelled':
        return `${entry.pcName} n'est plus à terre`
      case 'pc_revive':
        return `${entry.pcName} réanimé` + (entry.actorName ? ` par ${entry.actorName}` : '')
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
      case 'condition_add':
        return `${src} → ${entry.advName || entry.pcName || '?'} : +${entry.condition}`
      case 'condition_remove':
        return `${src} → ${entry.advName || entry.pcName || '?'} : -${entry.condition}`
      case 'countdown_tick':
        return `${entry.countdownName} : avancé de ${entry.amount}` + (entry.triggered ? ' — déclenché !' : ` (reste ${entry.remaining})`)
      case 'countdown_reset':
        return `${entry.countdownName} : réinitialisé`
      case 'countdown_removed':
        return `${entry.countdownName} : retiré`
      case 'round_complete': {
        const secs = Math.floor((entry.durationMs || 0) / 1000)
        const min = Math.floor(secs / 60)
        const sec = secs % 60
        const time = min > 0 ? `${min}m${String(sec).padStart(2, '0')}s` : `${sec}s`
        return `Fin du tour ${entry.round} (${time})`
      }
      case 'scene_mode':
        return `Mode → ${entry.to === 'pcAttack' ? '⚔️ PJ attaque' : entry.to === 'adversaryAttack' ? '💀 Adversaire attaque' : '🗣️ Social'}`
      case 'fear_hope':
        return `${entry.pool === 'hope' ? '☀️ Hope' : '🌙 Fear'} +${entry.amount}`
      case 'fear_hope_spent':
        return `${entry.pool === 'hope' ? '☀️ Hope' : '🌙 Fear'} dépensé (−${entry.amount})`
      default:
        return entry.action
      }
    }

    function formatTime(timestamp) {
      if (!timestamp) return ''
      const d = new Date(timestamp)
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }

    function hpPercentClass(row) {
      if (row.hpPercent >= 80) return 'clog__hp--high'
      if (row.hpPercent >= 40) return 'clog__hp--mid'
      return 'clog__hp--low'
    }

    return {
      tabs: TABS,
      activeTab,
      reversedEntries,
      groupedLog,
      pcStatsRows,
      advStatsRows,
      stats,
      mvp,
      actionIcon,
      actionText,
      formatTime,
      hpPercentClass
    }
  }
}
</script>

<style scoped>
.clog__inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* ── Onglets ── */
.clog__tabs {
  display: flex;
  gap: 2px;
  padding: var(--space-xs) var(--space-sm);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.clog__tab {
  flex: 1;
  padding: var(--space-xs);
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  touch-action: manipulation;
  transition: background 0.15s, border-color 0.15s;
}

.clog__tab:hover { background: var(--color-bg-elevated); }

.clog__tab--active {
  background: rgba(83, 168, 182, 0.15);
  border-color: var(--color-accent-hope);
  color: var(--color-accent-hope);
}

/* ── Panel (contenu d'onglet) ── */
.clog__panel {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
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

.clog__count { font-size: var(--font-size-xs); color: var(--color-text-muted); }

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

/* ── Liste timeline ── */
.clog__list {
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
.clog__entry--scene_mode { background: rgba(83, 168, 182, 0.05); }
.clog__entry--fear_hope,
.clog__entry--fear_hope_spent { background: rgba(124, 58, 237, 0.05); }

.clog__icon { font-size: var(--font-size-md); flex-shrink: 0; width: 1.5rem; text-align: center; }
.clog__text { flex: 1; font-size: var(--font-size-sm); color: var(--color-text-primary); }
.clog__time { font-size: var(--font-size-xs); color: var(--color-text-muted); font-variant-numeric: tabular-nums; white-space: nowrap; flex-shrink: 0; }

.clog__group { border-left: 3px solid var(--color-accent, #a855f7); padding-left: 8px; margin-bottom: 4px; }
.clog__group-header { font-size: var(--font-size-xs); color: var(--color-accent, #a855f7); font-weight: bold; margin-bottom: 2px; padding: var(--space-xs) 0; }
.clog__group-entry { padding-left: 4px; }

.clog__empty { display: flex; align-items: center; justify-content: center; flex: 1; padding: var(--space-lg); color: var(--color-text-muted); font-size: var(--font-size-sm); }
.clog__empty p { margin: 0; }

/* ── Tables stats ── */
.clog__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-xs);
  font-variant-numeric: tabular-nums;
}

.clog__table th {
  position: sticky;
  top: 0;
  background: var(--color-bg-secondary);
  padding: var(--space-xs) var(--space-sm);
  text-align: center;
  color: var(--color-text-muted);
  font-weight: var(--font-weight-bold);
  border-bottom: 2px solid var(--color-border);
  white-space: nowrap;
}

.clog__table td {
  padding: var(--space-xs) var(--space-sm);
  text-align: center;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border);
}

.clog__table-name {
  text-align: left !important;
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}

.clog__table-type {
  font-size: 0.65rem;
  color: var(--color-text-muted) !important;
}

.clog__row--defeated { opacity: 0.5; }

.clog__hp--high { color: var(--color-accent-danger); font-weight: var(--font-weight-bold); }
.clog__hp--mid { color: var(--color-accent-warning); }
.clog__hp--low { color: var(--color-accent-success); }

/* ── Résumé ── */
.clog__summary {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.clog__summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

@media (max-width: 480px) {
  .clog__summary-grid { grid-template-columns: repeat(2, 1fr); }
}

.clog__summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-sm);
  background: var(--color-bg-input);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.clog__summary-val {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.clog__summary-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
}

.clog__mvp {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(224, 165, 38, 0.1);
  border: 1px solid rgba(224, 165, 38, 0.3);
  border-radius: var(--radius-md);
}

.clog__mvp-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); color: var(--color-accent-gold); }
.clog__mvp-name { font-size: var(--font-size-sm); font-weight: var(--font-weight-bold); color: var(--color-text-primary); flex: 1; }
.clog__mvp-detail { font-size: var(--font-size-xs); color: var(--color-text-secondary); font-variant-numeric: tabular-nums; }
</style>
