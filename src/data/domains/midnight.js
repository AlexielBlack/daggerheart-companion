/**
 * @module domains/midnight
 * @description Midnight domain — 21 cartes officielles SRD.
 * Source : DomainCards_SRD.pdf
 */

export const midnight = {
  id: 'midnight',
  name: 'Midnight',
  emoji: '🌑',
  color: '#4338ca',
  description:
    'Le domaine de Midnight représente la furtivité, les ombres et la manipulation des ténèbres. Les pratiquants de Midnight opèrent dans l\'obscurité, frappant depuis les ombres et manipulant la peur.',
  classes: ['Rogue', 'Sorcerer', 'Assassin'],
  themes: ['Furtivité', 'Ombres', 'Ténèbres'],
  hasSpells: true,
  cardCount: 21,
  cards: [
    // ── Level 1 (3 cards) ──────────────────────────────
    {
      id: 'midnight-pick-and-pull',
      name: 'Pick and Pull',
      level: 1,
      type: 'ability',
      recallCost: 0,
      feature:
        'Vous avez un avantage sur les jets d\'action pour crocheter des serrures non magiques, désamorcer des pièges non magiques, ou voler des objets à une cible (que ce soit par furtivité ou par la force).'
    },
    {
      id: 'midnight-rain-of-blades',
      name: 'Rain of Blades',
      level: 1,
      type: 'spell',
      recallCost: 1,
      feature:
        'Dépensez un Espoir pour faire un jet de Sort et conjurer des lames de lancer qui frappent toutes les cibles à Portée Très Proche. Les cibles contre lesquelles vous réussissez subissent d8+2 dégâts magiques en utilisant votre Maîtrise. Si une cible touchée est Vulnérable, elle subit 1d8 dégâts supplémentaires.'
    },
    {
      id: 'midnight-uncanny-disguise',
      name: 'Uncanny Disguise',
      level: 1,
      type: 'spell',
      recallCost: 0,
      feature:
        'Quand vous avez quelques minutes pour vous préparer, vous pouvez marquer un Stress pour revêtir l\'apparence de n\'importe quel humanoïde que vous pouvez vous représenter clairement. Tant que vous êtes déguisé, vous avez un avantage sur les jets de Présence pour éviter les soupçons. Placez un nombre de jetons égal à votre trait de Sort sur cette carte. Quand vous effectuez une action sous ce déguisement, dépensez un jeton. Après la résolution de l\'action qui dépense le dernier jeton, le déguisement tombe.'
    },

    // ── Level 2 (2 cards) ──────────────────────────────
    {
      id: 'midnight-midnight-spirit',
      name: 'Midnight Spirit',
      level: 2,
      type: 'spell',
      recallCost: 1,
      feature:
        'Dépensez un Espoir pour invoquer un esprit de taille humaine qui peut déplacer ou transporter des objets pour vous jusqu\'à votre prochain repos. Vous pouvez aussi l\'envoyer attaquer un adversaire. Ce faisant, faites un jet de Sort contre une cible à Portée Très Lointaine. Sur un succès, l\'esprit se déplace à Portée de Mêlée de la cible. Lancez un nombre de d6 égal à votre trait de Sort et infligez autant de dégâts magiques à la cible. L\'esprit se dissipe ensuite. Vous ne pouvez avoir qu\'un seul esprit à la fois.'
    },
    {
      id: 'midnight-shadowbind',
      name: 'Shadowbind',
      level: 2,
      type: 'spell',
      recallCost: 0,
      feature:
        'Faites un jet de Sort contre tous les adversaires à Portée Très Proche. Les cibles contre lesquelles vous réussissez sont temporairement Entravées alors que leur ombre les immobilise sur place.'
    },

    // ── Level 3 (2 cards) ──────────────────────────────
    {
      id: 'midnight-chokehold',
      name: 'Chokehold',
      level: 3,
      type: 'ability',
      recallCost: 1,
      feature:
        'Quand vous vous positionnez derrière une créature à peu près de votre taille, vous pouvez marquer un Stress pour l\'immobiliser dans une prise d\'étranglement, la rendant temporairement Vulnérable. Quand une créature attaque une cible Vulnérable de cette manière, elle inflige 2d6 dégâts supplémentaires.'
    },
    {
      id: 'midnight-veil-of-night',
      name: 'Veil of Night',
      level: 3,
      type: 'spell',
      recallCost: 1,
      feature:
        'Faites un jet de Sort (13). Sur un succès, vous pouvez créer un rideau temporaire d\'obscurité entre deux points à Portée Lointaine. Vous seul pouvez voir à travers ces ténèbres. Vous êtes considéré comme Caché pour les adversaires de l\'autre côté du voile, et vous avez un avantage sur les attaques que vous faites à travers l\'obscurité. Le voile persiste jusqu\'à ce que vous lanciez un autre sort.'
    },

    // ── Level 4 (2 cards) ──────────────────────────────
    {
      id: 'midnight-stealth-expertise',
      name: 'Stealth Expertise',
      level: 4,
      type: 'ability',
      recallCost: 0,
      feature:
        'Quand vous obtenez un jet avec la Peur en tentant de vous déplacer discrètement dans une zone dangereuse, vous pouvez marquer un Stress pour obtenir un jet avec l\'Espoir à la place. Si un allié à Portée Proche tente aussi de se déplacer discrètement et obtient un jet avec la Peur, vous pouvez marquer un Stress pour transformer son résultat en jet avec l\'Espoir.'
    },
    {
      id: 'midnight-glyph-of-nightfall',
      name: 'Glyph of Nightfall',
      level: 4,
      type: 'spell',
      recallCost: 1,
      feature:
        'Faites un jet de Sort contre une cible à Portée Très Proche. Sur un succès, dépensez un Espoir pour conjurer un glyphe sombre sur son corps qui expose ses points faibles, réduisant temporairement la Difficulté de la cible d\'une valeur égale à votre Connaissance (minimum 1).'
    },

    // ── Level 5 (2 cards) ──────────────────────────────
    {
      id: 'midnight-hush',
      name: 'Hush',
      level: 5,
      type: 'spell',
      recallCost: 1,
      feature:
        'Faites un jet de Sort contre une cible à Portée Proche. Sur un succès, dépensez un Espoir pour conjurer une magie suppressive autour de la cible qui englobe tout à Portée Très Proche d\'elle et la suit dans ses déplacements. La cible et tout ce qui se trouve dans la zone est Réduit au Silence jusqu\'à ce que le MJ dépense une Peur lors de son tour pour lever cette condition, que vous lanciez Hush à nouveau, ou que vous subissiez des dégâts Majeurs. Tant qu\'elles sont Réduites au Silence, les cibles ne peuvent ni faire de bruit ni lancer de sorts.'
    },
    {
      id: 'midnight-phantom-retreat',
      name: 'Phantom Retreat',
      level: 5,
      type: 'spell',
      recallCost: 2,
      feature:
        'Dépensez un Espoir pour activer Phantom Retreat à l\'endroit où vous vous tenez actuellement. Dépensez un autre Espoir à tout moment avant votre prochain repos pour disparaître de là où vous êtes et réapparaître à l\'endroit où vous vous teniez quand vous avez activé Phantom Retreat. Ce sort prend fin après votre réapparition.'
    },

    // ── Level 6 (2 cards) ──────────────────────────────
    {
      id: 'midnight-dark-whispers',
      name: 'Dark Whispers',
      level: 6,
      type: 'spell',
      recallCost: 0,
      feature:
        'Vous pouvez parler dans l\'esprit de toute personne avec laquelle vous avez eu un contact physique. Une fois le canal ouvert, elle peut vous répondre mentalement. De plus, vous pouvez marquer un Stress pour faire un jet de Sort contre elle. Sur un succès, vous pouvez poser au MJ l\'une des questions suivantes et recevoir une réponse : Où est-elle ? Que fait-elle ? De quoi a-t-elle peur ? Qu\'est-ce qu\'elle chérit le plus au monde ?'
    },
    {
      id: 'midnight-mass-disguise',
      name: 'Mass Disguise',
      level: 6,
      type: 'spell',
      recallCost: 0,
      feature:
        'Quand vous avez quelques minutes de silence pour vous concentrer, vous pouvez marquer un Stress pour changer l\'apparence de toutes les créatures consentantes à Portée Proche. Leurs nouvelles formes doivent partager une structure corporelle et une taille similaires, et peuvent être quelqu\'un ou quelque chose que vous avez déjà vu ou être entièrement inventées. Une créature déguisée a un avantage sur les jets de Présence pour éviter les soupçons. Activez un Compte à Rebours (8). Il décompte comme conséquence choisie par le MJ. Quand il se déclenche, le déguisement tombe.'
    },

    // ── Level 7 (2 cards) ──────────────────────────────
    {
      id: 'midnight-midnight-touched',
      name: 'Midnight-Touched',
      level: 7,
      type: 'ability',
      recallCost: 2,
      feature:
        'Quand 4 ou plus des cartes de domaine de votre équipement sont du domaine Midnight, vous gagnez les bénéfices suivants : Une fois par repos, quand vous avez 0 Espoir et que le MJ gagnerait une Peur, vous pouvez gagner un Espoir à la place ; Quand vous réussissez une attaque, vous pouvez marquer un Stress pour ajouter le résultat de votre Dé de Peur à votre jet de dégâts.'
    },
    {
      id: 'midnight-vanishing-dodge',
      name: 'Vanishing Dodge',
      level: 7,
      type: 'spell',
      recallCost: 1,
      feature:
        'Quand une attaque contre vous qui infligerait des dégâts physiques échoue, vous pouvez dépenser un Espoir pour vous envelopper d\'ombre, devenant Caché et vous téléportant à un point à Portée Proche de l\'attaquant. Vous restez Caché jusqu\'à votre prochain jet d\'action.'
    },

    // ── Level 8 (2 cards) ──────────────────────────────
    {
      id: 'midnight-shadowhunter',
      name: 'Shadowhunter',
      level: 8,
      type: 'ability',
      recallCost: 2,
      feature:
        'Vos prouesses sont améliorées sous le couvert de l\'ombre. Tant que vous êtes enveloppé dans une lumière faible ou l\'obscurité, vous gagnez un bonus de +1 à votre Évasion et faites vos jets d\'attaque avec un avantage.'
    },
    {
      id: 'midnight-spellcharge',
      name: 'Spellcharge',
      level: 8,
      type: 'spell',
      recallCost: 1,
      feature:
        'Quand vous subissez des dégâts magiques, placez un nombre de jetons égal au nombre de Points de Vie que vous avez marqués sur cette carte. Vous pouvez stocker un nombre de jetons égal à votre trait de Sort. Quand vous réussissez une attaque contre une cible, vous pouvez dépenser autant de jetons que souhaité pour ajouter un d6 par jeton dépensé à votre jet de dégâts.'
    },

    // ── Level 9 (2 cards) ──────────────────────────────
    {
      id: 'midnight-night-terror',
      name: 'Night Terror',
      level: 9,
      type: 'spell',
      recallCost: 2,
      feature:
        'Une fois par repos long, choisissez des cibles à Portée Très Proche pour qu\'elles vous perçoivent comme une horreur cauchemardesque. Les cibles doivent réussir un Jet de Réaction (16) ou devenir temporairement Horrifiées. Tant qu\'elles sont Horrifiées, elles sont Vulnérables. Volez au MJ un nombre de Peur égal au nombre de cibles Horrifiées (jusqu\'au nombre de Peur dans la réserve du MJ). Lancez un nombre de d6 égal aux Peur volées et infligez le total des dégâts à chaque cible Horrifiée. Défaussez les Peur volées.'
    },
    {
      id: 'midnight-twilight-toll',
      name: 'Twilight Toll',
      level: 9,
      type: 'ability',
      recallCost: 1,
      feature:
        'Choisissez une cible à Portée Lointaine. Quand vous réussissez un jet d\'action contre elle qui ne résulte pas en un jet de dégâts, placez un jeton sur cette carte. Quand vous infligez des dégâts à cette cible, dépensez autant de jetons que souhaité pour ajouter un d12 par jeton dépensé à votre jet de dégâts. Vous ne pouvez maintenir Twilight Toll que sur une seule créature à la fois. Quand vous choisissez une nouvelle cible ou prenez un repos, retirez tous les jetons non dépensés.'
    },

    // ── Level 10 (2 cards) ─────────────────────────────
    {
      id: 'midnight-eclipse',
      name: 'Eclipse',
      level: 10,
      type: 'spell',
      recallCost: 2,
      feature:
        'Faites un jet de Sort (16). Une fois par repos long sur un succès, plongez toute la zone à Portée Lointaine dans une obscurité totale que seuls vous et vos alliés pouvez percer du regard. Les jets d\'attaque ont un désavantage lorsqu\'ils ciblent vous ou un allié dans cette ombre. De plus, quand vous ou un allié réussit avec l\'Espoir contre un adversaire dans cette ombre, la cible doit marquer un Stress. Ce sort dure jusqu\'à ce que le MJ dépense une Peur lors de son tour pour dissiper cet effet ou que vous subissiez des dégâts Sévères.'
    },
    {
      id: 'midnight-specter-of-the-dark',
      name: 'Specter of the Dark',
      level: 10,
      type: 'spell',
      recallCost: 1,
      feature:
        'Marquez un Stress pour devenir Spectral jusqu\'à ce que vous fassiez un jet d\'action ciblant une autre créature. Tant que vous êtes Spectral, vous êtes immunisé aux dégâts physiques et pouvez flotter et passer à travers les objets solides. Les autres créatures peuvent toujours vous voir sous cette forme.'
    }
  ]
}
