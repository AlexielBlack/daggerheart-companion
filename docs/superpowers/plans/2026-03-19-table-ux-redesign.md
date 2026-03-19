# Table UX Redesign — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réorganiser la section Table en 4 onglets workflow (Scène, Combat, Dés, Préparation) avec un drawer latéral partagé, des notes de scène, et un générateur de rencontres contextuel.

**Architecture:** Les composants session existants (EnvironmentLoader, NpcLoader, PcGroupPanel, EncounterLauncher) sont réassemblés dans une nouvelle SceneView. Un SceneDrawer partagé (dialog modale latérale) affiche 3 modes de contenu (fiche PNJ, fiche PJ rapide, catalogue PNJ). Un onglet Préparation regroupe les builders existants sous une sous-navigation. Le générateur de rencontres est un composable pur consommant les stores existants.

**Tech Stack:** Vue 3 (Options API composants, Composition API stores/composables), Pinia, Vue Router, Vitest

**Spec:** `docs/superpowers/specs/2026-03-19-table-ux-redesign-design.md`

---

## Structure de fichiers

### Fichiers à créer

| Fichier | Responsabilité |
|---------|---------------|
| `src/modules/session/composables/useSceneDrawer.js` | État partagé du drawer (mode, id, ouvert/fermé) |
| `src/modules/session/components/SceneDrawer.vue` | Panneau latéral dialog avec 3 modes |
| `src/modules/session/components/NpcPreviewSheet.vue` | Fiche PNJ lecture seule (drawer mode 1) |
| `src/modules/session/components/PcQuickSheet.vue` | Fiche PJ rapide stats+capacités (drawer mode 2) |
| `src/modules/session/components/SessionNotes.vue` | Textarea notes de scène avec auto-save |
| `src/modules/session/components/EncounterGenerator.vue` | UI formulaire générateur dans le drawer |
| `src/modules/session/views/SceneView.vue` | Vue principale onglet Scène |
| `src/modules/session/views/PrepView.vue` | Vue conteneur onglet Préparation avec sous-tabs |
| `src/modules/encounter/composables/useEncounterGenerator.js` | Logique pure de génération de rencontre |
| `src/modules/session/composables/__tests__/useSceneDrawer.test.js` | Tests useSceneDrawer |
| `src/modules/session/components/__tests__/SessionNotes.test.js` | Tests SessionNotes |
| `src/modules/encounter/composables/__tests__/useEncounterGenerator.test.js` | Tests générateur |

### Fichiers à modifier

| Fichier | Modification |
|---------|-------------|
| `src/router/index.js` | Nouvelles routes scene/prep, redirections legacy |
| `src/core/components/TableView.vue` | 4 onglets au lieu de 5 |
| `src/modules/session/index.js` | Exporter nouveaux composants + composable |
| `src/modules/session/components/NpcLoader.vue` | Émettre `@select-npc`, corriger router-link |
| `src/modules/session/components/PcGroupPanel.vue` | Émettre `@select-pc`, corriger router-links |
| `src/modules/session/components/EncounterLauncher.vue` | Ajout bouton Générer, corriger router-links |
| `src/modules/session/views/TableCombatView.vue` | Ajout SceneDrawer + lien retour Scène |

### Fichiers à supprimer

| Fichier | Raison |
|---------|--------|
| `src/modules/session/views/TablePjsView.vue` | Remplacé par SceneView + PrepView |
| `src/modules/session/views/TablePnjsView.vue` | Remplacé par SceneView + PrepView |
| `src/modules/session/views/TableRencontresView.vue` | Remplacé par SceneView + PrepView |

---

## Task 1 : useSceneDrawer — composable d'état du drawer

**Files:**
- Create: `src/modules/session/composables/useSceneDrawer.js`
- Test: `src/modules/session/composables/__tests__/useSceneDrawer.test.js`

- [ ] **Step 1: Écrire les tests du composable**

```javascript
// src/modules/session/composables/__tests__/useSceneDrawer.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useSceneDrawer', () => {
  let drawer, useSceneDrawer

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('../useSceneDrawer')
    useSceneDrawer = mod.useSceneDrawer
    drawer = useSceneDrawer()
  })

  it('demarre ferme', () => {
    expect(drawer.isOpen.value).toBe(false)
    expect(drawer.mode.value).toBe(null)
    expect(drawer.targetId.value).toBe(null)
  })

  it('ouvre en mode npc avec un id', () => {
    drawer.openNpc('npc-1')
    expect(drawer.isOpen.value).toBe(true)
    expect(drawer.mode.value).toBe('npc')
    expect(drawer.targetId.value).toBe('npc-1')
  })

  it('ouvre en mode pc avec un id', () => {
    drawer.openPc('pc-1')
    expect(drawer.isOpen.value).toBe(true)
    expect(drawer.mode.value).toBe('pc')
    expect(drawer.targetId.value).toBe('pc-1')
  })

  it('ouvre en mode catalogue', () => {
    drawer.openCatalogue()
    expect(drawer.isOpen.value).toBe(true)
    expect(drawer.mode.value).toBe('catalogue')
    expect(drawer.targetId.value).toBe(null)
  })

  it('ouvre en mode generator', () => {
    drawer.openGenerator()
    expect(drawer.isOpen.value).toBe(true)
    expect(drawer.mode.value).toBe('generator')
    expect(drawer.targetId.value).toBe(null)
  })

  it('ferme et reinitialise', () => {
    drawer.openNpc('npc-1')
    drawer.close()
    expect(drawer.isOpen.value).toBe(false)
    expect(drawer.mode.value).toBe(null)
    expect(drawer.targetId.value).toBe(null)
  })

  it('change de cible sans fermer', () => {
    drawer.openNpc('npc-1')
    drawer.openNpc('npc-2')
    expect(drawer.isOpen.value).toBe(true)
    expect(drawer.targetId.value).toBe('npc-2')
  })

  it('change de mode sans fermer', () => {
    drawer.openNpc('npc-1')
    drawer.openCatalogue()
    expect(drawer.isOpen.value).toBe(true)
    expect(drawer.mode.value).toBe('catalogue')
    expect(drawer.targetId.value).toBe(null)
  })
})
```

- [ ] **Step 2: Vérifier que les tests échouent**

Run: `npx vitest run src/modules/session/composables/__tests__/useSceneDrawer.test.js`
Expected: FAIL — module introuvable

- [ ] **Step 3: Implémenter le composable**

