/**
 * @module domains/grace
 * @description Grace domain — 21 cartes officielles SRD.
 * Source : DomainCards_SRD.pdf
 */

export const grace = {
  id: 'grace',
  name: 'Grace',
  emoji: '✨',
  color: '#ec4899',
  description:
    'Le domaine de Grace représente le charisme, la ruse et l\'influence sociale. Les pratiquants de Grace excellent dans la manipulation, l\'illusion et l\'inspiration de leurs alliés.',
  classes: ['Bard', 'Rogue', 'Duellist'],
  themes: ['Charisme', 'Illusions', 'Influence'],
  hasSpells: true,
  cardCount: 21,
  cards: [
    // ── Level 1 (3 cards) ──────────────────────────────
    {
      id: 'grace-deft-deceiver',
      name: 'Deft Deceiver',
      level: 1,
      type: 'ability',
      recallCost: 0,
      feature:
        'Dépensez un Espoir pour obtenir un avantage sur un jet visant à tromper ou manipuler quelqu\'un pour lui faire croire un mensonge que vous lui racontez.'
    },
    {
      id: 'grace-enrapture',
      name: 'Enrapture',
      level: 1,
      type: 'spell',
      recallCost: 0,
      feature:
        'Faites un jet de Sort contre une cible à Portée Proche. Sur un succès, elle devient temporairement Envoûtée. Tant qu\'elle est Envoûtée, l\'attention de la cible est fixée sur vous, rétrécissant son champ de vision et noyant tout son sauf votre voix. Une fois par repos sur un succès, vous pouvez marquer un Stress pour forcer la cible Envoûtée à marquer un Stress également.'
    },
    {
      id: 'grace-inspirational-words',
      name: 'Inspirational Words',
      level: 1,
      type: 'ability',
      recallCost: 1,
      feature:
        'Votre discours est imprégné de pouvoir. Après un repos long, placez un nombre de jetons égal à votre Présence sur cette carte. Quand vous parlez avec un allié, vous pouvez dépenser un jeton de cette carte pour lui accorder l\'un des bénéfices suivants : L\'allié efface un Stress ; L\'allié efface un Point de Vie ; L\'allié gagne un Espoir. Lors d\'un repos long, retirez tous les jetons non dépensés.'
    },

    // ── Level 2 (2 cards) ──────────────────────────────
    {
      id: 'grace-tell-no-lies',
      name: 'Tell No Lies',
      level: 2,
      type: 'spell',
      recallCost: 1,
      feature:
        'Faites un jet de Sort contre une cible à Portée Très Proche. Sur un succès, elle ne peut pas vous mentir tant qu\'elle reste à Portée Proche, mais n\'est pas obligée de parler. Si vous lui posez une question et qu\'elle refuse de répondre, elle doit marquer un Stress et l\'effet prend fin. La cible ignore généralement que ce sort a été lancé sur elle jusqu\'à ce qu\'il la pousse à dire la vérité.'
    },
    {
      id: 'grace-troublemaker',
      name: 'Troublemaker',
      level: 2,
      type: 'ability',
      recallCost: 2,
      feature:
        'Quand vous provoquez ou raillez une cible à Portée Lointaine, faites un jet de Présence contre elle. Une fois par repos sur un succès, lancez un nombre de d4 égal à votre Maîtrise. La cible doit marquer un Stress égal au résultat le plus élevé obtenu.'
    },

    // ── Level 3 (2 cards) ──────────────────────────────
    {
      id: 'grace-hypnotic-shimmer',
      name: 'Hypnotic Shimmer',
      level: 3,
      type: 'spell',
      recallCost: 1,
      feature:
        'Faites un jet de Sort contre tous les adversaires devant vous à Portée Proche. Une fois par repos sur un succès, créez une illusion de couleurs et lumières clignotantes qui Étourdit temporairement les cibles contre lesquelles vous réussissez et les force à marquer un Stress. Tant qu\'elles sont Étourdies, elles ne peuvent pas utiliser de réactions ni effectuer d\'autres actions jusqu\'à ce qu\'elles annulent cette condition.'
    },
    {
      id: 'grace-invisibility',
      name: 'Invisibility',
      level: 3,
      type: 'spell',
      recallCost: 1,
      feature:
        'Faites un jet de Sort (10). Sur un succès, marquez un Stress et choisissez vous-même ou un allié à Portée de Mêlée pour devenir Invisible. Une créature Invisible ne peut pas être vue sauf par des moyens magiques et les jets d\'attaque contre elle sont faits avec un désavantage. Placez un nombre de jetons égal à votre trait de Sort sur cette carte. Quand la créature Invisible effectue une action, dépensez un jeton de cette carte. Après la résolution de l\'action qui dépense le dernier jeton, l\'effet prend fin. Vous ne pouvez maintenir l\'Invisibilité que sur une seule créature à la fois.'
    },

    // ── Level 4 (2 cards) ──────────────────────────────
    {
      id: 'grace-soothing-speech',
      name: 'Soothing Speech',
      level: 4,
      type: 'ability',
      recallCost: 1,
      feature:
        'Pendant un repos court, quand vous prenez le temps de réconforter un autre personnage en utilisant le mouvement de repos Soigner les Blessures sur lui, effacez un Point de Vie supplémentaire sur ce personnage. Ce faisant, vous effacez aussi 2 Points de Vie.'
    },
    {
      id: 'grace-through-your-eyes',
      name: 'Through Your Eyes',
      level: 4,
      type: 'spell',
      recallCost: 1,
      feature:
        'Choisissez une cible à Portée Très Lointaine. Vous pouvez voir à travers ses yeux et entendre à travers ses oreilles. Vous pouvez alterner librement entre vos propres sens et ceux de la cible jusqu\'à ce que vous lanciez un autre sort ou jusqu\'à votre prochain repos.'
    },

    // ── Level 5 (2 cards) ──────────────────────────────
    {
      id: 'grace-thought-delver',
      name: 'Thought Delver',
      level: 5,
      type: 'spell',
      recallCost: 2,
      feature:
        'Vous pouvez sonder l\'esprit des autres. Dépensez un Espoir pour lire les pensées vagues de surface d\'une cible à Portée Lointaine. Faites un jet de Sort contre la cible pour fouiller des pensées plus profondes et cachées. Sur un jet avec la Peur, la cible peut, à la discrétion du MJ, prendre conscience que vous lisez ses pensées.'
    },
    {
      id: 'grace-words-of-discord',
      name: 'Words of Discord',
      level: 5,
      type: 'spell',
      recallCost: 1,
      feature:
        'Murmurez des paroles de discorde à un adversaire à Portée de Mêlée et faites un jet de Sort (13). Sur un succès, la cible doit marquer un Stress et effectuer une attaque contre un autre adversaire au lieu de vous ou vos alliés. Une fois l\'attaque terminée, la cible réalise ce qui s\'est passé. La prochaine fois que vous lancez Words of Discord sur elle, vous subissez un malus de -5 au jet de Sort.'
    },

    // ── Level 6 (2 cards) ──────────────────────────────
    {
      id: 'grace-never-upstaged',
      name: 'Never Upstaged',
      level: 6,
      type: 'ability',
      recallCost: 2,
      feature:
        'Quand vous marquez 1 ou plusieurs Points de Vie suite à une attaque, vous pouvez marquer un Stress pour placer un nombre de jetons égal au nombre de Points de Vie marqués sur cette carte. Lors de votre prochaine attaque réussie, gagnez un bonus de +5 à votre jet de dégâts pour chaque jeton sur cette carte, puis retirez tous les jetons.'
    },
    {
      id: 'grace-share-the-burden',
      name: 'Share the Burden',
      level: 6,
      type: 'spell',
      recallCost: 0,
      feature:
        'Une fois par repos, prenez sur vous le Stress d\'une créature consentante à Portée de Mêlée. La cible décrit quelles connaissances intimes ou émotions fuient télépathiquement de son esprit en cet instant entre vous. Transférez autant de Stress marqué que souhaité sur vous, puis gagnez un Espoir pour chaque Stress transféré.'
    },

    // ── Level 7 (2 cards) ──────────────────────────────
    {
      id: 'grace-endless-charisma',
      name: 'Endless Charisma',
      level: 7,
      type: 'ability',
      recallCost: 1,
      feature:
        'Après avoir fait un jet d\'action pour persuader, mentir ou obtenir une faveur, vous pouvez dépenser un Espoir pour relancer le Dé d\'Espoir ou de Peur.'
    },
    {
      id: 'grace-grace-touched',
      name: 'Grace-Touched',
      level: 7,
      type: 'ability',
      recallCost: 2,
      feature:
        'Quand 4 ou plus des cartes de domaine de votre équipement sont du domaine Grace, vous gagnez les bénéfices suivants : Vous pouvez marquer un Emplacement d\'Armure au lieu de marquer un Stress ; Quand vous forceriez une cible à marquer un nombre de Points de Vie, vous pouvez choisir de la forcer à marquer ce nombre de Stress à la place.'
    },

    // ── Level 8 (2 cards) ──────────────────────────────
    {
      id: 'grace-astral-projection',
      name: 'Astral Projection',
      level: 8,
      type: 'spell',
      recallCost: 0,
      feature:
        'Une fois par repos long, marquez un Stress pour créer une copie projetée de vous-même qui peut apparaître n\'importe où où vous êtes déjà allé. Vous pouvez voir et entendre à travers la projection comme si c\'était vous et affecter le monde comme si vous y étiez. Une créature examinant la projection peut déterminer qu\'elle est d\'origine magique. Cet effet dure jusqu\'à votre prochain repos ou jusqu\'à ce que votre projection subisse des dégâts.'
    },
    {
      id: 'grace-mass-enrapture',
      name: 'Mass Enrapture',
      level: 8,
      type: 'spell',
      recallCost: 3,
      feature:
        'Faites un jet de Sort contre toutes les cibles à Portée Lointaine. Les cibles contre lesquelles vous réussissez deviennent temporairement Envoûtées. Tant qu\'elles sont Envoûtées, l\'attention des cibles est fixée sur vous, rétrécissant leur champ de vision et noyant tout son sauf votre voix. Marquez un Stress pour forcer toutes les cibles Envoûtées à marquer un Stress, mettant fin à ce sort.'
    },

    // ── Level 9 (2 cards) ──────────────────────────────
    {
      id: 'grace-copycat',
      name: 'Copycat',
      level: 9,
      type: 'spell',
      recallCost: 3,
      feature:
        'Une fois par repos long, cette carte peut imiter les capacités d\'une autre carte de domaine de niveau 8 ou moins dans l\'équipement d\'un autre joueur. Dépensez un nombre d\'Espoir égal à la moitié du niveau de la carte pour accéder à la capacité. Elle dure jusqu\'à votre prochain repos ou jusqu\'à ce que le joueur place la carte dans son coffre.'
    },
    {
      id: 'grace-master-of-the-craft',
      name: 'Master of the Craft',
      level: 9,
      type: 'ability',
      recallCost: 0,
      feature:
        'Gagnez un bonus permanent de +2 à deux de vos Expériences ou un bonus permanent de +3 à l\'une de vos Expériences. Puis placez cette carte dans votre coffre de façon permanente.'
    },

    // ── Level 10 (2 cards) ─────────────────────────────
    {
      id: 'grace-encore',
      name: 'Encore',
      level: 10,
      type: 'spell',
      recallCost: 1,
      feature:
        'Quand un allié à Portée Proche inflige des dégâts à un adversaire, vous pouvez faire un jet de Sort contre cette même cible. Sur un succès, vous infligez les mêmes dégâts à la cible que ceux infligés par votre allié. Si votre jet de Sort réussit avec la Peur, placez cette carte dans votre coffre.'
    },
    {
      id: 'grace-notorious',
      name: 'Notorious',
      level: 10,
      type: 'ability',
      recallCost: 0,
      feature:
        'Les gens savent qui vous êtes et ce que vous avez fait, et ils vous traitent différemment à cause de cela. Quand vous utilisez votre notoriété pour obtenir ce que vous voulez, vous pouvez marquer un Stress avant de lancer les dés pour gagner un bonus de +10 au résultat. Votre nourriture et vos boissons sont toujours gratuites où que vous alliez, et tout le reste que vous achetez est réduit d\'une bourse d\'or (minimum une poignée). Cette carte ne compte pas dans le maximum de 5 cartes de domaine de votre équipement et ne peut pas être placée dans votre coffre.'
    }
  ]
}
