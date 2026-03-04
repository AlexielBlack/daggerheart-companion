<template>
  <div
    v-if="char"
    class="char-sheet"
    :aria-label="`Fiche de ${char.name || 'Nouveau personnage'}`"
  >
    <!-- ═══ Choix du personnage (déroulants) ═══ -->
    <section class="sheet-section sheet-section--choices">
      <div class="section-header section-header--choices">
        <h3 class="section-heading">
          📋 Choix du personnage
        </h3>
        <button
          v-if="char.selectionsLocked"
          class="choices-toggle-btn choices-toggle-btn--edit"
          aria-label="Modifier les choix du personnage"
          @click="emit('update', 'selectionsLocked', false)"
        >
          ✏️ Modifier
        </button>
      </div>

      <!-- Mode verrouillé : résumé compact -->
      <div
        v-if="char.selectionsLocked"
        class="choices-summary"
      >
        <div
          v-if="subclassData"
          class="choices-summary__item"
        >
          <span class="choices-summary__label">Sous-classe</span>
          <span class="choices-summary__value">{{ subclassData.name }}</span>
        </div>
        <div
          v-if="ancestryData"
          class="choices-summary__item"
        >
          <span class="choices-summary__label">Ascendance</span>
          <span class="choices-summary__value">{{ ancestryData.emoji || '' }} {{ ancestryData.name }}</span>
        </div>
        <div
          v-if="communityData"
          class="choices-summary__item"
        >
          <span class="choices-summary__label">Communauté</span>
          <span class="choices-summary__value">{{ communityData.emoji || '' }} {{ communityData.name }}</span>
        </div>
        <div
          v-if="char.armorId"
          class="choices-summary__item"
        >
          <span class="choices-summary__label">Armure</span>
          <span class="choices-summary__value">{{ resolveArmorName(char.armorId) }}</span>
        </div>
        <div
          v-if="char.primaryWeaponId"
          class="choices-summary__item"
        >
          <span class="choices-summary__label">Arme 1re</span>
          <span class="choices-summary__value">{{ resolvePrimaryName(char.primaryWeaponId) }}</span>
        </div>
        <div
          v-if="char.secondaryWeaponId"
          class="choices-summary__item"
        >
          <span class="choices-summary__label">Arme 2de</span>
          <span class="choices-summary__value">{{ resolveSecondaryName(char.secondaryWeaponId) }}</span>
        </div>
        <p
          v-if="!subclassData && !ancestryData && !communityData && !char.armorId && !char.primaryWeaponId"
          class="choices-summary__empty"
        >
          Aucun choix effectué. Cliquez sur « Modifier » pour commencer.
        </p>
      </div>

      <!-- Mode déverrouillé : sélecteurs complets -->
      <template v-else>
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
        <div class="choices-actions">
          <button
            class="choices-toggle-btn choices-toggle-btn--validate"
            aria-label="Valider les choix du personnage"
            @click="emit('update', 'selectionsLocked', true)"
          >
            ✅ Valider les choix
          </button>
        </div>
      </template>
    </section>

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
          <span
            class="combat-stat__value"
            aria-label="Proficiency"
          >{{ char.proficiency }}</span>
        </div>
      </div>

      <!-- Armure -->
      <div class="armor-row">
        <label
          class="weapon-label"
          for="sheet-armor"
        >Armure</label>
        <select
          id="sheet-armor"
          class="weapon-select"
          :value="char.armorId"
          aria-label="Choisir une armure"
          @change="emit('applySelection', 'armorId', $event.target.value)"
        >
          <option value="">
            — Aucune armure —
          </option>
          <optgroup
            v-if="recommendedArmors.length"
            label="★ Recommandé"
          >
            <option
              v-for="a in recommendedArmors"
              :key="'rec-' + a.id"
              :value="a.id"
            >
              ★ {{ a.name }} — {{ a.thresholds.major }}/{{ a.thresholds.severe }} — Score {{ a.baseScore }}
            </option>
          </optgroup>
          <optgroup
            v-for="tier in armorTiers"
            :key="tier.label"
            :label="tier.label"
          >
            <option
              v-for="a in tier.items"
              :key="a.id"
              :value="a.id"
            >
              {{ a.name }} — {{ a.thresholds.major }}/{{ a.thresholds.severe }} — Score {{ a.baseScore }}{{ a.feature ? ` — ${a.feature}` : '' }}
            </option>
          </optgroup>
        </select>
        <div
          v-if="char.armorName"
          class="armor-details"
        >
          <span class="weapon-stat">Seuils {{ char.armorBaseThresholds.major }} / {{ char.armorBaseThresholds.severe }}</span>
          <span class="weapon-stat weapon-stat--dmg">Score {{ char.armorScore }}</span>
          <span
            v-if="effectiveArmorScore !== char.armorScore"
            class="bonus-indicator"
            aria-label="Score d'armure effectif"
          >
            → {{ effectiveArmorScore }}
          </span>
          <span
            v-if="char.evasionBonus !== 0"
            class="weapon-stat"
          >
            Évasion {{ char.evasionBonus > 0 ? '+' : '' }}{{ char.evasionBonus }}
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
          :max="effectiveArmorScore"
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

      <!-- Arme Principale -->
      <div class="weapon-block">
        <label
          class="weapon-label"
          for="sheet-primary-weapon"
        >Principale</label>
        <select
          id="sheet-primary-weapon"
          class="weapon-select"
          :value="char.primaryWeaponId"
          aria-label="Choisir une arme principale"
          @change="emit('applySelection', 'primaryWeaponId', $event.target.value)"
        >
          <option value="">
            — Choisir —
          </option>
          <optgroup
            v-if="recommendedPrimaryWeapons.length"
            label="★ Recommandé"
          >
            <option
              v-for="w in recommendedPrimaryWeapons"
              :key="'rec-' + w.id"
              :value="w.id"
            >
              ★ {{ w.name }} — {{ w.trait }} {{ w.range }} — {{ w.damage }}
            </option>
          </optgroup>
          <optgroup
            v-for="tier in primaryWeaponTiers"
            :key="tier.label"
            :label="tier.label"
          >
            <option
              v-for="w in tier.items"
              :key="w.id"
              :value="w.id"
            >
              {{ w.name }} — {{ w.trait }} {{ w.range }} — {{ w.damage }}
            </option>
          </optgroup>
        </select>
        <div
          v-if="char.primaryWeapon && char.primaryWeapon.name"
          class="weapon-details"
        >
          <span class="weapon-stat">{{ char.primaryWeapon.trait }}</span>
          <span class="weapon-stat">{{ char.primaryWeapon.range }}</span>
          <span class="weapon-stat weapon-stat--dmg">{{ char.primaryWeapon.damage }}</span>
          <span
            v-if="char.primaryWeapon.feature"
            class="weapon-stat weapon-stat--feature"
          >{{ char.primaryWeapon.feature }}</span>
        </div>
      </div>

      <!-- Arme Secondaire -->
      <div class="weapon-block">
        <label
          class="weapon-label"
          for="sheet-secondary-weapon"
        >Secondaire</label>
        <select
          id="sheet-secondary-weapon"
          class="weapon-select"
          :value="char.secondaryWeaponId"
          aria-label="Choisir une arme secondaire"
          @change="emit('applySelection', 'secondaryWeaponId', $event.target.value)"
        >
          <option value="">
            — Choisir —
          </option>
          <optgroup
            v-if="recommendedSecondaryWeapons.length"
            label="★ Recommandé"
          >
            <option
              v-for="w in recommendedSecondaryWeapons"
              :key="'rec-' + w.id"
              :value="w.id"
            >
              ★ {{ w.name }} — {{ w.trait }} {{ w.range }} — {{ w.damage }}
            </option>
          </optgroup>
          <optgroup
            v-for="tier in secondaryWeaponTiers"
            :key="tier.label"
            :label="tier.label"
          >
            <option
              v-for="w in tier.items"
              :key="w.id"
              :value="w.id"
            >
              {{ w.name }} — {{ w.trait }} {{ w.range }} — {{ w.damage }}
            </option>
          </optgroup>
        </select>
        <div
          v-if="char.secondaryWeapon && char.secondaryWeapon.name"
          class="weapon-details"
        >
          <span class="weapon-stat">{{ char.secondaryWeapon.trait }}</span>
          <span class="weapon-stat">{{ char.secondaryWeapon.range }}</span>
          <span class="weapon-stat weapon-stat--dmg">{{ char.secondaryWeapon.damage }}</span>
          <span
            v-if="char.secondaryWeapon.feature"
            class="weapon-stat weapon-stat--feature"
          >{{ char.secondaryWeapon.feature }}</span>
        </div>
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
import { getPrimaryWeaponById } from '@data/equipment/primaryWeapons.js'
import { getSecondaryWeaponById } from '@data/equipment/secondaryWeapons.js'
import { getArmorById } from '@data/equipment/armor.js'
import { getRecommendedIds } from '@data/equipment/classRecommendations.js'
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

    // ── Constantes tier ──
    const TIER_LABELS = {
      1: 'Tier 1 (Niveau 1)',
      2: 'Tier 2 (Niveaux 2–4)',
      3: 'Tier 3 (Niveaux 5–7)',
      4: 'Tier 4 (Niveaux 8+)'
    }

    function groupByTier(items) {
      const tiers = {}
      for (const item of items) {
        const t = item.tier || 1
        if (!tiers[t]) tiers[t] = []
        tiers[t].push(item)
      }
      return Object.keys(tiers)
        .sort((a, b) => Number(a) - Number(b))
        .map((t) => ({ label: TIER_LABELS[t] || `Tier ${t}`, items: tiers[t] }))
    }

    // ── Armes groupées par tier ──
    const primaryWeaponTiers = computed(() => groupByTier(props.primaryWeapons))
    const secondaryWeaponTiers = computed(() => groupByTier(props.secondaryWeapons))

    // ── Armures groupées par tier ──
    const armorTiers = computed(() => groupByTier(props.armor))

    // ── Recommandations armes par classe ──
    const recommendedPrimaryWeapons = computed(() =>
      getRecommendedIds(props.char?.classId || '', 'primaryWeapon')
        .map(getPrimaryWeaponById)
        .filter(Boolean)
    )
    const recommendedSecondaryWeapons = computed(() =>
      getRecommendedIds(props.char?.classId || '', 'secondaryWeapon')
        .map(getSecondaryWeaponById)
        .filter(Boolean)
    )

    // ── Recommandations armure par classe ──
    const recommendedArmors = computed(() =>
      getRecommendedIds(props.char?.classId || '', 'armor')
        .map(getArmorById)
        .filter(Boolean)
    )

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

    // ── Résolution noms pour le résumé verrouillé ──
    function resolveArmorName(id) {
      const a = getArmorById(id)
      return a ? a.name : id
    }
    function resolvePrimaryName(id) {
      const w = getPrimaryWeaponById(id)
      return w ? w.name : id
    }
    function resolveSecondaryName(id) {
      const w = getSecondaryWeaponById(id)
      return w ? w.name : id
    }

    return {
      conditions, acquiredCardIds, clampInt, toggleCondition, emit, getSubclassFeatureTier,
      resolveArmorName, resolvePrimaryName, resolveSecondaryName,
      primaryWeaponTiers, secondaryWeaponTiers, armorTiers,
      recommendedPrimaryWeapons, recommendedSecondaryWeapons, recommendedArmors
    }
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

