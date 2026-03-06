/**
 * @module npcs/combatFeatureCatalogue
 * @description Catalogue de combat features pour PNJs.
 *
 * Phase 2 — Échantillon :
 *  - 23 features extraites des adversaires humanoïdes Tier 1
 *  - 12 cartes de domaine Blade/Valor converties (niveaux 1-4)
 *
 * Chaque feature suit le modèle CombatFeature défini dans combatConstants.js.
 * Les cartes de domaine convertissent Hope → Fear (pour ennemis)
 * et utilisent le système de cooldown (pour alliés).
 */

// Note : les allyCooldown sont pré-calculés via computeAllyCooldown()
// de combatConstants.js lors de la construction du catalogue.

// ═══════════════════════════════════════════════════════════
//  Features d'adversaires — Tier 1 Humanoïdes
// ═══════════════════════════════════════════════════════════

export const ADVERSARY_FEATURES = [
  // ── Courtier (Social) ──
  {
    id: 'adv-mockery',
    name: 'Mockery',
    description: 'Dites quelque chose de moqueur et forcez une cible à Portée Proche à faire un jet de Réaction de Présence. En cas d\'échec, la cible doit cocher 2 Stress et est Vulnérable jusqu\'à la fin de la scène.',
    source: 'adversary',
    sourceRef: 'courtier',
    activationType: 'action',
    tier: 1,
    tags: ['social', 'offensif'],
    themes: ['humanoid', 'socialIntrigue'],
    cost: { type: 'stress', amount: 1 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: 'close',
    conditions: { applies: ['vulnerable'] },
    trigger: null,
    trait: 'presence',
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'adv-scapegoat',
    name: 'Scapegoat',
    description: 'Ciblez un PJ. Convainquez une foule ou un individu éminent que la cible est la cause de leur conflit ou malheur actuel.',
    source: 'adversary',
    sourceRef: 'courtier',
    activationType: 'action',
    tier: 1,
    tags: ['social'],
    themes: ['humanoid', 'socialIntrigue'],
    cost: { type: 'fear', amount: 1 },
    frequency: 'atWill',
    allyCooldown: '2_spotlights',
    range: null,
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },

  // ── Archer Guard (Ranged) ──
  {
    id: 'adv-hobbling-shot',
    name: 'Hobbling Shot',
    description: 'Faites une attaque contre une cible à Portée Loin. En cas de réussite, infligez 1d12+3 dégâts physiques. Si la cible coche des PV, elle a un désavantage sur les jets d\'Agilité jusqu\'à ce qu\'elle libère au moins 1 PV.',
    source: 'adversary',
    sourceRef: 'archer-guard',
    activationType: 'action',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'stress', amount: 1 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: 'far',
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: '1d12+3',
    damageType: 'physical'
  },

  // ── Bladed Guard (Standard) ──
  {
    id: 'adv-shield-wall',
    name: 'Shield Wall',
    description: 'Une créature qui tente de se déplacer à Portée Très Proche doit réussir un jet d\'Agilité. Si d\'autres Gardes se tiennent en ligne, la Difficulté augmente du nombre total de gardes dans la ligne.',
    source: 'adversary',
    sourceRef: 'bladed-guard',
    activationType: 'passive',
    tier: 1,
    tags: ['défensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: null,
    allyCooldown: 'none',
    range: 'veryClose',
    conditions: null,
    trigger: null,
    trait: 'agility',
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'adv-detain',
    name: 'Detain',
    description: 'Faites une attaque contre une cible à Portée Très Proche. En cas de réussite, Entravez la cible jusqu\'à ce qu\'elle se libère avec une attaque réussie, un jet de Finesse ou un jet de Force.',
    source: 'adversary',
    sourceRef: 'bladed-guard',
    activationType: 'action',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'stress', amount: 1 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: 'veryClose',
    conditions: { applies: ['restrained'] },
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },

  // ── Head Guard (Leader) ──
  {
    id: 'adv-rally-guards',
    name: 'Rally Guards',
    description: 'Placez sous le projecteur jusqu\'à 2d4 alliés à Portée Loin.',
    source: 'adversary',
    sourceRef: 'head-guard',
    activationType: 'action',
    tier: 1,
    tags: ['utilitaire'],
    themes: ['humanoid'],
    cost: { type: 'fear', amount: 2 },
    frequency: 'atWill',
    allyCooldown: 'per_scene',
    range: 'far',
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'adv-on-my-signal',
    name: 'On My Signal',
    description: 'Compte à rebours (5). Quand le meneur est sous le projecteur pour la première fois, activez le compte à rebours. Il décompte quand un PJ fait un jet d\'attaque. Quand il se déclenche, tous les alliés tireurs à Portée Loin font une attaque standard avec avantage.',
    source: 'adversary',
    sourceRef: 'head-guard',
    activationType: 'reaction',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: 'far',
    conditions: null,
    trigger: 'Quand le meneur est sous le projecteur pour la première fois',
    trait: null,
    countdown: { value: 5, loop: false, current: 5 },
    damageFormula: null,
    damageType: null
  },
  {
    id: 'adv-momentum',
    name: 'Momentum',
    description: 'Quand cet adversaire réussit une attaque contre un PJ, vous gagnez une Peur.',
    source: 'adversary',
    sourceRef: 'head-guard',
    activationType: 'reaction',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: null,
    conditions: null,
    trigger: 'Quand cet adversaire réussit une attaque contre un PJ',
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },

  // ── Jagged Knife Bandit (Standard) ──
  {
    id: 'adv-climber',
    name: 'Climber',
    description: 'Grimpe aussi facilement qu\'il court.',
    source: 'adversary',
    sourceRef: 'jagged-knife-bandit',
    activationType: 'passive',
    tier: 1,
    tags: ['utilitaire'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: null,
    allyCooldown: 'none',
    range: null,
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'adv-from-above',
    name: 'From Above',
    description: 'Quand cet adversaire réussit une attaque standard depuis une position surélevée, il inflige 1d10+1 dégâts physiques au lieu de ses dégâts standard.',
    source: 'adversary',
    sourceRef: 'jagged-knife-bandit',
    activationType: 'passive',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: null,
    allyCooldown: 'none',
    range: null,
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: '1d10+1',
    damageType: 'physical'
  },

  // ── Jagged Knife Hexer (Support) ──
  {
    id: 'adv-curse',
    name: 'Curse',
    description: 'Choisissez une cible à Portée Loin et Maudissez-la temporairement. Tant que la cible est Maudite, vous pouvez cocher un Stress quand cette cible obtient Espoir pour transformer le jet en Peur.',
    source: 'adversary',
    sourceRef: 'jagged-knife-hexer',
    activationType: 'action',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: 'far',
    conditions: { applies: ['cursed'] },
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'adv-chaotic-flux',
    name: 'Chaotic Flux',
    description: 'Faites une attaque contre jusqu\'à trois cibles à Portée Très Proche. Cochez un Stress pour infliger 2d6+3 dégâts magiques aux cibles touchées.',
    source: 'adversary',
    sourceRef: 'jagged-knife-hexer',
    activationType: 'action',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'stress', amount: 1 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: 'veryClose',
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: '2d6+3',
    damageType: 'magic'
  },

  // ── Jagged Knife Kneebreaker (Bruiser) ──
  {
    id: 'adv-ive-got-em',
    name: 'I\'ve Got \'Em',
    description: 'Les créatures Entravées par cet adversaire subissent le double de dégâts des attaques des autres adversaires.',
    source: 'adversary',
    sourceRef: 'jagged-knife-kneebreaker',
    activationType: 'passive',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: null,
    allyCooldown: 'none',
    range: null,
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'adv-hold-them-down',
    name: 'Hold Them Down',
    description: 'Faites une attaque contre une cible à Portée de Mêlée. En cas de réussite, la cible ne subit pas de dégâts mais est Entravée et Vulnérable. La cible peut se libérer avec un jet de Force réussi, ou automatiquement si cet adversaire subit des dégâts Majeurs.',
    source: 'adversary',
    sourceRef: 'jagged-knife-kneebreaker',
    activationType: 'action',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: 'melee',
    conditions: { applies: ['restrained', 'vulnerable'] },
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },

  // ── Jagged Knife Lackey (Minion) ──
  {
    id: 'adv-minion-3',
    name: 'Minion (3)',
    description: 'Vaincu dès qu\'il subit des dégâts. Pour chaque tranche de 3 dégâts infligés, vainquez un Minion supplémentaire à portée.',
    source: 'adversary',
    sourceRef: 'jagged-knife-lackey',
    activationType: 'passive',
    tier: 1,
    tags: ['utilitaire'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: null,
    allyCooldown: 'none',
    range: null,
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'adv-group-attack',
    name: 'Group Attack',
    description: 'Choisissez une cible et placez sous le projecteur tous les Minions à Portée Proche. Ils se déplacent à Portée de Mêlée et font un jet d\'attaque partagé. En cas de réussite, infligent leurs dégâts chacun. Combinez les dégâts.',
    source: 'adversary',
    sourceRef: 'jagged-knife-lackey',
    activationType: 'action',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'fear', amount: 1 },
    frequency: 'atWill',
    allyCooldown: '2_spotlights',
    range: 'close',
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },

  // ── Jagged Knife Lieutenant (Leader) ──
  {
    id: 'adv-tactician',
    name: 'Tactician',
    description: 'Quand vous placez cet adversaire sous le projecteur, cochez un Stress pour aussi placer sous le projecteur deux alliés à Portée Proche.',
    source: 'adversary',
    sourceRef: 'jagged-knife-lieutenant',
    activationType: 'action',
    tier: 1,
    tags: ['utilitaire'],
    themes: ['humanoid'],
    cost: { type: 'stress', amount: 1 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: 'close',
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'adv-more-where-that-came-from',
    name: 'More Where That Came From',
    description: 'Invoquez trois Minions qui apparaissent à Portée Loin.',
    source: 'adversary',
    sourceRef: 'jagged-knife-lieutenant',
    activationType: 'action',
    tier: 1,
    tags: ['utilitaire'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: 'far',
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'adv-coup-de-grace',
    name: 'Coup de Grace',
    description: 'Faites une attaque contre une cible Vulnérable à Portée Proche. En cas de réussite, infligez 2d6+12 dégâts physiques et la cible doit cocher un Stress.',
    source: 'adversary',
    sourceRef: 'jagged-knife-lieutenant',
    activationType: 'action',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'fear', amount: 1 },
    frequency: 'atWill',
    allyCooldown: '2_spotlights',
    range: 'close',
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: '2d6+12',
    damageType: 'physical'
  },

  // ── Jagged Knife Shadow (Skulk) ──
  {
    id: 'adv-backstab',
    name: 'Backstab',
    description: 'Quand cet adversaire réussit une attaque standard avec avantage, il inflige 1d6+6 dégâts physiques au lieu de ses dégâts standard.',
    source: 'adversary',
    sourceRef: 'jagged-knife-shadow',
    activationType: 'passive',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: null,
    allyCooldown: 'none',
    range: null,
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: '1d6+6',
    damageType: 'physical'
  },
  {
    id: 'adv-cloaked',
    name: 'Cloaked',
    description: 'Devenez Caché jusqu\'après la prochaine attaque. Les attaques effectuées en étant Caché grâce à cette feature ont l\'avantage.',
    source: 'adversary',
    sourceRef: 'jagged-knife-shadow',
    activationType: 'action',
    tier: 1,
    tags: ['utilitaire'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: null,
    conditions: { applies: ['hidden'] },
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },

  // ── Jagged Knife Sniper (Ranged) ──
  {
    id: 'adv-unseen-strike',
    name: 'Unseen Strike',
    description: 'Si cet adversaire est Caché quand il réussit une attaque standard, il inflige 1d10+4 dégâts physiques au lieu de ses dégâts standard.',
    source: 'adversary',
    sourceRef: 'jagged-knife-sniper',
    activationType: 'passive',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: null,
    allyCooldown: 'none',
    range: null,
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: '1d10+4',
    damageType: 'physical'
  },

  // ── Pirate Raiders (Horde) ──
  {
    id: 'adv-horde',
    name: 'Horde',
    description: 'Quand la Horde a coché la moitié ou plus de ses PV, son attaque standard inflige des dégâts réduits à la place.',
    source: 'adversary',
    sourceRef: 'pirate-raiders',
    activationType: 'passive',
    tier: 1,
    tags: ['utilitaire'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: null,
    allyCooldown: 'none',
    range: null,
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  }
]

// ═══════════════════════════════════════════════════════════
//  Cartes de domaine converties — Blade & Valor (niv 1-4)
// ═══════════════════════════════════════════════════════════

export const DOMAIN_CARD_FEATURES = [
  // ── Blade ──
  {
    id: 'dc-get-back-up',
    name: 'Get Back Up',
    description: 'Quand vous subissez des dégâts Sévères, vous pouvez marquer un Stress pour réduire la sévérité d\'un palier.',
    source: 'domain_card',
    sourceRef: 'blade-get-back-up',
    activationType: 'reaction',
    tier: 1,
    tags: ['défensif'],
    themes: ['humanoid'],
    cost: { type: 'stress', amount: 1 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: null,
    conditions: null,
    trigger: 'Quand vous subissez des dégâts Sévères',
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'dc-not-good-enough',
    name: 'Not Good Enough',
    description: 'Quand vous lancez vos dés de dégâts, vous pouvez relancer tous les 1 et les 2.',
    source: 'domain_card',
    sourceRef: 'blade-not-good-enough',
    activationType: 'reaction',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: null,
    conditions: null,
    trigger: 'Quand vous lancez vos dés de dégâts',
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'dc-whirlwind',
    name: 'Whirlwind',
    description: 'Quand vous réussissez une attaque contre une cible à Portée Très Proche, étendez l\'attaque contre toutes les autres cibles à Portée Très Proche. Les cibles supplémentaires subissent la moitié des dégâts.',
    source: 'domain_card',
    sourceRef: 'blade-whirlwind',
    activationType: 'reaction',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'hope', amount: 1 },
    frequency: 'atWill',
    allyCooldown: '2_spotlights',
    range: 'veryClose',
    conditions: null,
    trigger: 'Quand vous réussissez une attaque contre une cible à Portée Très Proche',
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'dc-reckless',
    name: 'Reckless',
    description: 'Marquez un Stress pour obtenir un avantage sur une attaque.',
    source: 'domain_card',
    sourceRef: 'blade-reckless',
    activationType: 'action',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'stress', amount: 1 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: null,
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'dc-scramble',
    name: 'Scramble',
    description: 'Quand une créature à Portée de Mêlée vous infligerait des dégâts, vous pouvez esquiver l\'attaque et vous déplacer hors de Portée de Mêlée en sécurité.',
    source: 'domain_card',
    sourceRef: 'blade-scramble',
    activationType: 'reaction',
    tier: 1,
    tags: ['défensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: 'oncePerShortRest',
    allyCooldown: 'per_rest',
    range: 'melee',
    conditions: null,
    trigger: 'Quand une créature à Portée de Mêlée vous infligerait des dégâts',
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'dc-fortified-armor',
    name: 'Fortified Armor',
    description: 'Tant que vous portez une armure, gagnez un bonus de +2 à vos seuils de dégâts.',
    source: 'domain_card',
    sourceRef: 'blade-fortified-armor',
    activationType: 'passive',
    tier: 1,
    tags: ['défensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: null,
    allyCooldown: 'none',
    range: null,
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },

  // ── Valor ──
  {
    id: 'dc-forceful-push',
    name: 'Forceful Push',
    description: 'Faites une attaque avec votre arme principale contre une cible à Portée de Mêlée. Sur un succès, infligez vos dégâts d\'arme et repoussez la cible à Portée Proche.',
    source: 'domain_card',
    sourceRef: 'valor-forceful-push',
    activationType: 'action',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'hope', amount: 1 },
    frequency: 'atWill',
    allyCooldown: '2_spotlights',
    range: 'melee',
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: 'physical'
  },
  {
    id: 'dc-i-am-your-shield',
    name: 'I Am Your Shield',
    description: 'Quand un allié à Portée Très Proche subirait des dégâts, vous pouvez marquer un Stress pour vous interposer et subir les dégâts à sa place.',
    source: 'domain_card',
    sourceRef: 'valor-i-am-your-shield',
    activationType: 'reaction',
    tier: 1,
    tags: ['défensif'],
    themes: ['humanoid'],
    cost: { type: 'stress', amount: 1 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: 'veryClose',
    conditions: null,
    trigger: 'Quand un allié à Portée Très Proche subirait des dégâts',
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'dc-body-basher',
    name: 'Body Basher',
    description: 'Sur une attaque réussie avec une arme à Portée de Mêlée, vous pouvez rendre la cible temporairement Vulnérable.',
    source: 'domain_card',
    sourceRef: 'valor-body-basher',
    activationType: 'action',
    tier: 1,
    tags: ['offensif'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: 'melee',
    conditions: { applies: ['vulnerable'] },
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: 'physical'
  },
  {
    id: 'dc-critical-inspiration',
    name: 'Critical Inspiration',
    description: 'Quand vous obtenez un succès critique sur une attaque, tous les alliés à Portée Très Proche gagnent un Espoir et ont l\'avantage sur leur prochain jet.',
    source: 'domain_card',
    sourceRef: 'valor-critical-inspiration',
    activationType: 'reaction',
    tier: 1,
    tags: ['offensif', 'social'],
    themes: ['humanoid'],
    cost: { type: 'free', amount: 0 },
    frequency: 'oncePerShortRest',
    allyCooldown: 'per_rest',
    range: 'veryClose',
    conditions: null,
    trigger: 'Quand vous obtenez un succès critique sur une attaque',
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'dc-goad-them-on',
    name: 'Goad Them On',
    description: 'Décrivez comment vous provoquez une cible à Portée Proche, puis faites un jet de Présence contre elle. En cas de réussite, la cible doit cocher du Stress.',
    source: 'domain_card',
    sourceRef: 'valor-goad-them-on',
    activationType: 'action',
    tier: 2,
    tags: ['offensif', 'social'],
    themes: ['humanoid', 'socialIntrigue'],
    cost: { type: 'stress', amount: 1 },
    frequency: 'atWill',
    allyCooldown: 'none',
    range: 'close',
    conditions: null,
    trigger: null,
    trait: 'presence',
    countdown: null,
    damageFormula: null,
    damageType: null
  },
  {
    id: 'dc-support-tank',
    name: 'Support Tank',
    description: 'Quand un allié à Portée Proche échoue un jet, permettez-lui de relancer ses dés.',
    source: 'domain_card',
    sourceRef: 'valor-support-tank',
    activationType: 'action',
    tier: 2,
    tags: ['défensif'],
    themes: ['humanoid'],
    cost: { type: 'hope', amount: 2 },
    frequency: 'atWill',
    allyCooldown: 'per_scene',
    range: 'close',
    conditions: null,
    trigger: null,
    trait: null,
    countdown: null,
    damageFormula: null,
    damageType: null
  }
]

// ═══════════════════════════════════════════════════════════
//  Catalogue complet — API publique
// ═══════════════════════════════════════════════════════════

/** Toutes les combat features du catalogue */
export const ALL_COMBAT_FEATURES = [...ADVERSARY_FEATURES, ...DOMAIN_CARD_FEATURES]

/**
 * Recherche une feature par ID.
 * @param {string} id
 * @returns {object|null}
 */
export function getFeatureById(id) {
  return ALL_COMBAT_FEATURES.find(f => f.id === id) || null
}

/**
 * Filtre les features par critères multiples.
 * @param {object} filters
 * @param {string} [filters.source] - 'adversary' | 'domain_card' | 'homebrew'
 * @param {number} [filters.tier] - 1-4
 * @param {string} [filters.activationType] - 'action' | 'reaction' | 'passive'
 * @param {string[]} [filters.tags] - Au moins un tag doit matcher
 * @param {string[]} [filters.themes] - Au moins un thème doit matcher
 * @param {string} [filters.search] - Recherche textuelle (nom, description)
 * @returns {object[]}
 */
export function filterFeatures(filters = {}) {
  let result = [...ALL_COMBAT_FEATURES]

  if (filters.source) {
    result = result.filter(f => f.source === filters.source)
  }

  if (filters.tier) {
    result = result.filter(f => f.tier <= filters.tier)
  }

  if (filters.activationType) {
    result = result.filter(f => f.activationType === filters.activationType)
  }

  if (Array.isArray(filters.tags) && filters.tags.length > 0) {
    result = result.filter(f =>
      f.tags.some(t => filters.tags.includes(t))
    )
  }

  if (Array.isArray(filters.themes) && filters.themes.length > 0) {
    result = result.filter(f =>
      f.themes.some(t => filters.themes.includes(t))
    )
  }

  if (filters.search && typeof filters.search === 'string') {
    const q = filters.search.toLowerCase()
    result = result.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.description.toLowerCase().includes(q)
    )
  }

  return result
}

/**
 * Retourne les features groupées par type d'activation.
 * Utile pour l'UI de sélection.
 * @param {object[]} features
 * @returns {{ passives: object[], actions: object[], reactions: object[] }}
 */
export function groupByActivationType(features) {
  return {
    passives: features.filter(f => f.activationType === 'passive'),
    actions: features.filter(f => f.activationType === 'action'),
    reactions: features.filter(f => f.activationType === 'reaction')
  }
}
