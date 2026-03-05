<!--
  NpcCard.vue — Carte compacte d'un PNJ pour affichage en liste.
  Affiche nom, titre, statut, faction et lieu.
-->
<template>
  <article
    class="npc-card"
    :class="[
      `npc-card--${npc.status || 'neutral'}`,
      { 'npc-card--selected': isSelected }
    ]"
    role="button"
    tabindex="0"
    :aria-label="`PNJ : ${npc.name}${npc.title ? `, ${npc.title}` : ''}`"
    :aria-pressed="isSelected"
    @click="$emit('select', npc.id)"
    @keydown.enter="$emit('select', npc.id)"
    @keydown.space.prevent="$emit('select', npc.id)"
  >
    <div class="npc-card__header">
      <span
        class="npc-card__status"
        :title="statusLabel"
        aria-hidden="true"
      >{{ statusEmoji }}</span>
      <h3 class="npc-card__name">
        {{ npc.name }}
      </h3>
    </div>

    <p
      v-if="npc.title"
      class="npc-card__title"
    >
      {{ npc.title }}
    </p>

    <div class="npc-card__meta">
      <span
        v-if="npc.classId"
        class="npc-card__tag npc-card__tag--class"
      >{{ classLabel }}</span>
      <span
        v-if="npc.faction"
        class="npc-card__tag"
      >🏴 {{ npc.faction }}</span>
      <span
        v-if="npc.location"
        class="npc-card__tag"
      >📍 {{ npc.location }}</span>
      <span
        v-if="npc.difficulty"
        class="npc-card__tag"
      >🎯 {{ npc.difficulty }}</span>
    </div>

    <p
      v-if="npc.motives"
      class="npc-card__motives"
    >
      {{ truncate(npc.motives, 80) }}
    </p>
  </article>
</template>

<script>
import { computed } from 'vue'
import { NPC_STATUS_META, NPC_STATUS_NEUTRAL } from '../constants.js'
import { CLASSES } from '@data/classes'

export default {
  name: 'NpcCard',

  props: {
    npc: {
      type: Object,
      required: true
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },

  emits: ['select'],

  setup(props) {
    const statusMeta = computed(() =>
      NPC_STATUS_META[props.npc.status] || NPC_STATUS_META[NPC_STATUS_NEUTRAL]
    )

    const statusEmoji = computed(() => statusMeta.value.emoji)
    const statusLabel = computed(() => statusMeta.value.label)

    const classLabel = computed(() => {
      if (!props.npc.classId) return ''
      const cls = CLASSES.find((c) => c.id === props.npc.classId)
      const name = cls ? cls.name : props.npc.classId
      const emoji = cls ? cls.emoji : '🛠️'
      const lvl = props.npc.level ? ` Lv.${props.npc.level}` : ''
      return `${emoji} ${name}${lvl}`
    })

    function truncate(text, max) {
      if (!text || text.length <= max) return text
      return text.slice(0, max).trimEnd() + '…'
    }

    return { statusEmoji, statusLabel, classLabel, truncate }
  }
}
</script>

<style scoped>
.npc-card {
  padding: 0.75rem 1rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 8px;
  background: var(--color-surface, #1f2937);
  cursor: pointer;
  transition: border-color 0.15s, background-color 0.15s;
}

.npc-card:hover,
.npc-card:focus-visible {
  border-color: var(--color-primary, #60a5fa);
  outline: none;
}

.npc-card--selected {
  border-color: var(--color-primary, #60a5fa);
  background: var(--color-surface-alt, #1e3a5f);
}

.npc-card--dead {
  opacity: 0.6;
}

.npc-card__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.npc-card__status {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.npc-card__name {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text, #f9fafb);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.npc-card__title {
  margin: 0.15rem 0 0;
  font-size: 0.8rem;
  color: var(--color-text-muted, #9ca3af);
  font-style: italic;
}

.npc-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.4rem;
}

.npc-card__tag {
  font-size: 0.7rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: var(--color-tag-bg, #374151);
  color: var(--color-text-muted, #9ca3af);
  white-space: nowrap;
}

.npc-card__tag--class {
  background: #1e3a5f;
  color: #93c5fd;
}

.npc-card__motives {
  margin: 0.35rem 0 0;
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
  line-height: 1.3;
}
</style>
