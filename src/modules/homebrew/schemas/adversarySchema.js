/**
 * @module homebrew/schemas/adversarySchema
 * @description Schéma déclaratif pour la création d'adversaires homebrew.
 *
 * Basé sur le format SRD : ADV_rules.pdf, ADV_sheetsSRD.pdf
 * et les conseils du Daggerheart_Homebrew_KIT.pdf.
 *
 * Les benchmarks par tier sont issus de la table « Improvised Statistics by Tier » :
 *   Tier 1 : ATK +1, Diff 11, Thresholds 7/12, Damage 1d6+2 à 1d12+4
 *   Tier 2 : ATK +2, Diff 14, Thresholds 10/20, Damage 2d6+3 à 2d12+4
 *   Tier 3 : ATK +3, Diff 17, Thresholds 20/32, Damage 3d8+3 à 3d12+5
 *   Tier 4 : ATK +4, Diff 20, Thresholds 25/45, Damage 4d8+10 à 4d12+15
 */

import { FIELD_TYPES } from '../core/utils/schemaTypes.js'

/**
 * Benchmarks de statistiques par tier (table SRD).
 * Utilisés pour pré-remplir les valeurs quand l'utilisateur choisit un tier.
 */
export const ADVERSARY_TIER_BENCHMARKS = {
  1: {
    difficulty: 11,
    thresholds: { major: 7, severe: 12 },
    hp: 5,
    stress: 3,
    attack: { modifier: 1, damage: '1d8+2', damageType: 'phy' }
  },
  2: {
    difficulty: 14,
    thresholds: { major: 10, severe: 20 },
    hp: 5,
    stress: 3,
    attack: { modifier: 2, damage: '2d8+3', damageType: 'phy' }
  },
  3: {
    difficulty: 17,
    thresholds: { major: 20, severe: 32 },
    hp: 7,
    stress: 4,
    attack: { modifier: 3, damage: '3d8+4', damageType: 'phy' }
  },
  4: {
    difficulty: 20,
    thresholds: { major: 25, severe: 45 },
    hp: 9,
    stress: 5,
    attack: { modifier: 4, damage: '4d10+12', damageType: 'phy' }
  }
}

/**
 * Types d'adversaires Daggerheart.
 * Source : ADV_rules.pdf — « Adversary Types »
 */
export const ADVERSARY_TYPES = [
  'Bruiser',
  'Horde',
  'Leader',
  'Minion',
  'Ranged',
  'Skulk',
  'Social',
  'Solo',
  'Standard',
  'Support'
]

/**
 * Portées valides dans Daggerheart.
 */
export const RANGES = ['Melee', 'Very Close', 'Close', 'Far', 'Very Far']

/**
 * Schéma déclaratif complet pour un adversaire homebrew.
 */
