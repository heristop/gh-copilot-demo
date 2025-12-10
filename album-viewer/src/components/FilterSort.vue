<template>
  <div 
    class="filter-sort"
    v-motion
    :initial="{ opacity: 0, y: -20 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }"
  >
    <div class="filter-group">
      <button 
        v-for="option in sortOptions" 
        :key="option.value"
        :class="['filter-btn', { active: modelValue === option.value }]"
        @click="$emit('update:modelValue', option.value)"
      >
        <component :is="option.icon" :size="16" />
        <span>{{ option.label }}</span>
      </button>
    </div>
    
    <div class="view-toggle">
      <button 
        :class="['view-btn', { active: viewMode === 'grid' }]"
        @click="$emit('update:viewMode', 'grid')"
        aria-label="Grid view"
      >
        <LayoutGrid :size="18" />
      </button>
      <button 
        :class="['view-btn', { active: viewMode === 'list' }]"
        @click="$emit('update:viewMode', 'list')"
        aria-label="List view"
      >
        <List :size="18" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpDown, DollarSign, Clock, LayoutGrid, List } from 'lucide-vue-next'

defineProps<{
  modelValue: string
  viewMode: 'grid' | 'list'
}>()

defineEmits<{
  'update:modelValue': [value: string]
  'update:viewMode': [value: 'grid' | 'list']
}>()

const sortOptions = [
  { value: 'default', label: 'Default', icon: ArrowUpDown },
  { value: 'price-asc', label: 'Price ↑', icon: DollarSign },
  { value: 'price-desc', label: 'Price ↓', icon: DollarSign },
  { value: 'name', label: 'A-Z', icon: Clock }
]
</script>

<style scoped>
.filter-sort {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.35rem;
  border-radius: 30px;
  backdrop-filter: blur(10px);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 25px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.filter-btn.active {
  background: white;
  color: #667eea;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.view-toggle {
  display: flex;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.35rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-btn:hover {
  color: white;
}

.view-btn.active {
  background: white;
  color: #667eea;
}

@media (max-width: 640px) {
  .filter-sort {
    flex-direction: column;
    gap: 1rem;
  }
  
  .filter-group {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
