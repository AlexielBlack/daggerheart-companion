// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import TableView from '../TableView.vue'

const StubTab = { template: '<div class="stub-tab">Tab</div>' }

function makeRouter(initialRoute = '/table/pjs') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{
      path: '/table',
      component: TableView,
      redirect: '/table/pjs',
      children: [
        { path: 'pjs', name: 'table-pjs', component: StubTab, meta: { tab: 'pjs', title: 'Personnages' } },
        { path: 'pnjs', name: 'table-pnjs', component: StubTab, meta: { tab: 'pnjs', title: 'PNJs' } },
        { path: 'rencontres', name: 'table-rencontres', component: StubTab, meta: { tab: 'rencontres', title: 'Rencontres' } },
        { path: 'combat', name: 'table-combat', component: StubTab, meta: { tab: 'combat', title: 'Combat' } },
        { path: 'des', name: 'table-des', component: StubTab, meta: { tab: 'des', title: 'Des' } }
      ]
    }]
  })
  router.push(initialRoute)
  return router
}

describe('TableView', () => {
  it('affiche 5 onglets', async () => {
    const router = makeRouter()
    await router.isReady()
    const wrapper = mount(TableView, { global: { plugins: [router] } })
    const tabs = wrapper.find('[role="tablist"]').findAll('[role="tab"]')
    expect(tabs).toHaveLength(5)
  })

  it('marque l\'onglet actif', async () => {
    const router = makeRouter('/table/pjs')
    await router.isReady()
    const wrapper = mount(TableView, { global: { plugins: [router] } })
    const activeTab = wrapper.find('[aria-selected="true"]')
    expect(activeTab.exists()).toBe(true)
    expect(activeTab.text()).toContain('PJs')
  })

  it('contient un router-view', async () => {
    const router = makeRouter('/table/pjs')
    await router.isReady()
    const wrapper = mount(TableView, { global: { plugins: [router] } })
    expect(wrapper.find('.stub-tab').exists()).toBe(true)
  })
})
