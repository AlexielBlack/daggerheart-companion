/**
 * @module domains/codex
 * @description Codex domain — 21 cartes officielles SRD.
 * Source : DomainCards_SRD.pdf
 * Note: Codex is the only domain with grimoire-type cards.
 */

export const codex = {
  id: 'codex',
  name: 'Codex',
  emoji: '📖',
  color: '#0891b2',
  description:
    'Le domaine du Codex représente le savoir magique et les grimoires. Les pratiquants du Codex maîtrisent des sorts polyvalents via leurs livres de sorts.',
  classes: ['Bard', 'Wizard'],
  themes: ['Grimoires', 'Sorts multiples', 'Savoir'],
  hasSpells: true,
  cardCount: 21,
  cards: [
    // ── Level 1 (3 cards) ──────────────────────────────
    {
      id: 'codex-book-of-ava',
      name: 'Book of Ava',
      level: 1,
      type: 'grimoire',
      recallCost: 2,
      feature:
        'Power Push : Faites un jet de Sort contre une cible à Portée de Mêlée. Sur un succès, elle est repoussée à Portée Lointaine et subit d10+2 dégâts magiques en utilisant votre Maîtrise. Tava\'s Armor : Dépensez un Espoir pour donner à une cible que vous pouvez toucher un bonus de +1 à son Score d\'Armure jusqu\'à son prochain repos ou jusqu\'à ce que vous lanciez à nouveau Tava\'s Armor. Ice Spike : Faites un jet de Sort (12) pour invoquer un grand pic de glace à Portée Lointaine. Si vous l\'utilisez comme arme, faites le jet de Sort contre la Difficulté de la cible à la place. Sur un succès, infligez d6 dégâts physiques en utilisant votre Maîtrise.'
    },
    {
      id: 'codex-book-of-illiat',
      name: 'Book of Illiat',
      level: 1,
      type: 'grimoire',
      recallCost: 2,
      feature:
        'Slumber : Faites un jet de Sort contre une cible à Portée Très Proche. Sur un succès, elle est Endormie jusqu\'à ce qu\'elle subisse des dégâts ou que le MJ dépense une Peur lors de son tour pour lever cette condition. Arcane Barrage : Une fois par repos, dépensez autant d\'Espoir que vous le souhaitez et tirez des projectiles magiques qui frappent une cible de votre choix à Portée Proche. Lancez un nombre de d6 égal aux Espoir dépensés et infligez autant de dégâts magiques à la cible. Telepathy : Dépensez un Espoir pour ouvrir une ligne de communication mentale avec une cible que vous pouvez voir. Cette connexion dure jusqu\'à votre prochain repos ou jusqu\'à ce que vous lanciez à nouveau Telepathy.'
    },
    {
      id: 'codex-book-of-tyfar',
      name: 'Book of Tyfar',
      level: 1,
      type: 'grimoire',
      recallCost: 2,
      feature:
        'Wild Flame : Faites un jet de Sort contre jusqu\'à trois adversaires à Portée de Mêlée. Les cibles contre lesquelles vous réussissez subissent 2d6 dégâts magiques et doivent marquer un Stress alors que des flammes jaillissent de votre main. Magic Hand : Vous conjurez une main magique de la même taille et force que la vôtre à Portée Lointaine. Mysterious Mist : Faites un jet de Sort (13) pour créer un brouillard temporaire et épais qui s\'installe dans une zone stationnaire à Portée Très Proche. Le brouillard obscurcit fortement cette zone et tout ce qui s\'y trouve.'
    },

    // ── Level 2 (2 cards) ──────────────────────────────
    {
      id: 'codex-book-of-sitil',
      name: 'Book of Sitil',
      level: 2,
      type: 'grimoire',
      recallCost: 2,
      feature:
        'Adjust Appearance : Vous changez magiquement votre apparence et vos vêtements pour éviter d\'être reconnu. Parallela : Dépensez 2 Espoir pour lancer ce sort sur vous-même ou un allié à Portée Proche. La prochaine fois que la cible fait une attaque, elle peut toucher une cible supplémentaire à portée que son jet d\'attaque réussirait. Vous ne pouvez maintenir ce sort que sur une créature à la fois. Illusion : Faites un jet de Sort (14). Sur un succès, créez une illusion visuelle temporaire pas plus grande que vous à Portée Proche qui dure tant que vous la regardez. Elle résiste à l\'examen jusqu\'à ce qu\'un observateur soit à Portée de Mêlée.'
    },
    {
      id: 'codex-book-of-vagras',
      name: 'Book of Vagras',
      level: 2,
      type: 'grimoire',
      recallCost: 2,
      feature:
        'Runic Lock : Faites un jet de Sort (15) sur un objet que vous touchez pouvant se fermer (comme un cadenas, un coffre ou une boîte). Une fois par repos sur un succès, vous pouvez verrouiller l\'objet de sorte qu\'il ne puisse être ouvert que par les créatures de votre choix. Quelqu\'un ayant accès à la magie et une heure d\'étude peut briser le sort. Arcane Door : Quand vous n\'avez pas d\'adversaires à Portée de Mêlée, faites un jet de Sort (13). Sur un succès, dépensez un Espoir pour créer un portail de votre position vers un point à Portée Lointaine que vous pouvez voir. Il se ferme une fois qu\'une créature l\'a traversé. Reveal : Faites un jet de Sort. Si quelque chose est magiquement caché à Portée Proche, cela est révélé.'
    },

    // ── Level 3 (2 cards) ──────────────────────────────
    {
      id: 'codex-book-of-korvax',
      name: 'Book of Korvax',
      level: 3,
      type: 'grimoire',
      recallCost: 2,
      feature:
        'Levitation : Faites un jet de Sort pour soulever temporairement une cible que vous pouvez voir dans les airs et la déplacer à Portée Proche de sa position d\'origine. Recant : Dépensez un Espoir pour forcer une cible à Portée de Mêlée à faire un Jet de Réaction (15). Sur un échec, elle oublie la dernière minute de votre conversation. Rune Circle : Marquez un Stress pour créer un cercle magique temporaire au sol où vous vous tenez. Tous les adversaires à Portée de Mêlée, ou qui entrent à Portée de Mêlée, subissent 2d12+4 dégâts magiques et sont repoussés à Portée Très Proche.'
    },
    {
      id: 'codex-book-of-norai',
      name: 'Book of Norai',
      level: 3,
      type: 'grimoire',
      recallCost: 2,
      feature:
        'Mystic Tether : Faites un jet de Sort contre une cible à Portée Lointaine. Sur un succès, elle est temporairement Entravée et doit marquer un Stress. Si vous ciblez une créature volante, ce sort la cloue au sol et l\'Entrave temporairement. Fireball : Faites un jet de Sort contre une cible à Portée Très Lointaine. Sur un succès, projetez une sphère de feu vers elle qui explose à l\'impact. La cible et toutes les créatures à Portée Très Proche d\'elle doivent faire un Jet de Réaction (13). Celles qui échouent subissent d20+5 dégâts magiques en utilisant votre Maîtrise. Celles qui réussissent subissent la moitié des dégâts.'
    },

    // ── Level 4 (2 cards) ──────────────────────────────
    {
      id: 'codex-book-of-exota',
      name: 'Book of Exota',
      level: 4,
      type: 'grimoire',
      recallCost: 3,
      feature:
        'Repudiate : Vous pouvez interrompre un effet magique en cours. Faites un jet de réaction avec votre trait de Sort. Une fois par repos sur un succès, l\'effet s\'arrête et toutes les conséquences sont évitées. Create Construct : Dépensez un Espoir pour choisir un groupe d\'objets autour de vous et créer un assemblage animé à partir d\'eux qui obéit à des commandes basiques. Faites un jet de Sort pour lui ordonner d\'agir. Si nécessaire, il partage votre Évasion et vos traits et ses attaques infligent 2d10+3 dégâts physiques. Vous ne pouvez maintenir qu\'un seul assemblage à la fois, et il se désagrège s\'il subit le moindre dégât.'
    },
    {
      id: 'codex-book-of-grynn',
      name: 'Book of Grynn',
      level: 4,
      type: 'grimoire',
      recallCost: 2,
      feature:
        'Arcane Deflection : Une fois par repos long, dépensez un Espoir pour annuler les dégâts d\'une attaque vous ciblant vous ou un allié à Portée Très Proche. Time Lock : Ciblez un objet à Portée Lointaine. Cet objet se fige dans le temps et l\'espace exactement où il est jusqu\'à votre prochain repos. Si une créature tente de le déplacer, faites un jet de Sort contre elle pour maintenir le sort. Wall of Flame : Faites un jet de Sort (15). Sur un succès, créez un mur temporaire de flammes magiques entre deux points à Portée Lointaine. Toutes les créatures sur son chemin doivent choisir de quel côté se placer, et tout ce qui traverse ensuite le mur subit 4d10+3 dégâts magiques.'
    },

    // ── Level 5 (2 cards) ──────────────────────────────
    {
      id: 'codex-manifest-wall',
      name: 'Manifest Wall',
      level: 5,
      type: 'spell',
      recallCost: 2,
      feature:
        'Faites un jet de Sort (15). Une fois par repos sur un succès, dépensez un Espoir pour créer un mur magique temporaire entre deux points à Portée Lointaine. Il peut mesurer jusqu\'à 15 mètres de haut et se former sous n\'importe quel angle. Les créatures ou objets sur son chemin sont repoussés du côté de votre choix. Le mur reste en place jusqu\'à votre prochain repos ou jusqu\'à ce que vous lanciez à nouveau Manifest Wall.'
    },
    {
      id: 'codex-teleport',
      name: 'Teleport',
      level: 5,
      type: 'spell',
      recallCost: 2,
      feature:
        'Une fois par repos long, vous pouvez vous téléporter instantanément vous-même et tout nombre de cibles consentantes à Portée Proche vers un lieu où vous êtes déjà allé. Choisissez une des options suivantes, puis faites un jet de Sort (16) : Si vous connaissez très bien le lieu, gagnez un bonus de +3. Si vous l\'avez visité fréquemment, gagnez un bonus de +1. Si vous l\'avez visité rarement, pas de modificateur. Si vous n\'y êtes allé qu\'une seule fois, subissez une pénalité de -2. Sur un succès, vous apparaissez où vous le souhaitiez. Sur un échec, vous apparaissez hors trajectoire, la marge d\'échec déterminant la distance d\'erreur.'
    },

    // ── Level 6 (2 cards) ──────────────────────────────
    {
      id: 'codex-banish',
      name: 'Banish',
      level: 6,
      type: 'spell',
      recallCost: 0,
      feature:
        'Faites un jet de Sort contre une cible à Portée Proche. Sur un succès, lancez un nombre de d20 égal à votre trait de Sort. La cible doit faire un jet de réaction avec une Difficulté égale à votre résultat le plus élevé. Sur un succès de la cible, elle doit marquer un Stress mais n\'est pas bannie. Une fois par repos sur un échec de la cible, elle est bannie de ce plan. Quand les PJ obtiennent la Peur, la Difficulté subit une pénalité de -1 et la cible refait un jet de réaction. Sur un succès, elle revient du bannissement.'
    },
    {
      id: 'codex-sigil-of-retribution',
      name: 'Sigil of Retribution',
      level: 6,
      type: 'spell',
      recallCost: 2,
      feature:
        'Marquez un adversaire à Portée Proche d\'un sceau de rétribution. Le MJ gagne une Peur. Quand l\'adversaire marqué inflige des dégâts à vous ou vos alliés, placez un d8 sur cette carte. Vous pouvez accumuler un nombre de d8 égal à votre niveau. Quand vous attaquez l\'adversaire marqué avec succès, lancez les dés sur cette carte et ajoutez le total à votre jet de dégâts, puis retirez les dés. Cet effet prend fin quand l\'adversaire marqué est vaincu ou que vous lancez à nouveau Sigil of Retribution.'
    },

    // ── Level 7 (2 cards) ──────────────────────────────
    {
      id: 'codex-book-of-homet',
      name: 'Book of Homet',
      level: 7,
      type: 'grimoire',
      recallCost: 0,
      feature:
        'Pass Through : Faites un jet de Sort (13). Une fois par repos sur un succès, vous et toutes les créatures vous touchant pouvez traverser un mur ou une porte à Portée Proche. L\'effet prend fin une fois que tout le monde est de l\'autre côté. Plane Gate : Faites un jet de Sort (14). Une fois par repos long sur un succès, ouvrez un passage vers un lieu dans une autre dimension ou plan d\'existence où vous êtes déjà allé. Ce passage dure jusqu\'à votre prochain repos.'
    },
    {
      id: 'codex-codex-touched',
      name: 'Codex-Touched',
      level: 7,
      type: 'ability',
      recallCost: 2,
      feature:
        'Quand 4 ou plus des cartes de domaine de votre équipement sont du domaine Codex, vous gagnez les bénéfices suivants : Vous pouvez marquer un Stress pour ajouter votre Maîtrise à un jet de Sort ; Une fois par repos, remplacez cette carte par n\'importe quelle carte de votre coffre sans payer son Coût de Rappel.'
    },

    // ── Level 8 (2 cards) ──────────────────────────────
    {
      id: 'codex-book-of-vyola',
      name: 'Book of Vyola',
      level: 8,
      type: 'grimoire',
      recallCost: 2,
      feature:
        'Memory Delve : Faites un jet de Sort contre une cible à Portée Lointaine. Sur un succès, plongez dans l\'esprit de la cible et posez une question au MJ. Le MJ décrit les souvenirs de la cible en rapport avec la réponse. Shared Clarity : Une fois par repos long, dépensez un Espoir pour choisir deux créatures consentantes. Quand l\'une d\'elles devrait marquer un Stress, elles peuvent choisir entre les deux qui le marque. Ce sort dure jusqu\'à leur prochain repos.'
    },
    {
      id: 'codex-safe-haven',
      name: 'Safe Haven',
      level: 8,
      type: 'spell',
      recallCost: 3,
      feature:
        'Quand vous avez quelques minutes de calme pour vous concentrer, vous pouvez dépenser 2 Espoir pour invoquer votre Havre de Paix, une grande demeure interdimensionnelle où vous et vos alliés pouvez vous abriter. Une porte magique apparaît quelque part à Portée Proche. Seules les créatures de votre choix peuvent entrer. Une fois à l\'intérieur, vous pouvez rendre l\'entrée invisible. Vous et tous ceux à l\'intérieur pouvez toujours sortir. Une fois que vous partez, la porte doit être invoquée à nouveau. Quand vous prenez un repos dans votre propre Havre de Paix, vous pouvez choisir un mouvement de temps libre supplémentaire.'
    },

    // ── Level 9 (2 cards) ──────────────────────────────
    {
      id: 'codex-book-of-ronin',
      name: 'Book of Ronin',
      level: 9,
      type: 'grimoire',
      recallCost: 4,
      feature:
        'Transform : Faites un jet de Sort (15). Sur un succès, transformez-vous en un objet inanimé pas plus grand que le double de votre taille normale. Vous pouvez rester sous cette forme jusqu\'à ce que vous subissiez des dégâts. Eternal Enervation : Une fois par repos long, faites un jet de Sort contre une cible à Portée Proche. Sur un succès, elle devient définitivement Vulnérable. Elle ne peut lever cette condition par aucun moyen.'
    },
    {
      id: 'codex-disintegration-wave',
      name: 'Disintegration Wave',
      level: 9,
      type: 'spell',
      recallCost: 4,
      feature:
        'Faites un jet de Sort (18). Une fois par repos long sur un succès, le MJ vous indique quels adversaires à Portée Lointaine ont une Difficulté de 18 ou moins. Marquez un Stress pour chacun que vous souhaitez toucher avec ce sort. Ils sont tués et ne peuvent revenir à la vie par aucun moyen.'
    },

    // ── Level 10 (2 cards) ─────────────────────────────
    {
      id: 'codex-book-of-yarrow',
      name: 'Book of Yarrow',
      level: 10,
      type: 'grimoire',
      recallCost: 2,
      feature:
        'Timejammer : Faites un jet de Sort (18). Sur un succès, le temps ralentit temporairement jusqu\'à l\'arrêt complet pour toute créature à Portée Lointaine sauf vous. Il reprend la prochaine fois que vous faites un jet d\'action ciblant une autre créature. Magic Immunity : Dépensez 5 Espoir pour devenir immunisé aux dégâts magiques jusqu\'à votre prochain repos.'
    },
    {
      id: 'codex-transcendent-union',
      name: 'Transcendent Union',
      level: 10,
      type: 'spell',
      recallCost: 1,
      feature:
        'Une fois par repos long, dépensez 5 Espoir pour lancer ce sort sur deux créatures consentantes ou plus. Jusqu\'à votre prochain repos, quand une créature liée par cette union devrait marquer du Stress ou des Points de Vie, les créatures connectées peuvent choisir qui le marque.'
    }
  ]
}
