<template>
  <div
    class="scene-mode"
    role="radiogroup"
    aria-label="Mode de scène"
  >
    <button
      v-for="mode in modes"
      :key="mode.id"
      class="scene-mode__btn"
      :class="{ 'scene-mode__btn--active': modelValue === mode.id }"
      :style="modelValue === mode.id ? { borderColor: mode.color, color: mode.color } : {}"
      role="radio"
      :aria-checked="modelValue === mode.id"
      :aria-label="mode.label"
      :title="mode.description"
      @click="$emit('update:modelValue', mode.id)"
    >
      <span class="scene-mode__emoji">{{ mode.emoji }}</span>
      <span class="scene-mode__label">{{ mode.label }}</span>
    </button>
  </div>
</template>

<script>
import { SCENE_MODES, SCENE_MODE_META } from '@data/encounters/liveConstants'

export default {
  name: 'SceneModeSelector',
  props: {
    modelValue: { type: String, required: true }
  },
  emits: ['update:modelValue'],
  computed: {
    modes() {
      return SCENE_MODES.map((id) => ({
        id,
        ...SCENE_MODE_META[id]
      }))
    }
  }
}
</script>

<style scoped>
.scene-mode {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.scene-mode__btn {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  border: 2px solid var(--color-border);
  background: var(--color-bg-primary);
  color: var(--color-text-secondary);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.scene-mode__btn:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-active);
}

.scene-mode__btn--active {
  background: var(--color-bg-surface);
  font-weight: var(--font-bold);
}

.scene-mode__emoji {
  font-size: 1.1rem;
  line-height: 1;
}

.scene-mode__label {
  line-height: 1;
}

@media (max-width: 480px) {
  .scene-mode {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
</style>
