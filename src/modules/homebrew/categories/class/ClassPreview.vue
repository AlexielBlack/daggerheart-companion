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
      v-if="data.suggestedArmor || data.classItems"
      class="class-preview__footer"
    >
      <p v-if="data.suggestedArmor">
        {{ data.suggestedArmor }}
      </p>
      <p v-if="data.classItems">
        {{ data.classItems }}
      </p>
    </footer>
  </article>
</template>

<script>
const TRAIT_LABELS = { agility: 'AGI', strength: 'FOR', finesse: 'FIN', instinct: 'INS', presence: 'PRE', knowledge: 'SAV' }

export default {
  name: 'ClassPreview',
  props: { data: { type: Object, required: true } },
  computed: {
    displayName() { return this.data.name?.trim() || 'Nouvelle classe' },
    displayDomains() { return Array.isArray(this.data.domains) ? this.data.domains.filter(Boolean) : [] },
    balanceScore() { const ev = this.data.baseEvasion; const hp = this.data.baseHP; return (ev && hp) ? ev + hp : null },
    balanceClass() { const s = this.balanceScore; if (!s) return ''; return (s >= 15 && s <= 17) ? 'class-preview__stat-value--good' : 'class-preview__stat-value--warn' },
    displayFeatures() { return Array.isArray(this.data.classFeatures) ? this.data.classFeatures.filter(f => f && (f.name || f.description)) : [] },
    hasTraits() { return this.data.suggestedTraits && typeof this.data.suggestedTraits === 'object' },
    traitEntries() { if (!this.hasTraits) return []; return Object.entries(TRAIT_LABELS).map(([key, label]) => ({ key, label, value: this.data.suggestedTraits[key] || 0 })) }
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
.class-preview__traits { display: flex; flex-direction: column; gap: var(--space-xs); }
.class-preview__trait-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-xs); }
.class-preview__trait-item { display: flex; justify-content: space-between; align-items: center; padding: 2px var(--space-sm); background-color: var(--color-bg-primary); border-radius: var(--radius-sm); font-size: var(--font-xs); }
.class-preview__trait-label { color: var(--color-text-tertiary); font-weight: var(--font-semibold); }
.class-preview__trait-value { color: var(--color-text-secondary); font-weight: var(--font-bold); }
.class-preview__trait-value--pos { color: var(--color-accent-hope); }
.class-preview__trait-value--neg { color: var(--color-accent-fear); }
.class-preview__footer { display: flex; flex-direction: column; gap: 2px; font-size: var(--font-xs); color: var(--color-text-tertiary); }
.class-preview__footer p { margin: 0; }
</style>
