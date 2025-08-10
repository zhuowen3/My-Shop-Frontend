<template>
  <div class="home-layout">
    <Banner />
     <!-- Sort / Filter bar -->
    <div class="filter-bar">
      <div class="left">
        <strong>{{ displayedProducts.length }}</strong> items
      </div>
      <div class="right">
        <label for="sort" class="sort-label">Sort by:</label>
        <select id="sort" v-model="sortMode" class="sort-select">
          <option value="name-asc">Name (A–Z)</option>
          <option value="name-desc">Name (Z–A)</option>
          <option value="price-asc">Price (Low → High)</option>
          <option value="price-desc">Price (High → Low)</option>
        </select>
      </div>
    </div>
    <!-- Product Grid (right) -->
    <div class="product-grid">
      <!-- Fallback message -->
      <div
        v-if="filteredProducts.length === 0 && (!loading || products.length === 0)"
        class="fallback-message"
      >
        🚨 During development, the backend server and database of this site is hosted on Render's free server tier. 
        The first load may require waking up the server,
        which can take up to <b>50 seconds</b>.
        <br />
        If the page stays blank, please wait patiently and refresh after a short while.
      </div>

      <!-- Products -->
      <ProductCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />

    </div>
  </div>
</template>



<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import Banner from '@/components/Banner.vue'
import ProductCard from '@/components/ProductCard.vue'
const router = useRouter()
const route = useRoute()
const showSidebar = ref(false)
const props = defineProps<{
  searchTerm: string
}>()

interface Product {
  id: number
  name: string
  category: string
  category_id: number
  price: number
  image_url: string
  styles?: { name: string; price: number; stock: number; image: string }[]
}


const products = ref<Product[]>([])
interface Category {
  id: number
  name: string
}
const selectedCategory = ref<Category | null>(null)
watchEffect(() => {
  const id = Number(route.params.id)
  selectedCategory.value = Number.isFinite(id) ? { id, name: '' } : null
})
const setFilter = (cat: Category | '') => {
  selectedCategory.value = cat === '' ? null : cat
  if (!cat) router.push('/')                     // clear -> home
  else router.push(`/category/${cat.id}`)        // set -> category route
}
const backend = 'https://my-shop-backendapi.onrender.com'
// const backend = import.meta.env.VITE_API_BASE_URL
console.log("Backend URL:", backend)

const filteredProducts = computed(() =>
  products.value.filter(p =>
    (!selectedCategory.value || p.category_id === selectedCategory.value.id) &&
    p.name.toLowerCase().includes((props.searchTerm ?? '').toLowerCase())
  )
)
const sortMode = ref<'name-asc' | 'name-desc' | 'price-asc' | 'price-desc'>('name-asc')
const getPrice = (p: Product) => {
  if (p.styles && p.styles.length > 0 && typeof p.styles[0].price === 'number') {
    return p.styles[0].price
  }
  return Number(p.price) || 0
}

const displayedProducts = computed(() => {
  const list = filteredProducts.value.slice() // avoid mutating original
  list.sort((a, b) => {
    if (sortMode.value.startsWith('name')) {
      const an = (a.name || '').toLowerCase()
      const bn = (b.name || '').toLowerCase()
      return sortMode.value === 'name-asc' ? an.localeCompare(bn) : bn.localeCompare(an)
    }
    // price sorts
    const ap = getPrice(a)
    const bp = getPrice(b)
    return sortMode.value === 'price-asc' ? ap - bp : bp - ap
  })
  return list
})
const loading = ref(true) // ← Add this
onMounted(async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`)
    products.value = res.data
  } catch (err) {
    console.error("Error fetching products:", err)
  } finally {
    loading.value = false // ← Always stop loading
  }
})

</script>

<style scoped>
/* Desktop layout */
/* Shared layout */
.home-layout {
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  gap: 1rem;
}

/* Sidebar default */
.sidebar {
  width: 180px;
  background-color: #f8f8f8;
  padding: 1rem;
  min-height: calc(100vh - 80px);
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}
.fallback-message {
  text-align: center;
  color: red;
  margin-top: 3rem;
  padding: 0 1rem;
  line-height: 1.625;
  grid-column: 1 / -1; /* spans all columns */
}
/* Product grid */
.product-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  padding: 1rem;
}

/* 🔽 Mobile: sidebar shrinks but stays visible */
@media (max-width: 768px) {
  .sidebar {
    width: 100px; /* Shrink it but don't hide it */
    padding: 0.5rem;
    font-size: 12px;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
    padding: 0.5rem;
  }
}
.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: .75rem;
  margin: 0 1rem;         /* match your grid padding */
  padding: .75rem 1rem;
  border: 1px solid #eee;
  border-radius: 12px;
  background: #fafafa;
}

.filter-bar .left { font-size: 14px; opacity: .85; }
.sort-label { margin-right: .5rem; font-size: 14px; opacity: .8; }
.sort-select {
  padding: .4rem .6rem;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
}

/* On mobile, keep it tight */
@media (max-width: 768px) {
  .filter-bar {
    margin: 0 .5rem;
    padding: .6rem .75rem;
    flex-wrap: wrap;
  }
}
</style>
