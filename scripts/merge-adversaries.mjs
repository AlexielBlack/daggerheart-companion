#!/usr/bin/env node
/**
 * Merge des adversaires parsés dans les fichiers tier{1-4}.json existants.
 *
 * 1. Corrige les noms pollués (contamination cross-colonne)
 * 2. Déduplique par ID (les SRD existants ont priorité)
 * 3. Ajoute les nouveaux adversaires au bon fichier tier
 * 4. Écrit les fichiers mis à jour
 *
 * Usage: node scripts/merge-adversaries.mjs [--dry-run]
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const dryRun = process.argv.includes('--dry-run')

// ── Corrections de noms manuelles ──────────────────────────────────────────

/** Corrections pour output-creatures.json — contamination cross-colonne PDF */
const CREATURES_NAME_FIXES = {
  'Aithon Pegasus': 'Pegasus',
  'Pegasus Ignocerous': 'Ignocerous',
  'Gorge Buzzard Ashen Stag': 'Ashen Stag',
  'Ashen Stag Ashen Fawn': 'Ashen Fawn',
  'Megalodon Amphisbaena': 'Amphisbaena',
  'Veloraptid Wasp Queen': 'Wasp Queen',
  'Sentinel Xeralyth Queen': 'Xeralyth Queen',
  'Soul Otherworld Interloper: Horror': 'Otherworld Interloper: Horror',
  'Pyrothurge Pyrothurge': 'Pyrothurge',
  'Pyre Eater Tortured Soul': 'Tortured Soul'
}

