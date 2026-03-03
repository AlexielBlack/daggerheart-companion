/**
 * @module homebrew/schemas/equipmentSchema
 * @description Schéma déclaratif unifié pour la création d'équipement homebrew.
 *
 * Basé sur le format SRD : SRD_EQUIPMENT.pdf, SRD_LOOTCONSUMABLES.pdf
 * et les conseils du Daggerheart_Homebrew_KIT.pdf (section Equipment & Loot).
 *
 * Catégories supportées :
 *  - primaryWeapon / secondaryWeapon : nom, tier, trait, portée, dégâts, burden, feature
 *  - armor : nom, tier, seuils de dégâts, score d'armure, feature
 *  - loot : nom, description d'effet
 *  - consumable : nom, description d'effet
 *
 * Le schéma est unifié : les champs spécifiques à une catégorie sont optionnels.
 * La preview et la validation avancée gèrent la pertinence selon la catégorie choisie.
 */

import { FIELD_TYPES } from '../core/utils/schemaTypes.js'

/**
 * Catégories d'équipement.
 */
export const EQUIPMENT_CATEGORIES = [
  { value: 'primaryWeapon', label: 'Arme Primaire' },
  { value: 'secondaryWeapon', label: 'Arme Secondaire' },
  { value: 'armor', label: 'Armure' },
  { value: 'loot', label: 'Loot (objet)' },
  { value: 'consumable', label: 'Consommable' }
]

/**
 * Traits utilisables pour les armes.
 */
export const WEAPON_TRAITS = [
  'Agility', 'Strength', 'Finesse', 'Instinct', 'Presence', 'Knowledge'
]

/**
 * Portées Daggerheart.
 */
export const WEAPON_RANGES = [
  'Melee', 'Very Close', 'Close', 'Far', 'Very Far'
]

/**
 * Burden (mains occupées).
 */
export const WEAPON_BURDENS = ['One-Handed', 'Two-Handed']

/**
 * Raretés pour loot et consommables.
 */
export const LOOT_RARITIES = ['common', 'uncommon', 'rare', 'legendary']

/**
 * Benchmarks de dégâts d'arme par tier (table SRD Homebrew Kit).
 * Utile pour guider l'utilisateur lors de la création.
 */
export const WEAPON_TIER_BENCHMARKS = {
  1: { oneHanded: 'd8 to d8+1', twoHanded: 'd10+2 to d12+3' },
  2: { oneHanded: 'd8+3 to d8+4', twoHanded: 'd10+5 to d12+6' },
  3: { oneHanded: 'd8+6 to d8+7', twoHanded: 'd10+8 to d12+9' },
  4: { oneHanded: 'd8+9 to d8+10', twoHanded: 'd10+11 to d12+12' }
}

/**
 * Benchmarks d'armure par tier (table SRD Homebrew Kit).
 */
export const ARMOR_TIER_BENCHMARKS = {
  1: { thresholds: { major: [5, 8], severe: [11, 17] }, baseScore: [3, 4] },
  2: { thresholds: { major: [7, 13], severe: [16, 28] }, baseScore: [4, 5] },
  3: { thresholds: { major: [9, 17], severe: [23, 43] }, baseScore: [5, 6] },
  4: { thresholds: { major: [11, 18], severe: [32, 48] }, baseScore: [6, 8] }
}

/**
 * Schéma déclaratif complet pour un équipement homebrew.
 */
