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
  getMaxLoadout,
  MAX_CHARACTERS,
  getClassById,
  createDefaultCharacter
} from '@data/classes'
import { getSubclassesForClass, getSubclassById } from '@data/subclasses'
import { ALL_ANCESTRIES, getAncestryById } from '@data/ancestries'
import { COMMUNITIES, getCommunityById } from '@data/communities'
import { ARMOR, getArmorById, PRIMARY_WEAPONS, SECONDARY_WEAPONS, getPrimaryWeaponById, getSecondaryWeaponById } from '@data/equipment'
import { computeStatBonuses } from '@data/statModifiers'
import { getDomainsForClass, getCardById } from '@data/domains'
import { useStorage } from '@core/composables/useStorage'
import { useAncestryHomebrewStore } from '@modules/homebrew/categories/ancestry/useAncestryHomebrewStore.js'

export { useAncestryHomebrewStore }

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

  // ── Bonus de stats (ascendance + sous-classe) ──────────

  /**
   * Bonus agrégés de l'ascendance et de la sous-classe sélectionnées.
   * Recalculé automatiquement quand ancestryId, subclassId, level ou proficiency changent.
   */
  const selectedStatBonuses = computed(() => {
    const char = selectedCharacter.value
    if (!char) return { maxHP: 0, maxStress: 0, evasion: 0, thresholds: { major: 0, severe: 0 }, sources: [] }
    return computeStatBonuses(char)
  })

  /**
   * Max HP effectif = base classe + bonus ascendance/sous-classe.
   */
  const selectedEffectiveMaxHP = computed(() => {
    const char = selectedCharacter.value
    if (!char) return 0
    const cls = getClassById(char.classId)
    const baseHP = cls ? cls.baseHP : 6
    return baseHP + selectedStatBonuses.value.maxHP
  })

  /**
   * Max Stress effectif = base classe + bonus ascendance/sous-classe.
   */
  const selectedEffectiveMaxStress = computed(() => {
    const char = selectedCharacter.value
    if (!char) return 0
    const cls = getClassById(char.classId)
    const baseStress = cls ? cls.baseStress : 6
    return baseStress + selectedStatBonuses.value.maxStress
  })

  /**
   * Seuils de dégâts effectifs du personnage sélectionné.
   * = base thresholds armure + niveau du personnage + bonus ascendance/sous-classe
   */
  const selectedThresholds = computed(() => {
    const char = selectedCharacter.value
    if (!char) return { major: 0, severe: 0 }
    const bonuses = selectedStatBonuses.value
    return {
      major: (char.armorBaseThresholds?.major || 0) + char.level + bonuses.thresholds.major,
      severe: (char.armorBaseThresholds?.severe || 0) + char.level + bonuses.thresholds.severe
    }
  })

  /**
   * Évasion effective = base évasion + bonus armure + bonus ascendance/sous-classe
   */
  const selectedEffectiveEvasion = computed(() => {
    const char = selectedCharacter.value
    if (!char) return 0
    const bonuses = selectedStatBonuses.value
    return char.evasion + (char.evasionBonus || 0) + bonuses.evasion
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
  // ── Store Homebrew Ancestry ────────────────────────────
  const ancestryHomebrewStore = useAncestryHomebrewStore()

  const allAncestries = computed(() => [
    ...ALL_ANCESTRIES,
    ...ancestryHomebrewStore.items.map((item) => ({
      ...item,
      source: 'custom'
    }))
  ])
  const allCommunities = COMMUNITIES
  const allArmor = ARMOR
  const allPrimaryWeapons = PRIMARY_WEAPONS
  const allSecondaryWeapons = SECONDARY_WEAPONS

  // ── Cartes de domaine ───────────────────────────────────

  /** Domaines disponibles pour la classe du personnage sélectionné */
  const availableDomains = computed(() => {
    const char = selectedCharacter.value
    if (!char) return []
    return getDomainsForClass(char.className)
  })

  /**
   * Cartes de domaine éligibles pour le personnage sélectionné.
   * Filtrées par : domaines de la classe + niveau <= niveau du personnage.
   */
  const availableDomainCards = computed(() => {
    const char = selectedCharacter.value
    if (!char) return []
    const domains = getDomainsForClass(char.className)
    const results = []
    for (const domain of domains) {
      for (const card of domain.cards) {
        if (card.level <= char.level) {
          results.push({ ...card, domainId: domain.id, domainName: domain.name, domainColor: domain.color, domainEmoji: domain.emoji })
        }
      }
    }
    return results
  })

  /** Données complètes des cartes du loadout du personnage sélectionné */
  const selectedLoadoutCards = computed(() => {
    const char = selectedCharacter.value
    if (!char || !char.domainCards) return []
    return char.domainCards.loadout
      .map((cardId) => {
        const data = getCardById(cardId)
        if (!data) return null
        const domains = getDomainsForClass(char.className)
        const domain = domains.find((d) => d.id === data.domain)
        return { ...data, domainColor: domain?.color || '#53a8b6', domainName: domain?.name || '', domainEmoji: domain?.emoji || '' }
      })
      .filter(Boolean)
  })

  /** Données complètes des cartes du vault du personnage sélectionné */
  const selectedVaultCards = computed(() => {
    const char = selectedCharacter.value
    if (!char || !char.domainCards) return []
    return char.domainCards.vault
      .map((cardId) => {
        const data = getCardById(cardId)
        if (!data) return null
        const domains = getDomainsForClass(char.className)
        const domain = domains.find((d) => d.id === data.domain)
        return { ...data, domainColor: domain?.color || '#53a8b6', domainName: domain?.name || '', domainEmoji: domain?.emoji || '' }
      })
      .filter(Boolean)
  })

  /** Nombre de cartes de domaine supplémentaires choisies en avancement */
  const bonusDomainCardsFromAdvancements = computed(() => {
    const char = selectedCharacter.value
    if (!char || !Array.isArray(char.levelHistory)) return 0
    let count = 0
    for (const entry of char.levelHistory) {
      if (!Array.isArray(entry.advancements)) continue
      for (const adv of entry.advancements) {
        if (adv.type === 'domain_card') count++
      }
    }
    return count
  })

  /** Nombre de cartes de domaine supplémentaires octroyées par la sous-classe */
  const bonusDomainCardsFromSubclass = computed(() => {
    const char = selectedCharacter.value
    if (!char || !char.subclassId) return 0
    const sub = getSubclassById(char.classId, char.subclassId)
    if (!sub || !sub.domainCardBonuses) return 0
    const prog = char.subclassProgression || 'foundation'
    let count = sub.domainCardBonuses.foundation || 0
    if (prog === 'specialization' || prog === 'mastery') {
      count += sub.domainCardBonuses.specialization || 0
    }
    if (prog === 'mastery') {
      count += sub.domainCardBonuses.mastery || 0
    }
    return count
  })

  /** Nombre max de cartes dans le loadout selon le niveau + tous les bonus */
  const selectedMaxLoadout = computed(() => {
    const char = selectedCharacter.value
    if (!char) return getMaxLoadout(1, 0)
    const totalBonus = bonusDomainCardsFromAdvancements.value + bonusDomainCardsFromSubclass.value
    return getMaxLoadout(char.level, totalBonus)
  })

  /** Le loadout est-il plein ? (dynamique selon le niveau) */
  const isLoadoutFull = computed(() => {
    const char = selectedCharacter.value
    if (!char || !char.domainCards) return false
    return char.domainCards.loadout.length >= selectedMaxLoadout.value
  })

  // ── Actions de sélection ────────────────────────────────

  /**
   * Synchronise maxHP et maxStress du personnage selon les bonus courants.
   * Appelé après chaque changement d'ascendance, sous-classe ou niveau.
   * @param {Object} char - Personnage mutable
   */
  function _syncDerivedStats(char) {
    if (!char) return
    const cls = getClassById(char.classId)
    if (!cls) return
    const bonuses = computeStatBonuses(char)
    char.maxHP = cls.baseHP + bonuses.maxHP
    char.maxStress = cls.baseStress + bonuses.maxStress
  }

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
        // ancestryId et communityId : recalculer les stats dérivées
        case 'ancestryId':
        case 'subclassId':
          // Recalculer maxHP et maxStress avec les nouveaux bonus
          _syncDerivedStats(char)
          if (field === 'subclassId') {
            const sub = getSubclassById(char.classId, value)
            char.subclass = sub ? sub.name : ''
          }
          break
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

    // Recalculer les stats dérivées si le niveau ou la proficiency change
    if (path === 'level' || path === 'proficiency') {
      _syncDerivedStats(char)
    }

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

  // ── Cartes de domaine ──────────────────────────────────

  /**
   * Assure la structure domainCards sur le personnage.
   * @param {Object} char
   */
  function _ensureDomainCards(char) {
    if (!char.domainCards) {
      char.domainCards = { loadout: [], vault: [] }
    }
    if (!Array.isArray(char.domainCards.loadout)) char.domainCards.loadout = []
    if (!Array.isArray(char.domainCards.vault)) char.domainCards.vault = []
  }

  /**
   * Ajoute une carte de domaine au loadout.
   * @param {string} cardId
   * @returns {boolean} true si ajouté
   */
  function addCardToLoadout(cardId) {
    const char = selectedCharacter.value
    if (!char) return false
    _ensureDomainCards(char)
    if (char.domainCards.loadout.length >= selectedMaxLoadout.value) return false
    if (char.domainCards.loadout.includes(cardId)) return false
    // Retirer du vault si présent
    char.domainCards.vault = char.domainCards.vault.filter((id) => id !== cardId)
    char.domainCards.loadout.push(cardId)
    char.updatedAt = new Date().toISOString()
    persist()
    return true
  }

  /**
   * Ajoute une carte de domaine au vault.
   * @param {string} cardId
   * @returns {boolean} true si ajouté
   */
  function addCardToVault(cardId) {
    const char = selectedCharacter.value
    if (!char) return false
    _ensureDomainCards(char)
    if (char.domainCards.vault.includes(cardId)) return false
    // Retirer du loadout si présent
    char.domainCards.loadout = char.domainCards.loadout.filter((id) => id !== cardId)
    char.domainCards.vault.push(cardId)
    char.updatedAt = new Date().toISOString()
    persist()
    return true
  }

  /**
   * Déplace une carte du vault vers le loadout.
   * @param {string} cardId
   * @returns {boolean}
   */
  function moveCardToLoadout(cardId) {
    const char = selectedCharacter.value
    if (!char) return false
    _ensureDomainCards(char)
    if (char.domainCards.loadout.length >= selectedMaxLoadout.value) return false
    if (!char.domainCards.vault.includes(cardId)) return false
    char.domainCards.vault = char.domainCards.vault.filter((id) => id !== cardId)
    char.domainCards.loadout.push(cardId)
    char.updatedAt = new Date().toISOString()
    persist()
    return true
  }

  /**
   * Déplace une carte du loadout vers le vault.
   * @param {string} cardId
   * @returns {boolean}
   */
  function moveCardToVault(cardId) {
    const char = selectedCharacter.value
    if (!char) return false
    _ensureDomainCards(char)
    if (!char.domainCards.loadout.includes(cardId)) return false
    char.domainCards.loadout = char.domainCards.loadout.filter((id) => id !== cardId)
    char.domainCards.vault.push(cardId)
    char.updatedAt = new Date().toISOString()
    persist()
    return true
  }

  /**
   * Retire complètement une carte (du loadout ou du vault).
   * @param {string} cardId
   */
  function removeCard(cardId) {
    const char = selectedCharacter.value
    if (!char) return
    _ensureDomainCards(char)
    char.domainCards.loadout = char.domainCards.loadout.filter((id) => id !== cardId)
    char.domainCards.vault = char.domainCards.vault.filter((id) => id !== cardId)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /**
   * Vérifie si une carte est déjà acquise (loadout ou vault).
   * @param {string} cardId
   * @returns {boolean}
   */
  function hasCard(cardId) {
    const char = selectedCharacter.value
    if (!char || !char.domainCards) return false
    return char.domainCards.loadout.includes(cardId) || char.domainCards.vault.includes(cardId)
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
    selectedStatBonuses,
    selectedEffectiveMaxHP,
    selectedEffectiveMaxStress,

    // Getters de sélection
    availableSubclasses,
    selectedSubclassData,
    selectedAncestryData,
    selectedCommunityData,
    selectedArmorData,
    selectedPrimaryWeaponData,
    selectedSecondaryWeaponData,

    // Getters domaines
    availableDomains,
    availableDomainCards,
    selectedLoadoutCards,
    selectedVaultCards,
    isLoadoutFull,
    selectedMaxLoadout,

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

    // Actions cartes de domaine
    addCardToLoadout,
    addCardToVault,
    moveCardToLoadout,
    moveCardToVault,
    removeCard,
    hasCard,

    // Utilitaires
    persist,
    resetAll
  }
})
