<template>
  <div class="product-container">
    <div v-if="product" class="product-card">
      <img :src="imageUrl" alt="Product image" class="product-image" />
      <h2 class="product-name">{{ product.name }}</h2>
      <p class="product-price">${{ product.price.toFixed(2) }}</p>
      <p class="product-description" v-html="product.description"></p>

      <div class="size-select" v-if="product.sizes?.length">
        <label for="size">Select type:</label>
        <select id="size" v-model="selectedSize">
          <option v-for="size in product.sizes" :key="size" :value="size">
            {{ size }}
          </option>
        </select>
      </div>

      <button class="add-to-cart">Add to Cart</button>
    </div>
    <div v-else class="loading">Loading...</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import DOMPurify from 'dompurify'

interface Product {
  id: number
  name: string
  price: number
  description: string
  image_url: string
  sizes: string[]
}

const route = useRoute()
const product = ref<Product | null>(null)
const selectedSize = ref('')

// ✅ Handles both full URLs (Cloudinary) or relative URLs (/uploads)
const imageUrl = computed(() => {
  if (!product.value) return ''
  return product.value.image_url.startsWith('http')
    ? product.value.image_url
    : `${import.meta.env.VITE_API_BASE_URL}${product.value.image_url}`
})

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${route.params.id}`)
    const data = await res.json()
    data.description = DOMPurify.sanitize(data.description)
    product.value = data
    selectedSize.value = data.sizes?.[0] || ''
  } catch (error) {
    console.error('Failed to fetch product:', error)
  }
})
</script>
