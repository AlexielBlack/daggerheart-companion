# Navigation Refactor — Phase 2 : Fonctionnalites

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completer le refactoring de navigation en unifiant SRD+homebrew dans le Compendium (badges, filtres, edition inline), en ajoutant le deep-linking, et en integrant les composants session dans les onglets Table.

**Architecture:** Les stores de donnees (adversaryStore, etc.) fusionnent deja SRD + homebrew via `allItems` computed. Phase 2 ajoute les elements UI manquants : badges source, filtre source, boutons edition/creation, mode edition inline dans le panneau detail, deep-linking via route params, et integration des composants session dans TableView.

**Tech Stack:** Vue 3 (Options API composants, Composition API stores), Vue Router 4, Pinia, Vitest

**Spec:** `docs/superpowers/specs/2026-03-19-navigation-refactor-design.md`

---

## Scope

| Feature | Description |
|---------|-------------|
| Badges source | Tag "CUSTOM" sur les items homebrew dans les listes |
| Filtre source | Toggle Tous/SRD/Custom dans chaque browser |
| Deep-linking | `/compendium/adversaires/:id` ouvre le detail |
| Edition inline | Bouton "Modifier" sur items custom, mode formulaire dans le panneau detail |
| Bouton Creer | "+ Creer un custom" dans chaque browser |
| Table session | PcGroupPanel, EncounterLauncher, EnvironmentLoader, NpcLoader, CombatResumeBanner integres |

---

## Constat important

Les stores de chaque browser **fusionnent deja** SRD + homebrew dans leur computed `allItems`. Exemple dans `adversaryStore.js` :

```javascript
const allItems = computed(() => [
  ...allAdversaries,
  ...homebrewStore.items.map((item) => ({ ...item, source: 'custom' }))
])
```

Les items homebrew ont `source: 'custom'`. Les items SRD n'ont pas de propriete `source` (ou `source: 'srd'`). La fusion est faite — il manque les elements UI.

---

## File Structure

### Files to CREATE

| File | Responsibility |
|------|---------------|
| `src/core/components/SourceBadge.vue` | Badge "CUSTOM" reutilisable, affiche si `source === 'custom'` |
| `src/core/components/SourceFilter.vue` | Toggle Tous/SRD/Custom reutilisable |
| `src/modules/session/views/TablePjsView.vue` | Wrapper PJs : PcGroupPanel + CharacterBuilder |
| `src/modules/session/views/TableRencontresView.vue` | Wrapper Rencontres : EncounterLauncher + EncounterBuilder |
| `src/modules/session/views/TablePnjsView.vue` | Wrapper PNJs : NpcLoader + NpcManager |
| `src/modules/session/views/TableCombatView.vue` | Wrapper Combat : CombatResumeBanner + EncounterLive |

### Files to MODIFY

| File | Changes |
|------|---------|
| `src/modules/adversaries/stores/adversaryStore.js` | Ajouter `sourceFilter` ref + logique de filtrage |
| `src/modules/environments/stores/environmentStore.js` | Idem |
| `src/modules/characters/stores/characterStore.js` | Ajouter DEUX refs : `classSourceFilter` et `ancestrySourceFilter` (ce store sert 2 browsers independants) |
| `src/modules/communities/stores/communityStore.js` | Ajouter sourceFilter — chercher le nom exact du computed filtre (pas forcement `allItems`) |
| `src/modules/domains/stores/domainStore.js` | Idem — chercher le computed filtre existant |
| `src/modules/equipment/stores/equipmentStore.js` | Ajouter sourceFilter a chacun des 5 computes filtres (filteredPrimaryWeapons, filteredSecondaryWeapons, filteredArmor, filteredLoot, filteredConsumables) |
| `src/modules/adversaries/views/AdversaryBrowser.vue` | SourceBadge, SourceFilter, deep-linking, edition inline |
| `src/modules/environments/views/EnvironmentBrowser.vue` | Idem |
| `src/modules/characters/views/ClassBrowser.vue` | Idem |
| `src/modules/characters/views/AncestryBrowser.vue` | Idem |
| `src/modules/communities/views/CommunityBrowser.vue` | Idem |
| `src/modules/domains/views/DomainBrowser.vue` | Idem |
| `src/modules/equipment/views/EquipmentBrowser.vue` | Idem |
| `src/modules/adversaries/components/AdversaryCard.vue` | Ajouter SourceBadge |
| `src/router/index.js` | Table children pointent vers les wrappers session |

