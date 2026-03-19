// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import CompendiumView from '../CompendiumView.vue'

const StubBrowser = { template: '<div class="stub-browser">Browser</div>' }

function makeRouter(initialRoute = '/compendium/adversaires') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{
      path: '/compendium',
      component: CompendiumView,
      redirect: '/compendium/adversaires',
      children: [
        { path: 'adversaires', name: 'compendium-adversaires', component: StubBrowser, meta: { tab: 'adversaires', title: 'Adversaires' } },
        { path: 'classes', name: 'compendium-classes', component: StubBrowser, meta: { tab: 'classes', title: 'Classes' } }
      ]
    }]
  })
  router.push(initialRoute)
  return router
}

describe('CompendiumView', () => {
  it('affiche les onglets de navigation', async () => {
    const router = makeRouter()
    await router.isReady()
    const wrapper = mount(CompendiumView, { global: { plugins: [router] } })
    // Cibler le premier tablist pour eviter le doublon cause par le router-view imbrique
    const tablist = wrapper.find('[role="tablist"]')
    const tabs = tablist.findAll('[role="tab"]')
    expect(tabs.length).toBe(7)
  })

  it('marque l\'onglet actif avec aria-selected', async () => {
    const router = makeRouter('/compendium/adversaires')
    await router.isReady()
    const wrapper = mount(CompendiumView, { global: { plugins: [router] } })
    const activeTab = wrapper.find('[aria-selected="true"]')
    expect(activeTab.exists()).toBe(true)
    expect(activeTab.text()).toContain('Adversaires')
  })

  it('contient un router-view pour le browser actif', async () => {
    const router = makeRouter('/compendium/adversaires')
    await router.isReady()
    const wrapper = mount(CompendiumView, { global: { plugins: [router] } })
    expect(wrapper.find('.stub-browser').exists()).toBe(true)
  })
})
