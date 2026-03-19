<template>
  <article
    v-if="resolved"
    class="pc-quick-sheet"
  >
    <!-- En-tête : nom, classe, sous-classe, tier -->
    <header class="pc-quick-sheet__header">
      <h3 class="pc-quick-sheet__name">
        {{ resolved.name || 'Personnage sans nom' }}
      </h3>
      <div class="pc-quick-sheet__meta">
        <span
          v-if="resolved.classData"
          class="pc-quick-sheet__class"
        >{{ resolved.classData.emoji }} {{ resolved.classData.name }}</span>
        <span
          v-if="resolved.subclassData"
          class="pc-quick-sheet__subclass"
        >{{ resolved.subclassData.name }}</span>
        <span class="pc-quick-sheet__tier">Tier {{ tier }}</span>
      </div>
    </header>

    <!-- Stats vitales : HP, Stress, Armure, Espoir -->
    <section class="pc-quick-sheet__vitals">
      <h4 class="pc-quick-sheet__section-title">
        Stats vitales
      </h4>
      <dl class="pc-quick-sheet__stats-grid">
        <div class="pc-quick-sheet__stat">
          <dt class="pc-quick-sheet__stat-label">
            PV
          </dt>
          <dd class="pc-quick-sheet__stat-value pc-quick-sheet__stat-value--hp">
            {{ hpCurrent }}<span class="pc-quick-sheet__stat-sep">/</span>{{ resolved.effectiveMaxHP }}
          </dd>
        </div>
        <div class="pc-quick-sheet__stat">
          <dt class="pc-quick-sheet__stat-label">
            Stress
          </dt>
          <dd class="pc-quick-sheet__stat-value pc-quick-sheet__stat-value--stress">
            {{ resolved.currentStress || 0 }}<span class="pc-quick-sheet__stat-sep">/</span>{{ resolved.effectiveMaxStress }}
          </dd>
        </div>
        <div class="pc-quick-sheet__stat">
          <dt class="pc-quick-sheet__stat-label">
            Armure
          </dt>
          <dd class="pc-quick-sheet__stat-value pc-quick-sheet__stat-value--armor">
            {{ armorSlotsFree }}<span class="pc-quick-sheet__stat-sep">/</span>{{ resolved.effectiveArmorScore }}
          </dd>
        </div>
        <div class="pc-quick-sheet__stat">
          <dt class="pc-quick-sheet__stat-label">
            Espoir
          </dt>
          <dd class="pc-quick-sheet__stat-value pc-quick-sheet__stat-value--hope">
            {{ resolved.hope || 0 }}
          </dd>
        </div>
      </dl>
    </section>

    <!-- Seuils de dégâts et évasion -->
    <section class="pc-quick-sheet__thresholds">
      <h4 class="pc-quick-sheet__section-title">
        Seuils
      </h4>
      <dl class="pc-quick-sheet__stats-grid">
        <div class="pc-quick-sheet__stat">
          <dt class="pc-quick-sheet__stat-label">
            Évasion
          </dt>
          <dd class="pc-quick-sheet__stat-value">
            {{ resolved.effectiveEvasion }}
          </dd>
        </div>
        <div class="pc-quick-sheet__stat">
          <dt class="pc-quick-sheet__stat-label">
            S. Majeur
          </dt>
          <dd class="pc-quick-sheet__stat-value">
            {{ resolved.thresholds.major }}
          </dd>
        </div>
        <div class="pc-quick-sheet__stat">
          <dt class="pc-quick-sheet__stat-label">
            S. Sévère
          </dt>
          <dd class="pc-quick-sheet__stat-value">
            {{ resolved.thresholds.severe }}
          </dd>
        </div>
      </dl>
    </section>

    <!-- Cartes de domaine actives (loadout) -->
    <section
      v-if="resolved.loadoutCards && resolved.loadoutCards.length > 0"
      class="pc-quick-sheet__loadout"
    >
      <h4 class="pc-quick-sheet__section-title">
        Cartes de domaine
      </h4>
      <ul class="pc-quick-sheet__card-list">
        <li
          v-for="card in resolved.loadoutCards"
          :key="card.id"
          class="pc-quick-sheet__card"
        >
          <span class="pc-quick-sheet__card-name">{{ card.name }}</span>
          <p
            v-if="card.feature"
            class="pc-quick-sheet__card-desc"
          >
            {{ card.feature }}
          </p>
        </li>
      </ul>
    </section>

    <!-- Capacités de sous-classe -->
    <section
      v-if="hasSubclassFeatures"
      class="pc-quick-sheet__subclass-features"
    >
      <h4 class="pc-quick-sheet__section-title">
        Capacités — {{ resolved.subclassData.name }}
      </h4>

      <div
        v-if="foundationFeatures.length > 0"
        class="pc-quick-sheet__feature-group"
      >
        <h5 class="pc-quick-sheet__feature-tier">
          Fondation
        </h5>
        <ul class="pc-quick-sheet__feature-list">
          <li
            v-for="feat in foundationFeatures"
            :key="feat.name"
            class="pc-quick-sheet__feature"
          >
            <strong class="pc-quick-sheet__feature-name">{{ feat.name }}</strong>
            <p class="pc-quick-sheet__feature-desc">
              {{ feat.description }}
            </p>
          </li>
        </ul>
      </div>

      <div
        v-if="(resolved.level || 1) >= 5 && specializationFeatures.length > 0"
        class="pc-quick-sheet__feature-group"
      >
        <h5 class="pc-quick-sheet__feature-tier">
          Spécialisation
        </h5>
        <ul class="pc-quick-sheet__feature-list">
          <li
            v-for="feat in specializationFeatures"
            :key="feat.name"
            class="pc-quick-sheet__feature"
          >
            <strong class="pc-quick-sheet__feature-name">{{ feat.name }}</strong>
            <p class="pc-quick-sheet__feature-desc">
              {{ feat.description }}
            </p>
          </li>
        </ul>
      </div>

      <div
        v-if="(resolved.level || 1) >= 8 && masteryFeatures.length > 0"
        class="pc-quick-sheet__feature-group"
      >
        <h5 class="pc-quick-sheet__feature-tier">
          Maîtrise
        </h5>
        <ul class="pc-quick-sheet__feature-list">
          <li
            v-for="feat in masteryFeatures"
            :key="feat.name"
            class="pc-quick-sheet__feature"
          >
            <strong class="pc-quick-sheet__feature-name">{{ feat.name }}</strong>
            <p class="pc-quick-sheet__feature-desc">
              {{ feat.description }}
            </p>
          </li>
        </ul>
      </div>
    </section>

    <!-- Lien édition -->
    <router-link
      to="/table/prep/personnages"
      class="pc-quick-sheet__edit"
    >
      Éditer la fiche
    </router-link>
  </article>

  <p
    v-else
    class="pc-quick-sheet__not-found"
  >
    Personnage introuvable.
  </p>
