<!--
  WeaponsPanel.vue — Sélecteurs d'armes principales et secondaires.
  Extrait de CharacterSheet pour réduire sa taille.
-->
<template>
  <section class="sheet-section">
    <h3 class="section-heading">
      Armes
    </h3>

    <!-- Arme Principale -->
    <div class="weapon-block">
      <label
        class="weapon-label"
        for="sheet-primary-weapon"
      >Principale</label>
      <select
        id="sheet-primary-weapon"
        class="weapon-select"
        :value="char.primaryWeaponId"
        aria-label="Choisir une arme principale"
        @change="$emit('select', 'primaryWeaponId', $event.target.value)"
      >
        <option value="">
          — Choisir —
        </option>
        <optgroup
          v-if="recommendedPrimary.length"
          label="★ Recommandé"
        >
          <option
            v-for="w in recommendedPrimary"
            :key="'rec-' + w.id"
            :value="w.id"
          >
            ★ {{ w.name }} — {{ w.trait }} {{ w.range }} — {{ w.damage }}{{ w.burden === 'Two-Handed' ? ' ⚔ Deux mains' : '' }}
          </option>
        </optgroup>
        <optgroup
          v-for="tier in primaryTiers"
          :key="tier.label"
          :label="tier.label"
        >
          <option
            v-for="w in tier.items"
            :key="w.id"
            :value="w.id"
          >
            {{ w.name }} — {{ w.trait }} {{ w.range }} — {{ w.damage }}{{ w.burden === 'Two-Handed' ? ' ⚔ Deux mains' : '' }}
          </option>
        </optgroup>
      </select>
      <div
        v-if="char.primaryWeapon && char.primaryWeapon.name"
        class="weapon-details"
      >
        <span class="weapon-stat">{{ char.primaryWeapon.trait }}</span>
        <span class="weapon-stat">{{ char.primaryWeapon.range }}</span>
        <span class="weapon-stat weapon-stat--dmg">{{ char.primaryWeapon.damage }}</span>
        <span
          v-if="char.primaryWeapon.burden === 'Two-Handed'"
          class="weapon-stat weapon-stat--burden"
        >⚔ Deux mains</span>
        <span
          v-if="char.primaryWeapon.feature"
          class="weapon-stat weapon-stat--feature"
        >{{ char.primaryWeapon.feature }}</span>
      </div>
    </div>

    <!-- Arme Secondaire -->
    <div
      class="weapon-block"
      :class="{ 'weapon-block--disabled': isTwoHanded }"
    >
      <label
        class="weapon-label"
        for="sheet-secondary-weapon"
      >Secondaire</label>
      <select
        v-if="!isTwoHanded"
        id="sheet-secondary-weapon"
        class="weapon-select"
        :value="char.secondaryWeaponId"
        aria-label="Choisir une arme secondaire"
        @change="$emit('select', 'secondaryWeaponId', $event.target.value)"
      >
        <option value="">
          — Choisir —
        </option>
        <optgroup
          v-if="recommendedSecondary.length"
          label="★ Recommandé"
        >
          <option
            v-for="w in recommendedSecondary"
            :key="'rec-' + w.id"
            :value="w.id"
          >
            ★ {{ w.name }} — {{ w.trait }} {{ w.range }} — {{ w.damage }}
          </option>
        </optgroup>
        <optgroup
          v-for="tier in secondaryTiers"
          :key="tier.label"
          :label="tier.label"
        >
          <option
            v-for="w in tier.items"
            :key="w.id"
            :value="w.id"
          >
            {{ w.name }} — {{ w.trait }} {{ w.range }} — {{ w.damage }}
          </option>
        </optgroup>
      </select>
      <p
        v-else
        class="weapon-twohanded-notice"
        aria-live="polite"
      >
        ⚔ Slot occupé — arme principale à deux mains
      </p>
      <div
        v-if="!isTwoHanded && char.secondaryWeapon && char.secondaryWeapon.name"
        class="weapon-details"
      >
        <span class="weapon-stat">{{ char.secondaryWeapon.trait }}</span>
        <span class="weapon-stat">{{ char.secondaryWeapon.range }}</span>
        <span class="weapon-stat weapon-stat--dmg">{{ char.secondaryWeapon.damage }}</span>
        <span
          v-if="char.secondaryWeapon.feature"
          class="weapon-stat weapon-stat--feature"
        >{{ char.secondaryWeapon.feature }}</span>
      </div>
    </div>
  </section>
