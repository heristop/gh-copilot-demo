import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import ThemeToggle from '../components/ThemeToggle.vue'

// Mock lucide-vue-next
vi.mock('lucide-vue-next', () => ({
  Sun: { template: '<svg data-testid="sun-icon"></svg>' },
  Moon: { template: '<svg data-testid="moon-icon"></svg>' }
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset localStorage mock
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    vi.mocked(localStorage.setItem).mockClear()
    // Reset document attribute
    document.documentElement.removeAttribute('data-theme')
  })

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createWrapper = (): VueWrapper => {
    return mount(ThemeToggle, {
      global: {
        stubs: {
          'v-motion': true
        }
      }
    })
  }

  it('renders properly', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.theme-toggle').exists()).toBe(true)
  })

  it('starts in dark mode by default', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('[data-testid="moon-icon"]').exists()).toBe(true)
  })

  it('toggles theme when button is clicked', async () => {
    const wrapper = createWrapper()
    
    await wrapper.find('.theme-toggle').trigger('click')
    
    expect(wrapper.find('[data-testid="sun-icon"]').exists()).toBe(true)
  })

  it('saves theme preference to localStorage', async () => {
    const wrapper = createWrapper()
    
    await wrapper.find('.theme-toggle').trigger('click')
    
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light')
  })

  it('sets document data-theme attribute on toggle', async () => {
    const wrapper = createWrapper()
    
    await wrapper.find('.theme-toggle').trigger('click')
    
    expect(document.documentElement.getAttribute('data-theme')).toBe('light')
  })

  it('loads saved theme from localStorage on mount', () => {
    vi.mocked(localStorage.getItem).mockReturnValue('light')
    
    const wrapper = createWrapper()
    
    expect(localStorage.getItem).toHaveBeenCalledWith('theme')
    expect(wrapper.find('[data-testid="sun-icon"]').exists()).toBe(true)
  })

  it('has correct aria-label in dark mode', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.theme-toggle').attributes('aria-label')).toBe('Switch to light mode')
  })

  it('has correct aria-label in light mode', async () => {
    const wrapper = createWrapper()
    
    await wrapper.find('.theme-toggle').trigger('click')
    
    expect(wrapper.find('.theme-toggle').attributes('aria-label')).toBe('Switch to dark mode')
  })

  it('applies rotated class in dark mode', () => {
    const wrapper = createWrapper()
    expect(wrapper.find('.toggle-icon').classes()).toContain('rotated')
  })

  it('removes rotated class in light mode', async () => {
    const wrapper = createWrapper()
    
    await wrapper.find('.theme-toggle').trigger('click')
    
    expect(wrapper.find('.toggle-icon').classes()).not.toContain('rotated')
  })
})
