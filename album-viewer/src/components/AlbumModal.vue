<template>
  <Teleport to="body">
    <Transition name="modal" @after-enter="onModalOpen" @before-leave="onModalClose">
      <div 
        v-if="isOpen" 
        class="modal-overlay" 
        @click.self="$emit('close')"
        @keydown="handleKeydown"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`modal-title-${album.id}`"
        :aria-describedby="`modal-desc-${album.id}`"
      >
        <div 
          class="modal-content"
          ref="modalContent"
          v-motion
          :initial="{ opacity: 0, scale: 0.9, y: 50 }"
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }"
        >
          <button 
            class="close-btn" 
            @click="$emit('close')" 
            aria-label="Close album details"
            ref="closeButton"
          >
            <X :size="24" aria-hidden="true" />
          </button>
          
          <div class="modal-image">
            <img :src="album.image_url" :alt="`Album cover for ${album.title} by ${album.artist}`" />
            <div class="image-overlay">
              <button 
                class="play-large-btn" 
                @click="togglePlay"
                :aria-label="isPlaying ? `Pause ${album.title} preview` : `Play ${album.title} preview`"
                :aria-pressed="isPlaying"
              >
                <component :is="isPlaying ? Pause : Play" :size="40" aria-hidden="true" />
              </button>
            </div>
            
            <!-- Audio visualizer -->
            <div v-if="isPlaying" class="audio-visualizer" aria-hidden="true">
              <div v-for="n in 12" :key="n" class="bar" :style="{ animationDelay: `${n * 0.1}s` }"></div>
            </div>
          </div>
          
          <div class="modal-info">
            <div class="album-header">
              <h2 :id="`modal-title-${album.id}`">{{ album.title }}</h2>
              <button 
                class="wishlist-btn"
                :class="{ active: isWishlisted }"
                @click="toggleWishlist"
                :aria-label="isWishlisted ? `Remove ${album.title} from wishlist` : `Add ${album.title} to wishlist`"
                :aria-pressed="isWishlisted"
              >
                <Heart :size="24" :fill="isWishlisted ? 'currentColor' : 'none'" aria-hidden="true" />
              </button>
            </div>
            
            <p class="artist" :id="`modal-desc-${album.id}`">
              <Music :size="18" aria-hidden="true" />
              <span class="sr-only">Artist: </span>{{ album.artist }}
            </p>
            
            <div class="album-meta" role="list" aria-label="Album information">
              <span class="meta-item" role="listitem">
                <Disc3 :size="16" aria-hidden="true" />
                <span class="sr-only">Number of tracks: </span>12 tracks
              </span>
              <span class="meta-item" role="listitem">
                <Clock :size="16" aria-hidden="true" />
                <span class="sr-only">Duration: </span>45 min
              </span>
              <span class="meta-item" role="listitem">
                <Calendar :size="16" aria-hidden="true" />
                <span class="sr-only">Release year: </span>2024
              </span>
            </div>
            
            <div class="price-section" aria-label="Pricing">
              <span class="price" aria-label="Current price">${{ album.price.toFixed(2) }}</span>
              <span class="original-price" aria-label="Original price"><del>${{ (album.price * 1.3).toFixed(2) }}</del></span>
              <span class="discount" role="status">-23% off</span>
            </div>
            
            <div class="track-preview">
              <h4 id="track-list-heading">Track Preview</h4>
              <div class="tracks" role="list" aria-labelledby="track-list-heading">
                <button 
                  v-for="(track, index) in tracks" 
                  :key="index"
                  class="track-item"
                  :class="{ playing: currentTrack === index && isPlaying }"
                  @click="playTrack(index)"
                  role="listitem"
                  :aria-label="`Play track ${index + 1}: ${track}, duration 3:${20 + index * 7}`"
                  :aria-current="currentTrack === index && isPlaying ? 'true' : undefined"
                >
                  <span class="track-number" aria-hidden="true">{{ index + 1 }}</span>
                  <span class="track-name">{{ track }}</span>
                  <span class="track-duration" aria-hidden="true">3:{{ 20 + index * 7 }}</span>
                </button>
              </div>
            </div>
            
            <div class="modal-actions" role="group" aria-label="Purchase options">
              <button 
                class="btn btn-primary" 
                @click="addToCart"
                :aria-label="`Add ${album.title} to cart for $${album.price.toFixed(2)}`"
                ref="addToCartButton"
              >
                <ShoppingCart :size="18" aria-hidden="true" />
                <span>Add to Cart</span>
              </button>
              <button 
                class="btn btn-secondary" 
                @click="buyNow"
                :aria-label="`Buy ${album.title} now for $${album.price.toFixed(2)}`"
              >
                <Zap :size="18" aria-hidden="true" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onUnmounted } from 'vue'
