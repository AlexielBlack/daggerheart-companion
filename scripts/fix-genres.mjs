#!/usr/bin/env node
/* global process */
/**
 * @file fix-genres.mjs
 * @description Corrige les genres des adversaires après vérification manuelle.
 * Applique les corrections identifiées par l'audit sur les 732 adversaires.
 *
 * Usage:
 *   node scripts/fix-genres.mjs [--dry-run] [--report]
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = resolve(__dirname, '../src/data/adversaries')

const dryRun = process.argv.includes('--dry-run')
const report = process.argv.includes('--report')

// ═══════════════════════════════════════════════════════════
//  Corrections Map — verified manually per tier
// ═══════════════════════════════════════════════════════════

const CORRECTIONS = {
  // ── Tier 1 (64 corrections) ─────────────────────────────
  'ashen-deathweaver': ['humanoide', 'mort-vivant'],
  'ashkadavar': ['aberration'],
  'ashkadavar-swarm': ['aberration'],
  'bladed-guard': ['humanoide'],
  'blooming-cockatrice': ['dragon', 'plante'],
  'brawny-zombie': ['mort-vivant'],
  'budding-cockatrice-clutch': ['dragon', 'plante'],
  'buggane': ['fee', 'geant'],
  'burroska-doll': ['construction', 'plante'],
  'busybody': ['humanoide'],
  'canid-jackal': ['humanoide'],
  'canid-rover': ['humanoide'],
  'chort': ['demon', 'fee'],
  'clank-petard': ['construction'],
  'courtier': ['humanoide'],
  'deer-woman-boundary-warden': ['fee', 'humanoide'],
  'eryn-limb-wreath': ['aberration'],
  'gang-hideout': ['humanoide'],
  'giant-mosquitoes': ['bete'],
  'giant-rat': ['bete'],
  'giant-scorpion': ['bete'],
  'giant-snake': ['bete'],
  'giant-toad': ['bete'],
  'grand-feast': ['humanoide'],
  'grinning-legion-mob': ['humanoide'],
  'harrier': ['humanoide'],
  'hive-collector': ['aberration'],
  'hobblin': ['humanoide'],
  'hobgoblin-raider': ['bete', 'humanoide'],
  'ishkitini-screech-omen': ['bete', 'fee'],
  'jagged-knife-bandit': ['humanoide'],
  'jagged-knife-hexer': ['humanoide'],
  'jagged-knife-kneebreaker': ['humanoide'],
  'jagged-knife-lackey': ['humanoide'],
  'jagged-knife-shadow': ['humanoide'],
  'kelpie-bridle-taker': ['bete', 'fee'],
  'kobold-slinger': ['dragon', 'humanoide'],
  'kobold-trapper': ['dragon', 'humanoide'],
  'kushtaka-drowned-voice': ['bete', 'fee'],
  'leafcutter-spriggant': ['bete', 'fee'],
  'living-tentacle': ['aberration'],
  'mad-mage': ['humanoide'],
  'mandrake': ['plante'],
  'mannegishi-bridge-saboteur': ['fee', 'humanoide'],
  'minotaur-bully': ['humanoide', 'monstruosite'],
  'mountain-troll': ['geant'],
  'pain-beast': ['bete', 'monstruosite'],
  'petty-noble': ['humanoide'],
  'pirate-captain': ['humanoide'],
  'pirate-raiders': ['humanoide'],
  'pirate-tough': ['humanoide'],
  'possessed-townsfolk': ['humanoide', 'mort-vivant'],
  'pukwudgie-needle-path': ['fee', 'plante'],
  'rabble-mawb': ['monstruosite'],
  'ravenous-ghoul': ['mort-vivant'],
  'redcap-butcher': ['fee'],
  'rotlord': ['aberration', 'plante'],
  'rusalka': ['fee', 'mort-vivant'],
  'scarecrow': ['construction', 'mort-vivant'],
  'selkie-tide-post': ['bete', 'fee'],
  'sellsword': ['humanoide'],
  'shellycoat': ['fee'],
  'skeleton-knight': ['mort-vivant'],
  'spellblade': ['humanoide'],
  'swarm-of-animated-objects': ['construction'],
  'tangle-bramble-swarm': ['plante'],
  'the-gate-guardian': ['humanoide', 'mort-vivant'],
  'umbral-huntmaster': ['aberration', 'mort-vivant'],
  'untamed-experiment': ['monstruosite'],
  'velk-the-forsaken': ['humanoide', 'mort-vivant'],
  'woad-stalker': ['mort-vivant', 'plante'],
  'weaponmaster': ['humanoide'],
  'yoblin': ['humanoide'],

  // ── Tier 2 (120 corrections) ────────────────────────────
  'aether-magus': ['humanoide'],
  'alkonost': ['fee', 'monstruosite'],
  'amalgamation': ['aberration'],
  'animated-shadow': ['aberration'],
  'avian-aeronaut': ['humanoide', 'monstruosite'],
  'avian-divebomber': ['humanoide', 'monstruosite'],
  'avian-wind-dancer': ['humanoide', 'monstruosite'],
  'bacteria-swarm': ['aberration'],
  'barghest': ['fee', 'mort-vivant'],
  'battle-box': ['construction'],
  'battle-pyramid': ['construction'],
  'blasphemous-angel-evelyar': ['aberration', 'humanoide'],
  'boggart': ['fee'],
  'brambleguard': ['plante'],
  'bukwus-bone-beggar': ['fee', 'mort-vivant'],
  'centaur-archer': ['humanoide', 'monstruosite'],
  'centaur-destrier': ['humanoide', 'monstruosite'],
  'centaur-druid': ['humanoide', 'monstruosite'],
  'chaos-skull': ['construction'],
  'clank-beast': ['construction'],
  'conscript': ['humanoide'],
  'courtesan': ['humanoide'],
  'cu-sith-hills-shadow': ['bete', 'fee'],
  'cult-initiate': ['humanoide'],
  'demanding-crowd': ['humanoide'],
  'demonic-hound-pack': ['demon'],
  'domovoi': ['fee'],
  'doppelhund': ['aberration', 'demon'],
  'dragon-knight': ['humanoide'],
  'drakona-elementalist': ['elementaire', 'humanoide'],
  'drone': ['construction'],
  'dullahan': ['fee', 'mort-vivant'],
  'dwarf-cleric': ['humanoide'],
  'dwarf-ironclad': ['humanoide'],
  'electric-eels': ['bete'],
  'elephant': ['bete'],
  'elf-blade-dancer': ['humanoide'],
  'elite-hive-collector': ['humanoide'],
  'elite-soldier': ['humanoide'],
  'exiled-scoundrel': ['humanoide'],
  'failed-experiment': ['aberration'],
  'fallen-soldier': ['humanoide', 'mort-vivant'],
  'faun-janus': ['humanoide'],
  'fear-gorta-hollow-mouth': ['fee', 'mort-vivant'],
  'festering-ghast': ['mort-vivant'],
  'firbolg-cowboy': ['humanoide'],
  'firbolg-farmer': ['humanoide'],
  'fungril-horde': ['plante'],
  'fungril-mort': ['plante'],
  'galapa-ninja': ['humanoide'],
  'galapa-shell-warrior': ['humanoide'],
  'giant-beastmaster': ['geant', 'humanoide'],
  'giant-recruit': ['geant', 'humanoide'],
  'giant-spider': ['bete'],
  'gladestalker': ['humanoide'],
  'gnome-gunslinger': ['humanoide'],
  'gnome-tinkerer': ['humanoide'],
  'gobstalker': ['aberration'],
  'gorgon': ['humanoide', 'monstruosite'],
  'gremlin': ['fee'],
  'griffon': ['monstruosite'],
  'grimcroak-mauler': ['humanoide'],
  'hakturi': ['aberration'],
  'hauler': ['construction'],
  'hollow-captain': ['construction', 'mort-vivant'],
  'hulking-fungril': ['plante'],
  'human-mob': ['humanoide'],
  'junior-seraph': ['humanoide'],
  'kelp-forest': ['plante'],
  'kelpie': ['fee'],
  'knight-of-the-realm': ['humanoide'],
  'krampus': ['demon', 'fee'],
  'leshy-lord': ['plante'],
  'likho': ['aberration', 'fee'],
  'living-doll-horde': ['construction'],
  'lizardfolk-chameleon': ['humanoide'],
  'lizardfolk-gila-monster': ['humanoide'],
  'lizardfolk-monitor': ['humanoide'],
  'lummox': ['bete'],
  'maddened-dwarf': ['humanoide'],
  'mandrake-knot': ['plante'],
  'manticore': ['monstruosite'],
  'masked-thief': ['humanoide'],
  'masquerade-party': ['humanoide'],
  'mecha-suit': ['construction', 'humanoide'],
  'merchant-baron': ['humanoide'],
  'merfolk-aquamancer': ['humanoide'],
  'merfolk-harpooner': ['humanoide'],
  'minor-nature-spirit': ['fee'],
  'minotaur-wrecker': ['humanoide', 'monstruosite'],
  'morph': ['aberration'],
  'morphling': ['aberration'],
  'mortal-hunter': ['humanoide', 'mort-vivant'],
  'nalusa-falaya-shadow-bent': ['fee'],
  'narwhal': ['bete'],
  'necromancer': ['humanoide'],
  'orc-grunt': ['humanoide'],
  'orc-veteran': ['humanoide'],
  'ooze-cube': ['aberration'],
  'penitent-sentry': ['humanoide'],
  'polevik': ['fee', 'humanoide'],
  'profane-disciple': ['humanoide'],
  'ribbet-brute': ['humanoide'],
  'scrapper': ['construction'],
  'shambling-mummy': ['mort-vivant'],
  'simiah-bronzeback': ['humanoide'],
  'simiah-goldback': ['humanoide'],
  'simiah-silverback': ['humanoide'],
  'siren': ['fee', 'humanoide'],
  'sirin': ['fee', 'monstruosite'],
  'slaagmire-thaumaturge': ['humanoide'],
  'spectral-archer': ['humanoide', 'mort-vivant'],
  'spectral-guardian': ['humanoide', 'mort-vivant'],
  'spore-herald': ['plante'],
  'sporefallen-horde': ['mort-vivant', 'plante'],
  'storm-mage': ['humanoide'],
  'swamp-crab': ['aberration'],
  'swamp-troll': ['geant', 'plante'],
  'terrorgut': ['demon'],
  'tortured-artist': ['humanoide'],
  'totem-of-fear': ['construction'],
  'trickster-spirit': ['fee'],
  'two-halflings-in-a-trenchcoat': ['humanoide'],
  'war-wizard': ['humanoide'],
  'wererat': ['humanoide', 'monstruosite'],
  'werewolf': ['humanoide', 'monstruosite'],
  'wish-spirit': ['fee'],
  'wish-spirit-knot': ['fee'],
  'zombie-beast': ['mort-vivant'],

  // ── Tier 3 (105 corrections) ────────────────────────────
  'abbadon-wasp': ['bete', 'monstruosite'],
  'angel': ['elementaire'],
  'ankylosaurus': ['bete'],
  'ashen-stag': ['bete', 'elementaire'],
  'baihu-dragon-turtle': ['dragon', 'humanoide'],
  'belligerent-sister': ['humanoide'],
  'bloodborn': ['aberration'],
  'brutalon': ['bete'],
  'canid-bodyguard': ['humanoide'],
  'captured-thrall': ['aberration', 'humanoide'],
  'chimera': ['monstruosite'],
  'chosen-transformed': ['humanoide'],
  'cilrathi-queensguard': ['fee', 'humanoide'],
  'cinder-ant': ['bete', 'elementaire'],
  'clank-juggernaut': ['construction'],
  'cloud-giant': ['geant'],
  'congregation-of-the-end': ['humanoide'],
  'contract-killer': ['humanoide'],
  'darkheart-sister': ['humanoide'],
  'deadeye-sister': ['humanoide'],
  'demon-of-wrath': ['demon'],
  'dire-bat': ['bete'],
  'dullahan-lantern-of-names': ['fee', 'mort-vivant'],
  'each-uisge-lakes-devourer': ['fee', 'monstruosite'],
  'elf-spellblade': ['humanoide'],
  'eyeball-aberration': ['aberration'],
  'faerie-wrathwing': ['fee', 'humanoide'],
  'false-god': ['humanoide'],
  'fire-beetles': ['bete'],
  'flame-fanner': ['demon', 'elementaire'],
  'fossil': ['bete', 'mort-vivant'],
  'frost-spirits': ['elementaire'],
  'galapa-chronomancer': ['humanoide'],
  'genie': ['elementaire'],
  'giant-tortoise': ['bete', 'geant'],
  'gnome-alchemist': ['humanoide'],
  'gorge-buzzard': ['bete'],
  'greater-water-elemental': ['elementaire'],
  'gulch-salamander-burning-lizard': ['bete', 'elementaire'],
  'gulch-salamander-sluggish-lizard': ['bete'],
  'head-vampire': ['mort-vivant'],
  'herald-of-conquest': ['humanoide'],
  'human-supervillain': ['humanoide'],
  'hungering-darkness': ['aberration'],
  'illumi-paladin': ['humanoide'],
  'illumi-schemer': ['humanoide'],
  'illumi-solar': ['humanoide'],
  'inferni-diabolist': ['demon', 'humanoide'],
  'jelloon': ['aberration', 'bete'],
  'jorogumo': ['fee', 'monstruosite'],
  'kalimari-grenadier': ['humanoide'],
  'kalimari-oozeslinger': ['humanoide'],
  'kalimari-seasoned-fighter': ['humanoide'],
  'katari-pit-fighter': ['humanoide'],
  'kikimora': ['fee'],
  'lamplight-beguiler': ['bete', 'monstruosite'],
  'leshy': ['fee', 'plante'],
  'mentalist': ['humanoide'],
  'mishipeshu-river-claws': ['fee', 'monstruosite'],
  'monarch': ['humanoide'],
  'murder-mystery': ['humanoide'],
  'mutagenist-sister': ['humanoide'],
  'naga-empress': ['bete', 'monstruosite'],
  'naga-oracle': ['humanoide', 'monstruosite'],
  'naga-shapeshifter': ['humanoide', 'monstruosite'],
  'naiad': ['fee'],
  'nuckelavee': ['fee', 'monstruosite'],
  'omara-the-grave-hallowed': ['mort-vivant'],
  'omara-the-shadow-cursed': ['humanoide', 'mort-vivant'],
  'oni': ['fee', 'geant'],
  'orc-nemesis': ['humanoide'],
  'pamola-gale-warden-of-katahdin': ['elementaire', 'fee'],
  'phoenix': ['bete', 'elementaire'],
  'primordial-basilisk': ['bete', 'monstruosite'],
  'quetzalcoatlus': ['bete'],
  'reaper': ['mort-vivant'],
  'rhino-beetle': ['bete'],
  'ribbet-leaper-knight': ['humanoide'],
  'ribbet-skulk': ['humanoide'],
  'riftheart': ['aberration'],
  'rolling-eye': ['aberration'],
  'rott': ['mort-vivant'],
  'scythicant-sentinel': ['demon', 'fee'],
  'sea-giant': ['geant'],
  'selachi-ghostfin': ['humanoide', 'mort-vivant'],
  'selachi-megalodon': ['humanoide'],
  'selachi-warband': ['humanoide'],
  'sheriff': ['humanoide'],
  'sluagh-swarm': ['fee', 'mort-vivant'],
  'sluagh-window-swarm': ['fee', 'mort-vivant'],
  'sphinx': ['monstruosite'],
  'stag-knight': ['humanoide'],
  'swarm-watcher': ['fee'],
  'terran-gaia': ['humanoide'],
  'terran-scree': ['humanoide'],
  'terran-tuff': ['humanoide'],
  'terror-of-the-depths': ['aberration', 'bete'],
  'the-shadow-of-dawn-s-fury': ['aberration'],
  'thundering-behemoth': ['bete', 'geant'],
  'towerback': ['construction'],
  'unicorn': ['bete', 'fee'],
  'valkyrie': ['humanoide'],
  'vampire-squid': ['bete'],
  'vault-guardian-gaoler': ['construction'],
  'vault-guardian-sentinel': ['construction'],
  'vault-guardian-turret': ['construction'],
  'veilseer-apparition': ['aberration', 'mort-vivant'],
  'vine-behemoth': ['construction', 'plante'],
  'vine-serpent': ['construction', 'plante'],
  'volkolak': ['fee', 'monstruosite'],
  'wasp-queen': ['demon', 'fee'],
  'waspwyrm': ['bete'],
  'weredragon': ['dragon', 'humanoide'],
  'weretiger': ['bete', 'humanoide'],
  'whale': ['bete'],
  'whisper-wraith': ['mort-vivant'],
  'woods-witch': ['fee', 'humanoide'],
  'xeralyth-dragoon': ['aberration'],
  'xeralyth-queen': ['aberration'],
  'zhar-ptitsa': ['bete', 'fee'],

  // ── Tier 4 (62 corrections) ─────────────────────────────
  'aos-si-high-lord-bearer-of-glamour': ['fee', 'humanoide'],
  'archangel': ['monstruosite'],
  'archpriest': ['humanoide'],
  'baba-yaga': ['fee', 'humanoide'],
  'balor-the-blighted-eye': ['fee', 'geant'],
  'cephilith-priest': ['aberration', 'humanoide'],
  'chicken-legged-hut': ['construction', 'fee'],
  'chosen-inquisitor': ['humanoide'],
  'cinderwretch': ['elementaire', 'monstruosite'],
  'congregant': ['humanoide'],
  'cwn-annwn-pack': ['bete', 'fee', 'mort-vivant'],
  'demigod': ['humanoide', 'monstruosite'],
  'disfavored': ['humanoide', 'monstruosite'],
  'elder-fae-noble': ['fee', 'humanoide'],
  'elder-fae-recluse': ['fee', 'monstruosite'],
  'elder-fae-wanderer': ['fee', 'monstruosite'],
  'elf-tycoon': ['humanoide'],
  'extraplanar-army': ['aberration'],
  'fallen-shock-troop': ['mort-vivant'],
  'fallen-sorcerer': ['humanoide', 'mort-vivant'],
  'fallen-warlord-realm-breaker': ['humanoide', 'mort-vivant'],
  'fallen-warlord-undefeated-champion': ['humanoide', 'mort-vivant'],
  'flying-head-hunger-wheel': ['monstruosite'],
  'fomorian-curse-reaver-eye-of-spite': ['fee', 'geant'],
  'fomorian-host': ['fee', 'geant'],
  'gaasyendietha-meteor-serpent': ['dragon', 'elementaire'],
  'god-king': ['humanoide'],
  'gwyllgi': ['bete', 'fee'],
  'hallowed-archer': ['humanoide'],
  'hallowed-assassin': ['humanoide'],
  'hallowed-choir': ['humanoide'],
  'hallowed-soldier': ['humanoide'],
  'high-seraph': ['humanoide'],
  'host-of-morozhenye': ['elementaire', 'mort-vivant'],
  'jaeger-assassin': ['construction', 'humanoide'],
  'jaeger-magehunter': ['construction', 'humanoide'],
  'living-nightmare': ['aberration'],
  'mastermind': ['humanoide'],
  'mirrored-soul': ['aberration'],
  'morozko': ['elementaire', 'fee'],
  'morrigans-phantom-host': ['bete', 'fee', 'mort-vivant'],
  'oracle-of-doom': ['monstruosite'],
  'otherworld-commander': ['aberration', 'humanoide'],
  'otherworld-spark-lobber': ['aberration', 'plante'],
  'outer-realms-corrupter': ['aberration'],
  'outer-realms-thrall': ['aberration'],
  'owl-witch': ['bete', 'monstruosite'],
  'pyre-eater': ['dragon', 'elementaire'],
  'roc': ['bete'],
  'skull-ward': ['construction', 'mort-vivant'],
  'the-infesting-lord-council-spider': ['aberration', 'bete', 'mort-vivant'],
  'thunderbird-storm-judge': ['bete', 'elementaire'],
  'time-wraith': ['aberration', 'mort-vivant'],
  'tlanuwa-cliff-king': ['bete', 'monstruosite'],
  'tylwyth-teg-riders': ['fee', 'humanoide'],
  'undying-sovereign': ['humanoide', 'mort-vivant'],
  'volcanic-dragon-obsidian-predator': ['dragon'],
  'volcanic-dragon-molten-scourge': ['dragon', 'elementaire'],
  'wailing-corpse': ['aberration', 'mort-vivant'],
  'winter-eternal-blizzard': ['elementaire'],
  'winter-night-wolf': ['bete', 'elementaire'],
  'xenn-neurocrat': ['aberration', 'humanoide'],
  'xenn-hexer': ['aberration', 'humanoide'],
  'xero-castle-killer': ['bete', 'geant'],
  'zlodomovoi': ['fee'],
  'zombie-legion': ['mort-vivant'],
}

// ═══════════════════════════════════════════════════════════
//  Application des corrections
// ═══════════════════════════════════════════════════════════

const TIER_FILES = ['tier1.json', 'tier2.json', 'tier3.json', 'tier4.json']
const VALID_GENRES = [
  'humanoide', 'bete', 'mort-vivant', 'demon', 'fee', 'dragon',
  'construction', 'elementaire', 'aberration', 'plante', 'geant', 'monstruosite'
]

let totalFixed = 0
let totalSkipped = 0
let totalNotFound = 0

// Vérification des genres dans le map
for (const [id, genres] of Object.entries(CORRECTIONS)) {
  for (const g of genres) {
    if (!VALID_GENRES.includes(g)) {
      console.error(`❌ Genre invalide "${g}" pour ${id}`)
      process.exit(1)
    }
  }
}

const reportLines = []
if (report) {
  reportLines.push('| Adversaire | Ancien genres | Nouveau genres | Tier |')
  reportLines.push('|------------|---------------|----------------|------|')
}

for (const file of TIER_FILES) {
  const filePath = resolve(DATA_DIR, file)
  const adversaries = JSON.parse(readFileSync(filePath, 'utf8'))
  let fileFixed = 0

  for (const adv of adversaries) {
    if (CORRECTIONS[adv.id]) {
      const oldGenres = JSON.stringify(adv.genres)
      const newGenres = [...CORRECTIONS[adv.id]].sort()
      const currentSorted = [...(adv.genres || [])].sort()

      if (JSON.stringify(currentSorted) === JSON.stringify(newGenres)) {
        totalSkipped++
        continue
      }

      if (report) {
        reportLines.push(`| ${adv.name} | ${oldGenres} | ${JSON.stringify(newGenres)} | ${adv.tier} |`)
      }

      if (!dryRun) {
        adv.genres = newGenres
      }

      console.log(`  ✏️  ${adv.name} (${adv.id}): ${oldGenres} → ${JSON.stringify(newGenres)}`)
      totalFixed++
      fileFixed++
    }
  }

  if (!dryRun && fileFixed > 0) {
    writeFileSync(filePath, JSON.stringify(adversaries, null, 2) + '\n', 'utf8')
  }

  console.log(`📄 ${file}: ${fileFixed} corrections${dryRun ? ' (dry-run)' : ''}`)
}

// Vérifier les IDs non trouvés
const allIds = new Set()
for (const file of TIER_FILES) {
  const filePath = resolve(DATA_DIR, file)
  const adversaries = JSON.parse(readFileSync(filePath, 'utf8'))
  for (const adv of adversaries) {
    allIds.add(adv.id)
  }
}
for (const id of Object.keys(CORRECTIONS)) {
  if (!allIds.has(id)) {
    console.warn(`  ⚠️  ID non trouvé: ${id}`)
    totalNotFound++
  }
}

console.log(`\n═══════════════════════════════════════`)
console.log(`Total corrections appliquées: ${totalFixed}`)
console.log(`Total déjà corrects (skip):   ${totalSkipped}`)
if (totalNotFound > 0) {
  console.log(`Total IDs non trouvés:        ${totalNotFound}`)
}
console.log(`═══════════════════════════════════════`)

if (report && reportLines.length > 2) {
  console.log('\n' + reportLines.join('\n'))
}

if (dryRun) {
  console.log('\n🔍 Mode dry-run — aucun fichier modifié.')
}
