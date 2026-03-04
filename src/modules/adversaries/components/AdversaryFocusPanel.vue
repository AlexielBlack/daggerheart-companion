<template>
  <section
    v-if="focusResults.length > 0"
    class="adversary-focus-panel"
    aria-label="Panel de focus adversaire"
  >
    <h3 class="focus-title">
      🎯 Focus préférentiel
    </h3>

    <!-- Toggle proximité -->
    <div
      class="proximity-toggles"
      role="group"
      aria-label="PJ à portée"
    >
      <span class="proximity-label">📍 À portée :</span>
      <label
        v-for="pc in allCharacters"
        :key="pc.id"
        class="proximity-toggle"
      >
        <input
          type="checkbox"
          :checked="pcRangeOverrides[pc.id] || false"
          :aria-label="`${pc.name || 'Sans nom'} à portée`"
          @change="setPcInRange(pc.id, $event.target.checked)"
        />
        <span class="toggle-name">{{ pc.name || 'Sans nom' }}</span>
      </label>
    </div>

    <!-- Barres de priorité -->
    <ol
      class="focus-list"
      aria-label="Classement des cibles"
    >
      <li
        v-for="(result, index) in focusResults"
        :key="result.characterId"
        class="focus-item"
        :class="{ 'focus-item--primary': index === 0 && result.score > 0 }"
      >
        <div class="focus-header">
          <span
            class="focus-rank"
            aria-hidden="true"
          >{{ index + 1 }}</span>
          <span class="focus-name">{{ result.characterName }}</span>
          <span
            class="focus-score"
            :aria-label="`Score de priorité: ${result.score} pour cent`"
          >{{ result.score }}%</span>
        </div>

        <!-- Barre de jauge -->
        <div
          class="focus-bar-track"
          role="progressbar"
          :aria-valuenow="result.score"
          :aria-valuemin="0"
          :aria-valuemax="100"
          :aria-label="`Priorité sur ${result.characterName}`"
        >
          <div
            class="focus-bar-fill"
            :style="{ width: result.score + '%' }"
            :class="barColorClass(result.score)"
          ></div>
        </div>

        <!-- Raisons (tooltip-like) -->
        <div
          v-if="result.reasons.length > 0"
          class="focus-reasons"
        >
          <span
            v-for="reason in result.reasons"
            :key="reason.factor"
            class="focus-reason-tag"
            :title="`${reason.label}: ${reason.raw}% (poids ×${reason.weight})`"
          >
            {{ reason.icon }} {{ reason.label }}
          </span>
        </div>
      </li>
    </ol>
  </section>
</template>

<script>
export default {
  name: 'AdversaryFocusPanel',
  props: {
    /** Résultats triés du composable useAdversaryFocus */
    focusResults: {
      type: Array,
      default: () => []
    },
    /** Tous les personnages (pour les toggles de proximité) */
    allCharacters: {
      type: Array,
      default: () => []
    },
    /** État de proximité (characterId → boolean) */
    pcRangeOverrides: {
      type: Object,
      default: () => ({})
    }
  },
  emits: ['update:range'],
  methods: {
    /**
     * Classe CSS de couleur de la barre selon le score.
     * @param {number} score - Score [0, 100]
     * @returns {string} Classe CSS
     */
    barColorClass (score) {
      if (score >= 70) return 'bar--danger'
      if (score >= 40) return 'bar--warning'
      return 'bar--low'
    },
    /**
     * Émet l'événement de changement de proximité.
     * @param {string} charId
     * @param {boolean} inRange
     */
    setPcInRange (charId, inRange) {
      this.$emit('update:range', { charId, inRange })
    }
  }
}
</script>

<style scoped>
.adversary-focus-panel {
  background: var(--color-surface, #1a1a2e);
  border: 1px solid var(--color-border, #333);
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
}

.focus-title {
  font-size: 1.1rem;
  margin: 0 0 0.75rem;
  color: var(--color-text-primary, #e0e0e0);
}

/* Toggles de proximité */
.proximity-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border, #333);
}

.proximity-label {
  font-size: 0.85rem;
  color: var(--color-text-secondary, #aaa);
}

.proximity-toggle {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  cursor: pointer;
  color: var(--color-text-primary, #e0e0e0);
}

.proximity-toggle input[type="checkbox"] {
  cursor: pointer;
}

/* Liste de focus */
.focus-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.focus-item {
  padding: 0.5rem;
  border-radius: 6px;
  background: var(--color-surface-elevated, #222240);
  transition: background 0.2s;
}

.focus-item--primary {
  background: var(--color-surface-active, #2a2a50);
  border-left: 3px solid var(--color-danger, #e74c3c);
}

.focus-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.focus-rank {
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--color-border, #444);
  font-size: 0.75rem;
  font-weight: bold;
  color: var(--color-text-primary, #e0e0e0);
}

.focus-name {
  flex: 1;
  font-weight: 600;
  color: var(--color-text-primary, #e0e0e0);
}

.focus-score {
  font-size: 0.9rem;
  font-weight: bold;
  color: var(--color-accent, #f1c40f);
}

/* Barre de jauge */
.focus-bar-track {
  height: 8px;
  background: var(--color-border, #333);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.3rem;
}

.focus-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.4s ease;
}

.bar--danger {
  background: linear-gradient(90deg, #e74c3c, #c0392b);
}

.bar--warning {
  background: linear-gradient(90deg, #f39c12, #e67e22);
}

.bar--low {
  background: linear-gradient(90deg, #3498db, #2980b9);
}

/* Raisons */
.focus-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.focus-reason-tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 3px;
  background: var(--color-border, #333);
  color: var(--color-text-secondary, #bbb);
  white-space: nowrap;
}
</style>
