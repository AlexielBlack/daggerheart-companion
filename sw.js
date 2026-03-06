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
  "/daggerheart-companion/assets/AdversaryBrowser-DbEL3WjG.js",
  "/daggerheart-companion/assets/AdversaryBrowser-Yb9B7_Xm.css",
  "/daggerheart-companion/assets/AdversaryPreview-B1Q_iswZ.css",
  "/daggerheart-companion/assets/AdversaryPreview-D9nvFxRO.js",
  "/daggerheart-companion/assets/AncestryBrowser-CYMEjIsV.css",
  "/daggerheart-companion/assets/AncestryBrowser-Dzf1BiCF.js",
  "/daggerheart-companion/assets/AncestryPreview-B_t2lnL-.css",
  "/daggerheart-companion/assets/AncestryPreview-CFHgd6BQ.js",
  "/daggerheart-companion/assets/CharacterBuilder-BEmZPoS2.js",
  "/daggerheart-companion/assets/CharacterBuilder-DJS-AW7z.css",
  "/daggerheart-companion/assets/ClassBrowser-QHwibLu4.css",
  "/daggerheart-companion/assets/ClassBrowser-QfM241HV.js",
  "/daggerheart-companion/assets/ClassPreview-D6ijTC8b.css",
  "/daggerheart-companion/assets/ClassPreview-yx7jiL14.js",
  "/daggerheart-companion/assets/CommunityBrowser-DzBmmW6J.js",
  "/daggerheart-companion/assets/CommunityBrowser-NO4bjp_J.css",
  "/daggerheart-companion/assets/CommunityPreview-52L1lD-9.css",
  "/daggerheart-companion/assets/CommunityPreview-Bo2Vchdh.js",
  "/daggerheart-companion/assets/DiceRoller-BQ2coUgs.css",
  "/daggerheart-companion/assets/DiceRoller-C3u3GEq4.js",
  "/daggerheart-companion/assets/DomainBrowser-5_KUhSWZ.js",
  "/daggerheart-companion/assets/DomainBrowser-B6ZJ87kB.css",
  "/daggerheart-companion/assets/DomainPreview-C3vzgOYJ.js",
  "/daggerheart-companion/assets/DomainPreview-DVt_bAb3.css",
  "/daggerheart-companion/assets/EncounterBuilder-Cb0c6I3m.js",
  "/daggerheart-companion/assets/EncounterBuilder-SU2a2ew7.css",
  "/daggerheart-companion/assets/EncounterLive-Caq-mQVo.css",
  "/daggerheart-companion/assets/EncounterLive-Sky6chBR.js",
  "/daggerheart-companion/assets/EnvironmentBrowser-BW9rohWL.css",
  "/daggerheart-companion/assets/EnvironmentBrowser-DlpyPv6a.js",
  "/daggerheart-companion/assets/EnvironmentPreview-DD4m-6ER.js",
  "/daggerheart-companion/assets/EnvironmentPreview-Do0njsGp.css",
  "/daggerheart-companion/assets/EquipmentBrowser-D9ltWqCC.js",
  "/daggerheart-companion/assets/EquipmentBrowser-zCoRVKCU.css",
  "/daggerheart-companion/assets/EquipmentPreview-CFltsI1x.css",
  "/daggerheart-companion/assets/EquipmentPreview-DdlU5k_E.js",
  "/daggerheart-companion/assets/ErrorFallback-CMV49CVT.js",
  "/daggerheart-companion/assets/ErrorFallback-CoQ9u1ob.css",
  "/daggerheart-companion/assets/GlossaryText-Bx3LCiTc.js",
  "/daggerheart-companion/assets/GlossaryText-nItlduw7.css",
  "/daggerheart-companion/assets/HomebrewAdversaryEditor-D3dY2fnY.css",
  "/daggerheart-companion/assets/HomebrewAdversaryEditor-DqT0ccRV.js",
  "/daggerheart-companion/assets/HomebrewAdversaryList-DP3BGOce.js",
  "/daggerheart-companion/assets/HomebrewAdversaryList-uGBPk8dK.css",
  "/daggerheart-companion/assets/HomebrewAncestryEditor-2LC6R3Ro.js",
  "/daggerheart-companion/assets/HomebrewAncestryEditor-C9UASdqE.css",
  "/daggerheart-companion/assets/HomebrewAncestryList-6vu7JnyP.js",
  "/daggerheart-companion/assets/HomebrewAncestryList-DTlKfXMB.css",
  "/daggerheart-companion/assets/HomebrewClassEditor-BaIMw-aj.js",
  "/daggerheart-companion/assets/HomebrewClassEditor-BvY37yrp.css",
  "/daggerheart-companion/assets/HomebrewClassList-CsPuqxd2.js",
  "/daggerheart-companion/assets/HomebrewClassList-r_zTLcYw.css",
  "/daggerheart-companion/assets/HomebrewCommunityEditor-BwXqmm-g.js",
  "/daggerheart-companion/assets/HomebrewCommunityEditor-CLbiP9_s.css",
  "/daggerheart-companion/assets/HomebrewCommunityList-Bd1Fu4uH.css",
  "/daggerheart-companion/assets/HomebrewCommunityList-DB9yQpDN.js",
  "/daggerheart-companion/assets/HomebrewDomainEditor-5j82V60v.css",
  "/daggerheart-companion/assets/HomebrewDomainEditor-h1wC2Ahy.js",
  "/daggerheart-companion/assets/HomebrewDomainList-DGKL-gxq.js",
  "/daggerheart-companion/assets/HomebrewDomainList-DHLlZUdn.css",
  "/daggerheart-companion/assets/HomebrewEnvironmentEditor-BmuI1_po.js",
  "/daggerheart-companion/assets/HomebrewEnvironmentEditor-D1M1UoQh.css",
  "/daggerheart-companion/assets/HomebrewEnvironmentList-CWy4y1u-.js",
  "/daggerheart-companion/assets/HomebrewEnvironmentList-bk-uWExC.css",
  "/daggerheart-companion/assets/HomebrewEquipmentEditor-BQBxqEo7.js",
  "/daggerheart-companion/assets/HomebrewEquipmentEditor-BnXn5pkQ.css",
  "/daggerheart-companion/assets/HomebrewEquipmentList-DdMvN5D7.css",
  "/daggerheart-companion/assets/HomebrewEquipmentList-mHUf7CLi.js",
  "/daggerheart-companion/assets/HomebrewHub-DGdZz3fe.js",
  "/daggerheart-companion/assets/HomebrewHub-Ddv9HfES.css",
  "/daggerheart-companion/assets/ImportExportPanel-BhWe92_N.js",
  "/daggerheart-companion/assets/ImportExportPanel-DLBBnkGs.css",
  "/daggerheart-companion/assets/NpcManager-B7jZ-T2x.css",
  "/daggerheart-companion/assets/NpcManager-CzVKPtgK.js",
  "/daggerheart-companion/assets/SyncManager-C7RjLSUo.css",
  "/daggerheart-companion/assets/SyncManager-DVcr-nxm.js",
  "/daggerheart-companion/assets/adversaryStore-DxRUq2oC.js",
  "/daggerheart-companion/assets/adversaryTypeBenchmarks-BEGA5biz.js",
  "/daggerheart-companion/assets/armor-C5omxsky.js",
  "/daggerheart-companion/assets/characterStore-_pSfi2o8.js",
  "/daggerheart-companion/assets/constants-pxySCpzO.js",
  "/daggerheart-companion/assets/encounterLiveStore-BPWQ132o.js",
  "/daggerheart-companion/assets/index-C4RYIWwI.js",
  "/daggerheart-companion/assets/index-C8vqX9JE.js",
  "/daggerheart-companion/assets/index-CDSJ7xKK.css",
  "/daggerheart-companion/assets/index-CFmGe8th.js",
  "/daggerheart-companion/assets/index-CPJrj36G.js",
  "/daggerheart-companion/assets/index-CyCulyx_.js",
  "/daggerheart-companion/assets/index-DZi0yphU.js",
  "/daggerheart-companion/assets/index-bLfP8MU2.js",
  "/daggerheart-companion/assets/index-ngeemEOo.js",
  "/daggerheart-companion/assets/useAdversaryHomebrewStore-B8ZqjBWi.js",
  "/daggerheart-companion/assets/useAncestryHomebrewStore-BQ0i1uLw.js",
  "/daggerheart-companion/assets/useClassHomebrewStore-Dl-1oq15.js",
  "/daggerheart-companion/assets/useCommunityHomebrewStore-C-LCU5wf.js",
  "/daggerheart-companion/assets/useDomainHomebrewStore-QFU1Bb1b.js",
  "/daggerheart-companion/assets/useEnvironmentHomebrewStore-CGsDWpG1.js",
  "/daggerheart-companion/assets/useEquipmentHomebrewStore-DgXocC16.js",
  "/daggerheart-companion/assets/useFocusTrap-CyhHxdw9.js",
  "/daggerheart-companion/assets/useFormSchema-Dj9biJNZ.js",
  "/daggerheart-companion/assets/useFormSchema-OgZAfj0j.css",
  "/daggerheart-companion/assets/useHomebrewStore-DWJB3nN7.js",
  "/daggerheart-companion/assets/useStorage-DKn3IprS.js"
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
