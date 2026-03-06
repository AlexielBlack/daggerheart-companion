#!/usr/bin/env node
/**
 * Auto-tagging des genres pour tous les adversaires tier{1-4}.json.
 *
 * 1. Lit les fichiers tier existants
 * 2. Assigne un tableau `genres` par correspondance de mots-clés
 *    sur name + description + source
 * 3. Insère le champ `genres` après `type`
 * 4. Écrit les fichiers mis à jour
 *
 * Usage:
 *   node scripts/tag-genres.mjs              # écriture effective
 *   node scripts/tag-genres.mjs --dry-run    # aperçu sans écriture
 *   node scripts/tag-genres.mjs --report     # tableau markdown détaillé
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const advDir = resolve(rootDir, 'src/data/adversaries')

const dryRun = process.argv.includes('--dry-run')
const report = process.argv.includes('--report')

// ── Genres valides ──────────────────────────────────────────────────────────

const VALID_GENRES = [
  'aberration', 'bete', 'construction', 'demon', 'dragon',
  'elementaire', 'fee', 'geant', 'humanoide', 'monstruosite',
  'mort-vivant', 'plante'
]

// ── Règles de correspondance par mots-clés ──────────────────────────────────

const GENRE_RULES = [
  {
    genre: 'mort-vivant',
    keywords: ['undead', 'zombie', 'skeleton', 'skeletal', 'ghoul', 'ghost', 'specter', 'spectre',
      'wraith', 'lich', 'vampire', 'necro', 'revenant', 'wight', 'banshee', 'phantom',
      'corpse', 'cadaver', 'risen', 'soul', 'spirit', 'haunt', 'shade', 'dullahan',
      'dearg due', 'abhartach', 'restless dead', 'tortured soul', 'barrow', 'carrion',
      'bone', 'crypt', 'grave', 'tomb', 'mummy', 'baykok']
  },
  {
    genre: 'demon',
    keywords: ['demon', 'devil', 'fiend', 'infernal', 'abyssal', 'hellish', 'demonic',
      'imp', 'succub', 'incub', 'pit fiend', 'balor', 'hell']
  },
  {
    genre: 'dragon',
    keywords: ['dragon', 'drake', 'wyvern', 'wyrm', 'draco', 'draconic', 'thorn dragon',
      'serpent', 'gaasyendietha', 'uktena']
  },
  {
    genre: 'fee',
    keywords: ['fey', 'fairy', 'faerie', 'sprite', 'pixie', 'nymph', 'dryad', 'sidhe',
      'seelie', 'unseelie', 'satyr', 'hag', 'leprechaun', 'puca', 'púca', 'spriggan',
      'redcap', 'selkie', 'kelpie', 'clurichaun', 'baobhan', 'cù sìth', 'cu sith',
      'aos sí', 'aos si', 'tylwyth', 'cŵn annwn', 'sluagh', 'shellycoat',
      'fear gorta', 'each-uisge', 'gwyllgi', 'nuckelavee', 'buggane',
      'cailleach', 'morrígan', 'morrigan', 'gwyn ap nudd', 'fomorian',
      'black annis', 'barghest', 'laughing lasher']
  },
  {
    genre: 'construction',
    keywords: ['animated', 'golem', 'construct', 'clockwork', 'automaton', 'sentinel',
      'homunculus', 'mechanical', 'statue', 'armor', 'armure']
  },
  {
    genre: 'elementaire',
    keywords: ['elemental', 'aether', 'magma', 'pyre', 'ember', 'flame',
      'frost', 'blizzard', 'storm spirit', 'lightning', 'thunderbird',
      'lava', 'inferno', 'ashen', 'pyrothurge', 'igni']
  },
  {
    genre: 'aberration',
    keywords: ['otherworld', 'void', 'eldritch', 'tentacle', 'mind',
      'psionic', 'abomination', 'ooze', 'slime', 'jelly', 'amorphous',
      'aberr', 'eye', 'interloper', 'xeralyth', 'mishipeshu']
  },
  {
    genre: 'plante',
    keywords: ['plant', 'vine', 'tree', 'fungus', 'fungi', 'mushroom', 'moss',
      'bloom', 'spore', 'root', 'floral', 'alraune', 'treant', 'blight',
      'bramble', 'thorn', 'weed', 'seed']
  },
  {
    genre: 'geant',
    keywords: ['giant', 'ogre', 'troll', 'titan', 'coloss', 'towering',
      'cyclops', 'fomorian', 'géant', 'stonecoat', 'flying head']
  },
  {
    genre: 'bete',
    keywords: ['wolf', 'bear', 'boar', 'stag', 'hawk', 'eagle', 'snake', 'spider',
      'insect', 'beast', 'animal', 'raptor', 'shark', 'gator', 'crocodile',
      'lion', 'tiger', 'bat', 'rat', 'swarm', 'wasp', 'beetle', 'scorpion',
      'crab', 'ape', 'horse', 'pegasus', 'dinosaur', 'rex', 'velociraptor',
      'burrower', 'hound', 'dog', 'cat', 'owl', 'raven', 'crow', 'vulture',
      'worm', 'fish', 'octopus', 'squid', 'deer', 'fawn', 'elk', 'moose',
      'mammoth', 'rhino', 'hippo', 'gorilla', 'panther', 'jaguar',
      'buzzard', 'amphisbaena', 'megalodon', 'veloraptid', 'aithon',
      'ignocerous', 'amarok', 'wampus cat', 'adlet', 'pamola',
      'tla\'nuwa', 'ishkitini', 'pukwudgie', 'mannegishi', 'kushtaka',
      'windigo', 'wendigo', 'nalusa']
  },
  {
    genre: 'monstruosite',
    keywords: ['chimera', 'hydra', 'basilisk', 'cockatrice', 'manticore',
      'mimic', 'minotaur', 'medusa', 'harpy', 'griffon', 'griffin',
      'sphinx', 'gargoyle', 'gorgon', 'kraken', 'cerberus', 'behemoth',
      'leviathan', 'bukwus', 'deer woman']
  },
  {
    genre: 'humanoide',
    keywords: ['guard', 'soldier', 'knight', 'mage', 'priest', 'assassin',
      'archer', 'thief', 'bandit', 'warrior', 'captain', 'lord', 'wizard',
      'sorcerer', 'druid', 'cleric', 'mercenary', 'brigand', 'pirate',
      'cultist', 'shaman', 'scout', 'spy', 'apprentice', 'commander',
      'general', 'warlord', 'rogue', 'healer', 'bard', 'noble',
      'merchant', 'thug', 'raider', 'chief', 'chieftain', 'warden',
      'ranger', 'hunter', 'witch', 'warlock', 'monk', 'paladin',
      'berserker', 'gladiator', 'duelist', 'corsair', 'marauder',
      'enchanter', 'illusionist', 'conjurer', 'acolyte', 'zealot',
      'inquisitor', 'executioner', 'jailer', 'smuggler', 'charlatan',
      'lady of the red death', 'keeper', 'covenant']
  }
]

// ── Helpers ─────────────────────────────────────────────────────────────────

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

/**
 * Insère le champ `genres` juste après le champ `type` dans l'objet adversaire.
 * Préserve l'ordre de toutes les autres clés.
 */
