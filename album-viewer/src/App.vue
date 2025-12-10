<template>
  <div class="app" :class="{ 'light-theme': !isDark }">
    <!-- Background Effects -->
    <div class="background-effects">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="floating-notes">
        <div class="note" v-for="n in 12" :key="n" :style="getNoteStyle(n)">♪</div>
      </div>
    </div>

    <!-- Theme Toggle -->
    <ThemeToggle @toggle="isDark = !isDark" />

    <!-- Toast Notifications -->
    <Toaster 
      position="top-right" 
      :theme="isDark ? 'dark' : 'light'"
      :richColors="true"
      :expand="true"
      :visibleToasts="4"
    />

    <!-- Header -->
    <header 
      class="header"
      v-motion
      :initial="{ opacity: 0, y: -80 }"
      :enter="{ opacity: 1, y: 0, transition: { duration: 1000, type: 'spring', stiffness: 100 } }"
    >
      <div class="logo-container">
        <div class="logo-icon">
          <Music2 :size="40" />
        </div>
        <div>
          <h1>Album Collection</h1>
          <p class="subtitle">Discover amazing music</p>
        </div>
      </div>
      
      <div class="header-stats" v-if="!loading && !error">
        <div 
          class="stat-card"
          v-motion
          :initial="{ opacity: 0, scale: 0 }"
          :enter="{ opacity: 1, scale: 1, transition: { delay: 600, type: 'spring' } }"
        >
          <Library :size="18" />
          <span>{{ filteredAlbums.length }} Albums</span>
        </div>
        <div 
          class="stat-card"
          v-motion
          :initial="{ opacity: 0, scale: 0 }"
          :enter="{ opacity: 1, scale: 1, transition: { delay: 700, type: 'spring' } }"
        >
          <Sparkles :size="18" />
          <span>Best Prices</span>
        </div>
        <div 
          class="stat-card wishlist-stat"
          v-motion
          :initial="{ opacity: 0, scale: 0 }"
          :enter="{ opacity: 1, scale: 1, transition: { delay: 800, type: 'spring' } }"
          @click="showWishlistToast"
        >
          <Heart :size="18" />
          <span>{{ wishlist.length }} Wishlist</span>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main">
      <!-- Search & Filters -->
      <div v-if="!loading && !error" class="controls">
        <SearchBar v-model="searchQuery" />
        <FilterSort v-model="sortBy" v-model:viewMode="viewMode" />
      </div>

      <!-- Loading State with Skeleton -->
      <div v-if="loading" class="loading-container">
        <div class="albums-grid">
          <SkeletonCard v-for="n in 6" :key="n" />
        </div>
      </div>

      <!-- Error State -->
      <div 
        v-else-if="error" 
        class="error-container"
        v-motion
        :initial="{ opacity: 0, scale: 0.8 }"
        :enter="{ opacity: 1, scale: 1, transition: { type: 'spring' } }"
      >
        <div class="error-card">
          <div class="error-icon">
            <AlertCircle :size="64" />
          </div>
          <h3>Oops! Something went wrong</h3>
          <p>{{ error }}</p>
          <button @click="fetchAlbums" class="retry-btn">
            <RefreshCw :size="18" />
            Try Again
          </button>
        </div>
      </div>

      <!-- Albums Grid/List -->
      <div v-else>
        <!-- No Results -->
        <div 
          v-if="filteredAlbums.length === 0" 
          class="no-results"
          v-motion
          :initial="{ opacity: 0 }"
          :enter="{ opacity: 1 }"
        >
          <SearchX :size="64" />
          <h3>No albums found</h3>
          <p>Try adjusting your search or filters</p>
          <button @click="resetFilters" class="reset-btn">
            <RotateCcw :size="16" />
            Reset Filters
          </button>
        </div>

        <!-- Albums -->
        <TransitionGroup 
          :name="viewMode === 'grid' ? 'album-grid' : 'album-list'"
          tag="div" 
          :class="['albums-container', viewMode]"
        >
          <AlbumCard 
            v-for="(album, index) in filteredAlbums" 
            :key="album.id" 
            :album="album"
            :index="index"
            :isWishlisted="wishlist.includes(album.id)"
            :viewMode="viewMode"
            @click="openModal(album)"
            @toggle-wishlist="toggleWishlist"
          />
        </TransitionGroup>
      </div>
    </main>

    <!-- Album Detail Modal -->
    <AlbumModal 
      v-if="selectedAlbum"
      :album="selectedAlbum"
      :isOpen="isModalOpen"
      @close="closeModal"
      @addToWishlist="toggleWishlist"
    />

    <!-- Footer -->
    <footer 
      class="footer"
      v-motion
      :initial="{ opacity: 0 }"
      :enter="{ opacity: 1, transition: { delay: 1000 } }"
    >
      <div class="footer-content">
        <p>
          Made with <Heart :size="16" class="heart-icon" /> using Vue.js, VueMotion & Lucide
        </p>
        <div class="footer-links">
          <a href="#" @click.prevent="showAboutToast">
            <Info :size="16" /> About
          </a>
          <a href="#" @click.prevent="showContactToast">
            <Mail :size="16" /> Contact
          </a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
