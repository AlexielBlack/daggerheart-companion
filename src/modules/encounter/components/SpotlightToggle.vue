<template>
  <button
    class="spotlight-toggle"
    :class="'spotlight-toggle--' + spotlight"
    :aria-label="'Projecteur : ' + (isPlayer ? 'Joueurs' : 'MJ') + '. Cliquer pour basculer.'"
    @click="$emit('toggle')"
  >
    <span
      class="spotlight-toggle__side spotlight-toggle__side--pc"
      :class="{ 'spotlight-toggle__side--active': isPlayer }"
    >
      <span class="spotlight-toggle__emoji">🎭</span>
      <span class="spotlight-toggle__text">PJ</span>
    </span>
    <span
      class="spotlight-toggle__indicator"
      :class="'spotlight-toggle__indicator--' + spotlight"
    ></span>
    <span
      class="spotlight-toggle__side spotlight-toggle__side--gm"
      :class="{ 'spotlight-toggle__side--active': !isPlayer }"
    >
      <span class="spotlight-toggle__text">MJ</span>
      <span class="spotlight-toggle__emoji">💀</span>
    </span>
  </button>
</template>

<script>
export default {
  name: 'SpotlightToggle',
  props: {
    spotlight: { type: String, required: true }
  },
  emits: ['toggle'],
  computed: {
    isPlayer() { return this.spotlight === 'pc' }
  }
}
</script>

<style scoped>
.spotlight-toggle {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 2px;
  border-radius: var(--radius-full);
  border: 2px solid var(--color-border);
  background: var(--color-bg-primary);
  cursor: pointer;
  transition: border-color 0.2s;
  min-width: 140px;
}

.spotlight-toggle--pc {
  border-color: var(--color-accent-hope);
}

.spotlight-toggle--gm {
  border-color: var(--color-accent-fear);
}

.spotlight-toggle__side {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  color: var(--color-text-muted);
  transition: all 0.2s;
}

.spotlight-toggle__side--active {
  color: var(--color-text-primary);
}

.spotlight-toggle__side--pc.spotlight-toggle__side--active {
  background: rgba(83, 168, 182, 0.15);
}

.spotlight-toggle__side--gm.spotlight-toggle__side--active {
  background: rgba(200, 75, 49, 0.15);
}

.spotlight-toggle__indicator {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
  transition: background 0.2s, box-shadow 0.2s;
}

.spotlight-toggle__indicator--pc {
  background: var(--color-accent-hope);
  box-shadow: 0 0 6px var(--color-accent-hope);
}

.spotlight-toggle__indicator--gm {
  background: var(--color-accent-fear);
  box-shadow: 0 0 6px var(--color-accent-fear);
}

.spotlight-toggle__emoji {
  font-size: 1rem;
  line-height: 1;
}

.spotlight-toggle__text {
  line-height: 1;
}
</style>