---

## Task 1: Creer les composants SourceBadge et SourceFilter

**Files:**
- Create: `src/core/components/SourceBadge.vue`
- Create: `src/core/components/SourceFilter.vue`
- Create: `src/core/components/__tests__/SourceBadge.test.js`
- Create: `src/core/components/__tests__/SourceFilter.test.js`

- [ ] **Step 1: Ecrire le test SourceBadge**

```javascript
// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SourceBadge from '../SourceBadge.vue'

describe('SourceBadge', () => {
  it('affiche le badge pour source custom', () => {
    const wrapper = mount(SourceBadge, { props: { source: 'custom' } })
    expect(wrapper.text()).toContain('CUSTOM')
    expect(wrapper.find('.source-badge').exists()).toBe(true)
  })

  it('n\'affiche rien pour source srd ou absente', () => {
    const wrapper = mount(SourceBadge, { props: { source: 'srd' } })
    expect(wrapper.find('.source-badge').exists()).toBe(false)
  })

  it('n\'affiche rien sans prop source', () => {
    const wrapper = mount(SourceBadge, { props: {} })
    expect(wrapper.find('.source-badge').exists()).toBe(false)
  })
})
```

- [ ] **Step 2: Implementer SourceBadge**

```vue
<template>
  <span v-if="source === 'custom'" class="source-badge" aria-label="Contenu custom">
    CUSTOM
  </span>
</template>

<script>
export default {
  name: 'SourceBadge',
  props: {
    source: { type: String, default: '' }
  }
}
</script>

<style scoped>
.source-badge {
  display: inline-block;
  padding: 1px 6px;
  font-size: 0.65em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-surface, #1a1a2e);
  background: var(--color-hope, #f0c040);
  border-radius: var(--radius-sm, 4px);
  vertical-align: middle;
}
</style>
```

- [ ] **Step 3: Ecrire le test SourceFilter**

```javascript
// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SourceFilter from '../SourceFilter.vue'

describe('SourceFilter', () => {
  it('affiche 3 options : Tous, SRD, Custom', () => {
    const wrapper = mount(SourceFilter, { props: { modelValue: 'all' } })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)
    expect(buttons[0].text()).toBe('Tous')
    expect(buttons[1].text()).toBe('SRD')
    expect(buttons[2].text()).toBe('Custom')
  })

  it('emet update:modelValue au clic', async () => {
    const wrapper = mount(SourceFilter, { props: { modelValue: 'all' } })
    await wrapper.findAll('button')[2].trigger('click')
    expect(wrapper.emitted('update:modelValue')[0]).toEqual(['custom'])
  })

  it('marque le bouton actif', () => {
    const wrapper = mount(SourceFilter, { props: { modelValue: 'custom' } })
    const activeBtn = wrapper.findAll('button')[2]
    expect(activeBtn.classes()).toContain('source-filter__btn--active')
  })
})
```

- [ ] **Step 4: Implementer SourceFilter**

```vue
<template>
  <div class="source-filter" role="group" aria-label="Filtrer par source">
    <button
      v-for="option in options"
      :key="option.value"
      class="source-filter__btn"
      :class="{ 'source-filter__btn--active': modelValue === option.value }"
      :aria-pressed="modelValue === option.value"
      @click="$emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'SourceFilter',
  props: {
    modelValue: { type: String, default: 'all' }
  },
  emits: ['update:modelValue'],
  setup() {
    const options = [
      { value: 'all', label: 'Tous' },
      { value: 'srd', label: 'SRD' },
      { value: 'custom', label: 'Custom' }
    ]
    return { options }
  }
}
</script>

<style scoped>
.source-filter {
  display: inline-flex;
  gap: 2px;
  background: var(--color-surface-alt, rgba(255,255,255,0.05));
  border-radius: var(--radius-sm, 4px);
  padding: 2px;
}

.source-filter__btn {
  padding: 4px 10px;
  font-size: 0.8em;
  border: none;
  background: transparent;
  color: var(--color-text-secondary, #aaa);
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
  transition: all var(--transition-fast, 0.15s);
}

.source-filter__btn:hover {
  color: var(--color-text, #fff);
}

.source-filter__btn--active {
  background: var(--color-hope, #f0c040);
  color: var(--color-surface, #1a1a2e);
  font-weight: 600;
}
</style>
```

