<template>
  <div class="cart-container">
    <h2 class="cart-title">🛒 Your Cart</h2>

    <div v-if="cart.items.length === 0" class="cart-empty">
      Your cart is empty.
    </div>

    <div v-else>
      <div
        v-for="item in cart.items"
        :key="item.id"
        class="cart-item"
      >
        <img :src="item.image_url" class="item-image" />
        <div class="item-details">
          <h3 class="item-name">{{ item.name }}</h3>
          <p class="item-info">${{ item.price.toFixed(2) }} × {{ item.quantity }}</p>
        </div>
        <button class="remove-button" @click="remove(item.id)">✖</button>
      </div>

      <div class="cart-total">
        Total: ${{ cart.totalPrice.toFixed(2) }}
      </div>
      <div class="cart-actions">
        <button class="checkout-button" @click="checkout" :disabled="cart.items.length === 0">
  Proceed to Checkout
</button>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '@/stores/cart'
import axios from 'axios'

async function checkout() {
  try {
    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/checkout`, {
      items: cart.items,
      total: cart.totalPrice,
    })
    alert('Order placed successfully! ID: ' + response.data.order_id)
    cart.clearCart()
  } catch (err) {
    alert('Failed to place order')
    console.error(err)
  }
}
const cart = useCartStore()

function remove(id: number) {
  cart.removeFromCart(id)
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
