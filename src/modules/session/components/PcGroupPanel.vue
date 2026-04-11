<template>
  <section
    class="pc-group"
    aria-label="Groupe de personnages"
  >
    <!-- En-tete du panel -->
    <div class="pc-group__header">
      <h3 class="pc-group__title">
        <span aria-hidden="true">&#x1F465;</span>
        Personnages ({{ visibleList.length }})
      </h3>
      <div class="pc-group__actions">
        <div
          class="pc-group__columns-control"
          role="group"
          aria-label="Nombre de colonnes"
        >
          <label
            for="pc-columns-slider"
            class="pc-group__columns-label"
          >
            {{ cardColumns === 0 ? 'Auto' : cardColumns + ' col.' }}
          </label>
          <input
            id="pc-columns-slider"
            v-model.number="cardColumns"
            type="range"
            min="0"
            max="4"
            step="1"
            class="pc-group__columns-slider"
            aria-label="Largeur des cartes"
            :list="'pc-columns-ticks'"
          />
          <datalist id="pc-columns-ticks">
            <option
              v-for="opt in COLUMN_OPTIONS"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            ></option>
          </datalist>
        </div>
        <router-link
          to="/table/prep/personnages"
          class="pc-group__edit-link"
          aria-label="Editer les personnages"
        >
          &#x270F;&#xFE0F; Editer
        </router-link>
      </div>
    </div>

    <!-- Etat vide -->
    <p
      v-if="visibleList.length === 0 && hiddenList.length === 0"
      class="pc-group__empty"
    >
      Aucun personnage cree.
      <router-link to="/table/prep/personnages">
        Creer un personnage
      </router-link>
    </p>

    <!-- Grille de cartes PJ -->
    <div
      v-if="visibleList.length > 0"
      class="pc-group__grid"
      :class="{ 'pc-group__grid--custom': cardColumns > 0 }"
      :style="gridStyle"
      role="list"
      aria-label="Liste des personnages"
    >
      <PcCard
        v-for="pc in visibleList"
        :key="pc.id"
        :pc="pc"
        @select-pc="$emit('select-pc', $event)"
        @toggle-hidden="onToggleHidden"
      />
    </div>

    <!-- Bandeau PJs masques -->
    <div
      v-if="hiddenList.length > 0"
      class="pc-group__hidden-bar"
    >
      <button
        class="pc-group__hidden-toggle"
        :aria-expanded="String(showHidden)"
        @click="showHidden = !showHidden"
      >
        &#x1F441;&#xFE0F;&#x200D;&#x1F5E8;&#xFE0F;
        {{ hiddenList.length }} PJ{{ hiddenList.length > 1 ? 's' : '' }} masque{{ hiddenList.length > 1 ? 's' : '' }}
        <span class="pc-group__hidden-chevron">{{ showHidden ? '&#x25B2;' : '&#x25BC;' }}</span>
      </button>
      <div
        v-if="showHidden"
        class="pc-group__hidden-list"
      >
        <div
          v-for="pc in hiddenList"
          :key="pc.id"
          class="pc-group__hidden-chip"
        >
          <span>{{ pc.name || 'Sans nom' }}</span>
          <button
            class="pc-group__hidden-restore"
            :title="'Afficher ' + (pc.name || 'Sans nom')"
            :aria-label="'Afficher ' + (pc.name || 'Sans nom')"
            @click="onToggleHidden(pc.id)"
          >
            &#x2795;
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
/**
 * PcGroupPanel — Grille des personnages joueurs.
 * Conteneur orchestrant l'affichage des PcCard individuels
 * avec controle de colonnes et gestion des PJs masques.
 */
import { computed, ref } from 'vue'
import { resolveCharacterDisplay } from '@modules/characters/composables/useCharacterComputed'
import { useCharacterStore } from '@modules/characters'
import { useStorage } from '@core/composables/useStorage'
import PcCard from './PcCard.vue'

export default {
  name: 'PcGroupPanel',

  components: { PcCard },

  props: {
    characters: {
      type: Array,
      default: () => []
    }
  },

  emits: ['select-pc'],

  setup(props) {
    const characterStore = useCharacterStore()

    // ── Slider colonnes ──
    const { data: cardColumns } = useStorage('pc-group-columns', 0)
    const COLUMN_OPTIONS = [
      { value: 0, label: 'Auto' },
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' }
    ]

    const gridStyle = computed(() => {
      if (!cardColumns.value || cardColumns.value === 0) return {}
      return {
        'grid-template-columns': `repeat(${cardColumns.value}, 1fr)`
      }
    })

    // ── Personnages enrichis ──
    const enrichedCharacters = computed(() =>
      props.characters.map(resolveCharacterDisplay)
    )
    const visibleList = computed(() =>
      enrichedCharacters.value.filter((pc) => !pc.hidden)
    )
    const hiddenList = computed(() =>
      enrichedCharacters.value.filter((pc) => pc.hidden)
    )
    const showHidden = ref(false)

    function onToggleHidden(charId) {
      characterStore.toggleHidden(charId)
    }

    return {
      cardColumns, COLUMN_OPTIONS, gridStyle,
      visibleList, hiddenList,
      showHidden, onToggleHidden
    }
  }
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   PC GROUP — Container et en-tete
   ═══════════════════════════════════════════════ */

.pc-group__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.pc-group__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.pc-group__actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.pc-group__edit-link {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  min-height: var(--touch-min);
  display: inline-flex;
  align-items: center;
}

.pc-group__empty {
  color: var(--color-text-muted);
  padding: var(--space-lg) 0;
}

/* ═══════════════════════════════════════════════
   CONTROLE COLONNES
   ═══════════════════════════════════════════════ */

.pc-group__columns-control {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.pc-group__columns-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  min-width: 3em;
  text-align: right;
}

.pc-group__columns-slider {
  width: 80px;
  cursor: pointer;
  accent-color: var(--color-accent-primary);
}

/* ═══════════════════════════════════════════════
   GRILLE AUTO-RESPONSIVE
   ═══════════════════════════════════════════════ */

.pc-group__grid {
  display: grid;
  gap: var(--space-md);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .pc-group__grid:not(.pc-group__grid--custom) {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1400px) {
  .pc-group__grid:not(.pc-group__grid--custom) {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ═══════════════════════════════════════════════
   BANDEAU PJs MASQUES
   ═══════════════════════════════════════════════ */

.pc-group__hidden-bar {
  margin-top: var(--space-sm);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
}

.pc-group__hidden-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: color 0.15s;
}

.pc-group__hidden-toggle:hover {
  color: var(--color-text-secondary);
}

.pc-group__hidden-chevron {
  margin-left: auto;
  font-size: 0.6rem;
}

.pc-group__hidden-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  padding: 0 var(--space-sm) var(--space-sm);
}

.pc-group__hidden-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 3px var(--space-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.pc-group__hidden-restore {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  height: 1.2rem;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  font-size: 0.6rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.pc-group__hidden-restore:hover {
  opacity: 1;
}
</style>
