import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import AlbumCard from '../components/AlbumCard.vue'
import type { Album } from '../types/album'

// Mock lucide-vue-next
vi.mock('lucide-vue-next', () => ({
  Heart: { template: '<svg data-testid="heart-icon"></svg>' },
  Play: { template: '<svg data-testid="play-icon"></svg>' },
  User: { template: '<svg data-testid="user-icon"></svg>' },
  Sparkles: { template: '<svg data-testid="sparkles-icon"></svg>' },
  ShoppingCart: { template: '<svg data-testid="cart-icon"></svg>' },
  Eye: { template: '<svg data-testid="eye-icon"></svg>' }
}))

// Mock vue-sonner
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

describe('AlbumCard', () => {
  const mockAlbum: Album = {
    id: 1,
    title: 'Test Album',
    artist: 'Test Artist',
    price: 10.99,
    image_url: 'https://example.com/image.jpg'
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createWrapper = (props = {}): VueWrapper => {
    return mount(AlbumCard, {
      props: {
        album: mockAlbum,
        ...props
      },
      global: {
        stubs: {
          'v-motion': true
        }
      }
    })
  }

  it('renders album information correctly', () => {
    const wrapper = createWrapper()
    
    expect(wrapper.find('.album-title').text()).toBe('Test Album')
    expect(wrapper.find('.album-artist').text()).toContain('Test Artist')
    expect(wrapper.find('.price').text()).toBe('$10.99')
  })

  it('displays album image with correct src and alt', () => {
    const wrapper = createWrapper()
    
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('https://example.com/image.jpg')
    expect(img.attributes('alt')).toBe('Test Album')
  })

  it('emits openModal event when card is clicked', async () => {
    const wrapper = createWrapper()
    
    await wrapper.find('.album-card').trigger('click')
    
    expect(wrapper.emitted('openModal')).toBeTruthy()
    expect(wrapper.emitted('openModal')![0]).toEqual([mockAlbum])
  })

  it('emits openModal event when details button is clicked', async () => {
    const wrapper = createWrapper()
    
    await wrapper.find('.btn-secondary').trigger('click')
    
    expect(wrapper.emitted('openModal')).toBeTruthy()
    expect(wrapper.emitted('openModal')![0]).toEqual([mockAlbum])
  })

  it('emits toggleWishlist event when wishlist button is clicked', async () => {
    const wrapper = createWrapper()
    
    await wrapper.find('.wishlist-btn').trigger('click')
    
    expect(wrapper.emitted('toggleWishlist')).toBeTruthy()
    expect(wrapper.emitted('toggleWishlist')![0]).toEqual([1])
  })

  it('shows active wishlist state when album is in wishlist', () => {
    const wrapper = createWrapper({ wishlist: [1, 2, 3] })
    
    expect(wrapper.find('.wishlist-btn').classes()).toContain('active')
  })

  it('shows inactive wishlist state when album is not in wishlist', () => {
    const wrapper = createWrapper({ wishlist: [2, 3] })
    
    expect(wrapper.find('.wishlist-btn').classes()).not.toContain('active')
  })

  it('emits addToCart event when add to cart button is clicked', async () => {
    const wrapper = createWrapper()
    
    await wrapper.find('.btn-primary').trigger('click')
    
    expect(wrapper.emitted('addToCart')).toBeTruthy()
    expect(wrapper.emitted('addToCart')![0]).toEqual([mockAlbum])
  })

  it('displays NEW badge for albums with id <= 2', () => {
    const wrapper = createWrapper({ album: { ...mockAlbum, id: 1 } })
    expect(wrapper.find('.album-badge').exists()).toBe(true)
    expect(wrapper.find('.album-badge').text()).toBe('NEW')
  })

  it('does not display NEW badge for albums with id > 2', () => {
    const wrapper = createWrapper({ album: { ...mockAlbum, id: 3 } })
    expect(wrapper.find('.album-badge').exists()).toBe(false)
  })

  it('formats price with two decimal places', () => {
    const wrapper = createWrapper({ album: { ...mockAlbum, price: 15 } })
    expect(wrapper.find('.price').text()).toBe('$15.00')
  })

  it('has correct aria-label on wishlist button when not in wishlist', () => {
    const wrapper = createWrapper({ wishlist: [] })
    expect(wrapper.find('.wishlist-btn').attributes('aria-label')).toBe('Add to wishlist')
  })

  it('has correct aria-label on wishlist button when in wishlist', () => {
    const wrapper = createWrapper({ wishlist: [1] })
    expect(wrapper.find('.wishlist-btn').attributes('aria-label')).toBe('Remove from wishlist')
  })

  it('uses lazy loading for images', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('img').attributes('loading')).toBe('lazy')
  })
})
