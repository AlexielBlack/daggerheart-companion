<template>
  <article
    class="class-preview"
    role="region"
    :aria-label="`Apercu classe : ${displayName}`"
  >
    <header class="class-preview__header">
      <span
        v-if="data.emoji"
        class="class-preview__emoji"
        aria-hidden="true"
      >{{ data.emoji }}</span>
      <div class="class-preview__title-block">
        <h3 class="class-preview__name">
          {{ displayName }}
        </h3>
        <span class="class-preview__source class-preview__source--custom">Custom</span>
      </div>
    </header>
    <div
      v-if="displayDomains.length > 0"
      class="class-preview__domains"
      aria-label="Domaines"
    >
      <span
        v-for="d in displayDomains"
        :key="d"
        class="class-preview__domain-badge"
      >{{ d }}</span>
    </div>
    <div
      class="class-preview__stats"
      aria-label="Statistiques de base"
    >
      <div class="class-preview__stat">
        <span class="class-preview__stat-label">Evasion</span><span class="class-preview__stat-value">{{ data.baseEvasion || '—' }}</span>
      </div>
      <div class="class-preview__stat">
        <span class="class-preview__stat-label">HP</span><span class="class-preview__stat-value">{{ data.baseHP || '—' }}</span>
      </div>
      <div class="class-preview__stat">
        <span class="class-preview__stat-label">Stress</span><span class="class-preview__stat-value">{{ data.baseStress || '—' }}</span>
      </div>
      <div
        v-if="balanceScore"
        class="class-preview__stat"
      >
        <span class="class-preview__stat-label">Balance</span><span
          class="class-preview__stat-value"
          :class="balanceClass"
        >{{ balanceScore }}</span>
      </div>
    </div>
    <p
      v-if="data.description"
      class="class-preview__description"
    >
      {{ data.description }}
    </p>
    <p
      v-else
      class="class-preview__empty"
    >
      Aucune description.
    </p>
    <section
      v-if="data.hopeFeature"
      class="class-preview__hope"
      aria-label="Hope Feature"
    >
      <h4 class="class-preview__section-title">
        Hope Feature (3 Hope)
      </h4>
      <p class="class-preview__hope-text">
        {{ data.hopeFeature }}
      </p>
    </section>
    <section
      v-if="displayFeatures.length > 0"
      class="class-preview__features"
      aria-label="Features de classe"
    >
      <h4 class="class-preview__section-title">
        Features de classe
      </h4>
      <div
        v-for="(feat, idx) in displayFeatures"
        :key="idx"
        class="class-preview__feature-item"
      >
        <strong class="class-preview__feature-name">{{ feat.name || 'Sans nom' }}</strong>
        <p class="class-preview__feature-desc">
          {{ feat.description || '' }}
        </p>
      </div>
    </section>
    <section
      v-if="displaySubclasses.length > 0"
      class="class-preview__subclasses"
      aria-label="Specialisations"
    >
      <h4 class="class-preview__section-title">
        🎯 Spécialisations
      </h4>
      <div
        v-for="(sub, si) in displaySubclasses"
        :key="si"
        class="class-preview__subclass"
      >
        <div class="class-preview__subclass-header">
          <strong class="class-preview__subclass-name">{{ sub.name || 'Sans nom' }}</strong>
          <span
            v-if="sub.spellcastTrait"
            class="class-preview__spell-badge"
          >✨ {{ sub.spellcastTrait }}</span>
        </div>
        <div
          v-if="sub.domainOverride && sub.domainOverride.length > 0"
          class="class-preview__domain-override"
        >
          <span class="class-preview__domain-override-label">Domaines :</span>
          <span
            v-for="d in sub.domainOverride"
            :key="d"
            class="class-preview__domain-badge class-preview__domain-badge--override"
          >{{ d }}</span>
        </div>
        <p
          v-if="sub.description"
          class="class-preview__subclass-desc"
        >
          {{ sub.description }}
        </p>
        <div
          v-if="sub.foundation && sub.foundation.length"
          class="class-preview__tier-block"
        >
          <span class="class-preview__tier-label">Foundation (Niv. 1–4)</span>
          <ul class="class-preview__tier-list">
            <li
              v-for="(f, fi) in sub.foundation"
              :key="fi"
            >
              {{ f }}
            </li>
          </ul>
        </div>
        <div
          v-if="sub.specialization && sub.specialization.length"
          class="class-preview__tier-block"
        >
          <span class="class-preview__tier-label">Spécialisation (Niv. 5–7)</span>
          <ul class="class-preview__tier-list">
            <li
              v-for="(s, ssi) in sub.specialization"
              :key="ssi"
            >
              {{ s }}
            </li>
          </ul>
        </div>
        <div
          v-if="sub.mastery && sub.mastery.length"
          class="class-preview__tier-block"
        >
          <span class="class-preview__tier-label">Maîtrise (Niv. 8+)</span>
          <ul class="class-preview__tier-list">
            <li
              v-for="(m, mi) in sub.mastery"
              :key="mi"
            >
              {{ m }}
            </li>
          </ul>
        </div>
      </div>
    </section>
    <section
      v-if="hasTraits"
      class="class-preview__traits"
      aria-label="Traits recommandes"
    >
      <h4 class="class-preview__section-title">
        Traits recommandes
      </h4>
      <div class="class-preview__trait-grid">
        <div
          v-for="t in traitEntries"
          :key="t.key"
          class="class-preview__trait-item"
        >
          <span class="class-preview__trait-label">{{ t.label }}</span>
          <span
            class="class-preview__trait-value"
            :class="{'class-preview__trait-value--pos': t.value > 0, 'class-preview__trait-value--neg': t.value < 0}"
          >{{ t.value > 0 ? '+' : '' }}{{ t.value }}</span>
        </div>
      </div>
    </section>
    <footer
      v-if="data.suggestedPrimaryWeapon || data.suggestedSecondaryWeapon || data.suggestedArmor || data.classItems"
      class="class-preview__footer"
    >
      <p
        v-if="data.suggestedPrimaryWeapon"
        class="class-preview__equip-line"
      >
        ⚔️ {{ resolveEquipName('primary', data.suggestedPrimaryWeapon) }}
      </p>
      <p
        v-if="data.suggestedSecondaryWeapon"
        class="class-preview__equip-line"
      >
        🛡️ {{ resolveEquipName('secondary', data.suggestedSecondaryWeapon) }}
      </p>
      <p
        v-if="data.suggestedArmor"
        class="class-preview__equip-line"
      >
        🪖 {{ resolveEquipName('armor', data.suggestedArmor) }}
      </p>
      <p v-if="data.classItems">
        {{ data.classItems }}
      </p>
    </footer>
  </article>
