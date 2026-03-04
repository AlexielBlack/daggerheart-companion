/**
 * @module homebrew/schemas/classSchema
 * @description Schema declaratif pour la creation de classes homebrew.
 * Source : OfficialClasses_SRD.pdf, Daggerheart_Homebrew_KIT.pdf
 *
 * Homebrew Kit : Evasion + HP ~ 16, HP 5-7, Hope Feature = 3 Hope.
 */

import { FIELD_TYPES } from '../core/utils/schemaTypes.js'

export const AVAILABLE_DOMAINS = [
  'Arcana', 'Blade', 'Bone', 'Codex',
  'Grace', 'Midnight', 'Sage', 'Splendor', 'Valor'
]

export const CLASS_EMOJIS = [
  '🛡️', '⚔️', '🗡️', '🎵', '🌿', '🏹', '🔮', '⚡', '✨',
  '🤺', '🩸', '🌑', '💀', '🔥', '🧙', '🐉', '🦅', '🎭'
]

export const TRAIT_KEYS = [
  'agility', 'strength', 'finesse', 'instinct', 'presence', 'knowledge'
]

export const classSchema = {
  key: 'class',
  label: 'Classe',
  icon: '⚔️',
  storageKey: 'homebrew-classes',

  fields: [
    {
      key: 'name',
      type: FIELD_TYPES.TEXT,
      label: 'Nom',
      required: true,
      minLength: 2,
      maxLength: 60,
      placeholder: 'Ex: Chevalier Noir, Psion, Shamane'
    },
    {
      key: 'emoji',
      type: FIELD_TYPES.TEXT,
      label: 'Emoji',
      required: false,
      maxLength: 4,
      placeholder: '⚔️',
      helpText: 'Un emoji representatif (optionnel).'
    },
    {
      key: 'description',
      type: FIELD_TYPES.TEXTAREA,
      label: 'Description',
      required: true,
      minLength: 10,
      maxLength: 1000,
      placeholder: 'Decrivez le concept narratif de cette classe…'
    },
    {
      key: 'domains',
      type: FIELD_TYPES.MULTI_SELECT,
      label: 'Domaines (2)',
      required: true,
      options: AVAILABLE_DOMAINS,
      minItems: 2,
      maxItems: 2,
      helpText: 'Choisissez exactement 2 domaines.'
    },
    {
      key: 'baseEvasion',
      type: FIELD_TYPES.NUMBER,
      label: 'Evasion de base',
      required: true,
      min: 7,
      max: 14,
      integer: true,
      defaultValue: 10,
      helpText: 'SRD : 9 (tank) a 12 (esquive). Evasion + HP ≈ 16.'
    },
    {
      key: 'baseHP',
      type: FIELD_TYPES.NUMBER,
      label: 'Points de Vie de base',
      required: true,
      min: 3,
      max: 10,
      integer: true,
      defaultValue: 6,
      helpText: 'SRD : 5 (fragile/Codex) a 7 (tank/Valor). Evasion + HP ≈ 16.'
    },
    {
      key: 'baseStress',
      type: FIELD_TYPES.NUMBER,
      label: 'Stress de base',
      required: true,
      min: 4,
      max: 8,
      integer: true,
      defaultValue: 6,
      helpText: 'Toutes les classes SRD utilisent 6.'
    },
    {
      key: 'hopeFeature',
      type: FIELD_TYPES.TEXTAREA,
      label: 'Hope Feature (3 Hope)',
      required: true,
      minLength: 10,
      maxLength: 500,
      placeholder: 'Ex: Nom : Depensez 3 Espoirs pour [effet puissant]…',
      helpText: 'Capacite puissante activee en depensant 3 Hope.'
    },
    {
      key: 'classFeatures',
      type: FIELD_TYPES.ARRAY,
      label: 'Features de classe',
      helpText: 'Capacites recurrentes definissant la classe (1-3). Faible cout.',
      minItems: 1,
      maxItems: 5,
      itemSchema: {
        fields: [
          {
            key: 'name',
            type: FIELD_TYPES.TEXT,
            label: 'Nom',
            required: true,
            minLength: 2,
            maxLength: 80,
            placeholder: 'Ex: Forme Bestiale, Attaque d\'Opportunite'
          },
          {
            key: 'description',
            type: FIELD_TYPES.TEXTAREA,
            label: 'Effet',
            required: true,
            minLength: 10,
            maxLength: 600,
            placeholder: 'Decrivez l\'effet mecanique de cette feature…'
          }
        ]
      }
    },
    {
      key: 'subclasses',
      type: FIELD_TYPES.ARRAY,
      label: 'Specialisations (sous-classes)',
      helpText: 'Chaque classe propose 2 specialisations. Foundation (Niv. 1-4), Specialisation (Niv. 5-7), Maitrise (Niv. 8+).',
      minItems: 0,
      maxItems: 4,
      itemSchema: {
        fields: [
          {
            key: 'name',
            type: FIELD_TYPES.TEXT,
            label: 'Nom',
            required: true,
            minLength: 2,
            maxLength: 60,
            placeholder: 'Ex: Stalwart, Vengeance, Divine Wielder'
          },
          {
            key: 'domainOverride',
            type: FIELD_TYPES.MULTI_SELECT,
            label: 'Domaines (remplacement)',
            required: false,
            options: AVAILABLE_DOMAINS,
            minItems: 0,
            maxItems: 2,
            helpText: 'Optionnel. Si renseigné, remplace les domaines de la classe pour cette spécialisation.'
          },
          {
            key: 'spellcastTrait',
            type: FIELD_TYPES.SELECT,
            label: 'Trait de sort',
            required: false,
            options: [null, 'Agility', 'Strength', 'Finesse', 'Instinct', 'Presence', 'Knowledge'],
            helpText: 'Laisser vide si la specialisation n\'utilise pas de sorts.'
          },
          {
            key: 'description',
            type: FIELD_TYPES.TEXTAREA,
            label: 'Description',
            required: true,
            minLength: 10,
            maxLength: 400,
            placeholder: 'Phrase d\'accroche decrivant le style de jeu…'
          },
          {
            key: 'foundation',
            type: FIELD_TYPES.TAGS,
            label: 'Foundation (Niv. 1-4)',
            required: true,
            minItems: 1,
            maxItems: 6,
            helpText: 'Features obtenues aux niveaux 1 a 4.'
          },
          {
            key: 'specialization',
            type: FIELD_TYPES.TAGS,
            label: 'Specialisation (Niv. 5-7)',
            required: true,
            minItems: 1,
            maxItems: 4,
            helpText: 'Features obtenues aux niveaux 5 a 7.'
          },
          {
            key: 'mastery',
            type: FIELD_TYPES.TAGS,
            label: 'Maitrise (Niv. 8+)',
            required: true,
            minItems: 1,
            maxItems: 4,
            helpText: 'Features obtenues au niveau 8 et au-dela.'
          }
        ]
      }
    },
    {
      key: 'suggestedTraits',
      type: FIELD_TYPES.GROUP,
      label: 'Traits recommandes',
      helpText: 'Distribution suggeree (+2, +1, +1, 0, 0, -1 est standard).',
      children: [
        { key: 'agility', type: FIELD_TYPES.NUMBER, label: 'Agilite', required: true, min: -3, max: 3, integer: true, defaultValue: 0 },
        { key: 'strength', type: FIELD_TYPES.NUMBER, label: 'Force', required: true, min: -3, max: 3, integer: true, defaultValue: 0 },
        { key: 'finesse', type: FIELD_TYPES.NUMBER, label: 'Finesse', required: true, min: -3, max: 3, integer: true, defaultValue: 0 },
        { key: 'instinct', type: FIELD_TYPES.NUMBER, label: 'Instinct', required: true, min: -3, max: 3, integer: true, defaultValue: 0 },
        { key: 'presence', type: FIELD_TYPES.NUMBER, label: 'Presence', required: true, min: -3, max: 3, integer: true, defaultValue: 0 },
        { key: 'knowledge', type: FIELD_TYPES.NUMBER, label: 'Savoir', required: true, min: -3, max: 3, integer: true, defaultValue: 0 }
      ]
    },
    {
      key: 'suggestedPrimaryWeapon',
      type: FIELD_TYPES.SELECT,
      label: 'Arme primaire suggérée',
      required: false,
      options: [],
      optionsSource: 'primaryWeapon',
      helpText: 'Arme primaire recommandée pour cette classe.'
    },
    {
      key: 'suggestedSecondaryWeapon',
      type: FIELD_TYPES.SELECT,
      label: 'Arme secondaire suggérée',
      required: false,
      options: [],
      optionsSource: 'secondaryWeapon',
      helpText: 'Arme secondaire recommandée (optionnel).'
    },
    {
      key: 'suggestedArmor',
      type: FIELD_TYPES.SELECT,
      label: 'Armure suggérée',
      required: false,
      options: [],
      optionsSource: 'armor',
      helpText: 'Armure recommandée pour cette classe.'
    },
    {
      key: 'classItems',
      type: FIELD_TYPES.TEXT,
      label: 'Objets de classe',
      required: false,
      maxLength: 200,
      placeholder: 'Ex: Un orbe murmurant ou un heritage familial',
      helpText: 'Choix d\'objets narratifs pour la creation du personnage.'
    }
  ]
}
