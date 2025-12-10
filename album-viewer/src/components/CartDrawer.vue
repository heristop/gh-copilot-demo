<template>
  <Teleport to="body">
    <Transition name="backdrop">
      <div v-if="isOpen" class="cart-backdrop" @click="close"></div>
    </Transition>
    
    <Transition name="drawer">
      <div v-if="isOpen" class="cart-drawer">
        <div class="cart-header">
          <div class="header-title">
            <ShoppingCart :size="24" />
            <h2>Shopping Cart</h2>
          </div>
          <button class="close-btn" @click="close" aria-label="Close cart">
            <X :size="24" />
          </button>
        </div>

        <div v-if="items.length === 0" class="empty-cart">
          <ShoppingBag :size="64" />
          <h3>Your cart is empty</h3>
          <p>Add some albums to get started!</p>
        </div>

        <div v-else class="cart-content">
          <div class="cart-items">
            <TransitionGroup name="cart-item">
              <div 
                v-for="item in items" 
                :key="item.album.id"
                class="cart-item"
              >
                <img 
                  :src="item.album.image_url" 
                  :alt="item.album.title"
                  class="item-image"
                  @error="handleImageError"
                />
                <div class="item-details">
                  <h4>{{ item.album.title }}</h4>
                  <p>{{ item.album.artist }}</p>
                  <span class="item-price">${{ item.album.price.toFixed(2) }}</span>
                </div>
                <div class="item-actions">
                  <div class="quantity-controls">
                    <button 
                      @click="decrementQuantity(item.album.id)"
                      class="qty-btn"
                      aria-label="Decrease quantity"
                    >
                      <Minus :size="16" />
                    </button>
                    <span class="quantity">{{ item.quantity }}</span>
                    <button 
                      @click="incrementQuantity(item.album.id)"
                      class="qty-btn"
                      aria-label="Increase quantity"
                    >
                      <Plus :size="16" />
                    </button>
                  </div>
                  <button 
                    @click="removeItem(item.album.id)"
                    class="remove-btn"
                    aria-label="Remove from cart"
                  >
                    <Trash2 :size="18" />
                  </button>
                </div>
              </div>
            </TransitionGroup>
          </div>

          <div class="cart-footer">
            <div class="total-section">
              <div class="total-row">
                <span>Subtotal</span>
                <span>${{ subtotal.toFixed(2) }}</span>
              </div>
              <div class="total-row total">
                <span>Total</span>
                <span>${{ total.toFixed(2) }}</span>
              </div>
            </div>
            <button class="checkout-btn">
              <CreditCard :size="20" />
              Proceed to Checkout
            </button>
            <button class="clear-btn" @click="clearCart">
              <Trash2 :size="18" />
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ShoppingCart, ShoppingBag, X, Minus, Plus, Trash2, CreditCard } from 'lucide-vue-next'
import type { CartItem } from '../types/cart'

interface Props {
  items: CartItem[]
  isOpen: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  removeItem: [albumId: number]
  incrementQuantity: [albumId: number]
  decrementQuantity: [albumId: number]
  clearCart: []
}>()

const subtotal = computed(() => {
  return props.items.reduce((sum, item) => sum + item.album.price * item.quantity, 0)
})

const total = computed(() => subtotal.value)

const close = (): void => {
  emit('close')
}

const removeItem = (albumId: number): void => {
  emit('removeItem', albumId)
}

const incrementQuantity = (albumId: number): void => {
  emit('incrementQuantity', albumId)
}

const decrementQuantity = (albumId: number): void => {
  emit('decrementQuantity', albumId)
}

const clearCart = (): void => {
  emit('clearCart')
}

const handleImageError = (event: Event): void => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/80x80/667eea/white?text=Album'
}
</script>

<style scoped>
.cart-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 999;
}

.cart-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 450px;
  max-width: 90vw;
  background: linear-gradient(135deg, rgba(15, 12, 41, 0.98) 0%, rgba(48, 43, 99, 0.98) 100%);
  backdrop-filter: blur(20px);
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
}

.header-title h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.empty-cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.empty-cart svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-cart h3 {
  color: white;
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.empty-cart p {
  margin: 0;
  font-size: 0.95rem;
}

.cart-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.cart-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.cart-item:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.2);
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.item-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.item-details h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-details p {
  margin: 0;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
}

.item-price {
  font-size: 1rem;
  font-weight: 700;
  color: #667eea;
  margin-top: auto;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: flex-end;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 0.25rem;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.qty-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.quantity {
  min-width: 24px;
  text-align: center;
  color: white;
  font-weight: 600;
  font-size: 0.95rem;
}

.remove-btn {
  background: transparent;
  border: none;
  color: rgba(255, 107, 107, 0.7);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: rgba(255, 107, 107, 0.1);
  color: #ff6b6b;
}

.cart-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
}

.total-section {
  margin-bottom: 1rem;
}

.total-row {
  display: flex;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.total-row.total {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 0.5rem;
}

.checkout-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.5);
}

.clear-btn {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  color: rgba(255, 107, 107, 0.9);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.clear-btn:hover {
  background: rgba(255, 107, 107, 0.1);
  border-color: rgba(255, 107, 107, 0.5);
}

/* Transitions */
.backdrop-enter-active,
.backdrop-leave-active {
  transition: opacity 0.3s ease;
}

.backdrop-enter-from,
.backdrop-leave-to {
  opacity: 0;
}

.drawer-enter-active,
.drawer-leave-active {
  transition: transform 0.3s ease;
}

.drawer-enter-from,
.drawer-leave-to {
  transform: translateX(100%);
}

.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.3s ease;
}

.cart-item-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.cart-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.cart-item-move {
  transition: transform 0.3s ease;
}

/* Scrollbar */
.cart-items::-webkit-scrollbar {
  width: 6px;
}

.cart-items::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}

.cart-items::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.cart-items::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  .cart-drawer {
    width: 100vw;
    max-width: 100vw;
  }
}
</style>
