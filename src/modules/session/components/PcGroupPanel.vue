<template>
  <section
    class="pc-group"
    aria-label="Groupe de personnages"
  >
    <div class="pc-group__header">
      <h3 class="pc-group__title">
        <span aria-hidden="true">&#x1F465;</span>
        Personnages ({{ characters.length }})
      </h3>
      <router-link
        to="/edition/personnages"
        class="pc-group__edit-link"
        aria-label="Editer les personnages"
      >
        &#x270F;&#xFE0F; Editer
      </router-link>
    </div>

    <p
      v-if="characters.length === 0"
      class="pc-group__empty"
    >
      Aucun personnage cree.
      <router-link to="/edition/personnages">
        Creer un personnage
      </router-link>
    </p>

    <div
      v-else
      class="pc-group__grid"
    >
      <article
        v-for="pc in characters"
        :key="pc.id"
        class="pc-card"
        :aria-label="pc.name"
      >
        <div class="pc-card__header">
          <span class="pc-card__name">{{ pc.name || 'Sans nom' }}</span>
          <span class="pc-card__class">{{ pc.className }}</span>
          <span class="pc-card__level">Nv.{{ pc.level }}</span>
        </div>

        <!-- Barre de points de vie -->
        <div
          class="pc-card__bar"
          aria-label="Points de vie"
        >
          <div class="pc-card__bar-track">
            <div
              class="pc-card__bar-fill pc-card__bar-fill--hp"
              :style="{ width: hpPercent(pc) + '%', backgroundColor: hpBarColor(pc) }"
            ></div>
          </div>
          <span class="pc-card__bar-text">&#x2764;&#xFE0F; {{ pc.currentHP }}/{{ pc.maxHP }}</span>
        </div>

        <!-- Barre de stress -->
        <div
          class="pc-card__bar"
          aria-label="Stress"
        >
          <div class="pc-card__bar-track">
            <div
              class="pc-card__bar-fill pc-card__bar-fill--stress"
              :style="{ width: stressPercent(pc) + '%' }"
            ></div>
          </div>
          <span class="pc-card__bar-text">&#x1F49C; {{ pc.currentStress }}/{{ pc.maxStress }}</span>
        </div>

        <div class="pc-card__stats">
          <span
            class="pc-card__stat"
            title="Evasion"
          >
            &#x1F6E1;&#xFE0F; {{ pc.evasion + (pc.evasionBonus || 0) }}
          </span>
          <span
            class="pc-card__stat"
            title="Armure"
          >
            &#x1FA96; {{ pc.armorScore || 0 }}
          </span>
        </div>

        <div
          v-if="pc.conditions && pc.conditions.length > 0"
          class="pc-card__conditions"
        >
          <span
            v-for="cond in pc.conditions"
            :key="cond"
            class="pc-card__condition"
          >
            {{ cond }}
          </span>
        </div>
      </article>
    </div>
  </section>
</template>

<script>
/**
 * PcGroupPanel — Grille resume des personnages joueurs en lecture seule.
 * Affiche une carte par PJ avec barres HP/Stress, stats defensives et conditions.
 */
export default {
  name: 'PcGroupPanel',

  props: {
    /** Tableau de personnages depuis characterStore.characters */
    characters: {
      type: Array,
      default: () => []
    }
  },

  setup() {
    /**
     * Calcule le pourcentage de HP restants pour un PJ.
     * @param {Object} pc - Donnees du personnage
     * @returns {number} Pourcentage entre 0 et 100
     */
    function hpPercent(pc) {
      if (!pc.maxHP || pc.maxHP <= 0) return 0
      return Math.max(0, Math.min(100, Math.round((pc.currentHP / pc.maxHP) * 100)))
    }

    /**
     * Calcule le pourcentage de stress pour un PJ.
     * @param {Object} pc - Donnees du personnage
     * @returns {number} Pourcentage entre 0 et 100
     */
    function stressPercent(pc) {
      if (!pc.maxStress || pc.maxStress <= 0) return 0
      return Math.max(0, Math.min(100, Math.round((pc.currentStress / pc.maxStress) * 100)))
    }

    /**
     * Retourne la couleur CSS de la barre HP selon le pourcentage restant.
     * < 25% : danger (rouge), 25-50% : warning (orange), > 50% : success (vert)
     * @param {Object} pc - Donnees du personnage
     * @returns {string} Variable CSS de couleur
     */
    function hpBarColor(pc) {
      const pct = hpPercent(pc)
      if (pct <= 25) return 'var(--color-accent-danger)'
      if (pct <= 50) return 'var(--color-accent-warning)'
      return 'var(--color-accent-success)'
    }

    return { hpPercent, stressPercent, hpBarColor }
  }
}
</script>

<style scoped>
.pc-group__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pc-group__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.pc-group__edit-link {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
}

.pc-group__empty {
  color: var(--color-text-muted);
  padding: var(--space-lg) 0;
}

.pc-group__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-md);
}

.pc-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.pc-card__header {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.pc-card__name {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.pc-card__class {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pc-card__level {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-left: auto;
}

.pc-card__bar {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.pc-card__bar-track {
  flex: 1;
  height: 6px;
  background: var(--color-bg-elevated);
  border-radius: 3px;
  overflow: hidden;
}

.pc-card__bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Couleur HP dynamique appliquee via style inline (hpBarColor) */
.pc-card__bar-fill--stress {
  background: var(--color-accent-info);
}

.pc-card__bar-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  white-space: nowrap;
  min-width: 60px;
}

.pc-card__stats {
  display: flex;
  gap: var(--space-md);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pc-card__conditions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.pc-card__condition {
  font-size: var(--font-size-xs);
  padding: 2px var(--space-xs);
  border-radius: var(--radius-sm);
  background: var(--color-accent-warning);
  color: #fff;
}
</style>