</template>

<script>
import { getPrimaryWeaponById } from '@data/equipment/primaryWeapons.js'
import { getSecondaryWeaponById } from '@data/equipment/secondaryWeapons.js'
import { getArmorById } from '@data/equipment/armor.js'
import { useEquipmentHomebrewStore } from '@modules/homebrew/categories/equipment/useEquipmentHomebrewStore.js'

const TRAIT_LABELS = { agility: 'AGI', strength: 'FOR', finesse: 'FIN', instinct: 'INS', presence: 'PRE', knowledge: 'SAV' }

/** Résout un ID d'équipement en nom affiché (SRD puis homebrew). */
function resolveById(kind, id) {
  if (!id) return null
  if (kind === 'primary') {
    const item = getPrimaryWeaponById(id)
    if (item) return item.name
  } else if (kind === 'secondary') {
    const item = getSecondaryWeaponById(id)
    if (item) return item.name
  } else if (kind === 'armor') {
    const item = getArmorById(id)
    if (item) return item.name
  }
  // Fallback homebrew
  try {
    const hbStore = useEquipmentHomebrewStore()
    const hbItem = hbStore.items.find((i) => i.id === id)
    if (hbItem) return hbItem.name
  } catch { /* store pas disponible */ }
  return id
}

export default {
  name: 'ClassPreview',
  props: { data: { type: Object, required: true } },
  computed: {
    displayName() { return this.data.name?.trim() || 'Nouvelle classe' },
    displayDomains() { return Array.isArray(this.data.domains) ? this.data.domains.filter(Boolean) : [] },
    balanceScore() { const ev = this.data.baseEvasion; const hp = this.data.baseHP; return (ev && hp) ? ev + hp : null },
    balanceClass() { const s = this.balanceScore; if (!s) return ''; return (s >= 15 && s <= 17) ? 'class-preview__stat-value--good' : 'class-preview__stat-value--warn' },
    displayFeatures() { return Array.isArray(this.data.classFeatures) ? this.data.classFeatures.filter(f => f && (f.name || f.description)) : [] },
    displaySubclasses() { return Array.isArray(this.data.subclasses) ? this.data.subclasses.filter(s => s && (s.name || s.description)) : [] },
    hasTraits() { return this.data.suggestedTraits && typeof this.data.suggestedTraits === 'object' },
    traitEntries() { if (!this.hasTraits) return []; return Object.entries(TRAIT_LABELS).map(([key, label]) => ({ key, label, value: this.data.suggestedTraits[key] || 0 })) }
  },
  methods: {
    resolveEquipName(kind, id) { return resolveById(kind, id) }
  }
}
</script>

