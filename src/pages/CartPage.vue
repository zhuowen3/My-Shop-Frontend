<template>
  <div class="cart-container">
    <h2 class="cart-title">🛒 Your Cart</h2>

    <div v-if="cart.items.length === 0" class="cart-empty">
      Your cart is empty.
    </div>

    <div v-else>
      <div
        v-for="item in cart.items"
        :key="item.id + '-' + (item.size || '')"
        class="cart-item"
      >
        <img :src="item.image_url" class="item-image" />
        <div class="item-details">
          <h3 class="item-name">{{ item.name }} <span v-if="item.size">({{ item.size }})</span></h3>
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
        <button class="checkout-button" @click="checkout"
          :disabled="cart.items.length === 0 || exceedsStock">
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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { computed } from 'vue'
const router = useRouter()

function checkout() {
  router.push('/checkout')
}
const cart = useCartStore()

const exceedsStock = computed(() =>
  cart.items.some(item => item.stock !== undefined && item.quantity > item.stock)
)

function remove(id: number) {
  cart.removeFromCart(id)
}

function increase(item: CartItem) {
  if (item.stock !== undefined && item.quantity >= item.stock) return
  cart.addToCart({ ...item, quantity: 1 })
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
  const productIds = cart.items.map(item => item.id)

  const promises = productIds.map(async (id) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`)
      const product = res.data
      const cartItem = cart.items.find(item => item.id === id)
      if (cartItem) {
        cartItem.stock = product.stock
      }
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
}

.cart-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
}

.cart-empty {
  color: #666;
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
  border-radius: 4px;
  cursor: pointer;
}

.checkout-button:hover {
  background-color: #45a049;
}

.cart-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #ddd;
  padding: 16px 0;
}

.item-image {
  width: 64px;
  height: 64px;
  object-fit: cover;
  border-radius: 4px;
}

.item-details {
  flex: 1;
  margin-left: 16px;
}

.item-name {
  font-weight: 600;
  margin-bottom: 4px;
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
  background: #fff;
  cursor: pointer;
  border-radius: 4px;
}

.quantity-number {
  display: inline-block;
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
  margin-top: 24px;
  font-weight: bold;
  font-size: 18px;
}
</style>
