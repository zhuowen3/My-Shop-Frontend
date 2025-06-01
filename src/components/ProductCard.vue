<template>
  <div class="product-card">
    <img
  :src="fullImageUrl"
  alt="Product image"
  class="product-image"
    />
    <h3>{{ product.name }}</h3>
    <p>${{ product.price.toFixed(2) }}</p>
    <router-link :to="`/product/${product.id}`">View Details</router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'  // ✅ Fixes "Cannot find name 'computed'"

interface Product {
  id: number
  name: string
  price: number
  image_url: string
}

const props = defineProps<{ product: Product }>()
const product = props.product

const fullImageUrl = computed(() =>
  product?.image_url
    ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}${product.image_url}`
    : ''
)
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