```javascript
// src/modules/session/composables/useSceneDrawer.js
import { ref } from 'vue'

/**
 * État partagé du drawer latéral de la Scène.
 * Singleton — le même état est partagé entre SceneView et TableCombatView.
 *
 * Modes : 'npc' | 'pc' | 'catalogue' | 'generator'
 */
const isOpen = ref(false)
const mode = ref(null)
const targetId = ref(null)

export function useSceneDrawer() {
  function openNpc(id) {
    mode.value = 'npc'
    targetId.value = id
    isOpen.value = true
  }

  function openPc(id) {
    mode.value = 'pc'
    targetId.value = id
    isOpen.value = true
  }

  function openCatalogue() {
    mode.value = 'catalogue'
    targetId.value = null
    isOpen.value = true
  }

  function openGenerator() {
    mode.value = 'generator'
    targetId.value = null
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
    mode.value = null
    targetId.value = null
  }

  return { isOpen, mode, targetId, openNpc, openPc, openCatalogue, openGenerator, close }
}
```

- [ ] **Step 4: Vérifier que les tests passent**

Run: `npx vitest run src/modules/session/composables/__tests__/useSceneDrawer.test.js`
Expected: 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/session/composables/useSceneDrawer.js src/modules/session/composables/__tests__/useSceneDrawer.test.js
git commit -m "feat(session): composable useSceneDrawer — etat partage du drawer lateral"
```

---

## Task 2 : SessionNotes — composant notes de scène

**Files:**
- Create: `src/modules/session/components/SessionNotes.vue`
- Test: `src/modules/session/components/__tests__/SessionNotes.test.js`

- [ ] **Step 1: Écrire les tests du composant**

```javascript
// src/modules/session/components/__tests__/SessionNotes.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import SessionNotes from '../SessionNotes.vue'

describe('SessionNotes', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('affiche un textarea', () => {
    const wrapper = mount(SessionNotes)
    expect(wrapper.find('textarea').exists()).toBe(true)
  })

  it('affiche le placeholder', () => {
    const wrapper = mount(SessionNotes)
    expect(wrapper.find('textarea').attributes('placeholder')).toContain('Quêtes')
  })

  it('demarre en mode compact', () => {
    const wrapper = mount(SessionNotes)
    expect(wrapper.find('.session-notes--expanded').exists()).toBe(false)
  })

  it('bascule en mode etendu au clic sur le bouton', async () => {
    const wrapper = mount(SessionNotes)
    await wrapper.find('[aria-label="Agrandir les notes"]').trigger('click')
    expect(wrapper.find('.session-notes--expanded').exists()).toBe(true)
  })

  it('a un label accessible', () => {
    const wrapper = mount(SessionNotes)
    const textarea = wrapper.find('textarea')
    const id = textarea.attributes('id')
    expect(id).toBeTruthy()
    const label = wrapper.find(`label[for="${id}"]`)
    expect(label.exists()).toBe(true)
  })
})
```

- [ ] **Step 2: Vérifier que les tests échouent**

Run: `npx vitest run src/modules/session/components/__tests__/SessionNotes.test.js`
Expected: FAIL

- [ ] **Step 3: Implémenter le composant**

```vue
<!-- src/modules/session/components/SessionNotes.vue -->
<template>
  <section
    class="session-notes"
    :class="{ 'session-notes--expanded': expanded }"
  >
    <div class="session-notes__header">
      <label
        :for="textareaId"
        class="session-notes__label"
      >
        Notes de scene
      </label>
      <button
        :aria-label="expanded ? 'Reduire les notes' : 'Agrandir les notes'"
        :aria-expanded="expanded"
        class="session-notes__toggle"
        @click="expanded = !expanded"
      >
        {{ expanded ? '\u25BC' : '\u25B6' }}
      </button>
    </div>
    <textarea
      :id="textareaId"
      :value="sessionStore.sessionNotes"
      class="session-notes__textarea"
      placeholder="Quêtes, secrets, rappels..."
      @input="onInput"
    />
  </section>
</template>

<script>
import { ref } from 'vue'
import { useSessionStore } from '../stores/sessionStore'

export default {
  name: 'SessionNotes',
  setup() {
    const sessionStore = useSessionStore()
    const expanded = ref(false)
    const textareaId = `session-notes-${Math.random().toString(36).slice(2, 8)}`
    let debounceTimer = null

    function onInput(event) {
      clearTimeout(debounceTimer)
      const text = event.target.value
      debounceTimer = setTimeout(() => {
        sessionStore.setSessionNotes(text)
      }, 500)
    }

    return { sessionStore, expanded, textareaId, onInput }
  }
}
</script>

<style scoped>
.session-notes__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-xs, 0.25rem);
}

