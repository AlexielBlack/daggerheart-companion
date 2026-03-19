<template>
  <section
    class="pc-group"
    aria-label="Groupe de personnages"
  >
    <!-- En-tete du panel -->
    <div class="pc-group__header">
      <h3 class="pc-group__title">
        <span aria-hidden="true">&#x1F465;</span>
        Personnages ({{ visibleList.length }})
      </h3>
      <div class="pc-group__actions">
        <div
          class="pc-group__columns-control"
          role="group"
          aria-label="Nombre de colonnes"
        >
          <label
            for="pc-columns-slider"
            class="pc-group__columns-label"
          >
            {{ cardColumns === 0 ? 'Auto' : cardColumns + ' col.' }}
          </label>
          <input
            id="pc-columns-slider"
            v-model.number="cardColumns"
            type="range"
            min="0"
            max="4"
            step="1"
            class="pc-group__columns-slider"
            aria-label="Largeur des cartes"
            :list="'pc-columns-ticks'"
          >
          <datalist id="pc-columns-ticks">
            <option
              v-for="opt in COLUMN_OPTIONS"
              :key="opt.value"
              :value="opt.value"
              :label="opt.label"
            />
          </datalist>
        </div>
        <router-link
          to="/table/prep/personnages"
          class="pc-group__edit-link"
          aria-label="Editer les personnages"
        >
          &#x270F;&#xFE0F; Editer
        </router-link>
      </div>
    </div>

    <!-- Etat vide -->
    <p
      v-if="visibleList.length === 0 && hiddenList.length === 0"
      class="pc-group__empty"
    >
      Aucun personnage cree.
      <router-link to="/table/prep/personnages">
        Creer un personnage
      </router-link>
    </p>

    <!-- Grille de cartes PJ -->
    <div
      v-if="visibleList.length > 0"
      class="pc-group__grid"
      :class="{ 'pc-group__grid--custom': cardColumns > 0 }"
      :style="gridStyle"
      role="list"
      aria-label="Liste des personnages"
    >
      <article
        v-for="pc in visibleList"
        :key="pc.id"
        class="pc-card"
        role="listitem"
        :aria-label="pc.name || 'Sans nom'"
      >
        <!-- 1. Identite -->
        <div class="pc-card__body">
          <div class="pc-card__identity">
            <button
              class="pc-card__hide-btn"
              title="Masquer ce PJ de la table"
              aria-label="Masquer ce PJ"
              @click.stop="onToggleHidden(pc.id)"
            >
              &#x1F441;&#xFE0F;
            </button>
            <span
              v-if="pc.classData"
              class="pc-card__class-emoji"
              aria-hidden="true"
            >{{ pc.classData.emoji }}</span>
            <button
              class="pc-card__name-btn"
              :aria-label="'Voir la fiche de ' + (pc.name || 'Sans nom')"
              @click.stop="$emit('select-pc', pc.id)"
            >
              <span class="pc-card__name">{{ pc.name || 'Sans nom' }}</span>
            </button>
            <span
              v-if="pc.classData"
              class="pc-card__class-name"
            >{{ pc.classData.name }}</span>
            <span class="pc-card__level-badge">Nv.{{ pc.level || 1 }}</span>
            <span
              v-if="pc.subclassData"
              class="pc-card__subclass"
            >{{ pc.subclassData.name }}</span>
          </div>

          <!-- 2. Ascendance / Communaute -->
          <div class="pc-card__meta">
            <span v-if="pc.ancestryData">{{ pc.ancestryData.name }}</span>
            <span v-if="pc.ancestryData && pc.communityData"> &middot; </span>
            <span v-if="pc.communityData">{{ pc.communityData.name }}</span>
          </div>

          <!-- 3. Traits (toujours visibles) -->
          <div
            class="pc-card__traits"
            aria-label="Traits du personnage"
          >
            <div
              v-for="traitKey in TRAIT_ORDER"
              :key="traitKey"
              class="pc-card__trait"
              :class="{
                'pc-card__trait--positive': (pc.traits && pc.traits[traitKey]) > 0,
                'pc-card__trait--negative': (pc.traits && pc.traits[traitKey]) < 0,
                'pc-card__trait--zero': !(pc.traits && pc.traits[traitKey])
              }"
            >
              <span class="pc-card__trait-label">{{ TRAIT_ABBR[traitKey] }}</span>
              <span class="pc-card__trait-value">{{ traitSign(pc.traits ? pc.traits[traitKey] : 0) }}</span>
            </div>
          </div>

          <!-- 4. Conditions -->
          <div
            v-if="pc.conditions && pc.conditions.length > 0"
            class="pc-card__conditions"
            aria-label="Conditions actives"
          >
            <span
              v-for="cond in pc.conditions"
              :key="cond"
              class="pc-card__condition"
              :style="conditionStyle(cond)"
              :title="conditionDesc(cond)"
              :aria-label="conditionLabel(cond) + ' : ' + conditionDesc(cond)"
            >
              {{ conditionLabel(cond) }}
            </span>
          </div>

          <!-- 5. Experiences -->
          <div
            v-if="hasExperiences(pc)"
            class="pc-card__experiences"
            aria-label="Experiences du personnage"
          >
            <span
              v-for="(exp, idx) in (pc.experiences || [])"
              :key="'exp-' + idx"
              class="pc-card__experience"
            >
              <span class="pc-card__experience-name">{{ exp.name }}</span>
              <span
                v-if="exp.bonus"
                class="pc-card__experience-bonus"
              >+{{ exp.bonus }}</span>
            </span>
          </div>
        </div>

        <!-- 6. Onglets integres : Capacites | Domaines | Inventaire | Notes -->
        <div
          v-if="visibleTabs(pc).length > 0"
          class="pc-card__tabs"
        >
          <div
            class="pc-card__tablist"
            role="tablist"
            :aria-label="'Sections de ' + (pc.name || 'Sans nom')"
          >
            <button
              v-for="tab in visibleTabs(pc)"
              :id="'tab-' + pc.id + '-' + tab.id"
              :key="tab.id"
              class="pc-card__tab"
              :class="{ 'pc-card__tab--active': getActiveTab(pc.id) === tab.id }"
              role="tab"
              :aria-selected="String(getActiveTab(pc.id) === tab.id)"
              :aria-controls="'panel-' + pc.id + '-' + tab.id"
              :tabindex="getActiveTab(pc.id) === tab.id ? 0 : -1"
              @click.stop="setActiveTab(pc.id, tab.id)"
              @keydown.left.prevent="navigateTab(pc, -1)"
              @keydown.right.prevent="navigateTab(pc, 1)"
            >
              <span aria-hidden="true">{{ tab.icon }}</span>
              <span class="pc-card__tab-label">{{ tab.label }}</span>
            </button>
          </div>

          <!-- Panneau Capacites -->
          <div
            v-show="getActiveTab(pc.id) === 'capacites'"
            :id="'panel-' + pc.id + '-capacites'"
            class="pc-card__tabpanel"
            role="tabpanel"
            :aria-labelledby="'tab-' + pc.id + '-capacites'"
          >
            <!-- Hope Feature -->
            <div
              v-if="pc.classData && pc.classData.hopeFeature"
              class="pc-card__feature-group"
            >
              <div class="pc-card__feature-source">
                <span aria-hidden="true">&#x2728;</span>
                Feature d'Espoir &#x2014; {{ pc.classData.name }}
              </div>
              <div class="pc-card__feature pc-card__feature--hope">
                <template v-if="typeof pc.classData.hopeFeature === 'object'">
                  <span class="pc-card__feature-name">
                    {{ activationEmoji(pc.classData.hopeFeature.activationType) }}
                    {{ pc.classData.hopeFeature.name }}
                  </span>
                  <span class="pc-card__feature-desc">{{ pc.classData.hopeFeature.description }}</span>
                </template>
                <template v-else>
                  <span class="pc-card__feature-desc">{{ pc.classData.hopeFeature }}</span>
                </template>
              </div>
            </div>

            <!-- Class Features -->
            <div
              v-if="classFeaturesList(pc).length > 0"
              class="pc-card__feature-group"
            >
              <div class="pc-card__feature-source">
                <span aria-hidden="true">&#x2694;&#xFE0F;</span>
                Classe &#x2014; {{ pc.classData.name }}
              </div>
              <div
                v-for="(feat, idx) in classFeaturesList(pc)"
                :key="'cf-' + idx"
                class="pc-card__feature"
              >
                <template v-if="typeof feat === 'object'">
                  <span class="pc-card__feature-name">
                    {{ activationEmoji(feat.activationType) }}
                    {{ feat.name }}
                  </span>
                  <span class="pc-card__feature-desc">{{ feat.description }}</span>
                </template>
                <template v-else>
                  <span class="pc-card__feature-desc">{{ feat }}</span>
                </template>
              </div>
            </div>

            <!-- Ancestry Features -->
            <div
              v-if="pc.ancestryData && (pc.ancestryData.topFeature || pc.ancestryData.bottomFeature)"
              class="pc-card__feature-group"
            >
              <div class="pc-card__feature-source">
                <span aria-hidden="true">&#x1F9EC;</span>
                Ascendance &#x2014; {{ pc.ancestryData.name }}
              </div>
              <div
                v-if="pc.ancestryData.topFeature"
                class="pc-card__feature"
              >
                <span class="pc-card__feature-name">{{ pc.ancestryData.topFeature.name }}</span>
                <span class="pc-card__feature-desc">{{ pc.ancestryData.topFeature.description }}</span>
              </div>
              <div
                v-if="pc.ancestryData.bottomFeature"
                class="pc-card__feature"
              >
                <span class="pc-card__feature-name">{{ pc.ancestryData.bottomFeature.name }}</span>
                <span class="pc-card__feature-desc">{{ pc.ancestryData.bottomFeature.description }}</span>
              </div>
            </div>

            <!-- Community Feature -->
            <div
              v-if="pc.communityData && pc.communityData.feature"
              class="pc-card__feature-group"
            >
              <div class="pc-card__feature-source">
                <span aria-hidden="true">&#x1F3D8;&#xFE0F;</span>
                Communaute &#x2014; {{ pc.communityData.name }}
              </div>
              <div class="pc-card__feature">
                <span class="pc-card__feature-name">{{ pc.communityData.feature.name }}</span>
                <span class="pc-card__feature-desc">{{ pc.communityData.feature.description }}</span>
              </div>
            </div>

            <!-- Subclass features par tier -->
            <template v-if="pc.subclassData">
              <!-- Foundation -->
              <div
                v-if="(pc.subclassData.foundation || []).length > 0"
                class="pc-card__feature-group"
              >
                <div class="pc-card__feature-source">
                  <span aria-hidden="true">&#x2694;&#xFE0F;</span>
                  Specialisation &#x2014; {{ pc.subclassData.name }} &#xB7; Fondation
                </div>
                <div
                  v-for="(feat, idx) in (pc.subclassData.foundation || [])"
                  :key="'found-' + idx"
                  class="pc-card__feature"
                >
                  <span class="pc-card__feature-name">
                    {{ activationEmoji(feat.activationType) }}
                    {{ feat.name }}
                  </span>
                  <span class="pc-card__feature-desc">{{ feat.description }}</span>
                </div>
              </div>

              <!-- Specialization (niveau >= 5) -->
              <div
                v-if="(pc.level || 1) >= 5 && (pc.subclassData.specialization || []).length > 0"
                class="pc-card__feature-group"
              >
                <div class="pc-card__feature-source">
                  <span aria-hidden="true">&#x2694;&#xFE0F;</span>
                  Specialisation &#x2014; {{ pc.subclassData.name }} &#xB7; Specialisation
                </div>
                <div
                  v-for="(feat, idx) in (pc.subclassData.specialization || [])"
                  :key="'spec-' + idx"
                  class="pc-card__feature"
                >
                  <span class="pc-card__feature-name">
                    {{ activationEmoji(feat.activationType) }}
                    {{ feat.name }}
                  </span>
                  <span class="pc-card__feature-desc">{{ feat.description }}</span>
                </div>
              </div>

              <!-- Mastery (niveau >= 8) -->
              <div
                v-if="(pc.level || 1) >= 8 && (pc.subclassData.mastery || []).length > 0"
                class="pc-card__feature-group"
              >
                <div class="pc-card__feature-source">
                  <span aria-hidden="true">&#x2694;&#xFE0F;</span>
                  Specialisation &#x2014; {{ pc.subclassData.name }} &#xB7; Maitrise
                </div>
                <div
                  v-for="(feat, idx) in (pc.subclassData.mastery || [])"
                  :key="'mast-' + idx"
                  class="pc-card__feature"
                >
                  <span class="pc-card__feature-name">
                    {{ activationEmoji(feat.activationType) }}
                    {{ feat.name }}
                  </span>
                  <span class="pc-card__feature-desc">{{ feat.description }}</span>
                </div>
              </div>
            </template>
          </div>

          <!-- Panneau Domaines -->
          <div
            v-show="getActiveTab(pc.id) === 'domaines'"
            :id="'panel-' + pc.id + '-domaines'"
            class="pc-card__tabpanel"
            role="tabpanel"
            :aria-labelledby="'tab-' + pc.id + '-domaines'"
          >
            <!-- Loadout -->
            <div
              v-if="pc.loadoutCards && pc.loadoutCards.length > 0"
              class="pc-card__domain-section"
            >
              <div class="pc-card__domain-section-title">
                Loadout ({{ pc.loadoutCards.length }})
              </div>
              <div class="pc-card__domain-grid">
                <DomainCardItem
                  v-for="card in pc.loadoutCards"
                  :key="card.id"
                  :card="card"
                  :domain-color="domainColor(card.domain)"
                />
              </div>
            </div>

            <!-- Vault -->
            <div
              v-if="pc.vaultCards && pc.vaultCards.length > 0"
              class="pc-card__domain-section"
            >
              <div class="pc-card__domain-section-title pc-card__domain-section-title--vault">
                Vault ({{ pc.vaultCards.length }})
              </div>
              <div class="pc-card__domain-grid">
                <DomainCardItem
                  v-for="card in pc.vaultCards"
                  :key="card.id"
                  :card="card"
                  :domain-color="domainColor(card.domain)"
                />
              </div>
            </div>

            <p
              v-if="(!pc.loadoutCards || pc.loadoutCards.length === 0) && (!pc.vaultCards || pc.vaultCards.length === 0)"
              class="pc-card__empty-tab"
            >
              Aucune carte de domaine.
            </p>
          </div>

          <!-- Panneau Inventaire -->
          <div
            v-show="getActiveTab(pc.id) === 'inventaire'"
            :id="'panel-' + pc.id + '-inventaire'"
            class="pc-card__tabpanel"
            role="tabpanel"
            :aria-labelledby="'tab-' + pc.id + '-inventaire'"
          >
            <PcInventoryEditor
              :inventory="pc.inventory || []"
              :gold="pc.gold || { handfuls: 0, bags: 0, chests: 0 }"
              :primary-weapon-id="pc.primaryWeaponId || ''"
              :secondary-weapon-id="pc.secondaryWeaponId || ''"
              :armor-id="pc.armorId || ''"
              :is-two-handed="!!(pc.primaryWeapon && pc.primaryWeapon.burden === 'Two-Handed')"
              @add-item="(type) => onAddItem(pc.id, type)"
              @remove-item="(index) => onRemoveItem(pc.id, index)"
              @update-item="(index, field, value) => onUpdateItem(pc.id, index, field, value)"
              @update-gold="(tier, value) => onUpdateGold(pc.id, tier, value)"
              @update-equipment="(field, value) => onUpdateEquipment(pc.id, field, value)"
            />
          </div>

          <!-- Panneau Notes -->
          <div
            v-show="getActiveTab(pc.id) === 'notes'"
            :id="'panel-' + pc.id + '-notes'"
            class="pc-card__tabpanel"
            role="tabpanel"
            :aria-labelledby="'tab-' + pc.id + '-notes'"
          >
            <textarea
              class="pc-card__notes-textarea"
              :value="pc.notes || ''"
              placeholder="Notes sur ce personnage..."
              :aria-label="'Notes de ' + (pc.name || 'Sans nom')"
              rows="4"
              @input="onNotesInput(pc.id, $event.target.value)"
            ></textarea>
          </div>
        </div>

        <!-- 6. Footer combat compact -->
        <div class="pc-card__combat-footer">
          <!-- HP -->
          <div
            class="pc-card__stat-chip pc-card__stat-chip--hp"
            :aria-label="'Points de vie : ' + (pc.effectiveMaxHP - (pc.currentHP || 0)) + ' restants sur ' + pc.effectiveMaxHP"
          >
            <button
              class="pc-card__stat-btn-sm"
              :disabled="(pc.currentHP || 0) <= 0"
              aria-label="Soigner 1 PV"
              @click.stop="decrementHP(pc)"
            >
              &minus;
            </button>
            <span
              v-if="!isEditing(pc.id, 'currentHP')"
              class="pc-card__stat-text pc-card__stat-text--clickable"
              :style="{ color: hpColor(pc.currentHP || 0, pc.effectiveMaxHP) }"
              role="button"
              tabindex="0"
              @click.stop="startEditStat(pc.id, 'currentHP', pc.currentHP || 0)"
              @keydown.enter.stop="startEditStat(pc.id, 'currentHP', pc.currentHP || 0)"
            >
              &#x2764;&#xFE0F; {{ pc.currentHP || 0 }}/{{ pc.effectiveMaxHP }}
            </span>
            <input
              v-else
              type="number"
              class="pc-card__stat-input"
              :value="editingValue"
              min="0"
              :max="pc.effectiveMaxHP"
              :aria-label="'Saisir les degats de ' + (pc.name || 'Sans nom')"
              @input="editingValue = $event.target.value"
              @blur="commitEditStat(pc)"
              @keydown.enter.stop="commitEditStat(pc)"
              @keydown.escape.stop="cancelEditStat()"
            />
            <button
              class="pc-card__stat-btn-sm"
              :disabled="(pc.currentHP || 0) >= pc.effectiveMaxHP"
              aria-label="Marquer 1 degat"
              @click.stop="incrementHP(pc)"
            >
              +
            </button>
          </div>

          <!-- Stress -->
          <div
            class="pc-card__stat-chip pc-card__stat-chip--stress"
            :aria-label="'Stress : ' + (pc.currentStress || 0) + ' sur ' + pc.effectiveMaxStress"
          >
            <button
              class="pc-card__stat-btn-sm"
              :disabled="(pc.currentStress || 0) <= 0"
              aria-label="Reduire 1 stress"
              @click.stop="decrementStress(pc)"
            >
              &minus;
            </button>
            <span
              v-if="!isEditing(pc.id, 'currentStress')"
              class="pc-card__stat-text pc-card__stat-text--clickable"
              :style="{ color: stressColor(pc.currentStress || 0, pc.effectiveMaxStress) }"
              role="button"
              tabindex="0"
              @click.stop="startEditStat(pc.id, 'currentStress', pc.currentStress || 0)"
              @keydown.enter.stop="startEditStat(pc.id, 'currentStress', pc.currentStress || 0)"
            >
              &#x1F630; {{ pc.currentStress || 0 }}/{{ pc.effectiveMaxStress }}
            </span>
            <input
              v-else
              type="number"
              class="pc-card__stat-input"
              :value="editingValue"
              min="0"
              :max="pc.effectiveMaxStress"
              :aria-label="'Saisir le stress de ' + (pc.name || 'Sans nom')"
              @input="editingValue = $event.target.value"
              @blur="commitEditStat(pc)"
              @keydown.enter.stop="commitEditStat(pc)"
              @keydown.escape.stop="cancelEditStat()"
            />
            <button
              class="pc-card__stat-btn-sm"
              :disabled="(pc.currentStress || 0) >= pc.effectiveMaxStress"
              aria-label="Marquer 1 stress"
              @click.stop="incrementStress(pc)"
            >
              +
            </button>
          </div>

          <!-- Armure -->
          <div
            class="pc-card__stat-chip"
            :aria-label="'Armure : ' + (pc.armorSlotsMarked || 0) + ' sur ' + pc.effectiveArmorScore"
          >
            <button
              class="pc-card__stat-btn-sm"
              :disabled="(pc.armorSlotsMarked || 0) <= 0"
              aria-label="Restaurer 1 armure"
              @click.stop="decrementArmor(pc)"
            >
              &minus;
            </button>
            <span class="pc-card__stat-text">
              &#x1F6E1;&#xFE0F; {{ pc.armorSlotsMarked || 0 }}/{{ pc.effectiveArmorScore }}
            </span>
            <button
              class="pc-card__stat-btn-sm"
              :disabled="(pc.armorSlotsMarked || 0) >= pc.effectiveArmorScore"
              aria-label="Utiliser 1 armure"
              @click.stop="incrementArmor(pc)"
            >
              +
            </button>
          </div>

          <!-- Espoir -->
          <div
            class="pc-card__stat-chip"
            :aria-label="'Espoir : ' + (pc.hope || 0)"
          >
            <button
              class="pc-card__stat-btn-sm"
              :disabled="(pc.hope || 0) <= 0"
              aria-label="Depenser 1 espoir"
              @click.stop="decrementHope(pc)"
            >
              &minus;
            </button>
            <span class="pc-card__stat-text">
              &#x2728; {{ pc.hope || 0 }}
            </span>
            <button
              class="pc-card__stat-btn-sm"
              :disabled="(pc.hope || 0) >= 6"
              aria-label="Gagner 1 espoir"
              @click.stop="incrementHope(pc)"
            >
              +
            </button>
          </div>

          <!-- Evasion & Seuils (lecture seule) -->
          <div class="pc-card__stat-readonly">
            <span>Ev. {{ pc.effectiveEvasion }}</span>
            <span class="pc-card__stat-sep">|</span>
            <span>{{ pc.thresholds.major }}/{{ pc.thresholds.severe }}</span>
          </div>
        </div>
      </article>
    </div>

    <!-- Bandeau PJs masques -->
    <div
      v-if="hiddenList.length > 0"
      class="pc-group__hidden-bar"
    >
      <button
        class="pc-group__hidden-toggle"
        :aria-expanded="String(showHidden)"
        @click="showHidden = !showHidden"
      >
        &#x1F441;&#xFE0F;&#x200D;&#x1F5E8;&#xFE0F;
        {{ hiddenList.length }} PJ{{ hiddenList.length > 1 ? 's' : '' }} masque{{ hiddenList.length > 1 ? 's' : '' }}
        <span class="pc-group__hidden-chevron">{{ showHidden ? '&#x25B2;' : '&#x25BC;' }}</span>
      </button>
      <div
        v-if="showHidden"
        class="pc-group__hidden-list"
      >
        <div
          v-for="pc in hiddenList"
          :key="pc.id"
          class="pc-group__hidden-chip"
        >
          <span>{{ pc.name || 'Sans nom' }}</span>
          <button
            class="pc-group__hidden-restore"
            :title="'Afficher ' + (pc.name || 'Sans nom')"
            :aria-label="'Afficher ' + (pc.name || 'Sans nom')"
            @click="onToggleHidden(pc.id)"
          >
            &#x2795;
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
/**
 * PcGroupPanel — Grille enrichie des personnages joueurs.
 * Affiche une carte par PJ avec traits, onglets Capacites/Inventaire/Notes,
 * et footer combat compact (HP/Stress/Armure/Espoir).
 */
