/**
 * @module subclasses/data
 * @description Sous-classes officielles SRD + sous-classes personnalisées Daggerheart.
 * Sources : OfficialClasses_SRD.pdf, CustomClass_Duellist.rtf
 */

/**
 * Sous-classes par classe.
 * Chaque sous-classe a 3 niveaux : Foundation (1-4), Specialization (5-7), Mastery (8+).
 */
export const SUBCLASSES = {
  guardian: [
    {
      id: 'stalwart',
      name: 'Stalwart',
      spellcastTrait: null,
      description: 'Le Stalwart est le guerrier défensif par excellence, un roc sur lequel ses alliés peuvent compter.',
      foundation: [
        'Iron Wall: Quand vous effectuez une réaction de défense, gagnez +2 à l\'Évasion jusqu\'au début de votre prochain tour.',
        'Rallying Cry: Une fois par round, quand vous subissez des dégâts, un allié à Portée Très Proche peut effacer un Stress.'
      ],
      specialization: 'Fortress: Réduisez tous les dégâts subis de 1 supplémentaire (cumulatif avec d\'autres réductions).',
      mastery: 'Unbreakable: Une fois par session courte, ignorez tous les dégâts d\'une seule attaque.'
    },
    {
      id: 'warden',
      name: 'Warden',
      spellcastTrait: 'Présence',
      description: 'Le Warden protège ses alliés avec des capacités magiques de protection divine.',
      foundation: [
        'Sacred Ground: Marquez un Stress pour consacrer une zone à Portée Très Proche. Les alliés dans la zone gagnent +1 à l\'Évasion.',
        'Aura of Protection: Les alliés à Portée Très Proche bénéficient d\'un bouclier de 1 point de dégâts absorbés par attaque.'
      ],
      specialization: 'Divine Shield: Dépensez 2 Espoir pour créer un bouclier magique sur un allié — la prochaine attaque contre lui rate automatiquement.',
      mastery: 'Sanctuary: Une fois par session, créez une zone sacrée. Toutes les créatures hostiles doivent réussir un jet de Présence (14) pour y entrer.'
    }
  ],
  seraph: [
    {
      id: 'divine',
      name: 'Divine',
      spellcastTrait: 'Présence',
      description: 'Le Divin canalise la lumière sacrée pour soigner et protéger.',
      foundation: [
        'Healing Light: Votre Radiant Touch efface 1 PV supplémentaire.',
        'Blessed Armor: Gagnez +1 aux seuils d\'armure (Mineur et Majeur).'
      ],
      specialization: 'Resurrection: Une fois par session, ramenez un allié K.O. avec 2 PV effacés. Marquez 3 Stress.',
      mastery: 'Divine Intervention: Une fois par campagne, invoquez une intervention divine. Le MJ doit permettre un résultat narratif en votre faveur.'
    },
    {
      id: 'zealot',
      name: 'Zealot',
      spellcastTrait: 'Présence',
      description: 'Le Zélote transforme sa foi en puissance offensive sacrée.',
      foundation: [
        'Smite: Dépensez 1 Espoir pour ajouter d6 dégâts magiques (sacrés) à une attaque réussie.',
        'Righteous Fury: Quand un allié est vaincu, gagnez avantage sur tous les jets jusqu\'à la fin du round.'
      ],
      specialization: 'Holy Vengeance: Vos attaques contre des créatures mortes-vivantes ou démoniaques infligent +2d6 dégâts.',
      mastery: 'Avatar of Faith: Une fois par session, entrez en état de zèle divin pendant 3 rounds : toutes vos attaques infligent des dégâts magiques (sacrés) supplémentaires égaux à votre Présence.'
    }
  ],
  warrior: [
    {
      id: 'berserker',
      name: 'Berserker',
      spellcastTrait: null,
      description: 'Le Berserker puise dans une rage animale pour déchaîner une puissance dévastatrice.',
      foundation: [
        'Rage: Marquez un Stress pour entrer en Rage. Gagnez +1d6 aux dégâts et ignorez le premier PV marqué chaque round. Sortez de Rage après 3 rounds ou quand vous choisissez.',
        'Reckless Attack: Attaquez avec avantage mais les adversaires ont aussi avantage contre vous jusqu\'à votre prochain tour.'
      ],
      specialization: 'Unstoppable Rage: En Rage, ignorez la condition Entravé et réduisez les dégâts subis de 2.',
      mastery: 'Eternal Warrior: Une fois par session, entrez en Rage légendaire — durée illimitée cette scène, +2d6 dégâts, et régénérez 1 PV à chaque attaque réussie.'
    },
    {
      id: 'knight',
      name: 'Knight',
      spellcastTrait: null,
      description: 'Le Chevalier maîtrise les techniques de combat disciplinées et le combat en armure lourde.',
      foundation: [
        'Disciplined Strike: Vos attaques ignorent 1 point d\'armure de la cible.',
        'Mounted Combat: Avantage sur tous les jets de combat lorsque vous êtes monté. Votre monture ne peut pas être ciblée par des attaques si vous êtes à Portée de Mêlée d\'un adversaire.'
      ],
      specialization: 'Heavy Hitter: Vos attaques à deux mains infligent +2 dégâts supplémentaires.',
      mastery: 'Legendary Warrior: Votre Maîtrise augmente de +1 pour tous les jets de combat.'
    }
  ],
  rogue: [
    {
      id: 'shadow',
      name: 'Shadow',
      spellcastTrait: 'Finesse',
      description: 'Le Shadow maîtrise l\'art de l\'infiltration et de l\'assassinat depuis les ténèbres.',
      foundation: [
        'Smoke and Mirrors: Dépensez 1 Espoir pour créer une distraction, permettant à vous et vos alliés de vous déplacer sans déclencher de réactions.',
        'Assassinate: Doublez les dégâts d\'une attaque effectuée depuis l\'état Caché.'
      ],
      specialization: 'Death from Above: Quand vous attaquez depuis une position surélevée tout en étant Caché, infligez dégâts maximaux et l\'adversaire est Vulnérable pendant 1 round.',
      mastery: 'Phantom: Vous pouvez devenir invisible à volonté (marquez un Stress). Tant qu\'invisible, vous ne pouvez pas être ciblé.'
    },
    {
      id: 'trickster',
      name: 'Trickster',
      spellcastTrait: 'Présence',
      description: 'Le Trickster utilise la ruse et la magie illusoire pour mystifier ses ennemis.',
      foundation: [
        'Illusory Double: Créez un double illusoire de vous-même. La première attaque contre vous rate automatiquement (il frappe l\'illusion). Marquez un Stress.',
        'Misdirection: Faites un jet de Présence pour convaincre un adversaire qu\'une menace vient d\'une autre direction.'
      ],
      specialization: 'Confounding Strike: Vos attaques réussies Désorientent la cible jusqu\'à la fin de son prochain tour.',
      mastery: 'Grand Illusion: Créez une illusion complexe de taille jusqu\'à Grande Taille. Elle dure une scène et peut bouger selon vos instructions mentales.'
    }
  ],
  bard: [
    {
      id: 'troubadour',
      name: 'Troubadour',
      spellcastTrait: 'Présence',
      description: 'Le Troubadour inspire et soutient ses alliés par la musique et l\'éloquence.',
      foundation: [
        'Battle Hymn: Vos alliés dans la scène gagnent +1 à tous les jets d\'attaque quand vous utilisez votre action pour jouer un hymne de bataille.',
        'Soothing Melody: Marquez un Stress pour permettre à un allié d\'effacer 1 Stress.'
      ],
      specialization: 'Virtuoso: Votre Rally Die passe à d10 et vos alliés peuvent utiliser leur Rally Die pour effacer 1 PV (au lieu de Stress uniquement).',
      mastery: 'Symphony of Battle: Une fois par session, votre musique transcende. Tous les alliés effacent 2 Stress et gagnent +2 à l\'Évasion pendant 3 rounds.'
    },
    {
      id: 'lore_keeper',
      name: 'Lore Keeper',
      spellcastTrait: 'Savoir',
      description: 'Le Gardien du Savoir maîtrise une vaste bibliothèque de sorts tirés des traditions.',
      foundation: [
        'Ancient Knowledge: Une fois par session, identifiez instantanément les capacités, faiblesses ou origines d\'un monstre ou artefact.',
        'Spellbook: Apprenez un sort supplémentaire de n\'importe quel domaine (pas nécessairement le vôtre).'
      ],
      specialization: 'Adapt and Counter: Après avoir observé un adversaire utiliser une capacité, gagnez avantage sur les jets pour y résister ou la contrer.',
      mastery: 'Master of Lore: Vous connaissez tous les sorts de votre domaine et pouvez en utiliser un gratuitement (sans coût de rappel) une fois par session courte.'
    }
  ],
  druid: [
    {
      id: 'shapechanger',
      name: 'Shapechanger',
      spellcastTrait: 'Instinct',
      description: 'Le Métamorphe maîtrise l\'art de la transformation, prenant des formes animales de plus en plus puissantes.',
      foundation: [
        'Wild Heart: Votre Beastform ne coûte pas de Stress — marquez 1 Espoir à la place.',
        'Extended Form: Restez en Beastform jusqu\'à 3 rounds supplémentaires par session sans marquer de Stress additionnel.'
      ],
      specialization: 'Greater Beast: Votre Beastform peut être d\'un tier supérieur au vôtre.',
      mastery: 'True Shapeshifter: Vous pouvez adopter la forme de n\'importe quelle créature de votre tier ou inférieur, y compris humanoïdes.'
    },
    {
      id: 'nature_guardian',
      name: 'Nature Guardian',
      spellcastTrait: 'Instinct',
      description: 'Le Gardien de la Nature contrôle les forces élémentaires et l\'environnement naturel.',
      foundation: [
        'Terrain Control: Dépensez 1 Espoir pour modifier le terrain à Portée Proche (créer des ronces, faire surgir des rochers, inonder une zone).',
        'Storm Call: Invoquez une tempête locale. Tous les adversaires à Portée Lointaine ont désavantage sur les jets de déplacement.'
      ],
      specialization: 'Elemental Form: En Beastform, gagnez une résistance à un type de dégâts (choisissez : feu, froid, foudre, acide).',
      mastery: 'Avatar of Nature: Une fois par session, fusionnez avec la nature. Pendant 3 rounds, contrôlez tous les éléments naturels à Portée Lointaine et immobilisez les adversaires sans jet.'
    }
  ],
  ranger: [
    {
      id: 'hunter',
      name: 'Hunter',
      spellcastTrait: 'Instinct',
      description: 'Le Chasseur traque sa proie avec une précision implacable et une connaissance approfondie des bêtes.',
      foundation: [
        'Favored Enemy: Choisissez un type de créature (morts-vivants, humanoïdes, bêtes, etc.). Gagnez +2 aux jets d\'attaque et de dégâts contre eux.',
        'Hunter\'s Mark: Dépensez 1 Espoir pour marquer une cible. Vous connaissez toujours sa position et avez avantage sur les jets de Pistage.'
      ],
      specialization: 'Deadly Hunter: Votre Favored Enemy gagne +1d6 dégâts supplémentaires.',
      mastery: 'Apex Predator: Contre votre Favored Enemy, vos attaques sont automatiquement des coups critiques si vous avez l\'avantage.'
    },
    {
      id: 'scout',
      name: 'Scout',
      spellcastTrait: null,
      description: 'L\'Éclaireur est un expert de la survie et du mouvement tactique.',
      foundation: [
        'Camouflage: Dans un environnement naturel, vous pouvez devenir Caché sans action si vous restez immobile.',
        'Pathfinder: Votre groupe ne peut jamais se perdre et effectue les Voyages deux fois plus vite.'
      ],
      specialization: 'Ghost Ranger: Vous pouvez maintenir l\'état Caché même après avoir attaqué si vous vous déplacez immédiatement.',
      mastery: 'Guerrilla Tactics: Une fois par round, effectuez un déplacement gratuit sans déclencher de réactions après avoir attaqué.'
    }
  ],
  wizard: [
    {
      id: 'archmage',
      name: 'Archmage',
      spellcastTrait: 'Savoir',
      description: 'L\'Archimage pousse la magie arcanique à ses limites absolues.',
      foundation: [
        'Spell Mastery: Choisissez un sort de votre domaine. Il ne coûte plus d\'Espoir à rappeler.',
        'Arcane Recovery: Une fois par session courte, récupérez 2 Espoir dépensés pour des sorts.'
      ],
      specialization: 'Empowered Spells: Vos sorts infligent +1d6 dégâts supplémentaires.',
      mastery: 'Arcane Supremacy: Une fois par session, lancez un sort sans coût (aucun Espoir, aucun Stress).'
    },
    {
      id: 'enchanter',
      name: 'Enchanter',
      spellcastTrait: 'Présence',
      description: 'L\'Enchanteur spécialise dans la magie mentale et la manipulation des esprits.',
      foundation: [
        'Charm: Faites un jet de Présence contre une cible humanoïde — en cas de succès, elle vous considère comme un ami pour 1 scène.',
        'Suggestion: Implantez une suggestion simple dans l\'esprit d\'une cible Charmée. Elle suit la suggestion si elle n\'est pas clairement contre ses intérêts.'
      ],
      specialization: 'Dominate: Prenez le contrôle total d\'une cible Charmée pendant 1 round. Elle agit selon vos ordres.',
      mastery: 'Mass Enchantment: Affectez jusqu\'à [Présence] cibles simultanément avec vos sorts d\'enchantement.'
    }
  ],
  // ═══ Classes personnalisées ═══
  assassin: [
    {
      id: 'enforcer',
      name: 'Enforcer',
      spellcastTrait: null,
      description: 'L\'Exécuteur élimine ses cibles avec efficacité brutale et sans laisser de témoins.',
      foundation: [
        'Execute: Quand votre Mark n\'a plus que la moitié de ses PV, vos attaques infligent +2d6 dégâts.',
        'Ruthless: Après avoir vaincu votre Mark, récupérez immédiatement 2 Espoir.'
      ],
      specialization: 'Coup de Grâce: Une fois par scène, effectuez une attaque automatiquement réussie contre une cible à Portée de Mêlée qui ne vous a pas encore vu ce round.',
      mastery: 'Death\'s Champion: Votre Mark cause toujours des dégâts maximaux à la première attaque réussie de chaque round.'
    },
    {
      id: 'infiltrator',
      name: 'Infiltrator',
      spellcastTrait: 'Finesse',
      description: 'L\'Infiltrateur est un maître de l\'espionnage et de la manipulation des informations.',
      foundation: [
        'Perfect Disguise: Passez 10 minutes à vous préparer pour adopter l\'identité de n\'importe quelle personne. Avantage sur les jets pour maintenir la tromperie.',
        'Network: Vous avez des contacts dans le monde criminel. Une fois par session, obtenez des informations ou de l\'aide via votre réseau.'
      ],
      specialization: 'Social Chameleon: Vous ne pouvez jamais être détecté comme intrus sauf par magie ou sur un échec critique.',
      mastery: 'Ghost Protocol: Pendant une scène entière, vous laissez zéro trace de votre présence — aucun souvenir, aucune preuve.'
    }
  ],
  duellist: [
    {
      id: 'swashbuckler',
      name: 'Swashbuckler',
      spellcastTrait: 'Présence',
      description: 'Le Bretteur surclasse ses rivaux dans les duels avec panache et bravade.',
      foundation: [
        'Roiling Braggart: Quand vous Fanfaronnez (Boast), vous pouvez donner une Peur au MJ pour augmenter le dé d\'avantage à d8.',
        'A Tale to Tell: Décrivez comme si vous racontiez l\'histoire plus tard — narrez comment vous rendez un Rival Vulnérable. Il reste Vulnérable jusqu\'à ce que quelqu\'un l\'attaque.'
      ],
      specialization: 'Deflective Dodge: Quand un adversaire vous attaque et qu\'un autre adversaire est à Portée de Mêlée, marquez un Stress pour rediriger l\'attaque vers cet adversaire.',
      mastery: 'A Worthy Opponent: Vous pouvez avoir un Rival Juré. Cette Rivalité ne compte pas dans votre limite et ne se termine pas en fin de scène. Deux fois par repos, tant que vous voyez votre Rival Juré, vous pouvez Fanfaronner pour 2 Espoir.'
    },
    {
      id: 'acrobat',
      name: 'Acrobat',
      spellcastTrait: 'Agilité',
      description: 'L\'Acrobate échappe facilement à ses poursuivants et utilise la mobilité comme arme.',
      foundation: [
        'Stunt Performer: Quand vous Fanfaronnez un jet d\'Agilité, ajoutez le résultat du dé d\'avantage à votre Espoir (d) plutôt qu\'à votre total.',
        'Evasive Leap: En réaction à une attaque, dépensez 1 Espoir pour vous déplacer hors de portée avant que l\'attaque soit résolue.'
      ],
      specialization: 'Impossible Escape: Vous pouvez vous déplacer à travers l\'espace occupé par des adversaires sans jet. Lors d\'un tel déplacement, gagnez +2 à l\'Évasion.',
      mastery: 'Untouchable: Tant que vous vous êtes déplacé ce round, vous avez +2 à l\'Évasion et les adversaires ont désavantage pour vous attaquer.'
    }
  ]
}

/**
 * Retourne les sous-classes d\'une classe donnée.
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
