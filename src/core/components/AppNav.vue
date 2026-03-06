<template>
  <nav
    class="app-nav"
    :class="{ 'app-nav--open': isOpen }"
    aria-label="Navigation principale"
  >
    <ul
      class="app-nav__list"
      role="menubar"
    >
      <li
        v-for="item in navItems"
        :key="item.id"
        role="none"
        class="app-nav__item"
        :class="{ 'app-nav__item--has-children': !!item.children }"
      >
        <!-- ── Item sans enfants ── -->
        <router-link
          v-if="!item.children"
          :to="item.route"
          class="app-nav__link"
          role="menuitem"
          :aria-current="isExactActive(item.route) ? 'page' : undefined"
          @click="$emit('navigate')"
        >
          <span
            class="app-nav__icon"
            aria-hidden="true"
          >{{ item.icon }}</span>
          <span class="app-nav__label">{{ item.label }}</span>
        </router-link>

        <!-- ── Item avec sous-menu (dropdown) ── -->
        <template v-else>
          <button
            class="app-nav__link app-nav__link--parent"
            :class="{ 'app-nav__link--active-parent': isParentActive(item) }"
            :aria-expanded="openGroups.has(item.id)"
            :aria-controls="`subnav-${item.id}`"
            @click="toggleGroup(item.id)"
          >
            <span
              class="app-nav__icon"
              aria-hidden="true"
            >{{ item.icon }}</span>
            <span class="app-nav__label">{{ item.label }}</span>
            <span
              class="app-nav__chevron"
              aria-hidden="true"
            >{{ openGroups.has(item.id) ? '▲' : '▼' }}</span>
          </button>

          <ul
            :id="`subnav-${item.id}`"
            class="app-nav__dropdown"
            :class="{ 'app-nav__dropdown--open': openGroups.has(item.id) }"
            role="menu"
            :aria-label="`Sous-menu ${item.label}`"
          >
            <li
              v-for="child in item.children"
              :key="child.id"
              role="none"
            >
              <router-link
                :to="child.route"
                class="app-nav__sublink"
                role="menuitem"
                :aria-current="isExactActive(child.route) ? 'page' : undefined"
                @click="handleChildClick(item.id)"
              >
                <span
                  class="app-nav__icon app-nav__icon--sm"
                  aria-hidden="true"
                >{{ child.icon }}</span>
                <span class="app-nav__label">{{ child.label }}</span>
              </router-link>
            </li>
          </ul>
        </template>
      </li>
    </ul>
  </nav>
</template>

<script>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import { MODE_NAV } from '@core/utils/constants.js'

export default {
  name: 'AppNav',

  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },

  emits: ['navigate'],

  setup(props, { emit }) {
    const route = useRoute()
    const currentMode = computed(() => route.meta?.mode || 'lecture')
    const navItems = computed(() => MODE_NAV[currentMode.value] || [])
    const openGroupIds = ref([])

    const openGroups = {
      has: (id) => openGroupIds.value.includes(id)
    }

    function autoOpenParent() {
      for (const item of navItems.value) {
        if (item.children) {
          const isChildActive = item.children.some((c) =>
            route.path.startsWith(c.route)
          )
          if (isChildActive && !openGroupIds.value.includes(item.id)) {
            openGroupIds.value = [...openGroupIds.value, item.id]
          }
        }
      }
    }

    autoOpenParent()
    watch(() => route.path, autoOpenParent)

    // Réinitialiser les groupes ouverts lors d'un changement de mode
    watch(currentMode, () => {
      openGroupIds.value = []
      nextTick(autoOpenParent)
    })

    function toggleGroup(id) {
      if (openGroupIds.value.includes(id)) {
        openGroupIds.value = openGroupIds.value.filter((x) => x !== id)
      } else {
        // Fermer les autres groupes ouverts (un seul dropdown à la fois)
        openGroupIds.value = [id]
      }
    }

    function handleChildClick(parentId) {
      // Fermer le dropdown après navigation
      openGroupIds.value = openGroupIds.value.filter((x) => x !== parentId)
      emit('navigate')
    }

    function isExactActive(path) {
      if (path === '/') return route.path === '/'
      return route.path === path
    }

    function isParentActive(item) {
      if (!item.children) return false
      return item.children.some((c) => route.path.startsWith(c.route))
    }

    // Fermer les dropdowns au clic extérieur
    function handleOutsideClick(e) {
      if (openGroupIds.value.length > 0) {
        const nav = e.target.closest('.app-nav')
        if (!nav) {
          openGroupIds.value = []
        }
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleOutsideClick)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleOutsideClick)
    })

    return {
      navItems,
      currentMode,
      openGroups,
      openGroupIds,
      toggleGroup,
      handleChildClick,
      isExactActive,
      isParentActive
    }
  }
}
</script>

<style scoped>
/* ── Nav horizontale (desktop) ── */

.app-nav {
  display: flex;
  align-items: center;
}

.app-nav__list {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 0;
  list-style: none;
  margin: 0;
}

.app-nav__item {
  position: relative;
}

.app-nav__link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: background-color var(--transition-fast), color var(--transition-fast);
  cursor: pointer;
  background: none;
  border: none;
  font-size: var(--font-size-sm);
  font-family: inherit;
  white-space: nowrap;
}

.app-nav__link:hover {
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.app-nav__link[aria-current="page"],
.app-nav__link--active-parent {
  background-color: var(--color-bg-surface);
  color: var(--color-accent-hope);
  font-weight: var(--font-weight-medium);
}

.app-nav__link:focus-visible {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: -2px;
}

.app-nav__chevron {
  font-size: 0.55rem;
  color: var(--color-text-muted);
  margin-left: 1px;
}

.app-nav__icon {
  font-size: 1em;
  flex-shrink: 0;
}

.app-nav__icon--sm {
  font-size: 0.9em;
}

.app-nav__label {
  line-height: 1.2;
}

/* ── Dropdown (sous-menu) ── */

.app-nav__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 300;
  min-width: 180px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--space-xs);
  list-style: none;
  margin: var(--space-xs) 0 0;
  display: none;
}

.app-nav__dropdown--open {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.app-nav__sublink {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: background-color var(--transition-fast), color var(--transition-fast);
  white-space: nowrap;
}

.app-nav__sublink:hover {
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.app-nav__sublink[aria-current="page"] {
  color: var(--color-accent-hope);
  font-weight: var(--font-weight-medium);
  background-color: var(--color-bg-surface);
}

.app-nav__sublink:focus-visible {
  outline: 2px solid var(--color-accent-hope);
  outline-offset: -2px;
}

/* ── Mobile : menu vertical en overlay ── */

@media (max-width: 768px) {
  .app-nav {
    position: fixed;
    top: var(--header-height);
    left: 0;
    right: 0;
    z-index: 300;
    background: var(--color-bg-secondary);
    border-bottom: 1px solid var(--color-border);
    box-shadow: var(--shadow-lg);
    padding: var(--space-sm);
    display: none;
    max-height: calc(100vh - var(--header-height));
    overflow-y: auto;
  }

  .app-nav--open {
    display: block;
  }

  .app-nav__list {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-xs);
  }

  .app-nav__link {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-size-md);
  }

  .app-nav__dropdown {
    position: static;
    border: none;
    box-shadow: none;
    background: transparent;
    margin: 0;
    padding: 0 0 0 var(--space-md);
  }

  .app-nav__dropdown--open {
    display: flex;
  }

  .app-nav__sublink {
    padding: var(--space-xs) var(--space-md);
  }
}
</style>
