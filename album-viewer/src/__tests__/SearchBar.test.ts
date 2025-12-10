import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import SearchBar from '../components/SearchBar.vue'

// Mock lucide-vue-next
vi.mock('lucide-vue-next', () => ({
  Search: { template: '<svg data-testid="search-icon"></svg>' },
  X: { template: '<svg data-testid="x-icon"></svg>' }
}))

describe('SearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders properly', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: {
          'v-motion': true
        }
      }
    })
    
    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('placeholder')).toBe('Search albums or artists...')
  })

  it('displays the current model value', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test search'
      },
      global: {
        stubs: {
          'v-motion': true
        }
      }
    })
    
    expect(wrapper.find('input').element.value).toBe('test search')
  })

  it('emits update:modelValue on input', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: {
          'v-motion': true
        }
      }
    })
    
    await wrapper.find('input').setValue('new search')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new search'])
  })

  it('shows clear button when modelValue is not empty', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test'
      },
      global: {
        stubs: {
          'v-motion': true
        }
      }
    })
    
    expect(wrapper.find('.clear-btn').exists()).toBe(true)
  })

  it('hides clear button when modelValue is empty', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: ''
      },
      global: {
        stubs: {
          'v-motion': true
        }
      }
    })
    
    expect(wrapper.find('.clear-btn').exists()).toBe(false)
  })

  it('emits empty string when clear button is clicked', async () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test'
      },
      global: {
        stubs: {
          'v-motion': true
        }
      }
    })
    
    await wrapper.find('.clear-btn').trigger('click')
    
    expect(wrapper.emitted('update:modelValue')).toBeTruthy()
    expect(wrapper.emitted('update:modelValue')![0]).toEqual([''])
  })

  it('has correct aria-label on clear button', () => {
    const wrapper = mount(SearchBar, {
      props: {
        modelValue: 'test'
      },
      global: {
        stubs: {
          'v-motion': true
        }
      }
    })
    
    expect(wrapper.find('.clear-btn').attributes('aria-label')).toBe('Clear search')
  })
})