import { computed, ref, nextTick, watch } from 'vue'
import { resolveCharacterDisplay } from '@modules/characters/composables/useCharacterComputed'
import { useCharacterStore } from '@modules/characters'
import { getDomainById } from '@data/domains/index.js'
import { useStorage } from '@core/composables/useStorage'
import PcInventoryEditor from './PcInventoryEditor.vue'
import DomainCardItem from '@modules/domains/components/DomainCardItem.vue'

export default {
  name: 'PcGroupPanel',

  components: {
    PcInventoryEditor,
    DomainCardItem
  },

  props: {
    characters: {
      type: Array,
      default: () => []
    }
  },

  emits: ['select-pc'],

  setup(props) {
    const characterStore = useCharacterStore()

    // ── Slider colonnes ──
    const cardColumns = useStorage('pc-group-columns', 0)
    // 0 = auto (responsive CSS), 1-4 = forcé
    const COLUMN_OPTIONS = [
      { value: 0, label: 'Auto' },
      { value: 1, label: '1' },
      { value: 2, label: '2' },
      { value: 3, label: '3' },
      { value: 4, label: '4' }
    ]

    const gridStyle = computed(() => {
      if (!cardColumns.value || cardColumns.value === 0) return {}
      return {
        'grid-template-columns': `repeat(${cardColumns.value}, 1fr)`
      }
    })

    // ── Personnages enrichis ──
    const enrichedCharacters = computed(() =>
      props.characters.map(resolveCharacterDisplay)
    )
    const visibleList = computed(() =>
      enrichedCharacters.value.filter((pc) => !pc.hidden)
    )
    const hiddenList = computed(() =>
      enrichedCharacters.value.filter((pc) => pc.hidden)
    )
    const showHidden = ref(false)

    function onToggleHidden(charId) {
      characterStore.toggleHidden(charId)
    }

    // ── Gestion interactive HP / Stress / Armure / Espoir ──

    function incrementHP(pc) {
      const newVal = Math.min(pc.effectiveMaxHP, (pc.currentHP || 0) + 1)
      characterStore.patchCharacterById(pc.id, { currentHP: newVal })
    }
    function decrementHP(pc) {
      const newVal = Math.max(0, (pc.currentHP || 0) - 1)
      characterStore.patchCharacterById(pc.id, { currentHP: newVal })
    }
    function incrementStress(pc) {
      const newVal = Math.min(pc.effectiveMaxStress, (pc.currentStress || 0) + 1)
      characterStore.patchCharacterById(pc.id, { currentStress: newVal })
    }
    function decrementStress(pc) {
      const newVal = Math.max(0, (pc.currentStress || 0) - 1)
      characterStore.patchCharacterById(pc.id, { currentStress: newVal })
    }
    function incrementArmor(pc) {
      const newVal = Math.min(pc.effectiveArmorScore, (pc.armorSlotsMarked || 0) + 1)
      characterStore.patchCharacterById(pc.id, { armorSlotsMarked: newVal })
    }
    function decrementArmor(pc) {
      const newVal = Math.max(0, (pc.armorSlotsMarked || 0) - 1)
      characterStore.patchCharacterById(pc.id, { armorSlotsMarked: newVal })
    }
    function incrementHope(pc) {
      const newVal = Math.min(6, (pc.hope || 0) + 1)
      characterStore.patchCharacterById(pc.id, { hope: newVal })
    }
    function decrementHope(pc) {
      const newVal = Math.max(0, (pc.hope || 0) - 1)
      characterStore.patchCharacterById(pc.id, { hope: newVal })
    }

    // ── Saisie directe (clic sur valeur) ──
    const editingStat = ref(null)
    const editingValue = ref('')

    function startEditStat(pcId, stat, currentValue) {
      editingStat.value = { pcId, stat }
      editingValue.value = String(currentValue)
    }
    function commitEditStat(pc) {
      if (!editingStat.value) return
      const val = parseInt(editingValue.value, 10)
      if (isNaN(val) || val < 0) {
        editingStat.value = null
        return
      }
      const { stat } = editingStat.value
      const maxMap = {
        currentHP: pc.effectiveMaxHP,
        currentStress: pc.effectiveMaxStress
      }
      const clamped = Math.min(maxMap[stat] || 99, Math.max(0, val))
      characterStore.patchCharacterById(pc.id, { [stat]: clamped })
      editingStat.value = null
    }
    function cancelEditStat() {
      editingStat.value = null
    }
    function isEditing(pcId, stat) {
      return editingStat.value?.pcId === pcId && editingStat.value?.stat === stat
    }

    watch(editingStat, (val) => {
      if (val) {
        nextTick(() => {
          const input = document.querySelector('.pc-card__stat-input')
          if (input) { input.focus(); input.select() }
        })
      }
    })

    // ── Notes avec debounce ──
    const notesTimers = {}
    function onNotesInput(pcId, value) {
      clearTimeout(notesTimers[pcId])
      notesTimers[pcId] = setTimeout(() => {
        characterStore.patchCharacterById(pcId, { notes: value })
      }, 500)
    }

    // ── Inventaire interactif ──
    function onAddItem(pcId, type) {
      characterStore.addInventoryItemById(pcId, type)
    }
    function onRemoveItem(pcId, index) {
      characterStore.removeInventoryItemById(pcId, index)
    }
    function onUpdateItem(pcId, index, field, value) {
      characterStore.updateInventoryItemById(pcId, index, field, value)
    }
    function onUpdateGold(pcId, tier, value) {
      characterStore.updateGoldById(pcId, tier, value)
    }
    function onUpdateEquipment(pcId, field, value) {
      characterStore.applySelectionById(pcId, field, value)
    }

    // ── Systeme d'onglets ──
    const CARD_TABS = [
      { id: 'capacites', label: 'Capacites', icon: '\u2728' },
      { id: 'domaines', label: 'Domaines', icon: '\uD83C\uDFB4' },
      { id: 'inventaire', label: 'Inventaire', icon: '\uD83C\uDF92' },
      { id: 'notes', label: 'Notes', icon: '\uD83D\uDCDD' }
    ]
    const activeTab = ref({})

    function getActiveTab(pcId) {
      return activeTab.value[pcId] || 'capacites'
    }
    function setActiveTab(pcId, tab) {
      activeTab.value = { ...activeTab.value, [pcId]: tab }
    }

    function tabHasContent(pc, tabId) {
      switch (tabId) {
        case 'capacites':
          return hasFeatures(pc)
        case 'domaines':
          return hasDomainCards(pc)
        case 'inventaire':
          return true
        case 'notes':
          return true
        default:
          return false
      }
    }

    function visibleTabs(pc) {
      return CARD_TABS.filter(t => tabHasContent(pc, t.id))
    }

    function navigateTab(pc, direction) {
      const tabs = visibleTabs(pc)
      const currentIdx = tabs.findIndex(t => t.id === getActiveTab(pc.id))
      const nextIdx = (currentIdx + direction + tabs.length) % tabs.length
      setActiveTab(pc.id, tabs[nextIdx].id)
      nextTick(() => {
        const el = document.getElementById('tab-' + pc.id + '-' + tabs[nextIdx].id)
        if (el) el.focus()
      })
    }

    // ── Helpers barres ──
    function hpColor(current, max) {
      if (!max || max === 0) return 'var(--color-text-muted)'
      const remaining = max - current
      const ratio = remaining / max
      if (ratio > 0.5) return 'var(--color-accent-success)'
      if (ratio > 0.25) return 'var(--color-accent-warning)'
      return 'var(--color-accent-danger)'
    }

    function stressColor(current, max) {
      if (!max || max === 0) return 'var(--color-text-muted)'
      const ratio = current / max
      if (ratio < 0.5) return 'var(--color-accent-success)'
      if (ratio < 0.75) return 'var(--color-accent-warning)'
      return 'var(--color-accent-danger)'
    }

    function traitSign(value) {
      const v = value || 0
      if (v > 0) return `+${v}`
      return `${v}`
    }

    // ── Conditions ──
    const CONDITION_LABELS = {
      vulnerable: { label: 'Vulnerable', color: 'var(--color-accent-danger)', desc: 'Les attaques contre cette cible gagnent un avantage.' },
      restrained: { label: 'Entrave', color: 'var(--color-accent-warning)', desc: 'Ne peut pas se deplacer ni utiliser d\'actions de mouvement.' },
      hidden: { label: 'Cache', color: 'var(--color-accent-info)', desc: 'Ne peut pas etre cible directement. Se revele en attaquant.' }
    }

    function conditionLabel(cond) {
      return CONDITION_LABELS[cond]?.label || cond
    }
    function conditionDesc(cond) {
      return CONDITION_LABELS[cond]?.desc || ''
    }
    function conditionStyle(cond) {
      return { '--condition-color': CONDITION_LABELS[cond]?.color || 'var(--color-text-muted)' }
    }

    // ── Traits ──
    const TRAIT_ABBR = {
      agility: 'AGI',
      strength: 'FOR',
      finesse: 'FIN',
      instinct: 'INS',
      presence: 'PRE',
      knowledge: 'SAV'
    }
    const TRAIT_ORDER = ['agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge']

    // ── Features ──
    function activationEmoji(type) {
      switch (type) {
        case 'action': return '\u{1F7E2}'
        case 'reaction': return '\u{1F7E0}'
        case 'passive': return '\u{1F535}'
        default: return ''
      }
    }

    function classFeaturesList(pc) {
      if (!pc.classData || !pc.classData.classFeatures) return []
      return pc.classData.classFeatures
    }

    function hasExperiences(pc) {
      return pc.experiences && pc.experiences.some(e => e.name)
    }

    function hasDomainCards(pc) {
      return (pc.loadoutCards && pc.loadoutCards.length > 0) ||
        (pc.vaultCards && pc.vaultCards.length > 0)
    }

    function domainColor(domainId) {
      if (!domainId) return '#53a8b6'
      const domain = getDomainById(domainId)
      return domain ? domain.color : '#53a8b6'
    }

    function hasFeatures(pc) {
      if (pc.classData && pc.classData.hopeFeature) return true
      if (pc.classData && pc.classData.classFeatures && pc.classData.classFeatures.length > 0) return true
      if (pc.ancestryData && (pc.ancestryData.topFeature || pc.ancestryData.bottomFeature)) return true
      if (pc.communityData && pc.communityData.feature) return true
      if (pc.subclassData) return true
      return false
    }

    return {
      enrichedCharacters,
      visibleList,
      hiddenList,
      showHidden,
      onToggleHidden,
      // Slider colonnes
      cardColumns, COLUMN_OPTIONS, gridStyle,
      // Gestion interactive
      incrementHP, decrementHP,
      incrementStress, decrementStress,
      incrementArmor, decrementArmor,
      incrementHope, decrementHope,
      // Saisie directe
      editingStat, editingValue,
      startEditStat, commitEditStat, cancelEditStat, isEditing,
      // Notes
      onNotesInput,
      // Inventaire interactif
      onAddItem, onRemoveItem, onUpdateItem, onUpdateGold, onUpdateEquipment,
      // Onglets
      activeTab, getActiveTab, setActiveTab,
      CARD_TABS, tabHasContent, visibleTabs, navigateTab,
      // Helpers
      hpColor, stressColor, traitSign,
      conditionLabel, conditionDesc, conditionStyle,
      TRAIT_ABBR, TRAIT_ORDER,
      activationEmoji, classFeaturesList, hasFeatures,
      hasExperiences, hasDomainCards, domainColor
    }
  }
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════
   PC GROUP — Container et en-tete
   ═══════════════════════════════════════════════ */

.pc-group__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}

