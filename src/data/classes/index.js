/**
 * @module classes/data
 * @description Données SRD des 9 classes officielles Daggerheart.
 * Source : OfficialClasses_SRD.pdf, CharacterSheets_SRD.pdf
 */

/** 6 traits de personnage */
export const TRAITS = [
  { id: 'agility', label: 'Agilité', skills: ['Sprinter', 'Sauter', 'Manœuvrer'] },
  { id: 'strength', label: 'Force', skills: ['Soulever', 'Fracasser', 'Agripper'] },
  { id: 'finesse', label: 'Finesse', skills: ['Contrôler', 'Se cacher', 'Bricoler'] },
  { id: 'instinct', label: 'Instinct', skills: ['Percevoir', 'Sentir', 'Naviguer'] },
  { id: 'presence', label: 'Présence', skills: ['Charmer', 'Performer', 'Tromper'] },
  { id: 'knowledge', label: 'Savoir', skills: ['Se souvenir', 'Analyser', 'Comprendre'] }
]

/**
 * Conditions standard SRD.
 * Source : CoreMechanics_SRD.pdf — Conditions
 * Note : Daggerheart ne possède que 3 conditions standard.
 * Certaines features appliquent des conditions spéciales décrites dans leur texte.
 */
export const CONDITIONS = [
  { id: 'vulnerable', label: 'Vulnérable', description: 'Tous les jets ciblant cette créature ont avantage.' },
  { id: 'restrained', label: 'Entravé', description: 'Vous ne pouvez pas vous déplacer, mais vous pouvez toujours effectuer des actions depuis votre position actuelle.' },
  { id: 'hidden', label: 'Caché', description: 'Tant que vous êtes hors de vue de tous les ennemis et qu\'ils ne connaissent pas votre position, vous obtenez la condition Caché. Tous les jets contre une créature Cachée ont désavantage. Après qu\'un adversaire se déplace là où il vous verrait, que vous entrez dans sa ligne de vue, ou que vous attaquez, vous n\'êtes plus Caché.' }
]

/** Domaines Daggerheart */
export const DOMAINS = [
  'Arcana', 'Blade', 'Bone', 'Codex',
  'Grace', 'Midnight', 'Sage', 'Splendor', 'Valor'
]

/** Maximum de slots */
export const MAX_HP = 12
export const MAX_STRESS = 12
export const MAX_ARMOR = 12
export const MAX_HOPE = 6    // SRD : "A PC can have a maximum of 6 Hope at one time"
export const MAX_LOADOUT = 5  // SRD : max absolu 5 domain cards in loadout

/**
 * Calcule le nombre max de cartes dans le loadout selon le niveau et les bonus.
 *
 * Formule SRD :
 *  - Niveau 1 (création) : 2 cartes (fondation sous-classe + 1 carte domaine)
 *  - Chaque level-up : +1 carte automatique (étape 4)
 *  - Avancement « carte de domaine supplémentaire » : +1 par choix
 *  - Plafond absolu : 5
 *
 * @param {number} level - Niveau du personnage (1-10)
 * @param {number} [bonusDomainCards=0] - Nombre d'avancements « carte supplémentaire »
 * @returns {number} Nombre max de cartes dans le loadout
 */
export function getMaxLoadout(level, bonusDomainCards = 0) {
  const base = Math.max(1, level || 1) + 1  // 2 à niv. 1, 3 à niv. 2, etc.
  return Math.min(base + (bonusDomainCards || 0), MAX_LOADOUT)
}
export const MAX_CHARACTERS = 8

/**
 * Classes officielles SRD + personnalisées.
 * Chaque classe inclut ses stats de départ, domaines, features et suggestions.
 *
 * VAGUE 2 — Features migrées vers le format FeatureDescriptor :
 *  - hopeFeature : objet { name, description, tags }
 *  - classFeatures : tableau d'objets { name, description, tags }
 *  - Les champs hopeFeatureTags / classFeatureTags sont supprimés
 *    (tags intégrés directement dans chaque FeatureDescriptor)
 */
