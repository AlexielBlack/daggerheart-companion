/**
 * Convertit le CSV des PNJs en JSON importable par le store NPC.
 *
 * Mapping CSV → NPC :
 *  - Nom → name
 *  - Rôle → title
 *  - Détail physique → description
 *  - Contradiction + Façon de parler → personality
 *  - Que veut iel ? → motives
 *  - Comment le poursuit-iel ? → tactics
 *  - Faction → faction
 *  - Importance initiale → status (Antagoniste→hostile, Crucial/Important→ally, Récurrent→neutral, Facultatif→neutral)
 *  - Problème actif → notes
 *  - Ascendance → dans notes (info narrative)
 */

import { readFileSync, writeFileSync } from 'fs'

const csv = readFileSync('/mnt/user-data/uploads/PNJs_2f364f3ae46280448a77fda84d5fc210.csv', 'utf-8')

// Parser CSV basique qui gère les champs entre guillemets et les retours à la ligne dans les champs
function parseCSV(text) {
  const rows = []
  let current = ''
  let inQuotes = false
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  for (let i = 0; i < lines.length; i++) {
    const ch = lines[i]
    if (ch === '"') {
      if (inQuotes && lines[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === ',' && !inQuotes) {
      rows.push(current.trim())
      current = ''
    } else if (ch === '\n' && !inQuotes) {
      rows.push(current.trim())
      current = ''
      rows.push('\n')
    } else {
      current += ch
    }
  }
  if (current.trim()) rows.push(current.trim())

  // Recombine into rows of fields
  const result = []
  let currentRow = []
  for (const item of rows) {
    if (item === '\n') {
      if (currentRow.length > 0) result.push(currentRow)
      currentRow = []
    } else {
      currentRow.push(item)
    }
  }
  if (currentRow.length > 0) result.push(currentRow)

  return result
}

const parsed = parseCSV(csv)
// Remove BOM from first header
parsed[0][0] = parsed[0][0].replace(/^\uFEFF/, '')

const headers = parsed[0]
const dataRows = parsed.slice(1)

console.log(`Headers: ${headers.join(' | ')}`)
console.log(`Rows: ${dataRows.length}`)

// Map importance → status
function mapStatus(importance) {
  const lower = (importance || '').toLowerCase().trim()
  if (lower.includes('antagoniste')) return 'hostile'
  if (lower.includes('crucial') || lower.includes('important')) return 'ally'
  return 'neutral'
}

// Map faction → location hint
function mapLocation(faction) {
  const f = (faction || '').toLowerCase()
  if (f.includes('garde')) return 'Caserne / Patrouilles'
  if (f.includes('main noire')) return 'Sites oniriques / Bas-fonds'
  if (f.includes('migrants') || f.includes('migrant')) return 'Quartier des docks'
  if (f.includes('natifs') || f.includes('natif')) return 'Centre-ville'
  return 'Lacres'
}

let idCounter = 0
const npcs = dataRows
  .filter(row => row.length >= 11 && row[0])
  .map(row => {
    idCounter++
    const [nom, ascendance, comment, contradiction, physique, faction, parler, importance, probleme, veut, role] = row

    const name = nom.trim()
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '').slice(0, 25)
    const now = new Date().toISOString()

    // Personnalité : contradiction + façon de parler
    const personalityParts = []
    if (contradiction) personalityParts.push(`Contradiction : ${contradiction.trim()}`)
    if (parler) personalityParts.push(`Façon de parler : ${parler.trim()}`)

    // Notes : problème actif + ascendance
    const notesParts = []
    if (probleme) notesParts.push(`Problème actif : ${probleme.trim()}`)
    if (ascendance) notesParts.push(`Ascendance : ${ascendance.trim()}`)
    if (importance) notesParts.push(`Importance : ${importance.trim()}`)

    return {
      id: `npc-${slug}-seed-${String(idCounter).padStart(2, '0')}`,
      name,
      title: (role || '').trim(),
      description: (physique || '').trim().replace(/\s+/g, ' '),
      personality: personalityParts.join('\n'),
      motives: (veut || '').trim().replace(/\s+/g, ' '),
      tactics: (comment || '').trim().replace(/\s+/g, ' '),
      location: mapLocation(faction),
      faction: (faction || '').trim(),
      status: mapStatus(importance),
      difficulty: null,
      notes: notesParts.join('\n'),
      pcRelations: [],
      npcRelations: [],
      combatEnabled: false,
      linkedAdversaryId: null,
      classId: null,
      subclassId: null,
      level: null,
      domainCards: [],
      createdAt: now,
      updatedAt: now
    }
  })

// Ajouter les relations PNJ↔PNJ connues d'après le CSV
const npcMap = new Map(npcs.map(n => [n.name, n.id]))

const knownRelations = [
  // Main Noire — hiérarchie
  ['Hank \u201CLe Faiseur\u201D Ferro', 'Margot Tristemain', 'employer', 'Sous les ordres de Margot', false],
  ['Rob \u201CMangetout\u201D Solino', 'Margot Tristemain', 'employer', 'Informateur pour la Main Noire', false],
  ['Séra Souverain', 'Margot Tristemain', 'alliance', 'Spécialiste onirique au service de Margot', false],
  ['Kester \u201CLe Daim\u201D Xaham', 'Margot Tristemain', 'employer', 'Guetteur de la Main Noire', false],
  ['Mérisol Laroc', 'Margot Tristemain', 'employer', 'Infiltrée dans la Garde pour la Main Noire', false],
  ['Zestia Rowan', 'Margot Tristemain', 'employer', 'Alchimiste de la Main Noire', false],
  ['Cid \u201CLe Fou\u201D Frêlemain', 'Margot Tristemain', 'employer', 'Espion double', false],
  ['Sélina Danse', 'Margot Tristemain', 'employer', 'Artiste-espionne', false],
  ['Mélina Danse', 'Margot Tristemain', 'employer', 'Artiste-espionne', false],
  ['Ravel \u201CLe Régulateur\u201D Kestis', 'Margot Tristemain', 'employer', 'Responsable site onirique', false],
  ['Nysa \u201CLa Veilleuse\u201D Sombredor', 'Margot Tristemain', 'employer', 'Rêveuse stabilisatrice', false],
  ['Thalem d\u2019Opale', 'Margot Tristemain', 'alliance', 'Erudit au service de la recherche onirique', false],
  // Sélina et Mélina Danse
  ['Sélina Danse', 'Mélina Danse', 'family', 'Sœurs jumelles', true],
  // Cillian vs Margot
  ['Cillian Légerdemain', 'Margot Tristemain', 'enmity', 'Révolte contre la Main Noire', true],
  // Cerys — Garde
  ['Senna Valse', 'Cerys Dorsenn', 'employer', 'Enquêtrice sous ses ordres', false],
  ['Daffodil Gredin', 'Cerys Dorsenn', 'employer', 'Garde idéaliste', false],
  ['Griff Sermor', 'Cerys Dorsenn', 'employer', 'Garde corrompu', false],
  ['Mohan Pierresombre', 'Cerys Dorsenn', 'employer', 'Garde indécis', false],
  ['Derj', 'Cerys Dorsenn', 'employer', 'Garde brutal', false],
  ['Pyra Selenar', 'Cerys Dorsenn', 'employer', 'Patrouilleuse', false],
  ['Maël Mercla', 'Cerys Dorsenn', 'employer', 'Expert portuaire', false],
  // Mérisol — double
  ['Mérisol Laroc', 'Cerys Dorsenn', 'employer', 'Officiellement sous ses ordres', false],
  // Roxane et Kusaki
  ['Roxane', 'Kusaki Qamar', 'romance', 'Partenaires séparées', true],
  // Cillian — réseau migrant
  ['Aeron Lessaman', 'Cillian Légerdemain', 'alliance', 'Activiste allié', false],
  ['Trud Pierreforte', 'Cillian Légerdemain', 'alliance', 'Protecteur de la communauté', false],
  ['Ilsha Felwenn', 'Cillian Légerdemain', 'alliance', 'Révolutionnaire alliée', false],
  // Rhys — intermédiaire
  ['Rhys Tet\u2019Lek', 'Margot Tristemain', 'debt', 'A une dette envers la Main Noire', false],
]

for (const [sourceName, targetName, type, note, bidirectional] of knownRelations) {
  const sourceId = npcMap.get(sourceName)
  const targetId = npcMap.get(targetName)
  if (!sourceId || !targetId) {
    console.warn(`⚠ Relation ignorée : "${sourceName}" → "${targetName}" (introuvable)`)
    continue
  }

  const source = npcs.find(n => n.id === sourceId)
  source.npcRelations.push({ targetNpcId: targetId, type, note, bidirectional: !!bidirectional })

  if (bidirectional) {
    const target = npcs.find(n => n.id === targetId)
    target.npcRelations.push({ targetNpcId: sourceId, type, note, bidirectional: true })
  }
}

const output = {
  category: 'npcs',
  version: 1,
  exportedAt: new Date().toISOString(),
  items: npcs
}

const outPath = '/home/claude/daggerheart-companion/seed-npcs-lacres.json'
writeFileSync(outPath, JSON.stringify(output, null, 2), 'utf-8')

console.log(`\n✅ ${npcs.length} PNJs générés → ${outPath}`)
console.log(`   Relations : ${npcs.reduce((sum, n) => sum + n.npcRelations.length, 0)} liens`)

// Stats
const factions = {}
const statuses = {}
for (const n of npcs) {
  factions[n.faction] = (factions[n.faction] || 0) + 1
  statuses[n.status] = (statuses[n.status] || 0) + 1
}
console.log(`\n   Factions :`, factions)
console.log(`   Statuts :`, statuses)
