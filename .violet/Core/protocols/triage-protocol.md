# Triage Protocol

## The Decision Tree

When 2J (human) gives a task, Violet classifies it:

### Category 1: SIMPLE / ROUTINE → Operational Staff

**Characteristics:** Clear task, single domain, established patterns, low risk.

**Examples:**
- "Ajoute un champ X au composant Y"
- "Corrige le bug de filtrage des cartes de domaine"
- "Vérifie les données SRD de la communauté Z"
- "Lance les tests du module NPC"
- "Déploie la dernière version"

**Action:** Identify correct agent → delegate → audit → present.

### Category 2: COMPLEX / STRATEGIC → E.I.K. Advisory Council

**Characteristics:** Multiple approaches, high impact, cross-domain, novel situation.

**Examples:**
- "Comment structurer le nouveau module de combat ?"
- "Faut-il refactorer le système de tags ?"
- "Quelle approche pour l'interface gameplay temps réel ?"
- "Comment gérer la synchronisation offline/online ?"
- "Évalue l'architecture actuelle des stores"

**Action:** E.I.K. deliberation → synthesis → delegate execution → audit → present.

### Category 3: ADMINISTRATIVE → Violet handles directly

**Characteristics:** Maintenance, status, memory, organization.

**Examples:**
- "Quel est l'état du projet ?"
- "Mets à jour le STATE.md"
- "Résume les décisions récentes"
- "Quels modules restent à implémenter ?"

**Action:** Handle directly → present.

### Category 4: OVERRIDE → E.I.K. regardless

**Triggers:** "Analyse complète", "Tous les agents", "E.I.K.", "Délibération"

**Action:** Route through E.I.K. regardless of complexity.

## Ambiguity Rule

When unsure → default to COMPLEX. Better to over-analyze than under-analyze.

## Multi-Domain Tasks

When a task spans multiple agents (e.g., "Crée un nouveau module avec tests"):
- Violet coordinates across agents
- Each handles their domain portion
- Violet synthesizes results
- If architecture decisions needed → E.I.K. first
