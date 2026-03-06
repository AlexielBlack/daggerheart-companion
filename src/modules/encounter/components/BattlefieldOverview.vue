<template>
  <div
    class="bo"
    role="region"
    aria-label="Vue d'ensemble du combat"
  >
    <!-- Section PJs -->
    <div class="bo__section">
      <h3 class="bo__section-title">
        PJ
      </h3>
      <div
        v-for="pc in pcs"
        :key="pc.id"
        class="bo__pc"
        :class="{ 'bo__pc--down': pcDownStatus[pc.id] }"
      >
        <span class="bo__pc-name">{{ pc.name }}</span>
        <span class="bo__pc-class">({{ pc.className }})</span>
        <!-- Conditions actives du PJ -->
        <span
          v-if="(pcConditions[pc.id] || []).length > 0"
          class="bo__pc-conditions"
        >
          {{ (pcConditions[pc.id] || []).join(', ') }}
        </span>
        <span
          v-if="pcDownStatus[pc.id]"
          class="bo__pc-down-tag"
          aria-label="PJ a terre"
        >&#x1F480;</span>
      </div>
      <p
        v-if="pcs.length === 0"
        class="bo__empty"
      >
        Aucun PJ
      </p>
    </div>

    <!-- Section Adversaires -->
    <div class="bo__section">
      <h3 class="bo__section-title">
        Adversaires
      </h3>
      <div
        v-for="group in groups"
        :key="group.adversaryId"
        class="bo__group"
      >
        <div class="bo__group-header">
          <span class="bo__group-name">{{ group.name }}</span>
          <span class="bo__group-count">
            ({{ group.activeCount }}/{{ group.instances.length }}
            <template v-if="group.defeatedCount > 0">
              &middot; {{ group.defeatedCount }} &#x1F480;
            </template>)
          </span>
        </div>
        <!-- Barre HP agregee du groupe -->
        <div
          class="bo__hp-bar"
          role="progressbar"
          :aria-valuenow="groupHpPercent(group)"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-label="group.name + ' HP'"
        >
          <div
            class="bo__hp-fill"
            :class="hpBarClass(groupHpPercent(group))"
            :style="{ width: groupHpPercent(group) + '%' }"
          ></div>
        </div>
        <span class="bo__hp-text">{{ groupHpText(group) }}</span>
      </div>
      <p
        v-if="groups.length === 0"
        class="bo__empty"
      >
        Aucun adversaire
      </p>
    </div>

    <!-- Section Stats live -->
    <div class="bo__section bo__section--stats">
      <h3 class="bo__section-title">
        Stats live
      </h3>
      <div class="bo__stats-grid">
        <div class="bo__stat">
          <span class="bo__stat-label">Touches</span>
          <span class="bo__stat-value">{{ stats.hitCount || 0 }}</span>
        </div>
        <div class="bo__stat">
          <span class="bo__stat-label">Rates</span>
          <span class="bo__stat-value">{{ stats.missCount || 0 }}</span>
        </div>
        <div class="bo__stat">
          <span class="bo__stat-label">Ratio</span>
          <span class="bo__stat-value">{{ stats.hitRatio || 0 }}%</span>
        </div>
        <div class="bo__stat">
          <span class="bo__stat-label">HP marques</span>
          <span class="bo__stat-value">{{ stats.totalDamageDealt || 0 }}</span>
        </div>
        <div class="bo__stat">
          <span class="bo__stat-label">Stress</span>
          <span class="bo__stat-value">{{ stats.totalStressDealt || 0 }}</span>
        </div>
        <div class="bo__stat">
          <span class="bo__stat-label">PJ touches</span>
          <span class="bo__stat-value">{{ stats.pcHitCount || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * BattlefieldOverview — Vue d'ensemble compacte du champ de bataille.
 * Affiche les PJs, adversaires (avec barres HP agregees) et stats live.
 * Composant purement presentationnel, aucun emit, aucune logique metier.
 */
export default {
  name: 'BattlefieldOverview',
  props: {
    /** Liste des PJs participants — chaque objet contient id, name, className, maxHP, maxStress */
    pcs: { type: Array, default: () => [] },
    /** Statut "a terre" par PJ — { pcId: true/false } */
    pcDownStatus: { type: Object, default: () => ({}) },
    /** Conditions actives par PJ — { pcId: ['hidden','vulnerable',...] } */
    pcConditions: { type: Object, default: () => ({}) },
    /** Groupes d'adversaires — chaque groupe contient adversaryId, name, type, instances, activeCount, defeatedCount */
    groups: { type: Array, default: () => [] },
    /** Stats live du combat — hitCount, missCount, hitRatio, totalDamageDealt, totalStressDealt, pcHitCount */
    stats: { type: Object, default: () => ({}) }
  },
  methods: {
    /**
     * Calcule le pourcentage de HP restant pour un groupe d'adversaires.
     * Ne prend en compte que les instances non vaincues.
     * @param {Object} group - Groupe d'adversaires
     * @returns {number} Pourcentage de HP restant (0-100)
     */
    groupHpPercent(group) {
      const instances = group.instances.filter((i) => !i.isDefeated)
      if (instances.length === 0) return 0
      const totalMax = instances.reduce((s, i) => s + (i.maxHP || 0), 0)
      if (totalMax === 0) return 0
      const totalMarked = instances.reduce((s, i) => s + (i.markedHP || 0), 0)
      return Math.round(((totalMax - totalMarked) / totalMax) * 100)
    },
    /**
     * Retourne le texte HP agregé pour un groupe (ex: "42/60 HP").
     * @param {Object} group - Groupe d'adversaires
     * @returns {string} Texte HP formaté
     */
    groupHpText(group) {
      const instances = group.instances.filter((i) => !i.isDefeated)
      const totalMax = instances.reduce((s, i) => s + (i.maxHP || 0), 0)
      const totalMarked = instances.reduce((s, i) => s + (i.markedHP || 0), 0)
      return (totalMax - totalMarked) + '/' + totalMax + ' HP'
    },
    /**
     * Retourne la classe CSS pour la barre HP en fonction du pourcentage.
     * @param {number} percent - Pourcentage de HP restant
     * @returns {string} Classe CSS correspondante
     */
    hpBarClass(percent) {
      if (percent > 60) return 'bo__hp-fill--high'
      if (percent > 30) return 'bo__hp-fill--mid'
      return 'bo__hp-fill--low'
    }
  }
}
</script>

<style scoped>
/* ── Section de base ── */

.bo__section {
  margin-bottom: var(--space-sm);
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border, #3a3a5a);
}

.bo__section:last-child {
  border-bottom: none;
}

.bo__section-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-xs);
}