- [ ] **Step 5: Lancer les tests**

Run: `npx vitest run src/core/components/__tests__/SourceBadge.test.js src/core/components/__tests__/SourceFilter.test.js`

- [ ] **Step 6: Commit**

```bash
git add src/core/components/SourceBadge.vue src/core/components/SourceFilter.vue src/core/components/__tests__/SourceBadge.test.js src/core/components/__tests__/SourceFilter.test.js
git commit -m "feat(compendium): creer composants SourceBadge et SourceFilter"
```

---

## Task 2: Ajouter sourceFilter aux stores des browsers

Chaque store de browser a deja un `allItems` computed qui fusionne SRD + homebrew. On ajoute un ref `sourceFilter` ('all'|'srd'|'custom') et on l'integre dans le filtrage.

**Files:**
- Modify: `src/modules/adversaries/stores/adversaryStore.js`
- Modify: `src/modules/environments/stores/environmentStore.js`
- (Repeter le pattern pour les 5 autres stores : characterStore, communityStore, domainStore, equipmentStore — meme modification)

- [ ] **Step 1: Modifier adversaryStore.js — ajouter sourceFilter**

Dans le store, ajouter apres la ligne qui declare `searchQuery` :

```javascript
const sourceFilter = ref('all')
```

Dans le computed `filteredAdversaries` (ou equivalent), ajouter au debut du filtrage :

```javascript
// Filtre par source
if (sourceFilter.value === 'srd') {
  result = result.filter(a => a.source !== 'custom')
} else if (sourceFilter.value === 'custom') {
  result = result.filter(a => a.source === 'custom')
}
```

Exposer `sourceFilter` dans le return du store. Pas besoin d'un setter explicite car `v-model` ecrit directement sur la ref Pinia.

- [ ] **Step 2: Repeter pour les 6 autres stores**

Appliquer exactement le meme pattern a :
- `src/modules/environments/stores/environmentStore.js`
- `src/modules/characters/stores/characterStore.js` (utilise par ClassBrowser et AncestryBrowser — verifier si ces browsers ont leur propre store ou partagent)
- `src/modules/communities/stores/communityStore.js`
- `src/modules/domains/stores/domainStore.js`
- `src/modules/equipment/stores/equipmentStore.js`

**Attention aux particularites de chaque store :**
- `characterStore` : sert ClassBrowser ET AncestryBrowser — utiliser deux refs separees (`classSourceFilter`, `ancestrySourceFilter`) et les appliquer dans les computeds respectifs
- `equipmentStore` : a 5 listes separees (primary, secondary, armor, loot, consumable) — appliquer le filtre dans chacun des 5 computeds filtres
- `communityStore` et `domainStore` : peuvent nommer leur computed filtre differemment de `allItems` — lire le store pour trouver le nom exact
- Si un store ne fusionne pas encore SRD+homebrew, ajouter la fusion avec `source: 'custom'` sur les items homebrew

- [ ] **Step 3: Lancer les tests des stores**

Run: `npx vitest run src/modules/adversaries/ src/modules/environments/`

- [ ] **Step 4: Commit**

```bash
git add -u src/modules/
git commit -m "feat(stores): ajouter sourceFilter aux stores des browsers"
```

---

## Task 3: Integrer SourceBadge et SourceFilter dans AdversaryBrowser (pattern)

On modifie AdversaryBrowser comme modele. Les 6 autres browsers suivront le meme pattern dans la tache suivante.

**Files:**
- Modify: `src/modules/adversaries/views/AdversaryBrowser.vue`
- Modify: `src/modules/adversaries/components/AdversaryCard.vue`

- [ ] **Step 1: Ajouter SourceBadge dans AdversaryCard**

Lire `AdversaryCard.vue` et ajouter le badge a cote du nom de l'adversaire :

```vue
<SourceBadge :source="adversary.source" />
```

Importer le composant :

```javascript
import SourceBadge from '@core/components/SourceBadge.vue'
```

- [ ] **Step 2: Ajouter SourceFilter dans AdversaryBrowser**

Dans le template de AdversaryBrowser, ajouter le SourceFilter dans la zone des filtres (pres de AdversaryFilters) :

```vue
<SourceFilter v-model="store.sourceFilter" />
```

Importer :

```javascript
import SourceFilter from '@core/components/SourceFilter.vue'
```

- [ ] **Step 3: Ajouter boutons edition/creation dans AdversaryBrowser**

