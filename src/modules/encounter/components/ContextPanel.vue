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

    <!-- Indicateur de position (dots) — visible si ≥ 2 tabs -->
    <div
      v-if="visibleTabs.length >= 2"
      class="ctx-panel__dots"
      aria-hidden="true"
    >
      <span
        v-for="tab in visibleTabs"
        :key="tab.id"
        class="ctx-panel__dot"
        :class="{ 'ctx-panel__dot--active': activeTab === tab.id }"
      ></span>
    </div>

    <!-- Zone swipeable — englobe tout le contenu -->
    <div
      ref="swipeZone"
      class="ctx-panel__swipe-zone"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <!-- ═══════════════════════════════════════════════════════ -->
      <!--  Contenu PJ : features filtrées par tags / mode scène  -->
      <!-- ═══════════════════════════════════════════════════════ -->
      <div
        v-if="activeTab === 'pc' && pc"
        class="ctx-panel__content"
      >
        <!-- Stats interactives PJ -->
        <div class="ctx-panel__pc-stats">
          <!-- Barre HP -->
          <div
            class="ctx-panel__bar"
            :aria-label="'PV : ' + (pc.currentHP || 0) + ' marques sur ' + pc.maxHP"
          >
            <button
              class="ctx-panel__bar-btn"
              :disabled="(pc.currentHP || 0) <= 0"
              aria-label="Soigner 1 PV"
              @click="decrementHP()"
            >
              &minus;
            </button>
            <div class="ctx-panel__bar-track">
              <div
                class="ctx-panel__bar-fill"
                :style="{ width: hpFillPercent() + '%', backgroundColor: hpColor() }"
              ></div>
            </div>
            <span class="ctx-panel__bar-text">
              &#x2764;&#xFE0F; {{ pc.currentHP || 0 }}/{{ pc.maxHP }}
            </span>
            <button
              class="ctx-panel__bar-btn"
              :disabled="(pc.currentHP || 0) >= pc.maxHP"
              aria-label="Marquer 1 degat"
              @click="incrementHP()"
            >
              +
            </button>
          </div>

          <!-- Barre Stress -->
          <div
            class="ctx-panel__bar"
            :aria-label="'Stress : ' + (pc.currentStress || 0) + ' sur ' + pc.maxStress"
          >
            <button
              class="ctx-panel__bar-btn"
              :disabled="(pc.currentStress || 0) <= 0"
              aria-label="Reduire 1 stress"
              @click="decrementStress()"
            >
              &minus;
            </button>
            <div class="ctx-panel__bar-track">
              <div
                class="ctx-panel__bar-fill"
                :style="{ width: stressFillPercent() + '%', backgroundColor: stressColor() }"
              ></div>
            </div>
            <span class="ctx-panel__bar-text">
              &#x1F4A2; {{ pc.currentStress || 0 }}/{{ pc.maxStress }}
            </span>
            <button
              class="ctx-panel__bar-btn"
              :disabled="(pc.currentStress || 0) >= pc.maxStress"
              aria-label="Marquer 1 stress"
              @click="incrementStress()"
            >
              +
            </button>
          </div>

          <!-- Seuils (Majeur / Sévère) -->
          <div
            v-if="pc.armorBaseThresholds"
            class="ctx-panel__thresholds"
          >
            <span class="ctx-panel__threshold">
              ⚔️ Seuils :
              <strong>{{ pc.armorBaseThresholds.major || 0 }}</strong> Maj
              / <strong>{{ pc.armorBaseThresholds.severe || 0 }}</strong> Sév
            </span>
          </div>

          <!-- Armure + Espoir (ligne compacte) -->
          <div class="ctx-panel__bar-row">
            <div
              class="ctx-panel__bar ctx-panel__bar--half"
              :aria-label="'Armure : ' + (pc.armorSlotsMarked || 0) + ' sur ' + (pc.armorScore || 0)"
            >
              <button
                class="ctx-panel__bar-btn ctx-panel__bar-btn--sm"
                :disabled="(pc.armorSlotsMarked || 0) <= 0"
                aria-label="Restaurer 1 armure"
                @click="decrementArmor()"
              >
                &minus;
              </button>
              <div class="ctx-panel__bar-track">
                <div
                  class="ctx-panel__bar-fill ctx-panel__bar-fill--armor"
                  :style="{ width: armorFillPercent() + '%' }"
                ></div>
              </div>
              <span class="ctx-panel__bar-text ctx-panel__bar-text--sm">
                &#x1F6E1;&#xFE0F; {{ pc.armorSlotsMarked || 0 }}/{{ pc.armorScore || 0 }}
              </span>
              <button
                class="ctx-panel__bar-btn ctx-panel__bar-btn--sm"
                :disabled="(pc.armorSlotsMarked || 0) >= (pc.armorScore || 0)"
                aria-label="Utiliser 1 armure"
                @click="incrementArmor()"
              >
                +
              </button>
            </div>
            <div
              class="ctx-panel__bar ctx-panel__bar--half"
              :aria-label="'Espoir : ' + (pc.hope || 0)"
            >
              <button
                class="ctx-panel__bar-btn ctx-panel__bar-btn--sm"
                :disabled="(pc.hope || 0) <= 0"
                aria-label="Depenser 1 espoir"
                @click="decrementHope()"
              >
                &minus;
              </button>
              <span class="ctx-panel__bar-text ctx-panel__bar-text--sm">
                &#x2728; {{ pc.hope || 0 }}
              </span>
              <button
                class="ctx-panel__bar-btn ctx-panel__bar-btn--sm"
                :disabled="(pc.hope || 0) >= 6"
                aria-label="Gagner 1 espoir"
                @click="incrementHope()"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <!-- Armes — info jet d'attaque + dégâts -->
        <div
          v-if="primaryWeapon || secondaryWeapon"
          class="ctx-panel__weapons"
        >
          <!-- Arme principale -->
          <div
            v-if="primaryWeapon"
            class="ctx-panel__weapon"
          >
            <div class="ctx-panel__weapon-header">
              <span class="ctx-panel__weapon-name">
                {{ primaryWeapon.name }}
              </span>
              <span class="ctx-panel__weapon-badge ctx-panel__weapon-badge--primary">
                Principale
              </span>
            </div>
            <div class="ctx-panel__weapon-stats">
              <span
                class="ctx-panel__weapon-stat"
                title="Trait utilisé pour le jet d'attaque"
              >🎯 {{ primaryWeapon.trait }}</span>
              <span
                class="ctx-panel__weapon-stat"
                title="Dés de dégâts + Proficiency"
              >🎲 {{ primaryWeapon.damage }}+{{ pcProficiency }}</span>
              <span
                class="ctx-panel__weapon-stat"
                :title="'Type de dégâts : ' + (primaryWeapon.damageType === 'mag' ? 'Magique' : 'Physique')"
              >{{ primaryWeapon.damageType === 'mag' ? '✨ mag' : '🗡️ phy' }}</span>
              <span
                class="ctx-panel__weapon-stat"
                title="Portée"
              >📏 {{ primaryWeapon.range }}</span>
              <span
                v-if="primaryWeapon.burden"
                class="ctx-panel__weapon-stat"
                title="Prise"
              >✋ {{ primaryWeapon.burden }}</span>
            </div>
            <p
              v-if="primaryWeapon.feature"
              class="ctx-panel__weapon-feature"
            >
              {{ primaryWeapon.feature }}
            </p>
          </div>

          <!-- Arme secondaire -->
          <div
            v-if="secondaryWeapon"
            class="ctx-panel__weapon ctx-panel__weapon--secondary"
          >
            <div class="ctx-panel__weapon-header">
              <span class="ctx-panel__weapon-name">
                {{ secondaryWeapon.name }}
              </span>
              <span class="ctx-panel__weapon-badge">
                Secondaire
              </span>
            </div>
            <div class="ctx-panel__weapon-stats">
              <span class="ctx-panel__weapon-stat">🎯 {{ secondaryWeapon.trait }}</span>
              <span class="ctx-panel__weapon-stat">🎲 {{ secondaryWeapon.damage }}+{{ pcProficiency }}</span>
              <span class="ctx-panel__weapon-stat">{{ secondaryWeapon.damageType === 'mag' ? '✨ mag' : '🗡️ phy' }}</span>
              <span class="ctx-panel__weapon-stat">📏 {{ secondaryWeapon.range }}</span>
            </div>
            <p
              v-if="secondaryWeapon.feature"
              class="ctx-panel__weapon-feature"
            >
              {{ secondaryWeapon.feature }}
            </p>
          </div>
        </div>

        <!-- Trait de spellcast -->
        <div
          v-if="spellcastInfo"
          class="ctx-panel__spellcast"
        >
          <span class="ctx-panel__spellcast-badge">
            🔮 {{ spellcastInfo.label }}
          </span>
        </div>

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

        <!-- ── Filtre par tag ── -->
        <div class="ctx-panel__tag-filters">
          <button
            v-for="tf in TAG_FILTERS"
            :key="tf.id"
            class="ctx-panel__tag-btn"
            :class="{
              'ctx-panel__tag-btn--on': activeTagFilter === tf.id
            }"
            :title="tf.label"
            :aria-label="'Filtrer par ' + tf.label"
            @click="toggleTagFilter(tf.id)"
          >
            {{ tf.emoji }}
          </button>
        </div>

        <!-- ══ Vue filtrée par tag ══ -->
        <template v-if="activeTagFilter">
          <div
            v-if="tagFilteredTotal === 0"
            class="ctx-panel__empty-filter"
          >
            <p>
              Aucune feature {{ activeTagFilter }} pour ce PJ.
            </p>
          </div>

          <div
            v-if="tagFilteredActions.length > 0"
            class="ctx-panel__section"
          >
            <h4 class="ctx-panel__section-title ctx-panel__section-title--primary">
              Actions
              <span class="ctx-panel__count">{{ tagFilteredActions.length }}</span>
            </h4>
            <FeatureCard
              v-for="f in tagFilteredActions"
              :key="f.name + f.source"
              :feature="f"
              :show-spell-badge="!!f.isSpell"
              :trait-label="f.resolvedTraitLabel || ''"
            />
          </div>

          <div
            v-if="tagFilteredReactions.length > 0"
            class="ctx-panel__section"
          >
            <h4 class="ctx-panel__section-title ctx-panel__section-title--reaction">
              🟠 Réactions
              <span class="ctx-panel__count">{{ tagFilteredReactions.length }}</span>
            </h4>
            <FeatureCard
              v-for="f in tagFilteredReactions"
              :key="f.name + f.source"
              :feature="f"
              :show-spell-badge="!!f.isSpell"
              :trait-label="f.resolvedTraitLabel || ''"
            />
          </div>

          <div
            v-if="tagFilteredPassives.length > 0"
            class="ctx-panel__section"
          >
            <h4 class="ctx-panel__section-title ctx-panel__section-title--passive">
              🔵 Passives
              <span class="ctx-panel__count">{{ tagFilteredPassives.length }}</span>
            </h4>
            <FeatureCard
              v-for="f in tagFilteredPassives"
              :key="f.name + f.source"
              :feature="f"
              :show-spell-badge="!!f.isSpell"
              :trait-label="f.resolvedTraitLabel || ''"
            />
          </div>
        </template>

        <!-- ══ Vue classifiée par mode (quand pas de filtre tag) ══ -->
        <template v-else>
          <!-- Features principales -->
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
              :show-spell-badge="!!getEnrichment(f).isSpell"
              :trait-label="getEnrichment(f).resolvedTraitLabel || ''"
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
              :show-spell-badge="!!getEnrichment(f).isSpell"
              :trait-label="getEnrichment(f).resolvedTraitLabel || ''"
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
              :show-spell-badge="!!getEnrichment(f).isSpell"
              :trait-label="getEnrichment(f).resolvedTraitLabel || ''"
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
              :show-spell-badge="!!getEnrichment(f).isSpell"
              :trait-label="getEnrichment(f).resolvedTraitLabel || ''"
            />
          </div>
        </template>
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
    </div><!-- fin swipe-zone -->
  </aside>
