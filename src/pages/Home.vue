<template>
  <div class="home-layout">
    <!-- Sidebar (visible only in Home.vue) -->
    <div class="sidebar">
      <SidebarFilter @filter="setFilter" />
    </div>

    <div class="content-area">
      <div v-if="loading" class="text-center text-gray-600 mt-12">
        正在加载产品列表...
      </div>

      <div v-else-if="filteredProducts.length === 0" class="text-center text-red-500 mt-12 px-4 leading-relaxed">
  🚨 本站托管于 Render.com 免费服务器，首次加载可能需要唤醒服务，可能耗时高达 <b>50 秒</b>。
  <br />
  如果页面一直空白，请耐心等待几秒钟后刷新。
  <br /><br />
  🚨 This site is hosted on Render's free server tier. After 15 minutes of inactivity, the backend server will spin down its service. The first load again may require waking up the server,
  which can take up to <b>50 seconds</b>.
  <br />
  If the page stays blank, please wait patiently and refresh after a short while.
</div>
      <div v-else class="product-grid">
        <ProductCard
          v-for="product in filteredProducts"
          :key="product.id"
          :product="product"
        />
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import SidebarFilter from '@/components/SidebarFilter.vue'
import ProductCard from '@/components/ProductCard.vue'

const props = defineProps<{
  searchTerm: string
}>()

interface Product {
  id: number
  name: string
  category: string
  price: number
  image_url: string
}

const products = ref<Product[]>([])
const selectedCategory = ref('')

const setFilter = (cat: string) => {
  selectedCategory.value = cat
}
const backend = 'https://my-shop-backendapi.onrender.com'
// const backend = import.meta.env.VITE_API_BASE_URL
console.log("Backend URL:", backend)

const filteredProducts = computed(() =>
  products.value.filter(p =>
    (!selectedCategory.value || p.category === selectedCategory.value) &&
    p.name.toLowerCase().includes(props.searchTerm.toLowerCase())
  )
)

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
.home-layout {
  display: flex;
  padding-top: 60px; /* Offset for navbar */
}

.sidebar {
  width: 180px;
  background-color: #f0f0f0;
  padding: 1rem;
  min-height: calc(100vh - 60px);
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.product-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  padding: 1rem;
}
.text-center {
  text-align: center;
}
.mt-12 {
  margin-top: 3rem;
}
.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}
.text-red-500 {
  color: #ef4444;
}
.text-gray-600 {
  color: #4b5563;
}

</style>