export const adversarySchema = {
  key: 'adversary',
  label: 'Adversaire',
  icon: '⚔️',
  storageKey: 'homebrew-adversaries',

  fields: [
    {
      key: 'name',
      type: FIELD_TYPES.TEXT,
      label: 'Nom',
      required: true,
      minLength: 2,
      maxLength: 80,
      placeholder: 'Ex: Dragon de Givre'
    },
    {
      key: 'tier',
      type: FIELD_TYPES.SELECT,
      label: 'Tier',
      required: true,
      options: [1, 2, 3, 4],
      defaultValue: 1,
      helpText: 'Tier 1 (niv. 1), Tier 2 (niv. 2-4), Tier 3 (niv. 5-7), Tier 4 (niv. 8-10).',
      /** Clé de callback pour pré-remplir les benchmarks au changement de tier */
      onChange: 'applyTypeTierDefaults'
    },
    {
      key: 'type',
      type: FIELD_TYPES.SELECT,
      label: 'Type',
      required: true,
      options: ADVERSARY_TYPES,
      defaultValue: 'Standard',
      helpText: 'Rôle de l\'adversaire dans un conflit.',
      /** Clé de callback pour recalculer les benchmarks au changement de type */
      onChange: 'applyTypeTierDefaults'
    },
    {
      key: 'description',
      type: FIELD_TYPES.TEXTAREA,
      label: 'Description',
      maxLength: 500,
      placeholder: 'Apparence et comportement de l\'adversaire.'
    },
    {
      key: 'motives',
      type: FIELD_TYPES.TAGS,
      label: 'Motifs & Tactiques',
      placeholder: 'Ex: Embusquer, fuir, protéger',
      helpText: 'Comment l\'adversaire agit en combat et hors combat.',
      maxItems: 8
    },
    {
      key: 'difficulty',
      type: FIELD_TYPES.NUMBER,
      label: 'Difficulté',
      required: true,
      min: 1,
      max: 30,
      integer: true,
      defaultValue: 11,
      helpText: 'Seuil à atteindre pour les jets d\'action contre cet adversaire.'
    },
    {
      key: 'thresholds',
      type: FIELD_TYPES.GROUP,
      label: 'Seuils de dégâts',
      required: true,
      children: [
        {
          key: 'major',
          type: FIELD_TYPES.NUMBER,
          label: 'Majeur',
          required: true,
          min: 1,
          max: 100,
          integer: true,
          defaultValue: 7
        },
        {
          key: 'severe',
          type: FIELD_TYPES.NUMBER,
          label: 'Sévère',
          required: true,
          min: 1,
          max: 200,
          integer: true,
          defaultValue: 12
        }
      ]
    },
    {
      key: 'hp',
      type: FIELD_TYPES.NUMBER,
      label: 'Points de Vie (HP)',
      required: true,
      min: 1,
      max: 30,
      integer: true,
      defaultValue: 5
    },
    {
      key: 'stress',
      type: FIELD_TYPES.NUMBER,
      label: 'Stress',
      required: true,
      min: 0,
      max: 15,
      integer: true,
      defaultValue: 3
    },
    {
      key: 'attack',
      type: FIELD_TYPES.GROUP,
      label: 'Attaque standard',
      required: true,
      children: [
        {
          key: 'modifier',
          type: FIELD_TYPES.NUMBER,
          label: 'Modificateur',
          required: true,
          min: -5,
          max: 10,
          integer: true,
          defaultValue: 1
        },
        {
          key: 'name',
          type: FIELD_TYPES.TEXT,
          label: 'Nom de l\'attaque',
          required: true,
          placeholder: 'Ex: Griffes, Épée longue, Souffle de feu'
        },
        {
          key: 'range',
          type: FIELD_TYPES.SELECT,
          label: 'Portée',
          required: true,
          options: RANGES,
          defaultValue: 'Melee'
        },
        {
          key: 'damage',
          type: FIELD_TYPES.TEXT,
          label: 'Dégâts',
          required: true,
          placeholder: 'Ex: 2d8+4',
          pattern: '^\\d+d\\d+(\\+\\d+)?$',
          helpText: 'Format : XdY ou XdY+Z (ex: 2d8+4).'
        },
        {
          key: 'damageType',
          type: FIELD_TYPES.SELECT,
          label: 'Type de dégâts',
          required: true,
          options: ['phy', 'mag'],
          defaultValue: 'phy'
        }
      ]
    },
    {
      key: 'experiences',
      type: FIELD_TYPES.ARRAY,
      label: 'Expériences',
      helpText: 'Compétences narratives avec bonus numérique (ex: Stealth +3).',
      maxItems: 5,
      itemSchema: {
        fields: [
          {
            key: 'name',
            type: FIELD_TYPES.TEXT,
            label: 'Nom',
            required: true,
            placeholder: 'Ex: Stealth, Intimidation'
          },
          {
            key: 'modifier',
            type: FIELD_TYPES.NUMBER,
            label: 'Modificateur',
            required: true,
            min: 1,
            max: 10,
            integer: true,
            defaultValue: 2
          }
        ]
      }
    },
    {
      key: 'features',
      type: FIELD_TYPES.FEATURES,
      label: 'Features',
      helpText: 'Actions, réactions et passifs de l\'adversaire.'
    }
  ]
}
