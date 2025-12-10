<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="modal-overlay" @click.self="$emit('close')">
        <div 
          class="modal-content"
          v-motion
          :initial="{ opacity: 0, scale: 0.9, y: 50 }"
          :enter="{ opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } }"
        >
          <button class="close-btn" @click="$emit('close')" aria-label="Close modal">
            <X :size="24" />
          </button>
          
          <div class="modal-image">
            <img :src="album.image_url" :alt="album.title" />
            <div class="image-overlay">
              <button class="play-large-btn" @click="togglePlay">
                <component :is="isPlaying ? Pause : Play" :size="40" />
              </button>
            </div>
            
            <!-- Audio visualizer -->
            <div v-if="isPlaying" class="audio-visualizer">
              <div v-for="n in 12" :key="n" class="bar" :style="{ animationDelay: `${n * 0.1}s` }"></div>
            </div>
          </div>
          
          <div class="modal-info">
            <div class="album-header">
              <h2>{{ album.title }}</h2>
              <button 
                class="wishlist-btn"
                :class="{ active: isWishlisted }"
                @click="toggleWishlist"
                aria-label="Add to wishlist"
              >
                <Heart :size="24" :fill="isWishlisted ? 'currentColor' : 'none'" />
              </button>
            </div>
            
            <p class="artist">
              <Music :size="18" />
              {{ album.artist }}
            </p>
            
            <div class="album-meta">
              <span class="meta-item">
                <Disc3 :size="16" />
                12 tracks
              </span>
              <span class="meta-item">
                <Clock :size="16" />
                45 min
              </span>
              <span class="meta-item">
                <Calendar :size="16" />
                2024
              </span>
            </div>
            
            <div class="price-section">
              <span class="price">${{ album.price.toFixed(2) }}</span>
              <span class="original-price">${{ (album.price * 1.3).toFixed(2) }}</span>
              <span class="discount">-23%</span>
            </div>
            
            <div class="track-preview">
              <h4>Track Preview</h4>
              <div class="tracks">
                <div 
                  v-for="(track, index) in tracks" 
                  :key="index"
                  class="track-item"
                  :class="{ playing: currentTrack === index && isPlaying }"
                  @click="playTrack(index)"
                >
                  <span class="track-number">{{ index + 1 }}</span>
                  <span class="track-name">{{ track }}</span>
                  <span class="track-duration">3:{{ 20 + index * 7 }}</span>
                </div>
              </div>
            </div>
            
            <div class="modal-actions">
              <button class="btn btn-primary" @click="addToCart">
                <ShoppingCart :size="18" />
                Add to Cart
              </button>
              <button class="btn btn-secondary" @click="buyNow">
                <Zap :size="18" />
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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

const togglePlay = () => {
  isPlaying.value = !isPlaying.value
  if (isPlaying.value) {
    toast.success('Now playing preview', {
      description: `${props.album.title} - ${tracks.value[currentTrack.value]}`
    })
  }
}

const playTrack = (index: number) => {
  currentTrack.value = index
  isPlaying.value = true
  toast.info(`Playing track ${index + 1}`, {
    description: tracks.value[index]
  })
}

const toggleWishlist = () => {
  isWishlisted.value = !isWishlisted.value
  emit('addToWishlist', props.album)
  toast.success(
    isWishlisted.value ? 'Added to wishlist' : 'Removed from wishlist',
    { description: props.album.title }
  )
}

const addToCart = () => {
  toast.success('Added to cart!', {
    description: `${props.album.title} - $${props.album.price.toFixed(2)}`,
    action: {
      label: 'View Cart',
      onClick: () => toast.info('Opening cart...')
    }
  })
  emit('close')
}

const buyNow = () => {
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
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
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
