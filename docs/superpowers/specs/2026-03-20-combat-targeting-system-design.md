# Système de ciblage combat — Design Spec

**Date :** 2026-03-20
**Statut :** Approuvé (brainstorming)

## Contexte

Le système de combat actuel gère dégâts, conditions, undo et logging, mais souffre de deux problèmes :
- **AoE laborieux** : appliquer des effets multi-cibles se fait un par un
- **Pas de flux unifié** : pas de workflow action→cible→effet — tout est morcelé

## Décision

**Approche C — Bandeau flottant (Action Bar)** : un bandeau fixé en bas de l'écran qui guide le flux Acteur→Effet→Cibles→Montant→Confirmer sans masquer l'interface existante.

Les boutons +/- rapides existants dans les sidebars sont conservés comme raccourci hors bandeau.

## Flux d'interaction

```
1. DÉCLENCHER  →  Bouton "⚡ Action" dans le ContextPanel
2. EFFET       →  Le bandeau apparaît, choix du type d'effet
3. CIBLER      →  Tous les combattants deviennent cliquables (bordure colorée)
                   Clic = ajouter/retirer de la liste des cibles
                   Raccourcis : "Self", "Tous PJ", "Tous Adv.", "Global"
4. MONTANT     →  Boutons rapides (1, 2, 3, 5, 10, custom) pour toutes les cibles
                   Champ éditable par cible pour montant différencié (AoE)
5. CONFIRMER   →  "✓ Appliquer" → applique, log, undo stack → bandeau se ferme
```

**Annulation :** Bouton "Annuler" ou `Escape`. Ctrl+Z après application pour undo (adversaires uniquement — voir Limitations v1).

## Types d'effets

| Effet | Clé | Cibles valides | Montant |
|-------|-----|---------------|---------|
| Dégâts HP | `damage_hp` | Adversaires, PJ | Numérique |
| Dégâts Stress | `damage_stress` | Adversaires, PJ | Numérique |
| Soin HP | `heal_hp` | PJ, Adversaires | Numérique |
| Soin Stress | `heal_stress` | PJ, Adversaires | Numérique |
| Condition | `condition` | Adversaires, PJ | Sous-sélection condition |
| Espoir | `hope` | PJ (individuel) | Numérique (défaut 1) |
| À Terre | `down` | PJ, Adversaires | Toggle : `defeatAdversary`/`reviveAdversary` ou `pcDownStatus` |
| Raté | `miss` | Aucune — saute directement à Confirmer | Log direct |

## Catégories de cibles

| Raccourci | Comportement |
|-----------|-------------|
| Self | Sélectionne l'acteur spotlight |
| Tous PJ | Tous les PJ actifs (non à terre) |
| Tous Adv. | Tous les adversaires actifs (non vaincus) |
| Global | Pas de cible individuelle → effet Fear/Hope ou narratif |

**Sélection :** Clic multiple sur les combattants. Re-clic pour retirer. Les vaincus/à terre sont grisés mais restent cliquables (soins/revive). Pas de restriction stricte — le GM sait ce qu'il fait.

## Structure du bandeau

3 états visuels progressifs :

**État 1 — Sélection d'effet :** Rangée de boutons d'effet uniquement.

**État 2 — Sélection de cibles :** Effet choisi visible, rangée de raccourcis cibles, message "Sélectionnez des cibles".

**État 3 — Montant et confirmation :** Chips de cibles avec montant individuel éditable, boutons rapides de montant, bouton "✓ Appliquer".

**Cas Condition :** Rangée supplémentaire avec les conditions disponibles sous forme de toggles. La liste provient de `liveConstants.js` (actuellement : hidden, restrained, vulnerable, temporary) et est extensible.

**Cas Raté :** Sélectionner "Raté" saute directement à l'état Confirmer (pas de cibles ni de montant). Le bouton devient "✓ Logger le raté".

**Cas Espoir :** Sélectionner "Espoir" suit le flux normal de ciblage — on sélectionne un ou plusieurs PJ pour leur ajouter/retirer de l'Espoir (ressource individuelle per-PJ). La Fear est globale (gérée par le MJ via le CombatDashboard), elle n'apparaît pas dans le bandeau.

## Modèle de données