function insertGenres(adv, genres) {
  const result = {}
  let inserted = false
  for (const [key, value] of Object.entries(adv)) {
    // Sauter un ancien champ genres s'il existe déjà
    if (key === 'genres') continue
    result[key] = value
    if (key === 'type') {
      result.genres = genres
      inserted = true
    }
  }
  // Si `type` n'a pas été trouvé (ne devrait pas arriver), ajouter à la fin
  if (!inserted) result.genres = genres
  return result
}

/**
 * Détermine les genres d'un adversaire par correspondance de mots-clés
 * sur name + description, puis ajustement par source.
 */
function assignGenres(adv) {
  const nameLower = adv.name.toLowerCase()
  const descLower = (adv.description || '').toLowerCase()
  const text = nameLower + ' ' + descLower
  const sourceLower = (adv.source || '').toLowerCase()

  const matched = []
  /** Mots-clés ayant déclenché chaque genre — pour le rapport */
  const matchedKeywords = []

  for (const rule of GENRE_RULES) {
    const hits = rule.keywords.filter(kw => text.includes(kw))
    if (hits.length > 0) {
      // ── Exceptions pour mots-clés ambigus ──
      // 'thorn' dans un nom comme "Thorn Dragon" ne doit pas ajouter 'plante'
      if (rule.genre === 'plante') {
        const isActuallyDragon = nameLower.includes('dragon') || nameLower.includes('drake')
        if (isActuallyDragon && hits.length === 1 && (hits[0] === 'thorn' || hits[0] === 'seed')) {
          continue
        }
      }

      matched.push(rule.genre)
      matchedKeywords.push(...hits)
    }
  }

  // ── Règle source : celtic / morrgans → ajouter 'fee' ──
  if (sourceLower.includes('celtic') || sourceLower.includes('morrgans')) {
    if (!matched.includes('fee')) {
      matched.push('fee')
      matchedKeywords.push('(source:celtic)')
    }
  }

  // ── Fallback : aucun genre trouvé → monstruosite ──
  if (matched.length === 0) {
    matched.push('monstruosite')
    matchedKeywords.push('(fallback)')
  }

  // Déduplication et tri alphabétique
  const genres = [...new Set(matched)].sort()
  const keywords = [...new Set(matchedKeywords)].sort()

  return { genres, keywords }
}

