/**
 * @module sw
 * @description Service Worker pour Daggerheart Companion.
 *
 * Strategie de cache :
 *   - INSTALL  : pre-cache du shell applicatif + assets Vite
 *   - FETCH    : cache-first pour assets statiques (JS, CSS, images)
 *                network-first pour navigation (HTML)
 *                fallback offline.html si tout echoue
 *   - ACTIVATE : nettoyage des anciens caches
 *
 * Le tableau PRECACHE_URLS est injecte automatiquement par le plugin
 * Vite `vite-plugin-sw-precache` apres chaque build de production.
 * En developpement, seul le shell minimal est pre-cache.
 */

const CACHE_VERSION = 'dh-v2'
const SHELL_CACHE = `${CACHE_VERSION}-shell`
const ASSETS_CACHE = `${CACHE_VERSION}-assets`

/** Shell minimal — toujours pre-cache */
const SHELL_URLS = [
  '/daggerheart-companion/',
  '/daggerheart-companion/index.html',
  '/daggerheart-companion/offline.html',
  '/daggerheart-companion/icon.svg',
  '/daggerheart-companion/icon-192.png',
  '/daggerheart-companion/icon-512.png'
]

/**
 * Assets Vite hashes — injectes automatiquement par le build.
 * @see vite-plugin-sw-precache.js
 * @placeholder PRECACHE_INJECT
 */
