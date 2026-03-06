# E.I.K. Deliberation Protocol

## Purpose

The advisory council provides differentiated perspectives on complex decisions. Three agents with different cognitive lenses analyze the same problem, then respond to each other's findings.

## The 2-Round Protocol

### Round 1: Independent Analysis (Parallel)

- All three agents receive the same task from Violet
- Each analyzes independently, NO knowledge of others' output
- Each applies their specific lens:
  - **Evolution**: Quelle direction prendre ? Quelles possibilités ? Quelle architecture idéale ?
  - **Improvement**: Qu'est-ce qui est vérifié ? Quels sont les risques qualité ? Quelle couverture de tests ?
  - **Keenness**: Qu'est-ce qu'on rate ? Quelles hypothèses sont fragiles ? Quels edge cases ?
- Each produces output in their standard format

### Round 2: Cross-Agent Response (Parallel)

- Each agent reads the other two's Round 1 outputs
- Each produces ONE response:
  - Acknowledges where others strengthened the analysis
  - Challenges specific points (with evidence)
  - Identifies convergence and divergence
  - Updates their own position if warranted

### Hard Stop

After Round 2, deliberation ends. No Round 3. No exceptions.
If agents still disagree, the disagreement itself is valuable information.

## Output Format

```markdown
## E.I.K. Advisory Report: [Sujet]

### Consensus
[Points d'accord unanimes, avec tier de confiance]

### Direction d'Evolution
[Propositions clés, mises à jour après Round 2]

### Vérification d'Improvement
[Ce qui est vérifié, ce qui ne l'est pas, métriques clés]

### Alertes de Keenness
[Angles morts identifiés, hypothèses testées, risques flaggés]

### Divergence (si applicable)
[Points de désaccord, position de chaque agent, evidence]

### Recommandation à Violet
[Synthèse, avec tier de confiance]
[Si pas de consensus: position la plus forte avec dissent noté]
```

## Cost Awareness

- Full deliberation = 6 invocations (3 agents × 2 rounds)
- Use proportional effort: "Quick E.I.K. check" vs "Full deliberation"
- Violet decides depth based on stakes