// ── Lecture des adversaires ─────────────────────────────────────────────────

console.log('📖 Lecture des adversaires...')

const tierPaths = {}
const tierData = {}

for (const t of [1, 2, 3, 4]) {
  const p = resolve(advDir, `tier${t}.json`)
  tierPaths[t] = p
  tierData[t] = readJson(p)
  console.log(`   Tier ${t}: ${tierData[t].length} adversaires`)
}

// ── Assignation des genres ──────────────────────────────────────────────────

console.log('\n🏷️  Assignation des genres...')

/** Collecte des résultats pour le résumé et le rapport */
const genreCounts = {}
for (const g of VALID_GENRES) genreCounts[g] = 0

let totalTags = 0
let multiGenre = 0
const reportRows = []

for (const t of [1, 2, 3, 4]) {
  tierData[t] = tierData[t].map(adv => {
    const { genres, keywords } = assignGenres(adv)

    // Statistiques
    for (const g of genres) {
      genreCounts[g] = (genreCounts[g] || 0) + 1
    }
    totalTags += genres.length
    if (genres.length > 1) multiGenre++

    // Ligne de log
    console.log(`   T${t} ${adv.name} → ${genres.join(', ')}`)

    // Ligne de rapport
    if (report) {
      reportRows.push({
        tier: t,
        name: adv.name,
        genres: genres.join(', '),
        keywords: keywords.join(', ')
      })
    }

    return insertGenres(adv, genres)
  })
}

// ── Résumé des statistiques ─────────────────────────────────────────────────

const totalAdversaries = Object.values(tierData).reduce((s, arr) => s + arr.length, 0)

console.log('\n📊 Résumé')
console.log('══════════════════════════════')

// Tri par compte décroissant pour la lisibilité
const sortedGenres = Object.entries(genreCounts)
  .sort((a, b) => b[1] - a[1])

for (const [genre, count] of sortedGenres) {
  const label = (genre + ':').padEnd(16)
  console.log(`   ${label} ${count}`)
}

console.log(`   ${'─'.repeat(26)}`)
console.log(`   TOTAL tags:    ${totalTags} (${totalAdversaries} adversaires)`)
console.log(`   Multi-genre:   ${multiGenre}`)

// ── Rapport markdown (--report) ─────────────────────────────────────────────

if (report) {
  console.log('\n📋 Rapport détaillé')
  console.log('══════════════════════════════')
  console.log('| Tier | Nom | Genres | Mots-clés |')
  console.log('|------|-----|--------|-----------|')
  for (const row of reportRows) {
    console.log(`| ${row.tier} | ${row.name} | ${row.genres} | ${row.keywords} |`)
  }
}

// ── Écriture des fichiers ───────────────────────────────────────────────────

if (dryRun || report) {
  console.log('\n🏷️  Mode dry-run — pas d\'écriture')
} else {
  console.log('\n✍️  Écriture des fichiers tier...')

  for (const t of [1, 2, 3, 4]) {
    writeJson(tierPaths[t], tierData[t])
    console.log(`   Tier ${t}: ${tierData[t].length} adversaires écrits ✅`)
  }

  // ── Validation post-écriture ────────────────────────────────────────────

  console.log('\n🔍 Validation post-écriture...')

  let emptyGenres = 0
  const validationCounts = {}
  for (const g of VALID_GENRES) validationCounts[g] = 0

  for (const t of [1, 2, 3, 4]) {
    const data = readJson(tierPaths[t])
    for (const adv of data) {
      if (!adv.genres || adv.genres.length === 0) {
        emptyGenres++
        console.warn(`   ⚠️  T${t} "${adv.name}" — genres vide ou manquant`)
      }
      for (const g of (adv.genres || [])) {
        if (!VALID_GENRES.includes(g)) {
          console.warn(`   ⚠️  T${t} "${adv.name}" — genre invalide: "${g}"`)
        }
        validationCounts[g] = (validationCounts[g] || 0) + 1
      }
    }
  }

  if (emptyGenres === 0) {
    console.log('   ✅ Aucun adversaire sans genre')
  } else {
    console.log(`   ❌ ${emptyGenres} adversaire(s) sans genre`)
  }

  console.log('   ✅ Distribution validée')
}

// ── Fin ─────────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(50))
console.log('✅ Terminé')
console.log('═'.repeat(50))
