<template>
  <div
    class="spot-tracker"
    role="region"
    aria-label="Tracker de projecteur"
  >
    <div class="spot-tracker__header">
      <h3 class="spot-tracker__title">
        🔦 Projecteur
      </h3>
      <span class="spot-tracker__total">{{ totalTokens }} tour{{ totalTokens > 1 ? 's' : '' }} ce round</span>
    </div>

    <div class="spot-tracker__pcs">
      <div
        v-for="pc in pcs"
        :key="pc.id"
        class="spot-tracker__pc"
        :class="{ 'spot-tracker__pc--active': activePcId === pc.id }"
      >
        <button
          class="spot-tracker__give-btn"
          :title="'Donner le projecteur à ' + pc.name"
          :aria-label="'Donner le projecteur à ' + pc.name"
          @click="$emit('give-spotlight', pc.id)"
        >
          <span class="spot-tracker__pc-name">{{ pc.name }}</span>
        </button>

        <div
          class="spot-tracker__tokens"
          aria-label="Tokens projecteur"
        >
          <span
            v-for="i in getTokens(pc.id)"
            :key="i"
            class="spot-tracker__token"
          ></span>
          <span
            v-if="getTokens(pc.id) === 0"
            class="spot-tracker__no-token"
          >—</span>
        </div>

        <button
          v-if="getTokens(pc.id) > 0"
          class="spot-tracker__remove-btn"
          :aria-label="'Retirer un token de ' + pc.name"
          @click="$emit('remove-token', pc.id)"
        >
          ×
        </button>
      </div>
    </div>

    <div class="spot-tracker__gm">
      <button
        class="spot-tracker__gm-btn"
        :class="{ 'spot-tracker__gm-btn--active': spotlight === 'gm' }"
        aria-label="Donner le projecteur au MJ"
        @click="$emit('gm-spotlight')"
      >
        <span>💀 Tour du MJ</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SpotlightTracker',
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
.spot-tracker {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.spot-tracker__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.spot-tracker__title {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.spot-tracker__total {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  margin-left: auto;
}

.spot-tracker__pcs {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.spot-tracker__pc {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 3px var(--space-xs);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  border: 1px solid transparent;
  transition: border-color 0.15s;
}

.spot-tracker__pc--active {
  border-color: var(--color-accent-hope);
}

.spot-tracker__give-btn {
  flex: 1;
  display: flex;
  align-items: center;
  padding: var(--space-xs) var(--space-sm);
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
}

.spot-tracker__give-btn:hover {
  background: var(--color-bg-elevated);
  border-radius: var(--radius-sm);
}

.spot-tracker__pc-name {
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-primary);
}

.spot-tracker__tokens {
  display: flex;
  gap: 3px;
  align-items: center;
  min-width: 36px;
}

.spot-tracker__token {
  width: 12px;
  height: 12px;
  border-radius: var(--radius-full);
  background: var(--color-accent-gold);
  box-shadow: 0 0 4px rgba(224, 165, 38, 0.5);
}

.spot-tracker__no-token {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
}

.spot-tracker__remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: var(--radius-full);
  border: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  color: var(--color-text-muted);
  font-size: 0.7rem;
  cursor: pointer;
  padding: 0;
}

.spot-tracker__remove-btn:hover {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.spot-tracker__gm {
  padding-top: var(--space-xs);
  border-top: 1px solid var(--color-border);
}

.spot-tracker__gm-btn {
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.15s;
}

.spot-tracker__gm-btn:hover {
  border-color: var(--color-accent-fear);
  color: var(--color-accent-fear);
}

.spot-tracker__gm-btn--active {
  border-color: var(--color-accent-fear);
  background: rgba(200, 75, 49, 0.1);
  color: var(--color-accent-fear);
}
</style>
