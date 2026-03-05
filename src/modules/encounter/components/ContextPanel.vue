<template>
  <aside
    class="ctx-panel"
    aria-label="Panneau contextuel"
  >
    <!-- Tabs de navigation -->
    <nav class="ctx-panel__tabs">
      <button
        v-if="pc"
        class="ctx-panel__tab"
        :class="{ 'ctx-panel__tab--active': activeTab === 'pc' }"
        @click="activeTab = 'pc'"
      >
        🧑 {{ pc.name }}
      </button>
      <button
        v-if="adversary"
        class="ctx-panel__tab"
        :class="{ 'ctx-panel__tab--active': activeTab === 'adversary' }"
        @click="activeTab = 'adversary'"
      >
        👹 {{ adversary.name }}
      </button>
      <button
        v-if="environment"
        class="ctx-panel__tab"
        :class="{ 'ctx-panel__tab--active': activeTab === 'environment' }"
        @click="activeTab = 'environment'"
      >
        🗺️ Env
      </button>
    </nav>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!--  Contenu PJ : features filtrées par tags / mode scène  -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div
      v-if="activeTab === 'pc' && pc"
      class="ctx-panel__content"
    >
      <!-- Expériences -->
      <div
        v-if="pcExperiences.length > 0"
        class="ctx-panel__section"
      >
        <h4 class="ctx-panel__section-title">
          📋 Expériences
        </h4>
        <div class="ctx-panel__exp-list">
          <span
            v-for="exp in pcExperiences"
            :key="exp.name"
            class="ctx-panel__exp"
          >{{ exp.name }} <strong v-if="exp.bonus">+{{ exp.bonus }}</strong></span>
        </div>
      </div>

      <!-- Features principales (filtrées par tag du mode de scène) -->
      <div
        v-if="primaryFeatures.length > 0"
        class="ctx-panel__section"
      >
        <h4 class="ctx-panel__section-title ctx-panel__section-title--primary">
          {{ primaryLabel }}
          <span class="ctx-panel__count">{{ primaryFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in primaryFeatures"
          :key="f.name + f.source"
          :feature="f"
        />
      </div>

      <!-- Réactions -->
      <div
        v-if="reactionFeatures.length > 0"
        class="ctx-panel__section"
      >
        <h4 class="ctx-panel__section-title ctx-panel__section-title--reaction">
          🟠 Réactions
          <span class="ctx-panel__count">{{ reactionFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in reactionFeatures"
          :key="f.name + f.source"
          :feature="f"
        />
      </div>

      <!-- Features secondaires (atténuées) -->
      <div
        v-if="secondaryFeatures.length > 0"
        class="ctx-panel__section"
      >
        <h4 class="ctx-panel__section-title ctx-panel__section-title--secondary">
          Secondaires
          <span class="ctx-panel__count">{{ secondaryFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in secondaryFeatures"
          :key="f.name + f.source"
          :feature="f"
          :dimmed="true"
          :default-expanded="false"
        />
      </div>

      <!-- Passives -->
      <div
        v-if="passiveFeatures.length > 0"
        class="ctx-panel__section"
      >
        <h4 class="ctx-panel__section-title ctx-panel__section-title--passive">
          🔵 Passives
          <span class="ctx-panel__count">{{ passiveFeatures.length }}</span>
        </h4>
        <FeatureCard
          v-for="f in passiveFeatures"
          :key="f.name + f.source"
          :feature="f"
          :dimmed="true"
          :default-expanded="false"
        />
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!--  Contenu Adversaire : features + motives/tactiques     -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div
      v-if="activeTab === 'adversary' && adversary"
      class="ctx-panel__content"
    >
      <!-- Expériences adversaire -->
      <div
        v-if="adversary.experiences && adversary.experiences.length > 0"
        class="ctx-panel__section"
      >
        <h4 class="ctx-panel__section-title">
          📋 Expériences
        </h4>
        <div class="ctx-panel__exp-list">
          <span
            v-for="exp in adversary.experiences"
            :key="typeof exp === 'string' ? exp : exp.name"
            class="ctx-panel__exp"
          >{{ typeof exp === 'string' ? exp : (exp.name + (exp.bonus ? ' +' + exp.bonus : '')) }}</span>
        </div>
      </div>

      <!-- Motives / Tactiques -->
      <div
        v-if="adversary.motives && adversary.motives.length > 0"
        class="ctx-panel__section"
      >
        <h4 class="ctx-panel__section-title">
          🎯 Motives &amp; Tactiques
        </h4>
        <p class="ctx-panel__motives">
          {{ adversary.motives.join(', ') }}
        </p>
      </div>

      <!-- Features adversaire classifiées -->
      <div
        v-if="advPassives.length > 0"
        class="ctx-panel__section"
      >
        <h4 class="ctx-panel__section-title ctx-panel__section-title--passive">
          🔵 Passives
        </h4>
        <FeatureCard
          v-for="f in advPassives"
          :key="f.name"
          :feature="f"
        />
      </div>

      <div
        v-if="advActions.length > 0"
        class="ctx-panel__section"
      >
        <h4 class="ctx-panel__section-title ctx-panel__section-title--primary">
          ⚔️ Actions
        </h4>
        <FeatureCard
          v-for="f in advActions"
          :key="f.name"
          :feature="f"
        />
      </div>

      <div
        v-if="advReactions.length > 0"
        class="ctx-panel__section"
      >
        <h4 class="ctx-panel__section-title ctx-panel__section-title--reaction">
          🟠 Réactions
        </h4>
        <FeatureCard
          v-for="f in advReactions"
          :key="f.name"
          :feature="f"
        />
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════ -->
    <!--  Contenu Environnement                                 -->
    <!-- ═══════════════════════════════════════════════════════ -->
    <div
      v-if="activeTab === 'environment' && environment"
      class="ctx-panel__content"
    >
      <EnvironmentPanel :environment="environment" />
    </div>

    <!-- État vide -->
    <div
      v-if="!pc && !adversary && !environment"
      class="ctx-panel__empty"
    >
      <p>Sélectionnez un PJ ou un adversaire pour voir ses features.</p>
    </div>
  </aside>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { SCENE_MODE_META, SCENE_MODE_PC_ATTACK } from '@data/encounters/liveConstants'
import { classifyAdversaryFeatures } from '../composables/useEncounterFeatures'
import FeatureCard from './FeatureCard.vue'
import EnvironmentPanel from './EnvironmentPanel.vue'

export default {
  name: 'ContextPanel',
  components: { FeatureCard, EnvironmentPanel },
  props: {
    /** PJ actif (depuis le store) */
    pc: { type: Object, default: null },
    /** Adversaire actif (depuis le store) */
    adversary: { type: Object, default: null },
    /** Environnement actif */
    environment: { type: Object, default: null },
    /** Mode de scène actuel */
    sceneMode: { type: String, default: SCENE_MODE_PC_ATTACK },
    /** Dernière catégorie cliquée ('pc' ou 'adversary') */
    lastClickCategory: { type: String, default: 'pc' },
    /** Features PJ classifiées par le composable useEncounterFeatures */
    primaryFeatures: { type: Array, default: () => [] },
    secondaryFeatures: { type: Array, default: () => [] },
    passiveFeatures: { type: Array, default: () => [] },
    reactionFeatures: { type: Array, default: () => [] }
  },
  setup(props) {
    const activeTab = ref('pc')

    // Auto-switch quand le MJ clique sur un PJ ou un adversaire
    watch(() => props.lastClickCategory, (cat) => {
      if (cat === 'pc' && props.pc) activeTab.value = 'pc'
      else if (cat === 'adversary' && props.adversary) activeTab.value = 'adversary'
    })

    // Label dynamique pour la section principale
    const primaryLabel = computed(() => {
      const meta = SCENE_MODE_META[props.sceneMode]
      if (!meta) return '⚔️ Actions'
      const tag = meta.primaryTags[0]
      if (tag === 'offensif') return '⚔️ Offensif'
      if (tag === 'défensif') return '🛡️ Défensif'
      return '⚔️ Actions'
    })

    // Expériences PJ
    const pcExperiences = computed(() => {
      if (!props.pc) return []
      return Array.isArray(props.pc.experiences) ? props.pc.experiences.filter((e) => e.name) : []
    })

    // Features adversaire classifiées
    const advClassified = computed(() => {
      if (!props.adversary) return { passiveFeatures: [], actionFeatures: [], reactionFeatures: [] }
      return classifyAdversaryFeatures(props.adversary, props.sceneMode)
    })

    const advPassives = computed(() => advClassified.value.passiveFeatures)
    const advActions = computed(() => advClassified.value.actionFeatures)
    const advReactions = computed(() => advClassified.value.reactionFeatures)

    return {
      activeTab,
      primaryLabel,
      pcExperiences,
      advPassives, advActions, advReactions
    }
  }
}
</script>

<style scoped>
.ctx-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 1px solid var(--color-border);
  background: var(--color-bg-primary);
  overflow: hidden;
}

/* ── Tabs ── */

.ctx-panel__tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  flex-shrink: 0;
}

.ctx-panel__tab {
  flex: 1;
  padding: var(--space-xs) var(--space-sm);
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: color var(--transition-fast), border-color var(--transition-fast);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ctx-panel__tab:hover {
  color: var(--color-text-primary);
}

.ctx-panel__tab--active {
  color: var(--color-text-primary);
  border-bottom-color: var(--color-accent-hope);
}

/* ── Content ── */

.ctx-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.ctx-panel__section {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.ctx-panel__section-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.ctx-panel__section-title--primary {
  color: var(--color-accent-hope);
}

.ctx-panel__section-title--reaction {
  color: var(--color-accent-warning);
}

.ctx-panel__section-title--secondary {
  color: var(--color-text-muted);
}

.ctx-panel__section-title--passive {
  color: var(--color-accent-info);
}

.ctx-panel__count {
  font-size: 0.65rem;
  background: var(--color-bg-elevated);
  padding: 0 var(--space-xs);
  border-radius: var(--radius-full);
  color: var(--color-text-muted);
}

/* ── Expériences ── */

.ctx-panel__exp-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.ctx-panel__exp {
  font-size: var(--font-size-xs);
  padding: 1px var(--space-xs);
  background: var(--color-bg-elevated);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
}

.ctx-panel__exp strong {
  color: var(--color-accent-gold);
}

/* ── Motives ── */

.ctx-panel__motives {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  margin: 0;
  font-style: italic;
}

/* ── Empty ── */

.ctx-panel__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: var(--space-lg);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  text-align: center;
}
</style>
