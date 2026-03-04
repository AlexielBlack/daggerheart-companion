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
  "/daggerheart-companion/assets/AdversaryBrowser-CoCIY6dw.js",
  "/daggerheart-companion/assets/AdversaryBrowser-D3rBD85h.css",
  "/daggerheart-companion/assets/AdversaryPreview-B1Q_iswZ.css",
  "/daggerheart-companion/assets/AdversaryPreview-D-Ywauk6.js",
  "/daggerheart-companion/assets/AncestryBrowser-BqVIJ3oS.js",
  "/daggerheart-companion/assets/AncestryBrowser-TVCHI2Xt.css",
  "/daggerheart-companion/assets/AncestryPreview-B_t2lnL-.css",
  "/daggerheart-companion/assets/AncestryPreview-lSoYYgDm.js",
  "/daggerheart-companion/assets/CharacterBuilder-BOEOk0SF.js",
  "/daggerheart-companion/assets/CharacterBuilder-D0dyXSeb.css",
  "/daggerheart-companion/assets/ClassBrowser-BpUsGpLq.css",
  "/daggerheart-companion/assets/ClassBrowser-DIAGjL6A.js",
  "/daggerheart-companion/assets/ClassPreview-D6ijTC8b.css",
  "/daggerheart-companion/assets/ClassPreview-NMHxiQRZ.js",
  "/daggerheart-companion/assets/CommunityBrowser-CcSTPrEL.js",
  "/daggerheart-companion/assets/CommunityBrowser-YTF7OeaT.css",
  "/daggerheart-companion/assets/CommunityPreview-52L1lD-9.css",
  "/daggerheart-companion/assets/CommunityPreview-BWxc1Gd0.js",
  "/daggerheart-companion/assets/DiceRoller-BSTty-Jt.css",
  "/daggerheart-companion/assets/DiceRoller-_v-25_Q9.js",
  "/daggerheart-companion/assets/DomainBrowser-Ben4AAIr.js",
  "/daggerheart-companion/assets/DomainBrowser-CGPdk4Eu.css",
  "/daggerheart-companion/assets/DomainPreview-8mtEFKkF.js",
  "/daggerheart-companion/assets/DomainPreview-DVt_bAb3.css",
  "/daggerheart-companion/assets/EncounterBuilder-BOzHZa-Y.js",
  "/daggerheart-companion/assets/EncounterBuilder-jVJq3xxL.css",
  "/daggerheart-companion/assets/EncounterLive-DdRE6o9O.js",
  "/daggerheart-companion/assets/EncounterLive-FDjtKy_K.css",
  "/daggerheart-companion/assets/EnvironmentBrowser-Bnxa7guC.css",
  "/daggerheart-companion/assets/EnvironmentBrowser-Dmg4jTNa.js",
  "/daggerheart-companion/assets/EnvironmentPreview-Do0njsGp.css",
  "/daggerheart-companion/assets/EnvironmentPreview-KzlgQKXo.js",
  "/daggerheart-companion/assets/EquipmentBrowser-BraiqatM.css",
  "/daggerheart-companion/assets/EquipmentBrowser-DHslFwHt.js",
  "/daggerheart-companion/assets/EquipmentPreview-CFltsI1x.css",
  "/daggerheart-companion/assets/EquipmentPreview-CpwDAJSR.js",
  "/daggerheart-companion/assets/ErrorFallback-CekmVtV4.js",
  "/daggerheart-companion/assets/ErrorFallback-CoQ9u1ob.css",
  "/daggerheart-companion/assets/GlossaryText-Dp9xPTrN.js",
  "/daggerheart-companion/assets/GlossaryText-nItlduw7.css",
  "/daggerheart-companion/assets/HomebrewAdversaryEditor-D7fGVg4F.js",
  "/daggerheart-companion/assets/HomebrewAdversaryEditor-DPZHCM_v.css",
  "/daggerheart-companion/assets/HomebrewAdversaryList-By8Rqa4d.js",
  "/daggerheart-companion/assets/HomebrewAdversaryList-nN2-qo8V.css",
  "/daggerheart-companion/assets/HomebrewAncestryEditor-C6rFycEv.js",
  "/daggerheart-companion/assets/HomebrewAncestryEditor-DhKuzXUL.css",
  "/daggerheart-companion/assets/HomebrewAncestryList-6qAkUkcM.css",
  "/daggerheart-companion/assets/HomebrewAncestryList-BTsM10wR.js",
  "/daggerheart-companion/assets/HomebrewClassEditor-BH5L85P5.css",
  "/daggerheart-companion/assets/HomebrewClassEditor-DoAyHB_G.js",
  "/daggerheart-companion/assets/HomebrewClassList-CcPGa-wR.css",
  "/daggerheart-companion/assets/HomebrewClassList-Iwlt10qI.js",
  "/daggerheart-companion/assets/HomebrewCommunityEditor-PiNciBHK.js",
  "/daggerheart-companion/assets/HomebrewCommunityEditor-cUY0s1Yl.css",
  "/daggerheart-companion/assets/HomebrewCommunityList-C8SFD-g5.js",
  "/daggerheart-companion/assets/HomebrewCommunityList-DuTv1264.css",
  "/daggerheart-companion/assets/HomebrewDomainEditor-BuA8b8Wc.js",
  "/daggerheart-companion/assets/HomebrewDomainEditor-DjlgJtiX.css",
  "/daggerheart-companion/assets/HomebrewDomainList-B2pUKFiF.css",
  "/daggerheart-companion/assets/HomebrewDomainList-CkDH8U92.js",
  "/daggerheart-companion/assets/HomebrewEnvironmentEditor-BAvlHPXf.css",
  "/daggerheart-companion/assets/HomebrewEnvironmentEditor-H0pj8X4A.js",
  "/daggerheart-companion/assets/HomebrewEnvironmentList-CCidQrxO.css",
  "/daggerheart-companion/assets/HomebrewEnvironmentList-DChNgtwd.js",
  "/daggerheart-companion/assets/HomebrewEquipmentEditor-CvmMdleN.css",
  "/daggerheart-companion/assets/HomebrewEquipmentEditor-Dlk_3773.js",
  "/daggerheart-companion/assets/HomebrewEquipmentList-52_mdZnS.js",
  "/daggerheart-companion/assets/HomebrewEquipmentList-G26ObxzH.css",
  "/daggerheart-companion/assets/HomebrewHub-BM1W6Q0W.css",
  "/daggerheart-companion/assets/HomebrewHub-D6wu0arI.js",
  "/daggerheart-companion/assets/ImportExportPanel-CA41Lw7C.css",
  "/daggerheart-companion/assets/ImportExportPanel-VAiWBekF.js",
  "/daggerheart-companion/assets/ModuleBoundary-DvlPl5vO.js",
  "/daggerheart-companion/assets/SyncManager-DMGKYyi1.css",
  "/daggerheart-companion/assets/SyncManager-DuvS2gER.js",
  "/daggerheart-companion/assets/armor-D_PkxIPt.js",
  "/daggerheart-companion/assets/characterStore-BlDHI39X.js",
  "/daggerheart-companion/assets/constants-pxySCpzO.js",
  "/daggerheart-companion/assets/encounterLiveStore-C1x6QzDx.js",
  "/daggerheart-companion/assets/index-C4RYIWwI.js",
  "/daggerheart-companion/assets/index-C8vqX9JE.js",
  "/daggerheart-companion/assets/index-CPJrj36G.js",
  "/daggerheart-companion/assets/index-CkPzaEF2.css",
  "/daggerheart-companion/assets/index-CoZ6-V8t.js",
  "/daggerheart-companion/assets/index-DZi0yphU.js",
  "/daggerheart-companion/assets/index-Ddj42QsF.js",
  "/daggerheart-companion/assets/index-lrxOJ4tc.js",
  "/daggerheart-companion/assets/useAdversaryHomebrewStore-Cmid9nnC.js",
  "/daggerheart-companion/assets/useAncestryHomebrewStore-ClzRnOeV.js",
  "/daggerheart-companion/assets/useClassHomebrewStore-DXEsl2Or.js",
  "/daggerheart-companion/assets/useCommunityHomebrewStore-CcgVSNlV.js",
  "/daggerheart-companion/assets/useDomainHomebrewStore-C806s2ZP.js",
  "/daggerheart-companion/assets/useEnvironmentHomebrewStore-BJ-vAMHf.js",
  "/daggerheart-companion/assets/useEquipmentHomebrewStore-DiEhWK5a.js",
  "/daggerheart-companion/assets/useFormSchema-CrX80hUc.css",
  "/daggerheart-companion/assets/useFormSchema-DKsdynqB.js",
  "/daggerheart-companion/assets/useHomebrewStore-Blem9l5T.js",
  "/daggerheart-companion/assets/useStorage-BQWPTZB8.js"
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
