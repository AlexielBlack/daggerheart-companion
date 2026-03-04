/**
 * @module __test-setup__/node-globals
 * @description Fournit des stubs minimaux pour les globales navigateur
 * (localStorage, sessionStorage, window, navigator) en environnement node.
 * Chargé automatiquement par vitest pour éviter jsdom sur les tests de stores.
 */

if (typeof globalThis.localStorage === 'undefined') {
  const createStorageMock = () => {
    let store = {}
    return {
      getItem: (key) => (key in store ? store[key] : null),
      setItem: (key, value) => { store[key] = String(value) },
      removeItem: (key) => { delete store[key] },
      clear: () => { store = {} },
      get length() { return Object.keys(store).length },
      key: (i) => Object.keys(store)[i] ?? null
    }
  }
  globalThis.localStorage = createStorageMock()
  globalThis.sessionStorage = createStorageMock()
}

if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis
}
// Ensure window has event methods even if it was already defined
if (!globalThis.window.addEventListener) {
  globalThis.window.addEventListener = () => {}
  globalThis.window.removeEventListener = () => {}
  globalThis.window.dispatchEvent = () => true
  globalThis.window.matchMedia = () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} })
}

if (typeof globalThis.navigator === 'undefined') {
  globalThis.navigator = { userAgent: 'node-test', onLine: true }
}

if (typeof globalThis.document === 'undefined') {
  const noop = () => ({})
  const createEl = () => ({
    style: {},
    setAttribute: noop,
    getAttribute: () => null,
    addEventListener: noop,
    removeEventListener: noop,
    appendChild: noop,
    removeChild: noop,
    insertBefore: noop,
    cloneNode: () => createEl(),
    contains: () => false,
    childNodes: [],
    children: [],
    textContent: '',
    innerHTML: '',
    ownerDocument: null,
    parentNode: null,
    nextSibling: null,
    tagName: 'DIV',
    nodeType: 1
  })
  globalThis.document = {
    title: '',
    createElement: createEl,
    createElementNS: () => createEl(),
    createTextNode: (text) => ({ nodeType: 3, textContent: text }),
    createComment: (text) => ({ nodeType: 8, textContent: text }),
    createDocumentFragment: () => ({ ...createEl(), nodeType: 11 }),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    head: createEl(),
    body: createEl(),
    documentElement: { setAttribute: noop, getAttribute: () => null, style: {} },
    addEventListener: noop,
    removeEventListener: noop
  }
}
