<template>
  <article 
    class="album-card"
    v-motion
    :initial="{ opacity: 0, y: 50, scale: 0.9 }"
    :enter="{ 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 500,
        delay: index * 100
      } 
    }"
    :hovered="{ scale: 1.02 }"
    @click="$emit('openModal', album)"
    tabindex="0"
    role="article"
    :aria-label="`${album.title} by ${album.artist}, $${album.price.toFixed(2)}${isInWishlist ? ', in wishlist' : ''}`"
    @keydown.enter="$emit('openModal', album)"
    @keydown.space.prevent="$emit('openModal', album)"
  >
    <!-- Wishlist Button -->
    <button 
      class="wishlist-btn"
      :class="{ active: isInWishlist }"
      @click.stop="toggleWishlist"
      @keydown.enter.stop="toggleWishlist"
      @keydown.space.stop.prevent="toggleWishlist"
      :aria-label="isInWishlist ? `Remove ${album.title} from wishlist` : `Add ${album.title} to wishlist`"
      :aria-pressed="isInWishlist"
    >
      <Heart :size="20" :fill="isInWishlist ? 'currentColor' : 'none'" aria-hidden="true" />
    </button>

    <div class="album-image">
      <img 
        :src="album.image_url" 
        :alt="`Album cover for ${album.title} by ${album.artist}`"
        @error="handleImageError"
        loading="lazy"
      />
      <div class="play-overlay" aria-hidden="true">
        <button 
          class="play-button" 
          @click.stop="playPreview"
          @keydown.enter.stop="playPreview"
          @keydown.space.stop.prevent="playPreview"
          :aria-label="`Play preview of ${album.title}`"
          tabindex="0"
        >
          <Play :size="28" aria-hidden="true" />
        </button>
      </div>
      <div v-if="album.id <= 2" class="album-badge" role="status" aria-label="New album">NEW</div>
    </div>
    
    <div class="album-info">
      <h3 class="album-title" :id="`album-title-${album.id}`">{{ album.title }}</h3>
      <p class="album-artist">
        <User :size="16" class="artist-icon" aria-hidden="true" />
        <span class="sr-only">Artist: </span>{{ album.artist }}
      </p>
      <div class="album-price">
        <span class="price" aria-label="Price">${{ album.price.toFixed(2) }}</span>
        <span class="price-label" aria-hidden="true">
          <Sparkles :size="12" />
          Best Price
        </span>
      </div>
    </div>
    
    <div class="album-actions" role="group" aria-label="Album actions">
      <button 
        class="btn btn-primary" 
        @click.stop="addToCart"
        @keydown.enter.stop="addToCart"
        @keydown.space.stop.prevent="addToCart"
        :aria-label="`Add ${album.title} to cart for $${album.price.toFixed(2)}`"
      >
        <ShoppingCart :size="18" aria-hidden="true" />
        <span>Add to Cart</span>
      </button>
      <button 
        class="btn btn-secondary" 
        @click.stop="$emit('openModal', album)"
        @keydown.enter.stop="$emit('openModal', album)"
        @keydown.space.stop.prevent="$emit('openModal', album)"
        :aria-label="`View details for ${album.title}`"
      >
        <Eye :size="18" aria-hidden="true" />
        <span>Details</span>
      </button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toast } from 'vue-sonner'
import { Heart, Play, User, Sparkles, ShoppingCart, Eye } from 'lucide-vue-next'
import type { Album } from '../types/album'

interface Props {
  album: Album
  index?: number
  wishlist?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
  wishlist: () => []
})

const emit = defineEmits<{
  openModal: [album: Album]
  toggleWishlist: [albumId: number]
  addToCart: [album: Album]
}>()

const isInWishlist = computed(() => props.wishlist.includes(props.album.id))

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/300x300/667eea/white?text=Album+Cover'
}

const toggleWishlist = (): void => {
  emit('toggleWishlist', props.album.id)
  if (!isInWishlist.value) {
    toast.success(`${props.album.title} added to wishlist`, {
      description: `by ${props.album.artist}`,
      duration: 2000
    })
  } else {
    toast.info(`${props.album.title} removed from wishlist`, {
      duration: 2000
    })
  }
}

const addToCart = (): void => {
  emit('addToCart', props.album)
  toast.success(`${props.album.title} added to cart!`, {
    description: `$${props.album.price.toFixed(2)} • by ${props.album.artist}`,
    duration: 3000
  })
}

