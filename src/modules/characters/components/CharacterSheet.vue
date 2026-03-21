<template>
  <div
    v-if="char"
    class="char-sheet"
    :class="{ 'char-sheet--custom-cols': sheetColumns > 0 }"
    :style="sheetGridStyle"
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

    <!-- ═══ Origines (Ascendance + Communauté + Expériences) ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        Origines
      </h3>

      <!-- Ascendance — sélecteur -->
      <div class="selector-field">
        <label
          class="selector-label"
          for="sel-ancestry"
        >Ascendance</label>
        <select
          id="sel-ancestry"
          class="selector-select"
          :value="char.ancestryId"
          aria-label="Choisir une ascendance"
          @change="emit('applySelection', 'ancestryId', $event.target.value)"
        >
          <option value="">
            — Choisir —
          </option>
          <optgroup label="Officielles (SRD)">
            <option
              v-for="a in srdAncestries"
              :key="a.id"
              :value="a.id"
            >
              {{ a.emoji }} {{ a.name }}
            </option>
          </optgroup>
          <optgroup label="Personnalisées">
            <option
              v-for="a in customAncestries"
              :key="a.id"
              :value="a.id"
            >
              {{ a.emoji }} {{ a.name }}
            </option>
          </optgroup>
        </select>
        <p
          v-if="ancestryData && char.ancestryId !== 'mixed-ancestry'"
          class="selector-hint"
        >
          {{ ancestryData.description }}
        </p>
      </div>

      <!-- Mixed Ancestry -->
      <template v-if="char.ancestryId === 'mixed-ancestry'">
        <div class="mixed-intro-block">
          <p class="mixed-intro">
            🔀 Choisissez deux ascendances parentes, puis <strong>une feature par ascendance</strong> (top ou bottom, librement).
          </p>
        </div>
        <div class="selectors-row">
          <div class="selector-field">
            <label
              class="selector-label"
              for="sel-mixed-a1"
            >Ascendance parente 1</label>
            <select
              id="sel-mixed-a1"
              class="selector-select"
              :value="mixedConfig.ancestry1Id"
              aria-label="Première ascendance parente"
              @change="emit('updateMixed', 'ancestry1Id', $event.target.value)"
            >
              <option value="">
                — Choisir —
              </option>
              <option
                v-for="a in selectableAncestries"
                :key="a.id"
                :value="a.id"
                :disabled="a.id === mixedConfig.ancestry2Id"
              >
                {{ a.emoji }} {{ a.name }}
              </option>
            </select>
          </div>
          <div class="selector-field">
            <label
              class="selector-label"
              for="sel-mixed-a2"
            >Ascendance parente 2</label>
            <select
              id="sel-mixed-a2"
              class="selector-select"
              :value="mixedConfig.ancestry2Id"
              aria-label="Seconde ascendance parente"
              @change="emit('updateMixed', 'ancestry2Id', $event.target.value)"
            >
              <option value="">
                — Choisir —
              </option>
              <option
                v-for="a in selectableAncestries"
                :key="a.id"
                :value="a.id"
                :disabled="a.id === mixedConfig.ancestry1Id"
              >
                {{ a.emoji }} {{ a.name }}
              </option>
            </select>
          </div>
        </div>
        <fieldset
          v-if="mixedAncestry1"
          class="mixed-feature-fieldset"
          :aria-label="`Feature de ${mixedAncestry1.name}`"
        >
          <legend class="mixed-feature-legend">
            {{ mixedAncestry1.emoji }} Feature de {{ mixedAncestry1.name }}
          </legend>
          <label
            class="mixed-feature-option"
            :class="{ 'mixed-feature-option--selected': mixedConfig.ancestry1Feature === 'top' }"
          >
            <input
              type="radio"
              name="mixed-a1-feature"
              value="top"
              :checked="mixedConfig.ancestry1Feature === 'top'"
              @change="emit('updateMixed', 'ancestry1Feature', 'top')"
            />
            <span class="mixed-feature-option__name">{{ mixedAncestry1.topFeature.name }}</span>
            <span class="mixed-feature-option__badge">Top</span>
            <p class="mixed-feature-option__desc">
              {{ mixedAncestry1.topFeature.description }}
            </p>
          </label>
          <label
            class="mixed-feature-option"
            :class="{ 'mixed-feature-option--selected': mixedConfig.ancestry1Feature === 'bottom' }"
          >
            <input
              type="radio"
              name="mixed-a1-feature"
              value="bottom"
              :checked="mixedConfig.ancestry1Feature === 'bottom'"
              @change="emit('updateMixed', 'ancestry1Feature', 'bottom')"
            />
            <span class="mixed-feature-option__name">{{ mixedAncestry1.bottomFeature.name }}</span>
            <span class="mixed-feature-option__badge">Bottom</span>
            <p class="mixed-feature-option__desc">
              {{ mixedAncestry1.bottomFeature.description }}
            </p>
          </label>
        </fieldset>
        <fieldset
          v-if="mixedAncestry2"
          class="mixed-feature-fieldset"
          :aria-label="`Feature de ${mixedAncestry2.name}`"
        >
          <legend class="mixed-feature-legend">
            {{ mixedAncestry2.emoji }} Feature de {{ mixedAncestry2.name }}
          </legend>
          <label
            class="mixed-feature-option"
            :class="{ 'mixed-feature-option--selected': mixedConfig.ancestry2Feature === 'top' }"
          >
            <input
              type="radio"
              name="mixed-a2-feature"
              value="top"
              :checked="mixedConfig.ancestry2Feature === 'top'"
              @change="emit('updateMixed', 'ancestry2Feature', 'top')"
            />
            <span class="mixed-feature-option__name">{{ mixedAncestry2.topFeature.name }}</span>
            <span class="mixed-feature-option__badge">Top</span>
            <p class="mixed-feature-option__desc">
              {{ mixedAncestry2.topFeature.description }}
            </p>
          </label>
          <label
            class="mixed-feature-option"
            :class="{ 'mixed-feature-option--selected': mixedConfig.ancestry2Feature === 'bottom' }"
          >
            <input
              type="radio"
              name="mixed-a2-feature"
              value="bottom"
              :checked="mixedConfig.ancestry2Feature === 'bottom'"
              @change="emit('updateMixed', 'ancestry2Feature', 'bottom')"
            />
            <span class="mixed-feature-option__name">{{ mixedAncestry2.bottomFeature.name }}</span>
            <span class="mixed-feature-option__badge">Bottom</span>
            <p class="mixed-feature-option__desc">
              {{ mixedAncestry2.bottomFeature.description }}
            </p>
          </label>
        </fieldset>
      </template>

      <!-- Ascendance — features -->
      <div
        v-if="ancestryData && char.ancestryId !== 'mixed-ancestry'"
        class="feature-list"
      >
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

      <!-- Communauté — sélecteur -->
      <div class="selector-field selector-field--spaced">
        <label
          class="selector-label"
          for="sel-community"
        >Communauté</label>
        <select
          id="sel-community"
          class="selector-select"
          :value="char.communityId"
          aria-label="Choisir une communauté"
          @change="emit('applySelection', 'communityId', $event.target.value)"
        >
          <option value="">
            — Choisir —
          </option>
          <option
            v-for="c in communities"
            :key="c.id"
            :value="c.id"
          >
            {{ c.emoji }} {{ c.name }}
          </option>
        </select>
      </div>

      <!-- Communauté — features -->
      <div
        v-if="communityData"
        class="feature-list"
      >
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

      <!-- Expériences -->
      <div class="section-header section-header--spaced">
        <h4 class="section-subheading">
          Expériences
        </h4>
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

    <!-- ═══ Traits ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        Traits
      </h3>
      <TraitBlock
        :values="char.traits"
        :suggested-traits="classData ? classData.suggestedTraits : null"
        @update="(traitId, val) => emit('update', `traits.${traitId}`, val)"
      />
    </section>

    <!-- ═══ Combat & Équipement ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        Combat & Équipement
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
        <span
          v-if="classData && classData.suggestedArmor && !recommendedArmors.length"
          class="equipment-hint"
          aria-label="Armure suggérée par la classe"
        >
          💡 {{ classData.suggestedArmor }}
        </span>
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

      <!-- Armes -->
      <h4 class="section-subheading section-subheading--spaced">
        Armes
      </h4>
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
            v-if="recommendedPrimary.length"
            label="★ Recommandé"
          >
            <option
              v-for="w in recommendedPrimary"
              :key="'rec-' + w.id"
              :value="w.id"
            >
              ★ {{ w.name }} — {{ w.trait }} {{ w.range }} — {{ w.damage }}{{ w.burden === 'Two-Handed' ? ' ⚔ Deux mains' : '' }}
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
              {{ w.name }} — {{ w.trait }} {{ w.range }} — {{ w.damage }}{{ w.burden === 'Two-Handed' ? ' ⚔ Deux mains' : '' }}
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
            v-if="char.primaryWeapon.burden === 'Two-Handed'"
            class="weapon-stat weapon-stat--burden"
          >⚔ Deux mains</span>
          <span
            v-if="char.primaryWeapon.feature"
            class="weapon-stat weapon-stat--feature"
          >{{ char.primaryWeapon.feature }}</span>
        </div>
      </div>
      <div
        class="weapon-block"
        :class="{ 'weapon-block--disabled': isTwoHanded }"
      >
        <label
          class="weapon-label"
          for="sheet-secondary-weapon"
        >Secondaire</label>
        <select
          v-if="!isTwoHanded"
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
            v-if="recommendedSecondary.length"
            label="★ Recommandé"
          >
            <option
              v-for="w in recommendedSecondary"
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
        <p
          v-else
          class="weapon-twohanded-notice"
          aria-live="polite"
        >
          ⚔ Slot occupé — arme principale à deux mains
        </p>
        <div
          v-if="!isTwoHanded && char.secondaryWeapon && char.secondaryWeapon.name"
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
        <div class="health-cell">
          <SlotTracker
            label="HP"
            variant="hp"
            :max="effectiveMaxHP || char.maxHP"
            :marked="char.currentHP"
            @mark="emit('markHP')"
            @clear="emit('clearHP')"
            @set="(v) => emit('update', 'currentHP', v)"
          />
          <span
            v-if="classData"
            class="health-detail"
          >
            Base {{ classData.baseHP }}
            <template v-if="hpSources.length">
              · {{ hpSources.join(' · ') }}
            </template>
          </span>
        </div>
        <div class="health-cell">
          <SlotTracker
            label="Stress"
            variant="stress"
            :max="effectiveMaxStress || char.maxStress"
            :marked="char.currentStress"
            @mark="emit('markStress')"
            @clear="emit('clearStress')"
            @set="(v) => emit('update', 'currentStress', v)"
          />
          <span
            v-if="classData"
            class="health-detail"
          >
            Base {{ classData.baseStress }}
            <template v-if="stressSources.length">
              · {{ stressSources.join(' · ') }}
            </template>
          </span>
        </div>
        <div class="health-cell">
          <SlotTracker
            label="Armure"
            variant="armor"
            :max="effectiveArmorScore"
            :marked="char.armorSlotsMarked"
            @mark="emit('markArmor')"
            @clear="emit('clearArmor')"
            @set="(v) => emit('update', 'armorSlotsMarked', v)"
          />
          <span class="health-detail">
            Base {{ char.armorScore }}
            <template v-if="armorSources.length">
              · {{ armorSources.join(' · ') }}
            </template>
          </span>
        </div>
        <!-- Hope -->
        <div class="health-cell">
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
          <span class="health-detail health-detail--muted">
            Gagné en partage ou capacité
          </span>
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

    <!-- ═══ Classe (Capacité + Sous-classe) ═══ -->
    <section
      v-if="classData"
      class="sheet-section"
    >
      <h3 class="section-heading">
        {{ classData.emoji }} Classe
      </h3>

      <!-- Sous-classe — sélecteur -->
      <div class="selector-field">
        <label
          class="selector-label"
          for="sel-subclass"
        >Sous-classe</label>
        <select
          id="sel-subclass"
          class="selector-select"
          :value="char.subclassId"
          aria-label="Choisir une sous-classe"
          @change="emit('applySelection', 'subclassId', $event.target.value)"
        >
          <option value="">
            — Choisir —
          </option>
          <option
            v-for="sub in subclasses"
            :key="sub.id"
            :value="sub.id"
          >
            {{ sub.name }}
          </option>
        </select>
        <p
          v-if="subclassData"
          class="selector-hint"
        >
          {{ subclassData.description }}
        </p>
      </div>

      <!-- Capacité de classe -->
      <h4 class="section-subheading section-subheading--spaced">
        Capacités de classe
      </h4>
      <div class="class-features">
        <p class="hope-feature">
          <strong>Hope Feature:</strong>
          {{ typeof classData.hopeFeature === 'object' ? `${classData.hopeFeature.name} : ${classData.hopeFeature.description}` : classData.hopeFeature }}
        </p>
        <p
          v-for="(feat, i) in classData.classFeatures"
          :key="i"
          class="class-feature-text"
        >
          {{ typeof feat === 'object' ? `${feat.name} : ${feat.description}` : feat }}
        </p>
        <p
          v-if="classData.classItems"
          class="class-feature-text class-feature-text--items"
        >
          🎒 <strong>Objets de classe :</strong> {{ classData.classItems }}
        </p>
      </div>

      <!-- Sous-classe Features -->
      <template v-if="subclassData">
        <h4 class="section-subheading section-subheading--spaced">
          🎯 {{ subclassData.name }}
        </h4>
        <div class="class-features">
          <p
            v-if="subclassData.spellcastTrait"
            class="spellcast-trait"
          >
            <strong>Spellcast Trait :</strong> {{ subclassData.spellcastTrait }}
          </p>
          <div class="subclass-tier-block">
            <span class="subclass-tier-label">Fondation (Niv. 1–4)</span>
            <p
              v-for="(feat, i) in subclassData.foundation"
              :key="'f'+i"
              class="class-feature-text"
            >
              {{ typeof feat === 'object' ? `${feat.name} : ${feat.description}` : feat }}
            </p>
          </div>
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
              {{ typeof feat === 'object' ? `${feat.name} : ${feat.description}` : feat }}
            </p>
          </div>
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
              {{ typeof feat === 'object' ? `${feat.name} : ${feat.description}` : feat }}
            </p>
          </div>
        </div>
      </template>
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

    <!-- ═══ Notes ═══ -->
    <section class="sheet-section">
      <h3 class="section-heading">
        Notes
      </h3>
      <textarea
        class="field-textarea"
        :value="localNotes"
        placeholder="Notes, rappels, inventaire…"
        rows="3"
        aria-label="Notes"
        @input="onNotesInput($event.target.value)"
        @blur="flushNotes"
      ></textarea>
    </section>
  </div>
