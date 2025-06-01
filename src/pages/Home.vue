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

const backend = 'https://my-shop-backendapi.onrender.com'
// const backend = import.meta.env.VITE_API_BASE_URL

onMounted(async () => {
  console.log("Backend URL:", backend)

  try {
    const res = await axios.get(`${backend}/api/products`)
    products.value = res.data
  } catch (err) {
    console.error("Error fetching products:", err)
  }
})
</script>