<style scoped>
.class-preview { background-color: var(--color-bg-secondary); border: 1px solid var(--color-border); border-radius: var(--radius-lg); padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); }
.class-preview__header { display: flex; align-items: center; gap: var(--space-sm); }
.class-preview__emoji { font-size: 2rem; line-height: 1; }
.class-preview__title-block { display: flex; flex-direction: column; gap: 2px; }
.class-preview__name { font-size: var(--font-lg); font-weight: var(--font-bold); color: var(--color-text-primary); margin: 0; }
.class-preview__source { font-size: var(--font-xs); color: var(--color-text-tertiary); }
.class-preview__source--custom { color: var(--color-accent-hope); }
.class-preview__domains { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.class-preview__domain-badge { display: inline-block; padding: 2px var(--space-sm); background-color: var(--color-bg-primary); border: 1px solid var(--color-accent-hope); border-radius: var(--radius-full); font-size: var(--font-xs); color: var(--color-accent-hope); font-weight: var(--font-semibold); }
.class-preview__stats { display: flex; gap: var(--space-md); flex-wrap: wrap; }
.class-preview__stat { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.class-preview__stat-label { font-size: var(--font-xs); color: var(--color-text-tertiary); text-transform: uppercase; }
.class-preview__stat-value { font-size: var(--font-lg); font-weight: var(--font-bold); color: var(--color-text-primary); }
.class-preview__stat-value--good { color: var(--color-accent-hope); }
.class-preview__stat-value--warn { color: var(--color-accent-fear); }
.class-preview__description { font-size: var(--font-sm); color: var(--color-text-secondary); line-height: 1.5; margin: 0; }
.class-preview__empty { font-size: var(--font-sm); color: var(--color-text-tertiary); font-style: italic; margin: 0; }
.class-preview__hope { padding: var(--space-sm); border-radius: var(--radius-md); background-color: var(--color-bg-primary); border-left: 3px solid var(--color-accent-gold, #f59e0b); }
.class-preview__hope-text { font-size: var(--font-sm); color: var(--color-text-secondary); line-height: 1.5; margin: 0; }
.class-preview__section-title { font-size: var(--font-sm); font-weight: var(--font-semibold); color: var(--color-text-primary); margin: 0 0 var(--space-xs); }
.class-preview__features { display: flex; flex-direction: column; gap: var(--space-xs); }
.class-preview__feature-item { padding: var(--space-xs) var(--space-sm); background-color: var(--color-bg-primary); border-radius: var(--radius-sm); border-left: 2px solid var(--color-accent-hope); }
.class-preview__feature-name { font-size: var(--font-sm); color: var(--color-text-primary); }
.class-preview__feature-desc { font-size: var(--font-xs); color: var(--color-text-secondary); line-height: 1.4; margin: 2px 0 0; }
.class-preview__subclasses { display: flex; flex-direction: column; gap: var(--space-sm); }
.class-preview__subclass { padding: var(--space-sm); background-color: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: var(--space-xs); }
.class-preview__subclass-header { display: flex; align-items: center; gap: var(--space-sm); flex-wrap: wrap; }
.class-preview__subclass-name { font-size: var(--font-sm); color: var(--color-text-primary); }
.class-preview__spell-badge { font-size: var(--font-xs); padding: 1px var(--space-xs); background: rgba(83, 168, 182, 0.15); border: 1px solid rgba(83, 168, 182, 0.3); border-radius: var(--radius-full); color: var(--color-accent-hope); }
.class-preview__domain-override { display: flex; align-items: center; gap: var(--space-xs); flex-wrap: wrap; }
.class-preview__domain-override-label { font-size: var(--font-xs); color: var(--color-text-tertiary); }
.class-preview__domain-badge--override { background-color: rgba(245, 158, 11, 0.12); border-color: var(--color-accent-gold, #f59e0b); color: var(--color-accent-gold, #f59e0b); }
.class-preview__subclass-desc { font-size: var(--font-xs); color: var(--color-text-secondary); line-height: 1.4; margin: 0; }
.class-preview__tier-block { padding-left: var(--space-sm); border-left: 2px solid var(--color-border); }
.class-preview__tier-label { font-size: var(--font-xs); font-weight: var(--font-semibold); color: var(--color-text-tertiary); text-transform: uppercase; letter-spacing: 0.03em; }
.class-preview__tier-list { margin: 2px 0 0; padding-left: var(--space-md); list-style: disc; }
.class-preview__tier-list li { font-size: var(--font-xs); color: var(--color-text-secondary); line-height: 1.5; }
.class-preview__traits { display: flex; flex-direction: column; gap: var(--space-xs); }
.class-preview__trait-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-xs); }
.class-preview__trait-item { display: flex; justify-content: space-between; align-items: center; padding: 2px var(--space-sm); background-color: var(--color-bg-primary); border-radius: var(--radius-sm); font-size: var(--font-xs); }
.class-preview__trait-label { color: var(--color-text-tertiary); font-weight: var(--font-semibold); }
.class-preview__trait-value { color: var(--color-text-secondary); font-weight: var(--font-bold); }
.class-preview__trait-value--pos { color: var(--color-accent-hope); }
.class-preview__trait-value--neg { color: var(--color-accent-fear); }
.class-preview__footer { display: flex; flex-direction: column; gap: 2px; font-size: var(--font-xs); color: var(--color-text-tertiary); }
.class-preview__footer p { margin: 0; }
.class-preview__equip-line { color: var(--color-text-secondary); }
</style>