.session-notes__label {
  margin: 0;
  font-size: 0.95em;
  font-weight: 600;
  color: var(--color-text-secondary, #aaa);
}

.session-notes__toggle {
  background: none;
  border: none;
  color: var(--color-text-secondary, #aaa);
  cursor: pointer;
  padding: var(--space-xs, 0.25rem);
  font-size: 0.9em;
}

.session-notes__textarea {
  width: 100%;
  min-height: 4lh;
  max-height: 4lh;
  resize: none;
  background: var(--color-surface, #1a1a2e);
  color: var(--color-text, #fff);
  border: 1px solid var(--color-border, rgba(255,255,255,0.1));
  border-radius: var(--radius-sm, 4px);
  padding: var(--space-sm, 0.5rem);
  font-family: inherit;
  font-size: 0.9em;
  transition: max-height var(--transition-fast, 0.15s);
}

.session-notes--expanded .session-notes__textarea {
  min-height: 12lh;
  max-height: 12lh;
}
</style>
```

- [ ] **Step 4: Vérifier que les tests passent**

Run: `npx vitest run src/modules/session/components/__tests__/SessionNotes.test.js`
Expected: 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/session/components/SessionNotes.vue src/modules/session/components/__tests__/SessionNotes.test.js
git commit -m "feat(session): composant SessionNotes — textarea notes de scene avec auto-save"
```

---

## Task 3 : NpcPreviewSheet — fiche PNJ lecture seule

**Files:**
- Create: `src/modules/session/components/NpcPreviewSheet.vue`

Ce composant est purement présentationnel (pas de logique complexe à tester unitairement — les données viennent du store NPC existant).

- [ ] **Step 1: Implémenter le composant**

```vue
<!-- src/modules/session/components/NpcPreviewSheet.vue -->
<template>
  <article
    v-if="npc"
    class="npc-preview"
  >
    <header class="npc-preview__header">
      <h3>{{ npc.name }}</h3>
      <span
        v-if="npc.title"
        class="npc-preview__title"
      >{{ npc.title }}</span>
      <span
        class="npc-preview__status"
        :class="`npc-preview__status--${npc.status || 'neutral'}`"
      >{{ statusLabel }}</span>
    </header>

    <dl class="npc-preview__details">
      <template v-if="npc.faction">
        <dt>Faction</dt>
        <dd>{{ npc.faction }}</dd>
      </template>
      <template v-if="npc.location">
        <dt>Lieu</dt>
        <dd>{{ npc.location }}</dd>
      </template>
    </dl>

    <p
      v-if="npc.description"
      class="npc-preview__desc"
    >
      {{ npc.description }}
    </p>

    <section v-if="npc.relations && npc.relations.length">
      <h4>Relations PJ</h4>
      <ul class="npc-preview__relations">
        <li
          v-for="rel in npc.relations"
          :key="rel.characterId"
        >
          {{ rel.characterName }} — {{ rel.description }}
        </li>
      </ul>
    </section>

    <section v-if="npc.combatProfile">
      <h4>Profil combat</h4>
      <p>{{ npc.combatProfile }}</p>
    </section>

    <router-link
      :to="`/table/prep/pnjs`"
      class="npc-preview__edit"
    >
      Editer
    </router-link>
  </article>
  <p v-else>
    PNJ introuvable.
  </p>
</template>

<script>
import { computed } from 'vue'
import { useNpcStore } from '@modules/npcs'

const STATUS_LABELS = {
  ally: 'Allie',
  neutral: 'Neutre',
  hostile: 'Hostile',
  dead: 'Mort',
  missing: 'Disparu'
}

export default {
  name: 'NpcPreviewSheet',
  props: {
    npcId: { type: String, required: true }
  },
  setup(props) {
    const npcStore = useNpcStore()
    const npc = computed(() => npcStore.getById(props.npcId))
    const statusLabel = computed(() => STATUS_LABELS[npc.value?.status] || 'Neutre')
    return { npc, statusLabel }
  }
}
</script>

<style scoped>
.npc-preview__header { margin-bottom: var(--space-md, 1rem); }
.npc-preview__header h3 { margin: 0; }
.npc-preview__title { color: var(--color-text-secondary, #aaa); font-style: italic; }
.npc-preview__status { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 0.8em; margin-top: var(--space-xs, 0.25rem); }
.npc-preview__status--ally { background: #16a34a33; color: #22c55e; }
.npc-preview__status--hostile { background: #dc262633; color: #ef4444; }
.npc-preview__status--neutral { background: #6b728033; color: #9ca3af; }
.npc-preview__status--dead { background: #6b728022; color: #6b7280; opacity: 0.6; }
.npc-preview__status--missing { background: #f9731633; color: #f97316; }
.npc-preview__details { display: grid; grid-template-columns: auto 1fr; gap: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem); }
.npc-preview__details dt { color: var(--color-text-secondary, #aaa); }
.npc-preview__desc { white-space: pre-wrap; }
.npc-preview__relations { list-style: disc; padding-left: 1.5em; }
.npc-preview__edit { display: inline-block; margin-top: var(--space-md, 1rem); color: var(--color-hope, #f0c040); }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/session/components/NpcPreviewSheet.vue
git commit -m "feat(session): composant NpcPreviewSheet — fiche PNJ lecture seule pour le drawer"
```

---

## Task 4 : PcQuickSheet — fiche PJ rapide (stats + capacités)

**Files:**
- Create: `src/modules/session/components/PcQuickSheet.vue`

Composant présentationnel utilisant `characterStore` pour résoudre les données du PJ.

- [ ] **Step 1: Examiner le modèle de données PJ**

Lire `src/modules/characters/stores/characterStore.js` pour identifier la structure d'un personnage (HP, stress, armor, hope, evasion, thresholds, domain cards loadout, subclass features). Vérifier aussi comment `resolveCharacterDisplay` ou équivalent fonctionne dans `PcGroupPanel.vue`.

- [ ] **Step 2: Implémenter le composant**

Le composant reçoit un `characterId` en prop, résout le personnage via `characterStore`, et affiche :
- Stats vitales : HP courants/max, Stress courants/max, Armure, Espoir
- Seuils : Évasion, Seuil majeur/sévère
- Cartes de domaine actives (loadout) — nom + description
- Capacités de sous-classe — nom + description
- Bouton [Éditer → /table/prep/personnages]

Suivre le même pattern Options API que `NpcPreviewSheet` (props + setup + computed depuis le store).

- [ ] **Step 3: Commit**

```bash
git add src/modules/session/components/PcQuickSheet.vue
git commit -m "feat(session): composant PcQuickSheet — fiche PJ rapide stats et capacites"
```

---

## Task 5 : SceneDrawer — panneau latéral dialog

**Files:**
- Create: `src/modules/session/components/SceneDrawer.vue`

- [ ] **Step 1: Implémenter le composant**

```vue
<!-- src/modules/session/components/SceneDrawer.vue -->
<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="drawer.isOpen.value"
        class="scene-drawer-overlay"
        @click.self="drawer.close()"
      >
        <aside
          ref="drawerRef"
          role="dialog"
          aria-modal="true"
          class="scene-drawer"
          @keydown.escape="drawer.close()"
        >
          <header class="scene-drawer__header">
            <button
              v-if="showBackButton"
              class="scene-drawer__back"
              aria-label="Retour a la liste"
              @click="drawer.openCatalogue()"
            >
              &larr;
            </button>
            <button
              class="scene-drawer__close"
              aria-label="Fermer"
              @click="drawer.close()"
            >
              &times;
            </button>
          </header>

          <div class="scene-drawer__content">
            <NpcPreviewSheet
              v-if="drawer.mode.value === 'npc'"
              :npc-id="drawer.targetId.value"
            />
            <PcQuickSheet
              v-else-if="drawer.mode.value === 'pc'"
              :character-id="drawer.targetId.value"
            />
            <!-- NpcCataloguePanel: enregistre dans Task 6 -->
            <div v-else-if="drawer.mode.value === 'catalogue'">
              <slot name="catalogue" />
            </div>
            <!-- EncounterGenerator: enregistre dans Task 16 -->
            <div v-else-if="drawer.mode.value === 'generator'">
              <slot name="generator" />
            </div>
          </div>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { ref, computed } from 'vue'
import { useSceneDrawer } from '../composables/useSceneDrawer'
import { useFocusTrap } from '@core/composables/useFocusTrap'
import NpcPreviewSheet from './NpcPreviewSheet.vue'
import PcQuickSheet from './PcQuickSheet.vue'

export default {
  name: 'SceneDrawer',
  components: { NpcPreviewSheet, PcQuickSheet },
  setup() {
    const drawer = useSceneDrawer()
    const drawerRef = ref(null)

    useFocusTrap(drawerRef, () => drawer.isOpen.value)

    const showBackButton = computed(() =>
      drawer.mode.value === 'npc' && drawer.targetId.value
    )

    return { drawer, drawerRef, showBackButton }
  }
}
</script>

<style scoped>
.scene-drawer-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  justify-content: flex-end;
}

.scene-drawer {
  width: 400px;
  max-width: 100vw;
  height: 100%;
  background: var(--color-background, #0f0f23);
  overflow-y: auto;
  padding: var(--space-md, 1rem);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.3);
}

.scene-drawer__header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-md, 1rem);
}

.scene-drawer__close,
.scene-drawer__back {
  background: none;
  border: none;
  color: var(--color-text, #fff);
  font-size: 1.5em;
  cursor: pointer;
  padding: var(--space-xs, 0.25rem);
}

.scene-drawer__content {
  padding-bottom: var(--space-lg, 2rem);
}

/* Animations */
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s;
}
.drawer-enter-active .scene-drawer,
.drawer-leave-active .scene-drawer {
  transition: transform 0.2s;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from .scene-drawer,
.drawer-leave-to .scene-drawer {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .scene-drawer { width: 100vw; }
}
</style>
```

Note : `NpcCataloguePanel` et `EncounterGenerator` seront implémentés dans des tasks ultérieures. Pour l'instant, utiliser des placeholders `<div>` avec un message ou ne pas enregistrer ces composants.

- [ ] **Step 2: Commit**

```bash
git add src/modules/session/components/SceneDrawer.vue
git commit -m "feat(session): composant SceneDrawer — panneau lateral dialog avec focus trap"
```

---

## Task 6 : NpcCataloguePanel — catalogue PNJ dans le drawer

**Files:**
- Create: `src/modules/session/components/NpcCataloguePanel.vue`

- [ ] **Step 1: Implémenter le composant**

Composant qui affiche la liste complète des PNJs avec recherche et filtrage. Réutilise la logique de recherche de `NpcManager` (search par nom, titre, faction, lieu). Émet `@select-npc` avec l'ID du PNJ cliqué.

Consulter `src/modules/npcs/views/NpcManager.vue` et `src/modules/npcs/stores/npcStore.js` pour les patterns de recherche existants.

Structure :
- Barre de recherche `<input>` en haut
- Liste filtrable des PNJs avec badge statut coloré
- Clic sur un PNJ → `$emit('select-npc', npc.id)`

- [ ] **Step 2: Enregistrer dans SceneDrawer**

Ajouter l'import de `NpcCataloguePanel` dans `SceneDrawer.vue` et l'enregistrer dans `components`.

- [ ] **Step 3: Commit**

```bash
git add src/modules/session/components/NpcCataloguePanel.vue src/modules/session/components/SceneDrawer.vue
git commit -m "feat(session): composant NpcCataloguePanel — catalogue PNJ recherchable dans le drawer"
```

---

## Task 7 : Modifier NpcLoader et PcGroupPanel pour émettre des événements

**Files:**
- Modify: `src/modules/session/components/NpcLoader.vue`
- Modify: `src/modules/session/components/PcGroupPanel.vue`

- [ ] **Step 1: Modifier NpcLoader**

Dans `src/modules/session/components/NpcLoader.vue` :
1. Ajouter `emits: ['select-npc']` au composant
2. Sur le clic d'un chip PNJ chargé, émettre `$emit('select-npc', npc.id)` au lieu de naviguer
3. Changer le router-link empty-state de `/table/pnjs` vers `/table/prep/pnjs`

- [ ] **Step 2: Modifier PcGroupPanel**

Dans `src/modules/session/components/PcGroupPanel.vue` :
1. Ajouter `emits: ['select-pc']` au composant
2. Sur le clic d'une carte PJ, émettre `$emit('select-pc', character.id)`
3. Changer les router-links internes de `/table/pjs` vers `/table/prep/personnages`

- [ ] **Step 3: Vérifier les tests existants**

Run: `npx vitest run src/modules/session/`
Expected: tous les tests existants passent toujours

- [ ] **Step 4: Commit**

```bash
git add src/modules/session/components/NpcLoader.vue src/modules/session/components/PcGroupPanel.vue
git commit -m "refactor(session): NpcLoader et PcGroupPanel emettent des evenements au lieu de naviguer"
```

---

## Task 8 : Modifier EncounterLauncher — ajout bouton Générer

**Files:**
- Modify: `src/modules/session/components/EncounterLauncher.vue`

- [ ] **Step 1: Modifier le composant**

Dans `src/modules/session/components/EncounterLauncher.vue` :
1. Ajouter `emits: ['open-generator']` au composant
2. Ajouter un bouton "Generer" qui émet `$emit('open-generator')`
3. Mettre à jour les router-links : `/table/rencontres` → `/table/prep/rencontres`
4. Conserver le lien "Ouvrir le constructeur" pointant vers `/table/prep/rencontres`
5. Mettre à jour `handleEdit()` : `router.push('/table/rencontres')` → `router.push('/table/prep/rencontres')`

- [ ] **Step 2: Commit**

```bash
git add src/modules/session/components/EncounterLauncher.vue
git commit -m "feat(session): EncounterLauncher — bouton generer et liens corriges vers Preparation"
```

---

## Task 9 : SceneView — vue principale Scène

**Files:**
- Create: `src/modules/session/views/SceneView.vue`

- [ ] **Step 1: Implémenter la vue**

```vue
<!-- src/modules/session/views/SceneView.vue -->
<template>
  <div class="scene-view">
    <EnvironmentLoader />

    <section class="scene-view__npcs">
      <NpcLoader @select-npc="drawer.openNpc($event)" />
      <button
        class="scene-view__catalogue-btn"
        @click="drawer.openCatalogue()"
      >
        Tout
      </button>
    </section>

    <section class="scene-view__pcs">
      <PcGroupPanel @select-pc="drawer.openPc($event)" />
    </section>

    <SessionNotes />

    <section class="scene-view__encounter">
      <EncounterLauncher @open-generator="drawer.openGenerator()" />
    </section>

    <SceneDrawer />
  </div>
</template>

<script>
import { useSceneDrawer } from '../composables/useSceneDrawer'
import EnvironmentLoader from '../components/EnvironmentLoader.vue'
import NpcLoader from '../components/NpcLoader.vue'
import PcGroupPanel from '../components/PcGroupPanel.vue'
import SessionNotes from '../components/SessionNotes.vue'
import EncounterLauncher from '../components/EncounterLauncher.vue'
import SceneDrawer from '../components/SceneDrawer.vue'

export default {
  name: 'SceneView',
  components: {
    EnvironmentLoader,
    NpcLoader,
    PcGroupPanel,
    SessionNotes,
    EncounterLauncher,
    SceneDrawer
  },
  setup() {
    const drawer = useSceneDrawer()
    return { drawer }
  }
}
</script>

<style scoped>
.scene-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-md, 1rem);
}

.scene-view__npcs {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm, 0.5rem);
}

.scene-view__npcs > :first-child {
  flex: 1;
}

.scene-view__catalogue-btn {
  white-space: nowrap;
  background: var(--color-surface, #1a1a2e);
  color: var(--color-text-secondary, #aaa);
  border: 1px solid var(--color-border, rgba(255,255,255,0.1));
  border-radius: var(--radius-sm, 4px);
  padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
  cursor: pointer;
  font-size: 0.85em;
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/session/views/SceneView.vue
git commit -m "feat(session): SceneView — vue principale onglet Scene assemblant tous les composants"
```

---

## Task 10 : PrepView — vue Préparation avec sous-tabs

**Files:**
- Create: `src/modules/session/views/PrepView.vue`

- [ ] **Step 1: Implémenter la vue**

```vue
<!-- src/modules/session/views/PrepView.vue -->
<template>
  <div class="prep-view">
    <nav
      class="prep-view__tabs"
      aria-label="Outils de preparation"
    >
      <ul role="tablist">
        <li
          v-for="tab in tabs"
          :key="tab.id"
          role="presentation"
        >
          <router-link
            :to="tab.to"
            role="tab"
            :aria-selected="currentTab === tab.id ? 'true' : 'false'"
            class="prep-view__tab"
            :class="{ 'prep-view__tab--active': currentTab === tab.id }"
          >
            {{ tab.label }}
          </router-link>
        </li>
      </ul>
    </nav>
    <div
      role="tabpanel"
      class="prep-view__content"
    >
      <router-view />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const PREP_TABS = [
  { id: 'personnages', label: 'Personnages', to: '/table/prep/personnages' },
  { id: 'pnjs', label: 'PNJs', to: '/table/prep/pnjs' },
  { id: 'rencontres', label: 'Rencontres', to: '/table/prep/rencontres' },
  { id: 'historique', label: 'Historique', to: '/table/prep/historique' }
]

export default {
  name: 'PrepView',
  setup() {
    const route = useRoute()
    const currentTab = computed(() => route.meta?.prepTab || 'personnages')
    return { tabs: PREP_TABS, currentTab }
  }
}
</script>

<style scoped>
.prep-view__tabs ul {
  display: flex;
  gap: var(--space-xs, 0.25rem);
  list-style: none;
  margin: 0 0 var(--space-md, 1rem);
  padding: 0;
  border-bottom: 1px solid var(--color-border, rgba(255,255,255,0.1));
}

.prep-view__tab {
  padding: var(--space-sm, 0.5rem) var(--space-md, 1rem);
  color: var(--color-text-secondary, #aaa);
  text-decoration: none;
  border-bottom: 2px solid transparent;
  transition: color var(--transition-fast, 0.15s), border-color var(--transition-fast, 0.15s);
  font-size: 0.9em;
}

.prep-view__tab:hover { color: var(--color-text, #fff); }

.prep-view__tab--active {
  color: var(--color-hope, #f0c040);
  border-bottom-color: var(--color-hope, #f0c040);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/session/views/PrepView.vue
git commit -m "feat(session): PrepView — conteneur onglet Preparation avec sous-tabs"
```

---

## Task 11 : Routing — nouvelles routes et redirections

**Files:**
- Modify: `src/router/index.js`

- [ ] **Step 1: Mettre à jour les imports et les routes**

Dans `src/router/index.js` :

Remplacer les imports des vues wrapper (lignes 16–19) :
```javascript
// Onglets Table de jeu
const SceneView = () => import('@modules/session/views/SceneView.vue')
const TableCombatView = () => import('@modules/session/views/TableCombatView.vue')
const DiceRoller = () => import('@modules/dice/views/DiceRoller.vue')
const PrepView = () => import('@modules/session/views/PrepView.vue')

// Sous-tabs Preparation
const CharacterBuilder = () => import('@modules/characters/views/CharacterBuilder.vue')
const NpcManager = () => import('@modules/npcs/views/NpcManager.vue')
const EncounterBuilder = () => import('@modules/encounter/views/EncounterBuilder.vue')
const EncounterHistory = () => import('@modules/encounter/components/EncounterHistory.vue')
```

Remplacer le bloc table routes (lignes 57–69) :
```javascript
// --- Table de jeu (4 onglets workflow) ---
{
  path: '/table',
  component: TableView,
  redirect: '/table/scene',
  children: [
    { path: 'scene', name: 'table-scene', component: SceneView, meta: { title: 'Scene', module: 'session', tab: 'scene' } },
    { path: 'combat', name: 'table-combat', component: TableCombatView, meta: { title: 'Combat', module: 'encounter', tab: 'combat' } },
    { path: 'des', name: 'table-des', component: DiceRoller, meta: { title: 'Des', module: 'dice', tab: 'des' } },
    {
      path: 'prep',
      component: PrepView,
      redirect: '/table/prep/personnages',
      meta: { tab: 'prep' },
      children: [
        { path: 'personnages', name: 'prep-personnages', component: CharacterBuilder, meta: { title: 'Personnages', module: 'characters', tab: 'prep', prepTab: 'personnages' } },
        { path: 'pnjs', name: 'prep-pnjs', component: NpcManager, meta: { title: 'PNJs', module: 'npcs', tab: 'prep', prepTab: 'pnjs' } },
        { path: 'rencontres', name: 'prep-rencontres', component: EncounterBuilder, meta: { title: 'Rencontres', module: 'encounter', tab: 'prep', prepTab: 'rencontres' } },
        { path: 'historique', name: 'prep-historique', component: EncounterHistory, meta: { title: 'Historique', module: 'encounter', tab: 'prep', prepTab: 'historique' } }
      ]
    }
  ]
},
```

Mettre à jour les redirections legacy (lignes 84–115) — ajouter :
```javascript
// Redirections legacy : anciennes routes table
{ path: '/table/pjs', redirect: '/table/prep/personnages' },
{ path: '/table/pnjs', redirect: '/table/scene' },
{ path: '/table/rencontres', redirect: '/table/prep/rencontres' },
```

Mettre à jour les redirections edition existantes :
```javascript
{ path: '/edition/personnages', redirect: '/table/prep/personnages' },
{ path: '/edition/rencontres', redirect: '/table/prep/rencontres' },
{ path: '/edition/pnjs', redirect: '/table/prep/pnjs' },
```

Mettre à jour les redirections anciennes routes anglaises :
```javascript
{ path: '/characters', redirect: '/table/prep/personnages' },
{ path: '/encounters', redirect: '/table/prep/rencontres' },
{ path: '/npcs', redirect: '/table/prep/pnjs' },
```

- [ ] **Step 2: Vérifier le build**

Run: `npx vite build`
Expected: build réussi sans erreur

- [ ] **Step 3: Commit**

```bash
git add src/router/index.js
git commit -m "refactor(router): nouvelles routes Scene/Prep et redirections legacy"
```

---

## Task 12 : TableView — passer de 5 à 4 onglets

**Files:**
- Modify: `src/core/components/TableView.vue`

- [ ] **Step 1: Mettre à jour les onglets**

Dans `src/core/components/TableView.vue`, remplacer `TABLE_TABS` (lignes 47–53) :

```javascript
const TABLE_TABS = [
  { id: 'scene', label: 'Scene', icon: '\u{1F3AD}' },
  { id: 'combat', label: 'Combat', icon: '\u2694\uFE0F' },
  { id: 'des', label: 'Des', icon: '\u{1F3B2}' },
  { id: 'prep', label: 'Preparation', icon: '\u{1F4CB}' }
]
```

Mettre à jour le `currentTab` default (ligne 62) :
```javascript
const currentTab = computed(() => route.meta?.tab || 'scene')
```

- [ ] **Step 2: Vérifier le build**

Run: `npx vite build`
Expected: build réussi

- [ ] **Step 3: Commit**

```bash
git add src/core/components/TableView.vue
git commit -m "refactor(table): 4 onglets workflow — Scene, Combat, Des, Preparation"
```

---

## Task 13 : TableCombatView — ajout SceneDrawer + lien retour

**Files:**
- Modify: `src/modules/session/views/TableCombatView.vue`

- [ ] **Step 1: Modifier la vue**

```vue
<template>
  <div class="table-combat-view">
    <div class="table-combat-view__toolbar">
      <router-link
        to="/table/scene"
        class="table-combat-view__back"
      >
        &larr; Retour a la Scene
      </router-link>
    </div>
    <CombatResumeBanner />
    <EncounterLive />
    <SceneDrawer />
  </div>
</template>

<script>
import CombatResumeBanner from '../components/CombatResumeBanner.vue'
import EncounterLive from '@modules/encounter/views/EncounterLive.vue'
import SceneDrawer from '../components/SceneDrawer.vue'

export default {
  name: 'TableCombatView',
  components: { CombatResumeBanner, EncounterLive, SceneDrawer }
}
</script>

<style scoped>
.table-combat-view__toolbar {
  margin-bottom: var(--space-sm, 0.5rem);
}

.table-combat-view__back {
  color: var(--color-text-secondary, #aaa);
  text-decoration: none;
  font-size: 0.9em;
}

.table-combat-view__back:hover {
  color: var(--color-text, #fff);
}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/session/views/TableCombatView.vue
git commit -m "feat(combat): ajout SceneDrawer et lien retour Scene dans TableCombatView"
```

---

## Task 13b : ContextPanel — ajout PNJs session dans le Combat

**Files:**
- Modify: `src/modules/encounter/components/ContextPanel.vue`
- Modify: `src/modules/encounter/views/EncounterLive.vue`

- [ ] **Step 1: Modifier ContextPanel**

Dans `src/modules/encounter/components/ContextPanel.vue`, ajouter une section "PNJs en scène" :
1. Importer `useSessionStore` depuis `@modules/session`
2. Ajouter après la section Environnement existante un bloc affichant `sessionStore.loadedNpcs` en chips
3. Chaque chip émet un événement `$emit('select-npc', npc.id)` au clic
4. Ajouter `emits: ['select-npc']` au composant

- [ ] **Step 2: Propager l'événement dans EncounterLive**

Dans `src/modules/encounter/views/EncounterLive.vue`, sur le `<ContextPanel>` :
1. Écouter `@select-npc="$emit('select-npc', $event)"`
2. Ajouter `emits: ['select-npc']` au composant

- [ ] **Step 3: Connecter dans TableCombatView**

Dans `src/modules/session/views/TableCombatView.vue`, sur le `<EncounterLive>` :
1. Écouter `@select-npc="drawer.openNpc($event)"`
2. Importer `useSceneDrawer` et l'initialiser dans setup

- [ ] **Step 4: Commit**

```bash
git add src/modules/encounter/components/ContextPanel.vue src/modules/encounter/views/EncounterLive.vue src/modules/session/views/TableCombatView.vue
git commit -m "feat(combat): PNJs session visibles dans ContextPanel avec ouverture drawer"
```

---

## Task 14 : Supprimer les vues wrapper obsolètes + mettre à jour l'index

**Files:**
- Delete: `src/modules/session/views/TablePjsView.vue`
- Delete: `src/modules/session/views/TablePnjsView.vue`
- Delete: `src/modules/session/views/TableRencontresView.vue`
- Modify: `src/modules/session/index.js`

- [ ] **Step 1: Supprimer les fichiers**

```bash
git rm src/modules/session/views/TablePjsView.vue
git rm src/modules/session/views/TablePnjsView.vue
git rm src/modules/session/views/TableRencontresView.vue
```

- [ ] **Step 2: Mettre à jour l'index du module session**

Dans `src/modules/session/index.js`, ajouter les nouveaux exports :

```javascript
/**
 * @module session
 * @description Module session — Hub MJ pour la gestion de table de jeu.
 */

// Store
export { useSessionStore } from './stores/sessionStore'

// Composables
export { useSceneDrawer } from './composables/useSceneDrawer'

// Composants
export { default as PcGroupPanel } from './components/PcGroupPanel.vue'
export { default as EnvironmentLoader } from './components/EnvironmentLoader.vue'
export { default as NpcLoader } from './components/NpcLoader.vue'
export { default as EncounterLauncher } from './components/EncounterLauncher.vue'
export { default as CombatResumeBanner } from './components/CombatResumeBanner.vue'
export { default as SessionHistoryPanel } from './components/SessionHistoryPanel.vue'
export { default as SessionNotes } from './components/SessionNotes.vue'
export { default as SceneDrawer } from './components/SceneDrawer.vue'
export { default as NpcPreviewSheet } from './components/NpcPreviewSheet.vue'
export { default as PcQuickSheet } from './components/PcQuickSheet.vue'
export { default as NpcCataloguePanel } from './components/NpcCataloguePanel.vue'
```

- [ ] **Step 3: Vérifier le build**

Run: `npx vite build`
Expected: build réussi, pas de références cassées

- [ ] **Step 4: Vérifier les tests**

Run: `npx vitest run src/modules/session/`
Expected: tous les tests passent

- [ ] **Step 5: Commit**

```bash
git add -A src/modules/session/
git commit -m "refactor(session): supprimer vues wrapper obsoletes et mettre a jour index module"
```

---

## Task 15 : useEncounterGenerator — logique de génération

**Files:**
- Create: `src/modules/encounter/composables/useEncounterGenerator.js`
- Test: `src/modules/encounter/composables/__tests__/useEncounterGenerator.test.js`

- [ ] **Step 1: Écrire les tests**

```javascript
// src/modules/encounter/composables/__tests__/useEncounterGenerator.test.js
import { describe, it, expect } from 'vitest'
import { generateEncounter } from '../useEncounterGenerator'

describe('generateEncounter', () => {
  // Catalogue minimal de test
  const mockAdversaries = [
    { id: 'goblin-scout', name: 'Eclaireur gobelin', type: 'Minion', tier: 2, genres: ['humanoide'] },
    { id: 'goblin-warrior', name: 'Guerrier gobelin', type: 'Standard', tier: 2, genres: ['humanoide'] },
    { id: 'goblin-shaman', name: 'Shamane gobelin', type: 'Leader', tier: 2, genres: ['humanoide'] },
    { id: 'wolf', name: 'Loup sauvage', type: 'Standard', tier: 1, genres: ['bete'] },
    { id: 'dire-wolf', name: 'Loup terrible', type: 'Bruiser', tier: 2, genres: ['bete'] },
    { id: 'skeleton', name: 'Squelette', type: 'Minion', tier: 1, genres: ['mort-vivant'] },
    { id: 'zombie', name: 'Zombie', type: 'Standard', tier: 1, genres: ['mort-vivant'] },
    { id: 'necro', name: 'Necromancien', type: 'Leader', tier: 2, genres: ['mort-vivant', 'humanoide'] }
  ]

  it('genere une rencontre avec le bon budget BP', () => {
    const result = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: 'humanoide',
      difficulty: 'standard',
      pcCount: 3
    })
    // Budget base = (3*3)+2 = 11 pour standard
    expect(result.slots.length).toBeGreaterThan(0)
    expect(result.totalBP).toBeLessThanOrEqual(result.budgetBP)
    expect(result.totalBP).toBeGreaterThan(0)
  })

  it('respecte le filtre de genre', () => {
    const result = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: 'bete',
      difficulty: 'standard',
      pcCount: 3
    })
    result.slots.forEach(slot => {
      expect(slot.adversary.genres).toContain('bete')
    })
  })

  it('ne genere pas plus d\'un Leader', () => {
    const result = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: null, // aleatoire
      difficulty: 'standard',
      pcCount: 4
    })
    const leaders = result.slots.filter(s => s.adversary.type === 'Leader')
    expect(leaders.length).toBeLessThanOrEqual(1)
  })

  it('groupe les Minions par pcCount', () => {
    const result = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: 'humanoide',
      difficulty: 'standard',
      pcCount: 3
    })
    result.slots
      .filter(s => s.adversary.type === 'Minion')
      .forEach(slot => {
        expect(slot.quantity % 3).toBe(0)
      })
  })

  it('retourne un objet avec les champs attendus', () => {
    const result = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: 'humanoide',
      difficulty: 'standard',
      pcCount: 3
    })
    expect(result).toHaveProperty('slots')
    expect(result).toHaveProperty('totalBP')
    expect(result).toHaveProperty('budgetBP')
    expect(result).toHaveProperty('tier')
    expect(result).toHaveProperty('theme')
  })

  it('ajuste le budget selon la difficulte', () => {
    const easy = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: null,
      difficulty: 'easy',
      pcCount: 3
    })
    const hard = generateEncounter({
      adversaries: mockAdversaries,
      tier: 2,
      theme: null,
      difficulty: 'hard',
      pcCount: 3
    })
    expect(easy.budgetBP).toBeLessThan(hard.budgetBP)
  })

  it('retourne un resultat vide si aucun adversaire ne correspond', () => {
    const result = generateEncounter({
      adversaries: mockAdversaries,
      tier: 4,
      theme: 'dragon',
      difficulty: 'standard',
      pcCount: 3
    })
    expect(result.slots).toHaveLength(0)
    expect(result.totalBP).toBe(0)
  })
})
```

- [ ] **Step 2: Vérifier que les tests échouent**

Run: `npx vitest run src/modules/encounter/composables/__tests__/useEncounterGenerator.test.js`
Expected: FAIL

- [ ] **Step 3: Implémenter le composable**

```javascript
// src/modules/encounter/composables/useEncounterGenerator.js
import {
  calculateBaseBattlePoints,
  calculateTierAdjustedCost,
  BATTLE_POINT_COSTS
} from '@data/encounters/constants'

/**
 * Mapping theme → genres d'adversaires.
 * 'type' indique un filtrage par type d'adversaire au lieu du genre.
 */
const THEME_FILTERS = {
  humanoide: { genres: ['humanoide'] },
  bete: { genres: ['bete'] },
  'mort-vivant': { genres: ['mort-vivant'] },
  boss: { types: ['Leader', 'Solo'] },
  embuscade: { types: ['Skulk', 'Ranged'] }
}

/** Modificateurs de budget par difficulte */
const DIFFICULTY_MODIFIERS = {
  easy: -3,
  standard: 0,
  hard: 3
}

/**
 * Filtre les adversaires eligibles selon tier et theme.
 */
function filterAdversaries(adversaries, tier, theme) {
  let filtered = adversaries.filter(a => Math.abs(a.tier - tier) <= 1)

  if (theme && THEME_FILTERS[theme]) {
    const filter = THEME_FILTERS[theme]
    if (filter.genres) {
      filtered = filtered.filter(a =>
        a.genres && a.genres.some(g => filter.genres.includes(g))
      )
    }
    if (filter.types) {
      filtered = filtered.filter(a => filter.types.includes(a.type))
    }
  }

  return filtered
}

/**
 * Tire un element aleatoire d'un tableau.
 */
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Genere une rencontre a partir du catalogue d'adversaires.
 *
 * @param {Object} params
 * @param {Array} params.adversaries - Catalogue complet d'adversaires
 * @param {number} params.tier - Tier cible
 * @param {string|null} params.theme - Theme (cle de THEME_FILTERS) ou null pour aleatoire
 * @param {string} params.difficulty - 'easy' | 'standard' | 'hard'
 * @param {number} params.pcCount - Nombre de PJ
 * @returns {{ slots: Array, totalBP: number, budgetBP: number, tier: number, theme: string|null }}
 */
export function generateEncounter({ adversaries, tier, theme, difficulty, pcCount }) {
  const baseBP = calculateBaseBattlePoints(pcCount)
  const budgetBP = Math.max(1, baseBP + (DIFFICULTY_MODIFIERS[difficulty] || 0))

  const eligible = filterAdversaries(adversaries, tier, theme)

  if (eligible.length === 0) {
    return { slots: [], totalBP: 0, budgetBP, tier, theme }
  }

  const slots = []
  let spent = 0
  let hasLeader = false

  // Trier par cout decroissant pour placer les gros d'abord
  const byType = {
    heavy: eligible.filter(a => ['Leader', 'Solo', 'Bruiser'].includes(a.type)),
    standard: eligible.filter(a => ['Standard', 'Horde', 'Ranged', 'Skulk', 'Support', 'Social'].includes(a.type)),
    minion: eligible.filter(a => a.type === 'Minion')
  }

  // 1. Essayer de placer un adversaire lourd
  if (byType.heavy.length > 0 && budgetBP >= 3) {
    const pick = pickRandom(byType.heavy)
    const tierDelta = pick.tier - tier
    const cost = calculateTierAdjustedCost(pick.type, 1, pcCount, tierDelta)
    if (cost <= budgetBP) {
      slots.push({ adversary: pick, quantity: 1, cost })
      spent += cost
      if (pick.type === 'Leader') hasLeader = true
    }
  }

  // 2. Remplir avec des Standards
  let attempts = 0
  while (spent < budgetBP && byType.standard.length > 0 && attempts < 20) {
    const pick = pickRandom(byType.standard)
    const tierDelta = pick.tier - tier
    const cost = calculateTierAdjustedCost(pick.type, 1, pcCount, tierDelta)
    if (spent + cost <= budgetBP) {
      const existing = slots.find(s => s.adversary.id === pick.id)
      if (existing) {
        existing.quantity += 1
        existing.cost += cost
      } else {
        slots.push({ adversary: pick, quantity: 1, cost })
      }
      spent += cost
    }
    attempts++
  }

  // 3. Remplir le reste avec des Minions (par groupe de pcCount)
  if (spent < budgetBP && byType.minion.length > 0) {
    const remaining = budgetBP - spent
    const minionGroups = Math.floor(remaining / 1) // 1 BP par groupe
    if (minionGroups > 0) {
      const pick = pickRandom(byType.minion)
      const quantity = minionGroups * pcCount
      slots.push({ adversary: pick, quantity, cost: minionGroups })
      spent += minionGroups
    }
  }

  return { slots, totalBP: spent, budgetBP, tier, theme }
}
```

- [ ] **Step 4: Vérifier que les tests passent**

Run: `npx vitest run src/modules/encounter/composables/__tests__/useEncounterGenerator.test.js`
Expected: 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/modules/encounter/composables/useEncounterGenerator.js src/modules/encounter/composables/__tests__/useEncounterGenerator.test.js
git commit -m "feat(encounter): composable useEncounterGenerator — generation de rencontres contextuelles"
```

---

## Task 16 : EncounterGenerator — UI dans le drawer

**Files:**
- Create: `src/modules/session/components/EncounterGenerator.vue`

- [ ] **Step 1: Implémenter le composant**

Le composant a deux états : formulaire (paramètres) et résultat.

Structure du formulaire :
- Select tier (pré-rempli depuis `sessionStore.loadedEnvironment?.tier` ou tier moyen PJs)
- Select thème (dropdown des clés de `THEME_FILTERS` + "Aléatoire")
- Boutons radio difficulté (Facile / Standard / Difficile)
- PJs auto-détectés (`characterStore.characters.length`)
- Bouton Générer

Structure du résultat :
- Nom auto (thème + "T" + tier)
- Budget BP affiché
- Liste des adversaires (nom × quantité, type, coût BP)
- Boutons : Régénérer, Lancer le combat, Sauvegarder, Modifier → Prep

Consulter `src/modules/encounter/views/EncounterBuilder.vue` et `src/modules/encounter/stores/encounterStore.js` pour le pattern de lancement (`liveStore.startEncounter()`) et de sauvegarde.

- [ ] **Step 2: Enregistrer dans SceneDrawer**

Ajouter l'import dans `SceneDrawer.vue`.

- [ ] **Step 3: Commit**

```bash
git add src/modules/session/components/EncounterGenerator.vue src/modules/session/components/SceneDrawer.vue
git commit -m "feat(session): composant EncounterGenerator — UI generateur de rencontres dans le drawer"
```

---

## Task 17 : Validation finale — build, tests, lint

**Files:** Aucun nouveau fichier

- [ ] **Step 1: Build Vite**

Run: `npx vite build`
Expected: build réussi sans erreur

- [ ] **Step 2: Tests complets session + encounter**

Run: `npx vitest run src/modules/session/ src/modules/encounter/`
Expected: tous les tests passent

- [ ] **Step 3: ESLint**

Run: `npx eslint src/modules/session/ src/core/components/TableView.vue src/router/index.js --fix`
Expected: aucune erreur

- [ ] **Step 4: Vérification manuelle rapide**

Run: `npx vite`
Vérifier dans le navigateur :
- `/table` redirige vers `/table/scene`
- Les 4 onglets s'affichent et naviguent correctement
- Le drawer s'ouvre/ferme avec les 3 modes
- Les notes se sauvegardent
- `/table/prep` affiche les sous-tabs
- Les anciennes URLs redirigent correctement

- [ ] **Step 5: Commit final**

```bash
git add -A
git commit -m "fix(table): corrections lint et ajustements finaux redesign UX"
```
