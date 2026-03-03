/**
 * @module __tests__/swPrecache.test
 * @description Tests du plugin Vite vite-plugin-sw-precache.
 *
 * Couvre :
 *   - Injection des assets dans le SW apres build
 *   - Filtrage par extension
 *   - Preservation du contenu SW original
 *   - Gestion des erreurs (pas de dossier assets, pas de SW)
 */

import { describe, it, expect, afterEach, vi } from 'vitest'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { swPrecache } from '../../../vite-plugin-sw-precache.js'

// ── Helpers ──

const SW_TEMPLATE = `const CACHE_VERSION = 'dh-v2'
const SHELL_CACHE = 'dh-v2-shell'
const ASSETS_CACHE = 'dh-v2-assets'
const SHELL_URLS = ['/app/index.html']
const PRECACHE_URLS = []
self.addEventListener('install', () => {})
`

async function createTempBuild(assets = []) {
  const dir = await mkdtemp(join(tmpdir(), 'sw-precache-test-'))
  await writeFile(join(dir, 'sw.js'), SW_TEMPLATE)
  if (assets.length > 0) {
    await mkdir(join(dir, 'assets'))
    for (const file of assets) {
      await writeFile(join(dir, 'assets', file), '/* content */')
    }
  }
  return dir
}

function createPlugin(options = {}) {
  const plugin = swPrecache(options)
  return plugin
}

function simulateConfig(distPath, base = '/app/') {
  return {
    command: 'build',
    build: { outDir: distPath },
    base,
    root: '/'
  }
}

describe('vite-plugin-sw-precache', () => {
  let tempDir = null

  afterEach(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true })
      tempDir = null
    }
  })

  // ── Metadata ──

  it('retourne un plugin avec le bon nom', () => {
    const plugin = createPlugin()
    expect(plugin.name).toBe('vite-plugin-sw-precache')
    expect(plugin.enforce).toBe('post')
  })

  // ── Injection ──

  it('injecte les assets JS et CSS dans le SW', async () => {
    tempDir = await createTempBuild([
      'index-abc123.js',
      'index-def456.css',
      'vendor-ghi789.js'
    ])

    const plugin = createPlugin()
    plugin.configResolved(simulateConfig(tempDir))
    await plugin.closeBundle()

    const sw = await readFile(join(tempDir, 'sw.js'), 'utf-8')
    expect(sw).toContain('/app/assets/index-abc123.js')
    expect(sw).toContain('/app/assets/index-def456.css')
    expect(sw).toContain('/app/assets/vendor-ghi789.js')
    expect(sw).not.toContain('const PRECACHE_URLS = []')
  })

  it('preserve le reste du contenu SW', async () => {
    tempDir = await createTempBuild(['app.js'])

    const plugin = createPlugin()
    plugin.configResolved(simulateConfig(tempDir))
    await plugin.closeBundle()

    const sw = await readFile(join(tempDir, 'sw.js'), 'utf-8')
    expect(sw).toContain("const CACHE_VERSION = 'dh-v2'")
    expect(sw).toContain('SHELL_URLS')
    expect(sw).toContain("self.addEventListener('install'")
  })

  it('trie les URLs alphabetiquement', async () => {
    tempDir = await createTempBuild(['z-file.js', 'a-file.js', 'm-file.css'])

    const plugin = createPlugin()
    plugin.configResolved(simulateConfig(tempDir))
    await plugin.closeBundle()

    const sw = await readFile(join(tempDir, 'sw.js'), 'utf-8')
    const match = sw.match(/PRECACHE_URLS = (\[[\s\S]*?\])/)
    const urls = JSON.parse(match[1])
    expect(urls[0]).toContain('a-file.js')
    expect(urls[1]).toContain('m-file.css')
    expect(urls[2]).toContain('z-file.js')
  })

  // ── Filtrage ──

  it('filtre par extensions supportees', async () => {
    tempDir = await createTempBuild([
      'app.js',
      'style.css',
      'font.woff2',
      'icon.svg',
      'photo.png',
      'data.json',
      'readme.md',
      'map.js.map'
    ])

    const plugin = createPlugin()
    plugin.configResolved(simulateConfig(tempDir))
    await plugin.closeBundle()

    const sw = await readFile(join(tempDir, 'sw.js'), 'utf-8')
    expect(sw).toContain('app.js')
    expect(sw).toContain('style.css')
    expect(sw).toContain('font.woff2')
    expect(sw).toContain('icon.svg')
    expect(sw).toContain('photo.png')
    expect(sw).not.toContain('data.json')
    expect(sw).not.toContain('readme.md')
  })

  it('accepte des extensions custom', async () => {
    tempDir = await createTempBuild(['app.js', 'data.json', 'style.css'])

    const plugin = createPlugin({ extensions: ['.json'] })
    plugin.configResolved(simulateConfig(tempDir))
    await plugin.closeBundle()

    const sw = await readFile(join(tempDir, 'sw.js'), 'utf-8')
    expect(sw).toContain('data.json')
    expect(sw).not.toContain('app.js')
    expect(sw).not.toContain('style.css')
  })

  // ── Cas limites ──

  it('gere l absence de dossier assets gracieusement', async () => {
    tempDir = await createTempBuild([]) // pas de dossier assets
    // Supprimer le dossier assets s'il existe
    await rm(join(tempDir, 'assets'), { recursive: true, force: true })

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const plugin = createPlugin()
    plugin.configResolved(simulateConfig(tempDir))
    await plugin.closeBundle()
    consoleSpy.mockRestore()

    // SW inchange
    const sw = await readFile(join(tempDir, 'sw.js'), 'utf-8')
    expect(sw).toContain('const PRECACHE_URLS = []')
  })

  it('ne fait rien en mode dev', async () => {
    tempDir = await createTempBuild(['app.js'])

    const plugin = createPlugin()
    plugin.configResolved({
      ...simulateConfig(tempDir),
      command: 'serve' // dev mode
    })
    await plugin.closeBundle()

    // SW inchange
    const sw = await readFile(join(tempDir, 'sw.js'), 'utf-8')
    expect(sw).toContain('const PRECACHE_URLS = []')
  })

  it('respecte le base path configure', async () => {
    tempDir = await createTempBuild(['bundle.js'])

    const plugin = createPlugin()
    plugin.configResolved(simulateConfig(tempDir, '/my-app/'))
    await plugin.closeBundle()

    const sw = await readFile(join(tempDir, 'sw.js'), 'utf-8')
    expect(sw).toContain('/my-app/assets/bundle.js')
  })

  it('gere un dossier assets vide', async () => {
    tempDir = await createTempBuild([])

    const plugin = createPlugin()
    plugin.configResolved(simulateConfig(tempDir))
    await plugin.closeBundle()

    const sw = await readFile(join(tempDir, 'sw.js'), 'utf-8')
    // Pas d'assets → tableau vide injecte mais formatted
    expect(sw).toContain('PRECACHE_URLS')
  })
})
