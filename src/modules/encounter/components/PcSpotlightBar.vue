<template>
  <div
    class="pc-spot"
    role="region"
    aria-label="Sélection PJ et projecteur"
  >
    <div class="pc-spot__pcs">
      <button
        v-for="pc in pcs"
        :key="pc.id"
        class="pc-spot__pc"
        :class="{
          'pc-spot__pc--active': activePcId === pc.id,
          'pc-spot__pc--spotlight': spotlight === 'pc' && activePcId === pc.id
        }"
        :aria-label="pc.name + ' — ' + getTokens(pc.id) + ' projecteur(s)'"
        :aria-pressed="activePcId === pc.id"
        @click="$emit('give-spotlight', pc.id)"
      >
        <span class="pc-spot__name">{{ pc.name }}</span>
        <span class="pc-spot__class">{{ pc.className }}</span>
        <span
          v-if="getTokens(pc.id) > 0"
          class="pc-spot__tokens"
          aria-hidden="true"
        >
          <span
            v-for="i in getTokens(pc.id)"
            :key="i"
            class="pc-spot__token"
          ></span>
        </span>
        <button
          v-if="getTokens(pc.id) > 0"
          class="pc-spot__remove"
          :aria-label="'Retirer un token de ' + pc.name"
          @click.stop="$emit('remove-token', pc.id)"
        >
          ×
        </button>
      </button>
    </div>

    <div class="pc-spot__right">
      <button
        class="pc-spot__gm"
        :class="{ 'pc-spot__gm--active': spotlight === 'gm' }"
        aria-label="Tour du MJ"
        @click="$emit('gm-spotlight')"
      >
        <span>💀 MJ</span>
      </button>
      <span
        v-if="totalTokens > 0"
        class="pc-spot__total"
        :title="totalTokens + ' tours ce round'"
      >{{ totalTokens }}t</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PcSpotlightBar',
  props: {
    pcs: { type: Array, required: true },
    activePcId: { type: String, default: null },
    spotlight: { type: String, required: true },
    spotlightTokens: { type: Object, default: () => ({}) },
    totalTokens: { type: Number, default: 0 }
  },
  emits: ['give-spotlight', 'remove-token', 'gm-spotlight'],
  methods: {
    getTokens(pcId) {
      return this.spotlightTokens[pcId] || 0
    }
  }
}
</script>

<style scoped>
.pc-spot {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.pc-spot__pcs {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
  flex: 1;
}

.pc-spot__pc {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 2px solid transparent;
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  font-size: var(--font-xs);
}

.pc-spot__pc:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-active);
}

.pc-spot__pc--active {
  border-color: var(--color-accent-hope);
}

.pc-spot__pc--spotlight {
  background: rgba(83, 168, 182, 0.08);
  box-shadow: 0 0 0 1px var(--color-accent-hope);
}

.pc-spot__name {
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.pc-spot__class {
  color: var(--color-text-muted);
}

.pc-spot__tokens {
  display: flex;
  gap: 2px;
  align-items: center;
  margin-left: 2px;
}

.pc-spot__token {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  background: var(--color-accent-gold);
  box-shadow: 0 0 3px rgba(224, 165, 38, 0.5);
}

.pc-spot__remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
  font-size: 0.65rem;
  cursor: pointer;
  padding: 0;
  margin-left: 2px;
  line-height: 1;
}

.pc-spot__remove:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

/* ── Partie droite : MJ + total ── */

.pc-spot__right {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  flex-shrink: 0;
}

.pc-spot__gm {
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  font-size: var(--font-xs);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.pc-spot__gm:hover {
  border-color: var(--color-accent-fear);
  color: var(--color-accent-fear);
}

.pc-spot__gm--active {
  border-color: var(--color-accent-fear);
  background: rgba(200, 75, 49, 0.1);
  color: var(--color-accent-fear);
}

.pc-spot__total {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-semibold);
  font-variant-numeric: tabular-nums;
  min-width: 18px;
  text-align: center;
}

/* ── Responsive ── */

@media (max-width: 480px) {
  .pc-spot {
    flex-direction: column;
    align-items: stretch;
  }

  .pc-spot__right {
    justify-content: flex-end;
    padding-top: var(--space-xs);
    border-top: 1px solid var(--color-border);
  }
}
</style>
