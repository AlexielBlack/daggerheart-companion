<template>
  <div class="app-shell">
    <a
      href="#main-content"
      class="skip-link"
    >
      Aller au contenu principal
    </a>

    <header class="app-shell__header">
      <button
        class="app-shell__menu-toggle"
        :aria-expanded="navOpen ? 'true' : 'false'"
        aria-controls="main-nav"
        aria-label="Ouvrir le menu de navigation"
        @click="toggleNav"
      >
        <span aria-hidden="true">☰</span>
      </button>

      <h1 class="app-shell__title">
        <router-link
          to="/"
          class="app-shell__title-link"
        >
          🗡️ DC
        </router-link>
      </h1>

      <ModeSelector @navigate="closeNav" />

      <AppNav
        id="main-nav"
        :is-open="navOpen"
        @navigate="closeNav"
      />

      <router-link
        to="/jeu/des"
        class="app-shell__dice-shortcut"
        aria-label="Lanceur de dés"
        @click="closeNav"
      >
        <span aria-hidden="true">🎲</span>
      </router-link>

      <router-link
        to="/edition/sync"
        class="app-shell__sync-shortcut"
        aria-label="Synchronisation"
        @click="closeNav"
      >
        <span aria-hidden="true">🔄</span>
      </router-link>
    </header>

    <main
      id="main-content"
      class="app-shell__content"
    >
      <slot></slot>
    </main>

    <!-- Notifications toast -->
    <div
      class="app-shell__notifications"
      aria-live="polite"
      aria-label="Notifications"
    >
      <div
        v-for="notif in notifications"
        :key="notif.id"
        class="notification"
        :class="`notification--${notif.type}`"
        role="alert"
      >
        {{ notif.message }}
        <button
          class="notification__close"
          aria-label="Fermer la notification"
          @click="dismiss(notif.id)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import AppNav from './AppNav.vue'
import ModeSelector from './ModeSelector.vue'
import { useNotification } from '@core/composables/useNotification.js'

export default {
  name: 'AppShell',
  components: { AppNav, ModeSelector },
  setup() {
    const navOpen = ref(false)
    const { notifications, dismiss } = useNotification()

    function toggleNav() {
      navOpen.value = !navOpen.value
    }

    function closeNav() {
      navOpen.value = false
    }

    return { navOpen, toggleNav, closeNav, notifications, dismiss }
  }
}
</script>

<style scoped>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-shell__header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  height: var(--header-height);
  padding: 0 var(--space-md);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  z-index: 200;
}

.app-shell__menu-toggle {
  display: none;
  font-size: 1.5rem;
  padding: var(--space-xs);
  background: none;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
}

@media (max-width: 768px) {
  .app-shell__menu-toggle {
    display: block;
  }
}

.app-shell__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  margin: 0;
  flex-shrink: 0;
}

.app-shell__title-link {
  color: var(--color-text-primary);
  text-decoration: none;
}

.app-shell__title-link:hover {
  color: var(--color-accent-hope);
}

.app-shell__dice-shortcut {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 1.2rem;
  transition: color var(--transition-fast), background-color var(--transition-fast);
  flex-shrink: 0;
  margin-left: auto;
}

.app-shell__dice-shortcut:hover,
.app-shell__sync-shortcut:hover {
  background-color: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.app-shell__sync-shortcut {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 1.2rem;
  transition: color var(--transition-fast), background-color var(--transition-fast);
  flex-shrink: 0;
}

/* ── Contenu full width ── */

.app-shell__content {
  flex: 1;
  padding: var(--space-md);
  overflow-y: auto;
  max-width: var(--content-max-width);
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

@media (max-width: 1400px) {
  .app-shell__content {
    max-width: 100%;
  }
}

/* ── Notifications ── */

.app-shell__notifications {
  position: fixed;
  bottom: var(--space-md);
  right: var(--space-md);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-width: 400px;
}

.notification {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  color: #fff;
  font-size: var(--font-size-sm);
  box-shadow: var(--shadow-lg);
  animation: slide-in 0.3s ease;
}

.notification--info { background-color: var(--color-accent-info); }
.notification--success { background-color: var(--color-accent-success); }
.notification--warning { background-color: var(--color-accent-warning); }
.notification--error { background-color: var(--color-accent-danger); }

.notification__close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
  padding: var(--space-xs);
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
}

.notification__close:hover {
  opacity: 1;
}

@keyframes slide-in {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
</style>
