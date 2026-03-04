<template>
  <div
    v-if="char"
    class="char-sheet"
    :aria-label="`Fiche de ${char.name || 'Nouveau personnage'}`"
  >
    <!-- ═══ Identité ═══ -->
    <section class="sheet-section">
      <div class="identity-grid">
        <div class="field">
          <label
            class="field-label"
            for="char-name"
          >Nom</label>
          <input
            id="char-name"
            type="text"
            class="field-input field-input--lg"
            :value="char.name"
            placeholder="Nom du personnage"
            @input="emit('update', 'name', $event.target.value)"
          />
        </div>
        <div class="field">
          <label
            class="field-label"
            for="char-pronouns"
          >Pronoms</label>
          <input
            id="char-pronouns"
            type="text"
            class="field-input"
            :value="char.pronouns"
            placeholder="il/elle/iel…"
            @input="emit('update', 'pronouns', $event.target.value)"
          />
        </div>
        <div class="field">
          <label
            class="field-label"
            for="char-heritage"
          >Héritage</label>
          <input
            id="char-heritage"
            type="text"
            class="field-input"
            :value="char.heritage"
            placeholder="Héritage"
            @input="emit('update', 'heritage', $event.target.value)"
          />
        </div>
        <div class="field">
          <span class="field-label">Classe</span>
          <span class="field-value field-value--class">
            {{ classData ? classData.emoji : '' }} {{ char.className }}
          </span>
        </div>
        <div class="field">
          <label
            class="field-label"
            for="char-level"
          >Niveau</label>
          <input
            id="char-level"
            type="number"
            class="field-input field-input--sm"
            :value="char.level"
            min="1"
            max="10"
            @input="emit('update', 'level', clampInt($event.target.value, 1, 10))"
          />
        </div>
        <div class="field field--level-actions">
          <span class="field-label">Level Up</span>
          <div class="level-actions">
            <button
              v-if="char.level < 10"
              class="level-btn level-btn--up"
              aria-label="Ouvrir le wizard de level up"
              @click="emit('levelUp')"
            >
              ⬆️ Level Up
            </button>
            <button
              v-if="char.levelHistory && char.levelHistory.length > 0"
              class="level-btn level-btn--rollback"
              aria-label="Annuler le dernier level up"
              @click="emit('rollback')"
            >
              ↩ Annuler
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Choix du personnage (déroulants) ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        📋 Choix du personnage
      </h3>
      <CharacterSelectors
        :char="char"
        :subclasses="subclasses"
        :subclass-data="subclassData"
        :ancestry-data="ancestryData"
        :community-data="communityData"
        :ancestries="ancestries"
        :communities="communities"
        :armor="armor"
        :primary-weapons="primaryWeapons"
        :secondary-weapons="secondaryWeapons"
        :class-id="char.classId || ''"
        @select="(field, value) => emit('applySelection', field, value)"
        @update-mixed="(field, value) => emit('updateMixed', field, value)"
      />
    </section>

    <!-- ═══ Ascendance (features) ═══ -->
    <section
      v-if="ancestryData"
      class="sheet-section"
    >
      <h3 class="section-heading">
        {{ ancestryData.emoji }} Ascendance : {{ ancestryData.name }}
      </h3>
      <div class="feature-list">
        <div class="feature-block">
          <span class="feature-name">{{ ancestryData.topFeature.name }}</span>
          <p class="feature-desc">
            {{ ancestryData.topFeature.description }}
          </p>
        </div>
        <div class="feature-block">
          <span class="feature-name">{{ ancestryData.bottomFeature.name }}</span>
          <p class="feature-desc">
            {{ ancestryData.bottomFeature.description }}
          </p>
        </div>
      </div>
    </section>

    <!-- ═══ Communauté (feature) ═══ -->
    <section
      v-if="communityData"
      class="sheet-section"
    >
      <h3 class="section-heading">
        {{ communityData.emoji }} Communauté : {{ communityData.name }}
      </h3>
      <div class="feature-list">
        <div class="feature-block">
          <span class="feature-name">{{ communityData.feature.name }}</span>
          <p class="feature-desc">
            {{ communityData.feature.description }}
          </p>
        </div>
        <div class="community-adjectives">
          <span class="adjective-label">Adjectifs :</span>
          {{ communityData.adjectives.join(', ') }}
        </div>
      </div>
    </section>

    <!-- ═══ Traits ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        Traits
      </h3>
      <TraitBlock
        :values="char.traits"
        @update="(traitId, val) => emit('update', `traits.${traitId}`, val)"
      />
    </section>

    <!-- ═══ Combat (Évasion, Armor, Seuils) ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        Combat
      </h3>
      <div class="combat-grid">
        <div class="combat-stat">
          <span class="combat-stat__label">Évasion</span>
          <span class="combat-stat__value">{{ effectiveEvasion }}</span>
          <span class="combat-stat__detail">
            base {{ char.evasion }}
            <span v-if="char.evasionBonus !== 0">
              {{ char.evasionBonus > 0 ? '+' : '' }}{{ char.evasionBonus }} armure
            </span>
            <span
              v-if="statBonuses.evasion > 0"
              class="bonus-indicator"
            >
              +{{ statBonuses.evasion }} trait
            </span>
          </span>
        </div>
        <div class="combat-stat">
          <span class="combat-stat__label">Seuil Majeur</span>
          <span class="combat-stat__value">{{ thresholds.major }}</span>
          <span class="combat-stat__detail">
            base + lvl {{ char.level }}
            <span
              v-if="statBonuses.thresholds.major > 0"
              class="bonus-indicator"
            >
              +{{ statBonuses.thresholds.major }}
            </span>
          </span>
        </div>
        <div class="combat-stat">
          <span class="combat-stat__label">Seuil Sévère</span>
          <span class="combat-stat__value">{{ thresholds.severe }}</span>
          <span class="combat-stat__detail">
            base + lvl {{ char.level }}
            <span
              v-if="statBonuses.thresholds.severe > 0"
              class="bonus-indicator"
            >
              +{{ statBonuses.thresholds.severe }}
            </span>
          </span>
        </div>
        <div class="combat-stat">
          <span class="combat-stat__label">Proficiency</span>
          <input
            type="number"
            class="field-input field-input--sm"
            :value="char.proficiency"
            min="1"
            max="8"
            aria-label="Proficiency"
            @input="emit('update', 'proficiency', clampInt($event.target.value, 1, 8))"
          />
        </div>
      </div>

      <!-- Armure -->
      <div class="armor-row">
        <input
          type="text"
          class="field-input"
          :value="char.armorName"
          placeholder="Nom de l'armure"
          aria-label="Nom de l'armure"
          @input="emit('update', 'armorName', $event.target.value)"
        />
        <div class="armor-thresholds">
          <label class="mini-label">
            Maj
            <input
              type="number"
              class="field-input field-input--xs"
              :value="char.armorBaseThresholds.major"
              min="0"
              aria-label="Seuil majeur de base armure"
              @input="emit('update', 'armorBaseThresholds.major', parseInt($event.target.value) || 0)"
            />
          </label>
          <label class="mini-label">
            Sév
            <input
              type="number"
              class="field-input field-input--xs"
              :value="char.armorBaseThresholds.severe"
              min="0"
              aria-label="Seuil sévère de base armure"
              @input="emit('update', 'armorBaseThresholds.severe', parseInt($event.target.value) || 0)"
            />
          </label>
          <label class="mini-label">
            Score
            <input
              type="number"
              class="field-input field-input--xs"
              :value="char.armorScore"
              min="0"
              max="12"
              aria-label="Score d'armure"
              @input="emit('update', 'armorScore', clampInt($event.target.value, 0, 12))"
            />
          </label>
          <span
            v-if="effectiveArmorScore !== char.armorScore"
            class="bonus-indicator"
            aria-label="Score d'armure effectif"
          >
            → {{ effectiveArmorScore }}
          </span>
        </div>
      </div>
    </section>

    <!-- ═══ Modificateurs de cartes actifs ═══ -->
    <section
      v-if="activeModifiers.length > 0 || permanentEffects.length > 0"
      class="sheet-section"
    >
      <ActiveModifiersPanel
        :modifiers="activeModifiers"
        :permanent-effects="permanentEffects"
        :bonuses="statBonuses"
        @toggle="(cardId) => emit('toggleEffect', cardId)"
      />
    </section>

    <!-- ═══ Santé (HP, Stress, Armor Slots, Hope) ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        Santé
      </h3>
      <div class="health-grid">
        <SlotTracker
          label="HP"
          variant="hp"
          :max="effectiveMaxHP || char.maxHP"
          :marked="char.currentHP"
          @mark="emit('markHP')"
          @clear="emit('clearHP')"
          @set="(v) => emit('update', 'currentHP', v)"
        />
        <SlotTracker
          label="Stress"
          variant="stress"
          :max="effectiveMaxStress || char.maxStress"
          :marked="char.currentStress"
          @mark="emit('markStress')"
          @clear="emit('clearStress')"
          @set="(v) => emit('update', 'currentStress', v)"
        />
        <SlotTracker
          label="Armure"
          variant="armor"
          :max="char.armorScore"
          :marked="char.armorSlotsMarked"
          @mark="emit('markArmor')"
          @clear="emit('clearArmor')"
          @set="(v) => emit('update', 'armorSlotsMarked', v)"
        />
        <!-- Hope -->
        <div class="hope-tracker">
          <span class="slot-tracker__label">Hope</span>
          <div class="hope-controls">
            <button
              class="hope-btn"
              :disabled="char.hope <= 0"
              aria-label="Retirer une Hope"
              @click="emit('setHope', char.hope - 1)"
            >
              −
            </button>
            <span class="hope-value">{{ char.hope }}</span>
            <button
              class="hope-btn"
              :disabled="char.hope >= 10"
              aria-label="Ajouter une Hope"
              @click="emit('setHope', char.hope + 1)"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <!-- Résumé des bonus de stats actifs -->
      <div
        v-if="statBonuses.sources.length > 0"
        class="stat-bonus-summary"
        role="note"
        aria-label="Bonus de stats actifs"
      >
        <span class="stat-bonus-summary__icon">✦</span>
        <span class="stat-bonus-summary__text">
          {{ statBonuses.sources.join(' · ') }}
        </span>
      </div>
    </section>

    <!-- ═══ Conditions ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        Conditions
      </h3>
      <div class="conditions-grid">
        <button
          v-for="cond in conditions"
          :key="cond.id"
          class="condition-chip"
          :class="{ 'condition-chip--active': char.conditions.includes(cond.id) }"
          :title="cond.description"
          :aria-pressed="char.conditions.includes(cond.id) ? 'true' : 'false'"
          @click="toggleCondition(cond.id)"
        >
          {{ cond.label }}
        </button>
      </div>
    </section>

    <!-- ═══ Expériences ═══ -->
    <section class="sheet-section">
      <div class="section-header">
        <h3 class="section-heading">
          Expériences
        </h3>
        <button
          class="add-btn"
          aria-label="Ajouter une expérience"
          @click="emit('addExperience')"
        >
          +
        </button>
      </div>
      <div class="exp-list">
        <div
          v-for="(exp, i) in char.experiences"
          :key="i"
          class="exp-row"
        >
          <input
            type="text"
            class="field-input"
            :value="exp.name"
            placeholder="Expérience"
            :aria-label="`Expérience ${i + 1} nom`"
            @input="emit('update', `experiences.${i}.name`, $event.target.value)"
          />
          <input
            type="number"
            class="field-input field-input--xs"
            :value="exp.bonus"
            :aria-label="`Expérience ${i + 1} bonus`"
            @input="emit('update', `experiences.${i}.bonus`, parseInt($event.target.value) || 0)"
          />
          <button
            class="remove-btn"
            :aria-label="`Supprimer expérience ${i + 1}`"
            @click="emit('removeExperience', i)"
          >
            ✕
          </button>
        </div>
      </div>
    </section>

    <!-- ═══ Armes ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        Armes
      </h3>
      <div
        v-for="(slot, key) in { primary: 'Principale', secondary: 'Secondaire' }"
        :key="key"
        class="weapon-block"
      >
        <span class="weapon-label">{{ slot }}</span>
        <div class="weapon-fields">
          <input
            type="text"
            class="field-input"
            :value="char[key + 'Weapon'].name"
            placeholder="Nom"
            :aria-label="`${slot} arme nom`"
            @input="emit('update', `${key}Weapon.name`, $event.target.value)"
          />
          <input
            type="text"
            class="field-input field-input--sm"
            :value="char[key + 'Weapon'].trait"
            placeholder="Trait"
            :aria-label="`${slot} arme trait`"
            @input="emit('update', `${key}Weapon.trait`, $event.target.value)"
          />
          <input
            type="text"
            class="field-input field-input--sm"
            :value="char[key + 'Weapon'].range"
            placeholder="Portée"
            :aria-label="`${slot} arme portée`"
            @input="emit('update', `${key}Weapon.range`, $event.target.value)"
          />
          <input
            type="text"
            class="field-input"
            :value="char[key + 'Weapon'].damage"
            placeholder="Dés & type"
            :aria-label="`${slot} arme dégâts`"
            @input="emit('update', `${key}Weapon.damage`, $event.target.value)"
          />
        </div>
        <p
          v-if="char[key + 'Weapon'].feature"
          class="weapon-feature-text"
        >
          {{ char[key + 'Weapon'].feature }}
        </p>
      </div>
    </section>

    <!-- ═══ Inventaire ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        🎒 Inventaire
      </h3>
      <InventoryPanel
        :inventory="char.inventory"
        :gold="char.gold || { handfuls: 0, bags: 0, chests: 0 }"
        :class-id="char.classId || ''"
        @add-item="(type) => emit('addInventoryItem', type)"
        @remove-item="(i) => emit('removeInventoryItem', i)"
        @update-item="(i, field, val) => emit('updateInventoryItem', i, field, val)"
        @update-gold="(tier, val) => emit('updateGold', tier, val)"
      />
    </section>

    <!-- ═══ Class Feature (read-only SRD) ═══ -->
    <section
      v-if="classData"
      class="sheet-section"
    >
      <h3 class="section-heading">
        {{ classData.emoji }} Capacité de classe
      </h3>
      <div class="class-features">
        <p class="hope-feature">
          <strong>Hope Feature:</strong> {{ classData.hopeFeature }}
        </p>
        <p
          v-for="(feat, i) in classData.classFeatures"
          :key="i"
          class="class-feature-text"
        >
          {{ feat }}
        </p>
      </div>
    </section>

    <!-- ═══ Cartes de domaine ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        🎴 Cartes de domaine
      </h3>
      <DomainCardPicker
        :domains="availableDomains"
        :catalog-cards="availableDomainCards"
        :loadout-cards="loadoutCards"
        :vault-cards="vaultCards"
        :loadout-full="isLoadoutFull"
        :character-level="char.level"
        :max-loadout="maxLoadout"
        :acquired-card-ids="acquiredCardIds"
        @add-to-loadout="(id) => emit('addCardToLoadout', id)"
        @add-to-vault="(id) => emit('addCardToVault', id)"
        @move-to-loadout="(id) => emit('moveCardToLoadout', id)"
        @move-to-vault="(id) => emit('moveCardToVault', id)"
        @remove-card="(id) => emit('removeCard', id)"
      />
    </section>

    <!-- ═══ Sous-classe Features ═══ -->
    <section
      v-if="subclassData"
      class="sheet-section"
    >
      <h3 class="section-heading">
        🎯 Sous-classe : {{ subclassData.name }}
      </h3>
      <div class="class-features">
        <p
          v-if="subclassData.spellcastTrait"
          class="spellcast-trait"
        >
          <strong>Spellcast Trait :</strong> {{ subclassData.spellcastTrait }}
        </p>
        <!-- Foundation (toujours affiché) -->
        <div class="subclass-tier-block">
          <span class="subclass-tier-label">Fondation (Niv. 1–4)</span>
          <p
            v-for="(feat, i) in subclassData.foundation"
            :key="'f'+i"
            class="class-feature-text"
          >
            {{ feat }}
          </p>
        </div>
        <!-- Spécialisation (si niveau 5+) -->
        <div
          v-if="char.level >= 5 && subclassData.specialization.length"
          class="subclass-tier-block"
        >
          <span class="subclass-tier-label">Spécialisation (Niv. 5–7)</span>
          <p
            v-for="(feat, i) in subclassData.specialization"
            :key="'s'+i"
            class="class-feature-text"
          >
            {{ feat }}
          </p>
        </div>
        <!-- Maîtrise (si niveau 8+) -->
        <div
          v-if="char.level >= 8 && subclassData.mastery.length"
          class="subclass-tier-block"
        >
          <span class="subclass-tier-label">Maîtrise (Niv. 8+)</span>
          <p
            v-for="(feat, i) in subclassData.mastery"
            :key="'m'+i"
            class="class-feature-text"
          >
            {{ feat }}
          </p>
        </div>
      </div>
    </section>

    <!-- ═══ Notes ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        Notes
      </h3>
      <textarea
        class="field-textarea"
        :value="char.notes"
        placeholder="Notes, rappels, inventaire…"
        rows="3"
        aria-label="Notes"
        @input="emit('update', 'notes', $event.target.value)"
      ></textarea>
    </section>
  </div>