</template>

<script>
import { computed } from 'vue'
import { useCharacterStore, resolveCharacterDisplay } from '@modules/characters'

export default {
  name: 'PcQuickSheet',

  props: {
    characterId: { type: String, required: true }
  },

  setup(props) {
    const characterStore = useCharacterStore()

    // Personnage brut depuis le store
    const character = computed(() =>
      characterStore.characters.find((c) => c.id === props.characterId) || null
    )

    // Objet enrichi avec stats effectives, données résolues (classe, sous-classe, cartes)
    const resolved = computed(() => {
      if (!character.value) return null
      return resolveCharacterDisplay(character.value)
    })

    // Tier calculé depuis le niveau (1-2 = T1, 3-4 = T2, 5-7 = T3, 8+ = T4)
    const tier = computed(() => {
      const level = resolved.value?.level || 1
      if (level >= 8) return 4
      if (level >= 5) return 3
      if (level >= 3) return 2
      return 1
    })

    // PV courants : slots non marqués (pleine santé = 0 marqués)
    const hpCurrent = computed(() => {
      if (!resolved.value) return 0
      const max = resolved.value.effectiveMaxHP
      const marked = resolved.value.currentHP || 0
      return Math.max(0, max - marked)
    })

    // Slots d'armure libres
    const armorSlotsFree = computed(() => {
      if (!resolved.value) return 0
      const total = resolved.value.effectiveArmorScore
      const marked = resolved.value.armorSlotsMarked || 0
      return Math.max(0, total - marked)
    })

    // Capacités de sous-classe résolues
    const foundationFeatures = computed(() =>
      resolved.value?.subclassData?.foundation || []
    )
    const specializationFeatures = computed(() =>
      resolved.value?.subclassData?.specialization || []
    )
    const masteryFeatures = computed(() =>
      resolved.value?.subclassData?.mastery || []
    )

    const hasSubclassFeatures = computed(() =>
      resolved.value?.subclassData !== null &&
      resolved.value?.subclassData !== undefined &&
      (foundationFeatures.value.length > 0 ||
        specializationFeatures.value.length > 0 ||
        masteryFeatures.value.length > 0)
    )

    return {
      resolved,
      tier,
      hpCurrent,
      armorSlotsFree,
      foundationFeatures,
      specializationFeatures,
      masteryFeatures,
      hasSubclassFeatures
    }
  }
}
</script>

