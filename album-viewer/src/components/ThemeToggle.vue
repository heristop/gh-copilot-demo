<template>
  <button 
    class="theme-toggle"
    @click="toggleTheme"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    :aria-pressed="isDark"
    role="switch"
    v-motion
    :initial="{ opacity: 0, scale: 0 }"
    :enter="{ opacity: 1, scale: 1, transition: { delay: 500, type: 'spring' } }"
  >
    <div class="toggle-icon" :class="{ rotated: isDark }">
      <Sun v-if="!isDark" :size="20" aria-hidden="true" />
      <Moon v-else :size="20" aria-hidden="true" />
    </div>
    <span class="sr-only">{{ isDark ? 'Dark mode enabled' : 'Light mode enabled' }}</span>
  </button>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'

const props = defineProps<{
  isDark: boolean
}>()

const emit = defineEmits<{
  toggle: []
}>()

const toggleTheme = (): void => {
  emit('toggle')
  // Update localStorage and document attribute
  const newTheme = !props.isDark ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
}

onMounted(() => {
  // Set initial document attribute based on prop
  document.documentElement.setAttribute('data-theme', props.isDark ? 'dark' : 'light')
})
</script>

<style scoped>
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

.theme-toggle {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  backdrop-filter: blur(10px);
  z-index: 100;
  transition: all 0.3s ease;
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.theme-toggle:focus {
  outline: 3px solid rgba(255, 255, 255, 0.6);
  outline-offset: 4px;
}

.theme-toggle:focus-visible {
  outline: 3px solid rgba(255, 255, 255, 0.6);
  outline-offset: 4px;
}

.toggle-icon {
  transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toggle-icon.rotated {
  transform: rotate(360deg);
}
</style>
