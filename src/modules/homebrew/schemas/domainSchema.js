/**
 * @module homebrew/schemas/domainSchema
 * @description Schema pour la creation de domaines homebrew.
 * Source : DomainCards_SRD.pdf, Daggerheart_Homebrew_KIT.pdf
 */

import { FIELD_TYPES, tagsFieldDef } from '../core/utils/schemaTypes.js'

export const CARD_TYPES = ['ability', 'spell', 'grimoire']
export const CARD_LEVELS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
export const DOMAIN_COLORS = [
  '#7c3aed', '#dc2626', '#e5e5e5', '#2563eb',
  '#ec4899', '#1e1b4b', '#16a34a', '#f59e0b', '#b91c1c',
  '#06b6d4', '#84cc16', '#a855f7', '#f97316'
]

export const domainSchema = {
  key: 'domain',
  label: 'Domaine',
  icon: '🃏',
  storageKey: 'homebrew-domains',

  fields: [
    {
      key: 'name',
      type: FIELD_TYPES.TEXT,
      label: 'Nom',
      required: true,
      minLength: 2,
      maxLength: 40,
      placeholder: 'Ex: Forge, Shadow, Storm'
    },
    {
      key: 'emoji',
      type: FIELD_TYPES.TEXT,
      label: 'Emoji',
      required: false,
      maxLength: 4,
      placeholder: '🔮'
    },
    {
      key: 'color',
      type: FIELD_TYPES.TEXT,
      label: 'Couleur (hex)',
      required: false,
      maxLength: 7,
      placeholder: '#7c3aed',
      helpText: 'Couleur d\'accent au format hexadecimal.'
    },
    {
      key: 'description',
      type: FIELD_TYPES.TEXTAREA,
      label: 'Description',
      required: true,
      minLength: 10,
      maxLength: 800,
      placeholder: 'Decrivez la thematique de ce domaine…'
    },
    {
      key: 'classes',
      type: FIELD_TYPES.TAGS,
      label: 'Classes associees',
      placeholder: 'Ex: Warrior, Ranger',
      helpText: 'Noms des classes qui utilisent ce domaine.',
      maxItems: 6
    },
    {
      key: 'themes',
      type: FIELD_TYPES.TAGS,
      label: 'Themes',
      placeholder: 'Ex: Feu, Protection, Illusions',
      helpText: 'Fils thematiques qui traversent les cartes du domaine.',
      maxItems: 6
    },
    {
      key: 'hasSpells',
      type: FIELD_TYPES.BOOLEAN,
      label: 'Contient des sorts',
      defaultValue: true,
      helpText: 'En SRD, seuls Bone, Blade et Valor n\'ont pas de sorts.'
    },
    {
      key: 'cards',
      type: FIELD_TYPES.ARRAY,
      label: 'Cartes de domaine',
      helpText: 'SRD : 21 cartes (3 au niv 1, 2 par niv de 2 a 10).',
      maxItems: 30,
      itemSchema: {
        fields: [
          {
            key: 'name',
            type: FIELD_TYPES.TEXT,
            label: 'Nom de la carte',
            required: true,
            minLength: 2,
            maxLength: 60,
            placeholder: 'Ex: Rune Ward, Counterspell'
          },
          {
            key: 'level',
            type: FIELD_TYPES.NUMBER,
            label: 'Niveau',
            required: true,
            min: 1,
            max: 10,
            integer: true,
            defaultValue: 1
          },
          {
            key: 'type',
            type: FIELD_TYPES.SELECT,
            label: 'Type',
            required: true,
            options: ['ability', 'spell', 'grimoire'],
            defaultValue: 'ability'
          },
          {
            key: 'recallCost',
            type: FIELD_TYPES.NUMBER,
            label: 'Cout de rappel',
            required: true,
            min: 0,
            max: 5,
            integer: true,
            defaultValue: 0,
            helpText: '0 = facile, 2 = puissant, 3-4 = tres puissant.'
          },
          {
            key: 'feature',
            type: FIELD_TYPES.TEXTAREA,
            label: 'Feature',
            required: true,
            minLength: 10,
            maxLength: 1000,
            placeholder: 'Decrivez l\'effet mecanique de cette carte…'
          },
          tagsFieldDef()
        ]
      }
    }
  ]
}
