<template>
  <div class="product-card">
    <div class="image-wrapper">
      <img
        :src="imageUrl"
        alt="Product image"
        class="product-image"
      />
    </div>

    <h3>{{ product.name }}</h3>
    <p>${{ displayPrice }}</p>

    <router-link :to="`/product/${product.id}`">View Details</router-link>

    <div
      v-if="product.styles?.length"
      class="style-count-bottom"
    >
      {{ product.styles.length }} style<span v-if="product.styles.length > 1">s</span> available
    </div>
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

const displayPrice = computed(() => {
  if (props.product.styles?.length && typeof props.product.styles[0].price === 'number') {
    return props.product.styles[0].price.toFixed(2)
  }
  return props.product.price.toFixed(2)
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

.style-count-bottom {
  margin-top: 0.5rem;
  font-size: 12px;
  font-weight: bold;
  color: #666;
}
</style>
