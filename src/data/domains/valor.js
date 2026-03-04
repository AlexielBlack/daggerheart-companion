/**
 * @module domains/valor
 * @description Valor domain — 21 cartes officielles SRD.
 * Source : DomainCards_SRD.pdf
 */

export const valor = {
  id: 'valor',
  name: 'Valor',
  emoji: '🛡️',
  color: '#1d4ed8',
  description:
    'Le domaine de Valor représente la protection, le sacrifice et la résilience inébranlable. Les guerriers de Valor se tiennent en première ligne, protégeant leurs alliés et encaissant les coups.',
  classes: ['Guardian', 'Seraph'],
  themes: ['Protection', 'Sacrifice', 'Résistance'],
  hasSpells: false,
  cardCount: 21,
  cards: [
    // ── Level 1 (3 cards) ──────────────────────────────
    {
      id: 'valor-bare-bones',
      name: 'Bare Bones',
      level: 1,
      type: 'ability',
      recallCost: 0,
      tags: ['défensif'],
      feature:
        'Quand vous choisissez de ne pas équiper d\'armure, vous avez un Score d\'Armure de base de 3 + votre Force et utilisez les seuils de dégâts de base suivants : Rang 1 : 9/19 ; Rang 2 : 11/24 ; Rang 3 : 13/31 ; Rang 4 : 15/38.',
      activationType: 'passive', cost: { type: 'free', amount: 0 }
    },
    {
      id: 'valor-forceful-push',
      name: 'Forceful Push',
      level: 1,
      type: 'ability',
      recallCost: 0,
      tags: ['offensif'],
      feature:
        'Faites une attaque avec votre arme principale contre une cible à Portée de Mêlée. Sur un succès, vous infligez des dégâts et la repoussez à Portée Proche. Sur un succès avec l\'Espoir, ajoutez un d6 à votre jet de dégâts. De plus, vous pouvez dépenser un Espoir pour la rendre temporairement Vulnérable.',
      activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'atWill', range: 'melee'
    },
    {
      id: 'valor-i-am-your-shield',
      name: 'I Am Your Shield',
      level: 1,
      type: 'ability',
      recallCost: 1,
      tags: ['défensif'],
      feature:
        'Quand un allié à Portée Très Proche subirait des dégâts, vous pouvez marquer un Stress pour vous interposer et devenir la cible de l\'attaque à sa place. Quand vous subissez des dégâts de cette attaque, vous pouvez marquer autant d\'Emplacements d\'Armure que souhaité.',
      activationType: 'reaction', cost: { type: 'stress', amount: 1 }, frequency: 'atWill', range: 'veryClose', trigger: 'Quand un allié à portée très proche subirait des dégâts'
    },

    // ── Level 2 (2 cards) ──────────────────────────────
    {
      id: 'valor-body-basher',
      name: 'Body Basher',
      level: 2,
      type: 'ability',
      recallCost: 1,
      tags: ['offensif'],
      feature:
        'Vous utilisez toute la force de votre corps au combat. Sur une attaque réussie avec une arme à Portée de Mêlée, gagnez un bonus à votre jet de dégâts égal à votre Force.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill', range: 'melee'
    },
    {
      id: 'valor-bold-presence',
      name: 'Bold Presence',
      level: 2,
      type: 'ability',
      recallCost: 0,
      tags: ['social'],
      feature:
        'Quand vous faites un jet de Présence, vous pouvez dépenser un Espoir pour ajouter votre Force au jet. De plus, une fois par repos, quand vous gagneriez une condition, vous pouvez décrire comment votre présence imposante vous aide dans la situation et éviter de gagner la condition.',
      activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'oncePerShortRest'
    },

    // ── Level 3 (2 cards) ──────────────────────────────
    {
      id: 'valor-critical-inspiration',
      name: 'Critical Inspiration',
      level: 3,
      type: 'ability',
      recallCost: 1,
      tags: ['offensif','social'],
      feature:
        'Une fois par repos, quand vous obtenez un succès critique sur une attaque, tous les alliés à Portée Très Proche peuvent effacer un Stress ou gagner un Espoir.',
      activationType: 'reaction', cost: { type: 'free', amount: 0 }, frequency: 'oncePerShortRest', range: 'veryClose', trigger: 'Quand vous obtenez un succès critique sur une attaque'
    },
    {
      id: 'valor-lean-on-me',
      name: 'Lean on Me',
      level: 3,
      type: 'ability',
      recallCost: 1,
      tags: ['social','défensif'],
      feature:
        'Une fois par repos long, quand vous consolez ou inspirez un allié qui a échoué un jet d\'action, vous pouvez tous les deux effacer 2 Stress.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerLongRest'
    },

    // ── Level 4 (2 cards) ──────────────────────────────
    {
      id: 'valor-goad-them-on',
      name: 'Goad Them On',
      level: 4,
      type: 'ability',
      recallCost: 1,
      tags: ['offensif','social'],
      feature:
        'Décrivez comment vous provoquez une cible à Portée Proche, puis faites un jet de Présence contre elle. Sur un succès, la cible doit marquer un Stress, et la prochaine fois que le MJ la met en avant, elle doit vous cibler avec une attaque, qu\'elle effectue avec un désavantage.',
      activationType: 'action', cost: { type: 'stress', amount: 1 }, frequency: 'atWill', range: 'close'
    },
    {
      id: 'valor-support-tank',
      name: 'Support Tank',
      level: 4,
      type: 'ability',
      recallCost: 2,
      tags: ['défensif'],
      feature:
        'Quand un allié à Portée Proche échoue un jet, vous pouvez dépenser 2 Espoir pour lui permettre de relancer son Dé d\'Espoir ou de Peur.',
      activationType: 'action', cost: { type: 'hope', amount: 2 }, frequency: 'atWill', range: 'close'
    },

    // ── Level 5 (2 cards) ──────────────────────────────
    {
      id: 'valor-armorer',
      name: 'Armorer',
      level: 5,
      type: 'ability',
      recallCost: 1,
      tags: ['défensif'],
      feature:
        'Tant que vous portez une armure, gagnez un bonus de +1 à votre Score d\'Armure. Pendant un repos, quand vous choisissez de réparer votre armure comme mouvement de repos, vos alliés effacent aussi un Emplacement d\'Armure.',
      activationType: 'passive', cost: { type: 'free', amount: 0 }
    },
    {
      id: 'valor-rousing-strike',
      name: 'Rousing Strike',
      level: 5,
      type: 'ability',
      recallCost: 1,
      tags: ['offensif','défensif'],
      feature:
        'Une fois par repos, quand vous obtenez un succès critique sur une attaque, vous et tous les alliés qui peuvent vous voir ou vous entendre pouvez effacer un Point de Vie ou 1d4 Stress.',
      activationType: 'reaction', cost: { type: 'free', amount: 0 }, frequency: 'oncePerShortRest', trigger: 'Quand vous obtenez un succès critique sur une attaque'
    },

    // ── Level 6 (2 cards) ──────────────────────────────
    {
      id: 'valor-inevitable',
      name: 'Inevitable',
      level: 6,
      type: 'ability',
      recallCost: 1,
      tags: ['utilitaire'],
      feature:
        'Quand vous échouez un jet d\'action, votre prochain jet d\'action bénéficie d\'un avantage.',
      activationType: 'reaction', cost: { type: 'free', amount: 0 }, frequency: 'atWill', trigger: 'Quand vous échouez un jet d\'action'
    },
    {
      id: 'valor-rise-up',
      name: 'Rise Up',
      level: 6,
      type: 'ability',
      recallCost: 2,
      tags: ['défensif'],
      feature:
        'Gagnez un bonus à votre seuil de dégâts Sévères égal à votre Maîtrise. Quand vous marquez 1 ou plusieurs Points de Vie suite à une attaque, effacez un Stress.',
      activationType: 'reaction', cost: { type: 'free', amount: 0 }, frequency: 'atWill', trigger: 'Quand vous marquez 1 ou plusieurs points de vie suite à une attaque, effacez un stress'
    },

    // ── Level 7 (2 cards) ──────────────────────────────
    {
      id: 'valor-shrug-it-off',
      name: 'Shrug It Off',
      level: 7,
      type: 'ability',
      recallCost: 1,
      tags: ['défensif'],
      feature:
        'Quand vous subiriez des dégâts, vous pouvez marquer un Stress pour réduire la sévérité des dégâts d\'un palier. Ce faisant, lancez un d6. Sur un résultat de 3 ou moins, placez cette carte dans votre coffre.',
      activationType: 'passive', cost: { type: 'stress', amount: 1 }
    },
    {
      id: 'valor-valor-touched',
      name: 'Valor-Touched',
      level: 7,
      type: 'ability',
      recallCost: 1,
      tags: ['défensif'],
      feature:
        'Quand 4 ou plus des cartes de domaine de votre équipement sont du domaine Valor, vous gagnez les bénéfices suivants : bonus de +1 à votre Score d\'Armure ; Quand vous marquez 1 ou plusieurs Points de Vie sans marquer d\'Emplacement d\'Armure, effacez un Emplacement d\'Armure.',
      activationType: 'reaction', cost: { type: 'free', amount: 0 }, frequency: 'atWill', trigger: 'Quand 4 ou plus des cartes de domaine de votre équipement sont du domaine valor'
    },

    // ── Level 8 (2 cards) ──────────────────────────────
    {
      id: 'valor-full-surge',
      name: 'Full Surge',
      level: 8,
      type: 'ability',
      recallCost: 1,
      tags: ['offensif','défensif'],
      feature:
        'Une fois par repos long, marquez 3 Stress pour pousser votre corps à ses limites. Gagnez un bonus de +2 à tous vos traits de personnage jusqu\'à votre prochain repos.',
      activationType: 'passive', cost: { type: 'stress', amount: 3 }, frequency: 'oncePerLongRest'
    },
    {
      id: 'valor-ground-pound',
      name: 'Ground Pound',
      level: 8,
      type: 'ability',
      recallCost: 2,
      tags: ['offensif'],
      feature:
        'Dépensez 2 Espoir pour frapper le sol où vous vous tenez et faites un jet de Force contre toutes les cibles à Portée Très Proche. Les cibles contre lesquelles vous réussissez sont projetées à Portée Lointaine et doivent faire un Jet de Réaction (17). Celles qui échouent subissent 4d10+8 dégâts. Celles qui réussissent subissent la moitié des dégâts.',
      activationType: 'action', cost: { type: 'hope', amount: 2 }, frequency: 'atWill', range: 'veryClose'
    },

    // ── Level 9 (2 cards) ──────────────────────────────
    {
      id: 'valor-hold-the-line',
      name: 'Hold the Line',
      level: 9,
      type: 'ability',
      recallCost: 1,
      tags: ['défensif'],
      feature:
        'Décrivez la posture défensive que vous adoptez et dépensez un Espoir. Si un adversaire se déplace à Portée Très Proche, il est attiré à Portée de Mêlée et Entravé. Cette condition dure jusqu\'à ce que vous vous déplaciez ou échouiez un jet avec la Peur, ou que le MJ dépense 2 Peur lors de son tour pour la lever.',
      activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'atWill', range: 'veryClose'
    },
    {
      id: 'valor-lead-by-example',
      name: 'Lead by Example',
      level: 9,
      type: 'ability',
      recallCost: 3,
      tags: ['offensif','social'],
      feature:
        'Quand vous infligez des dégâts à un adversaire, vous pouvez marquer un Stress et décrire comment vous encouragez vos alliés. Le prochain PJ à effectuer une attaque contre cet adversaire peut effacer un Stress ou gagner un Espoir.',
      activationType: 'action', cost: { type: 'stress', amount: 1 }, frequency: 'atWill'
    },

    // ── Level 10 (2 cards) ─────────────────────────────
    {
      id: 'valor-unbreakable',
      name: 'Unbreakable',
      level: 10,
      type: 'ability',
      recallCost: 4,
      tags: ['défensif'],
      feature:
        'Quand vous marquez votre dernier Point de Vie, au lieu de faire un mouvement de mort, vous pouvez lancer un d6 et effacer un nombre de Points de Vie égal au résultat. Puis placez cette carte dans votre coffre.',
      activationType: 'reaction', cost: { type: 'free', amount: 0 }, frequency: 'atWill', trigger: 'Quand vous marquez votre dernier point de vie, au lieu de faire un mouvement de mort'
    },
    {
      id: 'valor-unyielding-armor',
      name: 'Unyielding Armor',
      level: 10,
      type: 'ability',
      recallCost: 1,
      tags: ['défensif'],
      feature:
        'Quand vous devriez marquer un Emplacement d\'Armure, lancez un nombre de d6 égal à votre Maîtrise. Si l\'un donne un 6, réduisez la sévérité d\'un palier sans marquer d\'Emplacement d\'Armure.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill'
    }
  ]
}
