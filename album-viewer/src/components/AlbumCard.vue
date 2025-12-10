<template>
  <div 
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
  >
    <!-- Wishlist Button -->
    <button 
      class="wishlist-btn"
      :class="{ active: isInWishlist }"
      @click.stop="toggleWishlist"
      :aria-label="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
    >
      <Heart :size="20" :fill="isInWishlist ? 'currentColor' : 'none'" />
    </button>

    <div class="album-image">
      <img 
        :src="album.image_url" 
        :alt="album.title"
        @error="handleImageError"
        loading="lazy"
      />
      <div class="play-overlay">
        <div class="play-button" @click.stop="playPreview">
          <Play :size="28" />
        </div>
      </div>
      <div v-if="album.id <= 2" class="album-badge">NEW</div>
    </div>
    
    <div class="album-info">
      <h3 class="album-title">{{ album.title }}</h3>
      <p class="album-artist">
        <User :size="16" class="artist-icon" />
        {{ album.artist }}
      </p>
      <div class="album-price">
        <span class="price">${{ album.price.toFixed(2) }}</span>
        <span class="price-label">
          <Sparkles :size="12" />
          Best Price
        </span>
      </div>
    </div>
    
    <div class="album-actions">
      <button class="btn btn-primary" @click.stop="addToCart">
        <ShoppingCart :size="18" />
        Add to Cart
      </button>
      <button class="btn btn-secondary" @click.stop="$emit('openModal', album)">
        <Eye :size="18" />
        Details
      </button>
    </div>
  </div>
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
}

const playPreview = (): void => {
  toast.info(`Playing preview of "${props.album.title}"`, {
    description: 'Preview feature coming soon!',
    duration: 2500
  })
}
</script>

<style scoped>
.album-card {
  background: var(--card-bg);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  cursor: pointer;
  position: relative;
}

.album-card:hover {
  transform: translateY(-12px);
  box-shadow: var(--shadow-xl);
}

/* Wishlist Button */
.wishlist-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  z-index: 10;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.wishlist-btn:hover {
  transform: scale(1.1);
  color: #ef4444;
}

.wishlist-btn.active {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
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
}

.artist-icon {
  opacity: 0.7;
}

.album-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.price-label {
  font-size: 0.75rem;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  padding: 0.3rem 0.75rem;
  border-radius: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
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
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.btn-primary svg {
  color: white;
  stroke: white;
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.btn-secondary {
  background: var(--bg-secondary);
  color: var(--accent-color);
  border: 2px solid var(--border-color);
}

.btn-secondary:hover {
  background: var(--accent-color);
  color: white;
  border-color: var(--accent-color);
  transform: translateY(-3px);
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
