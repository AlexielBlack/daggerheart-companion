<template>
  <nav
    class="app-nav"
    :class="{ 'app-nav--open': isOpen }"
    :aria-label="'Navigation principale'"
  >
    <ul
      class="app-nav__list"
      role="menubar"
    >
      <li
        v-for="item in navItems"
        :key="item.id"
        role="none"
      >
        <router-link
          :to="item.route"
          class="app-nav__link"
          role="menuitem"
          :aria-current="isActive(item.route) ? 'page' : undefined"
          @click="$emit('navigate')"
        >
          <span
            class="app-nav__icon"
            aria-hidden="true"
          >{{ item.icon }}</span>
          <span class="app-nav__label">{{ item.label }}</span>
        </router-link>
      </li>
    </ul>
  </nav>
</template>

<script>
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

    function isActive(path) {
      return route.path.startsWith(path)
    }

    return { navItems, isActive }
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
}

.app-nav__link:hover {
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.app-nav__link[aria-current="page"] {
  background-color: var(--color-bg-surface);
  color: var(--color-accent-hope);
  font-weight: var(--font-weight-medium);
}

.app-nav__icon {
  font-size: 1.2em;
  width: 28px;
  text-align: center;
}

.app-nav__label {
  font-size: var(--font-size-md);
}

/* Mobile: hidden by default */
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
