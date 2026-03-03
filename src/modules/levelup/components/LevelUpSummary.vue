<template>
  <div
    class="lu-summary"
    aria-label="Résumé du level up"
  >
    <h4 class="lu-summary__title">
      Récapitulatif — Niveau {{ summary.currentLevel }} → {{ summary.targetLevel }}
    </h4>

    <dl class="lu-summary__list">
      <!-- Personnage -->
      <div class="lu-summary__row">
        <dt class="lu-summary__label">
          Personnage
        </dt>
        <dd class="lu-summary__value">
          {{ summary.characterName }}
        </dd>
      </div>

      <!-- Tier -->
      <div class="lu-summary__row">
        <dt class="lu-summary__label">
          Tier
        </dt>
        <dd class="lu-summary__value">
          {{ summary.targetTier }}
        </dd>
      </div>

      <!-- Tier Achievement -->
      <div
        v-if="summary.tierAchievement"
        class="lu-summary__row lu-summary__row--highlight"
      >
        <dt class="lu-summary__label">
          Tier Achievement
        </dt>
        <dd class="lu-summary__value">
          +1 Maîtrise, +2 Expérience
          <template v-if="summary.tierAchievement.traitsCleared">
            , Traits débloqués
          </template>
        </dd>
      </div>

      <!-- Advancements -->
      <div class="lu-summary__row">
        <dt class="lu-summary__label">
          Advancements
        </dt>
        <dd class="lu-summary__value">
          <ul class="lu-summary__adv-list">
            <li
              v-for="(adv, i) in summary.advancements"
              :key="i"
              class="lu-summary__adv-item"
            >
              {{ adv.label || adv.type }}
              <span class="lu-summary__adv-tier">(T{{ adv.tier }})</span>
              <template v-if="adv.traits">
                — {{ formatTraits(adv.traits) }}
              </template>
            </li>
          </ul>
        </dd>
      </div>

      <!-- Thresholds -->
      <div class="lu-summary__row">
        <dt class="lu-summary__label">
          Seuils
        </dt>
        <dd class="lu-summary__value">
          +1 automatique
        </dd>
      </div>

      <!-- Domain Card -->
      <div
        v-if="summary.domainCardId"
        class="lu-summary__row"
      >
        <dt class="lu-summary__label">
          Carte domaine
        </dt>
        <dd class="lu-summary__value">
          {{ domainCardName }}
        </dd>
      </div>
    </dl>
  </div>
</template>

<script>
import { computed } from 'vue'
import { TRAITS } from '@data/classes'
import { getCardById } from '@data/domains'

export default {
  name: 'LevelUpSummary',
  props: {
    summary: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const domainCardName = computed(() => {
      if (!props.summary.domainCardId) return ''
      const card = getCardById(props.summary.domainCardId)
      return card ? card.name : props.summary.domainCardId
    })

    function formatTraits(traits) {
      if (!Array.isArray(traits)) return ''
      return traits
        .map((id) => {
          const t = TRAITS.find((tr) => tr.id === id)
          return t ? t.label : id
        })
        .join(' & ')
    }

    return { domainCardName, formatTraits }
  }
}
</script>

<style scoped>
.lu-summary__title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  margin: 0 0 var(--space-md);
  padding-bottom: var(--space-xs);
  border-bottom: 1px solid var(--color-border);
}

.lu-summary__list {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.lu-summary__row {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
}

.lu-summary__row--highlight {
  background: rgba(224, 165, 38, 0.06);
  border: 1px solid rgba(224, 165, 38, 0.25);
}

.lu-summary__label {
  flex: 0 0 120px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  padding-top: 2px;
}

.lu-summary__value {
  flex: 1;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin: 0;
}

.lu-summary__adv-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.lu-summary__adv-item {
  font-size: var(--font-size-sm);
}

.lu-summary__adv-tier {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
</style>
