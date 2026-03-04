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
        v-if="ancestryData"
        class="selector-hint"
      >
        {{ ancestryData.description }}
      </p>
    </div>

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
  emits: ['select'],
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

    function onSelect(field, value) {
      emit('select', field, value)
    }

    return {
      srdAncestries,
      customAncestries,
      armorTiers,
      primaryWeaponTiers,
      secondaryWeaponTiers,
      onSelect
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
</style>