</template>

<script>
import { computed } from 'vue'
import { CONDITIONS } from '@data/classes'
import SlotTracker from './SlotTracker.vue'
import TraitBlock from './TraitBlock.vue'
import CharacterSelectors from './CharacterSelectors.vue'
import DomainCardPicker from './DomainCardPicker.vue'
import ActiveModifiersPanel from './ActiveModifiersPanel.vue'
import InventoryPanel from './InventoryPanel.vue'

export default {
  name: 'CharacterSheet',
  components: { SlotTracker, TraitBlock, CharacterSelectors, DomainCardPicker, ActiveModifiersPanel, InventoryPanel },
  props: {
    char: { type: Object, default: null },
    classData: { type: Object, default: null },
    thresholds: { type: Object, default: () => ({ major: 0, severe: 0 }) },
    effectiveEvasion: { type: Number, default: 0 },
    effectiveMaxHP: { type: Number, default: 0 },
    effectiveMaxStress: { type: Number, default: 0 },
    statBonuses: { type: Object, default: () => ({ maxHP: 0, maxStress: 0, evasion: 0, thresholds: { major: 0, severe: 0 }, sources: [] }) },
    // Données de sélection
    subclasses: { type: Array, default: () => [] },
    subclassData: { type: Object, default: null },
    ancestryData: { type: Object, default: null },
    communityData: { type: Object, default: null },
    ancestries: { type: Array, default: () => [] },
    communities: { type: Array, default: () => [] },
    armor: { type: Array, default: () => [] },
    primaryWeapons: { type: Array, default: () => [] },
    secondaryWeapons: { type: Array, default: () => [] },
    // Cartes de domaine
    availableDomains: { type: Array, default: () => [] },
    availableDomainCards: { type: Array, default: () => [] },
    loadoutCards: { type: Array, default: () => [] },
    vaultCards: { type: Array, default: () => [] },
    isLoadoutFull: { type: Boolean, default: false },
    maxLoadout: { type: Number, default: 2 },
    // Modificateurs actifs
    activeModifiers: { type: Array, default: () => [] },
    permanentEffects: { type: Array, default: () => [] },
    effectiveArmorScore: { type: Number, default: 0 }
  },
  emits: [
    'update', 'markHP', 'clearHP', 'markStress', 'clearStress',
    'markArmor', 'clearArmor', 'setHope',
    'addExperience', 'removeExperience',
    'addCondition', 'removeCondition',
    'applySelection',
    'updateMixed',
    'addCardToLoadout', 'addCardToVault',
    'moveCardToLoadout', 'moveCardToVault', 'removeCard',
    'levelUp', 'rollback',
    'toggleEffect',
    'addInventoryItem', 'removeInventoryItem', 'updateInventoryItem',
    'updateGold'
  ],
  setup(props, { emit }) {
    const conditions = CONDITIONS

    /** IDs des cartes acquises (loadout + vault) */
    const acquiredCardIds = computed(() => {
      if (!props.char || !props.char.domainCards) return []
      return [...(props.char.domainCards.loadout || []), ...(props.char.domainCards.vault || [])]
    })

    function clampInt(val, min, max) {
      const num = parseInt(val) || min
      return Math.max(min, Math.min(max, num))
    }

    function toggleCondition(condId) {
      if (props.char.conditions.includes(condId)) {
        emit('removeCondition', condId)
      } else {
        emit('addCondition', condId)
      }
    }

    /**
     * Détermine le tier de features de sous-classe à afficher
     * selon le niveau du personnage.
     */
    function getSubclassFeatureTier(level) {
      if (level >= 8) return 'mastery'
      if (level >= 5) return 'specialization'
      return 'foundation'
    }

    return { conditions, acquiredCardIds, clampInt, toggleCondition, emit, getSubclassFeatureTier }
  }
}
</script>

