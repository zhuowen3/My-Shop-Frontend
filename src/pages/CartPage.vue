<template>
  <div class="cart-container">
    <h2 class="cart-title">🛒 Your Cart</h2>

    <div v-if="cart.items.length === 0" class="cart-empty">
      <div class="empty-box">
        <img :src="emptyCartUrl" alt="Empty Cart" class="empty-icon" />
        <p>Your cart is empty.</p>
      </div>
    </div>

    <div v-else class="cart-content">
      <div
        v-for="item in cart.items"
        :key="item.id + '-' + (item.style || '')"
        class="cart-item"
      >
        <img :src="item.image_url" class="item-image" />
        <div class="item-details">
          <h3 class="item-name">
            {{ item.name }}
            <span v-if="item.style" class="item-style">({{ item.style }})</span>
          </h3>
          <p class="item-info">
            ${{ item.price.toFixed(2) }} ×
            <button @click="decrease(item)" class="quantity-btn">−</button>
            <span class="quantity-number">{{ item.quantity }}</span>
            <button @click="increase(item)" class="quantity-btn">＋</button>
          </p>
        </div>
        <button class="remove-button" @click="remove(item.id)">✖</button>
      </div>

      <div class="cart-total">
        Total: ${{ cart.totalPrice.toFixed(2) }}
      </div>
      <div class="cart-actions">
        <button
          class="checkout-button"
          @click="checkout"
          :disabled="cart.items.length === 0 || exceedsStock"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import type { CartItem } from '@/stores/cart'
import axios from 'axios'
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import emptyCartUrl from '@/assets/empty-cart.svg'
const router = useRouter()
const cart = useCartStore()

function checkout() {
  router.push('/checkout')
}

const exceedsStock = computed(() =>
  cart.items.some(item => {
    if (item.stock === undefined) return false
    return item.quantity > item.stock
  })
)

function remove(id: number) {
  cart.removeFromCart(id)
}

function increase(item: CartItem) {
  const match = cart.items.find(
    i => i.id === item.id && i.style === item.style
  )
  const currentQty = match?.quantity ?? 0
  const available = item.stock ?? 0

  if (currentQty >= available) return

  cart.addToCart({
    id: item.id,
    name: item.name,
    price: item.price,
    image_url: item.image_url,
    quantity: 1,
    style: item.style,
    stock: available,
  })
}

function decrease(item: CartItem) {
  if (item.quantity <= 1) {
    cart.removeFromCart(item.id)
  } else {
    item.quantity--
    cart.saveCart()
  }
}

onMounted(async () => {
  await syncCartStock()
})

async function syncCartStock() {
  const productIds = [...new Set(cart.items.map(item => item.id))]
  const promises = productIds.map(async (id) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`)
      const product = res.data
      cart.items.forEach(item => {
        if (item.id === id) {
          if (item.style && product.styles) {
            const matchingStyle = product.styles.find((s: { name: string; stock: number }) => s.name === item.style)
            if (matchingStyle) item.stock = matchingStyle.stock
          } else {
            item.stock = product.stock
          }
        }
      })
    } catch (error) {
      console.error('Failed to fetch stock for product ID:', id)
    }
  })

  await Promise.all(promises)
}
</script>

<style scoped>
.cart-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
  min-height: calc(100vh - 200px); /* leaves space so it doesn't get squeezed */
}

.cart-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 24px;
}

.cart-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60vh; /* Center vertically */
}

.empty-box {
  text-align: center;
  color: #777;
}

.empty-icon {
  width: 120px;
  opacity: 0.7;
  margin-bottom: 12px;
}

.cart-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  transition: transform 0.2s;
}

.cart-item:hover {
  transform: translateY(-2px);
}

.item-image {
  width: 72px;
  height: 72px;
  object-fit: cover;
  border-radius: 8px;
}

.item-details {
  flex: 1;
  margin-left: 16px;
}

.item-name {
  font-weight: 600;
  margin-bottom: 4px;
}

.item-style {
  font-weight: 400;
  font-size: 14px;
  color: #555;
}

.item-info {
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-btn {
  padding: 2px 8px;
  border: 1px solid #ccc;
  background: #f9f9f9;
  cursor: pointer;
  border-radius: 4px;
}

.quantity-btn:hover {
  background: #e6e6e6;
}

.quantity-number {
  min-width: 24px;
  text-align: center;
}

.remove-button {
  background: none;
  border: none;
  color: #e53935;
  font-size: 18px;
  cursor: pointer;
}

.remove-button:hover {
  color: #b71c1c;
}

.cart-total {
  text-align: right;
  font-weight: bold;
  font-size: 18px;
}

.cart-actions {
  text-align: right;
}

.checkout-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.checkout-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  margin-top: 16px;
  font-size: 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.checkout-button:hover {
  background-color: #45a049;
}
</style>
