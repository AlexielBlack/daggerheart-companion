/**
 * @module domains/arcana
 * @description Arcana domain — 21 cartes officielles SRD.
 * Source : DomainCards_SRD.pdf
 */

export const arcana = {
  id: 'arcana',
  name: 'Arcana',
  emoji: '🔮',
  color: '#7c3aed',
  description:
    'The domain of Arcana represents pure magic and the manipulation of mystical forces. Practitioners channel raw cosmic energy to unleash supernatural phenomena.',
  classes: ['Druid', 'Sorcerer'],
  themes: ['Arcane magic', 'Elements', 'Mystical forces'],
  hasSpells: true,
  cardCount: 21,
  cards: [
    // ── Level 1 (3 cards) ──────────────────────────────
    {
      id: 'arcana-rune-ward',
      name: 'Rune Ward',
      level: 1,
      type: 'spell',
      recallCost: 0,
      feature:
        'You have a deeply personal trinket that can be infused with protective magic and held as a ward by you or an ally. Describe what it is and why it\'s important to you. The ward\'s holder can spend a Hope to reduce incoming damage by 1d8. If the Ward Die result is 8, the ward\'s power ends after it reduces damage this turn. It can be recharged for free on your next rest.'
    },
    {
      id: 'arcana-unleash-chaos',
      name: 'Unleash Chaos',
      level: 1,
      type: 'spell',
      recallCost: 1,
      feature:
        'At the beginning of a session, place a number of tokens equal to your Spellcast trait on this card. Make a Spellcast Roll against a target within Far range and spend any number of tokens to channel raw energy from within yourself to unleash against them. On a success, roll a number of d10s equal to the tokens you spent and deal that much magic damage to the target. Mark a Stress to replenish this card with tokens (up to your Spellcast trait). At the end of each session, clear all unspent tokens.'
    },
    {
      id: 'arcana-wall-walk',
      name: 'Wall Walk',
      level: 1,
      type: 'spell',
      recallCost: 1,
      feature:
        'Spend a Hope to allow a creature you can touch to climb on walls and ceilings as easily as walking on the ground. This lasts until the end of the scene or you cast Wall Walk again.'
    },

    // ── Level 2 (2 cards) ──────────────────────────────
    {
      id: 'arcana-cinder-grasp',
      name: 'Cinder Grasp',
      level: 2,
      type: 'spell',
      recallCost: 1,
      feature:
        'Make a Spellcast Roll against a target within Melee range. On a success, the target instantly bursts into flames, takes 1d20+3 magic damage, and is temporarily lit On Fire. When a creature acts while On Fire, they must take an extra 2d6 magic damage if they are still On Fire at the end of their action.'
    },
    {
      id: 'arcana-floating-eye',
      name: 'Floating Eye',
      level: 2,
      type: 'spell',
      recallCost: 0,
      feature:
        'Spend a Hope to create a single, small floating orb that you can move anywhere within Very Far range. While this spell is active, you can see through the orb as though you\'re looking out from its position. You can transition between using your own senses and seeing through the orb freely. If the orb takes damage or moves out of range, the spell ends.'
    },

    // ── Level 3 (2 cards) ──────────────────────────────
    {
      id: 'arcana-counterspell',
      name: 'Counterspell',
      level: 3,
      type: 'spell',
      recallCost: 2,
      feature:
        'You can interrupt a magical effect taking place by making a reaction roll using your Spellcast trait. On a success, the effect stops and any consequences are avoided, and this card is placed in your vault.'
    },
    {
      id: 'arcana-flight',
      name: 'Flight',
      level: 3,
      type: 'spell',
      recallCost: 1,
      feature:
        'Make a Spellcast Roll (15). On a success, place a number of tokens equal to your Agility on this card (minimum 1). When you make an action roll while flying, spend a token from this card. After the action that spends the last token is resolved, you descend to the ground directly below you.'
    },

    // ── Level 4 (2 cards) ──────────────────────────────
    {
      id: 'arcana-blink-out',
      name: 'Blink Out',
      level: 4,
      type: 'spell',
      recallCost: 1,
      feature:
        'Make a Spellcast Roll (12). On a success, spend a Hope to teleport to another point you can see within Far range. If any willing creatures are within Very Close range, spend an additional Hope for each creature to bring them with you.'
    },
    {
      id: 'arcana-preservation-blast',
      name: 'Preservation Blast',
      level: 4,
      type: 'spell',
      recallCost: 2,
      feature:
        'Make a Spellcast Roll against all targets within Melee range. Targets you succeed against are forced back to Far range and take d8+3 magic damage using your Spellcast trait.'
    },

    // ── Level 5 (2 cards) ──────────────────────────────
    {
      id: 'arcana-chain-lightning',
      name: 'Chain Lightning',
      level: 5,
      type: 'spell',
      recallCost: 1,
      feature:
        'Mark 2 Stress to make a Spellcast Roll, unleashing lightning on all targets within Close range. Targets you succeed against must make a reaction roll with a Difficulty equal to the result of your Spellcast Roll. Targets who fail take 2d8+4 magic damage. Additional adversaries not already targeted by Chain Lightning and within Close range of previous targets who took damage must also make the reaction roll. Targets who fail take 2d8+4 magic damage. This chain continues until there are no more adversaries within range.'
    },
    {
      id: 'arcana-premonition',
      name: 'Premonition',
      level: 5,
      type: 'spell',
      recallCost: 2,
      feature:
        'You can channel arcane energy to have visions of the future. Once per long rest, immediately after the GM conveys the consequences of a roll you made, you can rescind the move and consequences like they never happened and make another move instead.'
    },

    // ── Level 6 (2 cards) ──────────────────────────────
    {
      id: 'arcana-rift-walker',
      name: 'Rift Walker',
      level: 6,
      type: 'spell',
      recallCost: 2,
      feature:
        'Make a Spellcast Roll (15). On a success, you place an arcane marking on the ground where you currently stand. The next time you successfully cast Rift Walker, a rift in space opens up, providing safe passage back to the exact spot where the marking was placed. This rift stays open until you choose to close it or you cast another spell. You can drop the spell at any time to cast Rift Walker again and place the marking somewhere new.'
    },
    {
      id: 'arcana-telekinesis',
      name: 'Telekinesis',
      level: 6,
      type: 'spell',
      recallCost: 0,
      feature:
        'Make a Spellcast Roll against a target within Far range. On a success, you can use your mind to move them anywhere within Far range of their original position. You can throw the lifted target as an attack by making an additional Spellcast Roll against the second target you\'re trying to attack. On a success, deal d12+4 physical damage to the second target using your Proficiency. This spell then ends.'
    },

    // ── Level 7 (2 cards) ──────────────────────────────
    {
      id: 'arcana-arcana-touched',
      name: 'Arcana-Touched',
      level: 7,
      type: 'ability',
      recallCost: 2,
      feature:
        'When 4 or more of the domain cards in your loadout are from the Arcana domain, gain the following benefits: +1 bonus to your Spellcast Rolls; Once per rest, you can switch the results of your Hope and Fear Dice.'
    },
    {
      id: 'arcana-cloaking-blast',
      name: 'Cloaking Blast',
      level: 7,
      type: 'spell',
      recallCost: 2,
      feature:
        'When you make a successful Spellcast Roll to cast a different spell, you can spend a Hope to become Cloaked. While Cloaked, you remain unseen if you are stationary when an adversary moves to where they would normally see you. When you move into or within an adversary\'s line of sight or make an attack, you are no longer Cloaked.'
    },

    // ── Level 8 (2 cards) ──────────────────────────────
    {
      id: 'arcana-arcane-reflection',
      name: 'Arcane Reflection',
      level: 8,
      type: 'spell',
      recallCost: 1,
      feature:
        'When you would take magic damage, you can spend any number of Hope to roll that many d6s. If any roll a 6, the attack is reflected back to the caster, dealing the damage to them instead.'
    },
    {
      id: 'arcana-confusing-aura',
      name: 'Confusing Aura',
      level: 8,
      type: 'spell',
      recallCost: 2,
      feature:
        'Make a Spellcast Roll (14). Once per long rest on a success, you create a layer of illusion over your body that makes it hard to tell exactly where you are. Mark any number of Stress to make that many additional layers. When an adversary makes an attack against you, roll a number of d6s equal to the number of layers currently active. If any roll a 5 or higher, one layer of the aura is destroyed and the attack fails. If all the results are 4 or lower, you take the damage and this spell ends.'
    },

    // ── Level 9 (2 cards) ──────────────────────────────
    {
      id: 'arcana-earthquake',
      name: 'Earthquake',
      level: 9,
      type: 'spell',
      recallCost: 2,
      feature:
        'Make a Spellcast Roll (16). Once per rest on a success, all targets within Very Far range who aren\'t flying must make a Reaction Roll (18). Targets who fail take 3d10+8 physical damage and are temporarily Vulnerable. Targets who succeed take half damage. Additionally, when you succeed on the Spellcast Roll, all terrain within Very Far range becomes difficult to move through and structures within this range might sustain damage or crumble.'
    },
    {
      id: 'arcana-sensory-projection',
      name: 'Sensory Projection',
      level: 9,
      type: 'spell',
      recallCost: 0,
      feature:
        'Once per rest, make a Spellcast Roll (15). On a success, drop into a vision that lets you clearly see and hear any place you have been before as though you are standing there in this moment. You can move freely in this vision and are not constrained by the physics or impediments of a physical body. This spell cannot be detected by mundane or magical means. You drop out of this vision upon taking damage or casting another spell.'
    },

    // ── Level 10 (2 cards) ─────────────────────────────
    {
      id: 'arcana-adjust-reality',
      name: 'Adjust Reality',
      level: 10,
      type: 'spell',
      recallCost: 1,
      feature:
        'After you or a willing ally make any roll, you can spend 5 Hope to change the numerical result of that roll to a result of your choice instead. The result must be plausible within the range of the dice.'
    },
    {
      id: 'arcana-falling-sky',
      name: 'Falling Sky',
      level: 10,
      type: 'spell',
      recallCost: 1,
      feature:
        'Make a Spellcast Roll against all adversaries within Far range. Mark any number of Stress to make shards of arcana rain down from above. Targets you succeed against take 1d20+2 magic damage for each Stress marked.'
    }
  ]
}
