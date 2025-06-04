<template>
  <div class="checkout-container">
    <h2>Checkout</h2>

    <div v-if="cart.items.length === 0">
      Your cart is empty.
    </div>

    <div v-else>
      <ul class="checkout-list">
        <li v-for="item in cart.items" :key="item.id">
          {{ item.name }} × {{ item.quantity }} — ${{ (item.price * item.quantity).toFixed(2) }}
        </li>
      </ul>

      <p class="total">Total: ${{ cart.totalPrice.toFixed(2) }}</p>

      <div class="form">
        <input v-model="name" placeholder="Name" class="input" />
        <input v-model="email" type="email" placeholder="Email" class="input" />
        <button class="pay-button" @click="handlePay">Pay Now</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useCartStore } from '@/stores/cart'
import { loadStripe } from '@stripe/stripe-js'

const cart = useCartStore()
const name = ref('')
const email = ref('')

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)

async function handlePay() {
  if (!name.value || !email.value) {
    alert('Please enter your name and email.')
    return
  }

  const stripe = await stripePromise

  const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/create-checkout-session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: name.value,
      email: email.value,
      items: cart.items,
    }),
  })

  const data = await res.json()

  await stripe?.redirectToCheckout({ sessionId: data.id })
}
</script>

<style scoped>
.checkout-container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
}

.checkout-list {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.total {
  font-weight: bold;
  font-size: 18px;
}

.form {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.input {
  padding: 10px;
  font-size: 16px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.pay-button {
  padding: 10px;
  background: #3f51b5;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
