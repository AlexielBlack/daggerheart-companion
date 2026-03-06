/**
 * Script d'extraction des combat features depuis les données adversaires.
 * Génère le fichier adversaryFeatures.js pour le catalogue.
 *
 * Usage : node scripts/extractAdversaryFeatures.js > output.js
 */

import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const t1 = require('../src/data/adversaries/tier1.json')
const t2 = require('../src/data/adversaries/tier2.json')
const t3 = require('../src/data/adversaries/tier3.json')
const t4 = require('../src/data/adversaries/tier4.json')
const all = [...t1, ...t2, ...t3, ...t4]

// ── Mapping adversaire → thèmes ──
const THEME_MAP = {
  // T1 Humanoïdes
  'courtier': ['humanoid', 'socialIntrigue'],
  'archer-guard': ['humanoid'],
  'bladed-guard': ['humanoid'],
  'head-guard': ['humanoid'],
  'jagged-knife-bandit': ['humanoid'],
  'jagged-knife-hexer': ['humanoid'],
  'jagged-knife-kneebreaker': ['humanoid'],
  'jagged-knife-lackey': ['humanoid'],
  'jagged-knife-lieutenant': ['humanoid'],
  'jagged-knife-shadow': ['humanoid'],
  'jagged-knife-sniper': ['humanoid'],
  'merchant': ['humanoid', 'socialIntrigue'],
  'sellsword': ['humanoid'],
  'spellblade': ['humanoid'],
  'weaponmaster': ['humanoid'],
  'petty-noble': ['humanoid', 'socialIntrigue'],
  'pirate-captain': ['humanoid'],
  'pirate-raiders': ['humanoid'],
  'pirate-tough': ['humanoid'],
  'harrier': ['humanoid'],
  // T1 Bestiaux
  'bear': ['bestial'],
  'dire-wolf': ['bestial'],
  'giant-mosquitoes': ['bestial'],
  'giant-rat': ['bestial'],
  'giant-scorpion': ['bestial'],
  'glass-snake': ['bestial'],
  'swarm-of-rats': ['bestial'],
  // T1 Monstrueux
  'acid-burrower': ['monstrous'],
  'cave-ogre': ['monstrous'],
  'construct': ['monstrous'],
  'deeproot-defender': ['monstrous'],
  'green-ooze': ['monstrous'],
  'red-ooze': ['monstrous'],
  'tiny-green-ooze': ['monstrous'],
  'tiny-red-ooze': ['monstrous'],
  'tangle-bramble': ['monstrous'],
  'tangle-bramble-swarm': ['monstrous'],
  // T1 Mort-vivants
  'skeleton-warrior': ['undead'],
  'skeleton-archer': ['undead'],
  'skeleton-knight': ['undead'],
  'skeleton-dredge': ['undead'],
  'shambling-zombie': ['undead'],
  'brawny-zombie': ['undead'],
  'rotted-zombie': ['undead'],
  'zombie-pack': ['undead'],
  'patchwork-zombie-hulk': ['undead'],
  // T1 Élémentaires / Démons
  'minor-demon': ['elemental'],
  'minor-fire-elemental': ['elemental'],
  'minor-chaos-elemental': ['elemental'],
  // T1 Féérique / Nature
  'minor-treant': ['monstrous'],
  'young-dryad': ['monstrous'],
  'sylvan-soldier': ['humanoid'],

  // T2 Humanoïdes
  'elite-soldier': ['humanoid'],
  'apprentice-assassin': ['humanoid'],
  'assassin-poisoner': ['humanoid'],
  'master-assassin': ['humanoid'],
  'conscript': ['humanoid'],
  'courtesan': ['humanoid', 'socialIntrigue'],
  'knight-of-the-realm': ['humanoid'],
  'masked-thief': ['humanoid'],
  'merchant-baron': ['humanoid', 'socialIntrigue'],
  'mortal-hunter': ['humanoid'],
  'royal-advisor': ['humanoid', 'socialIntrigue'],
  'secret-keeper': ['humanoid', 'socialIntrigue'],
  'spy': ['humanoid', 'socialIntrigue'],
  'war-wizard': ['humanoid'],
  'archer-squadron': ['humanoid'],
  // T2 Bestiaux
  'electric-eels': ['bestial'],
  'giant-eagle': ['bestial'],
  'shark': ['bestial'],
  'siren': ['monstrous'],
  'juvenile-flickerfly': ['bestial'],
  // T2 Monstrueux
  'failed-experiment': ['monstrous'],
  'giant-beastmaster': ['monstrous'],
  'giant-brawler': ['monstrous'],
  'giant-recruit': ['monstrous'],
  'minotaur-wrecker': ['monstrous'],
  'gorgon': ['monstrous'],
  'battle-box': ['monstrous'],
  'stonewraith': ['monstrous'],
  // T2 Mort-vivants / Spectres
  'spectral-archer': ['undead'],
  'spectral-captain': ['undead'],
  'spectral-guardian': ['undead'],
  // T2 Démons / Élémentaires
  'chaos-skull': ['elemental'],
  'demonic-hound-pack': ['elemental'],
  // T2 Culte
  'cult-adept': ['humanoid'],
  'cult-fang': ['humanoid'],
  'cult-initiate': ['humanoid'],

  // T3 Démons
  'demon-of-avarice': ['elemental'],
  'demon-of-despair': ['elemental'],
  'demon-of-hubris': ['elemental'],
  'demon-of-jealousy': ['elemental'],
  'demon-of-wrath': ['elemental'],
  // T3 Bestiaux
  'dire-bat': ['bestial'],
  'adult-flickerfly': ['bestial'],
  // T3 Féérique / Nature
  'dryad': ['monstrous'],
  'oak-treant': ['monstrous'],
  'treant-sapling': ['monstrous'],
  // T3 Élémentaires
  'elemental-spark': ['elemental'],
  'greater-earth-elemental': ['elemental'],
  'greater-water-elemental': ['elemental'],
  // T3 Monstrueux
  'huge-green-ooze': ['monstrous'],
  'hydra': ['monstrous'],
  'stag-knight': ['humanoid'],
  // T3 Humanoïdes / Social
  'monarch': ['humanoid', 'socialIntrigue'],
  // T3 Mort-vivants
  'head-vampire': ['undead'],
  'vampire': ['undead'],
  // T3 Construits
  'vault-guardian-gaoler': ['monstrous'],
  'vault-guardian-sentinel': ['monstrous'],
  'vault-guardian-turret': ['monstrous'],
  // T3 Dragons
  'young-ice-dragon': ['monstrous'],

  // T4 Mort-vivants
  'arch-necromancer': ['undead'],
  'fallen-shock-troop': ['undead'],
  'fallen-sorcerer': ['undead'],
  'fallen-warlord-realm-breaker': ['undead'],
  'fallen-warlord-undefeated-champion': ['undead'],
  'perfected-zombie': ['undead'],
  'zombie-legion': ['undead'],
  // T4 Humanoïdes sacrés
  'hallowed-archer': ['humanoid'],
  'hallowed-soldier': ['humanoid'],
  'high-seraph': ['humanoid'],
  // T4 Monstrueux
  'kraken': ['monstrous'],
  'oracle-of-doom': ['monstrous'],
  'outer-realms-abomination': ['monstrous'],
  'outer-realms-corrupter': ['monstrous'],
  'outer-realms-thrall': ['monstrous'],
  // T4 Dragons
  'volcanic-dragon-obsidian-predator': ['monstrous'],
  'volcanic-dragon-molten-scourge': ['monstrous'],
  'volcanic-dragon-ashen-tyrant': ['monstrous'],
}