export const equipmentSchema = {
  key: 'equipment',
  label: 'Équipement',
  icon: '🗡️',
  storageKey: 'homebrew-equipment',

  fields: [
    // ── Champs communs ──────────────────────────────────
    {
      key: 'category',
      type: FIELD_TYPES.SELECT,
      label: 'Catégorie',
      required: true,
      options: EQUIPMENT_CATEGORIES.map((c) => c.value),
      optionLabels: EQUIPMENT_CATEGORIES.reduce((acc, c) => {
        acc[c.value] = c.label
        return acc
      }, {}),
      defaultValue: 'primaryWeapon',
      helpText: 'Type d\'équipement à créer.'
    },
    {
      key: 'name',
      type: FIELD_TYPES.TEXT,
      label: 'Nom',
      required: true,
      minLength: 2,
      maxLength: 80,
      placeholder: 'Ex: Lame de Flamme, Bouclier Runique'
    },
    {
      key: 'description',
      type: FIELD_TYPES.TEXTAREA,
      label: 'Description',
      maxLength: 800,
      placeholder: 'Description ou effet de l\'objet.'
    },

    // ── Champs arme & armure (tiered) ───────────────────
    {
      key: 'tier',
      type: FIELD_TYPES.SELECT,
      label: 'Tier',
      required: false,
      options: [1, 2, 3, 4],
      defaultValue: 1,
      helpText: 'Tier de puissance. Applicable aux armes et armures.'
    },

    // ── Champs arme (primary + secondary) ───────────────
    {
      key: 'damageType',
      type: FIELD_TYPES.SELECT,
      label: 'Type de dégâts',
      required: false,
      options: ['phy', 'mag'],
      defaultValue: 'phy',
      helpText: 'Physique ou magique. Les armes magiques requièrent un trait Spellcast.'
    },
    {
      key: 'trait',
      type: FIELD_TYPES.SELECT,
      label: 'Trait',
      required: false,
      options: WEAPON_TRAITS,
      defaultValue: 'Agility',
      helpText: 'Le trait utilisé pour les jets d\'attaque.'
    },
    {
      key: 'range',
      type: FIELD_TYPES.SELECT,
      label: 'Portée',
      required: false,
      options: WEAPON_RANGES,
      defaultValue: 'Melee',
      helpText: 'Distance maximale de l\'attaque.'
    },
    {
      key: 'damage',
      type: FIELD_TYPES.TEXT,
      label: 'Dégâts',
      required: false,
      placeholder: 'Ex: d10+3, 2d8+4',
      helpText: 'Dé de dégâts + modificateur.'
    },
    {
      key: 'burden',
      type: FIELD_TYPES.SELECT,
      label: 'Burden',
      required: false,
      options: WEAPON_BURDENS,
      defaultValue: 'One-Handed',
      helpText: 'Nombre de mains nécessaires.'
    },

    // ── Champs armure ───────────────────────────────────
    {
      key: 'thresholds',
      type: FIELD_TYPES.GROUP,
      label: 'Seuils de dégâts (armure)',
      required: false,
      children: [
        {
          key: 'major',
          type: FIELD_TYPES.NUMBER,
          label: 'Majeur',
          required: false,
          min: 1,
          max: 100,
          integer: true,
          defaultValue: 6
        },
        {
          key: 'severe',
          type: FIELD_TYPES.NUMBER,
          label: 'Sévère',
          required: false,
          min: 1,
          max: 200,
          integer: true,
          defaultValue: 13
        }
      ]
    },
    {
      key: 'baseScore',
      type: FIELD_TYPES.NUMBER,
      label: 'Score d\'armure (base)',
      required: false,
      min: 1,
      max: 15,
      integer: true,
      defaultValue: 3,
      helpText: 'Nombre de slots d\'armure de base.'
    },

    // ── Champs loot / consumable ────────────────────────
    {
      key: 'rarity',
      type: FIELD_TYPES.SELECT,
      label: 'Rareté',
      required: false,
      options: LOOT_RARITIES,
      defaultValue: 'common',
      helpText: 'Rareté de l\'objet (loot et consommables).'
    },

    // ── Feature commune (texte libre pour armes/armures) ─
    {
      key: 'feature',
      type: FIELD_TYPES.TEXTAREA,
      label: 'Feature',
      maxLength: 500,
      placeholder: 'Ex: Reliable: +1 to attack rolls',
      helpText: 'Capacité spéciale de l\'équipement (optionnel).'
    },
    {
      key: 'featureKey',
      type: FIELD_TYPES.TEXT,
      label: 'Mot-clé feature',
      maxLength: 40,
      placeholder: 'Ex: Reliable, Heavy, Flexible',
      helpText: 'Nom court de la feature pour les filtres.'
    }
  ]
}

/**
 * Retourne les champs pertinents pour une catégorie donnée.
 * @param {string} category - La catégorie d'équipement.
 * @returns {string[]} Liste des clés de champs pertinents.
 */
export function getRelevantFields(category) {
  const common = ['category', 'name', 'description']
  switch (category) {
    case 'primaryWeapon':
    case 'secondaryWeapon':
      return [...common, 'tier', 'damageType', 'trait', 'range', 'damage', 'burden', 'feature', 'featureKey']
    case 'armor':
      return [...common, 'tier', 'thresholds', 'baseScore', 'feature', 'featureKey']
    case 'loot':
    case 'consumable':
      return [...common, 'rarity', 'feature']
    default:
      return common
  }
}