Dans la zone de filtres/toolbar, ajouter un bouton de creation :

```vue
<router-link to="/compendium/adversaires/new" class="adversary-browser__create-btn">
  + Creer un custom
</router-link>
```

Dans le panneau de detail, ajouter un bouton "Modifier" pour les items custom :

```vue
<button
  v-if="store.selectedAdversary?.source === 'custom'"
  class="adversary-browser__edit-btn"
  @click="editingInline = true"
>
  ✏️ Modifier
</button>
```

- [ ] **Step 4: Implementer le deep-linking**

Dans le setup du composant AdversaryBrowser, ajouter :

```javascript
import { useRoute, onBeforeRouteUpdate } from 'vue-router'

const route = useRoute()

// Deep-link : ouvrir l'item si :id present dans la route
function selectFromRoute(id) {
  if (!id) return
  if (id === 'new') {
    // Mode creation : ouvrir le formulaire vide
    editingInline.value = true
    creatingNew.value = true
    reset()
    return
  }
  store.selectAdversary(id)
}

onMounted(() => selectFromRoute(route.params.id))
onBeforeRouteUpdate((to) => selectFromRoute(to.params.id))
```

- [ ] **Step 5: Implementer l'edition inline dans le panneau detail**

Ajouter un mode edition dans le setup :

```javascript
const editingInline = ref(false)
const creatingNew = ref(false)
```

Dans le template, dans le panneau de detail, ajouter une condition pour basculer entre lecture et edition :

```vue
<!-- Mode lecture -->
<template v-if="!editingInline">
  <AdversaryFocusPanel :adversary="store.selectedAdversary" />
  <button v-if="store.selectedAdversary?.source === 'custom'" @click="editingInline = true">
    ✏️ Modifier
  </button>
</template>

<!-- Mode edition inline -->
<template v-else>
  <HomebrewForm
    :schema="adversarySchema"
    :form-data="formData"
    :is-dirty="isDirty"
    :errors="validationErrors"
    @submit="onSaveInline"
    @cancel="editingInline = false"
    @update:field="onFieldUpdate"
  />
</template>
```

Importer les composants et composables necessaires :

```javascript
import HomebrewForm from '@modules/homebrew/core/components/HomebrewForm.vue'
import { adversarySchema } from '@modules/homebrew/schemas/adversarySchema.js'
import { useFormSchema } from '@modules/homebrew/core/composables/useFormSchema.js'
import { useAdversaryHomebrewStore } from '@modules/homebrew/categories/adversary/useAdversaryHomebrewStore.js'
```

Dans le setup :

```javascript
const homebrewStore = useAdversaryHomebrewStore()
const { formData, isDirty, validationErrors, hydrate, setField, toRawData, reset } = useFormSchema(adversarySchema)

// Hydrater le formulaire quand on passe en mode edition
watch(editingInline, (editing) => {
  if (editing && store.selectedAdversary) {
    hydrate(store.selectedAdversary)
  }
})

function onFieldUpdate({ field, value }) {
  setField(field, value)
}

function onSaveInline() {
  const data = toRawData()
  if (creatingNew.value) {
    homebrewStore.create(data)
    creatingNew.value = false
  } else {
    homebrewStore.update(store.selectedAdversary.id, data)
  }
  editingInline.value = false
}
```

- [ ] **Step 6: Verifier le build et les tests**

Run: `npx vite build && npx vitest run src/modules/adversaries/`

- [ ] **Step 7: Commit**

```bash
git add src/modules/adversaries/ src/core/components/SourceBadge.vue
git commit -m "feat(compendium): badges source, filtre, deep-linking et edition inline dans AdversaryBrowser"
```

---

## Task 4: Appliquer le pattern aux 6 autres browsers

Repeter le pattern de Task 3 pour les 6 browsers restants. Pour chaque browser :
1. Ajouter SourceBadge dans le composant card/liste
2. Ajouter SourceFilter dans la vue browser
3. Ajouter le deep-linking (route.params.id)
4. Ajouter le bouton Creer
5. Ajouter le bouton Modifier + mode edition inline pour les items custom

**Files:**
- Modify: `src/modules/environments/views/EnvironmentBrowser.vue` + composants
- Modify: `src/modules/characters/views/ClassBrowser.vue` + composants
- Modify: `src/modules/characters/views/AncestryBrowser.vue` + composants
- Modify: `src/modules/communities/views/CommunityBrowser.vue` + composants
- Modify: `src/modules/domains/views/DomainBrowser.vue` + composants
- Modify: `src/modules/equipment/views/EquipmentBrowser.vue` + composants