export const CLASSES = [
  {
    id: 'guardian',
    name: 'Guardian',
    emoji: '🛡️',
    domains: ['Valor', 'Blade'],
    baseEvasion: 9,
    baseHP: 7,
    baseStress: 6,
    hopeFeature: {
      name: 'Frontline Tank',
      description: 'Dépensez 3 Espoir pour libérer 2 Emplacements d\u2019armure.',
      tags: ['défensif'],
      activationType: 'action',
      cost: { type: 'hope', amount: 3 },
      frequency: 'atWill'
    },
    classFeatures: [
      {
        name: 'Unstoppable',
        description: 'Une fois par repos long, devenez Inarrêtable. Gagnez un Dé Inarrêtable (d4 au niv. 1, d6 au niv. 5). Après avoir infligé 1+ PV, augmentez la valeur du dé. Tant qu\u2019Inarrêtable : réduisez la gravité des dégâts physiques d\u2019un seuil, ajoutez la valeur du dé aux dégâts, vous ne pouvez pas être Entravé ou Vulnérable.',
        tags: ['offensif', 'défensif'],
        activationType: 'action',
        cost: { type: 'free', amount: 0 },
        frequency: 'oncePerLongRest'
      }
    ],
    suggestedTraits: { agility: 1, strength: 2, finesse: -1, instinct: 0, presence: 1, knowledge: 0 },
    suggestedArmor: 'Chainmail Armor — Seuils 7/15 — Score 4 — Heavy : -1 en Évasion',
    source: 'srd'
  },
  {
    id: 'seraph',
    name: 'Seraph',
    emoji: '✨',
    domains: ['Splendor', 'Valor'],
    baseEvasion: 9,
    baseHP: 7,
    baseStress: 6,
    hopeFeature: {
      name: 'Life Support',
      description: 'Dépensez 3 Espoir pour libérer un Point de vie sur un allié à Portée Proche.',
      tags: ['défensif'],
      activationType: 'action',
      cost: { type: 'hope', amount: 3 },
      range: 'close',
      frequency: 'atWill'
    },
    classFeatures: [
      {
        name: 'Prayer Dice',
        description: 'Au début de la session, lancez un nombre de d4 égal à votre trait de Sort. Dépensez-les pour : réduire les dégâts entrants, ajouter à un jet, ou gagner un Espoir égal au résultat. Videz-les en fin de session.',
        tags: ['défensif'],
        activationType: 'passive',
        cost: { type: 'free', amount: 0 },
        trait: 'spellcast',
        frequency: 'oncePerSession'
      }
    ],
    suggestedTraits: { agility: 0, strength: 2, finesse: 0, instinct: 1, presence: 1, knowledge: -1 },
    suggestedArmor: 'Chainmail Armor — Seuils 7/15 — Score 4 — Heavy : -1 en Évasion',
    source: 'srd'
  },
  {
    id: 'warrior',
    name: 'Warrior',
    emoji: '⚔️',
    domains: ['Blade', 'Bone'],
    baseEvasion: 11,
    baseHP: 6,
    baseStress: 6,
    hopeFeature: {
      name: 'No Mercy',
      description: 'Dépensez 3 Espoir pour gagner +1 aux jets d\u2019attaque jusqu\u2019au prochain repos.',
      tags: ['offensif'],
      activationType: 'action',
      cost: { type: 'hope', amount: 3 },
      frequency: 'atWill'
    },
    classFeatures: [
      {
        name: 'Attack of Opportunity',
        description: 'Quand un adversaire en Mêlée quitte la portée, jet de réaction. En cas de réussite, choisissez : l\u2019arrêter, infliger les dégâts de l\u2019arme principale, ou vous déplacer avec lui. Critique : choisissez deux.',
        tags: ['offensif', 'défensif'],
        activationType: 'reaction',
        cost: { type: 'free', amount: 0 },
        range: 'melee',
        frequency: 'atWill',
        trigger: 'Un adversaire en Mêlée quitte la portée'
      },
      {
        name: 'Combat Training',
        description: 'Ignorez le burden des armes. Ajoutez votre niveau aux jets de dégâts physiques.',
        tags: ['offensif'],
        activationType: 'passive',
        cost: { type: 'free', amount: 0 }
      }
    ],
    suggestedTraits: { agility: 2, strength: 1, finesse: 0, instinct: 1, presence: -1, knowledge: 0 },
    suggestedArmor: 'Chainmail Armor — Seuils 7/15 — Score 4 — Heavy : -1 en Évasion',
    source: 'srd'
  },
  {
    id: 'rogue',
    name: 'Rogue',
    emoji: '🗡️',
    domains: ['Midnight', 'Grace'],
    baseEvasion: 12,
    baseHP: 6,
    baseStress: 6,
    hopeFeature: {
      name: 'Rogue\u2019s Dodge',
      description: 'Dépensez 3 Espoir pour gagner +2 en Évasion jusqu\u2019à la prochaine attaque réussie contre vous ou votre prochain repos.',
      tags: ['offensif'],
      activationType: 'action',
      cost: { type: 'hope', amount: 3 },
      frequency: 'atWill'
    },
    classFeatures: [
      {
        name: 'Cloaked',
        description: 'Caché devient Dissimulé — restez invisible si vous êtes immobile quand un adversaire se déplace pour vous voir. Se termine après une attaque ou un déplacement en ligne de vue.',
        tags: ['utilitaire'],
        activationType: 'passive',
        cost: { type: 'free', amount: 0 }
      },
      {
        name: 'Sneak Attack',
        description: 'Quand vous attaquez en étant Dissimulé ou qu\u2019un allié est en Mêlée de la cible, ajoutez un nombre de d6 égal à votre tier aux dégâts.',
        tags: ['offensif'],
        activationType: 'passive',
        cost: { type: 'free', amount: 0 },
        range: 'melee'
      }
    ],
    suggestedTraits: { agility: 1, strength: -1, finesse: 2, instinct: 0, presence: 1, knowledge: 0 },
    suggestedArmor: 'Gambeson Armor — Seuils 5/11 — Score 3 — Flexible : +1 en Évasion',
    source: 'srd'
  },
  {
    id: 'bard',
    name: 'Bard',
    emoji: '🎵',
    domains: ['Grace', 'Codex'],
    baseEvasion: 10,
    baseHP: 5,
    baseStress: 6,
    hopeFeature: {
      name: 'Make a Scene',
      description: 'Dépensez 3 Espoir pour temporairement Distraire une cible à Portée Proche, imposant -2 à sa Difficulté.',
      tags: ['social', 'défensif'],
      activationType: 'action',
      cost: { type: 'hope', amount: 3 },
      range: 'close',
      frequency: 'atWill'
    },
    classFeatures: [
      {
        name: 'Rally',
        description: 'Une fois par session, donnez-vous et à chaque allié un Rally Die (d6 au niv. 1, d8 au niv. 5). Dépensez-le pour ajouter à un jet d\u2019action/réaction/dégâts ou libérer du Stress égal au résultat. Videz en fin de session.',
        tags: ['social', 'défensif'],
        activationType: 'action',
        cost: { type: 'free', amount: 0 },
        frequency: 'oncePerSession'
      }
    ],
    suggestedTraits: { agility: 0, strength: -1, finesse: 1, instinct: 0, presence: 2, knowledge: 1 },
    suggestedArmor: 'Gambeson Armor — Seuils 5/11 — Score 3 — Flexible : +1 en Évasion',
    source: 'srd'
  },
  {
    id: 'druid',
    name: 'Druid',
    emoji: '🌿',
    domains: ['Sage', 'Arcana'],
    baseEvasion: 10,
    baseHP: 6,
    baseStress: 6,
    hopeFeature: {
      name: 'Evolution',
      description: 'Dépensez 3 Espoir pour vous transformer en Beastform sans cocher de Stress. Choisissez un trait à augmenter de +1 jusqu\u2019à ce que vous quittiez la forme.',
      tags: ['utilitaire'],
      activationType: 'action',
      cost: { type: 'hope', amount: 3 },
      frequency: 'atWill'
    },
    classFeatures: [
      {
        name: 'Beastform',
        description: 'Cochez un Stress pour vous transformer en créature de votre tier ou inférieur. Gagnez les features de Beastform, ajoutez le bonus d\u2019Évasion, utilisez le trait spécifié pour les attaques. Vous ne pouvez pas utiliser d\u2019armes/sorts de cartes de domaine en étant transformé.',
        tags: ['offensif', 'défensif', 'utilitaire'],
        activationType: 'action',
        cost: { type: 'stress', amount: 1 },
        frequency: 'atWill'
      },
      {
        name: 'Wildtouch',
        description: 'Réalisez des effets naturels inoffensifs et subtils à volonté (faire pousser une fleur, souffle de vent, allumer un feu de camp).',
        tags: ['utilitaire'],
        activationType: 'action',
        cost: { type: 'free', amount: 0 },
        range: 'close',
        frequency: 'atWill'
      }
    ],
    suggestedTraits: { agility: 1, strength: 0, finesse: 1, instinct: 2, presence: -1, knowledge: 0 },
    suggestedArmor: 'Leather Armor — Seuils 6/13 — Score 3',
    source: 'srd'
  },
  {
    id: 'ranger',
    name: 'Ranger',
    emoji: '🏹',
    domains: ['Bone', 'Sage'],
    baseEvasion: 12,
    baseHP: 6,
    baseStress: 6,
    hopeFeature: {
      name: 'Hold Them Off',
      description: 'Dépensez 3 Espoir sur une attaque d\u2019arme réussie pour utiliser le même jet contre 2 adversaires supplémentaires à portée.',
      tags: ['offensif'],
      activationType: 'action',
      cost: { type: 'hope', amount: 3 },
      frequency: 'atWill'
    },
    classFeatures: [
      {
        name: 'Ranger\u2019s Focus',
        description: 'Dépensez un Espoir + attaquez une cible. En cas de réussite : dégâts normaux, la cible devient votre Focus. Contre le Focus : connaissez sa direction, il coche un Stress quand vous lui infligez des dégâts, vous pouvez mettre fin au Focus pour relancer une attaque ratée.',
        tags: ['offensif'],
        activationType: 'action',
        cost: { type: 'hope', amount: 1 },
        frequency: 'atWill'
      }
    ],
    suggestedTraits: { agility: 2, strength: 0, finesse: 1, instinct: 1, presence: -1, knowledge: 0 },
    suggestedArmor: 'Leather Armor — Seuils 6/13 — Score 3',
    source: 'srd'
  },
  {
    id: 'wizard',
    name: 'Wizard',
    emoji: '🔮',
    domains: ['Codex', 'Splendor'],
    baseEvasion: 11,
    baseHP: 5,
    baseStress: 6,
    hopeFeature: {
      name: 'Not This Time',
      description: 'Dépensez 3 Espoir pour forcer un adversaire à Portée Loin à relancer un jet d\u2019attaque ou de dégâts.',
      tags: ['défensif'],
      activationType: 'reaction',
      cost: { type: 'hope', amount: 3 },
      range: 'far',
      frequency: 'atWill',
      trigger: 'Un adversaire à Portée Loin fait un jet d\u2019attaque ou de dégâts'
    },
    classFeatures: [
      {
        name: 'Prestidigitation',
        description: 'Réalisez des effets magiques inoffensifs et subtils à volonté (changer une couleur, créer une odeur, allumer une bougie, faire léviter un petit objet, illuminer une pièce, réparer un petit objet).',
        tags: ['utilitaire'],
        activationType: 'action',
        cost: { type: 'free', amount: 0 },
        range: 'close',
        frequency: 'atWill'
      },
      {
        name: 'Strange Patterns',
        description: 'Choisissez un nombre de 1 à 12. Quand vous l\u2019obtenez sur un Dé de Dualité, gagnez un Espoir ou libérez un Stress. Changez lors d\u2019un repos long.',
        tags: ['utilitaire'],
        activationType: 'passive',
        cost: { type: 'free', amount: 0 }
      }
    ],
    suggestedTraits: { agility: -1, strength: 0, finesse: 0, instinct: 1, presence: 1, knowledge: 2 },
    suggestedArmor: 'Leather Armor — Seuils 6/13 — Score 3',
    source: 'srd'
  },
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    emoji: '⚡',
    domains: ['Arcana', 'Midnight'],
    baseEvasion: 10,
    baseHP: 6,
    baseStress: 6,
    hopeFeature: {
      name: 'Volatile Magic',
      description: 'Dépensez 3 Espoir pour relancer un nombre quelconque de vos dés de dégâts sur une attaque infligeant des dégâts magiques.',
      tags: ['offensif'],
      activationType: 'action',
      cost: { type: 'hope', amount: 3 },
      frequency: 'atWill'
    },
    classFeatures: [
      {
        name: 'Arcane Sense',
        description: 'Vous pouvez sentir la présence de personnes et d\u2019objets magiques à Portée Proche.',
        tags: ['utilitaire'],
        activationType: 'passive',
        cost: { type: 'free', amount: 0 },
        range: 'close'
      },
      {
        name: 'Minor Illusion',
        description: 'Faites un Spellcast Roll (10). En cas de réussite, créez une illusion visuelle mineure pas plus grande que vous à Portée Proche, convaincante pour quiconque à Portée Proche ou au-delà.',
        tags: ['social', 'utilitaire'],
        activationType: 'action',
        cost: { type: 'free', amount: 0 },
        trait: 'spellcast',
        range: 'close',
        frequency: 'atWill'
      },
      {
        name: 'Channel Raw Power',
        description: 'Une fois par repos long, placez une carte de domaine de votre équipement actif dans votre réserve. Gagnez un Espoir égal au niveau de la carte, ou améliorez un sort de dégâts avec un bonus égal au double du niveau de la carte.',
        tags: ['offensif', 'utilitaire'],
        activationType: 'action',
        cost: { type: 'free', amount: 0 },
        frequency: 'oncePerLongRest'
      }
    ],
    suggestedTraits: { agility: 0, strength: -1, finesse: 1, instinct: 2, presence: 1, knowledge: 0 },
    suggestedArmor: 'Gambeson Armor — Seuils 5/11 — Score 3 — Flexible : +1 en Évasion',
    source: 'srd'
  },
  // ═══ Classes personnalisées ═══
  {
    id: 'assassin',
    name: 'Assassin',
    emoji: '🗡️',
    domains: ['Midnight', 'Blade'],
    baseEvasion: 12,
    baseHP: 5,
    baseStress: 6,
    hopeFeature: {
      name: 'Grim Resolve',
      description: 'Dépensez 3 Espoir pour libérer 2 Stress.',
      tags: ['offensif'],
      activationType: 'action',
      cost: { type: 'hope', amount: 3 },
      frequency: 'atWill'
    },
    classFeatures: [
      {
        name: 'Marked for Death',
        description: 'Sur une attaque d\u2019arme réussie, cochez un Stress pour marquer la cible « Marked for Death ». Les attaques contre une cible Marquée gagnent +1d4 dégâts par tier. Une seule cible Marquée à la fois ; se termine à la défaite, au repos, ou si le MJ dépense une Peur égale à votre Maîtrise.',
        tags: ['offensif'],
        activationType: 'action',
        cost: { type: 'stress', amount: 1 },
        frequency: 'atWill'
      },
      {
        name: 'Get In & Get Out',
        description: 'Dépensez un Espoir pour demander au MJ un moyen rapide ou discret d\u2019entrer ou sortir d\u2019un bâtiment ou structure visible. Votre prochain jet exploitant cette info a l\u2019avantage.',
        tags: ['offensif', 'utilitaire'],
        activationType: 'action',
        cost: { type: 'hope', amount: 1 },
        frequency: 'atWill'
      }
    ],
    suggestedTraits: { agility: 2, strength: -1, finesse: 1, instinct: 0, presence: 0, knowledge: 1 },
    suggestedArmor: 'Leather Armor — Seuils 6/13 — Score 3',
    source: 'custom'
  },
  {
    id: 'duellist',
    name: 'Duellist',
    emoji: '🤺',
    domains: ['Bone', 'Grace'],
    baseEvasion: 11,
    baseHP: 6,
    baseStress: 6,
    hopeFeature: {
      name: 'Parkour',
      description: 'Dépensez 3 Espoir, puis travaillez avec le MJ pour créer un chemin pour vous déplacer rapidement dans la zone (lustre, échelle de bibliothèque, etc.). Gagnez l\u2019avantage sur les jets liés à ce chemin.',
      tags: ['offensif'],
      activationType: 'action',
      cost: { type: 'hope', amount: 3 },
      frequency: 'atWill'
    },
    classFeatures: [
      {
        name: 'Boast',
        description: 'Cochez un Stress pour gagner l\u2019avantage sur un jet d\u2019action. Si vous obtenez Espoir, gagnez un Espoir supplémentaire ; si vous obtenez Peur, le MJ gagne une Peur supplémentaire.',
        tags: ['offensif', 'utilitaire'],
        activationType: 'action',
        cost: { type: 'stress', amount: 1 },
        frequency: 'atWill'
      },
      {
        name: 'Flash of Rivalry',
        description: 'Dépensez un Espoir pour faire un jet de Présence contre un adversaire à Portée Loin — en cas de réussite, il devient votre Rival jusqu\u2019à la fin de la scène. Les Rivaux ont un désavantage quand ils ciblent des créatures autres que vous. Ajoutez un d6 aux dégâts infligés entre vous et un Rival. Vous pouvez avoir un nombre de Rivaux égal à votre tier.',
        tags: ['offensif', 'social'],
        activationType: 'action',
        cost: { type: 'hope', amount: 1 },
        trait: 'presence',
        range: 'far',
        frequency: 'atWill'
      }
    ],
    suggestedTraits: { agility: 1, strength: 0, finesse: 0, instinct: 1, presence: 2, knowledge: -1 },
    suggestedArmor: 'Leather Armor — Seuils 6/13 — Score 3',
    source: 'custom'
  }
]