const PRECACHE_URLS = [
  "/daggerheart-companion/assets/AdversaryBrowser-Bl6wbvHZ.js",
  "/daggerheart-companion/assets/AdversaryBrowser-D3rBD85h.css",
  "/daggerheart-companion/assets/AdversaryPreview-B1Q_iswZ.css",
  "/daggerheart-companion/assets/AdversaryPreview-DzOE-Uqb.js",
  "/daggerheart-companion/assets/AncestryBrowser-BYbVp1qi.js",
  "/daggerheart-companion/assets/AncestryBrowser-TVCHI2Xt.css",
  "/daggerheart-companion/assets/AncestryPreview-B_t2lnL-.css",
  "/daggerheart-companion/assets/AncestryPreview-gr-ZYhsP.js",
  "/daggerheart-companion/assets/CharacterBuilder-D0dyXSeb.css",
  "/daggerheart-companion/assets/CharacterBuilder-R2f90yBr.js",
  "/daggerheart-companion/assets/ClassBrowser-BpUsGpLq.css",
  "/daggerheart-companion/assets/ClassBrowser-DIgDob20.js",
  "/daggerheart-companion/assets/ClassPreview-D6ijTC8b.css",
  "/daggerheart-companion/assets/ClassPreview-S4xLoCLV.js",
  "/daggerheart-companion/assets/CommunityBrowser-Cv2PqGYl.js",
  "/daggerheart-companion/assets/CommunityBrowser-YTF7OeaT.css",
  "/daggerheart-companion/assets/CommunityPreview-52L1lD-9.css",
  "/daggerheart-companion/assets/CommunityPreview-DxrwQ_b1.js",
  "/daggerheart-companion/assets/DiceRoller-BSTty-Jt.css",
  "/daggerheart-companion/assets/DiceRoller-CUssMnTE.js",
  "/daggerheart-companion/assets/DomainBrowser-CGPdk4Eu.css",
  "/daggerheart-companion/assets/DomainBrowser-DLs8JdQJ.js",
  "/daggerheart-companion/assets/DomainPreview-C-0Ef5-2.js",
  "/daggerheart-companion/assets/DomainPreview-DVt_bAb3.css",
  "/daggerheart-companion/assets/EncounterBuilder-D6hxuDxX.js",
  "/daggerheart-companion/assets/EncounterBuilder-jVJq3xxL.css",
  "/daggerheart-companion/assets/EncounterLive-BbePBEmN.css",
  "/daggerheart-companion/assets/EncounterLive-Bqbf2zsv.js",
  "/daggerheart-companion/assets/EnvironmentBrowser-Bnxa7guC.css",
  "/daggerheart-companion/assets/EnvironmentBrowser-Tcf2Qu9t.js",
  "/daggerheart-companion/assets/EnvironmentPreview-Do0njsGp.css",
  "/daggerheart-companion/assets/EnvironmentPreview-xNm57ZtA.js",
  "/daggerheart-companion/assets/EquipmentBrowser-B_xwmZi1.js",
  "/daggerheart-companion/assets/EquipmentBrowser-BraiqatM.css",
  "/daggerheart-companion/assets/EquipmentPreview-3oLve2uq.js",
  "/daggerheart-companion/assets/EquipmentPreview-CFltsI1x.css",
  "/daggerheart-companion/assets/ErrorFallback-BHtzsiJE.js",
  "/daggerheart-companion/assets/ErrorFallback-CoQ9u1ob.css",
  "/daggerheart-companion/assets/GlossaryText-Pg6B_eBX.js",
  "/daggerheart-companion/assets/GlossaryText-nItlduw7.css",
  "/daggerheart-companion/assets/HomebrewAdversaryEditor-DPZHCM_v.css",
  "/daggerheart-companion/assets/HomebrewAdversaryEditor-DsOqJ6vx.js",
  "/daggerheart-companion/assets/HomebrewAdversaryList-Bp2vJXA5.js",
  "/daggerheart-companion/assets/HomebrewAdversaryList-nN2-qo8V.css",
  "/daggerheart-companion/assets/HomebrewAncestryEditor-4uiqgaAt.js",
  "/daggerheart-companion/assets/HomebrewAncestryEditor-DhKuzXUL.css",
  "/daggerheart-companion/assets/HomebrewAncestryList-6qAkUkcM.css",
  "/daggerheart-companion/assets/HomebrewAncestryList-Co6gzYix.js",
  "/daggerheart-companion/assets/HomebrewClassEditor-BH5L85P5.css",
  "/daggerheart-companion/assets/HomebrewClassEditor-C_hyfRFp.js",
  "/daggerheart-companion/assets/HomebrewClassList-CcPGa-wR.css",
  "/daggerheart-companion/assets/HomebrewClassList-DBhFp9rt.js",
  "/daggerheart-companion/assets/HomebrewCommunityEditor-BbI3HCuW.js",
  "/daggerheart-companion/assets/HomebrewCommunityEditor-cUY0s1Yl.css",
  "/daggerheart-companion/assets/HomebrewCommunityList-B-xXT8v-.js",
  "/daggerheart-companion/assets/HomebrewCommunityList-DuTv1264.css",
  "/daggerheart-companion/assets/HomebrewDomainEditor-DjlgJtiX.css",
  "/daggerheart-companion/assets/HomebrewDomainEditor-qhkhESw7.js",
  "/daggerheart-companion/assets/HomebrewDomainList-B2pUKFiF.css",
  "/daggerheart-companion/assets/HomebrewDomainList-CKzoiyF1.js",
  "/daggerheart-companion/assets/HomebrewEnvironmentEditor-B3p6ArCq.js",
  "/daggerheart-companion/assets/HomebrewEnvironmentEditor-BAvlHPXf.css",
  "/daggerheart-companion/assets/HomebrewEnvironmentList-C6NmNaWv.js",
  "/daggerheart-companion/assets/HomebrewEnvironmentList-CCidQrxO.css",
  "/daggerheart-companion/assets/HomebrewEquipmentEditor-CvmMdleN.css",
  "/daggerheart-companion/assets/HomebrewEquipmentEditor-D0zd08iL.js",
  "/daggerheart-companion/assets/HomebrewEquipmentList-G26ObxzH.css",
  "/daggerheart-companion/assets/HomebrewEquipmentList-oPKkUD7W.js",
  "/daggerheart-companion/assets/HomebrewHub-BM1W6Q0W.css",
  "/daggerheart-companion/assets/HomebrewHub-C_qL4KdZ.js",
  "/daggerheart-companion/assets/ImportExportPanel-CA41Lw7C.css",
  "/daggerheart-companion/assets/ImportExportPanel-Cj0_vHF9.js",
  "/daggerheart-companion/assets/ModuleBoundary-BA-smUzW.js",
  "/daggerheart-companion/assets/SyncManager-DMGKYyi1.css",
  "/daggerheart-companion/assets/SyncManager-Nnwywzvz.js",
  "/daggerheart-companion/assets/armor-D_PkxIPt.js",
  "/daggerheart-companion/assets/characterStore-BhGU355A.js",
  "/daggerheart-companion/assets/constants-pxySCpzO.js",
  "/daggerheart-companion/assets/encounterLiveStore-DHIDUuxr.js",
  "/daggerheart-companion/assets/index-BcvPzgHK.js",
  "/daggerheart-companion/assets/index-C4RYIWwI.js",
  "/daggerheart-companion/assets/index-C8vqX9JE.js",
  "/daggerheart-companion/assets/index-CPJrj36G.js",
  "/daggerheart-companion/assets/index-CkPzaEF2.css",
  "/daggerheart-companion/assets/index-Ddj42QsF.js",
  "/daggerheart-companion/assets/index-lrxOJ4tc.js",
  "/daggerheart-companion/assets/index-wo3i38a5.js",
  "/daggerheart-companion/assets/useAdversaryHomebrewStore-CkWr9z8b.js",
  "/daggerheart-companion/assets/useAncestryHomebrewStore-CJDl6oPi.js",
  "/daggerheart-companion/assets/useClassHomebrewStore-B3XkJ4M8.js",
  "/daggerheart-companion/assets/useCommunityHomebrewStore-BQ5gNT2N.js",
  "/daggerheart-companion/assets/useDomainHomebrewStore-Do841bpi.js",
  "/daggerheart-companion/assets/useEnvironmentHomebrewStore-DNvRE7gm.js",
  "/daggerheart-companion/assets/useEquipmentHomebrewStore-CC3wkwMW.js",
  "/daggerheart-companion/assets/useFormSchema-CrX80hUc.css",
  "/daggerheart-companion/assets/useFormSchema-DQYNe-e7.js",
  "/daggerheart-companion/assets/useHomebrewStore-CMY1gtvg.js",
  "/daggerheart-companion/assets/useStorage-DRqd9Mzr.js"
]

