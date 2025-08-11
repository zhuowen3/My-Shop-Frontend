<template>
  <div class="product-detail-layout">
    <!-- Left: Media viewer + thumbnails -->
    <div class="media-column">
      <div class="hero-strip"></div>

      <div class="viewer-card">
        <img
          v-if="selectedMedia?.kind === 'image'"
          :src="selectedMedia.url"
          alt="Product image"
          class="main-media"
        />
        <video
          v-else-if="selectedMedia?.kind === 'video'"
          class="main-media"
          controls
          playsinline
          preload="metadata"
          :poster="posterImage"
        >
          <source :src="selectedMedia.url" />
          Your browser does not support the video tag.
        </video>
        <p v-else class="empty">No media available</p>

        <div class="thumbnail-slider">
          <button
            v-for="(m, i) in allMedia"
            :key="i"
            class="thumb"
            :class="{
              active: selectedMedia?.url === m.url,
              'style-linked': m.styleIndex !== null,
              'base-media': m.styleIndex === null
            }"
            @click="selectMedia(m)"
            :aria-label="m.kind === 'video' ? 'Play product video' : 'View product image'"
          >
            <img v-if="m.kind === 'image'" :src="m.url" alt="" />
            <video v-else muted preload="metadata">
              <source :src="m.url" />
            </video>
            <span v-if="m.kind === 'video'" class="play-badge">▶</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Right: Product Info -->
    <div class="product-info">
      <div class="heading">
        <h2 class="product-name">{{ product?.name }}</h2>
        <span v-if="currentStock > 0" class="badge in-stock">In stock</span>
        <span v-else class="badge out-of-stock">Out of stock</span>
      </div>

      <p class="product-price" v-if="!product?.styles?.length">
        ${{ product?.price.toFixed(2) }}
      </p>
      <p class="product-price" v-else-if="currentStyle">
        ${{ currentStyle?.price?.toFixed(2) }}
      </p>

      <p class="product-description" v-html="product?.description"></p>

      <p
        v-if="!product?.styles?.length"
        class="product-stock"
        :class="{ 'out-of-stock-text': currentStock === 0 }"
      >
        Stock: {{ currentStock }}
      </p>
      <p
        v-else-if="currentStyle"
        class="product-stock"
        :class="{ 'out-of-stock-text': currentStock === 0 }"
      >
        Stock: {{ currentStock }}
      </p>

      <div class="style-selector" v-if="product?.styles?.length">
        <button
          v-for="(style, index) in product.styles"
          :key="index"
          class="style-button"
          :class="{ active: selectedStyleIndex === index }"
          @click="selectStyle(index)"
        >
          {{ style.name }}
        </button>
      </div>

      <div class="qty-row">
        <label for="quantity" class="qty-label">Quantity</label>
        <input
          id="quantity"
          type="number"
          v-model.number="selectedQuantity"
          min="1"
          class="quantity-box"
        />
      </div>

      <p v-if="alertMessage" class="alert-message">{{ alertMessage }}</p>

      <div class="cta-row">
        <button
          class="add-to-cart"
          @click="addToCart"
          :disabled="currentStock === 0 || selectedQuantity > currentStock"
        >
          Add to Cart
        </button>
      </div>
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
  videos?: string[] // future-proof; not required now
}
interface Product {
  id: number
  name: string
  price: number
  description: string
  image_url: string
  images: string[]
  videos?: string[]   // ⬅️ product-level videos come from backend here
  styles?: Style[]
  stock: number
}

type MediaItem = { url: string; kind: 'image' | 'video'; styleIndex: number | null }

const route = useRoute()
const cart = useCartStore()

const product = ref<Product | null>(null)
const selectedQuantity = ref(1)
const selectedStyleIndex = ref<number | null>(null)
const selectedMedia = ref<MediaItem | null>(null)
const alertMessage = ref('')

const currentStyle = computed(() =>
  product.value?.styles?.[selectedStyleIndex.value ?? -1] ?? null
)
const currentStock = computed(() => currentStyle.value?.stock ?? product.value?.stock ?? 0)

// Build a unified media list: base images + base videos + style images (+ future style videos)
const allMedia = computed<MediaItem[]>(() => {
  if (!product.value) return []
  const media: MediaItem[] = []
  // base images
  ;(product.value.images || []).forEach(url => media.push({ url, kind: 'image', styleIndex: null }))
  // base videos
  ;(product.value.videos || []).forEach(url => media.push({ url, kind: 'video', styleIndex: null }))
  // style images
  product.value.styles?.forEach((style, idx) => {
    ;(style.images || []).forEach(url => media.push({ url, kind: 'image', styleIndex: idx }))
    // future: style videos
    ;(style.videos || []).forEach(url => media.push({ url, kind: 'video', styleIndex: idx }))
  })
  return media
})

const posterImage = computed(() => {
  // use first base image as poster fallback
  return product.value?.images?.[0] || ''
})

function selectMedia(m: MediaItem) {
  selectedMedia.value = m
  selectedStyleIndex.value = m.styleIndex
  selectedQuantity.value = 1
}

function selectStyle(index: number) {
  selectedStyleIndex.value = index
  // prefer style's first image; otherwise keep whatever is selected
  const styleFirst = product.value?.styles?.[index]?.images?.[0]
  if (styleFirst) {
    selectedMedia.value = { url: styleFirst, kind: 'image', styleIndex: index }
  }
  selectedQuantity.value = 1
}

