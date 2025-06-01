<template>
  <div class="home-layout">
    <!-- Sidebar (visible only in Home.vue) -->
    <div class="sidebar">
      <SidebarFilter @filter="setFilter" />
    </div>

    <!-- Product Grid -->
    <div class="product-grid">
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

const filteredProducts = computed(() =>
  products.value.filter(p =>
    (!selectedCategory.value || p.category === selectedCategory.value) &&
    p.name.toLowerCase().includes(props.searchTerm.toLowerCase())
  )
)

onMounted(async () => {
 console.log("Backend URL:", import.meta.env.VITE_API_BASE_URL)

  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`)
    products.value = res.data
  } catch (err) {
    console.error("Error fetching products:", err)
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
</style>
