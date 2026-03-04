<template>
  <div
    class="pc-picker"
    aria-label="Sélection des personnages joueurs"
  >
    <p
      v-if="characters.length === 0"
      class="pc-picker__empty"
    >
      Aucun personnage créé. Utilisez le sélecteur manuel ci-dessus.
    </p>

    <ul
      v-else
      class="pc-picker__list"
      role="group"
      aria-label="Personnages disponibles"
    >
      <li
        v-for="pc in enrichedCharacters"
        :key="pc.id"
        class="pc-chip"
        :class="{ 'pc-chip--selected': isSelected(pc.id) }"
        role="checkbox"
        :aria-checked="isSelected(pc.id) ? 'true' : 'false'"
        tabindex="0"
        @click="toggle(pc.id)"
        @keydown.enter.prevent="toggle(pc.id)"
        @keydown.space.prevent="toggle(pc.id)"
      >
        <span class="pc-chip__name">{{ pc.displayName }}</span>
        <span class="pc-chip__meta">
          {{ pc.className }} · Niv.{{ pc.level }}
        </span>
        <span
          class="pc-chip__tier"
          :class="`pc-chip__tier--t${pc.tier}`"
        >
          T{{ pc.tier }}
        </span>
      </li>
    </ul>

    <p
      v-if="selectedIds.length > 0"
      class="pc-picker__summary"
      role="status"
      aria-live="polite"
    >
      {{ selectedIds.length }} PJ{{ selectedIds.length > 1 ? 's' : '' }} ·
      Tier {{ derivedTier }}
    </p>
  </div>
</template>

<script>
/**
 * @component PcPicker
 * @description Permet de sélectionner les PJ existants pour une rencontre.
 * Affiche nom, classe, niveau et tier de chaque personnage.
 * Dérive automatiquement le nombre de PJ et le tier maximal.
 */
export default {
  name: 'PcPicker',
  props: {
    /** Liste des personnages disponibles (depuis le characterStore) */
    characters: {
      type: Array,
      default: () => []
    },
    /** IDs des PJ actuellement sélectionnés */
    selectedIds: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:selectedIds'],
  computed: {
    /**
     * Enrichit chaque personnage avec un nom affiché et le tier calculé.
     */
    enrichedCharacters() {
      return this.characters.map((c) => ({
        id: c.id,
        displayName: c.name || 'PJ sans nom',
        className: c.className || '—',
        level: c.level || 1,
        tier: this.getTierForLevel(c.level || 1)
      }))
    },
    /**
     * Tier dérivé = tier max parmi les PJ sélectionnés.
     */
    derivedTier() {
      if (this.selectedIds.length === 0) return 1
      const selected = this.enrichedCharacters.filter(
        (c) => this.selectedIds.includes(c.id)
      )
      if (selected.length === 0) return 1
      return Math.max(...selected.map((c) => c.tier))
    }
  },
  methods: {
    /**
     * Vérifie si un PJ est sélectionné.
     * @param {string} id
     * @returns {boolean}
     */
    isSelected(id) {
      return this.selectedIds.includes(id)
    },
    /**
     * Ajoute ou retire un PJ de la sélection.
     * @param {string} id
     */
    toggle(id) {
      const current = [...this.selectedIds]
      const idx = current.indexOf(id)
      if (idx >= 0) {
        current.splice(idx, 1)
      } else {
        current.push(id)
      }
      this.$emit('update:selectedIds', current)
    },
    /**
     * Calcule le tier d'un personnage selon son niveau.
     * Reproduit la logique de useLevelUpRules.getTierForLevel.
     * @param {number} level
     * @returns {number}
     */
    getTierForLevel(level) {
      if (level < 1 || level > 10) return 1
      if (level <= 1) return 1
      if (level <= 4) return 2
      if (level <= 7) return 3
      return 4
    }
  }
}
</script>

<style scoped>
.pc-picker {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.pc-picker__empty {
  font-size: 0.8rem;
  color: var(--text-muted, #6b7280);
  font-style: italic;
  margin: 0;
}

.pc-picker__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.pc-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 20px;
  border: 1px solid var(--border-color, #3a3a5a);
  background: var(--bg-tertiary, #2a2a4a);
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
  user-select: none;
}

.pc-chip:hover {
  border-color: var(--text-secondary);
}

.pc-chip:focus-visible {
  outline: 2px solid var(--accent-hope, #53a8b6);
  outline-offset: 2px;
}

.pc-chip--selected {
  border-color: var(--accent-hope, #53a8b6);
  background: rgba(83, 168, 182, 0.12);
  color: var(--text-primary);
}

.pc-chip__name {
  font-weight: 600;
}

.pc-chip__meta {
  font-size: 0.7rem;
  opacity: 0.7;
}

.pc-chip__tier {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 1px 5px;
  border-radius: 8px;
  background: var(--bg-secondary, #1f1f3a);
}

.pc-chip__tier--t1 { color: #22c55e; }
.pc-chip__tier--t2 { color: #3b82f6; }
.pc-chip__tier--t3 { color: #a855f7; }
.pc-chip__tier--t4 { color: #ef4444; }

.pc-picker__summary {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-hope, #53a8b6);
  margin: 0;
}
</style>
