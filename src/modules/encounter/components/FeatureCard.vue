<template>
  <div
    class="feat-card"
    :class="[
      'feat-card--' + feature.activationType,
      { 'feat-card--dimmed': dimmed }
    ]"
    role="button"
    tabindex="0"
    :aria-expanded="expanded"
    :aria-label="feature.name + (expanded ? ' — réduire' : ' — afficher détails')"
    @click="expanded = !expanded"
    @keydown.enter="expanded = !expanded"
    @keydown.space.prevent="expanded = !expanded"
  >
    <!-- Ligne unique : nom + badges justifiés à droite -->
    <div class="feat-card__row">
      <span class="feat-card__name">{{ feature.name }}</span>
      <span class="feat-card__badges">
        <span
          v-if="feature.isHopeFeature"
          class="feat-card__badge feat-card__badge--hope"
          title="Hope Feature"
        >✨</span>
        <span
          class="feat-card__badge"
          :class="'feat-card__badge--' + feature.activationType"
          :title="activationLabel"
        >{{ activationEmoji }}</span>
        <span
          v-if="feature.cost && feature.cost.type !== 'free'"
          class="feat-card__badge feat-card__badge--cost"
          :title="costLabel"
        >{{ costEmoji }} {{ feature.cost.amount }}</span>
        <span
          v-for="tag in feature.tags"
          :key="tag"
          class="feat-card__tag"
          :class="'feat-card__tag--' + tag"
        >{{ tagEmoji(tag) }}</span>
        <span
          v-if="feature.range"
          class="feat-card__badge feat-card__badge--range"
          :title="'Portée : ' + feature.range"
        >📏 {{ rangeLabel }}</span>
        <span
          v-if="feature.frequency && feature.frequency !== 'atWill'"
          class="feat-card__badge feat-card__badge--freq"
          :title="frequencyLabel"
        >{{ frequencyLabel }}</span>
        <span
          class="feat-card__expand"
          aria-hidden="true"
        >{{ expanded ? '▲' : '▼' }}</span>
      </span>
    </div>

    <!-- Source -->
    <div class="feat-card__source">
      {{ feature.sourceLabel }}
      <span
        v-if="feature.subclassTier"
        class="feat-card__tier"
      >({{ feature.subclassTier }})</span>
    </div>

    <!-- Description (toggle) -->
    <div
      v-if="expanded"
      class="feat-card__desc"
    >
      {{ feature.description }}
      <div
        v-if="feature.trigger"
        class="feat-card__trigger"
      >
        <strong>Déclencheur :</strong> {{ feature.trigger }}
      </div>
    </div>
  </div>
</template>

<script>
const ACTIVATION_EMOJI = { passive: '🔵', action: '🟢', reaction: '🟠' }
const ACTIVATION_LABEL = { passive: 'Passive', action: 'Action', reaction: 'Réaction' }
const COST_EMOJI = { hope: '✨', stress: '💢', fear: '😱', armor: '🛡️' }
const TAG_EMOJI = { offensif: '⚔️', défensif: '🛡️', social: '💬', utilitaire: '🔧' }
const RANGE_LABEL = {
  self: 'Soi',
  melee: 'Mêlée',
  veryClose: 'Très Proche',
  close: 'Proche',
  far: 'Loin',
  veryFar: 'Très Loin'
}
const FREQ_LABEL = {
  oncePerShortRest: '1/repos court',
  oncePerLongRest: '1/repos long',
  oncePerSession: '1/session',
  special: 'Spécial'
}

export default {
  name: 'FeatureCard',
  props: {
    feature: { type: Object, required: true },
    dimmed: { type: Boolean, default: false },
    defaultExpanded: { type: Boolean, default: true }
  },
  data() {
    return { expanded: this.defaultExpanded }
  },
  computed: {
    activationEmoji() { return ACTIVATION_EMOJI[this.feature.activationType] || '⚪' },
    activationLabel() { return ACTIVATION_LABEL[this.feature.activationType] || this.feature.activationType },
    costEmoji() { return COST_EMOJI[this.feature.cost?.type] || '' },
    costLabel() {
      const c = this.feature.cost
      if (!c || c.type === 'free') return 'Gratuit'
      return `${c.amount} ${c.type}`
    },
    rangeLabel() { return RANGE_LABEL[this.feature.range] || this.feature.range },
    frequencyLabel() { return FREQ_LABEL[this.feature.frequency] || this.feature.frequency }
  },
  methods: {
    tagEmoji(tag) { return TAG_EMOJI[tag] || '🏷️' }
  }
}
</script>

<style scoped>
.feat-card {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  border-left: 3px solid var(--color-border);
  transition: opacity 0.15s, border-color 0.15s;
  cursor: pointer;
  user-select: none;
}

.feat-card--action  { border-left-color: #22c55e; }
.feat-card--reaction { border-left-color: #f59e0b; }
.feat-card--passive  { border-left-color: #3b82f6; }
.feat-card--dimmed  { opacity: 0.55; }
.feat-card:hover { border-color: var(--color-border-active); }

.feat-card__row {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.feat-card__name {
  font-size: var(--font-sm);
  font-weight: var(--font-bold);
  color: var(--color-text-primary);
  white-space: nowrap;
}

.feat-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-items: center;
  margin-left: auto;
}

.feat-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 1px 5px;
  border-radius: var(--radius-sm);
  font-size: 0.7rem;
  font-weight: var(--font-semibold);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  line-height: 1.3;
}

.feat-card__badge--action  { background: rgba(34, 197, 94, 0.12); color: #22c55e; }
.feat-card__badge--reaction { background: rgba(245, 158, 11, 0.12); color: #f59e0b; }
.feat-card__badge--passive  { background: rgba(59, 130, 246, 0.12); color: #3b82f6; }
.feat-card__badge--hope    { background: rgba(83, 168, 182, 0.15); color: var(--color-accent-hope); }
.feat-card__badge--cost    { background: rgba(200, 75, 49, 0.12); }

.feat-card__tag {
  display: inline-flex;
  align-items: center;
  padding: 1px 4px;
  border-radius: var(--radius-sm);
  font-size: 0.65rem;
  background: var(--color-bg-elevated);
}

.feat-card__tag--offensif   { background: rgba(220, 38, 38, 0.1); }
.feat-card__tag--défensif   { background: rgba(59, 130, 246, 0.1); }
.feat-card__tag--social     { background: rgba(217, 119, 6, 0.1); }
.feat-card__tag--utilitaire { background: rgba(5, 150, 105, 0.1); }

.feat-card__source {
  font-size: 0.65rem;
  color: var(--color-text-muted);
}

.feat-card__tier {
  font-style: italic;
}

.feat-card__desc {
  font-size: var(--font-xs);
  color: var(--color-text-secondary);
  line-height: 1.5;
  padding-top: var(--space-xs);
  border-top: 1px solid var(--color-border);
}

.feat-card__trigger {
  margin-top: var(--space-xs);
  font-size: var(--font-xs);
  color: #f59e0b;
}

.feat-card__expand {
  color: var(--color-text-muted);
  font-size: 0.6rem;
  padding: 1px 3px;
  line-height: 1;
}
</style>
