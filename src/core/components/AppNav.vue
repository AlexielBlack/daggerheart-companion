<template>
  <nav
    class="app-nav"
    :class="{ 'app-nav--open': isOpen }"
    aria-label="Navigation principale"
  >
    <ul class="app-nav__list">
      <li
        v-for="item in navItems"
        :key="item.id"
      >
        <router-link
          :to="item.route"
          class="app-nav__link"
          :aria-current="isActive(item) ? 'page' : undefined"
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

// Liens statiques de navigation principale
const NAV_ITEMS = [
  { id: 'compendium', label: 'Compendium', icon: '📖', route: '/compendium', matchPrefix: '/compendium' },
  { id: 'table', label: 'Table', icon: '🎮', route: '/table', matchPrefix: '/table' },
  { id: 'sync', label: 'Sync', icon: '🔄', route: '/sync', matchPrefix: '/sync' }
]

export default {
  name: 'AppNav',
  props: {
    isOpen: { type: Boolean, default: false }
  },
  emits: ['navigate'],
  setup() {
    const route = useRoute()

    function isActive(item) {
      return route.path.startsWith(item.matchPrefix)
    }

    return { navItems: NAV_ITEMS, isActive }
  }
}
</script>

<style scoped>
.app-nav__list {
  display: flex;
  gap: var(--space-md, 1rem);
  list-style: none;
  margin: 0;
  padding: 0;
}

.app-nav__link {
  display: flex;
  align-items: center;
  gap: var(--space-xs, 0.25rem);
  padding: var(--space-xs, 0.25rem) var(--space-sm, 0.5rem);
  color: var(--color-text-secondary, #aaa);
  text-decoration: none;
  border-radius: var(--radius-sm, 4px);
  transition: color var(--transition-fast, 0.15s), background var(--transition-fast, 0.15s);
}

.app-nav__link:hover {
  color: var(--color-text, #fff);
  background: var(--color-surface-hover, rgba(255,255,255,0.08));
}

.app-nav__link[aria-current='page'] {
  color: var(--color-hope, #f0c040);
  font-weight: 600;
}

.app-nav__icon { font-size: 1.1em; }

/* Mobile */
@media (max-width: 768px) {
  .app-nav {
    display: none;
    position: fixed;
    top: var(--header-height, 3.5rem);
    left: 0;
    right: 0;
    background: var(--color-surface, #1a1a2e);
    padding: var(--space-md, 1rem);
    z-index: 300;
    box-shadow: var(--shadow-lg);
  }
  .app-nav--open { display: block; }
  .app-nav__list { flex-direction: column; }
  .app-nav__link { padding: var(--space-sm, 0.5rem) var(--space-md, 1rem); }
}
</style>