### État réactif (encounterLiveStore)

```js
pendingAction: {
  actorId: 'kael_1',
  actorType: 'pc' | 'adversary',
  effect: 'damage_hp',       // ACTION_EFFECTS enum
  condition: null,            // si effect === 'condition'
  targets: [
    { id: 'goblin_0', type: 'adversary', amount: 3 },
    { id: 'troll_0',  type: 'adversary', amount: 3 }
  ],
  defaultAmount: 3
}
```

**Transient** — pas persisté dans localStorage. Rechargement = bandeau fermé.

### Enum des effets

```js
ACTION_EFFECTS = {
  DAMAGE_HP: 'damage_hp',
  DAMAGE_STRESS: 'damage_stress',
  HEAL_HP: 'heal_hp',
  HEAL_STRESS: 'heal_stress',
  CONDITION: 'condition',
  HOPE: 'hope',
  DOWN: 'down',
  MISS: 'miss'
}
```

### Actions store

| Action | Rôle |
|--------|------|
| `openAction()` | Initialise pendingAction avec l'acteur spotlight |
| `setEffect(effect)` | Change l'effet, reset cibles si catégorie change |
| `toggleTarget(id, type)` | Ajoute/retire une cible |
| `selectAllPcs()` | Raccourci "Tous PJ" |
| `selectAllAdversaries()` | Raccourci "Tous Adv." |
| `selectSelf()` | Raccourci "Self" |
| `setDefaultAmount(n)` | Montant par défaut pour toutes les cibles |
| `setTargetAmount(id, n)` | Override montant d'une cible spécifique |
| `applyAction()` | Résout l'action → dispatch vers fonctions existantes |
| `cancelAction()` | Reset pendingAction à null |

### Dispatch de applyAction()

Un seul `pushUndo()` avant la boucle d'application, quel que soit le nombre de cibles.

**Important :** Les fonctions existantes (`markAdversaryHP`, `clearAdversaryHP`, etc.) appellent `pushUndo()` en interne. Pour éviter des snapshots multiples, `applyAction()` doit appeler des variantes internes sans undo. Approche retenue : ajouter un paramètre `{ skipUndo: true }` aux fonctions existantes. Quand ce flag est passé, la fonction applique la mutation sans appeler `pushUndo()`. `applyAction()` fait un seul `pushUndo()` en amont puis passe `{ skipUndo: true }` à chaque appel.

```
damage_hp     → si 1 cible adversaire : markAdversaryHP(id, amount)
                si N cibles adversaires : applyAoeDamagePerTarget({ id: amount, ... })
                si cibles PJ : patchCharacterById(id, { currentHP: currentHP - amount }) par cible
damage_stress → markAdversaryStress(id, amount) par cible adversaire
                patchCharacterById(id, { currentStress: currentStress - amount }) par cible PJ
heal_hp       → clearAdversaryHP(id, amount) par cible adversaire (réduit markedHP du montant)
                patchCharacterById(id, { currentHP: min(currentHP + amount, maxHP) }) par cible PJ
heal_stress   → clearAdversaryStress(id, amount) par cible adversaire
                patchCharacterById(id, { currentStress: min(currentStress + amount, maxStress) }) par cible PJ
condition     → toggleAdversaryCondition(id, condition) / togglePcCondition(id, condition)
hope          → patchCharacterById(id, { hope: hope + amount }) par cible PJ (ajout)
                patchCharacterById(id, { hope: max(hope - amount, 0) }) par cible PJ (retrait)
down          → adversaire : defeatAdversary(id) si actif, reviveAdversary(id) si vaincu
                PJ : toggle pcDownStatus[id]
miss          → log direct, pas de dispatch
```

### Limitations v1 — Undo

