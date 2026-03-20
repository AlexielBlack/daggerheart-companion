export const ACTION_EFFECTS = {
  DAMAGE_HP: 'damage_hp',
  DAMAGE_STRESS: 'damage_stress',
  HEAL_HP: 'heal_hp',
  HEAL_STRESS: 'heal_stress',
  CONDITION: 'condition',
  HOPE: 'hope',
  DOWN: 'down',
  MISS: 'miss'
}

export const ACTION_EFFECT_META = {
  [ACTION_EFFECTS.DAMAGE_HP]: {
    label: 'Dégâts HP',
    emoji: '⚔️',
    hasAmount: true,
    targetTypes: ['adversary', 'pc']
  },
  [ACTION_EFFECTS.DAMAGE_STRESS]: {
    label: 'Dégâts Stress',
    emoji: '💔',
    hasAmount: true,
    targetTypes: ['adversary', 'pc']
  },
  [ACTION_EFFECTS.HEAL_HP]: {
    label: 'Soin HP',
    emoji: '💚',
    hasAmount: true,
    targetTypes: ['pc', 'adversary']
  },
  [ACTION_EFFECTS.HEAL_STRESS]: {
    label: 'Soin Stress',
    emoji: '🩹',
    hasAmount: true,
    targetTypes: ['pc', 'adversary']
  },
  [ACTION_EFFECTS.CONDITION]: {
    label: 'Condition',
    emoji: '⚡',
    hasAmount: false,
    targetTypes: ['adversary', 'pc']
  },
  [ACTION_EFFECTS.HOPE]: {
    label: 'Espoir',
    emoji: '✨',
    hasAmount: true,
    targetTypes: ['pc']
  },
  [ACTION_EFFECTS.DOWN]: {
    label: 'À Terre',
    emoji: '💀',
    hasAmount: false,
    targetTypes: ['adversary', 'pc']
  },
  [ACTION_EFFECTS.MISS]: {
    label: 'Raté',
    emoji: '❌',
    hasAmount: false,
    targetTypes: []
  }
}
