<template>
  <span
    v-if="source === 'custom'"
    class="source-badge"
    aria-label="Contenu custom"
  >
    CUSTOM
  </span>
</template>

<script>
export default {
  name: 'SourceBadge',
  props: {
    source: { type: String, default: '' }
  }
}
</script>

<style scoped>
.source-badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 0.65em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-surface, #1a1a2e);
  background: var(--color-hope, #f0c040);
  border-radius: var(--radius-sm, 4px);
  vertical-align: middle;
}
</style>
