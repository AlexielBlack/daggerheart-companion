#!/usr/bin/env node
import { readFileSync } from 'fs'

const EXCEPTIONS = new Set(['Tiny Green Ooze', 'Tiny Red Ooze'])

console.log('=== Minions avec HP != 1 ===')
for (const t of [1, 2, 3, 4]) {
  const d = JSON.parse(readFileSync(`src/data/adversaries/tier${t}.json`, 'utf8'))
  const bad = d.filter(a => a.type === 'Minion' && a.hp !== 1 && !EXCEPTIONS.has(a.name))
  for (const a of bad) {
    console.log(`T${t}: ${a.name} hp=${a.hp} source=${a.source || 'SRD'}`)
  }
}

console.log('\n=== Non-Minion/Social avec HP <= 1 ===')
for (const t of [1, 2, 3, 4]) {
  const d = JSON.parse(readFileSync(`src/data/adversaries/tier${t}.json`, 'utf8'))
  const bad = d.filter(a => a.type !== 'Minion' && a.type !== 'Social' && a.hp <= 1)
  for (const a of bad) {
    console.log(`T${t}: ${a.name} (${a.type}) hp=${a.hp} source=${a.source || 'SRD'}`)
  }
}

console.log('\n=== Seuils incohérents (severe <= major) ===')
for (const t of [1, 2, 3, 4]) {
  const d = JSON.parse(readFileSync(`src/data/adversaries/tier${t}.json`, 'utf8'))
  const bad = d.filter(a => a.thresholds && a.thresholds.major && a.thresholds.severe && a.thresholds.severe <= a.thresholds.major)
  for (const a of bad) {
    console.log(`T${t}: ${a.name} (${a.type}) major=${a.thresholds.major} severe=${a.thresholds.severe} source=${a.source || 'SRD'}`)
  }
}
