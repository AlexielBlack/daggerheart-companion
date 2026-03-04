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
import { DOMAIN_CARD_MODIFIERS, isTouchedActive } from '@data/domainCardModifiers'
import { getDomainsForClass, getCardById, getDomainById } from '@data/domains'
import { useStorage } from '@core/composables/useStorage'
import { useAncestryHomebrewStore } from '@modules/homebrew/categories/ancestry/useAncestryHomebrewStore.js'
import { useClassHomebrewStore } from '@modules/homebrew/categories/class/useClassHomebrewStore.js'

export { useAncestryHomebrewStore, useClassHomebrewStore }

export const useCharacterStore = defineStore('characters', () => {
  // ── Persistence ────────────────────────────────────────
  const storage = useStorage('characters', [])

  // ── État ────────────────────────────────────────────────
  const characters = ref([])
  const selectedCharacterId = ref(null)

  // ── Constantes ─────────────────────────────────────────
  const availableTraits = TRAITS
  const availableConditions = CONDITIONS
  const maxCharacters = MAX_CHARACTERS

  // ── Homebrew classes ─────────────────────────────────────
  const classHomebrewStore = useClassHomebrewStore()

  /**
   * Normalise un item homebrew au format attendu par CharacterSheet.
   * @param {Object} item - Item du store homebrew
   * @returns {Object} Classe normalisée (compatible SRD)
   */
  function normalizeHomebrewClass(item) {
    return {
      id: item.id,
      name: item.name,
      emoji: item.emoji || '🛠️',
      domains: item.domains || [],
      baseEvasion: item.baseEvasion || 10,
      baseHP: item.baseHP || 6,
      baseStress: item.baseStress || 6,
      hopeFeature: item.hopeFeature || '',
      classFeatures: (item.classFeatures || []).map(
        (f) => (typeof f === 'string' ? f : `${f.name} : ${f.description}`)
      ),
      suggestedTraits: item.suggestedTraits || { agility: 0, strength: 0, finesse: 0, instinct: 0, presence: 0, knowledge: 0 },
      suggestedArmor: item.suggestedArmor || '',
      source: 'custom'
    }
  }

  /** Toutes les classes : SRD + homebrew normalisées */
  const allClasses = computed(() => [
    ...CLASSES,
    ...classHomebrewStore.items.map(normalizeHomebrewClass)
  ])

  /**
   * Résout une classe par ID : SRD d'abord, puis homebrew.
   * @param {string} id
   * @returns {Object|null}
   */
  function resolveClass(id) {
    if (!id) return null
    // SRD (rapide)
    const srd = getClassById(id)
    if (srd) return srd
    // Homebrew
    const hb = classHomebrewStore.items.find((c) => c.id === id)
    return hb ? normalizeHomebrewClass(hb) : null
  }

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

  /** Personnage sélectionné : données de classe (SRD ou homebrew) */
  const selectedCharacterClass = computed(() => {
    if (!selectedCharacter.value) return null
    return resolveClass(selectedCharacter.value.classId)
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
    const cls = resolveClass(char.classId)
    const baseHP = cls ? cls.baseHP : 6
    return baseHP + selectedStatBonuses.value.maxHP
  })

  /**
   * Max Stress effectif = base classe + bonus ascendance/sous-classe.
   */
  const selectedEffectiveMaxStress = computed(() => {
    const char = selectedCharacter.value
    if (!char) return 0
    const cls = resolveClass(char.classId)
    const baseStress = cls ? cls.baseStress : 6
    return baseStress + selectedStatBonuses.value.maxStress
  })

  /**
   * Seuils de dégâts effectifs du personnage sélectionné.
   * Priorité : Bare Bones override (sans armure) > base armure + niveau + bonus
   */
  const selectedThresholds = computed(() => {
    const char = selectedCharacter.value
    if (!char) return { major: 0, severe: 0 }
    const bonuses = selectedStatBonuses.value
    // Si Bare Bones override est actif (pas d'armure + carte dans loadout)
    if (bonuses.thresholdsOverride) {
      return {
        major: bonuses.thresholdsOverride.major + bonuses.thresholds.major,
        severe: bonuses.thresholdsOverride.severe + bonuses.thresholds.severe
      }
    }
    return {
      major: (char.armorBaseThresholds?.major || 0) + char.level + bonuses.thresholds.major,
      severe: (char.armorBaseThresholds?.severe || 0) + char.level + bonuses.thresholds.severe
    }
  })

  /**
   * Évasion effective = base évasion + bonus armure + bonus ascendance/sous-classe/cartes
   */
  const selectedEffectiveEvasion = computed(() => {
    const char = selectedCharacter.value
    if (!char) return 0
    const bonuses = selectedStatBonuses.value
    return char.evasion + (char.evasionBonus || 0) + bonuses.evasion
  })

  /**
   * Score d'armure effectif = base + bonus cartes (Armorer, Valor-Touched)
   * ou override (Bare Bones).
   */
  const selectedEffectiveArmorScore = computed(() => {
    const char = selectedCharacter.value
    if (!char) return 0
    const bonuses = selectedStatBonuses.value
    if (bonuses.armorScoreOverride !== null) {
      return bonuses.armorScoreOverride + bonuses.armorScore
    }
    return char.armorScore + bonuses.armorScore
  })

  /**
   * Liste des modificateurs de cartes de domaine avec leur état actif/inactif.
   * Utilisée par ActiveModifiersPanel.vue pour afficher les bonus en jeu.
   */
  const activeModifiersList = computed(() => {
    const char = selectedCharacter.value
    if (!char) return []
    const loadout = char.domainCards?.loadout || []
    const activeEffects = char.activeEffects || {}
    const result = []

    for (const cardId of loadout) {
      const mod = DOMAIN_CARD_MODIFIERS[cardId]
      if (!mod) continue

      let active = false
      let canToggle = false
      let statusLabel = ''

      switch (mod.type) {
        case 'passive':
          active = true
          statusLabel = 'Actif'
          break
        case 'conditional':
          active = typeof mod.isActive === 'function' && mod.isActive(char)
          statusLabel = active ? mod.conditionLabel : `Inactif (${mod.conditionLabel})`
          break
        case 'touched': {
          const touchedOk = isTouchedActive(mod, loadout, getCardById)
          if (mod.hasToggle) {
            active = touchedOk && !!activeEffects[cardId]
            canToggle = touchedOk
            statusLabel = !touchedOk ? 'Inactif (< 4 cartes)' : (active ? mod.toggleLabel : `Inactif (${mod.toggleLabel})`)
          } else {
            active = touchedOk
            statusLabel = active ? 'Actif (4+ cartes)' : 'Inactif (< 4 cartes)'
          }
          break
        }
        case 'toggle':
          canToggle = true
          active = !!activeEffects[cardId]
          statusLabel = active ? mod.toggleLabel : `Inactif (${mod.toggleLabel})`
          break
        case 'activable':
          canToggle = true
          active = !!activeEffects[cardId]
          statusLabel = active ? 'Activé' : 'Disponible'
          break
        case 'permanent':
          // Les permanents ne sont pas dans cette liste, ils sont appliqués directement
          continue
        default:
          break
      }

      result.push({
        cardId,
        name: mod.name,
        domain: mod.domain,
        icon: mod.icon,
        type: mod.type,
        description: mod.description,
        active,
        canToggle,
        statusLabel,
        frequency: mod.frequency || null,
        cost: mod.cost || null,
        toggleLabel: mod.toggleLabel || null
      })
    }

    return result
  })

  // ── Données de sélection (pour les déroulants) ──────────

  /** Sous-classes disponibles pour la classe du personnage sélectionné */
  const availableSubclasses = computed(() => {
    const char = selectedCharacter.value
    if (!char) return []
    // SRD
    const srd = getSubclassesForClass(char.classId)
    if (srd.length > 0) return srd
    // Homebrew : sous-classes embarquées dans l'item
    const hb = classHomebrewStore.items.find((c) => c.id === char.classId)
    if (!hb || !Array.isArray(hb.subclasses)) return []
    return hb.subclasses.map((sub, i) => ({
      id: sub.name ? sub.name.toLowerCase().replace(/\s+/g, '-') : `sub-${i}`,
      name: sub.name || `Sous-classe ${i + 1}`,
      spellcastTrait: sub.spellcastTrait || null,
      description: sub.description || '',
      foundation: Array.isArray(sub.foundation) ? sub.foundation : [],
      specialization: Array.isArray(sub.specialization) ? sub.specialization : [],
      mastery: Array.isArray(sub.mastery) ? sub.mastery : []
    }))
  })

  /** Donnée de la sous-classe sélectionnée */
  const selectedSubclassData = computed(() => {
    const char = selectedCharacter.value
    if (!char || !char.subclassId) return null
    // SRD d'abord
    const srd = getSubclassById(char.classId, char.subclassId)
    if (srd) return srd
    // Homebrew : chercher dans availableSubclasses
    return availableSubclasses.value.find((s) => s.id === char.subclassId) || null
  })

  /** Donnée de l'ascendance sélectionnée (résolue pour Mixed Ancestry) */
  const selectedAncestryData = computed(() => {
    const char = selectedCharacter.value
    if (!char || !char.ancestryId) return null

    // ── Mixed Ancestry : construire un objet synthétique ──
    if (char.ancestryId === 'mixed-ancestry') {
      const config = char.mixedAncestryConfig
      if (!config) return getAncestryById('mixed-ancestry')

      const a1 = config.ancestry1Id ? getAncestryById(config.ancestry1Id) : null
      const a2 = config.ancestry2Id ? getAncestryById(config.ancestry2Id) : null
      const base = getAncestryById('mixed-ancestry')

      // Résoudre les features : chaque ascendance contribue la feature choisie (top ou bottom)
      let feature1 = base.topFeature
      let feature2 = base.bottomFeature

      if (a1 && config.ancestry1Feature) {
        feature1 = config.ancestry1Feature === 'top' ? a1.topFeature : a1.bottomFeature
      }
      if (a2 && config.ancestry2Feature) {
        feature2 = config.ancestry2Feature === 'top' ? a2.topFeature : a2.bottomFeature
      }

      // Construire le nom composite
      const names = [a1, a2].filter(Boolean).map((a) => a.name)
      const label = names.length > 0 ? `Mixed (${names.join(' / ')})` : 'Mixed Ancestry'

      return {
        ...base,
        name: label,
        topFeature: feature1,
        bottomFeature: feature2,
        // Données brutes pour l'UI
        _resolved: true,
        _ancestry1: a1,
        _ancestry2: a2,
        _config: config
      }
    }

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
    // SRD : chercher par nom de classe
    const srd = getDomainsForClass(char.className)
    if (srd.length > 0) return srd
    // Homebrew : résoudre les domaines par ID depuis la classe
    const cls = resolveClass(char.classId)
    if (!cls || !cls.domains) return []
    return cls.domains.map((dName) => getDomainById(dName.toLowerCase())).filter(Boolean)
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
    const cls = resolveClass(char.classId)
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
          // Réinitialiser la config Mixed Ancestry si on change d'ascendance
          if (value !== 'mixed-ancestry') {
            char.mixedAncestryConfig = {
              ancestry1Id: '',
              ancestry2Id: '',
              ancestry1Feature: '',
              ancestry2Feature: ''
            }
            // Auto-remplir le champ héritage avec le nom de l'ascendance
            const ancestry = value ? getAncestryById(value) : null
            char.heritage = ancestry ? ancestry.name : ''
          } else {
            // Mixed Ancestry : vider l'héritage (sera rempli via updateMixedAncestry)
            char.heritage = ''
          }
          _syncDerivedStats(char)
          break
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

  /**
   * Met à jour un champ de la configuration Mixed Ancestry.
   * Chaque ascendance contribue une feature au choix (top ou bottom).
   * @param {string} field - 'ancestry1Id' | 'ancestry2Id' | 'ancestry1Feature' | 'ancestry2Feature'
   * @param {string} value - ID d'ascendance ou 'top'/'bottom'
   */
  function updateMixedAncestry(field, value) {
    const char = selectedCharacter.value
    if (!char || char.ancestryId !== 'mixed-ancestry') return
    if (!char.mixedAncestryConfig) {
      char.mixedAncestryConfig = {
        ancestry1Id: '', ancestry2Id: '',
        ancestry1Feature: '', ancestry2Feature: ''
      }
    }
    const config = char.mixedAncestryConfig

    if (field === 'ancestry1Id' || field === 'ancestry2Id') {
      config[field] = value
      // Réinitialiser les choix de features si les ascendances changent
      config.ancestry1Feature = ''
      config.ancestry2Feature = ''
    } else if (field === 'ancestry1Feature' || field === 'ancestry2Feature') {
      config[field] = value
    }

    // Auto-remplir l'héritage avec la combinaison des deux ascendances parentes
    const a1 = config.ancestry1Id ? getAncestryById(config.ancestry1Id) : null
    const a2 = config.ancestry2Id ? getAncestryById(config.ancestry2Id) : null
    if (a1 && a2) {
      char.heritage = `${a1.name}-${a2.name}`
    } else if (a1) {
      char.heritage = a1.name
    } else if (a2) {
      char.heritage = a2.name
    } else {
      char.heritage = ''
    }

    char.updatedAt = new Date().toISOString()
    _syncDerivedStats(char)
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
    // SRD : utiliser createDefaultCharacter
    let char = createDefaultCharacter(classId)
    // Homebrew : construire manuellement si SRD échoue
    if (!char) {
      const cls = resolveClass(classId)
      if (!cls) return null
      char = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        name: '',
        pronouns: '',
        heritage: '',
        classId: cls.id,
        className: cls.name,
        subclass: '',
        level: 1,
        proficiency: 1,
        subclassId: '',
        ancestryId: '',
        communityId: '',
        armorId: '',
        primaryWeaponId: '',
        secondaryWeaponId: '',
        selectionsLocked: false,
        mixedAncestryConfig: { ancestry1Id: '', ancestry2Id: '', ancestry1Feature: '', ancestry2Feature: '' },
        traits: {
          agility: cls.suggestedTraits?.agility ?? 0,
          strength: cls.suggestedTraits?.strength ?? 0,
          finesse: cls.suggestedTraits?.finesse ?? 0,
          instinct: cls.suggestedTraits?.instinct ?? 0,
          presence: cls.suggestedTraits?.presence ?? 0,
          knowledge: cls.suggestedTraits?.knowledge ?? 0
        },
        evasion: cls.baseEvasion,
        evasionBonus: 0,
        armorName: '',
        armorBaseThresholds: { major: 0, severe: 0 },
        armorScore: 0,
        armorSlotsMarked: 0,
        maxHP: cls.baseHP,
        currentHP: 0,
        maxStress: cls.baseStress,
        currentStress: 0,
        hope: 0,
        experiences: [{ name: '', bonus: 0 }, { name: '', bonus: 0 }],
        primaryWeapon: { name: '', trait: '', range: '', damage: '', feature: '' },
        secondaryWeapon: { name: '', trait: '', range: '', damage: '', feature: '' },
        inventory: [],
        gold: { handfuls: 0, bags: 0, chests: 0 },
        conditions: [],
        domainCards: { loadout: [], vault: [] },
        permanentCardEffects: [],
        levelHistory: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }
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

  /**
   * Ajoute un slot d'inventaire structuré.
   * @param {'loot'|'consumable'|'custom'} [type='custom']
   */
  function addInventoryItem(type = 'custom') {
    const char = selectedCharacter.value
    if (!char) return
    // Migrer si l'inventaire contient des chaînes brutes
    _migrateInventory(char)
    char.inventory.push({
      id: `inv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      itemId: '',
      customName: '',
      quantity: 1
    })
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /** Supprime un slot d'inventaire par index */
  function removeInventoryItem(index) {
    const char = selectedCharacter.value
    if (!char || index < 0 || index >= char.inventory.length) return
    char.inventory.splice(index, 1)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /**
   * Met à jour un champ d'un slot d'inventaire.
   * @param {number} index
   * @param {string} field - 'type' | 'itemId' | 'customName' | 'quantity'
   * @param {*} value
   */
  function updateInventoryItem(index, field, value) {
    const char = selectedCharacter.value
    if (!char || index < 0 || index >= char.inventory.length) return
    const slot = char.inventory[index]
    if (!slot || typeof slot !== 'object') return

    // Si on change le type, réinitialiser les champs liés
    if (field === 'type') {
      slot.type = value
      slot.itemId = ''
      slot.customName = ''
      slot.quantity = value === 'consumable' ? 1 : 1
    } else if (field === 'itemId') {
      slot.itemId = value
    } else if (field === 'customName') {
      slot.customName = value
    } else if (field === 'quantity') {
      slot.quantity = Math.max(1, parseInt(value) || 1)
    }

    char.updatedAt = new Date().toISOString()
    persist()
  }

  /**
   * Met à jour le gold du personnage.
   * @param {string} tier - 'handfuls' | 'bags' | 'chests'
   * @param {number} value
   */
  function updateGold(tier, value) {
    const char = selectedCharacter.value
    if (!char) return
    if (!char.gold) char.gold = { handfuls: 0, bags: 0, chests: 0 }
    char.gold[tier] = Math.max(0, parseInt(value) || 0)
    char.updatedAt = new Date().toISOString()
    persist()
  }

  /**
   * Migration : convertit les anciens éléments string en objets structurés.
   * @param {Object} char
   */
  function _migrateInventory(char) {
    if (!Array.isArray(char.inventory)) {
      char.inventory = []
      return
    }
    for (let i = 0; i < char.inventory.length; i++) {
      const item = char.inventory[i]
      if (typeof item === 'string') {
        char.inventory[i] = {
          id: `inv-migrated-${i}-${Date.now()}`,
          type: 'custom',
          itemId: '',
          customName: item,
          quantity: 1
        }
      }
    }
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

  // ── Effets de cartes de domaine ────────────────────────

  /**
   * Active/désactive un effet toggle ou activable.
   * @param {string} cardId
   * @returns {boolean} Nouvel état
   */
  function toggleEffect(cardId) {
    const char = selectedCharacter.value
    if (!char) return false
    if (!char.activeEffects) char.activeEffects = {}
    const newState = !char.activeEffects[cardId]
    char.activeEffects[cardId] = newState
    char.updatedAt = new Date().toISOString()
    _syncDerivedStats(char)
    persist()
    return newState
  }

  /**
   * Désactive un effet activable (fin de durée, repos, etc.).
   * @param {string} cardId
   */
  function deactivateEffect(cardId) {
    const char = selectedCharacter.value
    if (!char) return
    if (!char.activeEffects) char.activeEffects = {}
    char.activeEffects[cardId] = false
    char.updatedAt = new Date().toISOString()
    _syncDerivedStats(char)
    persist()
  }

  /**
   * Désactive tous les effets activables (repos court).
   */
  function deactivateRestEffects() {
    const char = selectedCharacter.value
    if (!char || !char.activeEffects) return
    const loadout = char.domainCards?.loadout || []
    for (const cardId of loadout) {
      const mod = DOMAIN_CARD_MODIFIERS[cardId]
      if (mod && mod.type === 'activable') {
        char.activeEffects[cardId] = false
      }
    }
    char.updatedAt = new Date().toISOString()
    _syncDerivedStats(char)
    persist()
  }

  /**
   * Applique un effet permanent (Vitality, Master of the Craft).
   * L'effet est enregistré dans permanentCardEffects et la carte va en vault.
   * @param {string} cardId
   * @param {string[]} choiceIds - IDs des choix sélectionnés
   * @returns {boolean} true si appliqué
   */
  function applyPermanentEffect(cardId, choiceIds) {
    const char = selectedCharacter.value
    if (!char) return false
    const mod = DOMAIN_CARD_MODIFIERS[cardId]
    if (!mod || mod.type !== 'permanent') return false
    if (!Array.isArray(char.permanentCardEffects)) char.permanentCardEffects = []
    // Vérifier qu'on n'a pas déjà appliqué cette carte
    if (char.permanentCardEffects.some((e) => e.cardId === cardId)) return false
    // Récupérer les effets des choix
    for (const choiceId of choiceIds) {
      const choice = mod.choices.find((c) => c.id === choiceId)
      if (choice && choice.effect) {
        char.permanentCardEffects.push({
          cardId,
          choiceId,
          ...choice.effect,
          source: `${mod.name} (${choice.label})`
        })
      }
    }
    // Déplacer la carte en vault (permanent)
    _ensureDomainCards(char)
    char.domainCards.loadout = char.domainCards.loadout.filter((id) => id !== cardId)
    if (!char.domainCards.vault.includes(cardId)) {
      char.domainCards.vault.push(cardId)
    }
    char.updatedAt = new Date().toISOString()
    _syncDerivedStats(char)
    persist()
    return true
  }

  /**
   * Vérifie si un effet permanent a déjà été appliqué.
   * @param {string} cardId
   * @returns {boolean}
   */
  function hasPermanentEffect(cardId) {
    const char = selectedCharacter.value
    if (!char || !Array.isArray(char.permanentCardEffects)) return false
    return char.permanentCardEffects.some((e) => e.cardId === cardId)
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
    // SRD d'abord, homebrew ensuite, fallback warrior
    const defaults = createDefaultCharacter(raw.classId || 'warrior')
      || createDefaultCharacter('warrior')
      || {}
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
    allClasses,
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
    updateMixedAncestry,

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
    updateInventoryItem,
    updateGold,

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

    // Actions effets de cartes de domaine
    toggleEffect,
    deactivateEffect,
    deactivateRestEffects,
    applyPermanentEffect,
    hasPermanentEffect,

    // Getters cartes de domaine étendus
    selectedEffectiveArmorScore,
    activeModifiersList,

    // Utilitaires
    persist,
    resetAll
  }
})
