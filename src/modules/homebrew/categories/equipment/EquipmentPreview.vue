<template>
  <section
    class="eq-preview"
    :class="[categoryClass, tierClass]"
    :aria-label="`Aperçu équipement : ${data.name || 'Sans nom'}`"
  >
    <!-- Header -->
    <header class="eq-preview__header">
      <div class="eq-preview__title-row">
        <span class="eq-preview__icon">{{ categoryIcon }}</span>
        <h3 class="eq-preview__name">
          {{ data.name || 'Nouvel équipement' }}
        </h3>
        <span
          v-if="showTier"
          class="eq-preview__tier-badge"
          :class="`eq-preview__tier-badge--t${data.tier}`"
          :aria-label="`Tier ${data.tier}`"
        >
          T{{ data.tier }}
        </span>
      </div>
      <div class="eq-preview__meta">
        <span class="eq-preview__category-label">{{ categoryLabel }}</span>
        <span
          v-if="showRarity"
          class="eq-preview__rarity"
          :class="`eq-preview__rarity--${data.rarity || 'common'}`"
        >
          {{ rarityLabel }}
        </span>
      </div>
    </header>

    <!-- Weapon stats -->
    <div
      v-if="isWeapon"
      class="eq-preview__stats"
    >
      <div class="eq-preview__stat">
        <span class="eq-preview__stat-label">Trait</span>
        <span class="eq-preview__stat-value">{{ data.trait || '—' }}</span>
      </div>
      <div class="eq-preview__stat">
        <span class="eq-preview__stat-label">Portée</span>
        <span class="eq-preview__stat-value">{{ data.range || '—' }}</span>
      </div>
      <div class="eq-preview__stat">
        <span class="eq-preview__stat-label">Dégâts</span>
        <span class="eq-preview__stat-value">
          {{ data.damage || '—' }}
          <span
            v-if="data.damageType"
            class="eq-preview__dmg-type"
          >{{ data.damageType === 'mag' ? '✨' : '⚔️' }}</span>
        </span>
      </div>
      <div class="eq-preview__stat">
        <span class="eq-preview__stat-label">Burden</span>
        <span class="eq-preview__stat-value">{{ burdenLabel }}</span>
      </div>
    </div>

    <!-- Armor stats -->
    <div
      v-if="isArmor"
      class="eq-preview__stats"
    >
      <div class="eq-preview__stat">
        <span class="eq-preview__stat-label">Score</span>
        <span class="eq-preview__stat-value">{{ data.baseScore || '—' }}</span>
      </div>
      <div class="eq-preview__stat">
        <span class="eq-preview__stat-label">Majeur</span>
        <span class="eq-preview__stat-value">{{ thresholdMajor }}</span>
      </div>
      <div class="eq-preview__stat">
        <span class="eq-preview__stat-label">Sévère</span>
        <span class="eq-preview__stat-value">{{ thresholdSevere }}</span>
      </div>
    </div>

    <!-- Description -->
    <p
      v-if="data.description"
      class="eq-preview__description"
    >
      {{ data.description }}
    </p>

    <!-- Feature -->
    <div
      v-if="data.feature"
      class="eq-preview__feature"
    >
      <strong
        v-if="data.featureKey"
        class="eq-preview__feature-key"
      >{{ data.featureKey }} :</strong>
      {{ data.feature }}
    </div>

    <!-- Empty state -->
    <p
      v-if="isEmpty"
      class="eq-preview__empty"
    >
      Remplissez le formulaire pour voir l'aperçu de l'équipement.
    </p>
  </section>
</template>

<script>
const CATEGORY_ICONS = {
  primaryWeapon: '⚔️',
  secondaryWeapon: '🛡️',
  armor: '🛡️',
  loot: '💎',
  consumable: '🧪'
}

const CATEGORY_LABELS = {
  primaryWeapon: 'Arme Primaire',
  secondaryWeapon: 'Arme Secondaire',
  armor: 'Armure',
  loot: 'Loot',
  consumable: 'Consommable'
}

const RARITY_LABELS = {
  common: 'Commun',
  uncommon: 'Peu commun',
  rare: 'Rare',
  legendary: 'Légendaire'
}

