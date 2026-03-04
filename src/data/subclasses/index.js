/**
 * @module subclasses/data
 * @description Sous-classes officielles SRD + sous-classes personnalisées Daggerheart.
 * Sources : OfficialClasses_SRD.pdf, CustomClass_Assassin.pdf, CustomClass_Duellist.rtf
 *
 * VAGUE 2 — Features migrées vers le format FeatureDescriptor :
 *  - foundation / specialization / mastery : tableau d'objets { name, description, tags }
 *  - Les champs *Tags parallèles sont supprimés
 *    (tags intégrés directement dans chaque FeatureDescriptor)
 */

// ═══════════════════════════════════════════════════════════
//  CLASSES OFFICIELLES SRD
// ═══════════════════════════════════════════════════════════

export const SUBCLASSES = {
  // ── GUARDIAN ────────────────────────────────────────────
  guardian: [
    {
      id: 'stalwart',
      name: 'Stalwart',
      spellcastTrait: null,
      description: 'Jouez le Stalwart si vous voulez encaisser de lourds coups et continuer à combattre.',
      foundation: [
        { name: 'Unwavering', description: 'Gagnez un bonus permanent de +1 à vos seuils de dégâts.', tags: ['défensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Iron Will', description: 'Quand vous subissez des dégâts physiques, vous pouvez marquer un emplacement d\'armure supplémentaire pour réduire la sévérité.', tags: ['défensif'], activationType: 'reaction', cost: { type: 'armor', amount: 1 }, trigger: 'Vous subissez des dégâts physiques' }
      ],
      specialization: [
        { name: 'Unrelenting', description: 'Gagnez un bonus permanent de +2 à vos seuils de dégâts.', tags: ['défensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Partners-in-Arms', description: 'Quand un allié à Portée Très Proche subit des dégâts, vous pouvez marquer un emplacement d\'armure pour réduire la sévérité d\'un seuil.', tags: ['défensif'], activationType: 'reaction', cost: { type: 'armor', amount: 1 }, range: 'veryClose', trigger: 'Un allié à Portée Très Proche subit des dégâts' }
      ],
      mastery: [
        { name: 'Undaunted', description: 'Gagnez un bonus permanent de +3 à vos seuils de dégâts.', tags: ['défensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Loyal Protector', description: 'Quand un allié à Portée Proche a 2 PV ou moins non marqués et subirait des dégâts, vous pouvez marquer un Stress pour sprinter à ses côtés et subir les dégâts à sa place.', tags: ['défensif'], activationType: 'reaction', cost: { type: 'stress', amount: 1 }, range: 'close', trigger: 'Un allié à Portée Proche (2 PV ou moins) subirait des dégâts' }
      ]
    },
    {
      id: 'vengeance',
      name: 'Vengeance',
      spellcastTrait: null,
      description: 'Jouez la Vengeance si vous voulez abattre les ennemis qui vous blessent, vous ou vos alliés.',
      foundation: [
        { name: 'At Ease', description: 'Gagnez un emplacement de Stress supplémentaire.', tags: ['défensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Revenge', description: 'Quand un adversaire à Portée de Mêlée réussit une attaque contre vous, vous pouvez marquer 2 Stress pour forcer l\'attaquant à marquer un PV.', tags: ['offensif', 'défensif'], activationType: 'reaction', cost: { type: 'stress', amount: 2 }, range: 'melee', trigger: 'Un adversaire en Mêlée réussit une attaque contre vous' }
      ],
      specialization: [
        { name: 'Act of Reprisal', description: 'Quand un adversaire blesse un allié à Portée de Mêlée, vous gagnez un bonus de +1 à votre Maîtrise pour la prochaine attaque réussie contre cet adversaire.', tags: ['offensif'], activationType: 'reaction', cost: { type: 'free', amount: 0 }, range: 'melee', trigger: 'Un adversaire blesse un allié à Portée de Mêlée' }
      ],
      mastery: [
        { name: 'Nemesis', description: 'Dépensez 2 Espoir pour Prioriser un adversaire jusqu\'à votre prochain repos. Quand vous attaquez votre adversaire Priorisé, vous pouvez échanger les résultats de vos Dés d\'Espoir et de Peur. Vous ne pouvez Prioriser qu\'un adversaire à la fois.', tags: ['offensif'], activationType: 'action', cost: { type: 'hope', amount: 2 }, frequency: 'atWill' }
      ]
    }
  ],

  // ── SERAPH ─────────────────────────────────────────────
  seraph: [
    {
      id: 'divine_wielder',
      name: 'Divine Wielder',
      spellcastTrait: 'Strength',
      description: 'Jouez le Divine Wielder si vous voulez dominer le champ de bataille avec une arme légendaire.',
      foundation: [
        { name: 'Spirit Weapon', description: 'Quand vous avez une arme équipée avec une portée de Mêlée ou Très Proche, elle peut voler de votre main pour attaquer un adversaire à Portée Proche puis revenir. Vous pouvez marquer un Stress pour cibler un adversaire supplémentaire à portée avec le même jet d\'attaque.', tags: ['offensif'], activationType: 'action', cost: { type: 'free', amount: 0 }, range: 'close', frequency: 'atWill' },
        { name: 'Sparing Touch', description: 'Une fois par repos long, touchez une créature et effacez 2 PV ou 2 Stress.', tags: ['offensif'], activationType: 'action', cost: { type: 'free', amount: 0 }, range: 'melee', frequency: 'oncePerLongRest' }
      ],
      specialization: [
        { name: 'Devout', description: 'Quand vous lancez vos Dés de Prière, vous pouvez lancer un dé supplémentaire et défausser le résultat le plus bas. De plus, vous pouvez utiliser votre feature « Sparing Touch » deux fois au lieu d\'une par repos long.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      mastery: [
        { name: 'Sacred Resonance', description: 'Quand vous lancez les dégâts pour votre feature « Spirit Weapon », si des résultats de dés correspondent, doublez la valeur de chaque dé correspondant.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ]
    },
    {
      id: 'winged_sentinel',
      name: 'Winged Sentinel',
      spellcastTrait: 'Strength',
      description: 'Jouez le Winged Sentinel si vous voulez prendre votre envol et frapper des coups dévastateurs depuis le ciel.',
      foundation: [
        { name: 'Wings of Light', description: 'Vous pouvez voler. En vol, vous pouvez : marquer un Stress pour transporter une autre créature consentante de votre taille ou moins ; dépenser un Espoir pour infliger 1d8 dégâts supplémentaires sur une attaque réussie.', tags: ['défensif'], activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill' }
      ],
      specialization: [
        { name: 'Ethereal Visage', description: 'Votre visage surnaturel inspire crainte et respect. En vol, vous avez avantage sur les jets de Présence. Quand vous réussissez avec Espoir sur un jet de Présence, vous pouvez retirer une Peur de la réserve du MJ au lieu de gagner un Espoir.', tags: ['défensif'], activationType: 'passive', cost: { type: 'free', amount: 0 }, trait: 'presence' }
      ],
      mastery: [
        { name: 'Ascendant', description: 'Gagnez un bonus permanent de +4 à votre seuil de dégâts Sévères.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Power of the Gods', description: 'En vol, vous infligez 1d12 dégâts supplémentaires au lieu de 1d8 grâce à votre feature « Wings of Light ».', tags: ['défensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ]
    }
  ],

  // ── WARRIOR ────────────────────────────────────────────
  warrior: [
    {
      id: 'call_of_the_brave',
      name: 'Call of the Brave',
      spellcastTrait: null,
      description: 'Jouez le Call of the Brave si vous voulez utiliser la puissance de vos ennemis pour alimenter votre propre pouvoir.',
      foundation: [
        { name: 'Courage', description: 'Quand vous échouez un jet avec Peur, vous gagnez un Espoir.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Battle Ritual', description: 'Une fois par repos long, avant de tenter quelque chose d\'incroyablement dangereux ou d\'affronter un ennemi qui vous surpasse clairement, décrivez le rituel ou les préparatifs que vous effectuez. Effacez 2 Stress et gagnez 2 Espoir.', tags: ['offensif'], activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerLongRest' }
      ],
      specialization: [
        { name: 'Rise to the Challenge', description: 'Vous êtes vigilant face au danger croissant. Tant que vous avez 2 PV non marqués ou moins, vous pouvez lancer un d20 comme Dé d\'Espoir.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      mastery: [
        { name: 'Camaraderie', description: 'Votre bravoure inébranlable est un point de ralliement pour vos alliés. Vous pouvez initier un Tag Team Roll une fois supplémentaire par session. De plus, quand un allié initie un Tag Team Roll avec vous, il n\'a besoin de dépenser que 2 Espoir.', tags: ['offensif', 'défensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ]
    },
    {
      id: 'call_of_the_slayer',
      name: 'Call of the Slayer',
      spellcastTrait: null,
      description: 'Jouez le Call of the Slayer si vous voulez abattre les adversaires avec une force immense.',
      foundation: [
        { name: 'Slayer', description: 'Vous obtenez une réserve de dés appelés Slayer Dice. Sur un jet avec Espoir, vous pouvez placer un d6 sur cette carte au lieu de gagner un Espoir. Vous pouvez stocker un nombre de Slayer Dice égal à votre Maîtrise. Quand vous faites un jet d\'attaque ou de dégâts, vous pouvez dépenser n\'importe quel nombre de ces dés en les lançant et ajoutant le résultat. À la fin de chaque session, effacez les Slayer Dice non dépensés et gagnez un Espoir par dé effacé.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      specialization: [
        { name: 'Weapon Specialist', description: 'Vous pouvez manier plusieurs armes avec une aise dangereuse. Quand vous réussissez une attaque, vous pouvez dépenser un Espoir pour ajouter un dé de dégâts de votre arme secondaire au jet de dégâts. De plus, une fois par repos long quand vous lancez vos Slayer Dice, relancez les 1.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      mastery: [
        { name: 'Martial Preparation', description: 'Vous êtes un guerrier inspirant pour tous ceux qui voyagent avec vous. Votre groupe gagne accès au mouvement de temps libre Martial Preparation. Pour l\'utiliser pendant un repos, décrivez comment vous entraînez votre groupe. Vous et chaque allié qui choisit ce mouvement gagnez un Slayer Die d6.', tags: ['offensif'], activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerShortRest' }
      ]
    }
  ],

  // ── ROGUE ──────────────────────────────────────────────
  rogue: [
    {
      id: 'nightwalker',
      name: 'Nightwalker',
      spellcastTrait: 'Finesse',
      description: 'Jouez le Nightwalker si vous voulez manipuler les ombres pour manœuvrer à travers l\'environnement.',
      foundation: [
        { name: 'Shadow Stepper', description: 'Vous pouvez vous déplacer d\'ombre en ombre. Quand vous entrez dans une zone d\'obscurité ou une ombre projetée par une créature ou un objet, vous pouvez marquer un Stress pour disparaître et réapparaître dans une autre ombre à Portée Lointaine. Quand vous réapparaissez, vous êtes Dissimulé (Cloaked).', tags: ['utilitaire'], activationType: 'action', cost: { type: 'stress', amount: 1 }, range: 'far', frequency: 'atWill' }
      ],
      specialization: [
        { name: 'Dark Cloud', description: 'Faites un Spellcast Roll (15). En cas de succès, créez un nuage sombre temporaire couvrant une zone à Portée Proche. Personne dans ce nuage ne peut voir à l\'extérieur, et personne à l\'extérieur ne peut voir à l\'intérieur. Vous êtes considéré Dissimulé pour tout adversaire dont le nuage bloque la ligne de vue.', tags: ['offensif'], activationType: 'action', cost: { type: 'free', amount: 0 }, trait: 'spellcast', range: 'close', frequency: 'atWill' },
        { name: 'Adrenaline', description: 'Tant que vous êtes Vulnérable, ajoutez votre niveau à vos jets de dégâts.', tags: ['utilitaire'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      mastery: [
        { name: 'Fleeting Shadow', description: 'Gagnez un bonus permanent de +1 à votre Évasion. Vous pouvez utiliser votre feature « Shadow Stepper » pour vous déplacer à Portée Très Lointaine.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Vanishing Act', description: 'Marquez un Stress pour devenir Dissimulé à tout moment. Quand vous êtes Dissimulé par cette feature, vous effacez automatiquement la condition Entravé si vous l\'avez. Vous restez Dissimulé jusqu\'à ce que vous rouliez avec Peur ou jusqu\'à votre prochain repos.', tags: ['utilitaire'], activationType: 'action', cost: { type: 'stress', amount: 1 }, frequency: 'atWill' }
      ]
    },
    {
      id: 'syndicate',
      name: 'Syndicate',
      spellcastTrait: 'Finesse',
      description: 'Jouez le Syndicate si vous voulez avoir un réseau de contacts partout où vous allez.',
      foundation: [
        { name: 'Well-Connected', description: 'Quand vous arrivez dans une ville ou un environnement important, vous connaissez quelqu\'un qui y vit. Donnez-lui un nom, notez comment il pourrait être utile, et choisissez un fait : il vous doit une faveur mais sera difficile à trouver ; il va demander quelque chose en échange ; il est toujours dans de gros ennuis ; vous étiez ensemble, c\'est une longue histoire ; vous ne vous êtes pas quittés en bons termes.', tags: ['social', 'utilitaire'], activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill' }
      ],
      specialization: [
        { name: 'Contacts Everywhere', description: 'Une fois par session, vous pouvez brièvement faire appel à un contact louche. Choisissez un bénéfice et décrivez ce qui l\'a amené ici : il fournit 1 poignée d\'or, un outil unique, ou un objet mundain nécessaire ; sur votre prochain jet d\'action, son aide fournit un bonus de +3 au résultat de votre Dé d\'Espoir ou de Peur ; la prochaine fois que vous infligez des dégâts, il tire depuis les ombres, ajoutant 2d8 à votre jet de dégâts.', tags: ['utilitaire'], activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerSession' }
      ],
      mastery: [
        { name: 'Reliable Backup', description: 'Vous pouvez utiliser votre feature « Contacts Everywhere » trois fois par session. Les options suivantes s\'ajoutent à la liste de bénéfices : quand vous marquez 1+ PV, il peut se précipiter pour vous protéger, réduisant les PV marqués de 1 ; quand vous faites un jet de Présence en conversation, il vous soutient — vous pouvez lancer un d20 comme Dé d\'Espoir.', tags: ['utilitaire'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ]
    }
  ],

  // ── BARD ───────────────────────────────────────────────
  bard: [
    {
      id: 'troubadour',
      name: 'Troubadour',
      spellcastTrait: 'Presence',
      description: 'Jouez le Troubadour si vous voulez jouer de la musique pour renforcer vos alliés.',
      foundation: [
        { name: 'Gifted Performer', description: 'Vous pouvez jouer trois types de chansons différentes, une fois chacune par repos long ; décrivez comment vous jouez pour obtenir le bénéfice : Relaxing Song — vous et tous les alliés à Portée Proche effacez un PV ; Epic Song — rendez temporairement une cible à Portée Proche Vulnérable ; Heartbreaking Song — vous et tous les alliés à Portée Proche gagnez un Espoir.', tags: ['social', 'défensif'], activationType: 'action', cost: { type: 'free', amount: 0 }, trait: 'spellcast', range: 'close', frequency: 'oncePerLongRest' }
      ],
      specialization: [
        { name: 'Maestro', description: 'Vos chants de ralliement renforcent le courage de ceux qui écoutent. Quand vous donnez un Rally Die à un allié, il peut gagner un Espoir ou effacer un Stress.', tags: ['défensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      mastery: [
        { name: 'Virtuoso', description: 'Vous êtes parmi les plus grands de votre art et votre talent est sans limites. Vous pouvez interpréter chacune des chansons de votre feature « Gifted Performer » deux fois par repos long.', tags: ['défensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ]
    },
    {
      id: 'wordsmith',
      name: 'Wordsmith',
      spellcastTrait: 'Presence',
      description: 'Jouez le Wordsmith si vous voulez utiliser des jeux de mots habiles et captiver les foules.',
      foundation: [
        { name: 'Rousing Speech', description: 'Une fois par repos long, vous pouvez donner un discours inspirant et sincère. Tous les alliés à Portée Lointaine effacent 2 Stress.', tags: ['social'], activationType: 'action', cost: { type: 'free', amount: 0 }, range: 'far', frequency: 'oncePerLongRest' },
        { name: 'Heart of a Poet', description: 'Après un jet d\'action pour impressionner, persuader ou offenser quelqu\'un, vous pouvez dépenser un Espoir pour ajouter un d4 au jet.', tags: ['social'], activationType: 'reaction', cost: { type: 'hope', amount: 1 }, trigger: 'Vous faites un jet d\'action social' }
      ],
      specialization: [
        { name: 'Eloquent', description: 'Vos mots émouvants remontent le moral. Une fois par session, quand vous encouragez un allié, vous pouvez : lui permettre de trouver un objet ou outil mundain dont il a besoin ; Aider un Allié sans dépenser d\'Espoir ; lui donner un mouvement de temps libre supplémentaire pendant son prochain repos.', tags: ['social'], activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerSession' }
      ],
      mastery: [
        { name: 'Epic Poetry', description: 'Votre Rally Die passe à un d10. De plus, quand vous Aidez un Allié, vous pouvez narrer le moment comme si vous écriviez le récit de leur héroïsme dans des mémoires. Quand vous le faites, lancez un d10 comme dé d\'avantage.', tags: ['social'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ]
    }
  ],

  // ── DRUID ──────────────────────────────────────────────
  druid: [
    {
      id: 'warden_of_the_elements',
      name: 'Warden of the Elements',
      spellcastTrait: 'Instinct',
      description: 'Jouez le Warden of the Elements si vous voulez incarner les éléments naturels de la nature sauvage.',
      foundation: [
        { name: 'Elemental Incarnation', description: 'Marquez un Stress pour Canaliser un des éléments suivants jusqu\'à ce que vous subissiez des dégâts Sévères ou jusqu\'à votre prochain repos — Feu : quand un adversaire à Portée de Mêlée vous inflige des dégâts, il subit 1d10 dégâts magiques ; Terre : gagnez un bonus à vos seuils de dégâts égal à votre Maîtrise ; Eau : quand vous infligez des dégâts à un adversaire à Portée de Mêlée, tous les autres adversaires à Portée Très Proche doivent marquer un Stress ; Air : vous pouvez léviter, gagnant avantage sur les jets d\'Agilité.', tags: ['utilitaire'], activationType: 'action', cost: { type: 'stress', amount: 1 }, frequency: 'atWill' }
      ],
      specialization: [
        { name: 'Elemental Aura', description: 'Une fois par repos en Canalisant, vous pouvez assumer une aura correspondant à votre élément. L\'aura affecte les cibles à Portée Proche jusqu\'à la fin de votre Canalisation — Feu : quand un adversaire marque 1+ PV, il doit aussi marquer un Stress ; Terre : vos alliés gagnent +1 en Force ; Eau : quand un adversaire vous inflige des dégâts, marquez un Stress pour le déplacer n\'importe où à Portée Très Proche de sa position ; Air : quand vous ou un allié subissez des dégâts d\'une attaque au-delà de Mêlée, réduisez les dégâts de 1d8.', tags: ['offensif', 'utilitaire'], activationType: 'action', cost: { type: 'free', amount: 0 }, range: 'close', frequency: 'oncePerShortRest' }
      ],
      mastery: [
        { name: 'Elemental Dominion', description: 'Vous incarnez davantage votre élément. En Canalisant, vous gagnez le bénéfice suivant — Feu : +1 à votre Maîtrise pour les attaques et sorts qui infligent des dégâts ; Terre : quand vous marquez des PV, lancez un d6 par PV marqué — pour chaque résultat de 6, réduisez les PV marqués de 1 ; Eau : quand une attaque contre vous réussit, marquez un Stress pour rendre l\'attaquant temporairement Vulnérable ; Air : +1 à votre Évasion et vous pouvez voler.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ]
    },
    {
      id: 'warden_of_renewal',
      name: 'Warden of Renewal',
      spellcastTrait: 'Instinct',
      description: 'Jouez le Warden of Renewal si vous voulez utiliser une magie puissante pour soigner votre groupe.',
      foundation: [
        { name: 'Clarity of Nature', description: 'Une fois par repos long, vous pouvez créer un espace de sérénité naturelle à Portée Proche. Quand vous passez quelques minutes à vous reposer dans cet espace, effacez du Stress égal à votre Instinct, réparti comme vous le souhaitez entre vous et vos alliés.', tags: ['utilitaire'], activationType: 'action', cost: { type: 'free', amount: 0 }, trait: 'instinct', range: 'close', frequency: 'oncePerLongRest' },
        { name: 'Regeneration', description: 'Touchez une créature et dépensez 3 Espoir. Cette créature efface 1d4 PV.', tags: ['défensif'], activationType: 'action', cost: { type: 'hope', amount: 3 }, range: 'melee', frequency: 'atWill' }
      ],
      specialization: [
        { name: 'Regenerative Reach', description: 'Vous pouvez cibler des créatures à Portée Très Proche avec votre feature « Regeneration ».', tags: ['utilitaire'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Warden\'s Protection', description: 'Une fois par repos long, dépensez 2 Espoir pour effacer 2 PV sur 1d4 alliés à Portée Proche.', tags: ['offensif'], activationType: 'action', cost: { type: 'hope', amount: 2 }, range: 'close', frequency: 'oncePerLongRest' }
      ],
      mastery: [
        { name: 'Defender', description: 'Votre transformation animale incarne un esprit gardien guérisseur. Quand vous êtes en Beastform et qu\'un allié à Portée Proche marque 2 PV ou plus, vous pouvez marquer un Stress pour réduire le nombre de PV qu\'il marque de 1.', tags: ['offensif'], activationType: 'reaction', cost: { type: 'stress', amount: 1 }, range: 'close', trigger: 'Un allié à Portée Proche marque 2+ PV en Beastform' }
      ]
    }
  ],

  // ── RANGER ─────────────────────────────────────────────
  ranger: [
    {
      id: 'beastbound',
      name: 'Beastbound',
      spellcastTrait: 'Agility',
      description: 'Jouez le Beastbound si vous voulez forger un lien profond avec un allié animal.',
      foundation: [
        { name: 'Companion', description: 'Vous avez un compagnon animal de votre choix (à la discrétion du MJ). Il reste à vos côtés sauf indication contraire. Prenez la feuille Ranger Companion. Quand vous montez de niveau, choisissez une option de montée de niveau pour votre compagnon également.', tags: ['utilitaire'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      specialization: [
        { name: 'Expert Training', description: 'Choisissez une option de montée de niveau supplémentaire pour votre compagnon.', tags: ['utilitaire'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Battle-Bonded', description: 'Quand un adversaire vous attaque alors qu\'il est à Portée de Mêlée de votre compagnon, vous gagnez un bonus de +2 à votre Évasion contre l\'attaque.', tags: ['défensif'], activationType: 'passive', cost: { type: 'free', amount: 0 }, range: 'melee' }
      ],
      mastery: [
        { name: 'Advanced Training', description: 'Choisissez deux options de montée de niveau supplémentaires pour votre compagnon.', tags: ['utilitaire'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Loyal Friend', description: 'Une fois par repos long, quand les dégâts d\'une attaque marqueraient le dernier Stress de votre compagnon ou votre dernier PV et que vous êtes à Portée Proche l\'un de l\'autre, vous ou votre compagnon pouvez vous précipiter aux côtés de l\'autre et subir ces dégâts à sa place.', tags: ['défensif'], activationType: 'reaction', cost: { type: 'free', amount: 0 }, range: 'close', frequency: 'oncePerLongRest', trigger: 'Dernier Stress du compagnon ou dernier PV à Portée Proche' }
      ]
    },
    {
      id: 'wayfinder',
      name: 'Wayfinder',
      spellcastTrait: 'Agility',
      description: 'Jouez le Wayfinder si vous voulez traquer votre proie et frapper avec une force mortelle.',
      foundation: [
        { name: 'Ruthless Predator', description: 'Quand vous faites un jet de dégâts, vous pouvez marquer un Stress pour gagner un bonus de +1 à votre Maîtrise. De plus, quand vous infligez des dégâts Sévères à un adversaire, il doit marquer un Stress.', tags: ['offensif'], activationType: 'reaction', cost: { type: 'stress', amount: 1 }, trigger: 'Vous faites un jet de dégâts' },
        { name: 'Path Forward', description: 'Quand vous voyagez vers un lieu que vous avez déjà visité ou que vous portez un objet qui s\'y trouvait, vous pouvez identifier le chemin le plus court et le plus direct vers votre destination.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      specialization: [
        { name: 'Elusive Predator', description: 'Quand votre Focus vous attaque, vous gagnez un bonus de +2 à votre Évasion contre l\'attaque.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      mastery: [
        { name: 'Apex Predator', description: 'Avant de faire un jet d\'attaque contre votre Focus, vous pouvez dépenser un Espoir. Sur une attaque réussie, vous retirez une Peur de la réserve du MJ.', tags: ['offensif'], activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'atWill' }
      ]
    }
  ],

  // ── WIZARD ─────────────────────────────────────────────
  wizard: [
    {
      id: 'school_of_knowledge',
      name: 'School of Knowledge',
      spellcastTrait: 'Knowledge',
      description: 'Jouez la School of Knowledge si vous voulez une compréhension aiguë du monde qui vous entoure.',
      domainCardBonuses: { foundation: 1, specialization: 1, mastery: 1 },
      foundation: [
        { name: 'Prepared', description: 'Prenez une carte de domaine supplémentaire de votre niveau ou inférieur d\'un domaine auquel vous avez accès.', tags: ['utilitaire'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Adept', description: 'Quand vous Utilisez une Expérience, vous pouvez marquer un Stress au lieu de dépenser un Espoir. Si vous le faites, doublez votre modificateur d\'Expérience pour ce jet.', tags: ['utilitaire'], activationType: 'reaction', cost: { type: 'stress', amount: 1 }, trigger: 'Vous Utilisez une Expérience' }
      ],
      specialization: [
        { name: 'Accomplished', description: 'Prenez une carte de domaine supplémentaire de votre niveau ou inférieur d\'un domaine auquel vous avez accès.', tags: ['utilitaire'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Perfect Recall', description: 'Une fois par repos, quand vous rappelez une carte de domaine de votre coffre, vous pouvez réduire son Coût de Rappel de 1.', tags: ['utilitaire'], activationType: 'reaction', cost: { type: 'free', amount: 0 }, frequency: 'oncePerShortRest', trigger: 'Vous rappelez une carte de domaine' }
      ],
      mastery: [
        { name: 'Brilliant', description: 'Prenez une carte de domaine supplémentaire de votre niveau ou inférieur d\'un domaine auquel vous avez accès.', tags: ['utilitaire'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Honed Expertise', description: 'Quand vous utilisez une Expérience, lancez un d6. Sur un résultat de 5 ou plus, vous pouvez l\'utiliser sans dépenser d\'Espoir.', tags: ['défensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ]
    },
    {
      id: 'school_of_war',
      name: 'School of War',
      spellcastTrait: 'Knowledge',
      description: 'Jouez la School of War si vous voulez utiliser la magie entraînée pour la violence.',
      foundation: [
        { name: 'Battlemage', description: 'Vous avez concentré vos études pour devenir une force imparable sur le champ de bataille. Gagnez un emplacement de PV supplémentaire.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Face Your Fear', description: 'Quand vous réussissez avec Peur sur un jet d\'attaque, vous infligez 1d10 dégâts magiques supplémentaires.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      specialization: [
        { name: 'Conjure Shield', description: 'Vous pouvez maintenir une barrière protectrice de magie. Tant que vous avez au moins 2 Espoir, vous ajoutez votre Maîtrise à votre Évasion.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Fueled by Fear', description: 'Les dégâts magiques supplémentaires de votre feature « Face Your Fear » passent à 2d10.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      mastery: [
        { name: 'Thrive in Chaos', description: 'Quand vous réussissez une attaque, vous pouvez marquer un Stress après avoir lancé les dégâts pour forcer la cible à marquer un PV supplémentaire.', tags: ['offensif'], activationType: 'reaction', cost: { type: 'stress', amount: 1 }, trigger: 'Vous réussissez une attaque' },
        { name: 'Have No Fear', description: 'Les dégâts magiques supplémentaires de votre feature « Face Your Fear » passent à 3d10.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ]
    }
  ],

  // ── SORCERER ───────────────────────────────────────────
  sorcerer: [
    {
      id: 'elemental_origin',
      name: 'Elemental Origin',
      spellcastTrait: 'Instinct',
      description: 'Jouez l\'Elemental Origin si vous voulez canaliser la magie brute pour prendre la forme d\'un élément particulier.',
      foundation: [
        { name: 'Elementalist', description: 'Choisissez un élément à la création du personnage : air, terre, feu, foudre, eau. Vous pouvez façonner cet élément en effets inoffensifs. De plus, dépensez un Espoir et décrivez comment votre contrôle de cet élément aide un jet d\'action que vous allez faire, puis gagnez un bonus de +2 au jet ou un bonus de +3 aux dégâts du jet.', tags: ['offensif', 'utilitaire'], activationType: 'action', cost: { type: 'hope', amount: 1 }, frequency: 'atWill' }
      ],
      specialization: [
        { name: 'Natural Evasion', description: 'Vous pouvez invoquer votre élément pour vous protéger. Quand un jet d\'attaque contre vous réussit, vous pouvez marquer un Stress et décrire comment vous utilisez votre élément pour vous défendre. Quand vous le faites, lancez un d6 et ajoutez son résultat à votre Évasion contre l\'attaque.', tags: ['défensif'], activationType: 'reaction', cost: { type: 'stress', amount: 1 }, trigger: 'Un jet d\'attaque contre vous réussit' }
      ],
      mastery: [
        { name: 'Transcendence', description: 'Une fois par repos long, vous pouvez vous transformer en une manifestation physique de votre élément. Décrivez votre transformation et choisissez deux des bénéfices suivants jusqu\'à votre prochain repos : +4 au seuil Sévère ; +1 à un trait de personnage de votre choix ; +1 à votre Maîtrise ; +2 à votre Évasion.', tags: ['défensif', 'utilitaire'], activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerLongRest' }
      ]
    },
    {
      id: 'primal_origin',
      name: 'Primal Origin',
      spellcastTrait: 'Instinct',
      description: 'Jouez le Primal Origin si vous voulez étendre la versatilité de vos sorts de manières puissantes.',
      foundation: [
        { name: 'Manipulate Magic', description: 'Votre origine primale vous permet de modifier l\'essence même de la magie. Après avoir lancé un sort ou fait une attaque avec une arme infligeant des dégâts magiques, vous pouvez marquer un Stress pour : étendre la portée du sort ou de l\'attaque d\'un cran ; gagner un bonus de +2 au résultat du jet d\'action ; doubler un dé de dégâts de votre choix ; toucher une cible supplémentaire à portée.', tags: ['offensif', 'utilitaire'], activationType: 'reaction', cost: { type: 'stress', amount: 1 }, trigger: 'Vous lancez un sort ou faites une attaque magique' }
      ],
      specialization: [
        { name: 'Enchanted Aid', description: 'Vous pouvez améliorer la magie des autres avec votre essence. Quand vous Aidez un Allié avec un Spellcast Roll, vous pouvez lancer un d8 comme dé d\'avantage. Une fois par repos long, après qu\'un allié a fait un Spellcast Roll avec votre aide, vous pouvez échanger les résultats de ses Duality Dice.', tags: ['social', 'utilitaire'], activationType: 'reaction', cost: { type: 'free', amount: 0 }, trigger: 'Vous Aidez un Allié avec un Spellcast Roll' }
      ],
      mastery: [
        { name: 'Arcane Charge', description: 'Vous pouvez accumuler de l\'énergie magique pour améliorer vos capacités. Quand vous subissez des dégâts magiques, vous devenez Chargé. Alternativement, vous pouvez dépenser 2 Espoir pour devenir Chargé. Quand vous réussissez une attaque infligeant des dégâts magiques en étant Chargé, vous pouvez dissiper votre Charge pour gagner un bonus de +10 aux dégâts ou un bonus de +3 à la Difficulté d\'un jet de réaction que le sort impose à la cible. Vous cessez d\'être Chargé à votre prochain repos long.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ]
    }
  ],

  // ═══════════════════════════════════════════════════════
  //  CLASSES PERSONNALISÉES (HOMEBREW)
  // ═══════════════════════════════════════════════════════

  // ── ASSASSIN (The Void v1.5) ───────────────────────────
  assassin: [
    {
      id: 'executioners_guild',
      name: 'Executioners Guild',
      spellcastTrait: null,
      description: 'La Guilde des Exécuteurs se spécialise dans l\'élimination rapide et brutale de ses cibles.',
      foundation: [
        { name: 'First Strike', description: 'La première fois dans une scène que vous réussissez un jet d\'attaque, doublez les dégâts de l\'attaque.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 }, frequency: 'oncePerScene' },
        { name: 'Ambush', description: 'Votre feature « Marked for Death » utilise des d6 au lieu de d4.', tags: ['utilitaire'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      specialization: [
        { name: 'Death Strike', description: 'Quand vous infligez des dégâts Sévères à une créature, vous pouvez marquer un Stress pour lui faire marquer un PV supplémentaire.', tags: ['offensif'], activationType: 'reaction', cost: { type: 'stress', amount: 1 }, trigger: 'Vous infligez des dégâts Sévères' },
        { name: 'Scorpion\'s Poise', description: 'Vous gagnez un bonus de +2 à votre Évasion contre toute attaque effectuée par une créature Marked for Death.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      mastery: [
        { name: 'True Strike', description: 'Une fois par repos long, quand vous échouez un jet d\'attaque, vous pouvez dépenser un Espoir pour en faire une réussite.', tags: ['offensif'], activationType: 'reaction', cost: { type: 'hope', amount: 1 }, frequency: 'oncePerLongRest', trigger: 'Vous échouez un jet d\'attaque' },
        { name: 'Backstab', description: 'Votre feature « Marked for Death » utilise des d8 au lieu de d6.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ]
    },
    {
      id: 'poisoners_guild',
      name: 'Poisoners Guild',
      spellcastTrait: 'Knowledge',
      description: 'La Guilde des Empoisonneurs maîtrise l\'art des toxines et des concoctions mortelles.',
      foundation: [
        { name: 'Toxic Concoctions', description: 'Marquez un Stress pour ajouter 1d4+1 jetons sur cette carte. À votre prochain repos long, videz cette carte. Vous connaissez ces poisons : Gorgon Root (la cible reçoit un malus permanent de -1 à sa Difficulté, une seule fois) ; Grave Spore (la cible doit aussi marquer un Stress) ; Leech Weed (bonus de +1d6 aux dégâts de cette attaque).', tags: ['offensif'], activationType: 'action', cost: { type: 'stress', amount: 1 }, frequency: 'atWill' },
        { name: 'Envenomate', description: 'Quand vous réussissez une attaque avec une arme, vous pouvez dépenser un jeton de cette carte pour infliger à la cible l\'effet d\'un poison connu.', tags: ['utilitaire'], activationType: 'reaction', cost: { type: 'free', amount: 0 }, trigger: 'Vous réussissez une attaque avec une arme' }
      ],
      specialization: [
        { name: 'Poison Compendium', description: 'Vous connaissez aussi ces poisons : Midnight\'s Veil (malus permanent de -2 aux jets d\'attaque de la cible, une seule fois) ; Ghost Petal (diminuez d\'un cran les dés de dégâts de l\'attaque standard de la cible, une seule fois).', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Adder\'s Blessing', description: 'Vous êtes immunisé aux poisons et autres toxines.', tags: ['utilitaire'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ],
      mastery: [
        { name: 'Venomancer', description: 'Vous connaissez aussi ces poisons : Blight Seed (malus permanent de -3 aux seuils de dégâts de la cible, une seule fois) ; Fear Leaf (cette attaque gagne un bonus aux dégâts égal au résultat de votre Dé de Peur).', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'Twin Fang', description: 'Quand vous infligez l\'effet d\'un poison connu à une cible, vous pouvez dépenser un jeton supplémentaire pour infliger l\'effet d\'un second poison connu.', tags: ['utilitaire'], activationType: 'reaction', cost: { type: 'free', amount: 0 }, trigger: 'Vous infligez un poison via Envenomate' }
      ]
    }
  ],

  // ── DUELLIST (Homebrew) ────────────────────────────────
  duellist: [
    {
      id: 'swashbuckler',
      name: 'Swashbuckler',
      spellcastTrait: 'Presence',
      description: 'Jouez le Swashbuckler si vous voulez surpasser vos rivaux en duel avec panache.',
      foundation: [
        { name: 'Roiling Braggart', description: 'Quand vous Fanfaronnez (Boast), vous pouvez donner une Peur au MJ pour augmenter le dé d\'avantage à un d8.', tags: ['offensif'], activationType: 'reaction', cost: { type: 'fear', amount: 1 }, trigger: 'Vous Fanfaronnez (Boast)' },
        { name: 'A Tale to Tell', description: 'Décrivez comme si vous racontiez l\'histoire plus tard — narrez comment vous rendez un Rival Vulnérable. Il reste Vulnérable jusqu\'à ce que quelqu\'un l\'attaque.', tags: ['social'], activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'atWill' }
      ],
      specialization: [
        { name: 'Deflective Dodge', description: 'Quand un adversaire vous attaque alors qu\'un autre adversaire est à Portée de Mêlée, marquez un Stress pour rediriger l\'attaque et infliger ses dégâts à cet adversaire.', tags: ['offensif'], activationType: 'reaction', cost: { type: 'stress', amount: 1 }, range: 'melee', trigger: 'Un adversaire vous attaque avec un autre adversaire en Mêlée' }
      ],
      mastery: [
        { name: 'A Worthy Opponent', description: 'Vous pouvez avoir un Rival Juré. Cette Rivalité ne compte pas dans votre limite de Rivaux et ne se termine pas à la fin d\'une scène. Deux fois par repos, tant que vous pouvez voir votre Rival Juré, vous pouvez Fanfaronner un jet pour 2 Espoir. De plus, vous pouvez facilement découvrir la localisation et les activités récentes de votre Rival Juré. Vous ne pouvez pas avoir de nouveau Rival Juré sans en informer le précédent.', tags: ['offensif', 'utilitaire'], activationType: 'passive', cost: { type: 'free', amount: 0 } }
      ]
    },
    {
      id: 'acrobat',
      name: 'Acrobat',
      spellcastTrait: 'Agility',
      description: 'Jouez l\'Acrobat si vous voulez échapper facilement à ceux qui vous poursuivent.',
      foundation: [
        { name: 'Stunt Performer', description: 'Quand vous Fanfaronnez un jet d\'Agilité, au lieu d\'ajouter le résultat du dé d\'avantage à votre total, ajoutez-le à votre Dé d\'Espoir.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 }, trait: 'agility' },
        { name: 'Roll With the Punches', description: 'Une fois par repos long, quand vous échouez un jet d\'action, vous pouvez dépenser 2 Espoir pour faire un jet d\'Agilité afin de rapidement fuir ou vous cacher — utilisez un d20 pour le Dé de Peur.', tags: ['utilitaire'], activationType: 'reaction', cost: { type: 'hope', amount: 2 }, trait: 'agility', frequency: 'oncePerLongRest', trigger: 'Vous échouez un jet d\'action' }
      ],
      specialization: [
        { name: 'Tumbler', description: 'Vous êtes immunisé aux dégâts physiques causés par les chutes ou le fait d\'être projeté.', tags: ['offensif'], activationType: 'passive', cost: { type: 'free', amount: 0 } },
        { name: 'A Double Act', description: 'Une fois par repos long, vous pouvez choisir un allié. Le coût pour initier un Tag Team Roll avec cet allié est réduit à 1 Espoir.', tags: ['défensif'], activationType: 'action', cost: { type: 'free', amount: 0 }, frequency: 'oncePerLongRest' }
      ],
      mastery: [
        { name: 'Steal the Spotlight', description: 'Une fois par repos, marquez un Stress pour commencer une démonstration éblouissante. Pendant cette démonstration, tous les adversaires deviennent vos Rivaux. Placez un d4 Dazzling Die sur cette carte avec la valeur 4. Quand un adversaire vous attaque ou vous inflige des dégâts, ajoutez la valeur actuelle du Dazzling Die à votre Évasion et vos seuils de dégâts, déplacez-vous immédiatement jusqu\'à Portée Lointaine, puis diminuez la valeur du dé de 1. Une fois que la valeur atteint 0 ou que la scène se termine, la démonstration prend fin.', tags: ['offensif'], activationType: 'action', cost: { type: 'stress', amount: 1 }, frequency: 'oncePerShortRest' }
      ]
    }
  ]
}

/**
 * Retourne les sous-classes d'une classe donnée.
 * @param {string} classId
 * @returns {Object[]}
 */
export function getSubclassesForClass(classId) {
  return SUBCLASSES[classId] || []
}

/**
 * Retourne une sous-classe par ID de classe et ID de sous-classe.
 * @param {string} classId
 * @param {string} subclassId
 * @returns {Object|null}
 */
export function getSubclassById(classId, subclassId) {
  const subclasses = getSubclassesForClass(classId)
  return subclasses.find((s) => s.id === subclassId) || null
}
