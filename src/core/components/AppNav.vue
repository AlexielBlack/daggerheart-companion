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

        <!-- ── Item avec sous-menu ── -->
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
            class="app-nav__sublist"
            :class="{ 'app-nav__sublist--open': openGroups.has(item.id) }"
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
                @click="$emit('navigate')"
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
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NAV_ITEMS } from '@core/utils/constants.js'

export default {
  name: 'AppNav',

  props: {
    isOpen: {
      type: Boolean,
      default: false
    }
  },

  emits: ['navigate'],

  setup() {
    const route = useRoute()
    const navItems = NAV_ITEMS

    // Groupes ouverts (Set réactif simulé avec un tableau)
    const openGroupIds = ref([])

    const openGroups = {
      has: (id) => openGroupIds.value.includes(id)
    }

    function autoOpenParent() {
      for (const item of navItems) {
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

    function toggleGroup(id) {
      if (openGroupIds.value.includes(id)) {
        openGroupIds.value = openGroupIds.value.filter((x) => x !== id)
      } else {
        openGroupIds.value = [...openGroupIds.value, id]
      }
    }

    function isExactActive(path) {
      if (path === '/') return route.path === '/'
      return route.path === path
    }

    function isParentActive(item) {
      if (!item.children) return false
      return item.children.some((c) => route.path.startsWith(c.route))
    }

    return {
      navItems,
      openGroups,
      openGroupIds,
      toggleGroup,
      isExactActive,
      isParentActive
    }
  }
}
</script>

<style scoped>
.app-nav {
  background-color: var(--color-bg-secondary);
  border-right: 1px solid var(--color-border);
  width: var(--nav-width);
  height: 100%;
  overflow-y: auto;
  padding: var(--space-md) 0;
}

.app-nav__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  padding: 0 var(--space-sm);
  list-style: none;
  margin: 0;
}

.app-nav__item {
  display: flex;
  flex-direction: column;
}

.app-nav__link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: background-color var(--transition-fast), color var(--transition-fast);
  cursor: pointer;
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  font-size: var(--font-size-md);
  font-family: inherit;
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
  margin-left: auto;
  font-size: 0.65rem;
  color: var(--color-text-muted);
}

.app-nav__icon {
  font-size: 1.2em;
  width: 28px;
  text-align: center;
  flex-shrink: 0;
}

.app-nav__icon--sm {
  font-size: 1em;
  width: 22px;
}

.app-nav__label {
  font-size: var(--font-size-md);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-nav__sublist {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 0;
  overflow: hidden;
  transition: max-height var(--transition-normal);
}

.app-nav__sublist--open {
  max-height: 400px;
}

.app-nav__sublink {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-md) var(--space-xs) calc(var(--space-md) + 20px);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  text-decoration: none;
  font-size: var(--font-size-sm);
  transition: background-color var(--transition-fast), color var(--transition-fast);
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

@media (max-width: 768px) {
  .app-nav {
    position: fixed;
    top: var(--header-height);
    left: 0;
    bottom: 0;
    z-index: 100;
    transform: translateX(-100%);
    transition: transform var(--transition-normal);
  }

  .app-nav--open {
    transform: translateX(0);
  }
}
</style>
