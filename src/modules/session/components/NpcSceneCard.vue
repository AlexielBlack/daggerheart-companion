<template>
  <article
    class="npc-scene-card"
    :class="{ 'npc-scene-card--spotlight': isSpotlight }"
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
        class="npc-scene-card__spotlight-btn"
        :class="{ 'npc-scene-card__spotlight-btn--active': isSpotlight }"
        :aria-label="isSpotlight ? 'Retirer la mise en avant de ' + npc.name : 'Mettre en avant ' + npc.name"
        :aria-pressed="String(isSpotlight)"
        @click="$emit('spotlight', npc.id)"
      >
        &#x1F3AF;
      </button>
      <button
        class="npc-scene-card__remove-btn"
        :aria-label="'Retirer ' + npc.name + ' de la session'"
        @click="$emit('remove', npc.id)"
      >
        &#x2715;
      </button>
    </div>

    <!-- Sous-header : statut + faction + lieu -->
    <div
      v-if="subheader"
      class="npc-scene-card__subheader"
    >
      {{ subheader }}
    </div>

    <!-- Relations PJ (toujours visibles — info critique) -->
    <ul
      v-if="pcRelationsList.length"
      class="npc-scene-card__relations"
    >
      <li
        v-for="rel in pcRelationsList"
        :key="rel.pcId"
        class="npc-scene-card__relation"
      >
        <span
          class="npc-scene-card__rel-dot"
          :style="{ background: rel.color }"
          aria-hidden="true"
        ></span>
        <span class="npc-scene-card__rel-name">{{ rel.name }}</span>
        <span class="npc-scene-card__rel-disp">{{ rel.label }}</span>
        <span
          v-if="rel.note"
          class="npc-scene-card__rel-note"
        >— {{ rel.note }}</span>
      </li>
    </ul>

    <!-- Profil complet + Notes (vue unifiee) -->
    <div
      v-if="hasProfile || true"
      class="npc-scene-card__body"
    >
      <!-- Champs profil narratif -->
      <p
        v-if="npc.ancestry"
        class="npc-scene-card__field"
      >
        <span class="npc-scene-card__label">Ascendance</span>
        {{ npc.ancestry }}
      </p>
      <p
        v-if="npc.description"
        class="npc-scene-card__field"
      >
        {{ npc.description }}
      </p>
      <p
        v-if="npc.personality"
        class="npc-scene-card__field"
      >
        <span class="npc-scene-card__label">Personnalite</span>
        {{ npc.personality }}
      </p>
      <p
        v-if="npc.contradiction"
        class="npc-scene-card__field"
      >
        <span class="npc-scene-card__label">Contradiction</span>
        {{ npc.contradiction }}
      </p>
      <p
        v-if="npc.importance"
        class="npc-scene-card__field"
      >
        <span class="npc-scene-card__label">Importance</span>
        {{ npc.importance }}
      </p>
      <p
        v-if="npc.ambition"
        class="npc-scene-card__field"
      >
        <span class="npc-scene-card__label">Ambition</span>
        {{ npc.ambition }}
      </p>
      <p
        v-if="npc.moyens"
        class="npc-scene-card__field"
      >
        <span class="npc-scene-card__label">Moyens</span>
        {{ npc.moyens }}
      </p>
      <p
        v-if="npc.activeProblem"
        class="npc-scene-card__field"
      >
        <span class="npc-scene-card__label">Probleme actif</span>
        {{ npc.activeProblem }}
      </p>

      <!-- Relations PNJ -->
      <ul
        v-if="npcRelationsList.length"
        class="npc-scene-card__relations npc-scene-card__relations--inner"
      >
        <li
          v-for="rel in npcRelationsList"
          :key="rel.targetNpcId"
          class="npc-scene-card__relation"
        >
          <span class="npc-scene-card__rel-type">{{ rel.typeLabel }}</span>
          <span class="npc-scene-card__rel-name">{{ rel.name }}</span>
          <span
            v-if="rel.note"
            class="npc-scene-card__rel-note"
          >— {{ rel.note }}</span>
        </li>
      </ul>

      <!-- Notes de session -->
      <div class="npc-scene-card__notes-section">
        <span
          v-if="isSaving"
          class="npc-scene-card__saving"
          aria-live="polite"
        >Sauvegarde...</span>
        <textarea
          class="npc-scene-card__notes"
          :value="npc.notes"
          :aria-label="'Notes pour ' + npc.name"
          placeholder="Notes sur ce PNJ..."
          rows="3"
          @input="onNotesInput($event.target.value)"
          @blur="flushNotes"
        ></textarea>
      </div>
    </div>
  </article>
