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
    'Le domaine d\'Arcana représente la magie pure et la manipulation des forces mystiques. Les pratiquants d\'Arcana canalisent l\'énergie brute du cosmos pour déchaîner des phénomènes surnaturels.',
  classes: ['Druid', 'Sorcerer'],
  themes: ['Magie arcanique', 'Éléments', 'Forces mystiques'],
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
      tags: ['défensif'],
      feature:
        'Vous possédez un bibelot profondément personnel qui peut être imprégné de magie protectrice et tenu comme une protection par vous ou un allié. Décrivez ce que c\'est et pourquoi c\'est important pour vous. Le porteur de la protection peut dépenser un Espoir pour réduire les dégâts entrants de 1d8. Si le résultat du Dé de Protection est 8, le pouvoir de la protection prend fin après avoir réduit les dégâts ce tour. Elle peut être rechargée gratuitement lors de votre prochain repos.',
      activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'atWill', trait: 'spellcast'
    },
    {
      id: 'arcana-unleash-chaos',
      name: 'Unleash Chaos',
      level: 1,
      type: 'spell',
      recallCost: 1,
      tags: ['offensif'],
      feature:
        'Au début d\'une session, placez un nombre de jetons égal à votre trait de Sort sur cette carte. Faites un jet de Sort contre une cible à Portée Lointaine et dépensez autant de jetons que vous le souhaitez pour canaliser l\'énergie brute en vous et la déchaîner contre elle. Sur un succès, lancez un nombre de d10 égal aux jetons dépensés et infligez autant de dégâts magiques à la cible. Marquez un Stress pour recharger cette carte en jetons (jusqu\'à votre trait de Sort). À la fin de chaque session, retirez tous les jetons non dépensés.',
      activationType: 'action', cost: { type: 'stress', amount: 1 }, frequency: 'atWill', range: 'far', trait: 'spellcast'
    },
    {
      id: 'arcana-wall-walk',
      name: 'Wall Walk',
      level: 1,
      type: 'spell',
      recallCost: 1,
      tags: ['utilitaire'],
      feature:
        'Dépensez un Espoir pour permettre à une créature que vous pouvez toucher de grimper sur les murs et les plafonds aussi facilement que de marcher au sol. Cela dure jusqu\'à la fin de la scène ou jusqu\'à ce que vous lanciez Wall Walk à nouveau.',
      activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'atWill', trait: 'spellcast'
    },

    // ── Level 2 (2 cards) ──────────────────────────────
    {
      id: 'arcana-cinder-grasp',
      name: 'Cinder Grasp',
      level: 2,
      type: 'spell',
      recallCost: 1,
      tags: ['offensif'],
      feature:
        'Faites un jet de Sort contre une cible à Portée de Mêlée. Sur un succès, la cible s\'embrase instantanément, subit 1d20+3 dégâts magiques, et est temporairement En Feu. Quand une créature agit alors qu\'elle est En Feu, elle doit subir 2d6 dégâts magiques supplémentaires si elle est encore En Feu à la fin de son action.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill', range: 'melee', trait: 'spellcast'
    },
    {
      id: 'arcana-floating-eye',
      name: 'Floating Eye',
      level: 2,
      type: 'spell',
      recallCost: 0,
      tags: ['utilitaire'],
      feature:
        'Dépensez un Espoir pour créer un petit orbe flottant que vous pouvez déplacer n\'importe où à Portée Très Lointaine. Tant que ce sort est actif, vous pouvez voir à travers l\'orbe comme si vous regardiez depuis sa position. Vous pouvez alterner librement entre vos propres sens et la vision de l\'orbe. Si l\'orbe subit des dégâts ou sort de portée, le sort prend fin.',
      activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'atWill', trait: 'spellcast'
    },

    // ── Level 3 (2 cards) ──────────────────────────────
    {
      id: 'arcana-counterspell',
      name: 'Counterspell',
      level: 3,
      type: 'spell',
      recallCost: 2,
      tags: ['défensif'],
      feature:
        'Vous pouvez interrompre un effet magique en cours en faisant un jet de réaction avec votre trait de Sort. Sur un succès, l\'effet s\'arrête et toutes les conséquences sont évitées, et cette carte est placée dans votre coffre.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill', trait: 'spellcast'
    },
    {
      id: 'arcana-flight',
      name: 'Flight',
      level: 3,
      type: 'spell',
      recallCost: 1,
      tags: ['utilitaire'],
      feature:
        'Faites un jet de Sort (15). Sur un succès, placez un nombre de jetons égal à votre Agilité sur cette carte (minimum 1). Quand vous faites un jet d\'action en volant, dépensez un jeton de cette carte. Après la résolution de l\'action qui dépense le dernier jeton, vous descendez au sol directement en dessous de vous.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill', trait: 'spellcast'
    },

    // ── Level 4 (2 cards) ──────────────────────────────
    {
      id: 'arcana-blink-out',
      name: 'Blink Out',
      level: 4,
      type: 'spell',
      recallCost: 1,
      tags: ['utilitaire'],
      feature:
        'Faites un jet de Sort (12). Sur un succès, dépensez un Espoir pour vous téléporter à un autre point visible à Portée Lointaine. Si des créatures consentantes sont à Portée Très Proche, dépensez un Espoir supplémentaire par créature pour les emmener avec vous.',
      activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'atWill', range: 'veryClose', trait: 'spellcast'
    },
    {
      id: 'arcana-preservation-blast',
      name: 'Preservation Blast',
      level: 4,
      type: 'spell',
      recallCost: 2,
      tags: ['offensif','défensif'],
      feature:
        'Faites un jet de Sort contre toutes les cibles à Portée de Mêlée. Les cibles contre lesquelles vous réussissez sont repoussées à Portée Lointaine et subissent d8+3 dégâts magiques en utilisant votre trait de Sort.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill', range: 'melee', trait: 'spellcast'
    },

    // ── Level 5 (2 cards) ──────────────────────────────
    {
      id: 'arcana-chain-lightning',
      name: 'Chain Lightning',
      level: 5,
      type: 'spell',
      recallCost: 1,
      tags: ['offensif'],
      feature:
        'Marquez 2 Stress pour faire un jet de Sort, déchaînant la foudre sur toutes les cibles à Portée Proche. Les cibles contre lesquelles vous réussissez doivent faire un jet de réaction avec une Difficulté égale au résultat de votre jet de Sort. Celles qui échouent subissent 2d8+4 dégâts magiques. Les adversaires supplémentaires non encore ciblés et à Portée Proche des cibles ayant subi des dégâts doivent aussi faire le jet de réaction. Cette chaîne continue jusqu\'à ce qu\'il n\'y ait plus d\'adversaires à portée.',
      activationType: 'action', cost: { type: 'stress', amount: 2 }, frequency: 'atWill', range: 'close', trait: 'spellcast'
    },
    {
      id: 'arcana-premonition',
      name: 'Premonition',
      level: 5,
      type: 'spell',
      recallCost: 2,
      tags: ['utilitaire'],
      feature:
        'Vous pouvez canaliser l\'énergie arcanique pour avoir des visions du futur. Une fois par repos long, immédiatement après que le MJ annonce les conséquences d\'un jet que vous avez fait, vous pouvez annuler l\'action et les conséquences comme si elles n\'avaient jamais eu lieu et faire une autre action à la place.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerLongRest', trait: 'spellcast'
    },

    // ── Level 6 (2 cards) ──────────────────────────────
    {
      id: 'arcana-rift-walker',
      name: 'Rift Walker',
      level: 6,
      type: 'spell',
      recallCost: 2,
      tags: ['utilitaire'],
      feature:
        'Faites un jet de Sort (15). Sur un succès, vous placez une marque arcanique au sol où vous vous tenez. La prochaine fois que vous lancez Rift Walker avec succès, une faille dans l\'espace s\'ouvre, offrant un passage sûr vers l\'endroit exact de la marque. Cette faille reste ouverte jusqu\'à ce que vous choisissiez de la fermer ou que vous lanciez un autre sort. Vous pouvez abandonner le sort à tout moment pour relancer Rift Walker et placer la marque ailleurs.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill', trait: 'spellcast'
    },
    {
      id: 'arcana-telekinesis',
      name: 'Telekinesis',
      level: 6,
      type: 'spell',
      recallCost: 0,
      tags: ['offensif','utilitaire'],
      feature:
        'Faites un jet de Sort contre une cible à Portée Lointaine. Sur un succès, vous pouvez utiliser votre esprit pour la déplacer n\'importe où à Portée Lointaine de sa position d\'origine. Vous pouvez lancer la cible soulevée comme une attaque en faisant un jet de Sort supplémentaire contre la seconde cible. Sur un succès, infligez d12+4 dégâts physiques à la seconde cible en utilisant votre Maîtrise. Le sort prend alors fin.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill', range: 'far', trait: 'spellcast'
    },

    // ── Level 7 (2 cards) ──────────────────────────────
    {
      id: 'arcana-arcana-touched',
      name: 'Arcana-Touched',
      level: 7,
      type: 'ability',
      recallCost: 2,
      tags: ['utilitaire'],
      feature:
        'Quand 4 ou plus des cartes de domaine de votre équipement sont du domaine Arcana, vous gagnez les bénéfices suivants : +1 aux jets de Sort ; Une fois par repos, vous pouvez échanger les résultats de vos Dés d\'Espoir et de Peur.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerShortRest'
    },
    {
      id: 'arcana-cloaking-blast',
      name: 'Cloaking Blast',
      level: 7,
      type: 'spell',
      recallCost: 2,
      tags: ['défensif','utilitaire'],
      feature:
        'Quand vous réussissez un jet de Sort pour lancer un autre sort, vous pouvez dépenser un Espoir pour devenir Voilé. Tant que vous êtes Voilé, vous restez invisible si vous êtes immobile quand un adversaire se déplace là où il vous verrait normalement. Quand vous vous déplacez dans ou dans la ligne de vue d\'un adversaire ou faites une attaque, vous n\'êtes plus Voilé.',
      activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'atWill', trait: 'spellcast'
    },

    // ── Level 8 (2 cards) ──────────────────────────────
    {
      id: 'arcana-arcane-reflection',
      name: 'Arcane Reflection',
      level: 8,
      type: 'spell',
      recallCost: 1,
      tags: ['défensif'],
      feature:
        'Quand vous devriez subir des dégâts magiques, vous pouvez dépenser autant d\'Espoir que vous le souhaitez pour lancer autant de d6. Si l\'un d\'eux donne un 6, l\'attaque est renvoyée au lanceur, lui infligeant les dégâts à sa place.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill', trait: 'spellcast'
    },
    {
      id: 'arcana-confusing-aura',
      name: 'Confusing Aura',
      level: 8,
      type: 'spell',
      recallCost: 2,
      tags: ['défensif'],
      feature:
        'Faites un jet de Sort (14). Une fois par repos long sur un succès, vous créez une couche d\'illusion sur votre corps qui rend difficile de déterminer où vous êtes exactement. Marquez autant de Stress que vous le souhaitez pour créer autant de couches supplémentaires. Quand un adversaire vous attaque, lancez un nombre de d6 égal aux couches actives. Si l\'un donne 5 ou plus, une couche est détruite et l\'attaque échoue. Si tous les résultats sont 4 ou moins, vous subissez les dégâts et le sort prend fin.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerLongRest', trait: 'spellcast'
    },

    // ── Level 9 (2 cards) ──────────────────────────────
    {
      id: 'arcana-earthquake',
      name: 'Earthquake',
      level: 9,
      type: 'spell',
      recallCost: 2,
      tags: ['offensif'],
      feature:
        'Faites un jet de Sort (16). Une fois par repos sur un succès, toutes les cibles à Portée Très Lointaine qui ne volent pas doivent faire un Jet de Réaction (18). Celles qui échouent subissent 3d10+8 dégâts physiques et sont temporairement Vulnérables. Celles qui réussissent subissent la moitié des dégâts. De plus, tout le terrain à Portée Très Lointaine devient difficile à traverser et les structures à portée peuvent être endommagées ou s\'écrouler.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerShortRest', trait: 'spellcast'
    },
    {
      id: 'arcana-sensory-projection',
      name: 'Sensory Projection',
      level: 9,
      type: 'spell',
      recallCost: 0,
      tags: ['utilitaire'],
      feature:
        'Une fois par repos, faites un jet de Sort (15). Sur un succès, plongez dans une vision qui vous permet de voir et d\'entendre clairement tout endroit où vous êtes déjà allé comme si vous y étiez en ce moment. Vous pouvez vous déplacer librement dans cette vision sans être limité par la physique ou les obstacles d\'un corps physique. Ce sort ne peut être détecté par des moyens ordinaires ou magiques. Vous quittez la vision si vous subissez des dégâts ou lancez un autre sort.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill', trait: 'spellcast'
    },

    // ── Level 10 (2 cards) ─────────────────────────────
    {
      id: 'arcana-adjust-reality',
      name: 'Adjust Reality',
      level: 10,
      type: 'spell',
      recallCost: 1,
      tags: ['utilitaire'],
      feature:
        'Après que vous ou un allié consentant faites un jet quelconque, vous pouvez dépenser 5 Espoir pour changer le résultat numérique de ce jet par un résultat de votre choix. Le résultat doit être plausible dans l\'éventail des dés.',
      activationType: 'action', cost: { type: 'hope', amount: 5 }, frequency: 'atWill', trait: 'spellcast'
    },
    {
      id: 'arcana-falling-sky',
      name: 'Falling Sky',
      level: 10,
      type: 'spell',
      recallCost: 1,
      tags: ['offensif'],
      feature:
        'Faites un jet de Sort contre tous les adversaires à Portée Lointaine. Marquez autant de Stress que vous le souhaitez pour faire pleuvoir des éclats d\'arcane depuis le ciel. Les cibles contre lesquelles vous réussissez subissent 1d20+2 dégâts magiques par Stress marqué.',
      activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill', range: 'far', trait: 'spellcast'
    }
  ]
}
