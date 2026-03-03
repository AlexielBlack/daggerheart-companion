<template>
  <Transition name="banner-slide">
    <div
      v-if="canInstall"
      class="install-banner"
      role="status"
      aria-live="polite"
    >
      <span class="install-banner__text">
        Installer Daggerheart Companion pour un acces hors ligne rapide.
      </span>
      <button
        class="install-banner__btn"
        @click="onInstall"
      >
        Installer
      </button>
      <button
        class="install-banner__dismiss"
        aria-label="Ignorer l'installation"
        @click="installDismissed = true"
      >
        ✕
      </button>
    </div>
  </Transition>
  <Transition name="banner-slide">
    <div
      v-if="hasUpdate"
      class="update-banner"
      role="alert"
      aria-live="assertive"
    >
      <span class="update-banner__text">
        Une mise a jour est disponible.
      </span>
      <button
        class="update-banner__btn"
        @click="onApply"
      >
        Mettre a jour
      </button>
      <button
        class="update-banner__dismiss"
        aria-label="Ignorer la mise a jour"
        @click="dismissed = true"
      >
        ✕
      </button>
    </div>
  </Transition>
  <Transition name="banner-slide">
    <div
      v-if="isOffline && !dismissed"
      class="offline-banner"
      role="status"
      aria-live="polite"
    >
      <span class="offline-banner__text">
        Mode hors ligne — les donnees sont sauvegardees localement.
      </span>
    </div>
  </Transition>
</template>

<script>
import { ref, computed } from 'vue'
import { useServiceWorker } from '@core/composables/useServiceWorker'
import { useInstallPrompt } from '@core/composables/useInstallPrompt'

export default {
  name: 'PwaBanner',
  setup() {
    const { hasUpdate: swHasUpdate, isOffline, applyUpdate } = useServiceWorker()
    const {
      canInstall: rawCanInstall,
      isInstalled,
      promptInstall
    } = useInstallPrompt()

    const dismissed = ref(false)
    const installDismissed = ref(false)

    const hasUpdate = computed(() => swHasUpdate.value && !dismissed.value)
    const canInstall = computed(
      () => rawCanInstall.value && !installDismissed.value && !isInstalled.value
    )

    function onApply() {
      applyUpdate()
    }

    async function onInstall() {
      await promptInstall()
    }

    return {
      hasUpdate,
      isOffline,
      dismissed,
      installDismissed,
      canInstall,
      onApply,
      onInstall
    }
  }
}
</script>

<style scoped>
.update-banner,
.offline-banner,
.install-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-size-sm);
  z-index: 9998;
}

.update-banner {
  background: var(--color-accent-hope);
  color: #fff;
}

.offline-banner {
  background: var(--color-accent-warning);
  color: var(--color-text-inverse);
}

.install-banner {
  background: var(--color-accent-gold);
  color: var(--color-bg-primary);
}

.update-banner__btn,
.install-banner__btn {
  padding: 4px 12px;
  background: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: opacity var(--transition-fast);
}

.update-banner__btn {
  color: var(--color-accent-hope);
}

.install-banner__btn {
  color: var(--color-accent-gold);
}

.update-banner__btn:hover,
.install-banner__btn:hover { opacity: 0.9; }

.update-banner__dismiss,
.install-banner__dismiss {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: var(--font-size-md);
  padding: 2px 6px;
  opacity: 0.8;
}

.update-banner__dismiss:hover,
.install-banner__dismiss:hover { opacity: 1; }

.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.banner-slide-enter-from,
.banner-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