// ── Extraction & déduplication ──
const featureMap = new Map()

for (const adv of all) {
  const advThemes = THEME_MAP[adv.id] || ['monstrous']

  for (const f of (adv.features || [])) {
    const key = f.name

    if (featureMap.has(key)) {
      // Merge : ajouter les thèmes et sources
      const existing = featureMap.get(key)
      for (const t of advThemes) {
        if (!existing.themes.includes(t)) existing.themes.push(t)
      }
      existing.sources.push(adv.id)
      // Garder le tier le plus bas
      if (adv.tier < existing.tier) existing.tier = adv.tier
    } else {
      featureMap.set(key, {
        name: f.name,
        description: f.description,
        activationType: f.activationType || 'passive',
        cost: f.cost || { type: 'free', amount: 0 },
        frequency: f.frequency || null,
        range: f.range || null,
        trigger: f.trigger || null,
        tags: f.tags || [],
        tier: adv.tier,
        themes: [...advThemes],
        sources: [adv.id]
      })
    }
  }
}

// ── Vérif ──
console.error('Adversaires traités:', all.length)
console.error('Features brutes:', all.flatMap(a => a.features || []).length)
console.error('Features uniques:', featureMap.size)
console.error('Adversaires sans thème:', all.filter(a => !THEME_MAP[a.id]).map(a => a.id).join(', ') || '(aucun)')

// ── Sortie JSON ──
const output = [...featureMap.values()].sort((a, b) => {
  if (a.tier !== b.tier) return a.tier - b.tier
  return a.name.localeCompare(b.name)
})

console.log(JSON.stringify(output, null, 2))
