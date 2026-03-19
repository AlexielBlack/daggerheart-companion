<template>
  <Teleport to="body">
    <Transition name="drawer">
      <div
        v-if="drawer.isOpen.value"
        class="scene-drawer-overlay"
        role="presentation"
        @click.self="drawer.close()"
        @keydown.escape="drawer.close()"
      >
        <aside
          ref="drawerRef"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          class="scene-drawer"
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
            <NpcCataloguePanel
              v-else-if="drawer.mode.value === 'catalogue'"
              @select-npc="drawer.openNpc($event)"
            />
            <div v-else-if="drawer.mode.value === 'generator'">
              <!-- EncounterGenerator sera integre dans Task 16 -->
              <p>Generateur de rencontres (a venir)</p>
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
import NpcCataloguePanel from './NpcCataloguePanel.vue'

export default {
  name: 'SceneDrawer',
  components: { NpcPreviewSheet, PcQuickSheet, NpcCataloguePanel },
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
