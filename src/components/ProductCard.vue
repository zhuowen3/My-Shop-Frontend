<template>
  <div class="product-card">
    <div class="image-wrapper">
      <img
        :src="displayImage"
        alt="Product image"
        class="product-image"
      />
    </div>

    <h3>{{ product.name }}</h3>
    <p>${{ displayPrice }}</p>

    <div v-if="normalizedStyles.length > 0" class="style-count-bottom">
      {{ normalizedStyles.length }} style<span v-if="normalizedStyles.length > 1">s</span> available
    </div>

    <router-link :to="`/product/${product.id}`">View Details</router-link>
  </div>
</template>


<script setup lang="ts">
import { computed } from 'vue'

interface Style {
  name: string
  price: number
  stock: number
  images?: string[]
}

interface Product {
  id: number
  name: string
  price: number
  images?: string[]
  styles?: Style[]
  style?: Style[] // backward compatibility
}

const props = defineProps<{ product: Product }>()

const normalizedStyles = computed(() => {
  return props.product.styles ?? props.product.style ?? []
})

const displayPrice = computed(() => {
  return normalizedStyles.value[0]?.price?.toFixed(2) ?? props.product.price.toFixed(2)
})

const displayImage = computed(() => {
  const firstStyleImage = normalizedStyles.value[0]?.images?.[0]
  if (firstStyleImage?.startsWith('http')) return firstStyleImage

  const fallbackProductImage = props.product.images?.[0]
  if (fallbackProductImage?.startsWith('http')) return fallbackProductImage

  return fallbackProductImage
    ? `${import.meta.env.VITE_API_BASE_URL}${fallbackProductImage}`
    : '/placeholder.jpg' // optional fallback
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
  width: 100%;
}

.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 6px;
}
.style-count {
  margin-top: 0.5rem;
  color: #555;
  font-size: 14px;
  font-weight: 500;
}

.style-count-bottom {
  margin-top: 0.5rem;
  font-size: 12px;
  font-weight: bold;
  color: #666;
}
</style>
