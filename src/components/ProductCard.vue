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
      <p class="price">{{ formattedPrice }}</p>

      <div v-if="normalizedStyles.length" class="style-count-bottom">
        {{ normalizedStyles.length }} style<span v-if="normalizedStyles.length > 1">s</span> available
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Style {
  name: string
  price: number | string
  stock: number | string
  images?: string[]
}
interface Product {
  id: number
  name: string
  price?: number | string
  stock?: number | string
  images?: string[]
  styles?: Style[]
  style?: Style[] // legacy
}

const props = defineProps<{ product: Product }>()

const normalizedStyles = computed(() => props.product.styles ?? props.product.style ?? [])

// pick the smallest positive style price (if any), else base price
const formattedPrice = computed(() => {
  const stylePrices = normalizedStyles.value
    .map(s => Number(s.price))
    .filter(p => Number.isFinite(p) && p > 0)

  const base = Number((props.product as any)?.price)
  const price = stylePrices.length ? Math.min(...stylePrices) : base

  return Number.isFinite(price) ? `$${price.toFixed(2)} USD` : 'Price N/A'
})

// total stock across styles if present, else product stock
const totalStock = computed(() => {
  if (normalizedStyles.value.length) {
    return normalizedStyles.value.reduce((sum, s) => sum + (Number(s.stock) || 0), 0)
  }
  return Number((props.product as any)?.stock) || 0
})

const displayImage = computed(() => {
  const styleImg = normalizedStyles.value[0]?.images?.[0]
  if (styleImg?.startsWith('http')) return styleImg

  const prodImg = props.product.images?.[0]
  if (prodImg?.startsWith('http')) return prodImg

  return prodImg
    ? `${import.meta.env.VITE_API_BASE_URL}${prodImg}`
    : '/placeholder.jpg'
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700&family=Poppins:wght@400;600&display=swap');

:root{
  --rose:#F06292; --plum:#6A1B4D; --champagne:#F5E1E9; --gold:#FFD166;
  --card-bg:#2f2f2f; --card-edge:#3a3a3a;
}

.card-link{ text-decoration:none; color:inherit; display:block; }

.product-card{
  position:relative;
  background:linear-gradient(180deg, var(--card-bg), #262626);
  border:1px solid var(--card-edge);
  border-radius:14px;
  padding:14px;
  box-shadow:0 6px 16px rgba(0,0,0,.25);
  transition:transform .12s ease, box-shadow .12s ease, border-color .12s ease;
}
.product-card:hover{
  transform:translateY(-2px);
  border-color:rgba(255,209,102,.55);
  box-shadow:0 10px 24px rgba(255,209,102,.18);
}

.image-wrapper{ width:100%; }
.product-image{
  width:100%; height:180px; object-fit:cover;
  border-radius:10px; background:#1e1e1e;
}

.name{
  margin:10px 0 4px;
  font-family:'Baloo 2', system-ui, sans-serif;
  font-size:1.05rem; color:var(--champagne);
}
.price{
  margin:4px 0 8px;
  font:700 13px/1.2 Poppins, system-ui, sans-serif;
  letter-spacing:.3px; color:var(--champagne);
}

.style-count-bottom{
  margin-top:6px; font-size:.8rem; font-weight:600; color:#c8c8c8;
}

/* smaller corner ribbon */
.ribbon{
  position:absolute; top:8px; right:-22px; transform:rotate(45deg);
  padding:1px 8px; font-size:9px; font-weight:800; color:#fff;
  z-index:2; pointer-events:none; letter-spacing:.2px;
  border-radius:2px;
}
.limited{ background:#e53935; }
.out{ background:#7a7a7a; }
</style>