/* ── Choix du personnage (verrouillage) ── */
.sheet-section--choices {
  border-color: var(--accent-hope, #53a8b6);
  border-width: 1px 1px 1px 3px;
}

.section-header--choices {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.section-header--choices .section-heading { margin: 0; }

.choices-toggle-btn {
  padding: 4px 12px;
  border-radius: 5px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid var(--border-color, #3a3a5a);
  transition: background 150ms, border-color 150ms, opacity 150ms;
}

.choices-toggle-btn--edit {
  background: transparent;
  color: var(--accent-hope, #53a8b6);
  border-color: var(--accent-hope, #53a8b6);
}

.choices-toggle-btn--edit:hover {
  background: rgba(83, 168, 182, 0.1);
}

.choices-toggle-btn--validate {
  background: var(--accent-hope, #53a8b6);
  color: #fff;
  border-color: var(--accent-hope, #53a8b6);
}

.choices-toggle-btn--validate:hover {
  opacity: 0.9;
}

.choices-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-sm);
}

.choices-summary {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: var(--space-xs) var(--space-sm);
}

.choices-summary__item {
  display: flex;
  flex-direction: column;
  gap: 1px;
  padding: 4px 8px;
  background: rgba(83, 168, 182, 0.06);
  border-radius: 4px;
  border-left: 2px solid var(--accent-hope, #53a8b6);
}

.choices-summary__label {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted, #6b7280);
}

.choices-summary__value {
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-primary, #e5e7eb);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.choices-summary__empty {
  grid-column: 1 / -1;
  font-size: 0.82rem;
  color: var(--text-muted, #6b7280);
  font-style: italic;
  margin: 0;
  padding: 4px 0;
}

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
  margin-top: var(--space-sm);
}

.armor-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
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
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--text-muted, #6b7280);
  margin-bottom: 2px;
}

.weapon-select {
  width: 100%;
  padding: 5px 8px;
  background: var(--bg-tertiary, #2a2a4a);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  box-sizing: border-box;
}

.weapon-select:focus {
  outline: 2px solid var(--accent-hope, #53a8b6);
  outline-offset: 1px;
}

.weapon-select option,
.weapon-select optgroup {
  background: var(--bg-secondary, #1f1f3a);
  color: var(--text-primary);
}

.weapon-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.weapon-stat {
  font-size: 0.75rem;
  padding: 2px 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color, #3a3a5a);
  border-radius: 3px;
  color: var(--text-secondary, #9ca3af);
}

.weapon-stat--dmg {
  color: var(--accent-fear, #c84b31);
  border-color: rgba(200, 75, 49, 0.3);
  background: rgba(200, 75, 49, 0.06);
  font-weight: 600;
}

.weapon-stat--feature {
  flex-basis: 100%;
  font-style: italic;
  color: var(--text-muted, #6b7280);
  background: transparent;
  border: none;
  padding: 0;
  font-size: 0.75rem;
  line-height: 1.35;
}

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

</style>
