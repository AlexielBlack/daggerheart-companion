// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppNav from '../AppNav.vue'

function makeRouter(initialRoute = '/compendium/adversaires') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/compendium/:rest(.*)?', name: 'compendium', component: { template: '<div/>' } },
      { path: '/table/:rest(.*)?', name: 'table', component: { template: '<div/>' } },
      { path: '/sync', name: 'sync', component: { template: '<div/>' } }
    ]
  })
  router.push(initialRoute)
  return router
}

describe('AppNav', () => {
  it('affiche exactement 3 liens de navigation', async () => {
    const router = makeRouter()
    await router.isReady()
    const wrapper = mount(AppNav, {
      props: { isOpen: true },
      global: { plugins: [router] }
    })
    const links = wrapper.findAll('a')
    expect(links).toHaveLength(3)
    expect(links[0].text()).toContain('Compendium')
    expect(links[1].text()).toContain('Table')
    expect(links[2].text()).toContain('Sync')
  })

  it('marque le lien actif avec aria-current=page', async () => {
    const router = makeRouter('/compendium/adversaires')
    await router.isReady()
    const wrapper = mount(AppNav, {
      props: { isOpen: true },
      global: { plugins: [router] }
    })
    const compendiumLink = wrapper.findAll('a')[0]
    expect(compendiumLink.attributes('aria-current')).toBe('page')
  })

  it('n\'a pas de dropdown ni de bouton', async () => {
    const router = makeRouter()
    await router.isReady()
    const wrapper = mount(AppNav, {
      props: { isOpen: true },
      global: { plugins: [router] }
    })
    expect(wrapper.findAll('button')).toHaveLength(0)
    expect(wrapper.findAll('[role="menu"]')).toHaveLength(0)
  })
})