L'undo stack (`useUndoStack`) snapshot l'état adversaire et le combat log, mais **pas** l'état PJ (characterStore). En v1 :
- **Effets sur adversaires** : entièrement undoable via Ctrl+Z
- **Effets sur PJ** (HP, Stress via characterStore) : **pas undoable** — le bandeau affiche un indicateur visuel "(non annulable)" sur les cibles PJ
- **Conditions PJ, pcDownStatus** : undoable (snapshotés dans l'undo stack)
- **Fear/Hope** : pas undoable (pool séparé)

Extension future : étendre l'undo stack pour inclure un snapshot partiel du characterStore.

## Composable et composant

### useActionBar.js

```
src/modules/encounter/composables/useActionBar.js
```

- Consomme `pendingAction` depuis le store (ref dans encounterLiveStore)
- Computed dérivés : `isOpen`, `hasTargets`, `canApply`
- Computed : `validTargets`, `isTargetSelected(id)`, `summary`
- Méthodes : proxy vers actions store

### ActionBar.vue

```
src/modules/encounter/components/ActionBar.vue
```

- Rendu conditionnel (pendingAction !== null)
- Position fixed bas, z-index au-dessus du BottomDrawer
- 3 zones : effets, cibles, montant+confirmer
- Transition slide-up
- Communique via store uniquement

### Modifications aux composants existants

| Composant | Modification |
|-----------|-------------|
| `PcSidebarCard.vue` | `@click` conditionnel → `toggleTarget(pc.id, 'pc')`, style bordure sélection |
| `AdversaryTargetPanel.vue` | `@click` conditionnel → `toggleTarget(instanceId, 'adversary')`, style bordure |
| `ContextPanel.vue` | Bouton "⚡ Action" qui appelle `openAction()` |
| `EncounterLive.vue` | Monter `<ActionBar />`, padding-bottom dynamique |

### Pas de modification

`CombatDashboard`, `QuickReferencePanel`, `BottomDrawer` — indépendants. Boutons +/- rapides existants conservés.

## Combat log

### Nouveaux champs

```js
{
  actionId: 'act_1710936000_1',  // groupement
  actorId: 'kael_1',             // qui a agi
  actorName: 'Kael',
  // ... champs existants
}
```

### Nouveaux types

| Type | Quand |
|------|-------|
| `heal_hp` | Soin HP appliqué |
| `heal_stress` | Soin Stress appliqué |
| `condition_add` | Condition appliquée |
| `condition_remove` | Condition retirée |
| `hope_change` | Espoir modifié |
| `down` | Mis à terre |

### Groupement dans CombatLogDrawer

Entrées avec même `actionId` affichées groupées (bordure gauche, indent) :

```
⚔️ Kael — Tourbillon
  ├ Gobelin B : 3 Dég. HP → 💀 Vaincu
  └ Troll : 3 Dég. HP (6/10)
```

**Undo :** Rollback par snapshot complet (existant). Un Ctrl+Z annule toutes les entrées du groupe.

**Rétrocompatibilité :** Entrées sans actionId (boutons +/- rapides) affichées normalement, non groupées.

## Mobile

- Bandeau occupe ~40% hauteur en portrait — temporaire (durée de l'action)
- Rangée d'effets en scroll horizontal (flex nowrap + overflow-x auto)
- Chips de cibles wrap sur plusieurs lignes
- Bouton "⚡ Action" : min 44×44px tap target
- Zone de tap élargie sur combattants en mode ciblage

## Accessibilité ARIA

| Élément | ARIA |
|---------|------|
| Bandeau | `role="dialog"`, `aria-label="Action en cours"`, `aria-modal="false"` |
| Boutons d'effet | `role="radiogroup"` + `role="radio"` + `aria-checked` |
| Sous-sélection condition | `role="radiogroup"` idem |
| Combattants cliquables | `aria-pressed`, `aria-label="Sélectionner [Nom] comme cible"` |
| Chips de cibles | `role="list"` + `role="listitem"`, ✕ avec `aria-label="Retirer [Nom]"` |
| Champ montant | `aria-label="Montant pour [Nom]"`, `type="number"`, `min="1"` |
| Bouton Appliquer | `aria-disabled` si aucune cible |
| Bouton Annuler | Toujours accessible |

## Clavier

- `Escape` → ferme le bandeau
- `Enter` → applique l'action (si valide)
- Tab navigation standard
- Focus automatique sur le premier bouton d'effet à l'ouverture du bandeau

### Génération actionId

Format : `act_{timestamp}_{compteur}` où le compteur est un entier incrémenté par session (reset au rechargement). Exemple : `act_1710936000_1`, `act_1710936000_2`. Généré dans `applyAction()` avant le dispatch.