</template>

<script>
import { computed } from 'vue'
import { TIER_LABELS } from '@core/utils/constants.js'
import { getPrimaryWeaponById } from '@data/equipment/primaryWeapons.js'
import { getSecondaryWeaponById } from '@data/equipment/secondaryWeapons.js'
import { getRecommendedIds } from '@data/equipment/classRecommendations.js'

export default {
  name: 'WeaponsPanel',

  props: {
    char: { type: Object, required: true },
    primaryWeapons: { type: Array, default: () => [] },
    secondaryWeapons: { type: Array, default: () => [] }
  },

  emits: ['select'],

  setup(props) {
    function groupByTier(items) {
      const tiers = {}
      for (const item of items) {
        const t = item.tier || 1
        if (!tiers[t]) tiers[t] = []
        tiers[t].push(item)
      }
      return Object.keys(tiers)
        .sort((a, b) => Number(a) - Number(b))
        .map((t) => ({ label: TIER_LABELS[t] || `Tier ${t}`, items: tiers[t] }))
    }

    const primaryTiers = computed(() => groupByTier(props.primaryWeapons))
    const secondaryTiers = computed(() => groupByTier(props.secondaryWeapons))

    const isTwoHanded = computed(() =>
      props.char?.primaryWeapon?.burden === 'Two-Handed'
    )

    const recommendedPrimary = computed(() =>
      getRecommendedIds(props.char?.classId || '', 'primaryWeapon')
        .map(getPrimaryWeaponById)
        .filter(Boolean)
    )

    const recommendedSecondary = computed(() =>
      getRecommendedIds(props.char?.classId || '', 'secondaryWeapon')
        .map(getSecondaryWeaponById)
        .filter(Boolean)
    )

    return {
      primaryTiers, secondaryTiers, isTwoHanded,
      recommendedPrimary, recommendedSecondary
    }
  }
}
</script>

<style scoped>
.sheet-section { margin-bottom: var(--space-lg); }
.section-heading {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin-bottom: var(--space-sm);
  letter-spacing: 0.02em;
}

.weapon-block { margin-bottom: var(--space-sm); }

.weapon-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted, #6b7280);
  margin-bottom: 2px;
}

.weapon-select {
  width: 100%;
  padding: 5px 8px;
  background: var(--color-bg-tertiary, #2a2a4a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  box-sizing: border-box;
}

.weapon-select:focus {
  outline: 2px solid var(--color-accent-hope, #53a8b6);
  outline-offset: 1px;
}

.weapon-select option,
.weapon-select optgroup {
  background: var(--color-bg-secondary, #1f1f3a);
  color: var(--color-text-primary);
}

.weapon-details { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }

.weapon-stat {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 3px;
  color: var(--color-text-secondary, #9ca3af);
}

.weapon-stat--dmg {
  color: var(--color-accent-fear, #c84b31);
  border-color: rgba(200, 75, 49, 0.3);
  background: rgba(200, 75, 49, 0.06);
  font-weight: 600;
}

.weapon-stat--feature {
  flex-basis: 100%;
  font-style: italic;
  color: var(--color-text-muted, #6b7280);
  background: transparent;
  border: none;
  padding: 0;
  font-size: 0.75rem;
  line-height: 1.35;
}

.weapon-stat--burden {
  color: #eab308;
  border-color: rgba(234, 179, 8, 0.3);
  background: rgba(234, 179, 8, 0.08);
  font-weight: 600;
}

.weapon-block--disabled { opacity: 0.5; }

.weapon-twohanded-notice {
  font-size: 0.8rem;
  font-style: italic;
  color: #eab308;
  margin: 4px 0 0;
  padding: 6px 10px;
  background: rgba(234, 179, 8, 0.06);
  border: 1px dashed rgba(234, 179, 8, 0.3);
  border-radius: 4px;
}
</style>
