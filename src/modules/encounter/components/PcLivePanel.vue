<template>
  <section
    class="pc-panel"
    :class="{ 'pc-panel--actor': isActor }"
    aria-label="Panel PJ actif"
  >
    <!-- En-tête PJ -->
    <div class="pc-panel__header">
      <div class="pc-panel__identity">
        <h3 class="pc-panel__name">
          {{ pc.name }}
        </h3>
        <span class="pc-panel__class">{{ pc.className }}</span>
        <span class="pc-panel__level">Nv.{{ pc.level }}</span>
      </div>
      <div
        v-if="isActor"
        class="pc-panel__role-badge pc-panel__role-badge--actor"
      >
        Acteur
      </div>
      <div
        v-else
        class="pc-panel__role-badge pc-panel__role-badge--target"
      >
        Cible
      </div>
    </div>

    <!-- Stats condensées -->
    <div class="pc-panel__stats">
      <div
        class="pc-panel__stat"
        title="Hit Points"
      >
        <span class="pc-panel__stat-icon">❤️</span>
        <span class="pc-panel__stat-value">{{ pc.maxHP }}</span>
        <span class="pc-panel__stat-label">HP</span>
      </div>
      <div
        class="pc-panel__stat"
        title="Stress"
      >
        <span class="pc-panel__stat-icon">💢</span>
        <span class="pc-panel__stat-value">{{ pc.maxStress }}</span>
        <span class="pc-panel__stat-label">Stress</span>
      </div>
      <div
        class="pc-panel__stat"
        :class="{ 'pc-panel__stat--highlight': !isActor }"
        title="Évasion"
      >
        <span class="pc-panel__stat-icon">🏃</span>
        <span class="pc-panel__stat-value">{{ effectiveEvasion }}</span>
        <span class="pc-panel__stat-label">Évasion</span>
      </div>
      <div
        class="pc-panel__stat"
        :class="{ 'pc-panel__stat--highlight': !isActor }"
        title="Armure"
      >
        <span class="pc-panel__stat-icon">🛡️</span>
        <span class="pc-panel__stat-value">{{ pc.armorScore || 0 }}</span>
        <span class="pc-panel__stat-label">Armure</span>
      </div>
      <div
        v-if="pc.armorBaseThresholds"
        class="pc-panel__stat"
        title="Seuils (Majeur/Sévère)"
      >
        <span class="pc-panel__stat-icon">⚔️</span>
        <span class="pc-panel__stat-value">
          {{ pc.armorBaseThresholds.major || 0 }}/{{ pc.armorBaseThresholds.severe || 0 }}
        </span>
        <span class="pc-panel__stat-label">Seuils</span>
      </div>
    </div>

    <!-- Arme (affichée en mode acteur/attaque) -->
    <div
      v-if="isActor && weapon"
      class="pc-panel__weapon"
    >
      <div class="pc-panel__weapon-header">
        <span class="pc-panel__weapon-name">{{ weapon.name }}</span>
        <span class="pc-panel__weapon-type">{{ weapon.damageType === 'mag' ? '✨ Mag' : '🗡️ Phy' }}</span>
      </div>
      <div class="pc-panel__weapon-stats">
        <span title="Dés de dégâts">🎲 {{ weapon.damage }}+{{ pc.proficiency || 0 }}</span>
        <span title="Trait d'attaque">{{ weapon.trait }}</span>
        <span title="Portée">📏 {{ weapon.range }}</span>
        <span
          v-if="weapon.burden"
          title="Prise"
        >✋ {{ weapon.burden }}</span>
      </div>
      <div
        v-if="weapon.feature"
        class="pc-panel__weapon-feat"
      >
        {{ weapon.feature }}
      </div>
    </div>

    <!-- Features filtrées par section -->
    <div class="pc-panel__features">
      <!-- Features principales -->
      <div
        v-if="primaryFeatures.length > 0"
        class="pc-panel__feat-section"
      >
        <h4 class="pc-panel__feat-title pc-panel__feat-title--primary">
          {{ primaryLabel }}
          <span class="pc-panel__feat-count">{{ primaryFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in primaryFeatures"
          :key="f.name + f.source"
          :feature="f"
        />
      </div>

      <!-- Réactions -->
      <div
        v-if="reactionFeatures.length > 0"
        class="pc-panel__feat-section"
      >
        <h4 class="pc-panel__feat-title pc-panel__feat-title--reaction">
          🟠 Réactions
          <span class="pc-panel__feat-count">{{ reactionFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in reactionFeatures"
          :key="f.name + f.source"
          :feature="f"
        />
      </div>

      <!-- Features secondaires -->
      <div
        v-if="secondaryFeatures.length > 0"
        class="pc-panel__feat-section"
      >
        <h4 class="pc-panel__feat-title pc-panel__feat-title--secondary">
          Secondaires
          <span class="pc-panel__feat-count">{{ secondaryFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in secondaryFeatures"
          :key="f.name + f.source"
          :feature="f"
          :dimmed="true"
        />
      </div>

      <!-- Passives -->
      <div
        v-if="passiveFeatures.length > 0"
        class="pc-panel__feat-section"
      >
        <h4 class="pc-panel__feat-title pc-panel__feat-title--passive">
          🔵 Passives
          <span class="pc-panel__feat-count">{{ passiveFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in passiveFeatures"
          :key="f.name + f.source"
          :feature="f"
          :dimmed="true"
        />
      </div>
    </div>
  </section>
</template>

<script>
import FeatureCard from './FeatureCard.vue'
import { getPrimaryWeaponById } from '@data/equipment'

export default {
  name: 'PcLivePanel',
  components: { FeatureCard },
  props: {
    pc: { type: Object, required: true },
    isActor: { type: Boolean, default: true },
    sceneMode: { type: String, required: true },
    primaryFeatures: { type: Array, default: () => [] },
    secondaryFeatures: { type: Array, default: () => [] },
    passiveFeatures: { type: Array, default: () => [] },
    reactionFeatures: { type: Array, default: () => [] }
  },
  computed: {
    effectiveEvasion() {
      return (this.pc.evasion || 10) + (this.pc.evasionBonus || 0)
    },
    weapon() {
      if (!this.pc.primaryWeaponId) return null
      return getPrimaryWeaponById(this.pc.primaryWeaponId) || null
    },
    primaryLabel() {
      const labels = {
        pcAttack: '⚔️ Offensives',
        adversaryAttack: '🛡️ Défensives',
        social: '💬 Sociales',
        traversal: '🔧 Utilitaires'
      }
      return labels[this.sceneMode] || '⚔️ Prioritaires'
    }
  }
}
</script>

<style scoped>
.pc-panel {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  border-top: 3px solid var(--color-accent-hope);
}

.pc-panel--actor {
  border-top-color: var(--color-accent-hope);
}

/* ── Header ── */

.pc-panel__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.pc-panel__identity {
  flex: 1;
  display: flex;
  align-items: baseline;
  gap: var(--space-xs);
  flex-wrap: wrap;
}

.pc-panel__name {
  font-size: var(--font-md, 1rem);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  margin: 0;
}

.pc-panel__class {
  font-size: var(--font-sm);
  color: var(--color-text-secondary);
}

.pc-panel__level {
  font-size: var(--font-xs);
  color: var(--color-accent-gold);
  font-weight: var(--font-semibold);
}

.pc-panel__role-badge {
  padding: 2px var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pc-panel__role-badge--actor {
  background: rgba(83, 168, 182, 0.15);
  color: var(--color-accent-hope);
}

.pc-panel__role-badge--target {
  background: rgba(200, 75, 49, 0.15);
  color: var(--color-accent-fear);
}

/* ── Stats ── */

.pc-panel__stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.pc-panel__stat {
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px var(--space-xs);
  background: var(--color-bg-primary);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
}

.pc-panel__stat--highlight {
  border: 1px solid var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.08);
}

.pc-panel__stat-icon {
  font-size: 0.8rem;
  line-height: 1;
}

.pc-panel__stat-value {
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.pc-panel__stat-label {
  color: var(--color-text-muted);
}

/* ── Arme ── */

.pc-panel__weapon {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  border-left: 3px solid #dc2626;
}

.pc-panel__weapon-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.pc-panel__weapon-name {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
}

.pc-panel__weapon-type {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
}

.pc-panel__weapon-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
}

.pc-panel__weapon-feat {
  font-size: var(--font-xs);
  color: var(--color-text-muted);
  font-style: italic;
}

/* ── Features ── */

.pc-panel__features {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.pc-panel__feat-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.pc-panel__feat-title {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: var(--font-xs);
  font-weight: var(--font-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.pc-panel__feat-title--primary  { color: var(--color-accent-hope); }
.pc-panel__feat-title--reaction { color: #f59e0b; }
.pc-panel__feat-title--secondary { color: var(--color-text-muted); }
.pc-panel__feat-title--passive  { color: #3b82f6; }

.pc-panel__feat-count {
  font-size: 0.65rem;
  color: var(--color-text-muted);
  font-weight: normal;
}
</style>
