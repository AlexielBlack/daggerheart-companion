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