/** Corrections pour output-menagerie.json */
const MENAGERIE_NAME_FIXES = {
  'Young Thorn Dragon Laughing Lasher': 'Laughing Lasher'
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeId(name) {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function applyNameFixes(adversaries, fixes) {
  let fixCount = 0
  for (const adv of adversaries) {
    if (fixes[adv.name]) {
      const oldName = adv.name
      adv.name = fixes[adv.name]
      adv.id = makeId(adv.name)
      fixCount++
      console.log(`  🔧 "${oldName}" → "${adv.name}"`)
    }
  }
  return fixCount
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf-8'))
}

function writeJson(path, data) {
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf-8')
}

// ── Vérification de la structure attendue ───────────────────────────────────

const REQUIRED_FIELDS = ['id', 'name', 'tier', 'type']
const VALID_TYPES = [
  'Bruiser', 'Horde', 'Leader', 'Minion', 'Ranged',
  'Skulk', 'Social', 'Solo', 'Standard', 'Support'
]

const VALID_GENRES = [
  'humanoide', 'bete', 'mort-vivant', 'demon', 'fee', 'dragon',
  'construction', 'elementaire', 'aberration', 'plante', 'geant', 'monstruosite'
]

function validateAdversary(adv, source) {
  const issues = []
  for (const f of REQUIRED_FIELDS) {
    if (!adv[f]) issues.push(`missing ${f}`)
  }
  if (adv.tier && (adv.tier < 1 || adv.tier > 4)) {
    issues.push(`invalid tier ${adv.tier}`)
  }
  if (adv.type && !VALID_TYPES.includes(adv.type)) {
    issues.push(`invalid type "${adv.type}"`)
  }
  // Validation permissive des genres (warn, pas reject)
  if (adv.genres) {
    if (!Array.isArray(adv.genres)) {
      console.warn(`  ⚠️  [${source}] "${adv.name}" — genres is not an array`)
    } else {
      for (const g of adv.genres) {
        if (!VALID_GENRES.includes(g)) {
          console.warn(`  ⚠️  [${source}] "${adv.name}" — invalid genre "${g}"`)
        }
      }
    }
  }
  if (issues.length > 0) {
    console.warn(`  ⚠️  [${source}] "${adv.name || adv.id}" — ${issues.join(', ')}`)
  }
  return issues.length === 0
}

// ── Lecture des sources ─────────────────────────────────────────────────────

console.log('📖 Lecture des sources parsées...')

const sources = [
  { file: 'output-era-of-shadows.json', label: 'Era of Shadows', fixes: null },
  { file: 'output-archibald.json', label: "Archibald's Almanac", fixes: null },
  { file: 'output-undead.json', label: 'Undead', fixes: null },
  { file: 'output-menagerie.json', label: 'Menagerie of Mayhem', fixes: MENAGERIE_NAME_FIXES },
  { file: 'output-creatures.json', label: 'Incredible Creatures', fixes: CREATURES_NAME_FIXES },
  { file: 'output-babayaga.json', label: "Baba Yaga's Folio", fixes: null },
  { file: 'output-the-void.json', label: 'The Void', fixes: null },
  { file: 'output-age-umbra.json', label: 'Age of Umbra', fixes: null },
  { file: 'output-creatures-12.json', label: 'Incredible Creatures (Vol 1-2)', fixes: null },
  { file: 'output-red-death.json', label: 'Red Death Party', fixes: null },
  { file: 'output-morrgans.json', label: "Morrígan's Memories (Celtic)", fixes: null },
  { file: 'output-print-ready-indigenous.json', label: 'Print Ready (Indigenous)', fixes: null },
  { file: 'output-print-ready-celtic.json', label: 'Print Ready (Celtic Variants)', fixes: null }
]

let allNew = []

for (const src of sources) {
  const path = resolve(__dirname, src.file)
  let data
  try {
    data = readJson(path)
  } catch {
    console.warn(`  ⚠️  ${src.file} non trouvé — ignoré`)
    continue
  }

  console.log(`\n📦 ${src.label}: ${data.length} adversaires`)

  // Appliquer les corrections de noms
  if (src.fixes) {
    const fixCount = applyNameFixes(data, src.fixes)
    console.log(`   ${fixCount} noms corrigés`)
  }

  // Validation
  let valid = 0
  let invalid = 0
  for (const adv of data) {
    if (validateAdversary(adv, src.label)) {
      valid++
    } else {
      invalid++
    }
  }
  console.log(`   ✅ ${valid} valides, ❌ ${invalid} invalides`)

  allNew.push(...data.filter(a => validateAdversary(a, src.label)))
}

console.log(`\n📊 Total nouvelles entrées: ${allNew.length}`)

// ── Lecture des tier existants ───────────────────────────────────────────────

console.log('\n📖 Lecture des tier JSON existants...')

const tierPaths = {}
const tierData = {}

for (const t of [1, 2, 3, 4]) {
  const p = resolve(rootDir, `src/data/adversaries/tier${t}.json`)
  tierPaths[t] = p
  tierData[t] = readJson(p)
  console.log(`   Tier ${t}: ${tierData[t].length} existants`)
}

// ── Déduplication ───────────────────────────────────────────────────────────

console.log('\n🔍 Déduplication...')

const existingIds = new Set()
for (const t of [1, 2, 3, 4]) {
  for (const adv of tierData[t]) {
    existingIds.add(adv.id)
  }
}
console.log(`   ${existingIds.size} IDs existants`)

let dupeCount = 0
let addedCount = 0
const newByTier = { 1: [], 2: [], 3: [], 4: [] }
const allNewIds = new Set()

for (const adv of allNew) {
  if (existingIds.has(adv.id)) {
    dupeCount++
    continue
  }
  // Déduplique aussi entre les nouvelles sources (premier vu gagne)
  if (allNewIds.has(adv.id)) {
    dupeCount++
    continue
  }
  allNewIds.add(adv.id)
  newByTier[adv.tier].push(adv)
  addedCount++
}

console.log(`   ${dupeCount} doublons ignorés`)
console.log(`   ${addedCount} nouveaux adversaires à ajouter`)

for (const t of [1, 2, 3, 4]) {
  console.log(`   Tier ${t}: +${newByTier[t].length} (total: ${tierData[t].length + newByTier[t].length})`)
}

// ── Écriture ────────────────────────────────────────────────────────────────

if (dryRun) {
  console.log('\n🏷️  Mode dry-run — pas d\'écriture')
} else {
  console.log('\n✍️  Écriture des fichiers tier...')

  for (const t of [1, 2, 3, 4]) {
    if (newByTier[t].length === 0) {
      console.log(`   Tier ${t}: pas de changement`)
      continue
    }

    // Trier les nouveaux par nom pour un ordre cohérent
    newByTier[t].sort((a, b) => a.name.localeCompare(b.name))

    const merged = [...tierData[t], ...newByTier[t]]
    // Tri final alphabétique
    merged.sort((a, b) => a.name.localeCompare(b.name))

    writeJson(tierPaths[t], merged)
    console.log(`   Tier ${t}: ${merged.length} adversaires écrits ✅`)
  }
}

// ── Résumé ──────────────────────────────────────────────────────────────────

console.log('\n' + '═'.repeat(50))
console.log('📋 RÉSUMÉ')
console.log('═'.repeat(50))
console.log(`   Sources traitées:   ${sources.length}`)
console.log(`   Entrées parsées:    ${allNew.length}`)
console.log(`   Doublons ignorés:   ${dupeCount}`)
console.log(`   Nouveaux ajoutés:   ${addedCount}`)
for (const t of [1, 2, 3, 4]) {
  const before = tierData[t].length
  const after = before + newByTier[t].length
  console.log(`   Tier ${t}: ${before} → ${after} (+${newByTier[t].length})`)
}
console.log('═'.repeat(50))
