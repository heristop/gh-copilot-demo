<template>
  <div 
    class="search-bar"
    v-motion
    :initial="{ opacity: 0, y: -20 }"
    :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }"
    role="search"
  >
    <div class="search-input-wrapper">
      <label for="album-search" class="sr-only">Search albums or artists</label>
      <Search class="search-icon" :size="20" aria-hidden="true" />
      <input
        id="album-search"
        type="search"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        placeholder="Search albums or artists..."
        class="search-input"
        @focus="isFocused = true"
        @blur="isFocused = false"
        autocomplete="off"
        aria-describedby="search-hint"
      />
      <span id="search-hint" class="sr-only">Type to search through albums and artists</span>
      <button 
        v-if="modelValue" 
        @click="$emit('update:modelValue', '')"
        class="clear-btn"
        aria-label="Clear search"
        type="button"
      >
        <X :size="16" aria-hidden="true" />
      </button>
    </div>
    <div class="search-glow" :class="{ active: isFocused }" aria-hidden="true"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Search, X } from 'lucide-vue-next'

defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()

const isFocused = ref(false)
</script>

<style scoped>
.search-bar {
  position: relative;
  max-width: 500px;
  margin: 0 auto 2rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50px;
  padding: 0.75rem 1.25rem;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.search-input-wrapper:focus-within {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.4);
}

.search-icon {
  color: rgba(255, 255, 255, 0.6);
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 1rem;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

/* Screen Reader Only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.clear-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  padding: 0.35rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;
  /* Minimum touch target size */
  min-width: 44px;
  min-height: 44px;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

.clear-btn:focus {
  outline: 3px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

.clear-btn:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.6);
  outline-offset: 2px;
}

.search-glow {
  position: absolute;
  inset: -4px;
  border-radius: 54px;
  background: linear-gradient(135deg, #667eea, #764ba2, #f093fb);
  opacity: 0;
  z-index: -1;
  filter: blur(15px);
  transition: opacity 0.4s ease;
}

.search-glow.active {
  opacity: 0.5;
}
</style>