const playPreview = (): void => {
  toast.info(`Playing preview of "${props.album.title}"`, {
    description: 'Preview feature coming soon!',
    duration: 2500
  })
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

.album-card {
  background: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  cursor: pointer;
  position: relative;
}

/* Focus styles for keyboard navigation */
.album-card:focus {
  outline: 3px solid var(--accent-color, #a78bfa);
  outline-offset: 4px;
  transform: translateY(-12px);
  box-shadow: var(--shadow-xl);
}

.album-card:focus-visible {
  outline: 3px solid var(--accent-color, #a78bfa);
  outline-offset: 4px;
}

.album-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
  z-index: 1;
}

.album-card:hover {
  transform: translateY(-12px);
  box-shadow: var(--shadow-xl);
  border-color: var(--accent-color);
}

.album-card:hover::before {
  opacity: 1;
}

/* Wishlist Button */
.wishlist-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(15, 12, 41, 0.9);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
}

.wishlist-btn:focus {
  outline: 3px solid #f472b6;
  outline-offset: 2px;
}

.wishlist-btn:focus-visible {
  outline: 3px solid #f472b6;
  outline-offset: 2px;
}

.wishlist-btn:hover {
  transform: scale(1.15);
  color: #f472b6;
  border-color: #f472b6;
  background: rgba(244, 114, 182, 0.15);
  box-shadow: 0 4px 25px rgba(244, 114, 182, 0.4);
}

.wishlist-btn.active {
  color: #fff;
  background: linear-gradient(135deg, #ec4899, #f472b6);
  border-color: #f472b6;
  box-shadow: 0 4px 20px rgba(236, 72, 153, 0.6), 0 0 30px rgba(244, 114, 182, 0.4);
  animation: pulse-heart 1.5s ease-in-out infinite;
}

.wishlist-btn.active:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 25px rgba(236, 72, 153, 0.7), 0 0 40px rgba(244, 114, 182, 0.5);
}

@keyframes pulse-heart {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 4px 20px rgba(236, 72, 153, 0.6), 0 0 30px rgba(244, 114, 182, 0.4);
  }
  50% { 
    transform: scale(1.08);
    box-shadow: 0 4px 25px rgba(236, 72, 153, 0.7), 0 0 40px rgba(244, 114, 182, 0.5);
  }
}

.album-image {
  position: relative;
  overflow: hidden;
}

.album-image img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.album-card:hover .album-image img {
  transform: scale(1.15);
}

.album-badge {
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a5a);
  color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(238, 90, 90, 0.4);
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.album-card:hover .play-overlay {
  opacity: 1;
}

.play-button {
  width: 70px;
  height: 70px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #667eea;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.play-button:hover {
  transform: scale(1.15);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
}

.album-info {
  padding: 1.75rem;
}

.album-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.75rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.album-artist {
  color: var(--text-secondary);
  font-size: 1rem;
  margin: 0 0 1.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.artist-icon {
  color: var(--accent-color);
  opacity: 1;
  flex-shrink: 0;
}

.album-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #a78bfa, #f472b6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.price-label {
  font-size: 0.75rem;
  color: #4ade80;
  background: rgba(74, 222, 128, 0.15);
  padding: 0.3rem 0.75rem;
  border-radius: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.album-actions {
  padding: 0 1.75rem 1.75rem;
  display: flex;
  gap: 0.875rem;
}

.btn {
  flex: 1;
  padding: 0.875rem 1rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #8b5cf6, #d946ef);
  color: white;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-primary svg {
  color: white;
  stroke: white;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 30px rgba(139, 92, 246, 0.6), 0 0 20px rgba(217, 70, 239, 0.3);
}

.btn-secondary {
  background: rgba(139, 92, 246, 0.1);
  color: var(--accent-color);
  border: 1px solid rgba(139, 92, 246, 0.4);
}

.btn-secondary svg {
  color: var(--accent-color);
}

.btn-secondary:hover {
  background: rgba(139, 92, 246, 0.25);
  color: #c4b5fd;
  border-color: var(--accent-color);
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
}

.btn-secondary:hover svg {
  color: #c4b5fd;
}

@media (max-width: 768px) {
  .album-info {
    padding: 1.25rem;
  }
  
  .album-actions {
    padding: 0 1.25rem 1.25rem;
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
  }
  
  .album-image img {
    height: 220px;
  }
}
</style>