/* ── PJs ── */

.bo__pc {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.78rem;
  padding: 2px 0;
}

.bo__pc--down {
  opacity: 0.5;
  text-decoration: line-through;
}

.bo__pc-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.bo__pc-class {
  color: var(--color-text-secondary);
  font-size: 0.72rem;
}

.bo__pc-conditions {
  color: var(--color-text-secondary);
  font-size: 0.7rem;
  font-style: italic;
}

.bo__pc-down-tag {
  font-size: 0.75rem;
}

/* ── Adversaires ── */

.bo__group {
  margin-bottom: var(--space-xs);
}

.bo__group-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 0.78rem;
}

.bo__group-name {
  font-weight: 600;
  color: var(--color-text-primary);
}

.bo__group-count {
  color: var(--color-text-secondary);
  font-size: 0.72rem;
}

.bo__hp-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin: 2px 0;
}

.bo__hp-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s;
}

.bo__hp-fill--high {
  background: #22c55e;
}

.bo__hp-fill--mid {
  background: #eab308;
}

.bo__hp-fill--low {
  background: #ef4444;
}

.bo__hp-text {
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

/* ── Stats live ── */

.bo__stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-xs);
}

.bo__stat {
  text-align: center;
}

.bo__stat-label {
  display: block;
  font-size: 0.65rem;
  color: var(--color-text-secondary);
}

.bo__stat-value {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-primary);
}

/* ── Etat vide ── */

.bo__empty {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-style: italic;
}
</style>