</template>

<script>
import { computed } from 'vue'
import { useNpcStore, NPC_STATUS_META, DISPOSITION_META, RELATION_TYPE_META } from '@modules/npcs'
import { useCharacterStore } from '@modules/characters'
import { useSaveIndicator } from '../composables/useSaveIndicator'

export default {
  name: 'NpcSceneCard',

  props: {
    npc: { type: Object, required: true },
    isSpotlight: { type: Boolean, default: false }
  },

  emits: ['remove', 'open-details', 'spotlight'],

  setup(props) {
    const npcStore = useNpcStore()
    const characterStore = useCharacterStore()
    const { isSaving, markDirty, markSaved } = useSaveIndicator()
    let debounceTimer = null

    const statusMeta = computed(() => {
      return NPC_STATUS_META[props.npc.status] || NPC_STATUS_META.neutral
    })

    const subheader = computed(() => {
      const parts = []
      if (statusMeta.value.label) parts.push(statusMeta.value.label)
      if (props.npc.faction) parts.push(props.npc.faction)
      if (props.npc.location) parts.push(props.npc.location)
      return parts.join(' \u00B7 ')
    })

    /** Relations PJ avec noms resolus et meta disposition */
    const pcRelationsList = computed(() => {
      const rels = props.npc.pcRelations
      if (!Array.isArray(rels) || rels.length === 0) return []
      return rels.map(rel => {
        const pc = characterStore.getById?.(rel.pcId)
        const meta = DISPOSITION_META[rel.disposition] || DISPOSITION_META[0]
        return {
          pcId: rel.pcId,
          name: pc?.name || rel.pcId,
          label: meta.label,
          color: meta.color,
          note: rel.note || ''
        }
      })
    })

    /** Relations PNJ avec noms resolus et type */
    const npcRelationsList = computed(() => {
      const rels = props.npc.npcRelations
      if (!Array.isArray(rels) || rels.length === 0) return []
      return rels.map(rel => {
        const target = npcStore.getById(rel.targetNpcId)
        const meta = RELATION_TYPE_META[rel.type] || RELATION_TYPE_META.other
        return {
          targetNpcId: rel.targetNpcId,
          name: target?.name || rel.targetNpcId,
          typeLabel: meta.label,
          note: rel.note || ''
        }
      })
    })

    /** Verifie si le PNJ a du contenu profil */
    const hasProfile = computed(() => {
      return !!(props.npc.description || props.npc.personality ||
                props.npc.contradiction || props.npc.ancestry ||
                props.npc.importance || props.npc.ambition ||
                props.npc.moyens || props.npc.activeProblem ||
                (npcRelationsList.value && npcRelationsList.value.length > 0))
    })

    function onNotesInput(value) {
      markDirty()
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        const clone = npcStore.getById(props.npc.id)
        if (clone) {
          clone.notes = value
          npcStore.update(props.npc.id, clone)
        }
        markSaved()
      }, 500)
    }

    function flushNotes(event) {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
        debounceTimer = null
        const value = event.target.value
        const clone = npcStore.getById(props.npc.id)
        if (clone) {
          clone.notes = value
          npcStore.update(props.npc.id, clone)
        }
        markSaved()
      }
    }

    return {
      statusMeta, subheader,
      pcRelationsList, npcRelationsList,
      hasProfile,
      onNotesInput, flushNotes, isSaving
    }
  }
}
</script>

