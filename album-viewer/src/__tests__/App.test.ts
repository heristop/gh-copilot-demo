import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../App.vue'
import axios from 'axios'

vi.mock('axios')
const mockedAxios = vi.mocked(axios)

// Mock vue-sonner
vi.mock('vue-sonner', () => ({
  toast: vi.fn(() => {}),
  Toaster: {
    name: 'Toaster',
    template: '<div class="toaster-mock"></div>'
  }
}))

const mockAlbums = [
  {
    id: 1,
    title: 'Test Album 1',
    artist: 'Test Artist 1',
    price: 10.99,
    image_url: 'https://example.com/1.jpg'
  },
  {
    id: 2,
    title: 'Test Album 2',
    artist: 'Test Artist 2',
    price: 15.99,
    image_url: 'https://example.com/2.jpg'
  }
]

describe('App.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('should render the app container', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Toaster: true,
          ThemeToggle: true,
          SearchBar: true,
          FilterSort: true,
          AlbumCard: true,
          AlbumModal: true,
          SkeletonCard: true
        }
      }
    })
    expect(wrapper.find('.app').exists()).toBe(true)
  })

  it('should render header with title', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Toaster: true,
          ThemeToggle: true,
          SearchBar: true,
          FilterSort: true,
          AlbumCard: true,
          AlbumModal: true,
          SkeletonCard: true
        }
      }
    })
    expect(wrapper.find('h1').text()).toBe('Album Collection')
  })

  it('should show loading skeleton initially', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Toaster: true,
          ThemeToggle: true,
          SearchBar: true,
          FilterSort: true,
          AlbumCard: true,
          AlbumModal: true,
          SkeletonCard: { template: '<div class="skeleton-card-stub"></div>' }
        }
      }
    })
    expect(wrapper.findAll('.skeleton-card-stub')).toHaveLength(6)
  })

  it('should toggle theme when theme toggle is clicked', async () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Toaster: true,
          ThemeToggle: { 
            template: '<button class="theme-toggle-btn" @click="$emit(\'toggle\')">Toggle</button>'
          },
          SearchBar: true,
          FilterSort: true,
          AlbumCard: true,
          AlbumModal: true,
          SkeletonCard: true
        }
      }
    })
    
    const initialClass = wrapper.find('.app').classes()
    expect(initialClass).not.toContain('light-theme')
    
    await wrapper.find('.theme-toggle-btn').trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('.app').classes()).toContain('light-theme')
  })

  it('should have skip link for accessibility', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Toaster: true,
          ThemeToggle: true,
          SearchBar: true,
          FilterSort: true,
          AlbumCard: true,
          AlbumModal: true,
          SkeletonCard: true
        }
      }
    })
    const skipLink = wrapper.find('.skip-link')
    expect(skipLink.exists()).toBe(true)
    expect(skipLink.attributes('href')).toBe('#main-content')
  })

  it('should have aria-live region for announcements', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Toaster: true,
          ThemeToggle: true,
          SearchBar: true,
          FilterSort: true,
          AlbumCard: true,
          AlbumModal: true,
          SkeletonCard: true
        }
      }
    })
    const announcer = wrapper.find('[role="status"][aria-live="polite"]')
    expect(announcer.exists()).toBe(true)
  })

  it('should render background effects', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Toaster: true,
          ThemeToggle: true,
          SearchBar: true,
          FilterSort: true,
          AlbumCard: true,
          AlbumModal: true,
          SkeletonCard: true
        }
      }
    })
    expect(wrapper.find('.background-effects').exists()).toBe(true)
    expect(wrapper.findAll('.gradient-orb')).toHaveLength(3)
    expect(wrapper.findAll('.note')).toHaveLength(12)
  })

  it('should render footer', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Toaster: true,
          ThemeToggle: true,
          SearchBar: true,
          FilterSort: true,
          AlbumCard: true,
          AlbumModal: true,
          SkeletonCard: true
        }
      }
    })
    expect(wrapper.find('.footer').exists()).toBe(true)
  })

  it('should have proper main content structure', () => {
    const wrapper = mount(App, {
      global: {
        stubs: {
          Toaster: true,
          ThemeToggle: true,
          SearchBar: true,
          FilterSort: true,
          AlbumCard: true,
          AlbumModal: true,
          SkeletonCard: true
        }
      }
    })
    const main = wrapper.find('#main-content')
    expect(main.exists()).toBe(true)
    expect(main.attributes('role')).toBe('main')
  })
})