import { 
  X, Heart, Music, Disc3, Clock, Calendar, 
  ShoppingCart, Zap, Play, Pause 
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import type { Album } from '../types/album'

const props = defineProps<{
  album: Album
  isOpen: boolean
}>()

const emit = defineEmits<{
  close: []
  addToWishlist: [album: Album]
}>()

// Refs for focus management
const modalContent = ref<HTMLElement | null>(null)
const closeButton = ref<HTMLButtonElement | null>(null)
const addToCartButton = ref<HTMLButtonElement | null>(null)
let previouslyFocusedElement: HTMLElement | null = null

const isPlaying = ref(false)
const currentTrack = ref(0)
const isWishlisted = ref(false)

const tracks = computed(() => [
  'Opening Overture',
  'Digital Dreams',
  'Cloud Nine',
  'Binary Sunset',
  'Async Love'
])

// Focus trap and keyboard management
const getFocusableElements = (): HTMLElement[] => {
  if (!modalContent.value) return []
  const focusableSelectors = [
    'button:not([disabled])',
    'a[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ]
  return Array.from(
    modalContent.value.querySelectorAll<HTMLElement>(focusableSelectors.join(','))
  )
}

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape') {
    emit('close')
    return
  }

  if (event.key === 'Tab') {
    const focusableElements = getFocusableElements()
    if (focusableElements.length === 0) return

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement?.focus()
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement?.focus()
      }
    }
  }
}

const onModalOpen = (): void => {
  // Store the previously focused element
  previouslyFocusedElement = document.activeElement as HTMLElement
  
  // Focus the close button when modal opens
  nextTick(() => {
    closeButton.value?.focus()
  })
}

const onModalClose = (): void => {
  // Restore focus to the previously focused element
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus()
    previouslyFocusedElement = null
  }
}

// Cleanup on unmount
onUnmounted(() => {
  if (previouslyFocusedElement) {
    previouslyFocusedElement.focus()
  }
})

const togglePlay = (): void => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    toast.success('Now playing preview', {
      description: `${props.album.title} - ${tracks.value[currentTrack.value]}`
    })
  }
}

const playTrack = (index: number): void => {
  currentTrack.value = index
  isPlaying.value = true
  toast.info(`Playing track ${index + 1}`, {
    description: tracks.value[index]
  })
}

const toggleWishlist = (): void => {
  isWishlisted.value = !isWishlisted.value
  emit('addToWishlist', props.album)
  toast.success(
    isWishlisted.value ? 'Added to wishlist' : 'Removed from wishlist',
    { description: props.album.title }
  )
}

const addToCart = (): void => {
  toast.success('Added to cart!', {
    description: `${props.album.title} - $${props.album.price.toFixed(2)}`,
    action: {
      label: 'View Cart',
      onClick: (): void => { toast.info('Opening cart...') }
    }
  })
  emit('close')
}

const buyNow = (): void => {
  toast.promise(
    new Promise(resolve => setTimeout(resolve, 2000)),
    {
      loading: 'Processing payment...',
      success: 'Purchase complete! 🎉',
      error: 'Payment failed'
    }
  )
}
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

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 24px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  position: relative;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  padding: 0.5rem;
  color: white;
  cursor: pointer;
  z-index: 10;
  transition: all 0.3s ease;
  /* Minimum touch target size for accessibility */
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.close-btn:focus {
  outline: 3px solid #a78bfa;
  outline-offset: 2px;
}

.close-btn:focus-visible {
  outline: 3px solid #a78bfa;
  outline-offset: 2px;
}

.modal-image {
  position: relative;
  overflow: hidden;
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  min-height: 400px;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal-image:hover .image-overlay {
  opacity: 1;
}

.play-large-btn {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.play-large-btn:hover {
  transform: scale(1.1);
}

.audio-visualizer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  padding: 0 1rem 1rem;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
}

.bar {
  width: 4px;
  background: linear-gradient(to top, #667eea, #f093fb);
  border-radius: 2px;
  animation: equalizer 0.8s ease-in-out infinite alternate;
}

@keyframes equalizer {
  0% { height: 10px; }
  100% { height: 40px; }
}

.modal-info {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.album-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.album-header h2 {
  font-size: 1.75rem;
  color: white;
  margin: 0;
  line-height: 1.2;
}

.wishlist-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  padding: 0.6rem;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.wishlist-btn:hover,
.wishlist-btn.active {
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.2);
  transform: scale(1.1);
}

.artist {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 0;
}

.album-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
}

.price-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.price {
  font-size: 2rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #f093fb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.original-price {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.4);
  text-decoration: line-through;
}

.discount {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.track-preview {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 1rem;
}

.track-preview h4 {
  color: white;
  margin: 0 0 0.75rem;
  font-size: 0.95rem;
}

.tracks {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.track-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.track-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.track-item.playing {
  background: rgba(102, 126, 234, 0.2);
}

.track-number {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  width: 20px;
}

.track-name {
  flex: 1;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.track-duration {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary svg {
  color: white;
  stroke: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .modal-content {
    grid-template-columns: 1fr;
    max-height: 95vh;
  }
  
  .modal-image img {
    min-height: 250px;
    max-height: 300px;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>
