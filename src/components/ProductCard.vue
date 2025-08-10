<template>
  <!-- Make the whole card a link -->
  <router-link :to="`/product/${product.id}`" class="card-link">
    <div class="product-card">
      <!-- Ribbons -->
      <div v-if="totalStock === 1" class="ribbon limited">Limited 1 Remaining</div>
      <div v-else-if="totalStock === 0" class="ribbon out">Out of Stock</div>

      <div class="image-wrapper">
        <img :src="displayImage" :alt="product.name" class="product-image" />
      </div>

      <h3 class="name">{{ product.name }}</h3>
      <p class="price">
        ${{ displayPrice }} <span class="currency">USD</span>
      </p>

      <div v-if="normalizedStyles.length > 0" class="style-count-bottom">
        {{ normalizedStyles.length }} style<span v-if="normalizedStyles.length > 1">s</span> available
      </div>
    </div>
  </router-link>
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
  stock?: number            // ⬅️ base stock when no styles
  images?: string[]
  styles?: Style[]
  style?: Style[]           // backward compatibility
}

const props = defineProps<{ product: Product }>()

const normalizedStyles = computed<Style[]>(() => props.product.styles ?? props.product.style ?? [])

const displayPrice = computed(() => {
  const stylePriceRaw = normalizedStyles.value[0]?.price;
  const basePriceRaw = props.product.price;

  const stylePrice = Number(stylePriceRaw);
  const basePrice  = Number(basePriceRaw);

  // prefer first style price if it's a finite number > 0, else base price
  const chosen = Number.isFinite(stylePrice) && stylePrice > 0
    ? stylePrice
    : basePrice;

  return Number.isFinite(chosen) ? chosen.toFixed(2) : '0.00';
});

const displayImage = computed(() => {
  const firstStyleImage = normalizedStyles.value[0]?.images?.[0]
  if (firstStyleImage?.startsWith('http')) return firstStyleImage

  const fallbackProductImage = props.product.images?.[0]
  if (fallbackProductImage?.startsWith('http')) return fallbackProductImage

  return fallbackProductImage
    ? `${import.meta.env.VITE_API_BASE_URL}${fallbackProductImage}`
    : '/placeholder.jpg'
})

// Sum style stock if styles exist, else use product.stock (default 0)
const totalStock = computed(() => {
  if (normalizedStyles.value.length) {
    return normalizedStyles.value.reduce((sum, s) => sum + (Number.isFinite(s.stock) ? s.stock : 0), 0)
  }
  return Number.isFinite(props.product.stock as number) ? (props.product.stock as number) : 0
})
</script>

<style scoped>
/* Playful + elegant fonts */
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700&family=Poppins:wght@400;600&display=swap');

:root {
  --rose: #F06292;
  --plum: #6A1B4D;
  --champagne: #F5E1E9;
  --gold: #FFD166;
  --card-bg: #2f2f2f;
  --card-edge: #3a3a3a;
}

.card-link {
  text-decoration: none;
  color: inherit;
  display: block;
}

.product-card {
  position: relative;
  background: linear-gradient(180deg, var(--card-bg), #262626);
  border: 1px solid var(--card-edge);
  border-radius: 14px;
  padding: 14px;
  box-shadow: 0 6px 16px rgba(0,0,0,.25);
  transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.product-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 209, 102, .55); /* gold glow */
  box-shadow: 0 10px 24px rgba(255, 209, 102, .18);
}

.image-wrapper { width: 100%; }
.product-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 10px;
  background: #1e1e1e;
}

/* Title + price styling */
.name {
  margin: 10px 0 4px;
  font-family: 'Baloo 2', system-ui, sans-serif;
  font-size: 1.05rem;
  color: var(--champagne);
}
.price {
  margin: 0 0 6px;
  font-family: 'Poppins', system-ui, sans-serif;
  font-weight: 600;
  color: #fff;
  display: block;
}
.currency {
  margin-left: 6px;
  font-weight: 600;
  color: var(--rose);
}

/* Styles count */
.style-count-bottom {
  margin-top: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #c8c8c8;
}

/* Ribbons */
.ribbon {
  position: absolute;
  top: 14px;
  right: -48px;
  transform: rotate(45deg);
  padding: 6px 56px;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: .3px;
  color: #fff;
  box-shadow: 0 6px 14px rgba(0,0,0,.35);
  pointer-events: none;
}
.ribbon.limited { background: #e53935; }       /* red */
.ribbon.out     { background: #7a7a7a; }       /* muted for OOS */
</style>