<style scoped>
.pc-quick-sheet {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 1rem);
  padding: var(--space-md, 1rem);
  color: var(--color-text, #e2e8f0);
}

/* ── En-tête ────────────────────────────────────────────── */
.pc-quick-sheet__header {
  border-bottom: 1px solid var(--color-border, #334155);
  padding-bottom: var(--space-sm, 0.5rem);
}

.pc-quick-sheet__name {
  margin: 0 0 var(--space-xs, 0.25rem);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-hope, #f0c040);
}

.pc-quick-sheet__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
  font-size: 0.85rem;
  color: var(--color-text-secondary, #94a3b8);
}

.pc-quick-sheet__subclass {
  font-style: italic;
}

.pc-quick-sheet__tier {
  background: var(--color-surface-raised, #1e293b);
  border: 1px solid var(--color-border, #334155);
  border-radius: 4px;
  padding: 1px 6px;
  font-size: 0.75rem;
  color: var(--color-text-secondary, #94a3b8);
}

/* ── Titres de section ──────────────────────────────────── */
.pc-quick-sheet__section-title {
  margin: 0 0 var(--space-xs, 0.25rem);
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary, #94a3b8);
}

/* ── Grille de stats ────────────────────────────────────── */
.pc-quick-sheet__stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
  gap: var(--space-xs, 0.25rem);
  margin: 0;
}

.pc-quick-sheet__stat {
  background: var(--color-surface-raised, #1e293b);
  border: 1px solid var(--color-border, #334155);
  border-radius: 6px;
  padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
  text-align: center;
}

.pc-quick-sheet__stat-label {
  display: block;
  font-size: 0.7rem;
  color: var(--color-text-secondary, #94a3b8);
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.pc-quick-sheet__stat-value {
  display: block;
  font-size: 1rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.pc-quick-sheet__stat-sep {
  opacity: 0.4;
  font-weight: 400;
}

.pc-quick-sheet__stat-value--hp    { color: #22c55e; }
.pc-quick-sheet__stat-value--stress { color: #f97316; }
.pc-quick-sheet__stat-value--armor  { color: #60a5fa; }
.pc-quick-sheet__stat-value--hope   { color: var(--color-hope, #f0c040); }

/* ── Cartes de domaine ──────────────────────────────────── */
.pc-quick-sheet__card-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs, 0.25rem);
}

.pc-quick-sheet__card {
  background: var(--color-surface-raised, #1e293b);
  border: 1px solid var(--color-border, #334155);
  border-radius: 6px;
  padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
}

.pc-quick-sheet__card-name {
  font-weight: 600;
  font-size: 0.875rem;
}

.pc-quick-sheet__card-desc {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--color-text-secondary, #94a3b8);
  line-height: 1.4;
}

/* ── Capacités de sous-classe ───────────────────────────── */
.pc-quick-sheet__feature-group {
  margin-bottom: var(--space-sm, 0.5rem);
}

.pc-quick-sheet__feature-tier {
  margin: 0 0 4px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-secondary, #94a3b8);
}

.pc-quick-sheet__feature-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs, 0.25rem);
}

.pc-quick-sheet__feature {
  background: var(--color-surface-raised, #1e293b);
  border: 1px solid var(--color-border, #334155);
  border-radius: 6px;
  padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
}

.pc-quick-sheet__feature-name {
  font-size: 0.85rem;
  display: block;
}

.pc-quick-sheet__feature-desc {
  margin: 2px 0 0;
  font-size: 0.78rem;
  color: var(--color-text-secondary, #94a3b8);
  line-height: 1.4;
}

/* ── Lien édition ───────────────────────────────────────── */
.pc-quick-sheet__edit {
  display: inline-block;
  margin-top: var(--space-xs, 0.25rem);
  color: var(--color-hope, #f0c040);
  font-size: 0.85rem;
  text-decoration: none;
}

.pc-quick-sheet__edit:hover {
  text-decoration: underline;
}

.pc-quick-sheet__not-found {
  color: var(--color-text-secondary, #94a3b8);
  font-style: italic;
  padding: var(--space-md, 1rem);
}
</style>
