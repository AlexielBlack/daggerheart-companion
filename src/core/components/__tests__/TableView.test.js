// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import TableView from '../TableView.vue'

const StubTab = { template: '<div class="stub-tab">Tab</div>' }

function makeRouter(initialRoute = '/table/scene') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{
      path: '/table',
      component: TableView,
      redirect: '/table/scene',
      children: [
        { path: 'scene', name: 'table-scene', component: StubTab, meta: { tab: 'scene', title: 'Scene' } },
        { path: 'combat', name: 'table-combat', component: StubTab, meta: { tab: 'combat', title: 'Combat' } },
        { path: 'des', name: 'table-des', component: StubTab, meta: { tab: 'des', title: 'Des' } },
        { path: 'prep', name: 'table-prep', component: StubTab, meta: { tab: 'prep', title: 'Preparation' } }
      ]
    }]
  })
  router.push(initialRoute)
  return router
}

describe('TableView', () => {
  it('affiche 4 onglets', async () => {
    const router = makeRouter()
    await router.isReady()
    const wrapper = mount(TableView, { global: { plugins: [router] } })
    const tabs = wrapper.find('[role="tablist"]').findAll('[role="tab"]')
    expect(tabs).toHaveLength(4)
  })

  it('marque l\'onglet actif', async () => {
    const router = makeRouter('/table/scene')
    await router.isReady()
    const wrapper = mount(TableView, { global: { plugins: [router] } })
    const activeTab = wrapper.find('[aria-selected="true"]')
    expect(activeTab.exists()).toBe(true)
    expect(activeTab.text()).toContain('Scene')
  })

  it('contient un router-view', async () => {
    const router = makeRouter('/table/scene')
    await router.isReady()
    const wrapper = mount(TableView, { global: { plugins: [router] } })
    expect(wrapper.find('.stub-tab').exists()).toBe(true)
  })
})
