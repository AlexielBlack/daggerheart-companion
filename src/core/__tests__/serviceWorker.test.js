// @vitest-environment jsdom
/**
 * @module core/__tests__/serviceWorker.test
 * @description Tests pour le composable useServiceWorker et les utilitaires PWA.
 *
 * Couvre :
 *   - Etat reactif (isSupported, isReady, hasUpdate, isOffline)
 *   - Enregistrement du service worker (mock)
 *   - Detection des mises a jour
 *   - Application des mises a jour (skipWaiting)
 *   - Ecouteurs online/offline
 *   - Verification manuelle des updates
 *   - Cas d'erreur
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ── Helpers pour mocker navigator.serviceWorker ──

function createMockRegistration(overrides = {}) {
  return {
    active: null,
    waiting: null,
    installing: null,
    scope: '/daggerheart-companion/',
    update: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn(),
    ...overrides
  }
}

function createMockServiceWorker(state = 'installed') {
  const listeners = {}
  return {
    state,
    postMessage: vi.fn(),
    addEventListener(event, cb) {
      if (!listeners[event]) listeners[event] = []
      listeners[event].push(cb)
    },
    _trigger(event) {
      (listeners[event] || []).forEach((cb) => cb())
    }
  }
}

function setupSWMock(registration) {
  const swListeners = {}
  const swMock = {
    register: vi.fn().mockResolvedValue(registration),
    controller: null,
    addEventListener(event, cb) {
      if (!swListeners[event]) swListeners[event] = []
      swListeners[event].push(cb)
    },
    _trigger(event) {
      (swListeners[event] || []).forEach((cb) => cb())
    }
  }
  Object.defineProperty(navigator, 'serviceWorker', {
    value: swMock,
    writable: true,
    configurable: true
  })
  return swMock
}

function cleanupSWMock() {
  delete navigator.serviceWorker
}

describe('useServiceWorker', () => {
  let mod

  beforeEach(async () => {
    // Reset le module a chaque test (etat partage via refs)
    vi.resetModules()
    Object.defineProperty(navigator, 'onLine', {
      value: true,
      writable: true,
      configurable: true
    })
  })

  afterEach(() => {
    cleanupSWMock()
    vi.restoreAllMocks()
  })

  async function loadModule() {
    mod = await import('@core/composables/useServiceWorker')
    return mod
  }

  // ── Etat reactif ──

  describe('etat reactif initial', () => {
    it('isSupported est true quand serviceWorker existe', async () => {
      setupSWMock(createMockRegistration())
      const { useServiceWorker } = await loadModule()
      const { isSupported } = useServiceWorker()
      expect(isSupported.value).toBe(true)
    })

    it('isSupported est coherent avec navigator.serviceWorker', async () => {
      // jsdom inclut serviceWorker dans navigator → toujours true en test
      setupSWMock(createMockRegistration())
      const { useServiceWorker } = await loadModule()
      const { isSupported } = useServiceWorker()
      const expected = 'serviceWorker' in navigator
      expect(isSupported.value).toBe(expected)
    })

    it('isReady commence a false', async () => {
      setupSWMock(createMockRegistration())
      const { useServiceWorker } = await loadModule()
      const { isReady } = useServiceWorker()
      expect(isReady.value).toBe(false)
    })

    it('hasUpdate commence a false', async () => {
      setupSWMock(createMockRegistration())
      const { useServiceWorker } = await loadModule()
      const { hasUpdate } = useServiceWorker()
      expect(hasUpdate.value).toBe(false)
    })

    it('isOffline reflete navigator.onLine', async () => {
      Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
      setupSWMock(createMockRegistration())
      const { useServiceWorker } = await loadModule()
      const { isOffline } = useServiceWorker()
      expect(isOffline.value).toBe(true)
    })
  })

  // ── Enregistrement ──

  describe('registerServiceWorker', () => {
    it('enregistre le SW et retourne la registration', async () => {
      const reg = createMockRegistration()
      const swMock = setupSWMock(reg)
      const { registerServiceWorker } = await loadModule()

      const result = await registerServiceWorker()
      expect(result).toBe(reg)
      expect(swMock.register).toHaveBeenCalledWith(
        '/daggerheart-companion/sw.js',
        { scope: '/daggerheart-companion/' }
      )
    })

    it('appelle onReady quand le SW est deja actif', async () => {
      const activeWorker = createMockServiceWorker('activated')
      const reg = createMockRegistration({ active: activeWorker })
      setupSWMock(reg)
      const { registerServiceWorker, useServiceWorker } = await loadModule()

      const onReady = vi.fn()
      await registerServiceWorker({ onReady })

      expect(onReady).toHaveBeenCalledOnce()
      expect(useServiceWorker().isReady.value).toBe(true)
    })

    it('detecte un SW en attente et appelle onUpdate', async () => {
      const waitingSW = createMockServiceWorker('installed')
      const reg = createMockRegistration({ waiting: waitingSW })
      setupSWMock(reg)
      const { registerServiceWorker, useServiceWorker } = await loadModule()

      const onUpdate = vi.fn()
      await registerServiceWorker({ onUpdate })

      expect(onUpdate).toHaveBeenCalledOnce()
      expect(useServiceWorker().hasUpdate.value).toBe(true)
    })

    it('retourne null quand SW non supporte', async () => {
      cleanupSWMock()
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
        configurable: true
      })
      const { registerServiceWorker } = await loadModule()
      const result = await registerServiceWorker()
      expect(result).toBeNull()
    })

    it('retourne null et log en cas d erreur', async () => {
      const swMock = {
        register: vi.fn().mockRejectedValue(new Error('fail')),
        addEventListener: vi.fn()
      }
      Object.defineProperty(navigator, 'serviceWorker', {
        value: swMock,
        writable: true,
        configurable: true
      })
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const { registerServiceWorker } = await loadModule()

      const result = await registerServiceWorker()
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })

  // ── Mise a jour ──

  describe('detection de mise a jour via updatefound', () => {
    it('detecte une nouvelle installation et appelle onUpdate', async () => {
      const reg = createMockRegistration()
      const regListeners = {}
      reg.addEventListener = (event, cb) => {
        if (!regListeners[event]) regListeners[event] = []
        regListeners[event].push(cb)
      }

      const swMock = setupSWMock(reg)
      swMock.controller = {} // Simule un SW deja en controle
      const { registerServiceWorker, useServiceWorker } = await loadModule()

      const onUpdate = vi.fn()
      await registerServiceWorker({ onUpdate })

      // Simuler une nouvelle installation
      const newWorker = createMockServiceWorker('installing')
      reg.installing = newWorker;
      (regListeners['updatefound'] || []).forEach((cb) => cb())

      // Le worker passe a 'installed'
      newWorker.state = 'installed'
      newWorker._trigger('statechange')

      expect(onUpdate).toHaveBeenCalledOnce()
      expect(useServiceWorker().hasUpdate.value).toBe(true)
    })
  })

  // ── Application de mise a jour ──

  describe('applyUpdate', () => {
    it('envoie SKIP_WAITING au worker en attente', async () => {
      const waitingSW = createMockServiceWorker('installed')
      const reg = createMockRegistration({ waiting: waitingSW })
      setupSWMock(reg)
      const { registerServiceWorker, applyUpdate } = await loadModule()

      await registerServiceWorker()
      const result = applyUpdate()

      expect(result).toBe(true)
      expect(waitingSW.postMessage).toHaveBeenCalledWith('SKIP_WAITING')
    })

    it('retourne false sans worker en attente', async () => {
      setupSWMock(createMockRegistration())
      const { registerServiceWorker, applyUpdate } = await loadModule()

      await registerServiceWorker()
      const result = applyUpdate()

      expect(result).toBe(false)
    })
  })

  // ── Verification manuelle ──

  describe('checkForUpdate', () => {
    it('appelle registration.update()', async () => {
      const reg = createMockRegistration()
      setupSWMock(reg)
      const { registerServiceWorker, checkForUpdate } = await loadModule()

      await registerServiceWorker()
      await checkForUpdate()

      expect(reg.update).toHaveBeenCalledOnce()
    })

    it('retourne false sans registration', async () => {
      cleanupSWMock()
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
        configurable: true
      })
      const { checkForUpdate } = await loadModule()
      const result = await checkForUpdate()
      expect(result).toBe(false)
    })

    it('retourne false si update() echoue', async () => {
      const reg = createMockRegistration()
      reg.update = vi.fn().mockRejectedValue(new Error('network'))
      setupSWMock(reg)
      const { registerServiceWorker, checkForUpdate } = await loadModule()

      await registerServiceWorker()
      const result = await checkForUpdate()
      expect(result).toBe(false)
    })
  })

  // ── Etats readonly ──

  describe('readonly state', () => {
    it('les refs retournees ne sont pas modifiables', async () => {
      setupSWMock(createMockRegistration())
      const { useServiceWorker } = await loadModule()
      const { isSupported, isReady, hasUpdate, isOffline } = useServiceWorker()

      // Les refs readonly ignorent les affectations (warning Vue, pas throw)
      const origSupported = isSupported.value
      const origReady = isReady.value
      const origUpdate = hasUpdate.value
      const origOffline = isOffline.value

      isSupported.value = !origSupported
      isReady.value = !origReady
      hasUpdate.value = !origUpdate
      isOffline.value = !origOffline

      // Les valeurs doivent rester inchangees
      expect(isSupported.value).toBe(origSupported)
      expect(isReady.value).toBe(origReady)
      expect(hasUpdate.value).toBe(origUpdate)
      expect(isOffline.value).toBe(origOffline)
    })
  })

  // ── API publique ──

  describe('API publique', () => {
    it('useServiceWorker retourne la bonne forme', async () => {
      setupSWMock(createMockRegistration())
      const { useServiceWorker } = await loadModule()
      const api = useServiceWorker()

      expect(api).toHaveProperty('isSupported')
      expect(api).toHaveProperty('isReady')
      expect(api).toHaveProperty('hasUpdate')
      expect(api).toHaveProperty('isOffline')
      expect(typeof api.applyUpdate).toBe('function')
      expect(typeof api.checkForUpdate).toBe('function')
    })
  })
})