<style scoped>
.char-sheet {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.sheet-section {
  padding: var(--space-md);
  background: var(--bg-secondary, #1f1f3a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 8px;
  overflow: hidden;
}

.section-heading {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.95rem;
  color: var(--text-primary);
  margin: 0 0 var(--space-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.section-header .section-heading { margin: 0; }

/* ── Fields ── */
.identity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

@media (max-width: 500px) { .identity-grid { grid-template-columns: 1fr; } }

.field { display: flex; flex-direction: column; gap: 2px; }

.field-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted, #6b7280);
}

.field-input {
  padding: 5px 8px;
  background: var(--bg-tertiary, #2a2a4a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.85rem;
}

.field-input:focus { outline: 2px solid var(--accent-hope, #53a8b6); outline-offset: 1px; }
.field-input::placeholder { color: var(--text-muted, #6b7280); }
.field-input--lg { font-size: 1rem; font-weight: 600; }
.field-input--sm { width: 60px; text-align: center; }
.field-input--xs { width: 44px; text-align: center; }

.field-input::-webkit-inner-spin-button,
.field-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.field-input[type="number"] { -moz-appearance: textfield; }

.field-value { font-size: 0.9rem; color: var(--text-primary); padding: 5px 0; }
.field-value--class { font-weight: 600; }

.field--level-actions { justify-content: flex-end; }

.level-actions {
  display: flex;
  gap: var(--space-xs, 0.25rem);
}

.level-btn {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity 150ms;
}

.level-btn:hover { opacity: 0.9; }

.level-btn--up {
  background: var(--accent-hope, #53a8b6);
  color: #fff;
}

.level-btn--rollback {
  background: transparent;
  border: 1px solid var(--border-color, #3a3a5a);
  color: var(--text-secondary, #a0a0b8);
  font-size: 0.7rem;
}

.level-btn--rollback:hover { border-color: var(--accent-fear, #c84b31); color: var(--accent-fear, #c84b31); }

.field-textarea {
  width: 100%;
  padding: 8px;
  background: var(--bg-tertiary, #2a2a4a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.85rem;
  resize: vertical;
  font-family: inherit;
}

.field-textarea:focus { outline: 2px solid var(--accent-hope, #53a8b6); outline-offset: 1px; }

/* ── Combat ── */
.combat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

@media (max-width: 500px) { .combat-grid { grid-template-columns: repeat(2, 1fr); } }

.combat-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm);
  background: var(--bg-tertiary, #2a2a4a);
  border-radius: 6px;
}

.combat-stat__label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted, #6b7280);
}

.combat-stat__value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
}

.combat-stat__detail {
  font-size: 0.65rem;
  color: var(--text-muted, #6b7280);
}

.bonus-indicator {
  color: var(--accent-hope, #53a8b6);
  font-weight: 600;
}

.stat-bonus-summary {
  display: flex;
  align-items: flex-start;
  gap: var(--space-xs);
  margin-top: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(83, 168, 182, 0.08);
  border-left: 2px solid var(--accent-hope, #53a8b6);
  border-radius: 0 4px 4px 0;
  font-size: 0.75rem;
  color: var(--text-secondary, #9ca3af);
  line-height: 1.4;
}

.stat-bonus-summary__icon {
  color: var(--accent-hope, #53a8b6);
  flex-shrink: 0;
}

.stat-bonus-summary__text {
  word-break: break-word;
}

.armor-row {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
  align-items: end;
}

.armor-row > .field-input { flex: 1; min-width: 120px; }

.armor-thresholds {
  display: flex;
  gap: var(--space-sm);
}

.mini-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--text-muted, #6b7280);
  text-transform: uppercase;
}

/* ── Health ── */
.health-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

@media (max-width: 500px) { .health-grid { grid-template-columns: 1fr; } }

.hope-tracker {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.hope-controls {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.hope-btn {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 50%;
  background: var(--bg-tertiary, #2a2a4a);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hope-btn:hover:not(:disabled) { border-color: #eab308; color: #eab308; }
.hope-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.hope-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #eab308;
  min-width: 24px;
  text-align: center;
}

.slot-tracker__label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
}

/* ── Conditions ── */
.conditions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.condition-chip {
  padding: 4px 10px;
  border-radius: 20px;
  border: 1px solid var(--border-color, #3a3a5a);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all var(--transition-fast, 150ms);
}

.condition-chip:hover { border-color: var(--text-secondary); }

.condition-chip--active {
  border-color: #f97316;
  color: #f97316;
  background: rgba(249, 115, 22, 0.1);
}

/* ── Experiences ── */
.exp-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.exp-row {
  display: flex;
  gap: var(--space-xs);
  align-items: center;
}

.exp-row > .field-input:first-child { flex: 1; }

.add-btn, .remove-btn {
  width: 24px;
  height: 24px;
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  background: var(--bg-tertiary, #2a2a4a);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover { border-color: #22c55e; color: #22c55e; }
.remove-btn:hover { border-color: var(--accent-fear, #c84b31); color: var(--accent-fear, #c84b31); }

/* ── Weapons ── */
.weapon-block {
  margin-bottom: var(--space-sm);
}

.weapon-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted, #6b7280);
}

.weapon-fields {
  display: flex;
  gap: var(--space-xs);
  flex-wrap: wrap;
  margin-top: 4px;
}

.weapon-fields > .field-input { flex: 1; min-width: 80px; }

/* ── Class Features ── */
.class-features {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.hope-feature {
  margin: 0 0 var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(234, 179, 8, 0.08);
  border-left: 3px solid #eab308;
  border-radius: 0 4px 4px 0;
}

.class-feature-text {
  margin: 0 0 var(--space-xs);
}

/* ── Feature blocks (ancestry, community, subclass) ── */
.feature-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.feature-block {
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-tertiary, #2a2a4a);
  border-radius: 4px;
}

.feature-name {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent-hope, #53a8b6);
  margin-bottom: 2px;
}

.feature-desc {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.45;
  margin: 0;
}

.community-adjectives {
  font-size: 0.8rem;
  color: var(--text-muted, #6b7280);
  font-style: italic;
}

.adjective-label {
  font-style: normal;
  font-weight: 600;
  color: var(--text-secondary);
}

.spellcast-trait {
  margin: 0 0 var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(139, 92, 246, 0.08);
  border-left: 3px solid #8b5cf6;
  border-radius: 0 4px 4px 0;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.subclass-tier-block {
  margin-bottom: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-tertiary, #2a2a4a);
  border-radius: 4px;
}

.subclass-tier-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #8b5cf6;
  margin-bottom: var(--space-xs);
}

.weapon-feature-text {
  font-size: 0.75rem;
  color: var(--text-muted, #6b7280);
  margin: 4px 0 0;
  line-height: 1.35;
  font-style: italic;
}
</style>
