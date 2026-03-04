// @vitest-environment jsdom
/**
 * @module core/__tests__/installPrompt.test
 * @description Tests du composable useInstallPrompt.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  useInstallPrompt,
  initInstallPrompt,
  promptInstall,
  _resetInstallPrompt
} from '@core/composables/useInstallPrompt'

// ── Helpers ──

/**
 * Cree un faux evenement beforeinstallprompt.
 * @param {'accepted'|'dismissed'} outcome
 */
function createFakePromptEvent(outcome = 'accepted') {
  return {
    preventDefault: vi.fn(),
    prompt: vi.fn(),
    userChoice: Promise.resolve({ outcome })
  }
}

/** Simule l'evenement beforeinstallprompt sur window */
function fireBeforeInstallPrompt(event) {
  const e = event || createFakePromptEvent()
  window.dispatchEvent(
    Object.assign(new Event('beforeinstallprompt'), {
      preventDefault: e.preventDefault,
      prompt: e.prompt,
      userChoice: e.userChoice
    })
  )
  return e
}

/** Simule l'evenement appinstalled */
function fireAppInstalled() {
  window.dispatchEvent(new Event('appinstalled'))
}

describe('useInstallPrompt', () => {
  beforeEach(() => {
    _resetInstallPrompt()
    // Mock matchMedia pour jsdom
    if (!window.matchMedia) {
      window.matchMedia = vi.fn().mockReturnValue({ matches: false })
    }
  })

  afterEach(() => {
    _resetInstallPrompt()
  })

  // ── Etat initial ──

  describe('etat initial', () => {
    it('canInstall est false au demarrage', () => {
      const { canInstall } = useInstallPrompt()
      expect(canInstall.value).toBe(false)
    })

    it('isInstalled est false au demarrage', () => {
      const { isInstalled } = useInstallPrompt()
      expect(isInstalled.value).toBe(false)
    })

    it('installOutcome est null au demarrage', () => {
      const { installOutcome } = useInstallPrompt()
      expect(installOutcome.value).toBeNull()
    })

    it('les refs sont readonly (valeur inchangee apres tentative de mutation)', () => {
      const { canInstall, isInstalled, installOutcome } = useInstallPrompt()
      canInstall.value = true
      expect(canInstall.value).toBe(false)
      isInstalled.value = true
      expect(isInstalled.value).toBe(false)
      installOutcome.value = 'x'
      expect(installOutcome.value).toBeNull()
    })
  })

  // ── initInstallPrompt ──

  describe('initInstallPrompt', () => {
    it('capture beforeinstallprompt et active canInstall', () => {
      initInstallPrompt()
      const { canInstall } = useInstallPrompt()

      expect(canInstall.value).toBe(false)

      const fakeEvent = createFakePromptEvent()
      fireBeforeInstallPrompt(fakeEvent)

      expect(canInstall.value).toBe(true)
    })

    it('appelle preventDefault sur l evenement', () => {
      initInstallPrompt()

      const fakeEvent = createFakePromptEvent()
      // Dispatch manuellement pour pouvoir vérifier preventDefault
      const event = new Event('beforeinstallprompt', { cancelable: true })
      event.prompt = fakeEvent.prompt
      event.userChoice = fakeEvent.userChoice
      event.preventDefault = fakeEvent.preventDefault
      window.dispatchEvent(event)

      expect(fakeEvent.preventDefault).toHaveBeenCalled()
    })

    it('est idempotent — n enregistre les listeners qu une fois', () => {
      initInstallPrompt()
      initInstallPrompt()
      initInstallPrompt()

      // Un seul beforeinstallprompt devrait suffire
      fireBeforeInstallPrompt()
      const { canInstall } = useInstallPrompt()
      expect(canInstall.value).toBe(true)
    })

    it('detecte appinstalled', () => {
      initInstallPrompt()
      const { isInstalled, canInstall } = useInstallPrompt()

      // Simuler un prompt d'abord
      fireBeforeInstallPrompt()
      expect(canInstall.value).toBe(true)

      // Puis l'installation
      fireAppInstalled()
      expect(isInstalled.value).toBe(true)
      expect(canInstall.value).toBe(false)
    })
  })

  // ── promptInstall ──

  describe('promptInstall', () => {
    it('retourne null si pas de prompt differe', async () => {
      const result = await promptInstall()
      expect(result).toBeNull()
    })

    it('declenche le prompt natif et retourne accepted', async () => {
      initInstallPrompt()

      // Capturer un faux event
      const fakeEvent = createFakePromptEvent('accepted')
      const event = new Event('beforeinstallprompt', { cancelable: true })
      event.preventDefault = fakeEvent.preventDefault
      event.prompt = fakeEvent.prompt
      event.userChoice = fakeEvent.userChoice
      window.dispatchEvent(event)

      const { canInstall, installOutcome } = useInstallPrompt()
      expect(canInstall.value).toBe(true)

      const result = await promptInstall()
      expect(result).toBe('accepted')
      expect(fakeEvent.prompt).toHaveBeenCalled()
      expect(installOutcome.value).toBe('accepted')
      expect(canInstall.value).toBe(false)
    })

    it('gere le cas dismissed', async () => {
      initInstallPrompt()

      const fakeEvent = createFakePromptEvent('dismissed')
      const event = new Event('beforeinstallprompt', { cancelable: true })
      event.preventDefault = fakeEvent.preventDefault
      event.prompt = fakeEvent.prompt
      event.userChoice = fakeEvent.userChoice
      window.dispatchEvent(event)

      const { installOutcome } = useInstallPrompt()

      const result = await promptInstall()
      expect(result).toBe('dismissed')
      expect(installOutcome.value).toBe('dismissed')
    })

    it('ne peut etre utilise qu une fois', async () => {
      initInstallPrompt()

      const fakeEvent = createFakePromptEvent('accepted')
      const event = new Event('beforeinstallprompt', { cancelable: true })
      event.preventDefault = fakeEvent.preventDefault
      event.prompt = fakeEvent.prompt
      event.userChoice = fakeEvent.userChoice
      window.dispatchEvent(event)

      await promptInstall()
      const secondResult = await promptInstall()
      expect(secondResult).toBeNull()
      expect(fakeEvent.prompt).toHaveBeenCalledTimes(1)
    })

    it('gere les erreurs gracieusement', async () => {
      initInstallPrompt()

      const fakeEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn(() => { throw new Error('Browser error') }),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      }
      const event = new Event('beforeinstallprompt', { cancelable: true })
      event.preventDefault = fakeEvent.preventDefault
      event.prompt = fakeEvent.prompt
      event.userChoice = fakeEvent.userChoice
      window.dispatchEvent(event)

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const result = await promptInstall()
      expect(result).toBeNull()
      consoleSpy.mockRestore()
    })
  })

  // ── _resetInstallPrompt ──

  describe('_resetInstallPrompt', () => {
    it('remet tout a zero', () => {
      initInstallPrompt()
      fireBeforeInstallPrompt()

      const { canInstall } = useInstallPrompt()
      expect(canInstall.value).toBe(true)

      _resetInstallPrompt()

      const after = useInstallPrompt()
      expect(after.canInstall.value).toBe(false)
      expect(after.isInstalled.value).toBe(false)
      expect(after.installOutcome.value).toBeNull()
    })
  })

  // ── API publique ──

  describe('API publique', () => {
    it('useInstallPrompt retourne la bonne forme', () => {
      const api = useInstallPrompt()
      expect(api).toHaveProperty('canInstall')
      expect(api).toHaveProperty('isInstalled')
      expect(api).toHaveProperty('installOutcome')
      expect(typeof api.promptInstall).toBe('function')
      expect(typeof api.initInstallPrompt).toBe('function')
    })
  })
})
