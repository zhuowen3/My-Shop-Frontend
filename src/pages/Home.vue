<template>
  <div class="home-layout">
    <!-- Mobile menu toggle -->
    <button class="mobile-toggle" @click="showSidebar = !showSidebar">
      ☰
    </button>
    <!-- Sidebar (left) -->
    <div class="sidebar">
      <SidebarFilter @filter="setFilter" />
    </div>

    <!-- Product Grid (right) -->
    <div class="product-grid">
      <!-- Fallback message -->
      <div
        v-if="filteredProducts.length === 0 && !loading"
        class="text-center text-red-500 mt-12 px-4 leading-relaxed col-span-full"
      >
        🚨 本站托管于 Render 免费服务器，首次加载可能需要唤醒服务，可能耗时高达 <b>50 秒</b>。
        <br />
        如果页面一直空白，请耐心等待几秒钟后刷新。
        <br /><br />
        🚨 This site is hosted on Render's free server tier. The first load may require waking up the server,
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
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import SidebarFilter from '@/components/SidebarFilter.vue'
import ProductCard from '@/components/ProductCard.vue'
const showSidebar = ref(false)
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
/* Desktop layout */
.home-layout {
  display: flex;
  padding-top: 60px;
  gap: 1rem;
}

/* Sidebar - desktop */
.sidebar {
  width: 180px;
  background-color: #f0f0f0;
  padding: 1rem;
  min-height: calc(100vh - 60px);
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

/* Product grid - desktop */
.product-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  padding: 1rem;
}

/* Mobile toggle button */
.mobile-toggle {
  display: none;
  position: absolute;
  top: 70px;
  left: 16px;
  z-index: 100;
  background: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 18px;
  cursor: pointer;
}

/* Mobile layout */
@media (max-width: 768px) {
  .mobile-toggle {
    display: block;
  }

  .home-layout {
    flex-direction: column;
    position: relative;
    gap: 0;
  }

  .sidebar {
    position: fixed;
    top: 60px;
    left: 0;
    height: 100%;
    width: 240px;
    transform: translateX(-100%);
    transition: transform 0.3s ease-in-out;
    background-color: #f0f0f0;
    z-index: 99;
    padding: 1rem;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .product-grid {
    padding: 1rem;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 16px;
  }

  .product-card {
    width: 100%;
  }
}
</style>
