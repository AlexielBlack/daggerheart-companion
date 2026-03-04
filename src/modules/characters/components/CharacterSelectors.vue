<template>
  <div
    class="char-selectors"
    aria-label="Choix du personnage"
  >
    <!-- ═══ Sous-classe ═══ -->
    <div class="selector-field">
      <label
        class="selector-label"
        for="sel-subclass"
      >Sous-classe</label>
      <select
        id="sel-subclass"
        class="selector-select"
        :value="char.subclassId"
        aria-label="Choisir une sous-classe"
        @change="onSelect('subclassId', $event.target.value)"
      >
        <option value="">
          — Choisir —
        </option>
        <option
          v-for="sub in subclasses"
          :key="sub.id"
          :value="sub.id"
        >
          {{ sub.name }}
        </option>
      </select>
      <p
        v-if="subclassData"
        class="selector-hint"
      >
        {{ subclassData.description }}
      </p>
    </div>

    <!-- ═══ Ascendance ═══ -->
    <div class="selector-field">
      <label
        class="selector-label"
        for="sel-ancestry"
      >Ascendance</label>
      <select
        id="sel-ancestry"
        class="selector-select"
        :value="char.ancestryId"
        aria-label="Choisir une ascendance"
        @change="onSelect('ancestryId', $event.target.value)"
      >
        <option value="">
          — Choisir —
        </option>
        <optgroup label="Officielles (SRD)">
          <option
            v-for="a in srdAncestries"
            :key="a.id"
            :value="a.id"
          >
            {{ a.emoji }} {{ a.name }}
          </option>
        </optgroup>
        <optgroup label="Personnalisées">
          <option
            v-for="a in customAncestries"
            :key="a.id"
            :value="a.id"
          >
            {{ a.emoji }} {{ a.name }}
          </option>
        </optgroup>
      </select>
      <p
        v-if="ancestryData && char.ancestryId !== 'mixed-ancestry'"
        class="selector-hint"
      >
        {{ ancestryData.description }}
      </p>
    </div>

    <!-- ═══ Mixed Ancestry — Sélection des 2 ascendances parentes ═══ -->
    <template v-if="char.ancestryId === 'mixed-ancestry'">
      <div class="selector-field selector-field--mixed-intro">
        <p class="mixed-intro">
          🔀 Choisissez deux ascendances parentes, puis <strong>une feature par ascendance</strong> (top ou bottom, librement).
        </p>
      </div>

      <!-- Ascendance parente 1 -->
      <div class="selector-field">
        <label
          class="selector-label"
          for="sel-mixed-a1"
        >Ascendance parente 1</label>
        <select
          id="sel-mixed-a1"
          class="selector-select"
          :value="mixedConfig.ancestry1Id"
          aria-label="Première ascendance parente"
          @change="$emit('updateMixed', 'ancestry1Id', $event.target.value)"
        >
          <option value="">
            — Choisir —
          </option>
          <option
            v-for="a in selectableAncestries"
            :key="a.id"
            :value="a.id"
            :disabled="a.id === mixedConfig.ancestry2Id"
          >
            {{ a.emoji }} {{ a.name }}
          </option>
        </select>
      </div>

      <!-- Ascendance parente 2 -->
      <div class="selector-field">
        <label
          class="selector-label"
          for="sel-mixed-a2"
        >Ascendance parente 2</label>
        <select
          id="sel-mixed-a2"
          class="selector-select"
          :value="mixedConfig.ancestry2Id"
          aria-label="Seconde ascendance parente"
          @change="$emit('updateMixed', 'ancestry2Id', $event.target.value)"
        >
          <option value="">
            — Choisir —
          </option>
          <option
            v-for="a in selectableAncestries"
            :key="a.id"
            :value="a.id"
            :disabled="a.id === mixedConfig.ancestry1Id"
          >
            {{ a.emoji }} {{ a.name }}
          </option>
        </select>
      </div>

      <!-- Feature de l'ascendance 1 -->
      <fieldset
        v-if="mixedAncestry1"
        class="selector-field selector-field--full mixed-feature-fieldset"
        :aria-label="`Feature de ${mixedAncestry1.name}`"
      >
        <legend class="mixed-feature-legend">
          {{ mixedAncestry1.emoji }} Feature de {{ mixedAncestry1.name }}
        </legend>
        <label
          class="mixed-feature-option"
          :class="{ 'mixed-feature-option--selected': mixedConfig.ancestry1Feature === 'top' }"
        >
          <input
            type="radio"
            :name="`mixed-a1-feature`"
            value="top"
            :checked="mixedConfig.ancestry1Feature === 'top'"
            @change="$emit('updateMixed', 'ancestry1Feature', 'top')"
          />
          <span class="mixed-feature-option__name">{{ mixedAncestry1.topFeature.name }}</span>
          <span class="mixed-feature-option__badge">Top</span>
          <p class="mixed-feature-option__desc">
            {{ mixedAncestry1.topFeature.description }}
          </p>
        </label>
        <label
          class="mixed-feature-option"
          :class="{ 'mixed-feature-option--selected': mixedConfig.ancestry1Feature === 'bottom' }"
        >
          <input
            type="radio"
            :name="`mixed-a1-feature`"
            value="bottom"
            :checked="mixedConfig.ancestry1Feature === 'bottom'"
            @change="$emit('updateMixed', 'ancestry1Feature', 'bottom')"
          />
          <span class="mixed-feature-option__name">{{ mixedAncestry1.bottomFeature.name }}</span>
          <span class="mixed-feature-option__badge">Bottom</span>
          <p class="mixed-feature-option__desc">
            {{ mixedAncestry1.bottomFeature.description }}
          </p>
        </label>
      </fieldset>

      <!-- Feature de l'ascendance 2 -->
      <fieldset
        v-if="mixedAncestry2"
        class="selector-field selector-field--full mixed-feature-fieldset"
        :aria-label="`Feature de ${mixedAncestry2.name}`"
      >
        <legend class="mixed-feature-legend">
          {{ mixedAncestry2.emoji }} Feature de {{ mixedAncestry2.name }}
        </legend>
        <label
          class="mixed-feature-option"
          :class="{ 'mixed-feature-option--selected': mixedConfig.ancestry2Feature === 'top' }"
        >
          <input
            type="radio"
            :name="`mixed-a2-feature`"
            value="top"
            :checked="mixedConfig.ancestry2Feature === 'top'"
            @change="$emit('updateMixed', 'ancestry2Feature', 'top')"
          />
          <span class="mixed-feature-option__name">{{ mixedAncestry2.topFeature.name }}</span>
          <span class="mixed-feature-option__badge">Top</span>
          <p class="mixed-feature-option__desc">
            {{ mixedAncestry2.topFeature.description }}
          </p>
        </label>
        <label
          class="mixed-feature-option"
          :class="{ 'mixed-feature-option--selected': mixedConfig.ancestry2Feature === 'bottom' }"
        >
          <input
            type="radio"
            :name="`mixed-a2-feature`"
            value="bottom"
            :checked="mixedConfig.ancestry2Feature === 'bottom'"
            @change="$emit('updateMixed', 'ancestry2Feature', 'bottom')"
          />
          <span class="mixed-feature-option__name">{{ mixedAncestry2.bottomFeature.name }}</span>
          <span class="mixed-feature-option__badge">Bottom</span>
          <p class="mixed-feature-option__desc">
            {{ mixedAncestry2.bottomFeature.description }}
          </p>
        </label>
      </fieldset>
    </template>

    <!-- ═══ Communauté ═══ -->
    <div class="selector-field">
      <label
        class="selector-label"
        for="sel-community"
      >Communauté</label>
      <select
        id="sel-community"
        class="selector-select"
        :value="char.communityId"
        aria-label="Choisir une communauté"
        @change="onSelect('communityId', $event.target.value)"
      >
        <option value="">
          — Choisir —
        </option>
        <option
          v-for="c in communities"
          :key="c.id"
          :value="c.id"
        >
          {{ c.emoji }} {{ c.name }}
        </option>
      </select>
      <p
        v-if="communityData"
        class="selector-hint"
      >
        {{ communityData.description }}
      </p>
    </div>

    <!-- ═══ Armure ═══ -->
    <div class="selector-field">
      <label
        class="selector-label"
        for="sel-armor"
      >Armure</label>
      <select
        id="sel-armor"
        class="selector-select"
        :value="char.armorId"
        aria-label="Choisir une armure"
        @change="onSelect('armorId', $event.target.value)"
      >
        <option value="">
          — Choisir —
        </option>
        <optgroup
          v-for="tier in armorTiers"
          :key="tier.label"
          :label="tier.label"
        >
          <option
            v-for="a in tier.items"
            :key="a.id"
            :value="a.id"
          >
            {{ a.name }} — {{ a.thresholds.major }}/{{ a.thresholds.severe }} — Score {{ a.baseScore }}{{ a.feature ? ` — ${a.feature}` : '' }}
          </option>
        </optgroup>
      </select>
    </div>

    <!-- ═══ Arme Principale ═══ -->
    <div class="selector-field">
      <label
        class="selector-label"
        for="sel-primary"
      >Arme Principale</label>
      <select
        id="sel-primary"
        class="selector-select"
        :value="char.primaryWeaponId"
        aria-label="Choisir une arme principale"
        @change="onSelect('primaryWeaponId', $event.target.value)"
      >
        <option value="">
          — Choisir —
        </option>
        <optgroup
          v-for="tier in primaryWeaponTiers"
          :key="tier.label"
          :label="tier.label"
        >
          <option
            v-for="w in tier.items"
            :key="w.id"
            :value="w.id"
          >
            {{ w.name }} — {{ w.trait }} — {{ w.range }} — {{ w.damage }} ({{ w.damageType === 'phy' ? 'Physique' : 'Magique' }})
          </option>
        </optgroup>
      </select>
    </div>

    <!-- ═══ Arme Secondaire ═══ -->
    <div class="selector-field">
      <label
        class="selector-label"
        for="sel-secondary"
      >Arme Secondaire</label>
      <select
        id="sel-secondary"
        class="selector-select"
        :value="char.secondaryWeaponId"
        aria-label="Choisir une arme secondaire"
        @change="onSelect('secondaryWeaponId', $event.target.value)"
      >
        <option value="">
          — Choisir —
        </option>
        <optgroup
          v-for="tier in secondaryWeaponTiers"
          :key="tier.label"
          :label="tier.label"
        >
          <option
            v-for="w in tier.items"
            :key="w.id"
            :value="w.id"
          >
            {{ w.name }} — {{ w.trait }} — {{ w.range }} — {{ w.damage }}{{ w.feature ? ` — ${w.feature}` : '' }}
          </option>
        </optgroup>
      </select>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { getAncestryById, ALL_ANCESTRIES } from '@data/ancestries'

