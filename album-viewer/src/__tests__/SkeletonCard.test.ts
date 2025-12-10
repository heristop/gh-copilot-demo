import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import SkeletonCard from '../components/SkeletonCard.vue'

describe('SkeletonCard', () => {
  it('should render the skeleton card', () => {
    const wrapper = mount(SkeletonCard)
    expect(wrapper.find('.skeleton-card').exists()).toBe(true)
  })

  it('should render skeleton elements', () => {
    const wrapper = mount(SkeletonCard)
    
    expect(wrapper.find('.skeleton-image').exists()).toBe(true)
    expect(wrapper.find('.skeleton-title').exists()).toBe(true)
    expect(wrapper.find('.skeleton-artist').exists()).toBe(true)
    expect(wrapper.find('.skeleton-price').exists()).toBe(true)
  })

  it('should render skeleton action buttons', () => {
    const wrapper = mount(SkeletonCard)
    const buttons = wrapper.findAll('.skeleton-btn')
    
    expect(buttons).toHaveLength(2)
  })

  it('should have animation class on skeleton elements', () => {
    const wrapper = mount(SkeletonCard)
    
    expect(wrapper.find('.skeleton-image').classes()).toContain('skeleton-animate')
    expect(wrapper.find('.skeleton-title').classes()).toContain('skeleton-animate')
    expect(wrapper.find('.skeleton-artist').classes()).toContain('skeleton-animate')
    expect(wrapper.find('.skeleton-price').classes()).toContain('skeleton-animate')
  })

  it('should render skeleton content container', () => {
    const wrapper = mount(SkeletonCard)
    expect(wrapper.find('.skeleton-content').exists()).toBe(true)
  })

  it('should render skeleton actions container', () => {
    const wrapper = mount(SkeletonCard)
    expect(wrapper.find('.skeleton-actions').exists()).toBe(true)
  })
})