import { Toaster, toast } from 'vue-sonner'
import { 
  Music2, Library, Sparkles, Heart, AlertCircle, 
  RefreshCw, SearchX, RotateCcw, Info, Mail 
} from 'lucide-vue-next'

import AlbumCard from './components/AlbumCard.vue'
import AlbumModal from './components/AlbumModal.vue'
import SearchBar from './components/SearchBar.vue'
import FilterSort from './components/FilterSort.vue'
import SkeletonCard from './components/SkeletonCard.vue'
import ThemeToggle from './components/ThemeToggle.vue'
import type { Album } from './types/album'

// State
const albums = ref<Album[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const sortBy = ref('default')
const viewMode = ref<'grid' | 'list'>('grid')
const wishlist = ref<number[]>([])
const selectedAlbum = ref<Album | null>(null)
const isModalOpen = ref(false)
const isDark = ref(true)

// Computed
const filteredAlbums = computed(() => {
  let result = [...albums.value]
  
  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(album => 
      album.title.toLowerCase().includes(query) ||
      album.artist.toLowerCase().includes(query)
    )
  }
  
  // Sort
  switch (sortBy.value) {
    case 'price-asc':
      result.sort((a, b) => a.price - b.price)
      break
    case 'price-desc':
      result.sort((a, b) => b.price - a.price)
      break
    case 'name':
      result.sort((a, b) => a.title.localeCompare(b.title))
      break
  }
  
  return result
})

// Methods
const fetchAlbums = async () => {
  try {
    loading.value = true
    error.value = null
    
    // Simulate network delay for skeleton effect
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const response = await axios.get<Album[]>('/albums')
    albums.value = response.data
    
    toast.success('Albums loaded!', {
      description: `${response.data.length} albums ready to explore`
    })
  } catch (err) {
    error.value = 'Failed to load albums. Please make sure the API is running.'
    toast.error('Failed to load albums')
  } finally {
    loading.value = false
  }
}

const toggleWishlist = (album: Album) => {
  const index = wishlist.value.indexOf(album.id)
  if (index > -1) {
    wishlist.value.splice(index, 1)
    toast('Removed from wishlist', { description: album.title })
  } else {
    wishlist.value.push(album.id)
    toast.success('Added to wishlist!', { description: album.title })
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist.value))
}

const openModal = (album: Album) => {
  selectedAlbum.value = album
  isModalOpen.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isModalOpen.value = false
  document.body.style.overflow = ''
  setTimeout(() => { selectedAlbum.value = null }, 300)
}

const resetFilters = () => {
  searchQuery.value = ''
  sortBy.value = 'default'
  toast.info('Filters reset')
}

const getNoteStyle = (n: number) => ({
  left: `${(n * 8) % 100}%`,
  animationDelay: `${n * 0.5}s`,
  animationDuration: `${15 + n * 2}s`
})

const showWishlistToast = () => {
  if (wishlist.value.length === 0) {
    toast.info('Your wishlist is empty')
  } else {
    toast.success(`${wishlist.value.length} items in wishlist`)
  }
}

const showAboutToast = () => {
  toast('Album Collection v2.0', {
    description: 'A modern music album browser built with Vue 3'
  })
}

const showContactToast = () => {
  toast.info('Contact: hello@albumcollection.dev')
}

// Watch search
let searchTimeout: ReturnType<typeof setTimeout>
watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout)
  if (newVal) {
    searchTimeout = setTimeout(() => {
      if (filteredAlbums.value.length === 0) {
        toast.warning('No results found')
      }
    }, 500)
  }
})

onMounted(() => {
  const saved = localStorage.getItem('wishlist')
  if (saved) wishlist.value = JSON.parse(saved)
  fetchAlbums()
})
</script>