const TIER_LABELS = {
  1: 'Tier 1 (Niveau 1)',
  2: 'Tier 2 (Niveaux 2–4)',
  3: 'Tier 3 (Niveaux 5–7)',
  4: 'Tier 4 (Niveaux 8+)'
}

/**
 * Regroupe un tableau d'items par tier.
 * @param {Array} items
 * @returns {Array<{label: string, items: Array}>}
 */
function groupByTier(items) {
  const tiers = {}
  for (const item of items) {
    const t = item.tier || 1
    if (!tiers[t]) tiers[t] = []
    tiers[t].push(item)
  }
  return Object.keys(tiers)
    .sort((a, b) => Number(a) - Number(b))
    .map((t) => ({
      label: TIER_LABELS[t] || `Tier ${t}`,
      items: tiers[t]
    }))
}

export default {
  name: 'CharacterSelectors',
  props: {
    char: { type: Object, required: true },
    subclasses: { type: Array, default: () => [] },
    subclassData: { type: Object, default: null },
    ancestryData: { type: Object, default: null },
    communityData: { type: Object, default: null },
    ancestries: { type: Array, default: () => [] },
    communities: { type: Array, default: () => [] },
    armor: { type: Array, default: () => [] },
    primaryWeapons: { type: Array, default: () => [] },
    secondaryWeapons: { type: Array, default: () => [] }
  },
  emits: ['select', 'updateMixed'],
  setup(props, { emit }) {
    const srdAncestries = computed(() =>
      props.ancestries.filter((a) => a.source === 'srd')
    )
    const customAncestries = computed(() =>
      props.ancestries.filter((a) => a.source === 'custom')
    )
    const armorTiers = computed(() => groupByTier(props.armor))
    const primaryWeaponTiers = computed(() => groupByTier(props.primaryWeapons))
    const secondaryWeaponTiers = computed(() => groupByTier(props.secondaryWeapons))

    // ── Mixed Ancestry ──
    /** Config Mixed du personnage actuel */
    const mixedConfig = computed(() =>
      props.char.mixedAncestryConfig || {
        ancestry1Id: '', ancestry2Id: '',
        ancestry1Feature: '', ancestry2Feature: ''
      }
    )

    /** Ascendances sélectionnables (exclut Mixed Ancestry elle-même) */
    const selectableAncestries = computed(() =>
      ALL_ANCESTRIES.filter((a) => a.id !== 'mixed-ancestry')
    )

    /** Données de l'ascendance parente 1 */
    const mixedAncestry1 = computed(() =>
      mixedConfig.value.ancestry1Id
        ? getAncestryById(mixedConfig.value.ancestry1Id)
        : null
    )

    /** Données de l'ascendance parente 2 */
    const mixedAncestry2 = computed(() =>
      mixedConfig.value.ancestry2Id
        ? getAncestryById(mixedConfig.value.ancestry2Id)
        : null
    )

    function onSelect(field, value) {
      emit('select', field, value)
    }

    return {
      srdAncestries,
      customAncestries,
      armorTiers,
      primaryWeaponTiers,
      secondaryWeaponTiers,
      onSelect,
      mixedConfig,
      selectableAncestries,
      mixedAncestry1,
      mixedAncestry2
    }
  }
}
</script>

