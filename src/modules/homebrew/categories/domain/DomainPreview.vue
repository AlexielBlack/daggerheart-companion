<template>
  <article
    class="domain-preview"
    role="region"
    :aria-label="`Apercu domaine : ${displayName}`"
    :style="borderStyle"
  >
    <header class="domain-preview__header">
      <span
        v-if="data.emoji"
        class="domain-preview__emoji"
        aria-hidden="true"
      >{{ data.emoji }}</span>
      <div class="domain-preview__title-block">
        <h3 class="domain-preview__name">
          {{ displayName }}
        </h3>
        <span class="domain-preview__source domain-preview__source--custom">&#x270E; Custom</span>
      </div>
      <span
        v-if="data.hasSpells"
        class="domain-preview__spell-badge"
        aria-label="Contient des sorts"
      >&#x2728; Sorts</span>
    </header>
    <div
      v-if="displayClasses.length > 0"
      class="domain-preview__classes"
      aria-label="Classes associees"
    >
      <span
        v-for="c in displayClasses"
        :key="c"
        class="domain-preview__class-badge"
      >{{ c }}</span>
    </div>
    <p
      v-if="data.description"
      class="domain-preview__description"
    >
      {{ data.description }}
    </p>
    <p
      v-else
      class="domain-preview__empty"
    >
      Aucune description.
    </p>
    <div
      v-if="displayThemes.length > 0"
      class="domain-preview__themes"
    >
      <span
        v-for="t in displayThemes"
        :key="t"
        class="domain-preview__theme-chip"
      >{{ t }}</span>
    </div>
    <section
      v-if="cardsByLevel.length > 0"
      class="domain-preview__cards"
      aria-label="Cartes de domaine"
    >
      <h4 class="domain-preview__section-title">
        Cartes ({{ totalCards }})
      </h4>
      <div
        v-for="group in cardsByLevel"
        :key="group.level"
        class="domain-preview__level-group"
      >
        <h5 class="domain-preview__level-label">
          Niv. {{ group.level }}
        </h5>
        <div
          v-for="(card, idx) in group.cards"
          :key="idx"
          class="domain-preview__card-item"
        >
          <span class="domain-preview__card-name">{{ card.name || 'Sans nom' }}</span>
          <span class="domain-preview__card-type">{{ card.type || 'ability' }}</span>
          <span
            v-if="card.recallCost > 0"
            class="domain-preview__card-cost"
          >Rappel: {{ card.recallCost }}</span>
        </div>
      </div>
    </section>
  </article>
</template>

<script>
export default {
  name: 'DomainPreview',
  props: { data: { type: Object, required: true } },
  computed: {
    displayName() { return this.data.name?.trim() || 'Nouveau domaine' },
    displayClasses() {
      if (!Array.isArray(this.data.classes)) return []
      return this.data.classes.filter(Boolean)
    },
    displayThemes() {
      if (!Array.isArray(this.data.themes)) return []
      return this.data.themes.filter(Boolean)
    },
    borderStyle() {
      if (!this.data.color) return {}
      return { borderLeftColor: this.data.color }
    },
    totalCards() {
      if (!Array.isArray(this.data.cards)) return 0
      return this.data.cards.filter(c => c && c.name).length
    },
    cardsByLevel() {
      if (!Array.isArray(this.data.cards)) return []
      const groups = {}
      this.data.cards.filter(c => c && c.name).forEach(card => {
        const lv = card.level || 1
        if (!groups[lv]) groups[lv] = { level: lv, cards: [] }
        groups[lv].cards.push(card)
      })
      return Object.values(groups).sort((a, b) => a.level - b.level)
    }
  }
}
</script>

<style scoped>
.domain-preview { background-color: var(--color-bg-secondary); border: 1px solid var(--color-border); border-left: 4px solid var(--color-accent-hope); border-radius: var(--radius-lg); padding: var(--space-md); display: flex; flex-direction: column; gap: var(--space-sm); }
.domain-preview__header { display: flex; align-items: center; gap: var(--space-sm); }
.domain-preview__emoji { font-size: 2rem; line-height: 1; }
.domain-preview__title-block { display: flex; flex-direction: column; gap: 2px; flex: 1; }
.domain-preview__name { font-size: var(--font-lg); font-weight: var(--font-bold); color: var(--color-text-primary); margin: 0; }
.domain-preview__source { font-size: var(--font-xs); color: var(--color-text-tertiary); }
.domain-preview__source--custom { color: var(--color-accent-hope); }
.domain-preview__spell-badge { font-size: var(--font-xs); padding: 2px var(--space-sm); background-color: var(--color-accent-hope); color: var(--color-bg-primary); border-radius: var(--radius-full); font-weight: var(--font-semibold); }
.domain-preview__classes { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.domain-preview__class-badge { display: inline-block; padding: 2px var(--space-sm); background-color: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: var(--font-xs); color: var(--color-text-secondary); }
.domain-preview__description { font-size: var(--font-sm); color: var(--color-text-secondary); line-height: 1.5; margin: 0; }
.domain-preview__empty { font-size: var(--font-sm); color: var(--color-text-tertiary); font-style: italic; margin: 0; }
.domain-preview__themes { display: flex; gap: var(--space-xs); flex-wrap: wrap; }
.domain-preview__theme-chip { display: inline-block; padding: 2px var(--space-sm); background-color: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-full); font-size: var(--font-xs); color: var(--color-text-tertiary); }
.domain-preview__cards { display: flex; flex-direction: column; gap: var(--space-xs); }
.domain-preview__section-title { font-size: var(--font-sm); font-weight: var(--font-semibold); color: var(--color-text-primary); margin: 0; }
.domain-preview__level-group { padding: var(--space-xs) 0; }
.domain-preview__level-label { font-size: var(--font-xs); font-weight: var(--font-semibold); color: var(--color-accent-hope); margin: 0 0 var(--space-xs); }
.domain-preview__card-item { display: flex; align-items: center; gap: var(--space-xs); font-size: var(--font-sm); padding: 2px 0; }
.domain-preview__card-name { color: var(--color-text-primary); font-weight: var(--font-semibold); }
.domain-preview__card-type { font-size: var(--font-xs); padding: 1px var(--space-xs); background-color: var(--color-bg-primary); border: 1px solid var(--color-border); border-radius: var(--radius-sm); color: var(--color-text-tertiary); text-transform: capitalize; }
.domain-preview__card-cost { font-size: var(--font-xs); color: var(--color-accent-fear); }
</style>