- [ ] **Step 1: EnvironmentBrowser — meme pattern que AdversaryBrowser**

Fichiers concernes :
- `EnvironmentBrowser.vue` : SourceFilter, deep-linking, edition inline
- `EnvironmentCard.vue` (si existe) : SourceBadge
- Schema: `environmentSchema.js`
- Homebrew store: `useEnvironmentHomebrewStore`

- [ ] **Step 2: ClassBrowser**

Fichiers concernes :
- `ClassBrowser.vue` : SourceFilter, deep-linking, edition inline
- Schema: `classSchema.js`
- Homebrew store: `useClassHomebrewStore`

Note : verifier si ClassBrowser utilise `characterStore` ou un store dedie. Si pas de fusion SRD+homebrew dans le store, l'ajouter.

- [ ] **Step 3: AncestryBrowser**

Meme pattern. Schema: `ancestrySchema.js`, store: `useAncestryHomebrewStore`.

- [ ] **Step 4: CommunityBrowser**

Meme pattern. Schema: `communitySchema.js`, store: `useCommunityHomebrewStore`.

- [ ] **Step 5: DomainBrowser**

Meme pattern. Schema: `domainSchema.js`, store: `useDomainHomebrewStore`.

- [ ] **Step 6: EquipmentBrowser**

Meme pattern. Schema: `equipmentSchema.js`, store: `useEquipmentHomebrewStore`.

- [ ] **Step 7: Verifier build et tests**

Run: `npx vite build && npx vitest run src/modules/environments/ src/modules/characters/ src/modules/communities/ src/modules/domains/ src/modules/equipment/`

- [ ] **Step 8: Commit**

```bash
git add -u src/modules/
git commit -m "feat(compendium): badges source, filtre, deep-linking et edition inline dans tous les browsers"
```

---

## Task 5: Creer les vues wrapper pour les onglets Table

Les onglets Table rendent actuellement les vues brutes (CharacterBuilder, NpcManager, etc.). On cree des wrappers qui integrent les composants session au-dessus.

**Files:**
- Create: `src/modules/session/views/TablePjsView.vue`
- Create: `src/modules/session/views/TableRencontresView.vue`
- Create: `src/modules/session/views/TablePnjsView.vue`
- Create: `src/modules/session/views/TableCombatView.vue`

- [ ] **Step 1: Creer TablePjsView**

```vue
<!-- src/modules/session/views/TablePjsView.vue -->
<template>
  <div class="table-pjs-view">
    <PcGroupPanel :characters="characterStore.characters" />
    <CharacterBuilder />
  </div>
</template>

<script>
import PcGroupPanel from '../components/PcGroupPanel.vue'
import CharacterBuilder from '@modules/characters/views/CharacterBuilder.vue'
import { useCharacterStore } from '@modules/characters/stores/characterStore.js'

export default {
  name: 'TablePjsView',
  components: { PcGroupPanel, CharacterBuilder },
  setup() {
    const characterStore = useCharacterStore()
    return { characterStore }
  }
}
</script>
```

- [ ] **Step 2: Creer TableRencontresView**

```vue
<!-- src/modules/session/views/TableRencontresView.vue -->
<template>
  <div class="table-rencontres-view">
    <EncounterLauncher />
    <EnvironmentLoader />
    <EncounterBuilder />
  </div>
</template>

<script>
import EncounterLauncher from '../components/EncounterLauncher.vue'
import EnvironmentLoader from '../components/EnvironmentLoader.vue'
import EncounterBuilder from '@modules/encounter/views/EncounterBuilder.vue'

export default {
  name: 'TableRencontresView',
  components: { EncounterLauncher, EnvironmentLoader, EncounterBuilder }
}
</script>
```

- [ ] **Step 3: Creer TablePnjsView**

```vue
<!-- src/modules/session/views/TablePnjsView.vue -->
<template>
  <div class="table-pnjs-view">
    <NpcLoader />
    <NpcManager />
  </div>
</template>

<script>
import NpcLoader from '../components/NpcLoader.vue'
import NpcManager from '@modules/npcs/views/NpcManager.vue'

export default {
  name: 'TablePnjsView',
  components: { NpcLoader, NpcManager }
}
</script>
```

