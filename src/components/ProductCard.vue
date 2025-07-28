<template>
  <div class="product-card">
    <div class="image-wrapper">
      <img
        :src="imageUrl"
        alt="Product image"
        class="product-image"
      />
      <div v-if="product.styles?.length" class="style-count">
        {{ product.styles.length }} styles available
      </div>
    </div>
    <h3>{{ product.name }}</h3>
    <p>
      ${{ product.styles?.[0]?.price?.toFixed(2) ?? product.price.toFixed(2) }}
    </p>
    <router-link :to="`/product/${product.id}`">View Details</router-link>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Style {
  name: string
  price: number
  stock: number
  image: string
}

interface Product {
  id: number
  name: string
  price: number
  image_url: string
  styles?: Style[]
}

const props = defineProps<{ product: Product }>()

const imageUrl = computed(() => {
  return props.product.image_url.startsWith('http')
    ? props.product.image_url
    : `${import.meta.env.VITE_API_BASE_URL}${props.product.image_url}`
})
</script>

<style scoped>
.product-card {
  position: relative;
  border: 1px solid #ccc;
  padding: 1rem;
  border-radius: 8px;
  width: 250px;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.image-wrapper {
  position: relative;
  width: 100%;
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 6px;
}

.style-count {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #f0f0f0;
  color: #333;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: bold;
}
</style>