export default {
  name: 'EquipmentPreview',

  props: {
    data: {
      type: Object,
      required: true
    }
  },

  computed: {
    category() {
      return this.data.category || 'primaryWeapon'
    },

    isWeapon() {
      return this.category === 'primaryWeapon' || this.category === 'secondaryWeapon'
    },

    isArmor() {
      return this.category === 'armor'
    },

    isLoot() {
      return this.category === 'loot' || this.category === 'consumable'
    },

    showTier() {
      return (this.isWeapon || this.isArmor) && this.data.tier
    },

    showRarity() {
      return this.isLoot && this.data.rarity
    },

    categoryIcon() {
      return CATEGORY_ICONS[this.category] || '📦'
    },

    categoryLabel() {
      return CATEGORY_LABELS[this.category] || 'Équipement'
    },

    rarityLabel() {
      return RARITY_LABELS[this.data.rarity] || 'Commun'
    },

    categoryClass() {
      return `eq-preview--${this.category}`
    },

    tierClass() {
      return this.showTier ? `eq-preview--tier${this.data.tier}` : ''
    },

    burdenLabel() {
      if (!this.data.burden) return '—'
      return this.data.burden === 'One-Handed' ? '1 main' : '2 mains'
    },

    thresholdMajor() {
      return this.data.thresholds?.major || '—'
    },

    thresholdSevere() {
      return this.data.thresholds?.severe || '—'
    },

    isEmpty() {
      return !this.data.name && !this.data.description && !this.data.feature
    }
  }
}
</script>

<style scoped>
.eq-preview {
  background: var(--color-surface, #1a1a2e);
  border: 1px solid var(--color-border, #333);
  border-radius: var(--radius-lg, 12px);
  padding: var(--spacing-lg, 1.25rem);
  font-size: 0.9rem;
}

.eq-preview--tier1 { border-left: 4px solid var(--color-tier1, #4ade80); }
.eq-preview--tier2 { border-left: 4px solid var(--color-tier2, #60a5fa); }
.eq-preview--tier3 { border-left: 4px solid var(--color-tier3, #c084fc); }
.eq-preview--tier4 { border-left: 4px solid var(--color-tier4, #f97316); }

.eq-preview__header {
  margin-bottom: var(--spacing-md, 0.75rem);
}

.eq-preview__title-row {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 0.5rem);
}

.eq-preview__icon {
  font-size: 1.2rem;
}

.eq-preview__name {
  margin: 0;
  font-size: 1.15rem;
  color: var(--color-text, #e0e0e0);
}

.eq-preview__tier-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 24px;
  padding: 0 6px;
  border-radius: var(--radius-sm, 4px);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-bg, #0f0f1a);
}
.eq-preview__tier-badge--t1 { background: var(--color-tier1, #4ade80); }
.eq-preview__tier-badge--t2 { background: var(--color-tier2, #60a5fa); }
.eq-preview__tier-badge--t3 { background: var(--color-tier3, #c084fc); }
.eq-preview__tier-badge--t4 { background: var(--color-tier4, #f97316); }

.eq-preview__meta {
  display: flex;
  gap: var(--spacing-md, 0.75rem);
  margin-top: 4px;
  color: var(--color-text-muted, #888);
  font-size: 0.85rem;
}

.eq-preview__rarity--common { color: var(--color-text-muted, #888); }
.eq-preview__rarity--uncommon { color: #22c55e; }
.eq-preview__rarity--rare { color: #60a5fa; }
.eq-preview__rarity--legendary { color: #f59e0b; }

.eq-preview__stats {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: var(--spacing-sm, 0.5rem);
  margin-bottom: var(--spacing-md, 0.75rem);
}

.eq-preview__stat {
  background: var(--color-surface-elevated, #252540);
  border-radius: var(--radius-sm, 4px);
  padding: var(--spacing-xs, 0.25rem) var(--spacing-sm, 0.5rem);
  text-align: center;
}

.eq-preview__stat-label {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.eq-preview__stat-value {
  display: block;
  font-weight: 600;
  color: var(--color-text, #e0e0e0);
  font-size: 0.95rem;
}

.eq-preview__dmg-type {
  font-size: 0.8rem;
  margin-left: 2px;
}

.eq-preview__description {
  color: var(--color-text-secondary, #aaa);
  margin: 0 0 var(--spacing-md, 0.75rem);
  line-height: 1.5;
}

.eq-preview__feature {
  background: var(--color-surface-elevated, #252540);
  border-radius: var(--radius-md, 8px);
  padding: var(--spacing-sm, 0.5rem) var(--spacing-md, 0.75rem);
  color: var(--color-text-secondary, #aaa);
  font-size: 0.85rem;
  line-height: 1.45;
  border-left: 3px solid var(--color-primary, #7c3aed);
}

.eq-preview__feature-key {
  color: var(--color-text, #e0e0e0);
}

.eq-preview__empty {
  color: var(--color-text-muted, #666);
  text-align: center;
  font-style: italic;
  padding: var(--spacing-xl, 2rem) 0;
}
</style>
