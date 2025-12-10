import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import AlbumModal from '../components/AlbumModal.vue'
import type { Album } from '../types/album'

// Mock lucide-vue-next
vi.mock('lucide-vue-next', () => ({
  X: { template: '<svg data-testid="x-icon"></svg>' },
  Heart: { template: '<svg data-testid="heart-icon"></svg>' },
  Music: { template: '<svg data-testid="music-icon"></svg>' },
  Disc3: { template: '<svg data-testid="disc-icon"></svg>' },
  Clock: { template: '<svg data-testid="clock-icon"></svg>' },
  Calendar: { template: '<svg data-testid="calendar-icon"></svg>' },
  ShoppingCart: { template: '<svg data-testid="cart-icon"></svg>' },
  Zap: { template: '<svg data-testid="zap-icon"></svg>' },
  Play: { template: '<svg data-testid="play-icon"></svg>' },
  Pause: { template: '<svg data-testid="pause-icon"></svg>' }
}))

// Mock vue-sonner
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

// Mock Teleport
const mockTeleport = {
  template: '<div class="teleport-mock"><slot /></div>'
}

describe('AlbumModal', () => {
  const mockAlbum: Album = {
    id: 1,
    title: 'Test Album',
    artist: 'Test Artist',
    price: 10.99,
    image_url: 'https://example.com/image.jpg'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  const createWrapper = (props = {}) => {
    return mount(AlbumModal, {
      props: {
        album: mockAlbum,
        isOpen: true,
        ...props
      },
      global: {
        stubs: {
          'v-motion': true,
          Teleport: mockTeleport,
          Transition: false
        }
      }
    })
  }

  it('renders when isOpen is true', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.modal-overlay').exists()).toBe(true)
  })

  it('does not render when isOpen is false', () => {
    const wrapper = createWrapper({ isOpen: false })
    expect(wrapper.find('.modal-overlay').exists()).toBe(false)
  })

  it('displays album title and artist', () => {
    const wrapper = createWrapper()
    expect(wrapper.text()).toContain('Test Album')
    expect(wrapper.text()).toContain('Test Artist')
  })

  it('displays formatted price', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.price').text()).toBe('$10.99')
  })

  it('displays original price with discount calculation', () => {
    const wrapper = createWrapper()
    const originalPrice = (10.99 * 1.3).toFixed(2)
    expect(wrapper.find('.original-price').text()).toContain(originalPrice)
  })

  it('displays album image with correct src and alt', () => {
    const wrapper = createWrapper()
    const img = wrapper.find('img')
    expect(img.attributes('src')).toBe('https://example.com/image.jpg')
    expect(img.attributes('alt')).toContain('Test Album')
    expect(img.attributes('alt')).toContain('Test Artist')
  })

  it('emits close event when overlay is clicked', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.modal-overlay').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = createWrapper()
    await wrapper.find('.close-btn').trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('has correct aria attributes for accessibility', () => {
    const wrapper = createWrapper()
    const overlay = wrapper.find('.modal-overlay')
    
    expect(overlay.attributes('role')).toBe('dialog')
    expect(overlay.attributes('aria-modal')).toBe('true')
    expect(overlay.attributes('aria-labelledby')).toBe('modal-title-1')
    expect(overlay.attributes('aria-describedby')).toBe('modal-desc-1')
  })

  it('has correct aria-label on close button', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.close-btn').attributes('aria-label')).toBe('Close album details')
  })

  it('displays track preview section', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.track-preview').exists()).toBe(true)
    expect(wrapper.findAll('.track-item').length).toBeGreaterThan(0)
  })

  it('renders Add to Cart and Buy Now buttons', () => {
    const wrapper = createWrapper()
    const buttons = wrapper.findAll('.modal-actions .btn')
    expect(buttons).toHaveLength(2)
    expect(buttons[0].text()).toContain('Add to Cart')
    expect(buttons[1].text()).toContain('Buy Now')
  })

  it('shows album metadata (tracks, duration, year)', () => {
    const wrapper = createWrapper()
    const metaItems = wrapper.findAll('.meta-item')
    expect(metaItems.length).toBe(3)
    expect(wrapper.text()).toContain('12 tracks')
    expect(wrapper.text()).toContain('45 min')
    expect(wrapper.text()).toContain('2024')
  })

  it('shows discount badge', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.discount').text()).toContain('-23%')
  })

  it('has wishlist button in modal', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.wishlist-btn').exists()).toBe(true)
  })

  it('has play button for audio preview', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.play-large-btn').exists()).toBe(true)
  })
})