function addToCart() {
  if (!product.value) return
  if (product.value.styles?.length && selectedStyleIndex.value === null) {
    alertMessage.value = 'Please select a style before adding to cart.'
    return
  }
  if (currentStock.value === 0) {
    alertMessage.value = 'This product is out of stock.'
    return
  }
  if (selectedQuantity.value > currentStock.value) {
    alertMessage.value = `Only ${currentStock.value} item(s) left in stock.`
    return
  }

  const imageForCart =
    selectedMedia.value?.kind === 'image'
      ? selectedMedia.value.url
      : posterImage.value || product.value.image_url || product.value.images?.[0] || ''

  const success = cart.addToCart({
    ...product.value,
    quantity: selectedQuantity.value,
    price: currentStyle.value?.price ?? product.value.price,
    image_url: imageForCart,
    stock: currentStyle.value?.stock ?? product.value.stock
  })

  if (success) {
    alertMessage.value = 'Added to cart!'
  }
}

function scrollToReviews() {
  // placeholder — wire to your reviews section/id if you have one
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
}

onMounted(async () => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${route.params.id}`)
    const data = await res.json()
    data.description = DOMPurify.sanitize(data.description)
    product.value = data

    // Pick a sensible first media:
    // 1) first base image, else 2) first base video, else 3) legacy image_url
    const firstImage = data.images?.[0] || data.image_url
    const firstVideo = data.videos?.[0]
    if (firstImage) {
      selectedMedia.value = { url: firstImage, kind: 'image', styleIndex: null }
    } else if (firstVideo) {
      selectedMedia.value = { url: firstVideo, kind: 'video', styleIndex: null }
    } else {
      selectedMedia.value = null
    }
  } catch (error) {
    console.error('Failed to fetch product:', error)
  }
})
</script>

<style scoped>
:root {
  --teal: #2a9d8f;
  --teal-dark: #21867a;
  --ink: #101314;
  --muted: #667085;
  --card: rgba(255, 255, 255, 0.72);
  --ring: rgba(42, 157, 143, 0.28);
  --border: #e6e8eb;
  --bg: #f7faf9;
}

/* Layout */
.product-detail-layout {
  max-width: 1100px;
  margin: 40px auto;
  padding: 20px;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 40px;
  background: linear-gradient(180deg, #ffffff, #f7faf9 60%);
  border-radius: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 8px 24px rgba(16, 19, 20, 0.06);
}

/* Left column */
.media-column {
  position: relative;
}

.hero-strip {
  position: absolute;
  inset: -20px -20px auto -20px;
  height: 90px;
  background: linear-gradient(90deg, var(--teal), #52c7b2);
  border-radius: 16px 16px 0 0;
  opacity: 0.15;
  pointer-events: none;
}

.viewer-card {
  position: relative;
  background: var(--card);
  backdrop-filter: blur(8px);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 4px 14px rgba(16, 19, 20, 0.06);
}

.main-media {
  width: 100%;
  max-height: 520px;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid var(--border);
}

/* Thumbnail rail */
.thumbnail-slider {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.thumb {
  position: relative;
  width: 70px;
  height: 70px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  background: #fff;
  transition: border 0.2s, transform 0.1s;
}
.thumb:hover { transform: translateY(-1px); }
.thumb.active { border-color: var(--teal); }
.thumb img,
.thumb video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.play-badge {
  position: absolute;
  right: 6px;
  bottom: 6px;
  background: var(--teal);
  color: #fff;
  font-size: 12px;
  line-height: 1;
  padding: 4px 6px;
  border-radius: 6px;
}

/* Right column */
.product-info { display: flex; flex-direction: column; gap: 12px; }

.heading {
  display: flex;
  align-items: center;
  gap: 10px;
}
.product-name {
  font-size: 28px;
  font-weight: 800;
  color: var(--ink);
  letter-spacing: .2px;
}

.badge {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid var(--border);
}
.badge.in-stock { background: #e7f6f3; color: var(--teal-dark); border-color: var(--ring); }
.badge.out-of-stock { background: #fdecec; color: #b42318; border-color: #f3c1c1; }

.product-price {
  font-size: 22px;
  color: var(--ink);
  font-weight: 700;
}

.product-description {
  color: var(--muted);
  margin-top: 6px;
  line-height: 1.6;
}

.product-stock { color: #475467; }
.out-of-stock-text { color: #b42318; font-weight: 600; }

/* styles */
.style-selector {
  margin-top: 8px;
  display: flex; gap: 10px; flex-wrap: wrap;
}
.style-button {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
  transition: box-shadow .15s, background .15s, color .15s;
}
.style-button.active {
  background: var(--teal);
  color: white;
  border-color: var(--teal);
  box-shadow: 0 0 0 4px var(--ring);
}

/* qty & ctas */
.qty-row {
  margin-top: 6px;
  display: flex; align-items: center; gap: 10px;
}
.qty-label { color: #475467; font-weight: 600; }
.quantity-box {
  width: 80px;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 16px;
}

.cta-row { display: flex; gap: 10px; margin-top: 8px; }
.add-to-cart {
  padding: 12px 18px;
  background-color: var(--teal-dark);
  color: #fff;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
  transition: transform .05s ease, background-color .2s ease, box-shadow .2s ease;
  box-shadow: 0 4px 12px rgba(42, 157, 143, .25);
}
.add-to-cart:hover { background-color: var(--teal-dark); }
.add-to-cart:active { transform: translateY(1px); }

.secondary-cta {
  padding: 12px 16px;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
}

.alert-message {
  margin-top: 8px;
  color: #b42318;
  font-weight: 700;
}

/* perks list */
.perks {
  margin-top: 12px;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(3, minmax(0,1fr));
  gap: 8px 14px;
  color: #475467;
}

/* responsive */
@media (max-width: 900px) {
  .product-detail-layout {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}
</style>