<style scoped>
.app {
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  overflow-x: hidden;
  background: linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%);
  transition: all 0.5s ease;
}

.app.light-theme {
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 50%, #c3cfe2 100%);
}

/* Background Effects */
.background-effects {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.5;
  animation: float-orb 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, #667eea 0%, transparent 70%);
  top: -200px;
  left: -200px;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, #f093fb 0%, transparent 70%);
  bottom: -150px;
  right: -150px;
  animation-delay: -10s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, #4facfe 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -5s;
}

@keyframes float-orb {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(50px, -30px) scale(1.1); }
  50% { transform: translate(-30px, 50px) scale(0.9); }
  75% { transform: translate(-50px, -20px) scale(1.05); }
}

.floating-notes {
  position: absolute;
  inset: 0;
}

.note {
  position: absolute;
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.1);
  animation: float-note linear infinite;
}

@keyframes float-note {
  0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
  10% { opacity: 0.15; }
  90% { opacity: 0.15; }
  100% { transform: translateY(-100px) rotate(720deg); opacity: 0; }
}

/* Header */
.header {
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
  z-index: 1;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.logo-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  padding: 1rem;
  border-radius: 20px;
  color: white;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
}

.header h1 {
  font-size: 2.8rem;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #e0e7ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.light-theme .header h1 {
  background: linear-gradient(135deg, #1a1a2e 0%, #302b63 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.1rem;
  margin: 0;
}

.light-theme .subtitle {
  color: rgba(0, 0, 0, 0.6);
}

.header-stats {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 25px;
  color: white;
  font-size: 0.85rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.3s ease;
}

.light-theme .stat-card {
  background: rgba(0, 0, 0, 0.05);
  color: #302b63;
  border-color: rgba(0, 0, 0, 0.1);
}

.stat-card.wishlist-stat {
  cursor: pointer;
}

.stat-card.wishlist-stat:hover {
  background: rgba(255, 107, 107, 0.2);
  border-color: rgba(255, 107, 107, 0.4);
}

/* Main */
.main {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.controls {
  margin-bottom: 1.5rem;
}

.loading-container {
  padding: 1rem;
}

/* Error */
.error-container {
  display: flex;
  justify-content: center;
  padding: 3rem 1rem;
}

.error-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  text-align: center;
  max-width: 450px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.error-icon {
  color: #ff6b6b;
  margin-bottom: 1rem;
}

.error-card h3 {
  color: white;
  font-size: 1.4rem;
  margin: 0 0 0.5rem;
}

.error-card p {
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 1.5rem;
  font-size: 0.95rem;
}

.retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 0.75rem 1.75rem;
  border-radius: 25px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* No Results */
.no-results {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.no-results svg {
  opacity: 0.5;
  margin-bottom: 0.75rem;
}

.no-results h3 {
  color: white;
  margin: 0 0 0.4rem;
}

.no-results p {
  margin: 0 0 1.25rem;
}

.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.2);
  padding: 0.6rem 1.25rem;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* Albums Container */
.albums-container {
  padding: 0.5rem;
}

.albums-container.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.75rem;
}

.albums-container.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.75rem;
  padding: 0.5rem;
}

/* Transitions */
.album-grid-enter-active,
.album-grid-leave-active {
  transition: all 0.4s ease;
}

.album-grid-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(20px);
}

.album-grid-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

.album-grid-move {
  transition: transform 0.4s ease;
}

/* Footer */
.footer {
  text-align: center;
  padding: 2.5rem 1rem;
  margin-top: 2rem;
  position: relative;
  z-index: 1;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.footer p {
  color: rgba(255, 255, 255, 0.6);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  font-size: 0.9rem;
}

.light-theme .footer p {
  color: rgba(0, 0, 0, 0.5);
}

.heart-icon {
  color: #ff6b6b;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.footer-links {
  display: flex;
  gap: 1.25rem;
}

.footer-links a {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: rgba(255, 255, 255, 0.5);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.3s ease;
}

.footer-links a:hover {
  color: white;
}

.light-theme .footer-links a {
  color: rgba(0, 0, 0, 0.4);
}

.light-theme .footer-links a:hover {
  color: #302b63;
}

/* Responsive */
@media (max-width: 768px) {
  .app {
    padding: 1rem;
  }
  
  .logo-container {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .header h1 {
    font-size: 1.8rem;
  }
  
  .albums-container.grid,
  .albums-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  
  .gradient-orb {
    display: none;
  }
}
</style>
