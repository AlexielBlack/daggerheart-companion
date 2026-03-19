<template>
  <article
    v-if="npc"
    class="npc-preview"
  >
    <header class="npc-preview__header">
      <h3>{{ npc.name }}</h3>
      <span
        v-if="npc.title"
        class="npc-preview__title"
      >{{ npc.title }}</span>
      <span
        class="npc-preview__status"
        :class="`npc-preview__status--${npc.status || 'neutral'}`"
      >{{ statusLabel }}</span>
    </header>

    <dl class="npc-preview__details">
      <template v-if="npc.faction">
        <dt>Faction</dt>
        <dd>{{ npc.faction }}</dd>
      </template>
      <template v-if="npc.location">
        <dt>Lieu</dt>
        <dd>{{ npc.location }}</dd>
      </template>
    </dl>

    <p
      v-if="npc.description"
      class="npc-preview__desc"
    >
      {{ npc.description }}
    </p>

    <section v-if="npc.relations && npc.relations.length">
      <h4>Relations PJ</h4>
      <ul class="npc-preview__relations">
        <li
          v-for="rel in npc.relations"
          :key="rel.characterId"
        >
          {{ rel.characterName }} — {{ rel.description }}
        </li>
      </ul>
    </section>

    <section v-if="npc.combatProfile">
      <h4>Profil combat</h4>
      <p>{{ npc.combatProfile }}</p>
    </section>

    <div class="npc-preview__actions">
      <button
        class="npc-preview__scene-btn"
        :class="{ 'npc-preview__scene-btn--active': isInScene }"
        @click="toggleScene"
      >
        {{ isInScene ? 'Retirer de la scene' : 'Ajouter a la scene' }}
      </button>
      <router-link
        :to="`/table/prep/pnjs`"
        class="npc-preview__edit"
      >
        Editer
      </router-link>
    </div>
  </article>
  <p v-else>
    PNJ introuvable.
  </p>
</template>

<script>
import { computed } from 'vue'
import { useNpcStore } from '@modules/npcs'
import { useSessionStore } from '../stores/sessionStore'

const STATUS_LABELS = {
  ally: 'Allie',
  neutral: 'Neutre',
  hostile: 'Hostile',
  dead: 'Mort',
  missing: 'Disparu'
}

export default {
  name: 'NpcPreviewSheet',
  props: {
    npcId: { type: String, required: true }
  },
  setup(props) {
    const npcStore = useNpcStore()
    const sessionStore = useSessionStore()
    const npc = computed(() => npcStore.getById(props.npcId))
    const statusLabel = computed(() => STATUS_LABELS[npc.value?.status] || 'Neutre')
    const isInScene = computed(() => sessionStore.loadedNpcIds.includes(props.npcId))

    function toggleScene() {
      sessionStore.toggleNpc(props.npcId)
    }

    return { npc, statusLabel, isInScene, toggleScene }
  }
}
</script>

<style scoped>
.npc-preview__header { margin-bottom: var(--space-md, 1rem); }
.npc-preview__header h3 { margin: 0; }
.npc-preview__title { color: var(--color-text-secondary, #aaa); font-style: italic; }
.npc-preview__status { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 0.8em; margin-top: var(--space-xs, 0.25rem); }
.npc-preview__status--ally { background: #16a34a33; color: #22c55e; }
.npc-preview__status--hostile { background: #dc262633; color: #ef4444; }
.npc-preview__status--neutral { background: #6b728033; color: #9ca3af; }
.npc-preview__status--dead { background: #6b728022; color: #6b7280; opacity: 0.6; }
.npc-preview__status--missing { background: #f9731633; color: #f97316; }
.npc-preview__details { display: grid; grid-template-columns: auto 1fr; gap: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem); }
.npc-preview__details dt { color: var(--color-text-secondary, #aaa); }
.npc-preview__desc { white-space: pre-wrap; }
.npc-preview__relations { list-style: disc; padding-left: 1.5em; }
.npc-preview__actions { display: flex; gap: var(--space-sm, 0.5rem); align-items: center; margin-top: var(--space-md, 1rem); flex-wrap: wrap; }
.npc-preview__scene-btn { padding: var(--space-xs, 0.25rem) var(--space-md, 1rem); border-radius: var(--radius-sm, 4px); border: 1px solid var(--color-accent-success, #16a34a); background: var(--color-accent-success, #16a34a); color: #fff; cursor: pointer; font-size: var(--font-size-sm, 0.875rem); font-weight: var(--font-weight-medium, 500); transition: all var(--transition-fast, 0.15s); }
.npc-preview__scene-btn:hover { opacity: 0.9; }
.npc-preview__scene-btn--active { background: var(--color-accent-danger, #dc2626); border-color: var(--color-accent-danger, #dc2626); }
.npc-preview__edit { display: inline-block; color: var(--color-hope, #f0c040); }
</style>
