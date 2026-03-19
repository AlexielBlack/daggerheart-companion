# Session Inventory Editor — Design Spec

**Date:** 2026-03-19
**Contexte:** Permettre l'édition de l'inventaire des personnages directement dans la vue Session > Personnages, sans naviguer vers l'éditeur de personnage complet.

## Emplacement

Onglet **Inventaire** existant de chaque personnage dans `PcGroupPanel.vue` (vue Session > Personnages).

## Nouveau composant

`src/modules/session/components/PcInventoryEditor.vue` — version session allégée de `InventoryPanel.vue`.

### Props

```javascript
props: {
  inventory: Array,    // tableau de slots d'inventaire du personnage
  gold: Object,        // { handfuls, bags, chests }
  characterId: String  // ID du personnage pour les actions du store
}
```

### Events émis

Aucun — le composant appelle directement les méthodes du `characterStore` via l'ID du personnage.

## Fonctionnalités

### Gold tracker

- 3 champs (handfuls / bags / chests) avec boutons +/-
- Réutilise la même logique que `InventoryPanel.vue`

### Liste d'items

Chaque item dans l'inventaire affiche :
- Nom résolu (item SRD via lookup ou nom custom)
- Quantité avec +/- inline (si consommable)
- Nom éditable via champ texte inline (si type custom)
- Bouton ✕ avec confirmation temporaire : au clic, le bouton passe en rouge "Confirmer ?" pendant ~3 secondes, puis revient à l'état normal si non confirmé

### Modification inline

Chaque item permet de modifier :
- **Type** — dropdown : loot, consommable, arme primaire, arme secondaire, armure, libre
- **Item SRD** — select simple filtré par type sélectionné (si type !== custom)
- **Nom** — champ texte libre (si type === custom)
- **Quantité** — input numérique avec +/- (si type === consommable)

Quand le type change, l'itemId est réinitialisé.

### Ajout d'item

Un bouton "+ Ajouter" en bas de la liste ouvre un formulaire inline :
1. Select du type (loot/consommable/arme 1re/arme 2de/armure/libre)
2. Select de l'item SRD ou champ texte (selon le type choisi)
3. Bouton "Ajouter" pour confirmer l'ajout

Le formulaire se referme après l'ajout.

## Données et store

Réutilise directement les méthodes existantes du `characterStore` :
- `addInventoryItem(type)`
- `removeInventoryItem(index)`
- `updateInventoryItem(index, field, value)`
- `updateGold(tier, value)`

Les données d'équipement SRD sont importées depuis `@data/equipment` :
- `primaryWeapons`, `secondaryWeapons`, `armor`, `loot`, `consumables`

Le composant doit temporairement sélectionner le personnage dans le store (via `selectCharacter(id)`) pour utiliser ces méthodes, puis restaurer la sélection précédente si nécessaire. Alternative : passer l'index du personnage et appeler les actions directement sur l'objet.

## Intégration dans PcGroupPanel

Dans l'onglet Inventaire existant (actuellement en lecture seule), remplacer l'affichage lecture seule par `<PcInventoryEditor>`.

## Exclusions explicites

- Pas de recommandations par classe (réservé à l'éditeur complet)
- Pas de descriptions complètes des items SRD
- Pas de badges de rareté/tier
- Pas de migration d'inventaire (déjà gérée dans le store)

## Fichiers impactés

| Fichier | Modification |
|---------|-------------|
| `src/modules/session/components/PcInventoryEditor.vue` | Nouveau composant |
| `src/modules/session/components/PcGroupPanel.vue` | Import + utilisation du nouveau composant dans l'onglet Inventaire |
