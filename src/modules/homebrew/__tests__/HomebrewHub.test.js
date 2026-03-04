// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HomebrewHub from '../views/HomebrewHub.vue'

/**
 * @tests HomebrewHub
 * @description Vérifie le rendu du hub central homebrew :
 * cartes par catégorie, compteurs, actions globales.
 */
describe('HomebrewHub', () => {
  let wrapper

  const mountHub = () => {
    return mount(HomebrewHub, {
      global: {
        stubs: {
          ModuleBoundary: {
            template: '<div><slot /></div>'
          },
          'router-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        }
      }
    })
  }

  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear()
    }
    setActivePinia(createPinia())
    wrapper = mountHub()
  })

  describe('rendu de base', () => {
    it('affiche le titre principal', () => {
      expect(wrapper.find('.hb-hub__title').text()).toContain('Contenu Homebrew')
    })

    it('affiche le compteur total à 0 par défaut', () => {
      expect(wrapper.find('.hb-hub__subtitle').text()).toContain('0 création')
    })

    it('rend 7 cartes de catégorie', () => {
      const cards = wrapper.findAll('.hb-hub__card')
      expect(cards.length).toBe(7)
    })

    it('affiche les bonnes catégories', () => {
      const names = wrapper.findAll('.hb-hub__card-name').map((n) => n.text())
      expect(names).toContain('Adversaires')
      expect(names).toContain('Ascendances')
      expect(names).toContain('Classes')
      expect(names).toContain('Communautés')
      expect(names).toContain('Domaines')
      expect(names).toContain('Environnements')
      expect(names).toContain('Équipement')
    })

    it('chaque carte a un compteur à 0', () => {
      const counts = wrapper.findAll('.hb-hub__card-count').map((c) => c.text())
      expect(counts.every((c) => c === '0')).toBe(true)
    })

    it('chaque carte a un bouton Voir et Créer', () => {
      const cards = wrapper.findAll('.hb-hub__card')
      cards.forEach((card) => {
        const links = card.findAll('a')
        expect(links.length).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('liens de navigation', () => {
    it('les liens Voir pointent vers les routes de liste', () => {
      const viewLinks = wrapper.findAll('.btn--secondary')
      const hrefs = viewLinks.map((l) => l.attributes('href'))
      expect(hrefs).toContain('/homebrew/adversary')
      expect(hrefs).toContain('/homebrew/ancestry')
      expect(hrefs).toContain('/homebrew/class')
      expect(hrefs).toContain('/homebrew/community')
      expect(hrefs).toContain('/homebrew/domain')
      expect(hrefs).toContain('/homebrew/environment')
      expect(hrefs).toContain('/homebrew/equipment')
    })

    it('les liens Créer pointent vers les routes de création', () => {
      const createLinks = wrapper.findAll('.btn--primary')
      const hrefs = createLinks.map((l) => l.attributes('href'))
      expect(hrefs).toContain('/homebrew/adversary/new')
      expect(hrefs).toContain('/homebrew/ancestry/new')
      expect(hrefs).toContain('/homebrew/class/new')
      expect(hrefs).toContain('/homebrew/community/new')
      expect(hrefs).toContain('/homebrew/domain/new')
      expect(hrefs).toContain('/homebrew/environment/new')
      expect(hrefs).toContain('/homebrew/equipment/new')
    })
  })

  describe('section import/export global', () => {
    it('affiche la section import/export', () => {
      expect(wrapper.find('.hb-hub__global-actions').exists()).toBe(true)
    })

    it('le bouton exporter est désactivé quand aucun contenu', () => {
      const exportBtn = wrapper.findAll('button').find((b) => b.text().includes('Exporter'))
      expect(exportBtn.attributes('disabled')).toBeDefined()
    })

    it('affiche un label d\'import', () => {
      const importLabel = wrapper.find('.hb-hub__import-label')
      expect(importLabel.exists()).toBe(true)
      expect(importLabel.text()).toContain('Importer')
    })

    it('le bouton tout supprimer est caché quand aucun contenu', () => {
      const clearBtn = wrapper.findAll('button').find((b) => b.text().includes('Tout supprimer'))
      expect(clearBtn).toBeUndefined()
    })
  })

  describe('style des cartes vides', () => {
    it('les cartes sans contenu ont la classe --empty', () => {
      const cards = wrapper.findAll('.hb-hub__card')
      cards.forEach((card) => {
        expect(card.classes()).toContain('hb-hub__card--empty')
      })
    })
  })

  describe('accessibilité', () => {
    it('la grille a un aria-label', () => {
      expect(wrapper.find('.hb-hub__grid').attributes('aria-label')).toBe('Catégories homebrew')
    })

    it('la section actions a un aria-label', () => {
      expect(wrapper.find('.hb-hub__global-actions').attributes('aria-label')).toBe('Actions globales')
    })

    it('le module est encapsulé dans un region', () => {
      // Le ModuleBoundary stub rend un div, on vérifie que le hub se monte
      expect(wrapper.find('.hb-hub').exists()).toBe(true)
    })
  })
})

describe('HomebrewList — breadcrumb retour', () => {
  it('affiche le lien retour quand backRoute est fourni', async () => {
    const { mount: mountFn } = await import('@vue/test-utils')
    const { default: HomebrewList } = await import('../core/components/HomebrewList.vue')

    const wrapper = mountFn(HomebrewList, {
      props: {
        items: [],
        label: 'Test',
        labelSingular: 'test',
        searchQuery: '',
        sortField: 'name',
        sortDirection: 'asc',
        filteredCount: 0,
        totalCount: 0,
        backRoute: '/homebrew'
      },
      global: {
        stubs: {
          'router-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        }
      }
    })

    const link = wrapper.find('.homebrew-list__back-link')
    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/homebrew')
    expect(link.text()).toContain('Hub Homebrew')
  })

  it('n\'affiche pas le lien retour sans backRoute', async () => {
    const { mount: mountFn } = await import('@vue/test-utils')
    const { default: HomebrewList } = await import('../core/components/HomebrewList.vue')

    const wrapper = mountFn(HomebrewList, {
      props: {
        items: [],
        label: 'Test',
        labelSingular: 'test',
        searchQuery: '',
        sortField: 'name',
        sortDirection: 'asc',
        filteredCount: 0,
        totalCount: 0
      },
      global: {
        stubs: {
          'router-link': {
            template: '<a :href="to"><slot /></a>',
            props: ['to']
          }
        }
      }
    })

    expect(wrapper.find('.homebrew-list__breadcrumb').exists()).toBe(false)
  })
})