</template>

<script>
import { computed, ref, watch } from 'vue'
import { SCENE_MODE_META, SCENE_MODE_PC_ATTACK } from '@data/encounters/liveConstants'
import { classifyAdversaryFeatures } from '../composables/useEncounterFeatures'
import { useSwipe } from '../composables/useSwipe'
import { getPrimaryWeaponById, getSecondaryWeaponById } from '@data/equipment'
import { useCharacterStore } from '@modules/characters'
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
    reactionFeatures: { type: Array, default: () => [] },
    /** Toutes les features PJ (non classifiées, pour filtrage par tag) */
    allFeatures: { type: Array, default: () => [] },
    /** Info spellcast du PJ actif (depuis usePlayerActions) */
    spellcastInfo: { type: Object, default: null },
    /** Features enrichies par usePlayerActions */
    enrichedFeatures: { type: Array, default: () => [] }
  },
  setup(props) {
    const activeTab  = ref('pc')
    const swipeZone  = ref(null)

    // ── Tabs visibles selon les props disponibles ──────────────
    const visibleTabs = computed(() => {
      const tabs = []
      if (props.pc)          tabs.push({ id: 'pc' })
      if (props.adversary)   tabs.push({ id: 'adversary' })
      if (props.environment) tabs.push({ id: 'environment' })
      return tabs
    })

    // ── Navigation par swipe ───────────────────────────────────
    function swipeNext() {
      const tabs = visibleTabs.value
      const idx  = tabs.findIndex((t) => t.id === activeTab.value)
      if (idx < tabs.length - 1) {
        activeTab.value = tabs[idx + 1].id
        resetScroll()
      }
    }

    function swipePrev() {
      const tabs = visibleTabs.value
      const idx  = tabs.findIndex((t) => t.id === activeTab.value)
      if (idx > 0) {
        activeTab.value = tabs[idx - 1].id
        resetScroll()
      }
    }

    function resetScroll() {
      if (swipeZone.value) swipeZone.value.scrollTop = 0
    }

    const { onTouchStart, onTouchEnd } = useSwipe({
      onSwipeLeft:  swipeNext,
      onSwipeRight: swipePrev
    })

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
      if (tag === 'social') return '🗣️ Social'
      return '⚔️ Actions'
    })

    // ── Filtre par tag ──────────────────────────────────────
    const TAG_FILTERS = [
      { id: 'offensif', emoji: '⚔️', label: 'Offensif' },
      { id: 'défensif', emoji: '🛡️', label: 'Défensif' },
      { id: 'social', emoji: '🗣️', label: 'Social' },
      { id: 'utilitaire', emoji: '🔧', label: 'Utilitaire' }
    ]

    /** Tag actif (null = classification par mode de scène) */
    const activeTagFilter = ref(null)

    function toggleTagFilter(tagId) {
      activeTagFilter.value = activeTagFilter.value === tagId ? null : tagId
    }

    /** Features enrichies ou fallback vers allFeatures */
    const effectiveFeatures = computed(() => {
      return props.enrichedFeatures.length > 0 ? props.enrichedFeatures : props.allFeatures
    })

    /** Lookup enrichissement par clé feature (name + source) */
    const enrichmentMap = computed(() => {
      const map = new Map()
      for (const f of effectiveFeatures.value) {
        map.set(f.name + f.source, f)
      }
      return map
    })

    /** Résout l'enrichissement d'une feature */
    function getEnrichment(feature) {
      return enrichmentMap.value.get(feature.name + feature.source) || feature
    }

    /** Features filtrées par le tag actif, groupées par type d'activation */
    const tagFilteredActions = computed(() => {
      if (!activeTagFilter.value) return []
      return effectiveFeatures.value.filter((f) =>
        f.activationType === 'action' && f.tags.includes(activeTagFilter.value)
      )
    })

    const tagFilteredReactions = computed(() => {
      if (!activeTagFilter.value) return []
      return effectiveFeatures.value.filter((f) =>
        f.activationType === 'reaction' && f.tags.includes(activeTagFilter.value)
      )
    })

    const tagFilteredPassives = computed(() => {
      if (!activeTagFilter.value) return []
      return effectiveFeatures.value.filter((f) =>
        f.activationType === 'passive' && f.tags.includes(activeTagFilter.value)
      )
    })

    const tagFilteredTotal = computed(() =>
      tagFilteredActions.value.length + tagFilteredReactions.value.length + tagFilteredPassives.value.length
    )

    /** Reset le filtre quand le PJ change */
    watch(() => props.pc, () => {
      activeTagFilter.value = null
    })

    // Expériences PJ
    const pcExperiences = computed(() => {
      if (!props.pc) return []
      return Array.isArray(props.pc.experiences) ? props.pc.experiences.filter((e) => e.name) : []
    })

    // Armes PJ
    const primaryWeapon = computed(() => {
      if (!props.pc || !props.pc.primaryWeaponId) return null
      return getPrimaryWeaponById(props.pc.primaryWeaponId) || null
    })

    const secondaryWeapon = computed(() => {
      if (!props.pc || !props.pc.secondaryWeaponId) return null
      return getSecondaryWeaponById(props.pc.secondaryWeaponId) || null
    })

    const pcProficiency = computed(() => {
      if (!props.pc) return 0
      return props.pc.proficiency || 1
    })

    // ══════════════════════════════════════════════
    //  Gestion interactive HP / Stress / Armure / Espoir
    // ══════════════════════════════════════════════

    const characterStore = useCharacterStore()

    /** Marquer 1 degat */
    function incrementHP() {
      if (!props.pc) return
      const newVal = Math.min(props.pc.maxHP, (props.pc.currentHP || 0) + 1)
      characterStore.patchCharacterById(props.pc.id, { currentHP: newVal })
    }

    /** Soigner 1 PV */
    function decrementHP() {
      if (!props.pc) return
      const newVal = Math.max(0, (props.pc.currentHP || 0) - 1)
      characterStore.patchCharacterById(props.pc.id, { currentHP: newVal })
    }

    /** Marquer 1 stress */
    function incrementStress() {
      if (!props.pc) return
      const newVal = Math.min(props.pc.maxStress, (props.pc.currentStress || 0) + 1)
      characterStore.patchCharacterById(props.pc.id, { currentStress: newVal })
    }

    /** Reduire 1 stress */
    function decrementStress() {
      if (!props.pc) return
      const newVal = Math.max(0, (props.pc.currentStress || 0) - 1)
      characterStore.patchCharacterById(props.pc.id, { currentStress: newVal })
    }

    /** Utiliser 1 slot d'armure */
    function incrementArmor() {
      if (!props.pc) return
      const newVal = Math.min(props.pc.armorScore || 0, (props.pc.armorSlotsMarked || 0) + 1)
      characterStore.patchCharacterById(props.pc.id, { armorSlotsMarked: newVal })
    }

    /** Restaurer 1 slot d'armure */
    function decrementArmor() {
      if (!props.pc) return
      const newVal = Math.max(0, (props.pc.armorSlotsMarked || 0) - 1)
      characterStore.patchCharacterById(props.pc.id, { armorSlotsMarked: newVal })
    }

    /** Gagner 1 espoir */
    function incrementHope() {
      if (!props.pc) return
      const newVal = Math.min(6, (props.pc.hope || 0) + 1)
      characterStore.patchCharacterById(props.pc.id, { hope: newVal })
    }

    /** Depenser 1 espoir */
    function decrementHope() {
      if (!props.pc) return
      const newVal = Math.max(0, (props.pc.hope || 0) - 1)
      characterStore.patchCharacterById(props.pc.id, { hope: newVal })
    }

    /** Pourcentage de remplissage barre HP */
    function hpFillPercent() {
      if (!props.pc || !props.pc.maxHP) return 0
      return Math.round(((props.pc.currentHP || 0) / props.pc.maxHP) * 100)
    }

    /** Pourcentage de remplissage barre Stress */
    function stressFillPercent() {
      if (!props.pc || !props.pc.maxStress) return 0
      return Math.round(((props.pc.currentStress || 0) / props.pc.maxStress) * 100)
    }

    /** Pourcentage de remplissage barre Armure */
    function armorFillPercent() {
      if (!props.pc || !props.pc.armorScore) return 0
      return Math.round(((props.pc.armorSlotsMarked || 0) / props.pc.armorScore) * 100)
    }

    /** Couleur dynamique HP (vert/jaune/rouge selon PV restants) */
    function hpColor() {
      if (!props.pc || !props.pc.maxHP) return 'var(--color-text-muted)'
      const remaining = props.pc.maxHP - (props.pc.currentHP || 0)
      const ratio = remaining / props.pc.maxHP
      if (ratio > 0.5) return 'var(--color-accent-success)'
      if (ratio > 0.25) return 'var(--color-accent-warning)'
      return 'var(--color-accent-danger)'
    }

    /** Couleur dynamique Stress (vert/jaune/rouge selon stress) */
    function stressColor() {
      if (!props.pc || !props.pc.maxStress) return 'var(--color-text-muted)'
      const ratio = (props.pc.currentStress || 0) / props.pc.maxStress
      if (ratio < 0.5) return 'var(--color-accent-success)'
      if (ratio < 0.75) return 'var(--color-accent-warning)'
      return 'var(--color-accent-danger)'
    }

    // Features adversaire classifiées
    const advClassified = computed(() => {
      if (!props.adversary) return { passiveFeatures: [], actionFeatures: [], reactionFeatures: [] }
      return classifyAdversaryFeatures(props.adversary, props.sceneMode)
    })

    const advPassives = computed(() => advClassified.value.passiveFeatures)
    const advActions = computed(() => advClassified.value.actionFeatures)
    const advReactions = computed(() => advClassified.value.reactionFeatures)

    return {
      activeTab, swipeZone, visibleTabs,
      onTouchStart, onTouchEnd,
      primaryLabel,
      TAG_FILTERS, activeTagFilter, toggleTagFilter,
      effectiveFeatures, enrichmentMap, getEnrichment,
      tagFilteredActions, tagFilteredReactions, tagFilteredPassives, tagFilteredTotal,
      pcExperiences,
      primaryWeapon, secondaryWeapon, pcProficiency,
      advPassives, advActions, advReactions,
      // Gestion interactive stats PJ
      incrementHP, decrementHP,
      incrementStress, decrementStress,
      incrementArmor, decrementArmor,
      incrementHope, decrementHope,
      hpFillPercent, stressFillPercent, armorFillPercent,
      hpColor, stressColor
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

/* ── Dots indicateur de position ── */

.ctx-panel__dots {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  padding: var(--space-xs) 0;
  flex-shrink: 0;
  background: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
}

.ctx-panel__dot {
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-border-active);
  opacity: 0.35;
  transition: opacity var(--transition-fast), background var(--transition-fast), transform var(--transition-fast);
}

