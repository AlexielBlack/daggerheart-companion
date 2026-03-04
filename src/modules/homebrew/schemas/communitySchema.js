/**
 * @module homebrew/schemas/communitySchema
 * @description Schéma déclaratif pour la création de communautés homebrew.
 *
 * Basé sur le format SRD : Communities_SRD.pdf
 * et les conseils du Daggerheart_Homebrew_KIT.pdf.
 *
 * Structure d'une communauté :
 *  - name, emoji, description
 *  - feature : { name, description } — feature mécanique passive
 *  - adjectives : 6 adjectifs suggérés pour la personnalité
 *  - flavor : phrase d'exemple « Je suis [communauté], alors bien sûr que je sais… »
 *
 * Le Homebrew Kit recommande :
 *  - Nom évocateur plutôt que littéral (ridgeborne, pas mountainborne)
 *  - Feature passive : avantage sur un type de jet ou interaction particulière
 *  - Framework : « I'm <community>, so of course I know how to <feature>. »
 */

import { FIELD_TYPES, tagsFieldDef } from '../core/utils/schemaTypes.js'

/**
 * Liste d'emojis suggérés pour les communautés.
 */
export const COMMUNITY_EMOJIS = [
  '👑', '📚', '⚖️', '⛰️', '⚓', '🌲', '🏙️', '🔨',
  '🎪', '🛡️', '🌾', '🏰', '🗡️', '🌿', '🎭', '🔮',
  '🏜️', '❄️', '🌋', '💎', '🕊️', '🐎', '🏹', '⚔️'
]

/**
 * Schéma déclaratif complet pour une communauté homebrew.
 */
export const communitySchema = {
  key: 'community',
  label: 'Communauté',
  icon: '🏘️',
  storageKey: 'homebrew-communities',

  fields: [
    {
      key: 'name',
      type: FIELD_TYPES.TEXT,
      label: 'Nom',
      required: true,
      minLength: 2,
      maxLength: 60,
      placeholder: 'Ex: Duneborne, Vaultborne, Ashborne',
      helpText: 'Privilégiez un nom évocateur plutôt que littéral (ex: « ridgeborne » au lieu de « mountainborne »).'
    },
    {
      key: 'emoji',
      type: FIELD_TYPES.TEXT,
      label: 'Emoji',
      required: false,
      maxLength: 4,
      placeholder: '🏘️',
      helpText: 'Un emoji représentatif (optionnel).'
    },
    {
      key: 'description',
      type: FIELD_TYPES.TEXTAREA,
      label: 'Description',
      required: true,
      minLength: 10,
      maxLength: 800,
      placeholder: 'Décrivez le lieu, l\'idéal ou la circonstance qui définit cette communauté, ainsi que sa culture et ses valeurs…'
    },
    {
      key: 'feature',
      type: FIELD_TYPES.GROUP,
      label: 'Feature de communauté',
      required: true,
      helpText: 'Une feature passive qui reflète les compétences ou affinités culturelles de cette communauté.',
      children: [
        {
          key: 'name',
          type: FIELD_TYPES.TEXT,
          label: 'Nom de la feature',
          required: true,
          minLength: 2,
          maxLength: 60,
          placeholder: 'Ex: Well-Read, Steady, Privilege'
        },
        {
          key: 'description',
          type: FIELD_TYPES.TEXTAREA,
          label: 'Effet mécanique',
          required: true,
          minLength: 10,
          maxLength: 500,
          placeholder: 'Décrivez quand et comment cette feature s\'applique (avantage sur certains jets, bonus…).'
        },
        tagsFieldDef()
      ]
    },
    {
      key: 'adjectives',
      type: FIELD_TYPES.TAGS,
      label: 'Adjectifs de personnalité',
      placeholder: 'Ex: audacieux, loyal, rusé',
      helpText: '6 adjectifs suggérés pour la personnalité d\'un personnage issu de cette communauté.',
      maxItems: 8
    },
    {
      key: 'flavor',
      type: FIELD_TYPES.TEXT,
      label: 'Phrase d\'exemple',
      required: false,
      maxLength: 200,
      placeholder: 'Je suis [communauté], alors bien sûr que je sais…',
      helpText: 'Framework : « Je suis [communauté], alors bien sûr que je sais [compétence]. »'
    }
  ]
}