<style scoped>
.char-selectors {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
  overflow: hidden;
}

@media (max-width: 700px) {
  .char-selectors {
    grid-template-columns: 1fr;
  }
}

.selector-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.selector-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted, #6b7280);
}

.selector-select {
  padding: 5px 8px;
  background: var(--bg-tertiary, #2a2a4a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

.selector-select:focus {
  outline: 2px solid var(--accent-hope, #53a8b6);
  outline-offset: 1px;
}

.selector-select option,
.selector-select optgroup {
  background: var(--bg-secondary, #1f1f3a);
  color: var(--text-primary);
}

.selector-hint {
  font-size: 0.75rem;
  color: var(--text-muted, #6b7280);
  margin: 2px 0 0;
  line-height: 1.3;
  max-height: 3.9em;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ── Mixed Ancestry ── */
.selector-field--mixed-intro {
  grid-column: 1 / -1;
}

.selector-field--full {
  grid-column: 1 / -1;
}

.mixed-intro {
  font-size: 0.8rem;
  color: var(--text-secondary, #9ca3af);
  line-height: 1.4;
  margin: 0;
  padding: 6px 8px;
  background: rgba(83, 168, 182, 0.06);
  border-left: 2px solid var(--accent-hope, #53a8b6);
  border-radius: 0 4px 4px 0;
}

.mixed-feature-fieldset {
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 6px;
  padding: 8px;
  margin: 4px 0;
}

.mixed-feature-legend {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--accent-hope, #53a8b6);
  padding: 0 4px;
}

.mixed-feature-option {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  margin: 4px 0;
  cursor: pointer;
  transition: border-color 150ms, background 150ms;
}

.mixed-feature-option:hover { border-color: var(--text-secondary, #9ca3af); }
.mixed-feature-option--selected {
  border-color: var(--accent-hope, #53a8b6);
  background: rgba(83, 168, 182, 0.08);
}

.mixed-feature-option input[type="radio"] {
  accent-color: var(--accent-hope, #53a8b6);
  margin: 0;
  flex-shrink: 0;
}

.mixed-feature-option input[type="radio"]:disabled + .mixed-feature-option__name {
  opacity: 0.4;
}

.mixed-feature-option__name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-primary, #e5e7eb);
}

.mixed-feature-option__badge {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(83, 168, 182, 0.15);
  color: var(--accent-hope, #53a8b6);
  margin-left: auto;
}

.mixed-feature-option__desc {
  width: 100%;
  font-size: 0.72rem;
  color: var(--text-secondary, #9ca3af);
  line-height: 1.35;
  margin: 2px 0 0;
}
</style>
