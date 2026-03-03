/**
 * @module characters/stores/characterStore
 * @description Store Pinia pour la gestion des fiches de personnages.
 * Supporte jusqu'à 8 PJ avec persistance LocalStorage.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  CLASSES,
  TRAITS,
  CONDITIONS,
  MAX_HP,
  MAX_STRESS,
  MAX_HOPE,
  MAX_CHARACTERS,
  getClassById,
  createDefaultCharacter
} from '@data/classes'
import { getSubclassesForClass, getSubclassById } from '@data/subclasses'
import { ALL_ANCESTRIES, getAncestryById } from '@data/ancestries'
import { COMMUNITIES, getCommunityById } from '@data/communities'
import { ARMOR, getArmorById, PRIMARY_WEAPONS, SECONDARY_WEAPONS, getPrimaryWeaponById, getSecondaryWeaponById } from '@data/equipment'
import { useStorage } from '@core/composables/useStorage'

export const useCharacterStore = defineStore('characters', () => {
  // ── Persistence ────────────────────────────────────────
  const storage = useStorage('characters', [])

  // ── État ────────────────────────────────────────────────
  const characters = ref([])
  const selectedCharacterId = ref(null)

  // ── Constantes ─────────────────────────────────────────
  const availableClasses = CLASSES
  const availableTraits = TRAITS
  const availableConditions = CONDITIONS
  const maxCharacters = MAX_CHARACTERS

  // ── Init : charger depuis persistence ──────────────────
  function init() {
    const saved = storage.data.value
    if (Array.isArray(saved) && saved.length > 0) {
      characters.value = saved.map(sanitizeCharacter)
    }
  }

  init()

  // ── Getters ────────────────────────────────────────────

  /** Personnage sélectionné */
  const selectedCharacter = computed(() => {
    if (!selectedCharacterId.value) return null
    return characters.value.find((c) => c.id === selectedCharacterId.value) || null
  })

  /** Nombre de personnages */
  const characterCount = computed(() => characters.value.length)

  /** Peut-on encore ajouter des PJ ? */
  const canAddCharacter = computed(() => characters.value.length < MAX_CHARACTERS)

  /** Personnage sélectionné : données de classe SRD */
  const selectedCharacterClass = computed(() => {
    if (!selectedCharacter.value) return null
    return getClassById(selectedCharacter.value.classId)
  })

  /**
   * Seuils de dégâts effectifs du personnage sélectionné.
   * = base thresholds armure + niveau du personnage
   */
  const selectedThresholds = computed(() => {
    const char = selectedCharacter.value
    if (!char) return { major: 0, severe: 0 }
    return {
      major: (char.armorBaseThresholds?.major || 0) + char.level,
      severe: (char.armorBaseThresholds?.severe || 0) + char.level
    }
  })

  /**
   * Évasion effective = base évasion + bonus
   */
  const selectedEffectiveEvasion = computed(() => {
    const char = selectedCharacter.value
    if (!char) return 0
    return char.evasion + (char.evasionBonus || 0)
  })

  // ── Données de sélection (pour les déroulants) ──────────

  /** Sous-classes disponibles pour la classe du personnage sélectionné */
  const availableSubclasses = computed(() => {
    const char = selectedCharacter.value
    if (!char) return []
    return getSubclassesForClass(char.classId)
  })

  /** Donnée de la sous-classe sélectionnée */
  const selectedSubclassData = computed(() => {
    const char = selectedCharacter.value
    if (!char || !char.subclassId) return null
    return getSubclassById(char.classId, char.subclassId)
  })

  /** Donnée de l'ascendance sélectionnée */
  const selectedAncestryData = computed(() => {
    const char = selectedCharacter.value
    if (!char || !char.ancestryId) return null
    return getAncestryById(char.ancestryId)
  })

  /** Donnée de la communauté sélectionnée */
  const selectedCommunityData = computed(() => {
    const char = selectedCharacter.value
    if (!char || !char.communityId) return null
    return getCommunityById(char.communityId)
  })

  /** Donnée de l'armure sélectionnée */
  const selectedArmorData = computed(() => {
    const char = selectedCharacter.value
    if (!char || !char.armorId) return null
    return getArmorById(char.armorId)
  })

  /** Donnée de l'arme primaire sélectionnée */
  const selectedPrimaryWeaponData = computed(() => {
    const char = selectedCharacter.value
    if (!char || !char.primaryWeaponId) return null
    return getPrimaryWeaponById(char.primaryWeaponId)
  })

  /** Donnée de l'arme secondaire sélectionnée */
  const selectedSecondaryWeaponData = computed(() => {
    const char = selectedCharacter.value
    if (!char || !char.secondaryWeaponId) return null
    return getSecondaryWeaponById(char.secondaryWeaponId)
  })

  /** Listes de référence pour les déroulants */
  const allAncestries = ALL_ANCESTRIES
  const allCommunities = COMMUNITIES
  const allArmor = ARMOR
  const allPrimaryWeapons = PRIMARY_WEAPONS
  const allSecondaryWeapons = SECONDARY_WEAPONS

  // ── Actions de sélection ────────────────────────────────

  /**
   * Applique une sélection d'équipement et met à jour les champs dérivés.
   * @param {'subclassId'|'ancestryId'|'communityId'|'armorId'|'primaryWeaponId'|'secondaryWeaponId'} field
   * @param {string} value - L'ID sélectionné (ou '' pour désélectionner)
   */
  function applySelection(field, value) {
    const char = selectedCharacter.value
    if (!char) return

    char[field] = value
    char.updatedAt = new Date().toISOString()

    // Appliquer les modifications dérivées selon le type de sélection
    try {
      switch (field) {
        case 'subclassId': {
          const sub = getSubclassById(char.classId, value)
          char.subclass = sub ? sub.name : ''
          break
        }
        case 'armorId': {
          const armor = getArmorById(value)
          if (armor) {
            char.armorName = armor.name
            char.armorBaseThresholds = { major: armor.thresholds.major, severe: armor.thresholds.severe }
            char.armorScore = armor.baseScore
            char.armorSlotsMarked = 0
            // Appliquer les modificateurs d'évasion de l'armure
            let armorEvasionBonus = 0
            if (armor.featureKey === 'Flexible') armorEvasionBonus = 1
            else if (armor.featureKey === 'Heavy') armorEvasionBonus = -1
            else if (armor.featureKey === 'Very Heavy') armorEvasionBonus = -2
            char.evasionBonus = armorEvasionBonus
          } else {
            char.armorName = ''
            char.armorBaseThresholds = { major: 0, severe: 0 }
            char.armorScore = 0
            char.armorSlotsMarked = 0
            char.evasionBonus = 0
          }
          break
        }
        case 'primaryWeaponId': {
          const wpn = getPrimaryWeaponById(value)
          if (wpn) {
            char.primaryWeapon = {
              name: wpn.name,
              trait: wpn.trait,
              range: wpn.range,
              damage: wpn.damage,
              feature: wpn.feature || ''
            }
          } else {
            char.primaryWeapon = { name: '', trait: '', range: '', damage: '', feature: '' }
          }
          break
        }
        case 'secondaryWeaponId': {
          const wpn = getSecondaryWeaponById(value)
          if (wpn) {
            char.secondaryWeapon = {
              name: wpn.name,
              trait: wpn.trait,
              range: wpn.range,
              damage: wpn.damage,
              feature: wpn.feature || ''
            }
          } else {
            char.secondaryWeapon = { name: '', trait: '', range: '', damage: '', feature: '' }
          }
          break
        }
        // ancestryId et communityId ne modifient pas directement les stats
        default:
          break
      }
    } catch (err) {
      console.error(`[characterStore] applySelection error for ${field}:`, err)
    }

    persist()
  }

  // ── Actions ────────────────────────────────────────────

  /**
   * Crée un nouveau personnage à partir d'une classe.
   * @param {string} classId
   * @returns {string|null} ID du personnage créé
   */
  function createCharacter(classId) {
    if (characters.value.length >= MAX_CHARACTERS) return null
    const char = createDefaultCharacter(classId)
    if (!char) return null
    characters.value.push(char)
    selectedCharacterId.value = char.id
    persist()
    return char.id
  }

  /**
   * Supprime un personnage.
   * @param {string} charId
   */
  function deleteCharacter(charId) {
    characters.value = characters.value.filter((c) => c.id !== charId)
    if (selectedCharacterId.value === charId) {
      selectedCharacterId.value = characters.value[0]?.id || null
    }
    persist()
  }

  /**
   * Sélectionne un personnage par ID.
   * @param {string} charId
   */
  function selectCharacter(charId) {
    if (characters.value.some((c) => c.id === charId)) {
      selectedCharacterId.value = charId
    }
  }

  /**
   * Met à jour un champ du personnage sélectionné.
   * Supporte les clés imbriquées via dot notation : 'traits.agility', 'gold.handfuls'
   * @param {string} path - Clé du champ (ex: 'name', 'traits.agility')
   * @param {*} value
   */
  function updateField(path, value) {
    const char = selectedCharacter.value
    if (!char) return

    const keys = path.split('.')
    let target = char
    for (let i = 0; i < keys.length - 1; i++) {
      target = target[keys[i]]
      if (target === undefined || target === null) return
    }
    target[keys[keys.length - 1]] = value
    char.updatedAt = new Date().toISOString()
    persist()
  }

  // ── HP / Stress / Armor Slots ──────────────────────────

  /**
   * Marque des HP (augmente currentHP, max = maxHP).
   * @param {number} [count=1]
   */
  function markHP(count = 1) {
    const char = selectedCharacter.value
    if (!char) return
    char.currentHP = Math.min(char.maxHP, char.currentHP + count)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /**
   * Efface des HP (diminue currentHP, min 0).
   * @param {number} [count=1]
   */
  function clearHP(count = 1) {
    const char = selectedCharacter.value
    if (!char) return
    char.currentHP = Math.max(0, char.currentHP - count)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /** Marque du Stress */
  function markStress(count = 1) {
    const char = selectedCharacter.value
    if (!char) return
    char.currentStress = Math.min(char.maxStress, char.currentStress + count)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /** Efface du Stress */
  function clearStress(count = 1) {
    const char = selectedCharacter.value
    if (!char) return
    char.currentStress = Math.max(0, char.currentStress - count)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /** Marque un slot d'armure */
  function markArmor(count = 1) {
    const char = selectedCharacter.value
    if (!char) return
    char.armorSlotsMarked = Math.min(char.armorScore, char.armorSlotsMarked + count)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /** Efface un slot d'armure */
  function clearArmor(count = 1) {
    const char = selectedCharacter.value
    if (!char) return
    char.armorSlotsMarked = Math.max(0, char.armorSlotsMarked - count)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /** Modifie la Hope */
  function setHope(value) {
    const char = selectedCharacter.value
    if (!char) return
    char.hope = Math.max(0, Math.min(MAX_HOPE, value))
    char.updatedAt = new Date().toISOString()
    persist()
  }

  // ── Conditions ─────────────────────────────────────────

  /** Ajoute une condition */
  function addCondition(conditionId) {
    const char = selectedCharacter.value
    if (!char) return
    if (!char.conditions.includes(conditionId)) {
      char.conditions.push(conditionId)
      char.updatedAt = new Date().toISOString()
      persist()
    }
  }

  /** Retire une condition */
  function removeCondition(conditionId) {
    const char = selectedCharacter.value
    if (!char) return
    char.conditions = char.conditions.filter((c) => c !== conditionId)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  // ── Expériences ────────────────────────────────────────

  /** Ajoute une expérience */
  function addExperience() {
    const char = selectedCharacter.value
    if (!char) return
    char.experiences.push({ name: '', bonus: 0 })
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /** Supprime une expérience par index */
  function removeExperience(index) {
    const char = selectedCharacter.value
    if (!char || index < 0 || index >= char.experiences.length) return
    char.experiences.splice(index, 1)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  // ── Inventaire ─────────────────────────────────────────

  /** Ajoute un objet à l'inventaire */
  function addInventoryItem(item = '') {
    const char = selectedCharacter.value
    if (!char) return
    char.inventory.push(item)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /** Supprime un objet de l'inventaire */
  function removeInventoryItem(index) {
    const char = selectedCharacter.value
    if (!char || index < 0 || index >= char.inventory.length) return
    char.inventory.splice(index, 1)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  // ── Max HP/Stress adjustment (level ups) ───────────────

  /** Augmente le max HP (level up) */
  function increaseMaxHP() {
    const char = selectedCharacter.value
    if (!char || char.maxHP >= MAX_HP) return
    char.maxHP++
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /** Augmente le max Stress (level up) */
  function increaseMaxStress() {
    const char = selectedCharacter.value
    if (!char || char.maxStress >= MAX_STRESS) return
    char.maxStress++
    char.updatedAt = new Date().toISOString()
    persist()
  }

  // ── Utilitaires ────────────────────────────────────────

  function persist() {
    storage.save(characters.value)
  }

  /**
   * Assure qu'un personnage chargé a tous les champs requis.
   * Gère la rétrocompatibilité.
   */
  function sanitizeCharacter(raw) {
    const defaults = createDefaultCharacter(raw.classId || 'warrior') || {}
    return { ...defaults, ...raw }
  }

  /** Réinitialise tout */
  function resetAll() {
    characters.value = []
    selectedCharacterId.value = null
    persist()
  }

  return {
    // État
    characters,
    selectedCharacterId,

    // Constantes
    availableClasses,
    availableTraits,
    availableConditions,
    maxCharacters,

    // Getters
    selectedCharacter,
    characterCount,
    canAddCharacter,
    selectedCharacterClass,
    selectedThresholds,
    selectedEffectiveEvasion,

    // Getters de sélection
    availableSubclasses,
    selectedSubclassData,
    selectedAncestryData,
    selectedCommunityData,
    selectedArmorData,
    selectedPrimaryWeaponData,
    selectedSecondaryWeaponData,

    // Listes de référence
    allAncestries,
    allCommunities,
    allArmor,
    allPrimaryWeapons,
    allSecondaryWeapons,

    // Actions CRUD
    createCharacter,
    deleteCharacter,
    selectCharacter,
    updateField,
    applySelection,

    // Actions HP/Stress/Armor
    markHP,
    clearHP,
    markStress,
    clearStress,
    markArmor,
    clearArmor,
    setHope,

    // Actions Conditions
    addCondition,
    removeCondition,

    // Actions Expériences
    addExperience,
    removeExperience,

    // Actions Inventaire
    addInventoryItem,
    removeInventoryItem,

    // Actions level up
    increaseMaxHP,
    increaseMaxStress,

    // Utilitaires
    persist,
    resetAll
  }
})
