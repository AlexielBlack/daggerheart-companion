<!--
  NpcCombatPanel.vue — Panneau combat d'un PNJ.
  3 modes : aucun, lié à un adversaire, profil custom.
  Le mode custom permet de choisir un type d'adversaire, tier,
  proficiency, et de piocher des features dans le catalogue.
-->
<template>
  <fieldset class="npc-combat">
    <legend>Combat</legend>

    <!-- ── Mode selector ── -->
    <div class="combat-mode">
      <label
        v-for="mode in modes"
        :key="mode.value"
        class="combat-mode__option"
        :class="{ 'combat-mode__option--active': combatProfileMode === mode.value }"
      >
        <input
          type="radio"
          :value="mode.value"
          :checked="combatProfileMode === mode.value"
          name="combat-mode"
          class="sr-only"
          @change="$emit('update:combatProfileMode', mode.value)"
        />
        <span class="combat-mode__emoji">{{ mode.emoji }}</span>
        <span class="combat-mode__label">{{ mode.label }}</span>
      </label>
    </div>

    <!-- ════════════════════════════════════════════════ -->
    <!--  MODE LINKED                                    -->
    <!-- ════════════════════════════════════════════════ -->
    <template v-if="combatProfileMode === 'linked'">
      <div class="field">
        <label for="npc-adversary">Lier un adversaire</label>
        <select
          id="npc-adversary"
          :value="linkedAdversaryId || ''"
          @change="$emit('update:linkedAdversaryId', $event.target.value || null)"
        >
          <option value="">
            — Choisir —
          </option>
          <optgroup
            v-for="group in groupedAdversaries"
            :key="group.tier"
            :label="`Tier ${group.tier}`"
          >
            <option
              v-for="adv in group.items"
              :key="adv.id"
              :value="adv.id"
            >
              {{ adv.name }} — {{ adv.type }}{{ adv.source === 'custom' ? ' 🛠️' : '' }}
            </option>
          </optgroup>
        </select>
      </div>

      <!-- Aperçu stat block -->
      <div
        v-if="linkedAdversary"
        class="stat-preview"
      >
        <div class="stat-preview__header">
          <h5 class="stat-preview__name">
            {{ linkedAdversary.name }}
          </h5>
          <span class="stat-preview__tier">Tier {{ linkedAdversary.tier }} {{ linkedAdversary.type }}</span>
        </div>
        <p
          v-if="linkedAdversary.description"
          class="stat-preview__desc"
        >
          {{ truncate(linkedAdversary.description, 120) }}
        </p>
        <div class="stat-preview__stats">
          <span><strong>Diff:</strong> {{ linkedAdversary.difficulty }}</span>
          <span v-if="linkedAdversary.thresholds">
            <strong>Seuils:</strong>
            {{ linkedAdversary.thresholds.major || '—' }}/{{ linkedAdversary.thresholds.severe || '—' }}
          </span>
          <span><strong>PV:</strong> {{ linkedAdversary.hp }}</span>
          <span><strong>Stress:</strong> {{ linkedAdversary.stress }}</span>
        </div>
        <div
          v-if="linkedAdversary.attack"
          class="stat-preview__attack"
        >
          <strong>ATK:</strong>
          {{ linkedAdversary.attack.modifier >= 0 ? '+' : '' }}{{ linkedAdversary.attack.modifier }}
          | {{ linkedAdversary.attack.name }} : {{ linkedAdversary.attack.range }}
          | {{ linkedAdversary.attack.damage }}
        </div>
        <div
          v-if="linkedAdversary.features && linkedAdversary.features.length > 0"
          class="stat-preview__features"
        >
          <strong>Features ({{ linkedAdversary.features.length }}):</strong>
          <span
            v-for="f in linkedAdversary.features.slice(0, 4)"
            :key="f.name"
            class="feature-chip"
          >
            {{ f.name }}
          </span>
          <span v-if="linkedAdversary.features.length > 4">
            +{{ linkedAdversary.features.length - 4 }}
          </span>
        </div>
      </div>
    </template>

    <!-- ════════════════════════════════════════════════ -->
    <!--  MODE CUSTOM                                    -->
    <!-- ════════════════════════════════════════════════ -->
    <template v-if="combatProfileMode === 'custom'">
      <!-- Type + Tier + Proficiency -->
      <div class="custom-grid">
        <div class="field">
          <label for="npc-adv-type">Type d'adversaire</label>
          <select
            id="npc-adv-type"
            :value="adversaryType || ''"
            @change="$emit('update:adversaryType', $event.target.value || null)"
          >
            <option value="">
              — Choisir —
            </option>
            <option
              v-for="t in adversaryTypes"
              :key="t.value"
              :value="t.value"
            >
              {{ t.emoji }} {{ t.label }} ({{ t.labelEn }})
            </option>
          </select>
        </div>

        <div class="field">
          <label for="npc-tier">Tier</label>
          <select
            id="npc-tier"
            :value="tier || ''"
            @change="onTierChange($event.target.value)"
          >
            <option value="">
              —
            </option>
            <option
              v-for="t in 4"
              :key="t"
              :value="t"
            >
              Tier {{ t }}
            </option>
          </select>
        </div>

        <div class="field">
          <label for="npc-proficiency">Proficiency</label>
          <select
            id="npc-proficiency"
            :value="proficiency || ''"
            :disabled="!tier"
            @change="$emit('update:proficiency', Number($event.target.value) || null)"
          >
            <option value="">
              —
            </option>
            <option
              v-for="p in proficiencyRange"
              :key="p"
              :value="p"
            >
              {{ p }}
            </option>
          </select>
        </div>
      </div>

      <!-- Benchmarks du tier -->
      <div
        v-if="currentBenchmarks"
        class="tier-benchmarks"
        aria-label="Benchmarks du tier sélectionné"
      >
        <span><strong>ATK:</strong> +{{ currentBenchmarks.attackModifier }}</span>
        <span><strong>Diff:</strong> {{ currentBenchmarks.difficulty }}</span>
        <span><strong>Seuils:</strong> {{ currentBenchmarks.thresholds.major }}/{{ currentBenchmarks.thresholds.severe }}</span>
      </div>

      <!-- ── Features sélectionnées ── -->
      <div class="selected-features">
        <h5 class="section-title">
          Features ({{ combatFeatures.length }})
        </h5>

        <div
          v-if="combatFeatures.length === 0"
          class="empty-hint"
        >
          Aucune feature sélectionnée. Ajoutez-en depuis le catalogue ci-dessous.
        </div>

        <div
          v-for="fId in combatFeatures"
          :key="fId"
          class="selected-feature"
        >
          <div
            v-if="getFeature(fId)"
            class="selected-feature__info"
          >
            <span
              class="selected-feature__type-badge"
              :data-type="getFeature(fId).activationType"
            >
              {{ activationEmoji(getFeature(fId).activationType) }}
            </span>
            <span class="selected-feature__name">{{ getFeature(fId).name }}</span>
            <span
              v-for="tag in getFeature(fId).tags"
              :key="tag"
              class="tag-chip"
            >
              {{ tagEmoji(tag) }}
            </span>
            <span
              v-if="getFeature(fId).allyCooldown && getFeature(fId).allyCooldown !== 'none'"
              class="cooldown-badge"
              :title="cooldownLabel(getFeature(fId).allyCooldown)"
            >
              ⏳
            </span>
          </div>
          <span
            v-else
            class="selected-feature__unknown"
          >
            {{ fId }} (introuvable)
          </span>
          <button
            class="btn btn--icon btn--danger"
            :aria-label="`Retirer la feature ${fId}`"
            @click="removeFeature(fId)"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- ── Catalogue / Picker ── -->
      <details class="catalogue">
        <summary class="catalogue__toggle">
          📖 Catalogue de features
        </summary>

        <div class="catalogue__filters">
          <input
            v-model="searchText"
            type="text"
            placeholder="Rechercher…"
            class="catalogue__search"
            aria-label="Rechercher une feature"
          />
          <select
            v-model="filterSource"
            class="catalogue__filter"
            aria-label="Filtrer par source"
          >
            <option value="">
              Toutes sources
            </option>
            <option value="adversary">
              ⚔️ Adversaires
            </option>
            <option value="domain_card">
              🃏 Cartes de domaine
            </option>
            <option value="homebrew">
              🛠️ Homebrew
            </option>
          </select>
          <select
            v-model="filterActivation"
            class="catalogue__filter"
            aria-label="Filtrer par type"
          >
            <option value="">
              Tous types
            </option>
            <option value="passive">
              ♾️ Passives
            </option>
            <option value="action">
              ⚡ Actions
            </option>
            <option value="reaction">
              🔄 Réactions
            </option>
          </select>
          <select
            v-model="filterTheme"
            class="catalogue__filter"
            aria-label="Filtrer par thème"
          >
            <option value="">
              Tous thèmes
            </option>
            <option
              v-for="th in themes"
              :key="th.value"
              :value="th.value"
            >
              {{ th.emoji }} {{ th.label }}
            </option>
          </select>
          <select
            v-model="filterDomain"
            class="catalogue__filter"
            aria-label="Filtrer par domaine"
          >
            <option value="">
              Tous domaines
            </option>
            <option
              v-for="d in domainOptions"
              :key="d.value"
              :value="d.value"
            >
              {{ d.emoji }} {{ d.label }}{{ d.ofClass ? ' ★' : '' }}
            </option>
          </select>
        </div>

        <div class="catalogue__list">
          <div
            v-for="feat in availableFeatures"
            :key="feat.id"
            class="catalogue__item"
            :class="{ 'catalogue__item--selected': combatFeatures.includes(feat.id) }"
          >
            <div class="catalogue__item-header">
              <span
                class="catalogue__item-type"
                :data-type="feat.activationType"
              >
                {{ activationEmoji(feat.activationType) }}
              </span>
              <strong class="catalogue__item-name">{{ feat.name }}</strong>
              <span
                v-for="tag in feat.tags"
                :key="tag"
                class="tag-chip"
              >
                {{ tagEmoji(tag) }}
              </span>
              <span
                v-if="feat.cost && feat.cost.type !== 'free'"
                class="cost-badge"
              >
                {{ costLabel(feat.cost) }}
              </span>
            </div>
            <p class="catalogue__item-desc">
              {{ truncate(feat.description, 140) }}
            </p>
            <div class="catalogue__item-meta">
              <span class="catalogue__item-source">
                {{ feat.source === 'adversary' ? '⚔️' : feat.source === 'homebrew' ? '🛠️' : '🃏' }}
                {{ feat.sourceRef }}
              </span>
              <span
                v-if="feat.range"
                class="catalogue__item-range"
              >
                📏 {{ rangeLabel(feat.range) }}
              </span>
            </div>
            <div class="catalogue__item-actions">
              <button
                v-if="!combatFeatures.includes(feat.id)"
                class="btn btn--small btn--ghost"
                @click="addFeature(feat.id)"
              >
                + Ajouter
              </button>
              <button
                v-if="combatFeatures.includes(feat.id)"
                class="btn btn--small btn--danger"
                @click="removeFeature(feat.id)"
              >
                ✕ Retirer
              </button>
              <button
                v-if="feat.source === 'homebrew'"
                class="btn btn--small btn--ghost"
                aria-label="Modifier"
                @click="editHomebrew(feat.id)"
              >
                ✏️
              </button>
              <button
                v-if="feat.source === 'homebrew'"
                class="btn btn--small btn--danger"
                aria-label="Supprimer"
                @click="deleteHomebrew(feat.id)"
              >
                🗑️
              </button>
            </div>
          </div>

          <p
            v-if="availableFeatures.length === 0"
            class="empty-hint"
          >
            Aucune feature ne correspond aux filtres.
          </p>
        </div>
      </details>

      <!-- ── Homebrew feature form ── -->
      <div class="homebrew-section">
        <div class="homebrew-header">
          <button
            class="btn btn--small btn--ghost"
            @click="showHomebrewForm = !showHomebrewForm; if (!showHomebrewForm) resetHomebrewForm()"
          >
            {{ showHomebrewForm ? '✕ Annuler' : '🛠️ Créer une feature homebrew' }}
          </button>
          <span
            v-if="homebrewStore.count > 0"
            class="homebrew-count"
          >
            {{ homebrewStore.count }} homebrew
          </span>
        </div>

        <p
          v-if="homebrewFormMessage"
          class="homebrew-message"
          role="status"
        >
          {{ homebrewFormMessage }}
        </p>

        <div
          v-if="showHomebrewForm"
          class="homebrew-form"
        >
          <div class="field">
            <label for="hb-name">Nom *</label>
            <input
              id="hb-name"
              v-model="homebrewForm.name"
              type="text"
              placeholder="Nom de la feature"
            />
          </div>

          <div class="field">
            <label for="hb-desc">Description *</label>
            <textarea
              id="hb-desc"
              v-model="homebrewForm.description"
              rows="3"
              placeholder="Effet mécanique de la feature…"
            ></textarea>
          </div>

          <div class="custom-grid">
            <div class="field">
              <label for="hb-activation">Type</label>
              <select
                id="hb-activation"
                v-model="homebrewForm.activationType"
              >
                <option
                  v-for="at in activationTypes"
                  :key="at.value"
                  :value="at.value"
                >
                  {{ at.emoji }} {{ at.label }}
                </option>
              </select>
            </div>

            <div class="field">
              <label for="hb-tier">Tier</label>
              <select
                id="hb-tier"
                v-model.number="homebrewForm.tier"
              >
                <option
                  v-for="t in 4"
                  :key="t"
                  :value="t"
                >
                  Tier {{ t }}
                </option>
              </select>
            </div>

            <div class="field">
              <label for="hb-range">Portée</label>
              <select
                id="hb-range"
                v-model="homebrewForm.range"
              >
                <option
                  v-for="r in rangeOptions"
                  :key="r.value"
                  :value="r.value || null"
                >
                  {{ r.emoji || '' }} {{ r.label }}
                </option>
              </select>
            </div>
          </div>

          <div class="custom-grid">
            <div class="field">
              <label for="hb-cost-type">Coût</label>
              <select
                id="hb-cost-type"
                v-model="homebrewForm.cost.type"
              >
                <option
                  v-for="ct in costTypes"
                  :key="ct.value"
                  :value="ct.value"
                >
                  {{ ct.emoji }} {{ ct.label }}
                </option>
              </select>
            </div>

            <div class="field">
              <label for="hb-cost-amount">Montant</label>
              <input
                id="hb-cost-amount"
                v-model.number="homebrewForm.cost.amount"
                type="number"
                min="0"
                max="10"
              />
            </div>

            <div class="field">
              <label for="hb-cooldown">Cooldown allié</label>
              <select
                id="hb-cooldown"
                v-model="homebrewForm.allyCooldown"
              >
                <option
                  v-for="cd in cooldownOptions"
                  :key="cd.value"
                  :value="cd.value"
                >
                  {{ cd.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- Tags -->
          <div
            class="field"
            role="group"
            aria-label="Tags"
          >
            <span class="field__label">Tags</span>
            <div class="chip-selector">
              <button
                v-for="t in tagOptions"
                :key="t.value"
                type="button"
                class="chip-btn"
                :class="{ 'chip-btn--active': homebrewForm.tags.includes(t.value) }"
                @click="toggleTag(t.value)"
              >
                {{ t.emoji }} {{ t.label }}
              </button>
            </div>
          </div>

          <!-- Thèmes -->
          <div
            class="field"
            role="group"
            aria-label="Thèmes"
          >
            <span class="field__label">Thèmes</span>
            <div class="chip-selector">
              <button
                v-for="th in themes"
                :key="th.value"
                type="button"
                class="chip-btn"
                :class="{ 'chip-btn--active': homebrewForm.themes.includes(th.value) }"
                @click="toggleTheme(th.value)"
              >
                {{ th.emoji }} {{ th.label }}
              </button>
            </div>
          </div>

          <!-- Trigger (si réaction) -->
          <div
            v-if="homebrewForm.activationType === 'reaction'"
            class="field"
          >
            <label for="hb-trigger">Trigger</label>
            <input
              id="hb-trigger"
              v-model="homebrewForm.trigger"
              type="text"
              placeholder="Quand cet adversaire…"
            />
          </div>

          <!-- Dégâts (optionnel) -->
          <div class="custom-grid">
            <div class="field">
              <label for="hb-damage">Formule de dégâts</label>
              <input
                id="hb-damage"
                v-model="homebrewForm.damageFormula"
                type="text"
                placeholder="Ex: 2d6+3"
              />
            </div>
            <div class="field">
              <label for="hb-damage-type">Type de dégâts</label>
              <select
                id="hb-damage-type"
                v-model="homebrewForm.damageType"
              >
                <option :value="null">
                  —
                </option>
                <option value="physical">
                  Physiques
                </option>
                <option value="magic">
                  Magiques
                </option>
              </select>
            </div>
          </div>

          <div class="homebrew-form__actions">
            <button
              class="btn btn--small btn--primary"
              @click="saveHomebrew"
            >
              {{ homebrewEditId ? '✏️ Modifier' : '✨ Créer' }}
            </button>
            <button
              class="btn btn--small btn--ghost"
              @click="resetHomebrewForm(); showHomebrewForm = false"
            >
              Annuler
            </button>
          </div>
        </div>
      </div>
    </template>
  </fieldset>
</template>

<script>
import { ref, computed } from 'vue'
import {
  ALL_ADVERSARY_TYPES,
  ADVERSARY_TYPE_META,
  PROFICIENCY_BY_TIER,
  TIER_BENCHMARKS,
  ALL_THEMES,
  THEME_META,
  COOLDOWN_META,
  COMBAT_PROFILE_META,
  ALL_COMBAT_PROFILES,
  ALL_COOLDOWNS
} from '../combatConstants.js'
import {
  ALL_COMBAT_FEATURES
} from '../combatFeatureCatalogue.js'
import { useHomebrewCombatFeatureStore } from '../stores/homebrewCombatFeatureStore.js'
import { ALL_TAGS, TAG_META } from '@data/constants/tags.js'
import {
  RANGE_META, RANGE_VALUES,
  COST_META, COST_TYPES,
  ACTIVATION_META, ACTIVATION_TYPES
} from '@data/constants/featureSchema.js'
import { DOMAINS } from '@data/domains'
import { CLASSES } from '@data/classes'

export default {
  name: 'NpcCombatPanel',

  props: {
    combatProfileMode: { type: String, default: 'none' },
    linkedAdversaryId: { type: String, default: null },
    adversaryType: { type: String, default: null },
    tier: { type: Number, default: null },
    proficiency: { type: Number, default: null },
    combatFeatures: { type: Array, default: () => [] },
    /** Liste complète des adversaires (SRD + homebrew) */
    allAdversaries: { type: Array, default: () => [] },
    /** Classe sélectionnée dans le build (pour filtrer les domaines) */
    classId: { type: String, default: null }
  },

  emits: [
    'update:combatProfileMode',
    'update:linkedAdversaryId',
    'update:adversaryType',
    'update:tier',
    'update:proficiency',
    'update:combatFeatures'
  ],

  setup(props, { emit }) {
    // ── Store homebrew ──
    const homebrewStore = useHomebrewCombatFeatureStore()

    // ── État local filtres catalogue ──
    const searchText = ref('')
    const filterSource = ref('')
    const filterActivation = ref('')
    const filterTheme = ref('')
    const filterDomain = ref('')

    // ── Domaines disponibles pour le filtre ──
    const domainOptions = computed(() => {
      const selectedCls = props.classId
        ? CLASSES.find(c => c.id === props.classId) : null
      const classDomainNames = selectedCls ? (selectedCls.domains || []) : []

      return DOMAINS.map(d => ({
        value: d.id,
        label: d.name,
        emoji: d.emoji || '🃏',
        ofClass: classDomainNames.includes(d.name)
      }))
    })

    // ── Formulaire homebrew ──
    const showHomebrewForm = ref(false)
    const homebrewForm = ref(createDefaultForm())
    const homebrewFormMessage = ref('')
    const homebrewEditId = ref(null)

    function createDefaultForm() {
      return {
        name: '',
        description: '',
        activationType: 'action',
        tier: 1,
        tags: ['offensif'],
        themes: ['humanoid'],
        cost: { type: 'free', amount: 0 },
        frequency: 'atWill',
        allyCooldown: 'none',
        range: null,
        trigger: '',
        damageFormula: '',
        damageType: null
      }
    }

    function resetHomebrewForm() {
      homebrewForm.value = createDefaultForm()
      homebrewEditId.value = null
      homebrewFormMessage.value = ''
    }

    function saveHomebrew() {
      const data = {
        ...homebrewForm.value,
        trigger: homebrewForm.value.trigger || null,
        damageFormula: homebrewForm.value.damageFormula || null,
        range: homebrewForm.value.range || null
      }

      let result
      if (homebrewEditId.value) {
        result = homebrewStore.update(homebrewEditId.value, data)
      } else {
        result = homebrewStore.create(data)
      }

      if (result.success) {
        homebrewFormMessage.value = homebrewEditId.value ? 'Modifié ✓' : 'Créé ✓'
        resetHomebrewForm()
        showHomebrewForm.value = false
        setTimeout(() => { homebrewFormMessage.value = '' }, 2000)
      } else {
        homebrewFormMessage.value = result.errors ? result.errors.join(', ') : result.error
      }
    }

    function editHomebrew(id) {
      const feat = homebrewStore.getById(id)
      if (!feat) return
      homebrewForm.value = {
        name: feat.name,
        description: feat.description,
        activationType: feat.activationType,
        tier: feat.tier,
        tags: [...feat.tags],
        themes: [...feat.themes],
        cost: { ...feat.cost },
        frequency: feat.frequency || 'atWill',
        allyCooldown: feat.allyCooldown || 'none',
        range: feat.range,
        trigger: feat.trigger || '',
        damageFormula: feat.damageFormula || '',
        damageType: feat.damageType
      }
      homebrewEditId.value = id
      showHomebrewForm.value = true
    }

    function deleteHomebrew(id) {
      homebrewStore.remove(id)
      // Retirer de la sélection du PNJ si présent
      if (props.combatFeatures.includes(id)) {
        emit('update:combatFeatures', props.combatFeatures.filter(f => f !== id))
      }
    }

    // ── Modes de combat ──
    const modes = ALL_COMBAT_PROFILES.map(m => ({
      value: m,
      label: COMBAT_PROFILE_META[m].label,
      emoji: COMBAT_PROFILE_META[m].emoji
    }))

    // ── Types d'adversaire ──
    const adversaryTypes = ALL_ADVERSARY_TYPES.map(t => ({
      value: t,
      label: ADVERSARY_TYPE_META[t].label,
      labelEn: ADVERSARY_TYPE_META[t].labelEn,
      emoji: ADVERSARY_TYPE_META[t].emoji
    }))

    // ── Thèmes ──
    const themes = ALL_THEMES.map(t => ({
      value: t,
      label: THEME_META[t].label,
      emoji: THEME_META[t].emoji
    }))

    // ── Listes pour le formulaire ──
    const activationTypes = ACTIVATION_TYPES.map(t => ({
      value: t, label: ACTIVATION_META[t].label, emoji: ACTIVATION_META[t].emoji
    }))
    const costTypes = COST_TYPES.map(t => ({
      value: t, label: COST_META[t].label, emoji: COST_META[t].emoji
    }))
    const rangeOptions = [
      { value: '', label: '— Aucune —' },
      ...RANGE_VALUES.map(r => ({ value: r, label: RANGE_META[r].label, emoji: RANGE_META[r].emoji }))
    ]
    const cooldownOptions = ALL_COOLDOWNS.map(c => ({
      value: c, label: COOLDOWN_META[c].label
    }))
    const tagOptions = ALL_TAGS.map(t => ({
      value: t, label: TAG_META[t].label, emoji: TAG_META[t].emoji
    }))

    // ── Proficiency range basé sur le tier ──
    const proficiencyRange = computed(() => {
      if (!props.tier) return []
      const range = PROFICIENCY_BY_TIER[props.tier]
      if (!range) return []
      const result = []
      for (let i = range.min; i <= range.max; i++) result.push(i)
      return result
    })

    // ── Benchmarks du tier sélectionné ──
    const currentBenchmarks = computed(() => {
      if (!props.tier) return null
      return TIER_BENCHMARKS[props.tier] || null
    })

    // ── Mode linked : adversaires groupés par tier ──
    const groupedAdversaries = computed(() => {
      const groups = {}
      for (const adv of props.allAdversaries) {
        const tier = adv.tier || 1
        if (!groups[tier]) groups[tier] = { tier, items: [] }
        groups[tier].items.push(adv)
      }
      for (const group of Object.values(groups)) {
        group.items.sort((a, b) => a.name.localeCompare(b.name))
      }
      return Object.values(groups).sort((a, b) => a.tier - b.tier)
    })

    const linkedAdversary = computed(() => {
      if (!props.linkedAdversaryId) return null
      return props.allAdversaries.find(a => a.id === props.linkedAdversaryId) || null
    })

    // ── Catalogue mergé (SRD + homebrew) avec filtrage ──
    const allMergedFeatures = computed(() => {
      return [...ALL_COMBAT_FEATURES, ...homebrewStore.features]
    })

    const availableFeatures = computed(() => {
      let result = allMergedFeatures.value

      if (filterSource.value) {
        result = result.filter(f => f.source === filterSource.value)
      }
      if (filterActivation.value) {
        result = result.filter(f => f.activationType === filterActivation.value)
      }
      if (filterTheme.value) {
        result = result.filter(f => f.themes.some(t => t === filterTheme.value))
      }
      if (props.tier) {
        result = result.filter(f => f.tier <= props.tier)
      }
      if (searchText.value.trim()) {
        const q = searchText.value.trim().toLowerCase()
        result = result.filter(f =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
        )
      }

      if (filterDomain.value) {
        result = result.filter(f => {
          if (f.source !== 'domain_card') return false
          return f.sourceRef && f.sourceRef.startsWith(filterDomain.value + '-')
        })
      }

      return result
    })

    // ── Index de lookup combiné ──
    const featureIndex = computed(() => {
      const map = new Map()
      for (const f of allMergedFeatures.value) map.set(f.id, f)
      return map
    })

    // ── Helpers ──
    function getFeature(id) {
      return featureIndex.value.get(id) || null
    }

    function addFeature(id) {
      if (!props.combatFeatures.includes(id)) {
        emit('update:combatFeatures', [...props.combatFeatures, id])
      }
    }

    function removeFeature(id) {
      emit('update:combatFeatures', props.combatFeatures.filter(f => f !== id))
    }

    function onTierChange(value) {
      const tier = Number(value) || null
      emit('update:tier', tier)
      if (tier && PROFICIENCY_BY_TIER[tier]) {
        emit('update:proficiency', PROFICIENCY_BY_TIER[tier].default)
      } else {
        emit('update:proficiency', null)
      }
    }

    function truncate(text, max) {
      if (!text || text.length <= max) return text
      return text.slice(0, max).trimEnd() + '…'
    }

    function activationEmoji(type) {
      return ACTIVATION_META[type]?.emoji || '?'
    }

    function tagEmoji(tag) {
      return TAG_META[tag]?.emoji || tag
    }

    function costLabel(cost) {
      if (!cost || cost.type === 'free') return ''
      const meta = COST_META[cost.type]
      return `${cost.amount} ${meta?.emoji || cost.type}`
    }

    function rangeLabel(range) {
      return RANGE_META[range]?.label || range
    }

    function cooldownLabel(cd) {
      return COOLDOWN_META[cd]?.label || cd
    }

    function toggleTag(tag) {
      const tags = homebrewForm.value.tags
      const idx = tags.indexOf(tag)
      if (idx >= 0) {
        if (tags.length > 1) tags.splice(idx, 1)
      } else {
        tags.push(tag)
      }
    }

    function toggleTheme(theme) {
      const th = homebrewForm.value.themes
      const idx = th.indexOf(theme)
      if (idx >= 0) {
        if (th.length > 1) th.splice(idx, 1)
      } else {
        th.push(theme)
      }
    }

    return {
      // Données
      modes,
      adversaryTypes,
      themes,
      proficiencyRange,
      currentBenchmarks,
      groupedAdversaries,
      linkedAdversary,
      availableFeatures,
      // Filtres catalogue
      searchText,
      filterSource,
      filterActivation,
      filterTheme,
      filterDomain,
      domainOptions,
      // Homebrew
      homebrewStore,
      showHomebrewForm,
      homebrewForm,
      homebrewFormMessage,
      homebrewEditId,
      activationTypes,
      costTypes,
      rangeOptions,
      cooldownOptions,
      tagOptions,
      saveHomebrew,
      resetHomebrewForm,
      editHomebrew,
      deleteHomebrew,
      toggleTag,
      toggleTheme,
      // Méthodes
      getFeature,
      addFeature,
      removeFeature,
      onTierChange,
      truncate,
      activationEmoji,
      tagEmoji,
      costLabel,
      rangeLabel,
      cooldownLabel
    }
  }
}
</script>

<style scoped>
.npc-combat {
  border: 1px solid var(--color-border, #374151);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.npc-combat legend {
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text, #f9fafb);
  padding: 0 0.5rem;
}

/* ── Mode selector ── */
.combat-mode {
  display: flex;
  gap: 0.35rem;
  margin-bottom: 0.75rem;
}

.combat-mode__option {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--color-text-muted, #9ca3af);
  background: transparent;
  transition: all 0.15s;
}

.combat-mode__option:hover {
  border-color: var(--color-primary, #60a5fa);
  color: var(--color-text, #f9fafb);
}

.combat-mode__option--active {
  border-color: var(--color-primary, #2563eb);
  background: rgba(37, 99, 235, 0.15);
  color: var(--color-text, #f9fafb);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* ── Custom grid ── */
.custom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

@media (max-width: 500px) {
  .custom-grid {
    grid-template-columns: 1fr;
  }
}

/* ── Fields ── */
.field {
  margin-bottom: 0.5rem;
}

.field label,
.field__label {
  display: block;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-text-muted, #9ca3af);
  margin-bottom: 0.2rem;
}

.field select,
.field input {
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.85rem;
  font-family: inherit;
}

/* ── Tier benchmarks ── */
.tier-benchmarks {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
  padding: 0.35rem 0.5rem;
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.02));
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

/* ── Stat preview (linked) ── */
.stat-preview {
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  padding: 0.6rem 0.8rem;
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.02));
  margin-top: 0.5rem;
}

.stat-preview__header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 0.25rem;
}

.stat-preview__name {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text, #f9fafb);
}

.stat-preview__tier {
  font-size: 0.7rem;
  color: var(--color-text-muted, #9ca3af);
  font-style: italic;
}

.stat-preview__desc {
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
  font-style: italic;
  margin: 0 0 0.35rem;
}

.stat-preview__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  font-size: 0.8rem;
  color: var(--color-text, #f9fafb);
  margin-bottom: 0.3rem;
}

.stat-preview__attack {
  font-size: 0.8rem;
  color: var(--color-text, #f9fafb);
  margin-bottom: 0.3rem;
}

.stat-preview__features {
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
}

/* ── Section title ── */
.section-title {
  margin: 0.5rem 0 0.3rem;
  font-size: 0.85rem;
  color: var(--color-text, #f9fafb);
}

.empty-hint {
  font-size: 0.8rem;
  color: var(--color-text-muted, #6b7280);
  margin: 0.3rem 0;
}

/* ── Selected features ── */
.selected-features {
  margin-bottom: 0.5rem;
}

.selected-feature {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.3rem 0.5rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 5px;
  margin-bottom: 0.25rem;
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.02));
}

.selected-feature__info {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}

.selected-feature__name {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--color-text, #f9fafb);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selected-feature__type-badge {
  font-size: 0.7rem;
  flex-shrink: 0;
}

.selected-feature__unknown {
  font-size: 0.75rem;
  color: var(--color-text-muted, #6b7280);
  font-style: italic;
}

/* ── Chips & badges ── */
.feature-chip {
  display: inline-block;
  margin-left: 0.3rem;
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
  background: var(--color-tag-bg, #374151);
  font-size: 0.7rem;
}

.tag-chip {
  font-size: 0.65rem;
  flex-shrink: 0;
}

.cooldown-badge {
  font-size: 0.65rem;
  flex-shrink: 0;
  cursor: help;
}

.cost-badge {
  font-size: 0.7rem;
  color: var(--color-text-muted, #9ca3af);
  flex-shrink: 0;
}

/* ── Catalogue ── */
.catalogue {
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  margin-top: 0.5rem;
}

.catalogue__toggle {
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--color-text, #f9fafb);
  cursor: pointer;
}

.catalogue__toggle:hover {
  color: var(--color-primary, #60a5fa);
}

.catalogue__filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding: 0 0.75rem 0.5rem;
}

.catalogue__search {
  flex: 1;
  min-width: 120px;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 4px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.8rem;
  font-family: inherit;
}

.catalogue__filter {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 4px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.8rem;
  font-family: inherit;
}

.catalogue__list {
  max-height: 400px;
  overflow-y: auto;
  padding: 0 0.75rem 0.75rem;
}

.catalogue__item {
  border: 1px solid var(--color-border, #374151);
  border-radius: 5px;
  padding: 0.5rem 0.6rem;
  margin-bottom: 0.35rem;
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.02));
}

.catalogue__item--selected {
  border-color: var(--color-primary, #2563eb);
  background: rgba(37, 99, 235, 0.08);
}

.catalogue__item-header {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  margin-bottom: 0.2rem;
}

.catalogue__item-type {
  font-size: 0.7rem;
}

.catalogue__item-name {
  font-size: 0.85rem;
  color: var(--color-text, #f9fafb);
}

.catalogue__item-desc {
  font-size: 0.75rem;
  color: var(--color-text-muted, #9ca3af);
  margin: 0 0 0.25rem;
  line-height: 1.35;
}

.catalogue__item-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.7rem;
  color: var(--color-text-muted, #6b7280);
  margin-bottom: 0.3rem;
}

/* ── Boutons ── */
.btn {
  border: none;
  cursor: pointer;
  border-radius: 6px;
  font-family: inherit;
  font-weight: 500;
}

.btn--small {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.btn--ghost {
  background: transparent;
  border: 1px dashed var(--color-border, #374151);
  color: var(--color-text-muted, #9ca3af);
}

.btn--ghost:hover {
  border-color: var(--color-primary, #60a5fa);
  color: var(--color-text, #f9fafb);
}

.btn--danger {
  background: #7f1d1d;
  color: #fca5a5;
}

.btn--icon {
  padding: 0.2rem 0.35rem;
  font-size: 0.7rem;
  line-height: 1;
}

/* ── Homebrew section ── */
.homebrew-section {
  margin-top: 0.75rem;
}

.homebrew-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.homebrew-count {
  font-size: 0.7rem;
  color: var(--color-text-muted, #9ca3af);
}

.homebrew-message {
  font-size: 0.8rem;
  color: #059669;
  margin: 0.3rem 0;
}

.homebrew-form {
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  padding: 0.75rem;
  margin-top: 0.5rem;
  background: var(--color-surface-alt, rgba(255, 255, 255, 0.02));
}

.homebrew-form textarea {
  width: 100%;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 6px;
  background: var(--color-surface, #1f2937);
  color: var(--color-text, #f9fafb);
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
}

.homebrew-form__actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.btn--primary {
  background: var(--color-primary, #2563eb);
  color: #fff;
}

/* ── Chip selector ── */
.chip-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.chip-btn {
  padding: 0.2rem 0.5rem;
  border: 1px solid var(--color-border, #374151);
  border-radius: 4px;
  background: transparent;
  color: var(--color-text-muted, #9ca3af);
  font-size: 0.75rem;
  cursor: pointer;
  font-family: inherit;
}

.chip-btn--active {
  border-color: var(--color-primary, #2563eb);
  background: rgba(37, 99, 235, 0.15);
  color: var(--color-text, #f9fafb);
}

/* ── Catalogue item actions ── */
.catalogue__item-actions {
  display: flex;
  gap: 0.25rem;
}
</style>
