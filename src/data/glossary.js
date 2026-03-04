/**
 * Lexique / Glossaire SRD Daggerheart.
 *
 * Chaque entrée contient :
 *  - id          : identifiant unique (snake_case)
 *  - en          : terme anglais tel qu'il apparaît dans les données SRD
 *  - fr          : traduction française affichée dans l'application
 *  - definition  : courte définition en français (tooltip)
 *  - category    : catégorie pour le regroupement et le style
 *  - aliases     : (optionnel) variantes de graphie anglaises à détecter
 *
 * Les catégories possibles :
 *  - meta        : méta-monnaies et concepts fondamentaux
 *  - trait       : caractéristiques du personnage
 *  - combat      : mécanique de combat (PV, Stress, Évasion…)
 *  - condition   : conditions standard et spéciales
 *  - range       : portées
 *  - damage      : types de dégâts
 *  - feature     : types de capacités (action, réaction, passif)
 *  - adversary   : types d'adversaires
 *  - rest        : repos et temps morts
 *  - domain      : domaines de cartes
 *  - roll        : types de jets de dés
 *  - resource    : ressources et emplacements
 *  - advancement : progression et montée de niveau
 */

export const GLOSSARY_CATEGORIES = {
  meta: { label: 'Méta', color: 'var(--color-accent-hope)' },
  trait: { label: 'Caractéristique', color: 'var(--color-accent-gold)' },
  combat: { label: 'Combat', color: 'var(--color-accent-fear)' },
  condition: { label: 'Condition', color: '#e57373' },
  range: { label: 'Portée', color: '#81c784' },
  damage: { label: 'Dégâts', color: '#ff8a65' },
  feature: { label: 'Capacité', color: '#ba68c8' },
  adversary: { label: 'Adversaire', color: '#7986cb' },
  rest: { label: 'Repos', color: '#4db6ac' },
  domain: { label: 'Domaine', color: '#aed581' },
  roll: { label: 'Jet', color: '#4fc3f7' },
  resource: { label: 'Ressource', color: '#fff176' },
  advancement: { label: 'Progression', color: '#f48fb1' }
}