.ctx-panel__dot--active {
  background: var(--color-accent-hope);
  opacity: 1;
  transform: scale(1.25);
}

/* ── Zone swipeable ── */

.ctx-panel__swipe-zone {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  /* Scroll inertiel iOS */
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

/* ── Tabs ── */

.ctx-panel__tabs {
  display: flex;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 1;
}

.ctx-panel__tab {
  flex: 1;
  padding: var(--space-xs) var(--space-sm);
  min-height: var(--touch-min);
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
  touch-action: manipulation;
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

/* ── Seuils ── */

.ctx-panel__thresholds {
  display: flex;
  align-items: center;
  padding: var(--space-xs) 0;
}

.ctx-panel__threshold {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.ctx-panel__threshold strong {
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

/* ── Armes ── */

.ctx-panel__weapons {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.ctx-panel__weapon {
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
}

.ctx-panel__weapon--secondary {
  opacity: 0.8;
}

.ctx-panel__weapon-header {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  margin-bottom: var(--space-xs);
}

.ctx-panel__weapon-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
}

.ctx-panel__weapon-badge {
  font-size: 0.6rem;
  padding: 1px var(--space-xs);
  border-radius: var(--radius-full);
  background: var(--color-bg-input);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ctx-panel__weapon-badge--primary {
  background: rgba(83, 168, 182, 0.15);
  color: var(--color-accent-hope);
}

.ctx-panel__weapon-stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.ctx-panel__weapon-stat {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
}

.ctx-panel__weapon-feature {
  margin: var(--space-xs) 0 0;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-style: italic;
  line-height: var(--line-height-normal);
}

/* ── Spellcast info ── */

.ctx-panel__spellcast {
  padding: var(--space-xs) var(--space-sm);
}

.ctx-panel__spellcast-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-md);
  font-size: var(--font-sm);
  font-weight: var(--font-semibold);
  background: rgba(124, 58, 237, 0.12);
  color: #7c3aed;
}

/* ── Tag filters ── */

.ctx-panel__tag-filters {
  display: flex;
  gap: 4px;
  padding: 0;
  flex-shrink: 0;
}

.ctx-panel__tag-btn {
  flex: 1;
  padding: var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
  text-align: center;
}

.ctx-panel__tag-btn:hover {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-active);
}

.ctx-panel__tag-btn--on {
  background: rgba(83, 168, 182, 0.2);
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 1px var(--color-accent-hope);
}

.ctx-panel__empty-filter {
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  text-align: center;
  padding: var(--space-md);
}

.ctx-panel__empty-filter p {
  margin: 0;
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

/* ══════════════════════════════════════════════
   STATS INTERACTIVES PJ
   ══════════════════════════════════════════════ */

.ctx-panel__pc-stats {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  margin-bottom: var(--space-sm);
  padding: var(--space-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.ctx-panel__bar {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.ctx-panel__bar-row {
  display: flex;
  gap: var(--space-sm);
}

.ctx-panel__bar--half {
  flex: 1;
}

.ctx-panel__bar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  cursor: pointer;
  touch-action: manipulation;
  padding: 0;
  line-height: 1;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.ctx-panel__bar-btn--sm {
  min-width: 2rem;
  min-height: 2rem;
  font-size: var(--font-size-sm);
}

.ctx-panel__bar-btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  border-color: var(--color-border-active);
}

.ctx-panel__bar-btn:active:not(:disabled) {
  transform: scale(0.92);
}

.ctx-panel__bar-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.ctx-panel__bar-track {
  flex: 1;
  height: 6px;
  background: var(--color-bg-elevated);
  border-radius: 3px;
  overflow: hidden;
}

.ctx-panel__bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.ctx-panel__bar-fill--armor {
  background: var(--color-accent-gold);
}

.ctx-panel__bar-text {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  min-width: 4rem;
  text-align: center;
}

.ctx-panel__bar-text--sm {
  min-width: 3rem;
  font-size: 0.7rem;
}
</style>
