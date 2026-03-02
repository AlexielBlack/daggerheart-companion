/**
 * @module domains/splendor
 * @description Splendor domain — 21 cartes officielles SRD.
 * Source : DomainCards_SRD.pdf
 */

export const splendor = {
  id: 'splendor',
  name: 'Splendor',
  emoji: '☀️',
  color: '#f59e0b',
  description:
    'Le domaine de Splendor représente la lumière, la guérison et la protection divine. Les adeptes de Splendor soignent les blessures et repoussent les ténèbres.',
  classes: ['Seraph', 'Wizard'],
  themes: ['Lumière', 'Guérison', 'Protection'],
  hasSpells: true,
  cardCount: 21,
  cards: [
    // ── Level 1 (3 cards) ──────────────────────────────
    {
      id: 'splendor-bolt-beacon',
      name: 'Bolt Beacon',
      level: 1,
      type: 'spell',
      recallCost: 1,
      feature:
        'Faites un jet de Sort contre une cible à Portée Lointaine. Sur un succès, dépensez un Espoir pour envoyer un rayon de lumière chatoyante vers elle, infligeant d8+2 dégâts magiques en utilisant votre Maîtrise. La cible devient temporairement Vulnérable et brille intensément jusqu\'à ce que cette condition soit levée.'
    },
    {
      id: 'splendor-mending-touch',
      name: 'Mending Touch',
      level: 1,
      type: 'spell',
      recallCost: 1,
      feature:
        'Vous posez vos mains sur une créature et canalisez la magie curative pour refermer ses plaies. Quand vous pouvez prendre quelques minutes pour vous concentrer sur la cible que vous aidez, vous pouvez dépenser 2 Espoir pour effacer un Point de Vie ou un Stress sur elle. Une fois par repos long, quand vous passez ce temps de soin à apprendre quelque chose de nouveau sur elle ou à révéler quelque chose sur vous-même, vous pouvez effacer 2 Points de Vie ou 2 Stress sur elle à la place.'
    },
    {
      id: 'splendor-reassurance',
      name: 'Reassurance',
      level: 1,
      type: 'ability',
      recallCost: 0,
      feature:
        'Une fois par repos, après qu\'un allié tente un jet d\'action mais avant que les conséquences ne prennent effet, vous pouvez offrir assistance ou des paroles de soutien. Quand vous le faites, votre allié peut relancer ses dés.'
    },

    // ── Level 2 (2 cards) ──────────────────────────────
    {
      id: 'splendor-final-words',
      name: 'Final Words',
      level: 2,
      type: 'spell',
      recallCost: 1,
      feature:
        'Vous pouvez insuffler un instant de vie à un cadavre pour lui parler. Faites un jet de Sort (13). Sur un succès avec Espoir, le cadavre répond à jusqu\'à trois questions. Sur un succès avec Peur, le cadavre répond à une question. Le cadavre répond sincèrement, mais ne peut pas transmettre des informations qu\'il ne connaissait pas de son vivant. Sur un échec, ou une fois que le cadavre a fini de répondre, le corps tombe en poussière.'
    },
    {
      id: 'splendor-healing-hands',
      name: 'Healing Hands',
      level: 2,
      type: 'spell',
      recallCost: 1,
      feature:
        'Faites un jet de Sort (13) et ciblez une créature autre que vous-même à Portée de Mêlée. Sur un succès, marquez un Stress pour effacer 2 Points de Vie ou 2 Stress sur la cible. Sur un échec, marquez un Stress pour effacer un Point de Vie ou un Stress sur la cible. Vous ne pouvez pas soigner la même cible à nouveau avant votre prochain repos long.'
    },

    // ── Level 3 (2 cards) ──────────────────────────────
    {
      id: 'splendor-second-wind',
      name: 'Second Wind',
      level: 3,
      type: 'ability',
      recallCost: 2,
      feature:
        'Une fois par repos, quand vous réussissez une attaque contre un adversaire, vous pouvez effacer 3 Stress ou un Point de Vie. Sur un succès avec Espoir, vous effacez aussi 3 Stress ou un Point de Vie sur un allié à Portée Proche de vous.'
    },
    {
      id: 'splendor-voice-of-reason',
      name: 'Voice of Reason',
      level: 3,
      type: 'ability',
      recallCost: 1,
      feature:
        'Vous parlez avec une puissance et une autorité inégalées. Vous avez l\'avantage sur les jets d\'action pour désamorcer des situations violentes ou convaincre quelqu\'un de suivre votre direction. De plus, vous êtes enhardi dans les moments de détresse. Quand tous vos emplacements de Stress sont marqués, vous gagnez un bonus de +1 à votre Maîtrise pour les jets de dégâts.'
    },

    // ── Level 4 (2 cards) ──────────────────────────────
    {
      id: 'splendor-divination',
      name: 'Divination',
      level: 4,
      type: 'spell',
      recallCost: 1,
      feature:
        'Une fois par repos long, dépensez 3 Espoir pour atteindre les forces au-delà et poser une question « oui ou non » sur un événement, une personne, un lieu ou une situation dans le futur proche. Pendant un instant, le présent s\'efface et vous voyez la réponse devant vous.'
    },
    {
      id: 'splendor-life-ward',
      name: 'Life Ward',
      level: 4,
      type: 'spell',
      recallCost: 1,
      feature:
        'Dépensez 3 Espoir et choisissez un allié à Portée Proche. Il est marqué d\'un sceau lumineux de protection. Quand cet allié devrait faire un mouvement de mort, il efface un Point de Vie à la place. Cet effet prend fin quand il sauve la cible d\'un mouvement de mort, que vous lancez Life Ward sur une autre cible, ou que vous prenez un repos long.'
    },

    // ── Level 5 (2 cards) ──────────────────────────────
    {
      id: 'splendor-shape-material',
      name: 'Shape Material',
      level: 5,
      type: 'spell',
      recallCost: 1,
      feature:
        'Dépensez un Espoir pour façonner une section de matériau naturel que vous touchez (comme la pierre, la glace ou le bois) selon vos besoins. La zone du matériau ne peut pas être plus grande que vous. Par exemple, vous pouvez former un outil rudimentaire ou créer une porte. Vous ne pouvez affecter le matériau qu\'à Portée Proche de l\'endroit où vous le touchez.'
    },
    {
      id: 'splendor-smite',
      name: 'Smite',
      level: 5,
      type: 'spell',
      recallCost: 2,
      feature:
        'Une fois par repos, dépensez 3 Espoir pour charger votre châtiment puissant. Quand vous réussissez ensuite une attaque avec une arme, doublez le résultat de votre jet de dégâts. Cette attaque inflige des dégâts magiques quel que soit le type de dégâts de l\'arme.'
    },

    // ── Level 6 (2 cards) ──────────────────────────────
    {
      id: 'splendor-restoration',
      name: 'Restoration',
      level: 6,
      type: 'spell',
      recallCost: 2,
      feature:
        'Après un repos long, placez un nombre de jetons égal à votre trait de Sort sur cette carte. Touchez une créature et dépensez autant de jetons que vous le souhaitez pour effacer 2 Points de Vie ou 2 Stress par jeton dépensé. Vous pouvez aussi dépenser un jeton de cette carte en touchant une créature pour lever la condition Vulnérable ou guérir un mal physique ou magique (le MJ peut exiger des jetons supplémentaires selon la gravité du mal). Lors d\'un repos long, retirez tous les jetons non dépensés.'
    },
    {
      id: 'splendor-zone-of-protection',
      name: 'Zone of Protection',
      level: 6,
      type: 'spell',
      recallCost: 2,
      feature:
        'Faites un jet de Sort (16). Une fois par repos long sur un succès, choisissez un point à Portée Lointaine et créez une zone de protection visible pour tous les alliés à Portée Très Proche de ce point. Placez un d6 sur cette carte avec la face 1 vers le haut. Quand un allié dans cette zone subit des dégâts, il les réduit de la valeur du dé. Vous augmentez ensuite la valeur du dé de un. Quand la valeur du dé dépasserait 6, cet effet prend fin.'
    },

    // ── Level 7 (2 cards) ──────────────────────────────
    {
      id: 'splendor-healing-strike',
      name: 'Healing Strike',
      level: 7,
      type: 'spell',
      recallCost: 1,
      feature:
        'Quand vous infligez des dégâts à un adversaire, vous pouvez dépenser 2 Espoir pour effacer un Point de Vie sur un allié à Portée Proche.'
    },
    {
      id: 'splendor-splendor-touched',
      name: 'Splendor-Touched',
      level: 7,
      type: 'ability',
      recallCost: 2,
      feature:
        'Quand 4 ou plus des cartes de domaine de votre équipement sont du domaine Splendor, vous gagnez les bénéfices suivants : bonus de +3 à votre seuil de dégâts Sévères ; Une fois par repos long, quand des dégâts entrants vous obligeraient à marquer un certain nombre de Points de Vie, vous pouvez choisir de marquer autant de Stress ou de dépenser autant d\'Espoir à la place.'
    },

    // ── Level 8 (2 cards) ──────────────────────────────
    {
      id: 'splendor-shield-aura',
      name: 'Shield Aura',
      level: 8,
      type: 'spell',
      recallCost: 2,
      feature:
        'Marquez un Stress pour lancer une aura protectrice sur une cible à Portée Très Proche. Quand la cible marque un Emplacement d\'Armure, elle réduit la sévérité de l\'attaque d\'un palier supplémentaire. Si ce sort fait qu\'une créature qui aurait subi des dégâts ne marque finalement aucun Point de Vie, l\'effet prend fin. Vous ne pouvez maintenir Shield Aura que sur une créature à la fois.'
    },
    {
      id: 'splendor-stunning-sunlight',
      name: 'Stunning Sunlight',
      level: 8,
      type: 'spell',
      recallCost: 2,
      feature:
        'Faites un jet de Sort pour déchaîner de puissants rayons de lumière brûlante contre tous les adversaires devant vous à Portée Lointaine. Sur un succès, dépensez autant d\'Espoir que vous le souhaitez et forcez autant de cibles touchées à faire un Jet de Réaction (14). Les cibles qui réussissent subissent 3d20+3 dégâts magiques. Les cibles qui échouent subissent 4d20+5 dégâts magiques et sont temporairement Étourdies. Tant qu\'elles sont Étourdies, elles ne peuvent pas utiliser de réactions ni effectuer d\'autres actions jusqu\'à ce qu\'elles lèvent cette condition.'
    },

    // ── Level 9 (2 cards) ──────────────────────────────
    {
      id: 'splendor-overwhelming-aura',
      name: 'Overwhelming Aura',
      level: 9,
      type: 'spell',
      recallCost: 2,
      feature:
        'Faites un jet de Sort (15) pour renforcer magiquement votre aura. Sur un succès, dépensez 2 Espoir pour rendre votre Présence égale à votre trait de Sort jusqu\'à votre prochain repos long. Tant que ce sort est actif, un adversaire doit marquer un Stress quand il vous cible avec une attaque.'
    },
    {
      id: 'splendor-salvation-beam',
      name: 'Salvation Beam',
      level: 9,
      type: 'spell',
      recallCost: 2,
      feature:
        'Faites un jet de Sort (16). Sur un succès, marquez autant de Stress que vous le souhaitez pour cibler une ligne d\'alliés à Portée Lointaine. Vous pouvez effacer sur les cibles un nombre de Points de Vie égal au nombre de Stress marqués, répartis entre elles comme vous le souhaitez.'
    },

    // ── Level 10 (2 cards) ─────────────────────────────
    {
      id: 'splendor-invigoration',
      name: 'Invigoration',
      level: 10,
      type: 'spell',
      recallCost: 3,
      feature:
        'Quand vous ou un allié à Portée Proche avez utilisé une capacité avec une limite d\'épuisement (comme une fois par repos ou une fois par session), vous pouvez dépenser autant d\'Espoir que vous le souhaitez et lancer autant de d6. Si l\'un donne un 6, la capacité peut être utilisée à nouveau.'
    },
    {
      id: 'splendor-resurrection',
      name: 'Resurrection',
      level: 10,
      type: 'spell',
      recallCost: 2,
      feature:
        'Faites un jet de Sort (20). Sur un succès, ramenez à la vie une créature morte depuis 100 ans ou moins en pleine santé. Puis lancez un d6. Sur un résultat de 5 ou moins, placez cette carte dans votre coffre de façon permanente. Sur un échec, vous ne pouvez pas relancer Resurrection pendant une semaine.'
    }
  ]
}