</template>

<script>
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { getAncestryById, ALL_ANCESTRIES } from '@data/ancestries'
import { getPrimaryWeaponById } from '@data/equipment/primaryWeapons.js'
import { getSecondaryWeaponById } from '@data/equipment/secondaryWeapons.js'
import { getArmorById } from '@data/equipment/armor.js'
import { getRecommendedIds } from '@data/equipment/classRecommendations.js'
import { TIER_LABELS } from '@core/utils/constants.js'
import SlotTracker from './SlotTracker.vue'
import TraitBlock from './TraitBlock.vue'
import DomainCardPicker from './DomainCardPicker.vue'
import ActiveModifiersPanel from './ActiveModifiersPanel.vue'
import InventoryPanel from './InventoryPanel.vue'

export default {
  name: 'CharacterSheet',
  components: { SlotTracker, TraitBlock, DomainCardPicker, ActiveModifiersPanel, InventoryPanel },
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
    effectiveArmorScore: { type: Number, default: 0 },
    // Layout colonnes
    sheetColumns: { type: Number, default: 0 }
  },
  emits: [
    'update', 'markHP', 'clearHP', 'markStress', 'clearStress',
    'markArmor', 'clearArmor', 'setHope',
    'addExperience', 'removeExperience',
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
    // ── Style grille colonnes ──
    const sheetGridStyle = computed(() => {
      if (!props.sheetColumns || props.sheetColumns === 0) return {}
      return {
        'grid-template-columns': `repeat(${props.sheetColumns}, 1fr)`
      }
    })

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

    // ── Ascendances (pour sélecteur inline) ──
    const srdAncestries = computed(() =>
      props.ancestries.filter((a) => a.source === 'srd')
    )
    const customAncestries = computed(() =>
      props.ancestries.filter((a) => a.source === 'custom')
    )

    // ── Mixed Ancestry ──
    const mixedConfig = computed(() =>
      props.char?.mixedAncestryConfig || {
        ancestry1Id: '', ancestry2Id: '',
        ancestry1Feature: '', ancestry2Feature: ''
      }
    )
    const selectableAncestries = computed(() =>
      ALL_ANCESTRIES.filter((a) => a.id !== 'mixed-ancestry')
    )
    const mixedAncestry1 = computed(() =>
      mixedConfig.value.ancestry1Id
        ? getAncestryById(mixedConfig.value.ancestry1Id)
        : null
    )
    const mixedAncestry2 = computed(() =>
      mixedConfig.value.ancestry2Id
        ? getAncestryById(mixedConfig.value.ancestry2Id)
        : null
    )

    // ── Armes à deux mains ──
    const isTwoHanded = computed(() =>
      props.char?.primaryWeapon?.burden === 'Two-Handed'
    )

    // ── Équipement groupé par tier ──
    const armorTiers = computed(() => groupByTier(props.armor))
    const primaryWeaponTiers = computed(() => groupByTier(props.primaryWeapons))
    const secondaryWeaponTiers = computed(() => groupByTier(props.secondaryWeapons))

    // ── Recommandations par classe ──
    const recommendedArmors = computed(() =>
      getRecommendedIds(props.char?.classId || '', 'armor')
        .map(getArmorById)
        .filter(Boolean)
    )
    const recommendedPrimary = computed(() =>
      getRecommendedIds(props.char?.classId || '', 'primaryWeapon')
        .map(getPrimaryWeaponById)
        .filter(Boolean)
    )
    const recommendedSecondary = computed(() =>
      getRecommendedIds(props.char?.classId || '', 'secondaryWeapon')
        .map(getSecondaryWeaponById)
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

    // ── Détail des bonus par stat pour la section Santé ──
    const hpSources = computed(() =>
      (props.statBonuses.detailedSources || []).filter((s) => s.maxHP).map((s) => `${s.source} (+${s.maxHP})`)
    )
    const stressSources = computed(() =>
      (props.statBonuses.detailedSources || []).filter((s) => s.maxStress).map((s) => `${s.source} (+${s.maxStress})`)
    )
    const armorSources = computed(() => {
      const list = []
      for (const s of (props.statBonuses.detailedSources || [])) {
        if (s.armorScore) list.push(`${s.source} (+${s.armorScore})`)
        if (s.armorScoreOverride !== undefined && s.armorScoreOverride !== null) list.push(`${s.source} (→ ${s.armorScoreOverride})`)
        if (s.disableArmor) list.push(`${s.source} (désactivé)`)
      }
      return list
    })

    // ── Notes avec debounce pour éviter le reset du curseur ──
    const localNotes = ref(props.char?.notes || '')
    let _notesTimer = null

    watch(() => props.char?.notes, (v) => {
      if (!_notesTimer) localNotes.value = v || ''
    })

    function onNotesInput(value) {
      localNotes.value = value
      if (_notesTimer) clearTimeout(_notesTimer)
      _notesTimer = setTimeout(() => {
        emit('update', 'notes', localNotes.value)
        _notesTimer = null
      }, 400)
    }

    function flushNotes() {
      if (_notesTimer) {
        clearTimeout(_notesTimer)
        _notesTimer = null
      }
      emit('update', 'notes', localNotes.value)
    }

    onBeforeUnmount(() => {
      if (_notesTimer) {
        clearTimeout(_notesTimer)
        emit('update', 'notes', localNotes.value)
      }
    })

    return {
      acquiredCardIds, clampInt, emit,
      srdAncestries, customAncestries,
      mixedConfig, selectableAncestries, mixedAncestry1, mixedAncestry2,
      isTwoHanded, armorTiers, primaryWeaponTiers, secondaryWeaponTiers,
      recommendedArmors, recommendedPrimary, recommendedSecondary,
      hpSources, stressSources, armorSources,
      sheetGridStyle,
      localNotes, onNotesInput, flushNotes
    }
  }
}
</script>

