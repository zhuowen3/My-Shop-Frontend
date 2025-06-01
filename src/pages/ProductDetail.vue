<template>
  <div class="product-container">
    <div v-if="product" class="product-card">
      <img :src="imageUrl" alt="Product image" class="product-image" />
      <h2 class="product-name">{{ product.name }}</h2>
      <p class="product-price">${{ product.price.toFixed(2) }}</p>
      <p class="product-description" v-html="product.description"></p>

      <div class="size-select">
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
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import DOMPurify from 'dompurify'

const route = useRoute()
const productId = route.params.id
const selectedSize = ref('')
const product = ref<any>(null)

const imageUrl = computed(() =>
  product.value
    ? `${import.meta.env.VITE_API_BASE_URL}${product.value.image_url}`
    : ''
)

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}`)
    const data = await res.json()
    data.description = DOMPurify.sanitize(data.description)
    product.value = data
    selectedSize.value = data.sizes[0] || ''
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
}

.product-price {
  font-size: 20px;
  color: #444;
}

.product-description {
  color: #666;
  max-width: 600px;
}

.size-select {
  margin-top: 20px;
}

.size-select label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
}

.size-select select {
  padding: 8px;
  border-radius: 5px;
  border: 1px solid #ccc;
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
}

.add-to-cart:hover {
  background-color: #21867a;
}

.loading {
  color: #888;
  font-size: 16px;
}
</style>