export const GLOSSARY_ENTRIES = [
  // ── Méta ─────────────────────────────────────────────
  {
    id: 'hope',
    en: 'Hope',
    fr: 'Espoir',
    definition: 'Méta-monnaie du joueur. Max 6. Dépensée pour Aider un Allié, utiliser une Expérience, lancer un Tag Team, ou activer une Capacité d\'Espoir.',
    category: 'meta'
  },
  {
    id: 'fear',
    en: 'Fear',
    fr: 'Peur',
    definition: 'Méta-monnaie du MJ. Max 12. Gagnée quand un joueur lance avec Peur. Dépensée pour interrompre, activer des capacités d\'adversaire ou d\'environnement.',
    category: 'meta'
  },
  {
    id: 'spotlight',
    en: 'Spotlight',
    fr: 'Projecteur',
    definition: 'Indique quel personnage ou adversaire est au centre de l\'action. Pas d\'initiative fixe ; le projecteur se déplace naturellement.',
    category: 'meta'
  },

  // ── Caractéristiques ─────────────────────────────────
  {
    id: 'agility',
    en: 'Agility',
    fr: 'Agilité',
    definition: 'Caractéristique de vitesse, réflexes et déplacements.',
    category: 'trait'
  },
  {
    id: 'strength',
    en: 'Strength',
    fr: 'Force',
    definition: 'Caractéristique de puissance physique brute.',
    category: 'trait'
  },
  {
    id: 'finesse',
    en: 'Finesse',
    fr: 'Finesse',
    definition: 'Caractéristique de précision, dextérité et adresse.',
    category: 'trait'
  },
  {
    id: 'instinct',
    en: 'Instinct',
    fr: 'Instinct',
    definition: 'Caractéristique de perception, intuition et connexion à la nature.',
    category: 'trait'
  },
  {
    id: 'presence',
    en: 'Presence',
    fr: 'Présence',
    definition: 'Caractéristique de charisme, influence et persuasion.',
    category: 'trait'
  },
  {
    id: 'knowledge',
    en: 'Knowledge',
    fr: 'Savoir',
    definition: 'Caractéristique d\'érudition, de raisonnement et de mémoire.',
    category: 'trait'
  },

  // ── Combat ───────────────────────────────────────────
  {
    id: 'hit_points',
    en: 'Hit Points',
    fr: 'Points de Vie',
    aliases: ['HP', 'Hit Point'],
    definition: 'Points de vie du personnage. Quand le dernier PV est coché, le personnage tombe et doit effectuer un mouvement de mort.',
    category: 'combat'
  },
  {
    id: 'stress',
    en: 'Stress',
    fr: 'Stress',
    definition: 'Mesure de la tension mentale, physique et émotionnelle. 6 emplacements de base, max 12. Quand le dernier Stress est coché, le personnage devient Vulnérable.',
    category: 'combat'
  },
  {
    id: 'evasion',
    en: 'Evasion',
    fr: 'Évasion',
    definition: 'Capacité à esquiver les attaques. Détermine la Difficulté des jets contre le PJ. Base définie par la classe.',
    category: 'combat'
  },
  {
    id: 'armor_slots',
    en: 'Armor Slots',
    fr: 'Emplacements d\'Armure',
    aliases: ['Armor Slot', 'Armor Score'],
    definition: 'Emplacements d\'armure absorbant les dégâts. Cocher un emplacement réduit la sévérité d\'une attaque d\'un seuil.',
    category: 'combat'
  },
  {
    id: 'damage_thresholds',
    en: 'Damage Thresholds',
    fr: 'Seuils de Dégâts',
    aliases: ['Damage Threshold', 'Major threshold', 'Severe threshold', 'Major damage threshold', 'Severe damage threshold'],
    definition: 'Seuils Majeur et Sévère. Dégâts < Majeur = 1 PV, ≥ Majeur = 2 PV, ≥ Sévère = 3 PV.',
    category: 'combat'
  },
  {
    id: 'difficulty',
    en: 'Difficulty',
    fr: 'Difficulté',
    definition: 'Nombre cible qu\'un jet d\'action doit atteindre ou dépasser pour réussir.',
    category: 'combat'
  },
  {
    id: 'proficiency',
    en: 'Proficiency',
    fr: 'Maîtrise',
    definition: 'Multiplicateur du nombre de dés de dégâts d\'arme. Augmente avec la montée de niveau.',
    category: 'combat'
  },
  {
    id: 'critical_success',
    en: 'Critical Success',
    fr: 'Réussite Critique',
    aliases: ['Critical', 'Crit', 'critically succeed', 'critically succeeds'],
    definition: 'Obtenu quand les deux Dés de Dualité montrent le même résultat. Réussite automatique avec dégâts critiques.',
    category: 'combat'
  },
  {
    id: 'incoming_damage',
    en: 'incoming damage',
    fr: 'dégâts entrants',
    definition: 'Total des dégâts d\'une seule attaque ou source, avant réduction par les Emplacements d\'Armure.',
    category: 'combat'
  },
  {
    id: 'direct_damage',
    en: 'direct damage',
    fr: 'dégâts directs',
    definition: 'Dégâts qui ne peuvent pas être réduits en cochant des Emplacements d\'Armure.',
    category: 'combat'
  },
  {
    id: 'cover',
    en: 'cover',
    fr: 'couvert',
    definition: 'Obstruction partielle entre attaquant et cible. Les attaques à travers un couvert ont le désavantage.',
    category: 'combat'
  },

  // ── Conditions ───────────────────────────────────────
  {
    id: 'vulnerable',
    en: 'Vulnerable',
    fr: 'Vulnérable',
    definition: 'Condition : tous les jets ciblant la créature ont l\'avantage.',
    category: 'condition'
  },
  {
    id: 'restrained',
    en: 'Restrained',
    fr: 'Entravé',
    definition: 'Condition : le personnage ne peut pas se déplacer, mais peut encore agir depuis sa position.',
    category: 'condition'
  },
  {
    id: 'hidden',
    en: 'Hidden',
    fr: 'Caché',
    definition: 'Condition : hors de vue de tous les ennemis. Les jets contre une créature Cachée ont le désavantage.',
    category: 'condition'
  },
  {
    id: 'temporary',
    en: 'temporary',
    fr: 'temporaire',
    aliases: ['temporarily'],
    definition: 'Tag indiquant qu\'une condition peut être dissipée par un mouvement (jet d\'action réussi pour un PJ).',
    category: 'condition'
  },

  // ── Portées ──────────────────────────────────────────
  {
    id: 'melee',
    en: 'Melee',
    fr: 'Mêlée',
    definition: 'Portée de contact, quelques pieds. Assez proche pour toucher.',
    category: 'range'
  },
  {
    id: 'very_close',
    en: 'Very Close',
    fr: 'Très Proche',
    definition: 'Environ 1,5–3 m (5–10 pieds). Mouvement libre vers la Mêlée en situation de danger.',
    category: 'range'
  },
  {
    id: 'close',
    en: 'Close',
    fr: 'Proche',
    definition: 'Environ 3–10 m (10–30 pieds). Mouvement libre vers la Mêlée en situation de danger.',
    category: 'range'
  },
  {
    id: 'far',
    en: 'Far',
    fr: 'Loin',
    definition: 'Environ 10–30 m (30–100 pieds). Requiert un jet d\'Agilité pour rejoindre la Mêlée en danger.',
    category: 'range'
  },
  {
    id: 'very_far',
    en: 'Very Far',
    fr: 'Très Loin',
    definition: 'Environ 30–100 m (100–300 pieds). Requiert un jet d\'Agilité pour rejoindre la Mêlée en danger.',
    category: 'range'
  },
  {
    id: 'out_of_range',
    en: 'Out of Range',
    fr: 'Hors de Portée',
    definition: 'Au-delà de la portée Très Loin. Ne peut généralement pas être ciblé.',
    category: 'range'
  },

  // ── Types de dégâts ──────────────────────────────────
  {
    id: 'physical_damage',
    en: 'physical damage',
    fr: 'dégâts physiques',
    aliases: ['physical', 'phy'],
    definition: 'Dégâts physiques — infligés par les armes et attaques à mains nues par défaut.',
    category: 'damage'
  },
  {
    id: 'magic_damage',
    en: 'magic damage',
    fr: 'dégâts magiques',
    aliases: ['magic', 'mag'],
    definition: 'Dégâts magiques — infligés par les sorts par défaut.',
    category: 'damage'
  },
  {
    id: 'resistance',
    en: 'resistance',
    fr: 'résistance',
    aliases: ['resistant'],
    definition: 'Réduit de moitié les dégâts entrants du type concerné, avant les Emplacements d\'Armure.',
    category: 'damage'
  },
  {
    id: 'immunity',
    en: 'immunity',
    fr: 'immunité',
    aliases: ['immune'],
    definition: 'Ignore complètement les dégâts entrants du type concerné.',
    category: 'damage'
  },

  // ── Types de capacités ───────────────────────────────
  {
    id: 'action',
    en: 'Action',
    fr: 'Action',
    definition: 'Capacité nécessitant le projecteur pour être activée.',
    category: 'feature'
  },
  {
    id: 'reaction',
    en: 'Reaction',
    fr: 'Réaction',
    definition: 'Capacité se déclenchant automatiquement quand une condition spécifique est remplie. Ne nécessite pas le projecteur.',
    category: 'feature'
  },
  {
    id: 'passive',
    en: 'Passive',
    fr: 'Passif',
    definition: 'Capacité toujours active ou se déclenchant automatiquement selon les circonstances.',
    category: 'feature'
  },
  {
    id: 'hope_feature',
    en: 'Hope Feature',
    fr: 'Capacité d\'Espoir',
    definition: 'Capacité de classe puissante coûtant 3 Espoir à activer.',
    category: 'feature'
  },
  {
    id: 'class_feature',
    en: 'Class Feature',
    fr: 'Capacité de Classe',
    definition: 'Capacité principale définissant la classe, utilisable de manière consistante sans coût élevé en Espoir.',
    category: 'feature'
  },
  {
    id: 'fear_feature',
    en: 'Fear Feature',
    fr: 'Capacité de Peur',
    definition: 'Capacité d\'adversaire ou d\'environnement activée en dépensant de la Peur.',
    category: 'feature'
  },

  // ── Types d'adversaires ──────────────────────────────
  {
    id: 'minion',
    en: 'Minion',
    fr: 'Sbire',
    definition: 'Adversaire faible, vaincu en un seul coup réussi. Pas de seuils de dégâts.',
    category: 'adversary'
  },
  {
    id: 'standard',
    en: 'Standard',
    fr: 'Standard',
    definition: 'Adversaire classique avec des statistiques équilibrées.',
    category: 'adversary'
  },
  {
    id: 'leader',
    en: 'Leader',
    fr: 'Chef',
    definition: 'Adversaire qui renforce ses alliés et coordonne leurs actions.',
    category: 'adversary'
  },
  {
    id: 'solo',
    en: 'Solo',
    fr: 'Solo',
    definition: 'Adversaire puissant conçu pour affronter seul tout un groupe. Possède souvent Implacable.',
    category: 'adversary'
  },
  {
    id: 'horde',
    en: 'Horde',
    fr: 'Horde',
    definition: 'Adversaire représentant un grand groupe. Quand la moitié de ses PV sont cochés, ses dégâts sont réduits de moitié.',
    category: 'adversary'
  },
  {
    id: 'skulk',
    en: 'Skulk',
    fr: 'Rôdeur',
    definition: 'Adversaire furtif spécialisé dans les attaques sournoises et l\'évasion.',
    category: 'adversary'
  },
  {
    id: 'social',
    en: 'Social',
    fr: 'Social',
    definition: 'Adversaire axé sur la manipulation, la diplomatie ou les interactions sociales.',
    category: 'adversary'
  },
  {
    id: 'support',
    en: 'Support',
    fr: 'Soutien',
    definition: 'Adversaire qui renforce ses alliés, inflige des conditions ou impose des effets de statut.',
    category: 'adversary'
  },
  {
    id: 'bruiser',
    en: 'Bruiser',
    fr: 'Cogneur',
    definition: 'Adversaire infligeant de lourds dégâts au corps-à-corps.',
    category: 'adversary'
  },
  {
    id: 'ranged',
    en: 'Ranged',
    fr: 'Tireur',
    definition: 'Adversaire spécialisé dans les attaques à distance.',
    category: 'adversary'
  },

  // ── Repos ────────────────────────────────────────────
  {
    id: 'short_rest',
    en: 'Short Rest',
    fr: 'Repos Court',
    aliases: ['short rest'],
    definition: 'Environ 1 heure. 2 mouvements de repos : Soigner (1d4+Tier PV), Réduire Stress (1d4+Tier), Réparer Armure (1d4+Tier), Se Préparer.',
    category: 'rest'
  },
  {
    id: 'long_rest',
    en: 'Long Rest',
    fr: 'Repos Long',
    aliases: ['long rest'],
    definition: 'Plusieurs heures. 2 mouvements de repos : soigner tous PV, effacer tout Stress, réparer toute armure, Se Préparer, Travailler sur un Projet.',
    category: 'rest'
  },
  {
    id: 'downtime',
    en: 'Downtime',
    fr: 'Temps Mort',
    aliases: ['downtime move', 'downtime moves'],
    definition: 'Mouvements effectués durant un repos pour récupérer des ressources et approfondir les liens.',
    category: 'rest'
  },

  // ── Domaines ─────────────────────────────────────────
  {
    id: 'domain_arcana',
    en: 'Arcana',
    fr: 'Arcane',
    definition: 'Domaine de la magie pure et de la manipulation de la réalité.',
    category: 'domain'
  },
  {
    id: 'domain_blade',
    en: 'Blade',
    fr: 'Lame',
    definition: 'Domaine de la maîtrise des armes et du combat offensif.',
    category: 'domain'
  },
  {
    id: 'domain_bone',
    en: 'Bone',
    fr: 'Os',
    definition: 'Domaine de la nécromancie, la mort et la résilience corporelle.',
    category: 'domain'
  },
  {
    id: 'domain_codex',
    en: 'Codex',
    fr: 'Codex',
    definition: 'Domaine du savoir, des grimoires et des sorts utilitaires. Seul domaine avec des grimoires.',
    category: 'domain'
  },
  {
    id: 'domain_grace',
    en: 'Grace',
    fr: 'Grâce',
    definition: 'Domaine de la mobilité, de l\'esquive et de l\'agilité.',
    category: 'domain'
  },
  {
    id: 'domain_midnight',
    en: 'Midnight',
    fr: 'Minuit',
    definition: 'Domaine des ombres, de la furtivité et de la tromperie.',
    category: 'domain'
  },
  {
    id: 'domain_sage',
    en: 'Sage',
    fr: 'Sage',
    definition: 'Domaine de la nature, des éléments et de la divination.',
    category: 'domain'
  },
  {
    id: 'domain_splendor',
    en: 'Splendor',
    fr: 'Splendeur',
    definition: 'Domaine de la lumière, de la guérison et de l\'inspiration.',
    category: 'domain'
  },
  {
    id: 'domain_valor',
    en: 'Valor',
    fr: 'Valeur',
    definition: 'Domaine de la protection, du courage et de la défense des alliés.',
    category: 'domain'
  },

  // ── Jets de dés ──────────────────────────────────────
  {
    id: 'action_roll',
    en: 'action roll',
    fr: 'jet d\'action',
    aliases: ['Action Roll'],
    definition: 'Jet effectué avec les Dés de Dualité (2d12) + modificateur contre une Difficulté. Détermine réussite/échec et Espoir/Peur.',
    category: 'roll'
  },
  {
    id: 'reaction_roll',
    en: 'Reaction Roll',
    fr: 'Jet de Réaction',
    aliases: ['reaction roll'],
    definition: 'Jet effectué en réponse à un effet extérieur. Utilise les Dés de Dualité contre une Difficulté fixée.',
    category: 'roll'
  },
  {
    id: 'spellcast_roll',
    en: 'Spellcast Roll',
    fr: 'Jet de Sort',
    aliases: ['Spellcast roll', 'Spellcast Rolls', 'spellcast roll'],
    definition: 'Jet d\'action pour lancer un sort, utilisant le trait de sort de la sous-classe.',
    category: 'roll'
  },
  {
    id: 'damage_roll',
    en: 'damage roll',
    fr: 'jet de dégâts',
    aliases: ['Damage Roll', 'damage rolls'],
    definition: 'Jet effectué après une attaque réussie. Format : [Maîtrise]d[dé]+modificateur.',
    category: 'roll'
  },
  {
    id: 'duality_dice',
    en: 'Duality Dice',
    fr: 'Dés de Dualité',
    definition: 'Paire de d12 (un Dé d\'Espoir, un Dé de Peur) utilisée pour tous les jets d\'action et de réaction.',
    category: 'roll'
  },
  {
    id: 'hope_die',
    en: 'Hope Die',
    fr: 'Dé d\'Espoir',
    definition: 'Un des deux Dés de Dualité (d12). Quand il est supérieur au Dé de Peur, le résultat est « avec Espoir ».',
    category: 'roll'
  },
  {
    id: 'fear_die',
    en: 'Fear Die',
    fr: 'Dé de Peur',
    definition: 'Un des deux Dés de Dualité (d12). Quand il est supérieur au Dé d\'Espoir, le résultat est « avec Peur ».',
    category: 'roll'
  },
  {
    id: 'advantage',
    en: 'advantage',
    fr: 'avantage',
    definition: 'Lancez un d6 supplémentaire et ajoutez-le à votre total. S\'annule avec le désavantage.',
    category: 'roll'
  },
  {
    id: 'disadvantage',
    en: 'disadvantage',
    fr: 'désavantage',
    definition: 'Lancez un d6 supplémentaire et soustrayez-le de votre total. S\'annule avec l\'avantage.',
    category: 'roll'
  },

  // ── Ressources ───────────────────────────────────────
  {
    id: 'recall_cost',
    en: 'Recall Cost',
    fr: 'Coût de Rappel',
    definition: 'Nombre de Stress à cocher pour rappeler une carte de domaine depuis le coffre vers le chargement.',
    category: 'resource'
  },
  {
    id: 'loadout',
    en: 'loadout',
    fr: 'chargement',
    definition: 'Cartes de domaine actuellement équipées et disponibles pour utilisation.',
    category: 'resource'
  },
  {
    id: 'vault',
    en: 'vault',
    fr: 'coffre',
    definition: 'Réserve de cartes de domaine non équipées. Transférables vers le chargement durant un repos.',
    category: 'resource'
  },
  {
    id: 'experience',
    en: 'Experience',
    fr: 'Expérience',
    aliases: ['Experiences'],
    definition: 'Compétences narratives avec un modificateur (+1 à +6). Activées en dépensant un Espoir pour ajouter le bonus à un jet.',
    category: 'resource'
  },
  {
    id: 'spellcast_trait',
    en: 'Spellcast trait',
    fr: 'Trait de Sort',
    aliases: ['Spellcast'],
    definition: 'Caractéristique utilisée pour les Jets de Sort, définie par la sous-classe.',
    category: 'resource'
  },
  {
    id: 'gold',
    en: 'gold',
    fr: 'or',
    aliases: ['handful of gold', 'handfuls of gold', 'bag of gold', 'bags of gold', 'chest of gold', 'chests of gold'],
    definition: 'Monnaie mesurée en Poignées, Sacs et Coffres.',
    category: 'resource'
  },

  // ── Progression ──────────────────────────────────────
  {
    id: 'tier',
    en: 'Tier',
    fr: 'Palier',
    aliases: ['tier'],
    definition: 'Palier de puissance : Palier 1 (niv 1), Palier 2 (niv 2–4), Palier 3 (niv 5–7), Palier 4 (niv 8–10).',
    category: 'advancement'
  },
  {
    id: 'level_up',
    en: 'Level Up',
    fr: 'Montée de Niveau',
    aliases: ['level up', 'leveling up', 'levels up'],
    definition: 'Progression décidée par le MJ lors de jalons narratifs. Augmente seuils, avancées et accès aux cartes.',
    category: 'advancement'
  },
  {
    id: 'advancement',
    en: 'Advancement',
    fr: 'Avancée',
    aliases: ['advancements'],
    definition: 'Options choisies lors de la montée de niveau : +1 trait, +1 PV, +1 Stress, +1 Évasion, carte de domaine, etc.',
    category: 'advancement'
  },
  {
    id: 'multiclass',
    en: 'Multiclass',
    fr: 'Multi-classe',
    aliases: ['multiclassing', 'multiclassed'],
    definition: 'À partir du niveau 5, possibilité de choisir une classe supplémentaire avec accès à un de ses domaines.',
    category: 'advancement'
  },
  {
    id: 'scar',
    en: 'Scar',
    fr: 'Cicatrice',
    aliases: ['scars'],
    definition: 'Quand un PJ tombe inconscient et que son Dé d\'Espoir ≤ niveau, il gagne une cicatrice : un emplacement d\'Espoir est définitivement rayé.',
    category: 'advancement'
  },

  // ── Mouvements et mécaniques spéciales ───────────────
  {
    id: 'help_an_ally',
    en: 'Help an Ally',
    fr: 'Aider un Allié',
    definition: 'Dépenser 1 Espoir pour lancer un dé d\'avantage qu\'un allié ajoute à son jet d\'action.',
    category: 'meta'
  },
  {
    id: 'tag_team',
    en: 'Tag Team',
    fr: 'Tag Team',
    aliases: ['Tag Team Roll', 'Tag Team roll'],
    definition: 'Dépenser 3 Espoir pour combiner l\'action de deux PJ. Les deux lancent un jet et choisissent le meilleur résultat. Max 1 initiation par session par PJ.',
    category: 'meta'
  },
  {
    id: 'death_move',
    en: 'death move',
    fr: 'mouvement de mort',
    definition: 'Quand un PJ coche son dernier PV : choisir Baroud d\'Honneur, Éviter la Mort, ou Tout Risquer.',
    category: 'meta'
  },
  {
    id: 'blaze_of_glory',
    en: 'Blaze of Glory',
    fr: 'Baroud d\'Honneur',
    definition: 'Mouvement de mort : une dernière action automatiquement réussie de manière critique, puis le personnage meurt.',
    category: 'meta'
  },
  {
    id: 'mark_stress',
    en: 'mark a Stress',
    fr: 'cocher un Stress',
    aliases: ['mark Stress', 'mark a stress', 'marks a Stress', 'mark 2 Stress', 'mark 3 Stress'],
    definition: 'Cocher un emplacement de Stress comme coût ou conséquence.',
    category: 'combat'
  },
  {
    id: 'spend_a_hope',
    en: 'spend a Hope',
    fr: 'dépenser un Espoir',
    aliases: ['spend Hope', 'spend 2 Hope', 'spend 3 Hope', 'spend 5 Hope', 'spends a Hope'],
    definition: 'Dépenser un ou plusieurs Espoir pour activer un effet.',
    category: 'meta'
  },
  {
    id: 'spend_a_fear',
    en: 'spend a Fear',
    fr: 'dépenser une Peur',
    aliases: ['spend Fear', 'spend 2 Fear', 'spends a Fear'],
    definition: 'Le MJ dépense une ou plusieurs Peur pour activer un mouvement ou une capacité de Peur.',
    category: 'meta'
  },
  {
    id: 'once_per_rest',
    en: 'once per rest',
    fr: 'une fois par repos',
    aliases: ['Once per rest'],
    definition: 'Limite d\'utilisation : se recharge à la fin d\'un repos (court ou long).',
    category: 'resource'
  },
  {
    id: 'once_per_long_rest',
    en: 'once per long rest',
    fr: 'une fois par repos long',
    aliases: ['Once per long rest'],
    definition: 'Limite d\'utilisation : se recharge uniquement à la fin d\'un repos long.',
    category: 'resource'
  },
  {
    id: 'once_per_session',
    en: 'once per session',
    fr: 'une fois par session',
    aliases: ['Once per session'],
    definition: 'Limite d\'utilisation : une seule fois par session de jeu.',
    category: 'resource'
  },

  // ── Types de cartes de domaine ───────────────────────
  {
    id: 'ability',
    en: 'Ability',
    fr: 'Aptitude',
    definition: 'Type de carte de domaine : capacité non-magique.',
    category: 'domain'
  },
  {
    id: 'spell',
    en: 'Spell',
    fr: 'Sort',
    aliases: ['Spells'],
    definition: 'Type de carte de domaine : capacité magique utilisant un Jet de Sort.',
    category: 'domain'
  },
  {
    id: 'grimoire',
    en: 'Grimoire',
    fr: 'Grimoire',
    aliases: ['grimoires'],
    definition: 'Type de carte de domaine rare listant 2 ou 3 sorts. Exclusif au domaine Codex dans le SRD officiel.',
    category: 'domain'
  },

  // ── Résultats de jets ────────────────────────────────
  {
    id: 'success_with_hope',
    en: 'Success with Hope',
    fr: 'Réussite avec Espoir',
    aliases: ['success with Hope'],
    definition: 'Total ≥ Difficulté ET Dé d\'Espoir > Dé de Peur. Réussite + le joueur gagne un Espoir.',
    category: 'roll'
  },
  {
    id: 'success_with_fear',
    en: 'Success with Fear',
    fr: 'Réussite avec Peur',
    aliases: ['success with Fear'],
    definition: 'Total ≥ Difficulté ET Dé de Peur > Dé d\'Espoir. Réussite avec coût/complication + le MJ gagne une Peur.',
    category: 'roll'
  },
  {
    id: 'failure_with_hope',
    en: 'Failure with Hope',
    fr: 'Échec avec Espoir',
    aliases: ['failure with Hope'],
    definition: 'Total < Difficulté ET Dé d\'Espoir > Dé de Peur. Échec + conséquence mineure + le joueur gagne un Espoir.',
    category: 'roll'
  },
  {
    id: 'failure_with_fear',
    en: 'Failure with Fear',
    fr: 'Échec avec Peur',
    aliases: ['failure with Fear'],
    definition: 'Total < Difficulté ET Dé de Peur > Dé d\'Espoir. Échec + conséquence majeure + le MJ gagne une Peur.',
    category: 'roll'
  },

  // ── Passifs adversaires communs ──────────────────────
  {
    id: 'relentless',
    en: 'Relentless',
    fr: 'Implacable',
    definition: 'Passif adversaire : peut recevoir le projecteur X fois par tour de MJ. Coûte de la Peur comme d\'habitude.',
    category: 'adversary'
  },
  {
    id: 'slow',
    en: 'Slow',
    fr: 'Lent',
    definition: 'Passif adversaire : nécessite deux projecteurs pour agir (placement d\'un jeton au premier).',
    category: 'adversary'
  },

  // ── Countdown ────────────────────────────────────────
  {
    id: 'countdown',
    en: 'Countdown',
    fr: 'Compte à Rebours',
    aliases: ['countdown', 'Progress Countdown'],
    definition: 'Horloge de progression ou de tension. Avance selon des déclencheurs spécifiques. Quand il se déclenche, un événement se produit.',
    category: 'meta'
  }
]

/**
 * Index de recherche rapide — créé une seule fois au chargement.
 * Mappe chaque terme (en minuscules) vers son entrée.
 * Inclut le terme principal et tous les aliases.
 */
export function buildGlossaryIndex(entries = GLOSSARY_ENTRIES) {
  const index = new Map()
  for (const entry of entries) {
    index.set(entry.en.toLowerCase(), entry)
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        index.set(alias.toLowerCase(), entry)
      }
    }
  }
  return index
}
