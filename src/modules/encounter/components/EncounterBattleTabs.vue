<template>
  <div
    v-if="store.isActive && store.battleList.length > 0"
    class="battle-tabs"
    role="tablist"
    aria-label="Rencontres en cours"
  >
    <div
      v-for="b in store.battleList"
      :key="b.id"
      class="battle-tab"
      :class="{ 'battle-tab--active': b.isActive }"
    >
      <button
        class="battle-tab__select"
        role="tab"
        :aria-selected="b.isActive ? 'true' : 'false'"
        :title="b.name + ' — T' + b.tier"
        @click="onSwitch(b.id)"
      >
        <span class="battle-tab__name">{{ b.name }}</span>
        <span class="battle-tab__meta">
          <span class="battle-tab__tier">T{{ b.tier }}</span>
          <span class="battle-tab__count">{{ b.activeCount }}👹</span>
        </span>
      </button>
      <button
        v-if="store.battleList.length > 1"
        class="battle-tab__close"
        :aria-label="'Fermer la rencontre ' + b.name"
        title="Fermer cette rencontre"
        @click="onClose(b.id, b.name)"
      >
        ×
      </button>
    </div>

    <button
      class="battle-tab__add"
      aria-label="Lancer une nouvelle rencontre"
      title="Lancer une nouvelle rencontre en parallèle"
      @click="onAdd"
    >
      +
    </button>
  </div>
</template>

<script>
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import { useConfirmDialog } from '@core/composables/useConfirmDialog.js'

export default {
  name: 'EncounterBattleTabs',
  setup() {
    const store = useEncounterLiveStore()
    const { confirm } = useConfirmDialog()
    return { store, confirm }
  },
  methods: {
    onSwitch(id) {
      this.store.switchToBattle(id)
    },
    async onClose(id, name) {
      const ok = await this.confirm({
        title: 'Fermer la rencontre',
        message: `Fermer « ${name} » ? Son état de combat sera perdu (sans archivage dans l'historique).`,
        confirmLabel: 'Fermer',
        cancelLabel: 'Annuler',
        variant: 'danger'
      })
      if (ok) this.store.closeBattle(id)
    },
    onAdd() {
      this.$router.push('/table/rencontres')
    }
  }
}
</script>

<style scoped>
.battle-tabs {
  display: flex;
  align-items: stretch;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  overflow-x: auto;
  flex-shrink: 0;
  scrollbar-width: thin;
}

.battle-tab {
  display: flex;
  align-items: stretch;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  overflow: hidden;
  flex-shrink: 0;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.battle-tab--active {
  border-color: var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.1);
}

.battle-tab__select {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1px;
  padding: var(--space-xs) var(--space-sm);
  min-height: var(--touch-min);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  touch-action: manipulation;
  max-width: 12rem;
}

.battle-tab--active .battle-tab__select {
  color: var(--color-text-primary);
}

.battle-tab__name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 11rem;
}

.battle-tab__meta {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.battle-tab__tier {
  font-size: 0.65rem;
  color: var(--color-accent-gold);
  font-weight: var(--font-weight-bold);
}

.battle-tab__count {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.battle-tab__close {
  border: none;
  border-left: 1px solid var(--color-border);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-md);
  line-height: 1;
  padding: 0 var(--space-sm);
  cursor: pointer;
  touch-action: manipulation;
}

.battle-tab__close:hover {
  background: rgba(244, 67, 54, 0.12);
  color: var(--color-accent-danger);
}

.battle-tab__add {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  cursor: pointer;
  flex-shrink: 0;
  touch-action: manipulation;
  transition: border-color var(--transition-fast), color var(--transition-fast);
}

.battle-tab__add:hover {
  border-color: var(--color-accent-hope);
  color: var(--color-accent-hope);
}
</style>