<style scoped>
.npc-scene-card {
  background: var(--color-bg-elevated, #1e1e2e);
  border: 1px solid var(--color-border, rgba(255,255,255,0.1));
  border-radius: var(--radius-md, 8px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.npc-scene-card__header {
  display: flex;
  align-items: center;
  gap: var(--space-xs, 0.25rem);
  padding: var(--space-sm, 0.5rem);
  padding-bottom: 0;
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
  padding: 0 var(--space-sm, 0.5rem);
  padding-left: calc(var(--space-sm, 0.5rem) + 8px + var(--space-xs, 0.25rem));
}

/* ── Relations PJ (toujours visibles) ── */

.npc-scene-card__relations {
  list-style: none;
  padding: 0;
  margin: 0;
  padding-left: calc(var(--space-sm, 0.5rem) + 8px + var(--space-xs, 0.25rem));
  padding-right: var(--space-sm, 0.5rem);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.npc-scene-card__relations--inner {
  padding-left: 0;
  padding-right: 0;
  margin-top: var(--space-sm);
}

.npc-scene-card__relation {
  font-size: var(--font-size-xs, 0.75rem);
  display: flex;
  align-items: center;
  gap: var(--space-xs, 0.25rem);
  flex-wrap: wrap;
}

.npc-scene-card__rel-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.npc-scene-card__rel-name {
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-primary, #fff);
}

.npc-scene-card__rel-disp {
  color: var(--color-text-muted, #999);
}

.npc-scene-card__rel-type {
  color: var(--color-text-muted, #999);
  font-style: italic;
}

.npc-scene-card__rel-note {
  color: var(--color-text-muted, #888);
}

/* ── Corps unifie (profil + notes) ── */

.npc-scene-card__body {
  border-top: 1px solid var(--color-border, rgba(255,255,255,0.1));
  margin-top: var(--space-xs, 0.25rem);
  padding: var(--space-sm, 0.5rem);
}

.npc-scene-card__notes-section {
  margin-top: var(--space-sm, 0.5rem);
  padding-top: var(--space-sm, 0.5rem);
  border-top: 1px solid var(--color-border, rgba(255,255,255,0.08));
}

/* ── Champs profil ── */

.npc-scene-card__field {
  font-size: var(--font-size-sm, 0.875rem);
  color: var(--color-text-secondary, #ccc);
  margin: 0 0 var(--space-xs);
  white-space: pre-wrap;
}

.npc-scene-card__field:last-child {
  margin-bottom: 0;
}

.npc-scene-card__label {
  font-weight: var(--font-weight-medium, 500);
  color: var(--color-text-muted, #999);
  margin-right: var(--space-xs, 0.25rem);
}

.npc-scene-card__label::after {
  content: ' :';
}

/* ── Notes ── */

.npc-scene-card__notes {
  width: 100%;
  min-height: 4rem;
  resize: vertical;
  background: var(--color-bg-primary, #121220);
  color: var(--color-text-primary, #fff);
  border: 1px solid var(--color-border, rgba(255,255,255,0.1));
  border-radius: var(--radius-sm, 4px);
  padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
  font-size: var(--font-size-sm, 0.875rem);
  font-family: inherit;
  line-height: var(--line-height-normal, 1.5);
  outline: none;
  transition: border-color var(--transition-fast, 0.15s);
}

.npc-scene-card__notes:focus {
  border-color: var(--color-accent-hope, #53a8b6);
  box-shadow: 0 0 0 2px rgba(83, 168, 182, 0.2);
}

.npc-scene-card__notes::placeholder {
  color: var(--color-text-muted, #888);
}

/* ── Spotlight ── */

.npc-scene-card--spotlight {
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 12px rgba(83, 168, 182, 0.25);
  transform: scale(1.02);
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.npc-scene-card__spotlight-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 2px 4px;
  font-size: 0.8em;
  flex-shrink: 0;
  opacity: 0.4;
  transition: opacity var(--transition-fast);
}

.npc-scene-card__spotlight-btn:hover {
  opacity: 0.8;
}

.npc-scene-card__spotlight-btn--active {
  opacity: 1;
  color: var(--color-accent-hope);
}

.npc-scene-card__saving {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
  margin-bottom: var(--space-xs);
  animation: npc-pulse 1s infinite;
}

@keyframes npc-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>