// ── Install : pre-cache du shell + assets ──

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(SHELL_CACHE)
        .then((cache) => cache.addAll(SHELL_URLS)),
      PRECACHE_URLS.length > 0
        ? caches.open(ASSETS_CACHE)
          .then((cache) => cache.addAll(PRECACHE_URLS))
        : Promise.resolve()
    ]).then(() => self.skipWaiting())
  )
})

// ── Activate : nettoyage des anciens caches ──

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== ASSETS_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ── Fetch : strategie differenciee ──

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Ignorer les requetes non-GET et les requetes hors origine
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Navigation (HTML) : network-first avec fallback offline.html
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigation(request))
    return
  }

  // Assets statiques (JS, CSS, images, fonts) : cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstWithNetwork(request, ASSETS_CACHE))
    return
  }

  // Autres requetes : network-first
  event.respondWith(networkFirstWithFallback(request, SHELL_CACHE))
})

// ── Strategies de cache ──

/**
 * Navigation : network-first → cache index.html → offline.html.
 * Trois niveaux de fallback pour ne jamais afficher une erreur brute.
 */
async function handleNavigation(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(SHELL_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Niveau 1 : page demandee en cache
    const cached = await caches.match(request)
    if (cached) return cached

    // Niveau 2 : index.html (SPA routing)
    const index = await caches.match('/daggerheart-companion/index.html')
    if (index) return index

    // Niveau 3 : page offline dediee
    const offline = await caches.match('/daggerheart-companion/offline.html')
    if (offline) return offline

    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

/**
 * Cache-first : verifie le cache d'abord, reseau en fallback.
 * Ideal pour les assets hashes (immutables).
 */
async function cacheFirstWithNetwork(request, cacheName) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

/**
 * Network-first : tente le reseau, fallback sur le cache.
 * Ideal pour les requetes dynamiques.
 */
async function networkFirstWithFallback(request, cacheName) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(cacheName)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

// ── Helpers ──

/**
 * Determine si une URL est un asset statique cacheable.
 * Les fichiers Vite ont un hash dans leur nom → immutables.
 */
function isStaticAsset(pathname) {
  return /\.(js|css|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|webp|ico)$/i.test(pathname)
}

// ── Communication avec le client ──

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
