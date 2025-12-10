import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import FilterSort from '../components/FilterSort.vue'

// Mock lucide-vue-next
vi.mock('lucide-vue-next', () => ({
  ArrowUpDown: { template: '<svg data-testid="arrow-icon"></svg>' },
  DollarSign: { template: '<svg data-testid="dollar-icon"></svg>' },
  Clock: { template: '<svg data-testid="clock-icon"></svg>' },
  LayoutGrid: { template: '<svg data-testid="grid-icon"></svg>' },
  List: { template: '<svg data-testid="list-icon"></svg>' }
}))

describe('FilterSort', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createWrapper = (props = {}): VueWrapper => {
    return mount(FilterSort, {
      props: {
        modelValue: 'default',
        viewMode: 'grid' as const,
        ...props
      },
      global: {
        stubs: {
          'v-motion': true
        }
      }
    })
  }

  it('renders all sort options', () => {
    const wrapper = createWrapper()
    
    const buttons = wrapper.findAll('.filter-btn')
    expect(buttons).toHaveLength(4)
    expect(buttons[0].text()).toContain('Default')
    expect(buttons[1].text()).toContain('Price ↑')
    expect(buttons[2].text()).toContain('Price ↓')
    expect(buttons[3].text()).toContain('A-Z')
  })

  it('marks the active sort option', () => {
    const wrapper = createWrapper({ modelValue: 'price-asc' })
    
    const buttons = wrapper.findAll('.filter-btn')
    expect(buttons[1].classes()).toContain('active')
    expect(buttons[0].classes()).not.toContain('active')
  })

  it('emits update:modelValue when sort option is clicked', async () => {
    const wrapper = createWrapper()
    
    const buttons = wrapper.findAll('.filter-btn')
    await buttons[2].trigger('click')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['price-desc'])
  })

  it('renders view toggle buttons', () => {
    const wrapper = createWrapper()
    
    const viewButtons = wrapper.findAll('.view-btn')
    expect(viewButtons).toHaveLength(2)
  })

  it('marks the active view mode', () => {
    const wrapper = createWrapper({ viewMode: 'list' })
    
    const viewButtons = wrapper.findAll('.view-btn')
    expect(viewButtons[1].classes()).toContain('active')
    expect(viewButtons[0].classes()).not.toContain('active')
  })

  it('emits update:viewMode when view toggle is clicked', async () => {
    const wrapper = createWrapper()
    
    const viewButtons = wrapper.findAll('.view-btn')
    await viewButtons[1].trigger('click')
    
    expect(wrapper.emitted('update:viewMode')).toBeTruthy()
    expect(wrapper.emitted('update:viewMode')![0]).toEqual(['list'])
  })

  it('has correct aria-labels on view toggle buttons', () => {
    const wrapper = createWrapper()
    
    const viewButtons = wrapper.findAll('.view-btn')
    expect(viewButtons[0].attributes('aria-label')).toBe('Grid view')
    expect(viewButtons[1].attributes('aria-label')).toBe('List view')
  })
})
