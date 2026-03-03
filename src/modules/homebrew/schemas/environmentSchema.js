/**
 * @module homebrew/schemas/environmentSchema
 * @description Schéma déclaratif pour la création d'environnements homebrew.
 *
 * Basé sur le format SRD : ENV_rules.pdf, ENV_sheetsSRD.pdf
 * et les conseils du Daggerheart_Homebrew_KIT.pdf (section Environments).
 *
 * Structure d'un environnement :
 *  - name, tier, type (Exploration/Social/Traversal/Event)
 *  - description, impulses (tags)
 *  - difficulty (optionnel pour Events spéciaux)
 *  - potentialAdversaries (tableau de groupes)
 *  - features (action/reaction/passive avec fearCost et questions)
 */

import { FIELD_TYPES } from '../core/utils/schemaTypes.js'

/**
 * Types d'environnements Daggerheart.
 * Source : ENV_rules.pdf / Homebrew Kit
 */
export const ENVIRONMENT_TYPES = [
  'Exploration',
  'Social',
  'Traversal',
  'Event'
]

/**
 * Benchmarks de difficulté par tier (table SRD).
 */
export const ENVIRONMENT_TIER_BENCHMARKS = {
  1: { difficulty: 11, damageDice: '1d6+1 to 1d8+3' },
  2: { difficulty: 14, damageDice: '2d6+3 to 2d10+2' },
  3: { difficulty: 17, damageDice: '3d8+3 to 3d10+1' },
  4: { difficulty: 20, damageDice: '4d8+3 to 4d10+10' }
}

/**
 * Schéma déclaratif complet pour un environnement homebrew.
 */
export const environmentSchema = {
  key: 'environment',
  label: 'Environnement',
  icon: '🏔️',
  storageKey: 'homebrew-environments',

  fields: [
    {
      key: 'name',
      type: FIELD_TYPES.TEXT,
      label: 'Nom',
      required: true,
      minLength: 2,
      maxLength: 80,
      placeholder: 'Ex: Marché Nocturne, Ruines Submergées'
    },
    {
      key: 'tier',
      type: FIELD_TYPES.SELECT,
      label: 'Tier',
      required: true,
      options: [1, 2, 3, 4],
      defaultValue: 1,
      helpText: 'Tier 1 (niv. 1), Tier 2 (niv. 2-4), Tier 3 (niv. 5-7), Tier 4 (niv. 8-10).',
      onChange: 'applyTierDefaults'
    },
    {
      key: 'type',
      type: FIELD_TYPES.SELECT,
      label: 'Type',
      required: true,
      options: ENVIRONMENT_TYPES,
      defaultValue: 'Exploration',
      helpText: 'Exploration = découverte, Social = relations, Traversal = déplacement, Event = événement.'
    },
    {
      key: 'description',
      type: FIELD_TYPES.TEXTAREA,
      label: 'Description',
      required: true,
      minLength: 10,
      maxLength: 500,
      placeholder: 'Description évocatrice du lieu ou de la situation.'
    },
    {
      key: 'impulses',
      type: FIELD_TYPES.TAGS,
      label: 'Impulses',
      placeholder: 'Ex: Attirer les curieux, Submerger, Piéger',
      helpText: 'Tendances narratives de l\'environnement — ce qu\'il « pousse » à faire.',
      maxItems: 6
    },
    {
      key: 'difficulty',
      type: FIELD_TYPES.NUMBER,
      label: 'Difficulté',
      required: false,
      min: 1,
      max: 30,
      integer: true,
      defaultValue: 11,
      helpText: 'Seuil pour les jets d\'action contre l\'environnement. Optionnel pour certains Events.'
    },
    {
      key: 'potentialAdversaries',
      type: FIELD_TYPES.ARRAY,
      label: 'Adversaires potentiels',
      helpText: 'Groupes d\'adversaires pouvant apparaître dans cet environnement.',
      maxItems: 6,
      itemSchema: {
        fields: [
          {
            key: 'group',
            type: FIELD_TYPES.TEXT,
            label: 'Groupe',
            required: false,
            maxLength: 60,
            placeholder: 'Ex: Bandits, Bêtes, Gardiens'
          },
          {
            key: 'names',
            type: FIELD_TYPES.TAGS,
            label: 'Noms',
            placeholder: 'Ex: Ours, Loup Sinistre',
            maxItems: 8
          }
        ]
      }
    },
    {
      key: 'features',
      type: FIELD_TYPES.FEATURES,
      label: 'Features',
      helpText: 'Actions, réactions et passifs de l\'environnement. Les features peuvent avoir un coût en Fear et des questions narratives.'
    }
  ]
}
