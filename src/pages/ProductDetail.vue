<template>
  <div class="product-detail-layout">
    <!-- Left: Image + image thumbnails -->
    <div class="product-images">
      <img v-if="selectedImage" :src="selectedImage" alt="Product image" class="main-image" />
      <p v-else>No image available</p>

      <div class="thumbnail-slider">
        <img
          v-for="(img, index) in allImages"
          :key="index"
          :src="img.url"
          class="thumbnail"
          :class="{
            active: selectedImage === img.url,
            'style-linked': img.styleIndex !== null,
            'base-image': img.styleIndex === null,
          }"
          @click="selectImage(img)"
        />
      </div>
    </div>

    <!-- Right: Product Info -->
    <div class="product-info">
      <h2 class="product-name">{{ product?.name }}</h2>
      <p class="product-price">
        ${{ currentStyle?.price?.toFixed(2) ?? product?.price.toFixed(2) }}
      </p>
      <p class="product-description" v-html="product?.description"></p>

      <p
        v-if="!product?.styles?.length"
        class="product-stock"
        :class="{ 'out-of-stock': currentStock === 0 }"
      >
        Stock: {{ currentStock }}
      </p>

      <div class="thumbnail-slider" v-if="product?.styles?.length">
        <img
          v-for="(style, index) in product.styles"
          :key="index"
          :src="style.images?.[0]"
          class="thumbnail"
          :class="{ active: selectedStyleIndex === index }"
          @click="selectStyle(index)"
        />
      </div>

      <div class="quantity-input">
        <label for="quantity">Quantity:</label>
        <input
          id="quantity"
          type="number"
          v-model.number="selectedQuantity"
          min="1"
          class="quantity-box"
        />
      </div>

      <p v-if="alertMessage" class="alert-message">{{ alertMessage }}</p>
      <button
        class="add-to-cart"
        @click="addToCart"
        :disabled="currentStock === 0 || selectedQuantity > currentStock"
      >
        Add to Cart
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import DOMPurify from 'dompurify'
import { useCartStore } from '@/stores/cart'

interface Style {
  name: string
  price: number
  stock: number
  images: string[]
}
interface Product {
  id: number
  name: string
  price: number
  description: string
  image_url: string
  images: string[]
  styles?: Style[]
  stock: number
}

const route = useRoute()
const cart = useCartStore()
const product = ref<Product | null>(null)
const selectedQuantity = ref(1)
const selectedStyleIndex = ref<number | null>(null)
const selectedImage = ref('')
const alertMessage = ref('')

const currentStyle = computed(() =>
  product.value?.styles?.[selectedStyleIndex.value ?? -1] ?? null
)
const currentStock = computed(() => {
  return currentStyle.value?.stock ?? product.value?.stock ?? 0
})

const allImages = computed(() => {
  if (!product.value) return []
  const images: { url: string; styleIndex: number | null }[] = []
  product.value.images.forEach(url => images.push({ url, styleIndex: null }))
  product.value.styles?.forEach((style, idx) => {
    style.images?.forEach(url => images.push({ url, styleIndex: idx }))
  })
  return images
})

function selectImage(image: { url: string; styleIndex: number | null }) {
  selectedImage.value = image.url
  selectedStyleIndex.value = image.styleIndex
  selectedQuantity.value = 1
}

function selectStyle(index: number) {
  selectedStyleIndex.value = index
  selectedImage.value = product.value?.styles?.[index]?.images?.[0] ?? ''
  selectedQuantity.value = 1
}

function addToCart() {
  if (!product.value) return
  if (currentStock.value === 0) {
    alertMessage.value = 'This product is out of stock.'
    return
  }
  if (selectedQuantity.value > currentStock.value) {
    alertMessage.value = `Only ${currentStock.value} item(s) left in stock.`
    return
  }
  cart.addToCart({
    ...product.value,
    quantity: selectedQuantity.value,
    size: currentStyle.value?.name || '',
    price: currentStyle.value?.price ?? product.value.price,
    image_url: selectedImage.value
  })
  alertMessage.value = 'Added to cart!'
}

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${route.params.id}`)
    const data = await res.json()
    console.log("📦 Product Response:", data)
    data.description = DOMPurify.sanitize(data.description)
    product.value = data
    selectedImage.value = data.images?.[0] || data.image_url || ''
  } catch (error) {
    console.error('Failed to fetch product:', error)
  }
})
</script>
<style scoped>
.product-detail-layout {
  max-width: 1000px;
  margin: 40px auto;
  padding: 20px;
  display: flex;
  gap: 40px;
}

.product-images {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-image {
  width: 300px;
  height: 300px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.thumbnail-slider {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: center;
}

.thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border: 2px solid transparent;
  border-radius: 6px;
  cursor: pointer;
  transition: border 0.2s;
}
.thumbnail.active {
  border-color: #2a9d8f;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 28px;
  font-weight: bold;
}

.product-price {
  font-size: 20px;
  color: #444;
  margin-bottom: 8px;
}

.product-description {
  color: #666;
  margin-top: 12px;
  line-height: 1.5;
}

.product-stock.out-of-stock {
  color: red;
  font-weight: bold;
}

.quantity-input {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quantity-box {
  width: 60px;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
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
}

.add-to-cart:hover {
  background-color: #21867a;
}

.alert-message {
  margin-top: 12px;
  color: #d62828;
  font-weight: bold;
}
</style>
