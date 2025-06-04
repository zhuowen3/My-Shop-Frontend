<template>
  <div class="success-page">
    <h1>✅ Payment Successful!</h1>
    <p>Your order has been placed. Thank you!</p>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import { useCartStore } from '@/stores/cart'
import { onMounted } from 'vue'

export default defineComponent({
  setup() {
    const cart = useCartStore()

    onMounted(() => {
      cart.clear()
    })

    return {
      cart
    }
  }
})
</script>
