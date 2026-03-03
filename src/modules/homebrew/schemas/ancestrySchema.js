/**
 * @module homebrew/schemas/ancestrySchema
 * @description Schéma déclaratif pour la création d'ascendances homebrew.
 *
 * Basé sur le format SRD : OfficialAncestries_SRD.pdf
 * et les conseils du Daggerheart_Homebrew_KIT.pdf.
 *
 * Structure d'une ascendance :
 *  - name, emoji, description
 *  - topFeature : { name, description } — capacité biologique principale
 *  - bottomFeature : { name, description } — capacité secondaire
 *
 * Le Homebrew Kit recommande :
 *  - Top Feature : "ce qu'est" l'ascendance (bonus XP, mouvement, réactions, manipulation de dés, PV/Stress)
 *  - Bottom Feature : "ce que fait" l'ascendance (attaque spéciale, maîtrise, capacité unique)
 *  - Les deux doivent être physiques/biologiques, jamais culturelles
 */

import { FIELD_TYPES } from '../core/utils/schemaTypes.js'

/**
 * Liste d'emojis suggérés pour les ascendances.
 */
export const ANCESTRY_EMOJIS = [
  '⚙️', '🐉', '⛏️', '🌿', '✨', '🐐', '🌳', '🍄',
  '🐢', '🏔️', '👺', '🍀', '🧑', '🔥', '🐱', '🐗',
  '🐸', '🐵', '🦇', '🦅', '🐺', '🌊', '💀', '🤖',
  '🦎', '🪨', '🌙', '🌀', '⚡', '🎭'
]

/**
 * Schéma déclaratif complet pour une ascendance homebrew.
 */
export const ancestrySchema = {
  key: 'ancestry',
  label: 'Ascendance',
  icon: '🧬',
  storageKey: 'homebrew-ancestries',

  fields: [
    {
      key: 'name',
      type: FIELD_TYPES.TEXT,
      label: 'Nom',
      required: true,
      minLength: 2,
      maxLength: 60,
      placeholder: 'Ex: Arachni, Lithborn, Verdantkin'
    },
    {
      key: 'emoji',
      type: FIELD_TYPES.TEXT,
      label: 'Emoji',
      required: false,
      maxLength: 4,
      placeholder: '🧬',
      helpText: 'Un emoji représentatif (optionnel).'
    },
    {
      key: 'description',
      type: FIELD_TYPES.TEXTAREA,
      label: 'Description',
      required: true,
      minLength: 10,
      maxLength: 800,
      placeholder: 'Décrivez l\'apparence, la physiologie et les traits distinctifs de cette ascendance…'
    },
    {
      key: 'topFeature',
      type: FIELD_TYPES.GROUP,
      label: 'Feature Haute (Top)',
      required: true,
      helpText: 'Capacité biologique principale : ce que « est » cette ascendance (mouvement, résistance, sens, PV, manipulation de dés…).',
      children: [
        {
          key: 'name',
          type: FIELD_TYPES.TEXT,
          label: 'Nom de la feature',
          required: true,
          minLength: 2,
          maxLength: 60,
          placeholder: 'Ex: Natural Climber, Thick Skin, Wings'
        },
        {
          key: 'description',
          type: FIELD_TYPES.TEXTAREA,
          label: 'Effet mécanique',
          required: true,
          minLength: 10,
          maxLength: 500,
          placeholder: 'Décrivez l\'effet mécanique précis de cette feature…'
        }
      ]
    },
    {
      key: 'bottomFeature',
      type: FIELD_TYPES.GROUP,
      label: 'Feature Basse (Bottom)',
      required: true,
      helpText: 'Capacité secondaire : ce que « fait » cette ascendance (attaque spéciale, souffle, maîtrise…).',
      children: [
        {
          key: 'name',
          type: FIELD_TYPES.TEXT,
          label: 'Nom de la feature',
          required: true,
          minLength: 2,
          maxLength: 60,
          placeholder: 'Ex: Elemental Breath, Efficient, Celestial Trance'
        },
        {
          key: 'description',
          type: FIELD_TYPES.TEXTAREA,
          label: 'Effet mécanique',
          required: true,
          minLength: 10,
          maxLength: 500,
          placeholder: 'Décrivez l\'effet mécanique précis de cette feature…'
        }
      ]
    }
  ]
}