.pc-group__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.pc-group__actions {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.pc-group__edit-link {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  min-height: var(--touch-min);
  display: inline-flex;
  align-items: center;
}

.pc-group__empty {
  color: var(--color-text-muted);
  padding: var(--space-lg) 0;
}

/* ═══════════════════════════════════════════════
   CONTROLE COLONNES
   ═══════════════════════════════════════════════ */

.pc-group__columns-control {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.pc-group__columns-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  min-width: 3em;
  text-align: right;
}

.pc-group__columns-slider {
  width: 80px;
  cursor: pointer;
  accent-color: var(--color-accent-primary);
}

/* ═══════════════════════════════════════════════
   GRILLE AUTO-RESPONSIVE
   ═══════════════════════════════════════════════ */

.pc-group__grid {
  display: grid;
  gap: var(--space-md);
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .pc-group__grid:not(.pc-group__grid--custom) {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1400px) {
  .pc-group__grid:not(.pc-group__grid--custom) {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ═══════════════════════════════════════════════
   PC CARD
   ═══════════════════════════════════════════════ */

.pc-card {
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.pc-card__body {
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* ── 1. Identite ── */

.pc-card__identity {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.pc-card__class-emoji {
  font-size: var(--font-size-lg);
}

.pc-card__name-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  text-align: left;
}

.pc-card__name-btn:hover .pc-card__name {
  text-decoration: underline;
}

.pc-card__name {
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
}

.pc-card__class-name {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pc-card__level-badge {
  font-size: var(--font-size-xs);
  color: var(--color-accent-hope);
  background: rgba(83, 168, 182, 0.15);
  padding: 1px var(--space-xs);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
}

.pc-card__subclass {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
}

/* ── 2. Meta ── */

.pc-card__meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* ── 3. Traits ── */

.pc-card__traits {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  text-align: center;
  gap: 2px;
}

.pc-card__trait {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-xs) 0;
  border-radius: var(--radius-sm);
  background: var(--color-bg-elevated);
}

.pc-card__trait-label {
  font-size: 0.625rem;
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.pc-card__trait-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
}

.pc-card__trait--positive .pc-card__trait-value {
  color: var(--color-accent-success);
}

.pc-card__trait--negative .pc-card__trait-value {
  color: var(--color-accent-fear);
}

.pc-card__trait--zero .pc-card__trait-value {
  color: var(--color-text-muted);
}

/* ── 4. Conditions ── */

.pc-card__conditions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.pc-card__condition {
  font-size: var(--font-size-xs);
  padding: 2px var(--space-sm);
  border-radius: var(--radius-full);
  border: 1px solid var(--condition-color, var(--color-text-muted));
  color: var(--condition-color, var(--color-text-muted));
  background: color-mix(in srgb, var(--condition-color, var(--color-text-muted)) 15%, transparent);
  font-weight: var(--font-weight-medium);
}

/* ── 5. Experiences ── */

.pc-card__experiences {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
}

.pc-card__experience {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: var(--font-size-xs);
  padding: 2px var(--space-sm);
  border-radius: var(--radius-full);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}

.pc-card__experience-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.pc-card__experience-bonus {
  font-size: 0.625rem;
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-success);
}

/* ═══════════════════════════════════════════════
   SYSTEME D'ONGLETS
   ═══════════════════════════════════════════════ */

.pc-card__tabs {
  border-top: 1px solid var(--color-border);
}

.pc-card__tablist {
  display: flex;
  background: var(--color-bg-elevated);
}

.pc-card__tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-xs);
  min-height: var(--touch-min);
  padding: var(--space-xs) var(--space-sm);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: color var(--transition-fast), border-color var(--transition-fast), background var(--transition-fast);
}

.pc-card__tab:hover {
  color: var(--color-text-secondary);
  background: var(--color-bg-hover);
}

.pc-card__tab--active {
  color: var(--color-accent-hope);
  border-bottom-color: var(--color-accent-hope);
}

.pc-card__tab--active:hover {
  color: var(--color-accent-hope);
}

.pc-card__tab-label {
  font-size: var(--font-size-xs);
}

.pc-card__tabpanel {
  padding: var(--space-sm) var(--space-md) var(--space-md);
}

/* ═══════════════════════════════════════════════
   CAPACITES / FEATURES
   ═══════════════════════════════════════════════ */

.pc-card__feature-group {
  margin-bottom: var(--space-md);
}

.pc-card__feature-group:last-child {
  margin-bottom: 0;
}

.pc-card__feature-source {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-hope);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: var(--space-xs);
  margin-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.pc-card__feature {
  border-left: 3px solid var(--color-border-active);
  padding-left: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.pc-card__feature--hope {
  border-left-color: var(--color-accent-hope);
}

.pc-card__feature-name {
  display: block;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  margin-bottom: 2px;
}

.pc-card__feature-desc {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  line-height: var(--line-height-normal);
}

/* ═══════════════════════════════════════════════
   INVENTAIRE
   ═══════════════════════════════════════════════ */

.pc-card__gold {
  font-size: var(--font-size-sm);
  color: var(--color-accent-gold);
  margin: 0 0 var(--space-sm);
}

.pc-card__equip-summary {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: var(--font-size-sm);
  margin-bottom: var(--space-sm);
}

.pc-card__equip-label {
  color: var(--color-text-muted);
}

.pc-card__equip-value {
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.pc-card__inventory-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pc-card__inventory-item {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) 0;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.pc-card__inventory-name {
  color: var(--color-text-primary);
}

.pc-card__inventory-qty {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

.pc-card__empty-tab {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
  font-style: italic;
  margin: var(--space-sm) 0 0;
}

/* ═══════════════════════════════════════════════
   NOTES
   ═══════════════════════════════════════════════ */

.pc-card__notes-textarea {
  width: 100%;
  min-height: 5rem;
  padding: var(--space-sm);
  background: var(--color-bg-input, var(--color-bg-elevated));
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-family: inherit;
  font-size: var(--font-size-sm);
  line-height: var(--line-height-normal);
  resize: vertical;
  outline: none;
  transition: border-color var(--transition-fast);
}

.pc-card__notes-textarea:focus {
  border-color: var(--color-accent-hope);
  box-shadow: 0 0 0 2px rgba(83, 168, 182, 0.2);
}

.pc-card__notes-textarea::placeholder {
  color: var(--color-text-muted);
}

/* ═══════════════════════════════════════════════
   DOMAINES
   ═══════════════════════════════════════════════ */

.pc-card__domain-section {
  margin-bottom: var(--space-md);
}

.pc-card__domain-section:last-child {
  margin-bottom: 0;
}

.pc-card__domain-section-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  color: var(--color-accent-hope);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: var(--space-xs);
  margin-bottom: var(--space-sm);
  border-bottom: 1px solid var(--color-border);
}

.pc-card__domain-section-title--vault {
  color: var(--color-text-muted);
}

.pc-card__domain-grid {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

/* ═══════════════════════════════════════════════
   FOOTER COMBAT COMPACT
   ═══════════════════════════════════════════════ */

.pc-card__combat-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs);
  padding: var(--space-xs) var(--space-sm);
  background: var(--color-bg-elevated);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
}

.pc-card__stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 2px var(--space-xs);
  border-radius: var(--radius-full);
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
}

.pc-card__stat-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  white-space: nowrap;
  padding: 0 2px;
}

.pc-card__stat-text--clickable {
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast);
}

.pc-card__stat-text--clickable:hover {
  background: var(--color-bg-hover);
}

.pc-card__stat-btn-sm {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  border-radius: var(--radius-full);
  cursor: pointer;
  padding: 0;
  line-height: 1;
  transition: background var(--transition-fast), color var(--transition-fast);
}

.pc-card__stat-btn-sm:hover:not(:disabled) {
  background: var(--color-bg-hover);
  color: var(--color-text-primary);
}

.pc-card__stat-btn-sm:disabled {
  opacity: 0.25;
  cursor: not-allowed;
}

.pc-card__stat-readonly {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 2px var(--space-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  margin-left: auto;
}

.pc-card__stat-sep {
  color: var(--color-border);
}

.pc-card__stat-input {
  width: 42px;
  background: var(--color-bg-input, var(--color-bg-elevated));
  color: var(--color-text-primary);
  border: 1px solid var(--color-accent-hope);
  border-radius: var(--radius-sm);
  padding: 1px 2px;
  font-size: var(--font-size-xs);
  font-family: inherit;
  text-align: center;
  outline: none;
}

.pc-card__stat-input:focus {
  box-shadow: 0 0 0 2px rgba(83, 168, 182, 0.3);
}

.pc-card__stat-input::-webkit-inner-spin-button,
.pc-card__stat-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.pc-card__stat-input[type=number] {
  -moz-appearance: textfield;
}

/* ═══════════════════════════════════════════════
   BOUTON MASQUER (oeil)
   ═══════════════════════════════════════════════ */

.pc-card__hide-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.4rem;
  height: 1.4rem;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  font-size: 0.7rem;
  cursor: pointer;
  opacity: 0.3;
  transition: opacity 0.15s, background 0.15s;
  flex-shrink: 0;
}

.pc-card__hide-btn:hover {
  opacity: 0.8;
  background: rgba(255, 255, 255, 0.08);
}

/* ═══════════════════════════════════════════════
   BANDEAU PJs MASQUES
   ═══════════════════════════════════════════════ */

.pc-group__hidden-bar {
  margin-top: var(--space-sm);
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-bg-secondary);
}

.pc-group__hidden-toggle {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  width: 100%;
  padding: var(--space-xs) var(--space-sm);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: color 0.15s;
}

.pc-group__hidden-toggle:hover {
  color: var(--color-text-secondary);
}

.pc-group__hidden-chevron {
  margin-left: auto;
  font-size: 0.6rem;
}

.pc-group__hidden-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  padding: 0 var(--space-sm) var(--space-sm);
}

.pc-group__hidden-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 3px var(--space-sm);
  background: var(--color-bg-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.pc-group__hidden-restore {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  height: 1.2rem;
  padding: 0;
  border: none;
  border-radius: var(--radius-full);
  background: transparent;
  font-size: 0.6rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.pc-group__hidden-restore:hover {
  opacity: 1;
}
</style>
