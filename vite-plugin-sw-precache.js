/**
 * @module vite-plugin-sw-precache
 * @description Plugin Vite qui injecte la liste des assets buildes
 * dans le Service Worker apres chaque build de production.
 *
 * Fonctionnement :
 *   1. Apres la generation du bundle (closeBundle), scanne dist/assets/
 *   2. Genere la liste des URLs prefixees par la base path
 *   3. Remplace `const PRECACHE_URLS = []` dans dist/sw.js
 *
 * @example
 * // vite.config.js
 * import { swPrecache } from './vite-plugin-sw-precache'
 * export default defineConfig({
 *   plugins: [vue(), swPrecache()]
 * })
 */

import { readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'

/**
 * Extensions d'assets a pre-cacher.
 * On inclut JS, CSS et les fichiers multimedia courants.
 */
const PRECACHE_EXTENSIONS = new Set([
  '.js', '.css', '.woff2', '.woff', '.ttf', '.svg', '.png', '.jpg', '.webp', '.ico'
])

/**
 * @param {Object} [options]
 * @param {string} [options.swFilename='sw.js'] - Nom du fichier SW dans dist/
 * @param {string[]} [options.extensions] - Extensions a inclure (override)
 * @returns {import('vite').Plugin}
 */
export function swPrecache(options = {}) {
  const swFilename = options.swFilename || 'sw.js'
  const extensions = options.extensions
    ? new Set(options.extensions)
    : PRECACHE_EXTENSIONS

  let resolvedConfig = null

  return {
    name: 'vite-plugin-sw-precache',
    enforce: 'post',

    configResolved(config) {
      resolvedConfig = config
    },

    async closeBundle() {
      // Ne rien faire en mode dev/watch
      if (resolvedConfig.command !== 'build') return

      const outDir = resolvedConfig.build.outDir || 'dist'
      const base = resolvedConfig.base || '/'
      const distPath = resolve(resolvedConfig.root, outDir)
      const swPath = join(distPath, swFilename)

      try {
        // 1. Lire le SW
        const swContent = await readFile(swPath, 'utf-8')

        // 2. Scanner le dossier assets
        const assetsDir = join(distPath, 'assets')
        let assetFiles = []
        try {
          assetFiles = await readdir(assetsDir)
        } catch {
          console.warn('[sw-precache] Aucun dossier assets/ trouve, skip.')
          return
        }

        // 3. Filtrer par extension
        const assetUrls = assetFiles
          .filter((file) => {
            const ext = '.' + file.split('.').pop().toLowerCase()
            return extensions.has(ext)
          })
          .map((file) => `${base}assets/${file}`)
          .sort()

        // 4. Generer le remplacement
        const urlsArray = JSON.stringify(assetUrls, null, 2)
        const newContent = swContent.replace(
          'const PRECACHE_URLS = []',
          `const PRECACHE_URLS = ${urlsArray}`
        )

        // 5. Ecrire le SW modifie
        await writeFile(swPath, newContent, 'utf-8')

        console.log(`[sw-precache] ${assetUrls.length} assets injectes dans ${swFilename}`)
      } catch (err) {
        console.error('[sw-precache] Erreur:', err.message)
      }
    }
  }
}
