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
    'Le domaine de Blade représente la maîtrise des armes et le combat rapproché. Les guerriers de Blade transforment leur arme en une extension de leur volonté.',
  classes: ['Guardian', 'Warrior', 'Assassin'],
  themes: ['Combat', 'Armes', 'Maîtrise martiale'],
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
      tags: ['défensif'],
      feature:
        'Quand vous subissez des dégâts Sévères, vous pouvez marquer un Stress pour réduire la sévérité d\'un palier.',
      activationType: 'reaction', cost: { type: 'stress', amount: 1 }, frequency: 'atWill', trigger: 'Quand vous subissez des dégâts sévères'
    },
    {
      id: 'blade-not-good-enough',
      name: 'Not Good Enough',
      level: 1,
      type: 'ability',
      recallCost: 1,
      tags: ['offensif'],
      feature: 'Quand vous lancez vos dés de dégâts, vous pouvez relancer tous les 1 et les 2.',
      activationType: 'reaction', cost: { type: 'free', amount: 0 }, frequency: 'atWill', trigger: 'Quand vous lancez vos dés de dégâts, vous pouvez relancer tous les 1 et les 2'
    },
    {
      id: 'blade-whirlwind',
      name: 'Whirlwind',
      level: 1,
      type: 'ability',
      recallCost: 0,
      tags: ['offensif'],
      feature:
        'Quand vous réussissez une attaque contre une cible à Portée Très Proche, vous pouvez dépenser un Espoir pour utiliser l\'attaque contre toutes les autres cibles à Portée Très Proche. Tous les adversaires supplémentaires contre lesquels vous réussissez avec cette capacité subissent la moitié des dégâts.',
      activationType: 'reaction', cost: { type: 'hope', amount: 1 }, frequency: 'atWill', range: 'veryClose', trigger: 'Quand vous réussissez une attaque contre une cible à portée très proche'
    },

    // ── Level 2 (2 cards) ──────────────────────────────
    {
      id: 'blade-a-soldiers-bond',
      name: "A Soldier's Bond",
      level: 2,
      type: 'ability',
      recallCost: 1,
      tags: ['social'],
      feature:
        'Une fois par repos long, quand vous complimentez quelqu\'un ou lui posez une question sur quelque chose dans lequel il excelle, vous gagnez tous les deux 3 Espoir.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerLongRest'
    },
    {
      id: 'blade-reckless',
      name: 'Reckless',
      level: 2,
      type: 'ability',
      recallCost: 1,
      tags: ['offensif'],
      feature: 'Marquez un Stress pour obtenir un avantage sur une attaque.',
      activationType: 'action', cost: { type: 'stress', amount: 1 }, frequency: 'atWill'
    },

    // ── Level 3 (2 cards) ──────────────────────────────
    {
      id: 'blade-scramble',
      name: 'Scramble',
      level: 3,
      type: 'ability',
      recallCost: 1,
      tags: ['défensif'],
      feature:
        'Une fois par repos, quand une créature à Portée de Mêlée vous infligerait des dégâts, vous pouvez esquiver l\'attaque et vous déplacer en sécurité hors de Portée de Mêlée de l\'ennemi.',
      activationType: 'reaction', cost: { type: 'free', amount: 0 }, frequency: 'oncePerShortRest', range: 'melee', trigger: 'Quand une créature à portée de mêlée vous infligerait des dégâts'
    },
    {
      id: 'blade-versatile-fighter',
      name: 'Versatile Fighter',
      level: 3,
      type: 'ability',
      recallCost: 1,
      tags: ['offensif'],
      feature:
        'Vous pouvez utiliser un trait de personnage différent pour une arme équipée, plutôt que le trait requis par l\'arme. Quand vous infligez des dégâts, vous pouvez marquer un Stress pour utiliser le résultat maximum d\'un de vos dés de dégâts au lieu de le lancer.',
      activationType: 'action', cost: { type: 'stress', amount: 1 }, frequency: 'atWill'
    },

    // ── Level 4 (2 cards) ──────────────────────────────
    {
      id: 'blade-deadly-focus',
      name: 'Deadly Focus',
      level: 4,
      type: 'ability',
      recallCost: 2,
      tags: ['offensif'],
      feature:
        'Une fois par repos, vous pouvez concentrer toute votre attention sur une cible de votre choix. Jusqu\'à ce que vous attaquiez une autre créature, que vous vainquiez la cible ou que le combat se termine, gagnez un bonus de +1 à votre Maîtrise.',
      activationType: 'passive', cost: { type: 'free', amount: 0 }, frequency: 'oncePerShortRest'
    },
    {
      id: 'blade-fortified-armor',
      name: 'Fortified Armor',
      level: 4,
      type: 'ability',
      recallCost: 0,
      tags: ['défensif'],
      feature:
        'Tant que vous portez une armure, gagnez un bonus de +2 à vos seuils de dégâts.',
      activationType: 'passive', cost: { type: 'free', amount: 0 }
    },

    // ── Level 5 (2 cards) ──────────────────────────────
    {
      id: 'blade-champions-edge',
      name: "Champion's Edge",
      level: 5,
      type: 'ability',
      recallCost: 1,
      tags: ['offensif'],
      feature:
        'Quand vous obtenez un succès critique sur une attaque, vous pouvez dépenser jusqu\'à 3 Espoir et choisir une des options suivantes pour chaque Espoir dépensé : Vous effacez un Point de Vie ; Vous effacez un Emplacement d\'Armure ; La cible doit marquer un Point de Vie supplémentaire. Vous ne pouvez pas choisir la même option plus d\'une fois.',
      activationType: 'reaction', cost: { type: 'free', amount: 0 }, frequency: 'atWill', trigger: 'Quand vous obtenez un succès critique sur une attaque'
    },
    {
      id: 'blade-vitality',
      name: 'Vitality',
      level: 5,
      type: 'ability',
      recallCost: 0,
      tags: ['défensif'],
      feature:
        'Quand vous choisissez cette carte, gagnez définitivement deux des bénéfices suivants : Un emplacement de Stress ; Un emplacement de Point de Vie ; Un bonus de +2 à vos seuils de dégâts. Puis placez cette carte dans votre coffre de façon permanente.',
      activationType: 'passive', cost: { type: 'free', amount: 0 }
    },

    // ── Level 6 (2 cards) ──────────────────────────────
    {
      id: 'blade-battle-hardened',
      name: 'Battle-Hardened',
      level: 6,
      type: 'ability',
      recallCost: 2,
      tags: ['défensif'],
      feature:
        'Une fois par repos long, quand vous devriez effectuer un Mouvement de Mort, vous pouvez dépenser un Espoir pour effacer un Point de Vie à la place.',
      activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'oncePerLongRest'
    },
    {
      id: 'blade-rage-up',
      name: 'Rage Up',
      level: 6,
      type: 'ability',
      recallCost: 1,
      tags: ['offensif'],
      feature:
        'Avant de faire une attaque, vous pouvez marquer un Stress pour gagner un bonus à votre jet de dégâts égal au double de votre Force. Vous pouvez utiliser Rage Up deux fois par attaque.',
      activationType: 'action', cost: { type: 'stress', amount: 1 }, frequency: 'atWill'
    },

    // ── Level 7 (2 cards) ──────────────────────────────
    {
      id: 'blade-blade-touched',
      name: 'Blade-Touched',
      level: 7,
      type: 'ability',
      recallCost: 1,
      tags: ['offensif','défensif'],
      feature:
        'Quand 4 ou plus des cartes de domaine de votre équipement sont du domaine Blade, vous gagnez les bénéfices suivants : bonus de +2 à vos jets d\'attaque ; bonus de +4 à votre seuil de dégâts Sévères.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill'
    },
    {
      id: 'blade-glancing-blow',
      name: 'Glancing Blow',
      level: 7,
      type: 'ability',
      recallCost: 1,
      tags: ['défensif'],
      feature:
        'Quand vous ratez une attaque, vous pouvez marquer un Stress pour infliger des dégâts d\'arme en utilisant la moitié de votre Maîtrise.',
      activationType: 'action', cost: { type: 'stress', amount: 1 }, frequency: 'atWill'
    },

    // ── Level 8 (2 cards) ──────────────────────────────
    {
      id: 'blade-battle-cry',
      name: 'Battle Cry',
      level: 8,
      type: 'ability',
      recallCost: 2,
      tags: ['offensif','social'],
      feature:
        'Une fois par repos long, alors que vous chargez vers le danger, vous pouvez pousser un cri galvanisant qui inspire vos alliés. Tous les alliés qui vous entendent effacent chacun un Stress et gagnent un Espoir. De plus, vos alliés obtiennent un avantage sur les jets d\'attaque jusqu\'à ce que vous ou un allié obteniez un échec avec la Peur.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerLongRest'
    },
    {
      id: 'blade-frenzy',
      name: 'Frenzy',
      level: 8,
      type: 'ability',
      recallCost: 3,
      tags: ['offensif'],
      feature:
        'Une fois par repos long, vous pouvez entrer en Frénésie jusqu\'à ce qu\'il n\'y ait plus d\'adversaires en vue. En Frénésie, vous ne pouvez pas utiliser les Emplacements d\'Armure, et vous gagnez un bonus de +10 à vos jets de dégâts et un bonus de +8 à votre seuil de dégâts Sévères.',
      activationType: 'passive', cost: { type: 'free', amount: 0 }, frequency: 'oncePerLongRest'
    },

    // ── Level 9 (2 cards) ──────────────────────────────
    {
      id: 'blade-gore-and-glory',
      name: 'Gore and Glory',
      level: 9,
      type: 'ability',
      recallCost: 2,
      tags: ['offensif','défensif'],
      feature:
        'Quand vous obtenez un succès critique sur une attaque d\'arme, gagnez un Espoir supplémentaire ou effacez un Stress supplémentaire. De plus, quand vous infligez suffisamment de dégâts pour vaincre un ennemi, gagnez un Espoir ou effacez un Stress.',
      activationType: 'reaction', cost: { type: 'free', amount: 0 }, frequency: 'atWill', trigger: 'Quand vous obtenez un succès critique sur une attaque d\'arme'
    },
    {
      id: 'blade-reapers-strike',
      name: "Reaper's Strike",
      level: 9,
      type: 'ability',
      recallCost: 3,
      tags: ['offensif'],
      feature:
        'Une fois par repos long, dépensez un Espoir pour faire un jet d\'attaque. Le MJ vous indique quelles cibles à portée seraient touchées. Choisissez l\'une de ces cibles et forcez-la à marquer 5 Points de Vie.',
      activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'oncePerLongRest'
    },

    // ── Level 10 (2 cards) ─────────────────────────────
    {
      id: 'blade-battle-monster',
      name: 'Battle Monster',
      level: 10,
      type: 'ability',
      recallCost: 0,
      tags: ['offensif','défensif'],
      feature:
        'Quand vous réussissez une attaque contre un adversaire, vous pouvez marquer 4 Stress pour forcer la cible à marquer un nombre de Points de Vie égal au nombre de Points de Vie que vous avez actuellement marqués, au lieu de lancer les dégâts.',
      activationType: 'reaction', cost: { type: 'stress', amount: 4 }, frequency: 'atWill', trigger: 'Quand vous réussissez une attaque contre un adversaire'
    },
    {
      id: 'blade-onslaught',
      name: 'Onslaught',
      level: 10,
      type: 'ability',
      recallCost: 3,
      tags: ['offensif'],
      feature:
        'Quand vous réussissez une attaque avec votre arme, vous n\'infligez jamais de dégâts en dessous du seuil de dégâts Majeurs de la cible (la cible marque toujours un minimum de 2 Points de Vie). De plus, quand une créature à portée de votre arme inflige des dégâts à un allié avec une attaque qui ne vous inclut pas, vous pouvez marquer un Stress pour la forcer à faire un Jet de Réaction (15). Sur un échec, la cible doit marquer un Point de Vie.',
      activationType: 'reaction', cost: { type: 'stress', amount: 1 }, frequency: 'atWill', trigger: 'Quand vous réussissez une attaque avec votre arme'
    }
  ]
}
