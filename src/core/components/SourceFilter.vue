<template>
  <div
    class="source-filter"
    role="group"
    aria-label="Filtrer par source"
  >
    <button
      v-for="option in options"
      :key="option.value"
      class="source-filter__btn"
      :class="{ 'source-filter__btn--active': modelValue === option.value }"
      :aria-pressed="String(modelValue === option.value)"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'SourceFilter',
  props: {
    modelValue: { type: String, default: 'all' }
  },
  emits: ['update:modelValue'],
  setup() {
    // Options de filtrage par source
    const options = [
      { value: 'all', label: 'Tous' },
      { value: 'srd', label: 'SRD' },
      { value: 'custom', label: 'Custom' }
    ]
    return { options }
  }
}
</script>

<style scoped>
.source-filter {
  display: inline-flex;
  gap: 2px;
  background: var(--color-surface-alt, rgba(255,255,255,0.05));
  border-radius: var(--radius-sm, 4px);
  padding: 2px;
}

.source-filter__btn {
  padding: 4px 10px;
  font-size: 0.8em;
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #aaa);
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s);
}

.source-filter__btn:hover {
  color: var(--color-text, #fff);
}

.source-filter__btn--active {
  background: var(--color-hope, #f0c040);
  color: var(--color-surface, #1a1a2e);
  font-weight: 600;
}
</style>