- [ ] **Step 4: Creer TableCombatView**

```vue
<!-- src/modules/session/views/TableCombatView.vue -->
<template>
  <div class="table-combat-view">
    <CombatResumeBanner />
    <EncounterLive />
  </div>
</template>

<script>
import CombatResumeBanner from '../components/CombatResumeBanner.vue'
import EncounterLive from '@modules/encounter/views/EncounterLive.vue'

export default {
  name: 'TableCombatView',
  components: { CombatResumeBanner, EncounterLive }
}
</script>
```

- [ ] **Step 5: Integrer SessionHistoryPanel dans TableRencontresView**

Ajouter `SessionHistoryPanel` dans `TableRencontresView.vue` apres EncounterBuilder :

```vue
<SessionHistoryPanel />
```

Import : `import SessionHistoryPanel from '../components/SessionHistoryPanel.vue'`

- [ ] **Step 6: Commit**

```bash
git add src/modules/session/views/
git commit -m "feat(table): creer vues wrapper integrant les composants session"
```

---

## Task 6: Mettre a jour le router pour les wrappers Table

**Files:**
- Modify: `src/router/index.js`

- [ ] **Step 1: Remplacer les imports Table dans le router**

Remplacer les imports directs par les wrappers session :

```javascript
// Avant
const CharacterBuilder = () => import('@modules/characters/views/CharacterBuilder.vue')
const NpcManager = () => import('@modules/npcs/views/NpcManager.vue')
const EncounterBuilder = () => import('@modules/encounter/views/EncounterBuilder.vue')
const EncounterLive = () => import('@modules/encounter/views/EncounterLive.vue')

// Apres
const TablePjsView = () => import('@modules/session/views/TablePjsView.vue')
const TablePnjsView = () => import('@modules/session/views/TablePnjsView.vue')
const TableRencontresView = () => import('@modules/session/views/TableRencontresView.vue')
const TableCombatView = () => import('@modules/session/views/TableCombatView.vue')
```

Mettre a jour les children de `/table` :

```javascript
children: [
  { path: 'pjs', name: 'table-pjs', component: TablePjsView, meta: { ... } },
  { path: 'pnjs', name: 'table-pnjs', component: TablePnjsView, meta: { ... } },
  { path: 'rencontres', name: 'table-rencontres', component: TableRencontresView, meta: { ... } },
  { path: 'combat', name: 'table-combat', component: TableCombatView, meta: { ... } },
  { path: 'des', name: 'table-des', component: DiceRoller, meta: { ... } }  // inchange
]
```

Note : DiceRoller reste directement route (pas de composant session a integrer).

- [ ] **Step 2: Verifier build et tests router**

Run: `npx vite build && npx vitest run src/router/`

- [ ] **Step 3: Commit**

```bash
git add src/router/index.js
git commit -m "feat(router): pointer les onglets Table vers les wrappers session"
```

---

## Task 7: Verification finale Phase 2

- [ ] **Step 1: Grep references obsoletes**

```bash
grep -rn "HomebrewAdversaryList\|HomebrewAdversaryEditor" src/router/ --include="*.js"
grep -rn "SessionHome" src/ --include="*.vue" --include="*.js"
```

- [ ] **Step 2: ESLint**

Run: `npx eslint src/ --ext .vue,.js`

- [ ] **Step 3: Build complet**

Run: `npx vite build`

- [ ] **Step 4: Tests complets**

Run: `npx vitest run`

- [ ] **Step 5: Test manuel**

Verifier dans le navigateur :
1. `/compendium/adversaires` — badge CUSTOM sur les items homebrew
2. Filtre source Tous/SRD/Custom fonctionne
3. `/compendium/adversaires/{id}` — deep-link ouvre le detail
4. Bouton "Modifier" sur un item custom → mode edition inline
5. Bouton "+ Creer" → formulaire vide dans le panneau
6. `/table/pjs` — PcGroupPanel affiche au-dessus du CharacterBuilder
7. `/table/rencontres` — EncounterLauncher + EnvironmentLoader integres
8. `/table/pnjs` — NpcLoader integre
9. `/table/combat` — CombatResumeBanner integre
10. `/table/des` — inchange

- [ ] **Step 6: Commit final**

```bash
git add -u
git commit -m "refactor(nav): finaliser Phase 2 du refactoring de navigation"
```