<style scoped>
.char-sheet {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-md);
}

@media (min-width: 900px) {
  .char-sheet:not(.char-sheet--custom-cols) {
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  }
}

@media (min-width: 1400px) {
  .char-sheet:not(.char-sheet--custom-cols) {
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  }
}

.sheet-section {
  padding: var(--space-md);
  background: var(--color-bg-secondary, #1f1f3a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 8px;
  overflow: hidden;
}

.section-heading {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.95rem;
  color: var(--color-text-primary);
  margin: 0 0 var(--space-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-sm);
}

.section-header .section-heading { margin: 0; }

/* ── Sélecteurs inline ── */
.selector-field {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.selector-field--spaced {
  margin-top: var(--space-md);
}

.selector-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted, #6b7280);
}

.selector-select {
  padding: 5px 8px;
  background: var(--color-bg-tertiary, #2a2a4a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
}

.selector-select:focus {
  outline: 2px solid var(--color-accent-hope, #53a8b6);
  outline-offset: 1px;
}

.selector-select option,
.selector-select optgroup {
  background: var(--color-bg-secondary, #1f1f3a);
  color: var(--color-text-primary);
}

.selector-hint {
  font-size: 0.75rem;
  color: var(--color-text-muted, #6b7280);
  margin: 2px 0 0;
  line-height: 1.3;
  max-height: 3.9em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.selectors-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

@media (max-width: 480px) { .selectors-row { grid-template-columns: 1fr; } }

/* ── Mixed Ancestry ── */
.mixed-intro-block {
  margin-top: var(--space-sm);
}

.mixed-intro {
  font-size: 0.8rem;
  color: var(--color-text-secondary, #9ca3af);
  line-height: 1.4;
  margin: 0;
  padding: 6px 8px;
  background: rgba(83, 168, 182, 0.06);
  border-left: 2px solid var(--color-accent-hope, #53a8b6);
  border-radius: 0 4px 4px 0;
}

.mixed-feature-fieldset {
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 6px;
  padding: 8px;
  margin: 4px 0;
}

.mixed-feature-legend {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-accent-hope, #53a8b6);
  padding: 0 4px;
}

.mixed-feature-option {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  margin: 4px 0;
  cursor: pointer;
  transition: border-color 150ms, background 150ms;
}

.mixed-feature-option:hover { border-color: var(--color-text-secondary, #9ca3af); }
.mixed-feature-option--selected {
  border-color: var(--color-accent-hope, #53a8b6);
  background: rgba(83, 168, 182, 0.08);
}

.mixed-feature-option input[type="radio"] {
  accent-color: var(--color-accent-hope, #53a8b6);
  margin: 0;
  flex-shrink: 0;
}

.mixed-feature-option__name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary, #e5e7eb);
}

.mixed-feature-option__badge {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 5px;
  border-radius: 3px;
  background: rgba(83, 168, 182, 0.15);
  color: var(--color-accent-hope, #53a8b6);
  margin-left: auto;
}

.mixed-feature-option__desc {
  width: 100%;
  font-size: 0.72rem;
  color: var(--color-text-secondary, #9ca3af);
  line-height: 1.35;
  margin: 2px 0 0;
}

/* ── Section sub-headings ── */
.section-subheading {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 0.85rem;
  color: var(--color-text-secondary, #9ca3af);
  margin: 0 0 var(--space-xs);
  font-weight: 600;
}

.section-subheading--spaced {
  margin-top: var(--space-md);
}

.section-header--spaced {
  margin-top: var(--space-md);
}

/* ── Fields ── */
.identity-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-sm);
}

@media (max-width: 480px) { .identity-grid { grid-template-columns: 1fr; } }

.field { display: flex; flex-direction: column; gap: 2px; }

.field-label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted, #6b7280);
}

.field-input {
  padding: 5px 8px;
  background: var(--color-bg-tertiary, #2a2a4a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 0.85rem;
}

.field-input:focus { outline: 2px solid var(--color-accent-hope, #53a8b6); outline-offset: 1px; }
.field-input::placeholder { color: var(--color-text-muted, #6b7280); }
.field-input--lg { font-size: 1rem; font-weight: 600; }
.field-input--sm { width: 60px; text-align: center; }
.field-input--xs { width: 44px; text-align: center; }

.field-input::-webkit-inner-spin-button,
.field-input::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
.field-input[type="number"] { -moz-appearance: textfield; }

.field-value { font-size: 0.9rem; color: var(--color-text-primary); padding: 5px 0; }
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
  background: var(--color-accent-hope, #53a8b6);
  color: #fff;
}

.level-btn--rollback {
  background: transparent;
  border: 1px solid var(--color-border, #3a3a5a);
  color: var(--color-text-secondary, #a0a0b8);
  font-size: 0.7rem;
}

.level-btn--rollback:hover { border-color: var(--color-accent-fear, #c84b31); color: var(--color-accent-fear, #c84b31); }

.field-textarea {
  width: 100%;
  padding: 8px;
  background: var(--color-bg-tertiary, #2a2a4a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 0.85rem;
  resize: vertical;
  font-family: inherit;
}

.field-textarea:focus { outline: 2px solid var(--color-accent-hope, #53a8b6); outline-offset: 1px; }

/* ── Combat ── */
.combat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

@media (max-width: 480px) { .combat-grid { grid-template-columns: repeat(2, 1fr); } }

.combat-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-sm);
  background: var(--color-bg-tertiary, #2a2a4a);
  border-radius: 6px;
}

.combat-stat__label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted, #6b7280);
}

.combat-stat__value {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}

.combat-stat__detail {
  font-size: 0.65rem;
  color: var(--color-text-muted, #6b7280);
}

.bonus-indicator {
  color: var(--color-accent-hope, #53a8b6);
  font-weight: 600;
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

@media (max-width: 480px) { .health-grid { grid-template-columns: 1fr; } }

.health-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.health-detail {
  font-size: 0.65rem;
  color: var(--color-text-muted, #6b7280);
  line-height: 1.3;
}

.health-detail--muted {
  font-style: italic;
  opacity: 0.7;
}

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
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 50%;
  background: var(--color-bg-tertiary, #2a2a4a);
  color: var(--color-text-primary);
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
  color: var(--color-text-secondary);
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
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  background: var(--color-bg-tertiary, #2a2a4a);
  color: var(--color-text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-btn:hover { border-color: #22c55e; color: #22c55e; }
.remove-btn:hover { border-color: var(--color-accent-fear, #c84b31); color: var(--color-accent-fear, #c84b31); }

/* ── Weapons ── */
.weapon-block {
  margin-bottom: var(--space-sm);
}

.weapon-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-muted, #6b7280);
  margin-bottom: 2px;
}

.equipment-hint {
  display: block;
  font-size: 0.7rem;
  color: #eab308;
  font-style: italic;
  margin-bottom: 4px;
  line-height: 1.3;
}

.weapon-select {
  width: 100%;
  padding: 5px 8px;
  background: var(--color-bg-tertiary, #2a2a4a);
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 4px;
  color: var(--color-text-primary);
  font-size: 0.85rem;
  cursor: pointer;
  box-sizing: border-box;
}

.weapon-select:focus {
  outline: 2px solid var(--color-accent-hope, #53a8b6);
  outline-offset: 1px;
}

.weapon-select option,
.weapon-select optgroup {
  background: var(--color-bg-secondary, #1f1f3a);
  color: var(--color-text-primary);
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
  border: 1px solid var(--color-border, #3a3a5a);
  border-radius: 3px;
  color: var(--color-text-secondary, #9ca3af);
}

.weapon-stat--dmg {
  color: var(--color-accent-fear, #c84b31);
  border-color: rgba(200, 75, 49, 0.3);
  background: rgba(200, 75, 49, 0.06);
  font-weight: 600;
}

.weapon-stat--feature {
  flex-basis: 100%;
  font-style: italic;
  color: var(--color-text-muted, #6b7280);
  background: transparent;
  border: none;
  padding: 0;
  font-size: 0.75rem;
  line-height: 1.35;
}

.weapon-stat--burden {
  color: #eab308;
  border-color: rgba(234, 179, 8, 0.3);
  background: rgba(234, 179, 8, 0.08);
  font-weight: 600;
}

.weapon-block--disabled {
  opacity: 0.5;
}

.weapon-twohanded-notice {
  font-size: 0.8rem;
  font-style: italic;
  color: #eab308;
  margin: 4px 0 0;
  padding: 6px 10px;
  background: rgba(234, 179, 8, 0.06);
  border: 1px dashed rgba(234, 179, 8, 0.3);
  border-radius: 4px;
}

/* ── Class Features ── */
.class-features {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
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
  background: var(--color-bg-tertiary, #2a2a4a);
  border-radius: 4px;
}

.feature-name {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-accent-hope, #53a8b6);
  margin-bottom: 2px;
}

.feature-desc {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  line-height: 1.45;
  margin: 0;
}

.community-adjectives {
  font-size: 0.8rem;
  color: var(--color-text-muted, #6b7280);
  font-style: italic;
}

.adjective-label {
  font-style: normal;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.spellcast-trait {
  margin: 0 0 var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: rgba(139, 92, 246, 0.08);
  border-left: 3px solid #8b5cf6;
  border-radius: 0 4px 4px 0;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.subclass-tier-block {
  margin-bottom: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-tertiary, #2a2a4a);
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
