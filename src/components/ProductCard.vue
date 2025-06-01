<template>
  <div class="product-card">
    <img
      :src="imageUrl"
      alt="Product image"
      class="product-image"
    />
    <h3>{{ product.name }}</h3>
    <p>${{ product.price.toFixed(2) }}</p>
    <router-link :to="`/product/${product.id}`">View Details</router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Product {
  id: number
  name: string
  price: number
  image_url: string
}

const props = defineProps<{ product: Product }>()

// ✅ Clean and safe: handles full URL or relative path
const imageUrl = computed(() => {
  return props.product.image_url.startsWith('http')
    ? props.product.image_url
    : `${import.meta.env.VITE_API_BASE_URL}${props.product.image_url}`
})
</script>

<style scoped>
.product-card {
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  width: 250px;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 6px;
}
</style>
