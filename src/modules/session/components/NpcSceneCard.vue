<template>
  <article
    class="npc-scene-card"
    :aria-label="npc.name"
  >
    <!-- Header -->
    <div class="npc-scene-card__header">
      <span
        class="npc-scene-card__dot"
        aria-hidden="true"
        :style="{ background: statusMeta.color }"
      ></span>
      <button
        class="npc-scene-card__name-btn"
        :aria-label="'Voir les details de ' + npc.name"
        @click="$emit('open-details', npc.id)"
      >
        <span class="npc-scene-card__name">{{ npc.name }}</span>
        <span
          v-if="npc.title"
          class="npc-scene-card__title"
        >{{ npc.title }}</span>
      </button>
      <button
        class="npc-scene-card__remove-btn"
        :aria-label="'Retirer ' + npc.name + ' de la session'"
        @click="$emit('remove', npc.id)"
      >
        &#x2715;
      </button>
    </div>

    <!-- Sous-header -->
    <div
      v-if="subheader"
      class="npc-scene-card__subheader"
    >
      {{ subheader }}
    </div>

    <!-- Notes -->
    <textarea
      class="npc-scene-card__notes"
      :value="npc.notes"
      :aria-label="'Notes pour ' + npc.name"
      placeholder="Notes sur ce PNJ..."
      rows="2"
      @input="onNotesInput($event.target.value)"
    ></textarea>
  </article>
</template>

<script>
import { computed } from 'vue'
import { useNpcStore, NPC_STATUS_META } from '@modules/npcs'

export default {
  name: 'NpcSceneCard',

  props: {
    npc: { type: Object, required: true }
  },

  emits: ['remove', 'open-details'],

  setup(props) {
    const npcStore = useNpcStore()
    let debounceTimer = null

    const statusMeta = computed(() => {
      return NPC_STATUS_META[props.npc.status] || NPC_STATUS_META.neutral
    })

    const subheader = computed(() => {
      const parts = []
      if (statusMeta.value.label) parts.push(statusMeta.value.label)
      if (props.npc.faction) parts.push(props.npc.faction)
      return parts.join(' · ')
    })

    function onNotesInput(value) {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        const clone = npcStore.getById(props.npc.id)
        if (clone) {
          clone.notes = value
          npcStore.update(props.npc.id, clone)
        }
      }, 500)
    }

    return { statusMeta, subheader, onNotesInput }
  }
}
</script>

<style scoped>
.npc-scene-card {
  background: var(--color-bg-elevated, #1e1e2e);
  border: 1px solid var(--color-border, rgba(255,255,255,0.1));
  border-radius: var(--radius-md, 8px);
  padding: var(--space-sm, 0.5rem);
  display: flex;
  flex-direction: column;
  gap: var(--space-xs, 0.25rem);
}

.npc-scene-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-xs, 0.25rem);
}

.npc-scene-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.npc-scene-card__name-btn {
  flex: 1;
  background: none;
  border: none;
  color: var(--color-text-primary, #fff);
  cursor: pointer;
  text-align: left;
  padding: 0;
  display: flex;
  align-items: baseline;
  gap: var(--space-xs, 0.25rem);
}

.npc-scene-card__name-btn:hover {
  text-decoration: underline;
}

.npc-scene-card__name {
  font-weight: var(--font-weight-bold, 700);
  font-size: var(--font-size-md, 1rem);
}

.npc-scene-card__title {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-muted, #888);
}

.npc-scene-card__remove-btn {
  background: none;
  border: none;
  color: var(--color-text-muted, #888);
  cursor: pointer;
  padding: 2px 4px;
  font-size: 0.8em;
  flex-shrink: 0;
}

.npc-scene-card__remove-btn:hover {
  color: var(--color-accent-danger, #dc2626);
}

.npc-scene-card__subheader {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-secondary, #aaa);
  padding-left: calc(8px + var(--space-xs, 0.25rem));
}

.npc-scene-card__notes {
  width: 100%;
  resize: vertical;
  background: var(--color-bg-primary, #121220);
  color: var(--color-text-primary, #fff);
  border: 1px solid var(--color-border, rgba(255,255,255,0.1));
  border-radius: var(--radius-sm, 4px);
  padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
  font-size: var(--font-size-sm, 0.875rem);
  font-family: inherit;
}

.npc-scene-card__notes::placeholder {
  color: var(--color-text-muted, #888);
}
</style>
