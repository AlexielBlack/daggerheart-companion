// @vitest-environment happy-dom
/**
 * @vitest
 * Tests du composant AdversaryFocusPanel.
 */
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdversaryFocusPanel from '../components/AdversaryFocusPanel.vue'

// ── Helpers ──────────────────────────────────────────────

function makeResults (...entries) {
  return entries.map(([name, score, reasons = []], i) => ({
    characterId: `pc-${i}`,
    characterName: name,
    score,
    reasons
  }))
}

const DEFAULT_CHARS = [
  { id: 'pc-0', name: 'Kaël' },
  { id: 'pc-1', name: 'Lyra' }
]

function mountPanel (props = {}) {
  return mount(AdversaryFocusPanel, {
    props: {
      focusResults: props.focusResults || [],
      allCharacters: props.allCharacters || DEFAULT_CHARS,
      pcRangeOverrides: props.pcRangeOverrides || {},
      ...props
    }
  })
}

// ── Tests ────────────────────────────────────────────────

describe('AdversaryFocusPanel', () => {
  it(`ne s'affiche pas sans résultats`, () => {
    const wrapper = mountPanel({ focusResults: [] })
    expect(wrapper.find('.adversary-focus-panel').exists()).toBe(false)
  })

  it('affiche le titre 🎯 Focus préférentiel', () => {
    const wrapper = mountPanel({
      focusResults: makeResults(['Kaël', 75], ['Lyra', 30])
    })
    expect(wrapper.find('.focus-title').text()).toContain('Focus préférentiel')
  })

  it('affiche les barres pour chaque PJ', () => {
    const results = makeResults(['Kaël', 75], ['Lyra', 30])
    const wrapper = mountPanel({ focusResults: results })
    const items = wrapper.findAll('.focus-item')
    expect(items).toHaveLength(2)
  })

  it('affiche le score en pourcentage', () => {
    const results = makeResults(['Kaël', 75])
    const wrapper = mountPanel({ focusResults: results })
    expect(wrapper.find('.focus-score').text()).toBe('75%')
  })

  it('applique la classe focus-item--primary au premier résultat si score > 0', () => {
    const results = makeResults(['Kaël', 75], ['Lyra', 30])
    const wrapper = mountPanel({ focusResults: results })
    const items = wrapper.findAll('.focus-item')
    expect(items[0].classes()).toContain('focus-item--primary')
    expect(items[1].classes()).not.toContain('focus-item--primary')
  })

  it(`n'applique pas focus-item--primary si score = 0`, () => {
    const results = makeResults(['Kaël', 0])
    const wrapper = mountPanel({ focusResults: results })
    expect(wrapper.find('.focus-item').classes()).not.toContain('focus-item--primary')
  })

  it('applique la bonne couleur de barre — danger pour >= 70', () => {
    const results = makeResults(['Kaël', 80])
    const wrapper = mountPanel({ focusResults: results })
    expect(wrapper.find('.focus-bar-fill').classes()).toContain('bar--danger')
  })

  it('applique la bonne couleur de barre — warning pour >= 40', () => {
    const results = makeResults(['Kaël', 50])
    const wrapper = mountPanel({ focusResults: results })
    expect(wrapper.find('.focus-bar-fill').classes()).toContain('bar--warning')
  })

  it('applique la bonne couleur de barre — low pour < 40', () => {
    const results = makeResults(['Kaël', 20])
    const wrapper = mountPanel({ focusResults: results })
    expect(wrapper.find('.focus-bar-fill').classes()).toContain('bar--low')
  })

  it('affiche les toggles de proximité pour chaque PJ', () => {
    const results = makeResults(['Kaël', 50])
    const wrapper = mountPanel({
      focusResults: results,
      allCharacters: DEFAULT_CHARS
    })
    const toggles = wrapper.findAll('.proximity-toggle')
    expect(toggles).toHaveLength(2)
    expect(toggles[0].text()).toContain('Kaël')
    expect(toggles[1].text()).toContain('Lyra')
  })

  it('émet update:range quand un toggle de proximité change', async () => {
    const results = makeResults(['Kaël', 50])
    const wrapper = mountPanel({ focusResults: results })
    const checkbox = wrapper.find('.proximity-toggle input[type="checkbox"]')
    await checkbox.setValue(true)
    expect(wrapper.emitted('update:range')).toBeTruthy()
    expect(wrapper.emitted('update:range')[0][0]).toEqual({
      charId: 'pc-0',
      inRange: true
    })
  })

  it('affiche les raisons sous forme de tags', () => {
    const reasons = [
      { factor: 'lowHP', label: 'PV bas', icon: '💔', weight: 3, raw: 80 }
    ]
    const results = makeResults(['Kaël', 75, reasons])
    const wrapper = mountPanel({ focusResults: results })
    const tags = wrapper.findAll('.focus-reason-tag')
    expect(tags).toHaveLength(1)
    expect(tags[0].text()).toContain('💔')
    expect(tags[0].text()).toContain('PV bas')
  })

  it(`expose les rôles ARIA pour l'accessibilité`, () => {
    const results = makeResults(['Kaël', 50])
    const wrapper = mountPanel({ focusResults: results })
    expect(wrapper.find('[role="progressbar"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Panel de focus adversaire"]').exists()).toBe(true)
    expect(wrapper.find('[aria-label="Classement des cibles"]').exists()).toBe(true)
  })

  it('définit le style width de la barre au score', () => {
    const results = makeResults(['Kaël', 63])
    const wrapper = mountPanel({ focusResults: results })
    const bar = wrapper.find('.focus-bar-fill')
    expect(bar.attributes('style')).toContain('width: 63%')
  })

  it('affiche les rangs corrects (1, 2, 3…)', () => {
    const results = makeResults(['Kaël', 80], ['Lyra', 50], ['Tharn', 20])
    const wrapper = mountPanel({
      focusResults: results,
      allCharacters: [
        { id: 'pc-0', name: 'Kaël' },
        { id: 'pc-1', name: 'Lyra' },
        { id: 'pc-2', name: 'Tharn' }
      ]
    })
    const ranks = wrapper.findAll('.focus-rank')
    expect(ranks[0].text()).toBe('1')
    expect(ranks[1].text()).toBe('2')
    expect(ranks[2].text()).toBe('3')
  })
})
