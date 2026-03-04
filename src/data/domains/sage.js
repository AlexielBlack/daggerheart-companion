/**
 * @module domains/sage
 * @description Sage domain — 21 cartes officielles SRD.
 * Source : DomainCards_SRD.pdf
 */

export const sage = {
  id: 'sage',
  name: 'Sage',
  emoji: '🌿',
  color: '#16a34a',
  description:
    'Le domaine de Sage représente la connexion avec la nature et le monde sauvage. Les adeptes de Sage canalisent la puissance de la flore et de la faune pour protéger et guérir.',
  classes: ['Druid', 'Ranger'],
  themes: ['Nature', 'Faune', 'Guérison naturelle'],
  hasSpells: true,
  cardCount: 21,
  cards: [
    // ── Level 1 (3 cards) ──────────────────────────────
    {
      id: 'sage-gifted-tracker',
      name: 'Gifted Tracker',
      level: 1,
      type: 'ability',
      recallCost: 0,
      tags: ['utilitaire'],
      feature:
        'Quand vous pistez une créature ou un groupe de créatures spécifiques en vous basant sur les signes de leur passage, vous pouvez dépenser autant d\'Espoir que vous le souhaitez et poser au MJ autant de questions de la liste suivante : Dans quelle direction sont-ils allés ? Il y a combien de temps sont-ils passés par ici ? Que faisaient-ils à cet endroit ? Combien étaient-ils ici ? Quand vous rencontrez des créatures que vous avez pistées de cette façon, gagnez un bonus de +1 à votre Évasion contre elles.'
    },
    {
      id: 'sage-natures-tongue',
      name: "Nature's Tongue",
      level: 1,
      type: 'ability',
      recallCost: 0,
      tags: ['social','utilitaire'],
      feature:
        'Vous pouvez parler le langage du monde naturel. Quand vous voulez parler aux plantes et animaux autour de vous, faites un jet d\'Instinct (12). Sur un succès, ils vous donneront les informations qu\'ils connaissent. Sur un jet avec Peur, leurs connaissances pourraient être limitées ou avoir un prix. De plus, avant de faire un jet de Sort dans un environnement naturel, vous pouvez dépenser un Espoir pour gagner un bonus de +2 au jet.'
    },
    {
      id: 'sage-vicious-entangle',
      name: 'Vicious Entangle',
      level: 1,
      type: 'spell',
      recallCost: 1,
      tags: ['offensif'],
      feature:
        'Faites un jet de Sort contre une cible à Portée Lointaine. Sur un succès, des racines et des lianes jaillissent du sol, infligeant 1d8+1 dégâts physiques et Entravant temporairement la cible. De plus, sur un succès, vous pouvez dépenser un Espoir pour Entraver temporairement un autre adversaire à Portée Très Proche de votre cible.'
    },

    // ── Level 2 (2 cards) ──────────────────────────────
    {
      id: 'sage-conjure-swarm',
      name: 'Conjure Swarm',
      level: 2,
      type: 'spell',
      recallCost: 1,
      tags: ['offensif','défensif'],
      feature:
        'Tekaira Armored Beetles : Marquez un Stress pour conjurer des scarabées blindés qui vous encerclent. Quand vous subissez des dégâts ensuite, réduisez la sévérité d\'un palier. Vous pouvez dépenser un Espoir pour garder les scarabées conjurés après avoir subi des dégâts. Fire Flies : Faites un jet de Sort contre tous les adversaires à Portée Proche. Dépensez un Espoir pour infliger 2d8+3 dégâts magiques aux cibles contre lesquelles vous avez réussi.'
    },
    {
      id: 'sage-natural-familiar',
      name: 'Natural Familiar',
      level: 2,
      type: 'spell',
      recallCost: 1,
      tags: ['utilitaire'],
      feature:
        'Dépensez un Espoir pour invoquer un petit esprit de la nature ou un animal de la forêt à vos côtés jusqu\'à votre prochain repos, jusqu\'à ce que vous lanciez à nouveau Natural Familiar, ou que le familier soit ciblé par une attaque. Si vous dépensez un Espoir supplémentaire, vous pouvez invoquer un familier volant. Vous pouvez communiquer avec lui, faire un jet de Sort pour lui ordonner des tâches simples, et marquer un Stress pour voir à travers ses yeux. Quand vous infligez des dégâts à un adversaire à Portée de Mêlée de votre familier, vous ajoutez un d6 à votre jet de dégâts.'
    },

    // ── Level 3 (2 cards) ──────────────────────────────
    {
      id: 'sage-corrosive-projectile',
      name: 'Corrosive Projectile',
      level: 3,
      type: 'spell',
      recallCost: 1,
      tags: ['offensif'],
      feature:
        'Faites un jet de Sort contre une cible à Portée Lointaine. Sur un succès, infligez d6+4 dégâts magiques en utilisant votre Maîtrise. De plus, marquez 2 Stress ou plus pour la rendre définitivement Corrodée. Tant qu\'une cible est Corrodée, elle subit une pénalité de -1 à sa Difficulté pour chaque 2 Stress que vous avez dépensés. Cette condition est cumulable.'
    },
    {
      id: 'sage-towering-stalk',
      name: 'Towering Stalk',
      level: 3,
      type: 'spell',
      recallCost: 1,
      tags: ['utilitaire'],
      feature:
        'Une fois par repos, vous pouvez conjurer une épaisse tige torsadée à Portée Proche qui peut être facilement escaladée. Sa hauteur peut atteindre la Portée Lointaine. Marquez un Stress pour utiliser ce sort comme attaque. Faites un jet de Sort contre un adversaire ou un groupe d\'adversaires à Portée Proche. La tige jaillissante soulève les cibles contre lesquelles vous réussissez dans les airs et les laisse tomber, infligeant d8 dégâts physiques en utilisant votre Maîtrise.'
    },

    // ── Level 4 (2 cards) ──────────────────────────────
    {
      id: 'sage-death-grip',
      name: 'Death Grip',
      level: 4,
      type: 'spell',
      recallCost: 1,
      tags: ['offensif'],
      feature:
        'Faites un jet de Sort contre une cible à Portée Proche et choisissez une des options suivantes : Vous attirez la cible à Portée de Mêlée ou vous vous déplacez à Portée de Mêlée d\'elle ; Vous étreignez la cible et la forcez à marquer 2 Stress ; Tous les adversaires entre vous et la cible doivent réussir un Jet de Réaction (13) ou être frappés par les lianes, subissant 3d6+2 dégâts physiques. Sur un succès, des lianes jaillissent de vos mains, causant l\'effet choisi et Entravant temporairement la cible.'
    },
    {
      id: 'sage-healing-field',
      name: 'Healing Field',
      level: 4,
      type: 'spell',
      recallCost: 2,
      tags: ['défensif'],
      feature:
        'Une fois par repos long, vous pouvez conjurer un champ de plantes curatives autour de vous. Partout à Portée Proche de vous, la nature jaillit avec vigueur, permettant à vous et tous vos alliés dans la zone d\'effacer un Point de Vie. Dépensez 2 Espoir pour permettre à vous et tous vos alliés d\'effacer 2 Points de Vie à la place.'
    },

    // ── Level 5 (2 cards) ──────────────────────────────
    {
      id: 'sage-thorn-skin',
      name: 'Thorn Skin',
      level: 5,
      type: 'spell',
      recallCost: 1,
      tags: ['défensif','offensif'],
      feature:
        'Une fois par repos, dépensez un Espoir pour faire pousser des épines sur tout votre corps. Placez un nombre de jetons égal à votre trait de Sort sur cette carte. Quand vous subissez des dégâts, vous pouvez dépenser autant de jetons que vous le souhaitez pour lancer autant de d6. Additionnez les résultats et réduisez les dégâts entrants de ce montant. Si vous êtes à Portée de Mêlée de l\'attaquant, infligez-lui ce montant de dégâts en retour. Lors d\'un repos, retirez tous les jetons non dépensés.'
    },
    {
      id: 'sage-wild-fortress',
      name: 'Wild Fortress',
      level: 5,
      type: 'spell',
      recallCost: 1,
      tags: ['défensif'],
      feature:
        'Faites un jet de Sort (13). Sur un succès, dépensez 2 Espoir pour faire pousser une barricade naturelle en forme de dôme dans laquelle vous et un allié pouvez vous abriter. À l\'intérieur du dôme, une créature ne peut être ciblée par des attaques et ne peut en faire. Les attaques contre le dôme réussissent automatiquement. Le dôme a les seuils de dégâts suivants et dure jusqu\'à ce qu\'il marque 3 Points de Vie. Placez des jetons sur cette carte pour représenter les Points de Vie marqués. Seuils : 15/30.'
    },

    // ── Level 6 (2 cards) ──────────────────────────────
    {
      id: 'sage-conjured-steeds',
      name: 'Conjured Steeds',
      level: 6,
      type: 'spell',
      recallCost: 0,
      tags: ['utilitaire'],
      feature:
        'Dépensez autant d\'Espoir que vous le souhaitez pour conjurer autant de montures magiques (comme des chevaux, chameaux ou éléphants) que vous et vos alliés pouvez chevaucher jusqu\'à votre prochain repos long ou jusqu\'à ce que les montures subissent des dégâts. Les montures doublent votre vitesse de déplacement au sol en voyage et, en cas de danger, vous permettent de vous déplacer à Portée Lointaine sans avoir à lancer de dé. Les créatures chevauchant une monture subissent une pénalité de -2 aux jets d\'attaque et un bonus de +2 aux jets de dégâts.'
    },
    {
      id: 'sage-forager',
      name: 'Forager',
      level: 6,
      type: 'ability',
      recallCost: 1,
      tags: ['utilitaire'],
      feature:
        'Comme mouvement de temps libre supplémentaire, lancez un d6 pour voir ce que vous trouvez en fouillant. Travaillez avec le MJ pour le décrire et ajoutez-le à votre inventaire comme consommable. Votre groupe peut transporter jusqu\'à cinq consommables trouvés à la fois. 1 : Nourriture unique (Effacez 2 Stress) ; 2 : Belle relique (Gagnez 2 Espoir) ; 3 : Rune arcanique (+2 à un jet de Sort) ; 4 : Fiole de soin (Effacez 2 Points de Vie) ; 5 : Porte-bonheur (Relancez n\'importe quel dé) ; 6 : Choisissez une des options ci-dessus.'
    },

    // ── Level 7 (2 cards) ──────────────────────────────
    {
      id: 'sage-sage-touched',
      name: 'Sage-Touched',
      level: 7,
      type: 'ability',
      recallCost: 2,
      tags: ['utilitaire'],
      feature:
        'Quand 4 ou plus des cartes de domaine de votre équipement sont du domaine Sage, vous gagnez les bénéfices suivants : Tant que vous êtes dans un environnement naturel, vous gagnez un bonus de +2 à vos jets de Sort ; Une fois par repos, vous pouvez doubler votre Agilité ou votre Instinct quand vous faites un jet utilisant ce trait. Vous devez choisir de le faire avant de lancer.'
    },
    {
      id: 'sage-wild-surge',
      name: 'Wild Surge',
      level: 7,
      type: 'spell',
      recallCost: 2,
      tags: ['offensif'],
      feature:
        'Une fois par repos long, marquez un Stress pour canaliser le monde naturel autour de vous et vous améliorer. Décrivez comment votre apparence change, puis placez un d6 sur cette carte avec la face 1 vers le haut. Tant que le Dé de Surge Sauvage est actif, vous ajoutez sa valeur à chaque jet d\'action que vous faites. Après avoir ajouté sa valeur à un jet, augmentez la valeur du Dé de Surge Sauvage de un. Quand la valeur du dé dépasserait 6 ou que vous prenez un repos, cette forme s\'estompe et vous devez marquer un Stress supplémentaire.'
    },

    // ── Level 8 (2 cards) ──────────────────────────────
    {
      id: 'sage-forest-sprites',
      name: 'Forest Sprites',
      level: 8,
      type: 'spell',
      recallCost: 2,
      tags: ['défensif'],
      feature:
        'Faites un jet de Sort (13). Sur un succès, dépensez autant d\'Espoir que vous le souhaitez pour créer autant de petits esprits de la forêt qui apparaissent aux points que vous choisissez à Portée Lointaine, offrant les bénéfices suivants : Vos alliés gagnent un bonus de +3 aux jets d\'attaque contre les adversaires à Portée de Mêlée d\'un esprit ; Un allié qui marque un Emplacement d\'Armure alors qu\'il est à Portée de Mêlée d\'un esprit peut marquer un Emplacement d\'Armure supplémentaire. Un esprit disparaît après avoir accordé un bénéfice ou subi le moindre dégât.'
    },
    {
      id: 'sage-rejuvenation-barrier',
      name: 'Rejuvenation Barrier',
      level: 8,
      type: 'spell',
      recallCost: 1,
      tags: ['défensif'],
      feature:
        'Faites un jet de Sort (15). Une fois par repos sur un succès, créez une barrière temporaire d\'énergie protectrice autour de vous à Portée Très Proche. Vous et tous les alliés à l\'intérieur de la barrière au moment du lancement effacent 1d4 Points de Vie. Tant que la barrière est active, vous et tous les alliés à l\'intérieur avez une résistance aux dégâts physiques venant de l\'extérieur de la barrière. Quand vous vous déplacez, la barrière vous suit.'
    },

    // ── Level 9 (2 cards) ──────────────────────────────
    {
      id: 'sage-fane-of-the-wilds',
      name: 'Fane of the Wilds',
      level: 9,
      type: 'ability',
      recallCost: 2,
      tags: ['défensif','utilitaire'],
      feature:
        'Après un repos long, placez un nombre de jetons égal au nombre de cartes de domaine Sage dans votre équipement et votre coffre sur cette carte. Quand vous feriez un jet de Sort, vous pouvez dépenser autant de jetons que vous le souhaitez après le jet pour gagner un bonus de +1 par jeton dépensé. Quand vous obtenez un succès critique sur un jet de Sort pour un sort du domaine Sage, gagnez un jeton. Lors d\'un repos long, retirez tous les jetons non dépensés.'
    },
    {
      id: 'sage-plant-dominion',
      name: 'Plant Dominion',
      level: 9,
      type: 'spell',
      recallCost: 1,
      tags: ['utilitaire'],
      feature:
        'Faites un jet de Sort (18). Une fois par repos long sur un succès, vous remodelez le monde naturel, changeant la végétation environnante n\'importe où à Portée Lointaine de vous. Par exemple, vous pouvez faire pousser des arbres instantanément, ouvrir un chemin à travers des lianes denses, ou créer un mur de racines.'
    },

    // ── Level 10 (2 cards) ─────────────────────────────
    {
      id: 'sage-force-of-nature',
      name: 'Force of Nature',
      level: 10,
      type: 'spell',
      recallCost: 2,
      tags: ['offensif','défensif'],
      feature:
        'Marquez un Stress pour vous transformer en un esprit de la nature imposant, gagnant les bénéfices suivants : Quand vous réussissez une attaque ou un jet de Sort, gagnez un bonus de +10 au jet de dégâts ; Quand vous infligez suffisamment de dégâts pour vaincre une créature à Portée Proche, vous l\'absorbez et effacez un Emplacement d\'Armure ; Vous ne pouvez pas être Entravé. Avant de faire un jet d\'action, vous devez dépenser un Espoir. Si vous ne pouvez pas, vous revenez à votre forme normale.'
    },
    {
      id: 'sage-tempest',
      name: 'Tempest',
      level: 10,
      type: 'spell',
      recallCost: 2,
      tags: ['offensif'],
      feature:
        'Choisissez une des tempêtes suivantes et faites un jet de Sort contre toutes les cibles à Portée Lointaine. Les cibles contre lesquelles vous réussissez en subissent les effets jusqu\'à ce que le MJ dépense une Peur lors de son tour pour mettre fin à ce sort. Blizzard : Infligez 2d20+8 dégâts magiques et les cibles sont temporairement Vulnérables. Hurricane : Infligez 3d10+10 dégâts magiques et choisissez une direction de vent. Les cibles ne peuvent pas se déplacer contre le vent. Tempête de sable : Infligez 5d6+9 dégâts magiques. Les attaques faites au-delà de la Portée de Mêlée ont le désavantage.'
    }
  ]
}
