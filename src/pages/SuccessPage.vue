<template>
  <div class="success-page">
    <h1>✅ Payment Successful!</h1>
    <p>Your order has been placed. Thank you!</p>
  </div>
</template>
<script lang="ts">
import { useCartStore } from '@/stores/cart'
import { onMounted } from 'vue'
onMounted(() => {
  const cart = useCartStore()
  cart.clear()  // or cart.items = []
})
</script>