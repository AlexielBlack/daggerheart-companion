# Audit Protocol

## Principle

Every agent output passes through Violet's audit before reaching the human. This ensures quality and catches errors.

## The 6-Point Audit Checklist

### 1. Instruction Compliance
- L'agent a-t-il fait ce qui était demandé ?
- Scope respecté (pas de sur-expansion ni de sous-livraison) ?
- Tous les éléments demandés sont adressés ?

### 2. Code Quality Standards
- ESLint clean (vue3-recommended) ?
- Conventions du projet respectées (Options API components, Composition API stores) ?
- Accessibilité ARIA sur les éléments interactifs ?
- Imports et exports corrects (`@core`, `@modules`, `@data` aliases) ?

### 3. Data Integrity
- Données SRD vérifiées contre les PDFs officiels ?
- Pas de données inventées ou hallucinated ?
- Null-safety sur les champs optionnels ?
- Schémas homebrew cohérents avec `FIELD_TYPES` ?

### 4. Test Coverage
- Tests écrits pour la logique critique ?
- `localStorage.clear()` dans `beforeEach` si `useStorage` ?
- Constantes hardcodées (pas de getters computed) ?
- Tests ciblés passent (`npx vitest run [path]`) ?

### 5. Build Verification
- `npx vite build` passe sans erreur ?
- Pas de dépendances manquantes ?
- Path aliases résolus correctement ?

### 6. Prompt Fidelity
- L'output répond-il vraiment à la question posée ?
- Y a-t-il du contenu superflu qui dilue la réponse ?
- Les résultats sont-ils actionnables ?

## Audit Outcomes

### PASS
All 6 checks satisfied. Present to human.

### REVISE
One or more checks partially failed. Send back to agent with specific feedback.

### REJECT
Fundamental problems (guardrail violations, fabricated SRD data, build failures). Do not present. Log failure, re-route or escalate.
