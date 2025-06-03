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

      <button class="add-to-cart" @click="addToCart">Add to Cart</button>
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
import { useCartStore } from '@/stores/cart'
const cart = useCartStore()

function addToCart() {
  if (product.value) {
    cart.addToCart({
      ...product.value,
      quantity: 1,
    })
    console.log('Added to cart:', product.value?.name)
  }
}

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
<style scoped>
.product-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  text-align: center;
}

.product-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 30px;
  background-color: #fdfdfd;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.product-image {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.product-name {
  font-size: 28px;
  font-weight: bold;
  margin-top: 10px;
}

.product-price {
  font-size: 20px;
  color: #444;
  margin-bottom: 8px;
}

.product-description {
  color: #666;
  max-width: 600px;
  margin-top: 12px;
  line-height: 1.5;
}

.size-select {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.size-select label {
  font-weight: 600;
  margin-bottom: 6px;
}

.size-select select {
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 16px;
}

.add-to-cart {
  margin-top: 24px;
  padding: 10px 20px;
  background-color: #2a9d8f;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 16px;
  transition: background-color 0.2s ease;
}

.add-to-cart:hover {
  background-color: #21867a;
}

.loading {
  color: #888;
  font-size: 18px;
  padding: 40px;
}
</style>
