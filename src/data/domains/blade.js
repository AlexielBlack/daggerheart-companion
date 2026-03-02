/**
 * @module domains/blade
 * @description Blade domain — 21 cartes officielles SRD.
 * Source : DomainCards_SRD.pdf
 */

export const blade = {
  id: 'blade',
  name: 'Blade',
  emoji: '⚔️',
  color: '#dc2626',
  description:
    'The domain of Blade represents weapon mastery and close combat. Blade warriors transform their weapon into an extension of their will.',
  classes: ['Guardian', 'Warrior', 'Assassin'],
  themes: ['Combat', 'Weapons', 'Martial mastery'],
  hasSpells: false,
  cardCount: 21,
  cards: [
    // ── Level 1 (3 cards) ──────────────────────────────
    {
      id: 'blade-get-back-up',
      name: 'Get Back Up',
      level: 1,
      type: 'ability',
      recallCost: 1,
      feature:
        'When you take Severe damage, you can mark a Stress to reduce the severity by one threshold.'
    },
    {
      id: 'blade-not-good-enough',
      name: 'Not Good Enough',
      level: 1,
      type: 'ability',
      recallCost: 1,
      feature: 'When you roll your damage dice, you can reroll any 1s or 2s.'
    },
    {
      id: 'blade-whirlwind',
      name: 'Whirlwind',
      level: 1,
      type: 'ability',
      recallCost: 0,
      feature:
        'When you make a successful attack against a target within Very Close range, you can spend a Hope to use the attack against all other targets within Very Close range. All additional adversaries you succeed against with this ability take half damage.'
    },

    // ── Level 2 (2 cards) ──────────────────────────────
    {
      id: 'blade-a-soldiers-bond',
      name: "A Soldier's Bond",
      level: 2,
      type: 'ability',
      recallCost: 1,
      feature:
        'Once per long rest, when you compliment someone or ask them about something they\'re good at, you can both gain 3 Hope.'
    },
    {
      id: 'blade-reckless',
      name: 'Reckless',
      level: 2,
      type: 'ability',
      recallCost: 1,
      feature: 'Mark a Stress to gain advantage on an attack.'
    },

    // ── Level 3 (2 cards) ──────────────────────────────
    {
      id: 'blade-scramble',
      name: 'Scramble',
      level: 3,
      type: 'ability',
      recallCost: 1,
      feature:
        'Once per rest, when a creature within Melee range would deal damage to you, you can avoid the attack and safely move out of Melee range of the enemy.'
    },
    {
      id: 'blade-versatile-fighter',
      name: 'Versatile Fighter',
      level: 3,
      type: 'ability',
      recallCost: 1,
      feature:
        'You can use a different character trait for an equipped weapon, rather than the trait the weapon calls for. When you deal damage, you can mark a Stress to use the maximum result of one of your damage dice instead of rolling it.'
    },

    // ── Level 4 (2 cards) ──────────────────────────────
    {
      id: 'blade-deadly-focus',
      name: 'Deadly Focus',
      level: 4,
      type: 'ability',
      recallCost: 2,
      feature:
        'Once per rest, you can apply all your focus toward a target of your choice. Until you attack another creature, you defeat the target, or the battle ends, gain a +1 bonus to your Proficiency.'
    },
    {
      id: 'blade-fortified-armor',
      name: 'Fortified Armor',
      level: 4,
      type: 'ability',
      recallCost: 0,
      feature:
        'While you are wearing armor, gain a +2 bonus to your damage thresholds.'
    },

    // ── Level 5 (2 cards) ──────────────────────────────
    {
      id: 'blade-champions-edge',
      name: "Champion's Edge",
      level: 5,
      type: 'ability',
      recallCost: 1,
      feature:
        'When you critically succeed on an attack, you can spend up to 3 Hope and choose one of the following options for each Hope spent: You clear a Hit Point; You clear an Armor Slot; The target must mark an additional Hit Point. You can\'t choose the same option more than once.'
    },
    {
      id: 'blade-vitality',
      name: 'Vitality',
      level: 5,
      type: 'ability',
      recallCost: 0,
      feature:
        'When you choose this card, permanently gain two of the following benefits: One Stress slot; One Hit Point slot; +2 bonus to your damage thresholds. Then place this card in your vault permanently.'
    },

    // ── Level 6 (2 cards) ──────────────────────────────
    {
      id: 'blade-battle-hardened',
      name: 'Battle-Hardened',
      level: 6,
      type: 'ability',
      recallCost: 2,
      feature:
        'Once per long rest when you would make a Death Move, you can spend a Hope to clear a Hit Point instead.'
    },
    {
      id: 'blade-rage-up',
      name: 'Rage Up',
      level: 6,
      type: 'ability',
      recallCost: 1,
      feature:
        'Before you make an attack, you can mark a Stress to gain a bonus to your damage roll equal to twice your Strength. You can Rage Up twice per attack.'
    },

    // ── Level 7 (2 cards) ──────────────────────────────
    {
      id: 'blade-blade-touched',
      name: 'Blade-Touched',
      level: 7,
      type: 'ability',
      recallCost: 1,
      feature:
        'When 4 or more of the domain cards in your loadout are from the Blade domain, gain the following benefits: +2 bonus to your attack rolls; +4 bonus to your Severe damage threshold.'
    },
    {
      id: 'blade-glancing-blow',
      name: 'Glancing Blow',
      level: 7,
      type: 'ability',
      recallCost: 1,
      feature:
        'When you fail an attack, you can mark a Stress to deal weapon damage using half your Proficiency.'
    },

    // ── Level 8 (2 cards) ──────────────────────────────
    {
      id: 'blade-battle-cry',
      name: 'Battle Cry',
      level: 8,
      type: 'ability',
      recallCost: 2,
      feature:
        'Once per long rest, while you\'re charging into danger, you can muster a rousing call that inspires your allies. All allies who can hear you each clear a Stress and gain a Hope. Additionally, your allies gain advantage on attack rolls until you or an ally rolls a failure with Fear.'
    },
    {
      id: 'blade-frenzy',
      name: 'Frenzy',
      level: 8,
      type: 'ability',
      recallCost: 3,
      feature:
        'Once per long rest, you can go into a Frenzy until there are no more adversaries within sight. While Frenzied, you can\'t use Armor Slots, and you gain a +10 bonus to your damage rolls and a +8 bonus to your Severe damage threshold.'
    },

    // ── Level 9 (2 cards) ──────────────────────────────
    {
      id: 'blade-gore-and-glory',
      name: 'Gore and Glory',
      level: 9,
      type: 'ability',
      recallCost: 2,
      feature:
        'When you critically succeed on a weapon attack, gain an additional Hope or clear an additional Stress. Additionally, when you deal enough damage to defeat an enemy, gain a Hope or clear a Stress.'
    },
    {
      id: 'blade-reapers-strike',
      name: "Reaper's Strike",
      level: 9,
      type: 'ability',
      recallCost: 3,
      feature:
        'Once per long rest, spend a Hope to make an attack roll. The GM tells you which targets within range it would succeed against. Choose one of these targets and force them to mark 5 Hit Points.'
    },

    // ── Level 10 (2 cards) ─────────────────────────────
    {
      id: 'blade-battle-monster',
      name: 'Battle Monster',
      level: 10,
      type: 'ability',
      recallCost: 0,
      feature:
        'When you make a successful attack against an adversary, you can mark 4 Stress to force the target to mark a number of Hit Points equal to the number of Hit Points you currently have marked instead of rolling for damage.'
    },
    {
      id: 'blade-onslaught',
      name: 'Onslaught',
      level: 10,
      type: 'ability',
      recallCost: 3,
      feature:
        'When you successfully make an attack with your weapon, you never deal damage beneath a target\'s Major damage threshold (the target always marks a minimum of 2 Hit Points). Additionally, when a creature within your weapon\'s range deals damage to an ally with an attack that doesn\'t include you, you can mark a Stress to force them to make a Reaction Roll (15). On a failure, the target must mark a Hit Point.'
    }
  ]
}