/**
 * Classes officielles SRD uniquement (sans homebrew).
 * @type {Object[]}
 */
export const SRD_CLASSES = CLASSES.filter((c) => c.source === 'srd')

/**
 * Retourne une classe par ID.
 * @param {string} id
 * @returns {Object|null}
 */
export function getClassById(id) {
  return CLASSES.find((c) => c.id === id) || null
}

/**
 * Crée un personnage vierge avec les valeurs par défaut de la classe.
 * @param {string} classId
 * @returns {Object}
 */
export function createDefaultCharacter(classId) {
  const cls = getClassById(classId)
  if (!cls) return null

  return {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name: '',
    pronouns: '',
    heritage: '',
    classId: cls.id,
    className: cls.name,
    subclass: '',
    level: 1,
    proficiency: 1,

    // ── Sélections déroulantes (IDs) ──
    subclassId: '',
    ancestryId: '',
    communityId: '',
    armorId: '',
    primaryWeaponId: '',
    secondaryWeaponId: '',
    selectionsLocked: false,

    // ── Mixed Ancestry ──
    // Actif quand ancestryId === 'mixed-ancestry'
    mixedAncestryConfig: {
      ancestry1Id: '',          // Première ascendance parente
      ancestry2Id: '',          // Seconde ascendance parente
      ancestry1Feature: '',     // 'top' ou 'bottom' — feature choisie de l'ascendance 1
      ancestry2Feature: ''      // 'top' ou 'bottom' — feature choisie de l'ascendance 2
    },

    // Traits — préremplis avec suggestions
    traits: {
      agility: cls.suggestedTraits.agility,
      strength: cls.suggestedTraits.strength,
      finesse: cls.suggestedTraits.finesse,
      instinct: cls.suggestedTraits.instinct,
      presence: cls.suggestedTraits.presence,
      knowledge: cls.suggestedTraits.knowledge
    },

    // Combat
    evasion: cls.baseEvasion,
    evasionBonus: 0,
    armorName: '',
    armorBaseThresholds: { major: 0, severe: 0 },
    armorScore: 0,
    armorSlotsMarked: 0,

    // Santé
    maxHP: cls.baseHP,
    currentHP: 0, // slots marqués (0 = pleine santé)
    maxStress: cls.baseStress,
    currentStress: 0, // slots marqués

    // Hope
    hope: 0,

    // Expériences
    experiences: [
      { name: '', bonus: 0 },
      { name: '', bonus: 0 }
    ],

    // Armes
    primaryWeapon: { name: '', trait: '', range: '', damage: '', feature: '' },
    secondaryWeapon: { name: '', trait: '', range: '', damage: '', feature: '' },

    // Visibilité table de jeu
    hidden: false,

    // Inventaire
    inventory: [],
    gold: { handfuls: 0, bags: 0, chests: 0 },

    // Cartes de domaine
    domainCards: {
      loadout: [],  // max 5 cartes actives (card IDs)
      vault: []     // cartes en réserve (card IDs)
    },

    // Conditions actives
    conditions: [],

    // ── Effets de cartes de domaine ──
    activeEffects: {},          // { cardId: true/false } pour toggles et activables
    permanentCardEffects: [],   // Effets permanents appliqués (Vitality, Master of the Craft)

    // ── Level Up ──
    levelHistory: [],       // Historique complet des level ups
    markedTraits: [],       // Traits marqués (ne peuvent être réaugmentés avant clear)
    subclassProgression: 'foundation', // 'foundation' | 'specialization' | 'mastery'

    // Notes libres
    notes: '',

    // Métadonnées
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}
