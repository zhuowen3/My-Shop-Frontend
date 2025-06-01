<!-- SidebarFilter.vue -->
<template>
  <div class="sidebar">
    <h2 class="title">Categories</h2>
    <ul class="category-list">
      <li v-if="categories.length === 0" class="category-item text-gray-500 italic">Loading...</li>
      <li
        v-for="cat in categories"
        :key="cat"
        :class="['category-item', cat === selected ? 'active' : '']"
        @click="selectCategory(cat)"
      >
        {{ cat }}
      </li>
      <li
        class="clear-filter"
        @click="selectCategory('')"
      >
        ✖ Clear Filter
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
console.log("Home.vue mounted!")
const emit = defineEmits(['filter'])

const selected = ref('')
const categories = ref<string[]>([])

const fetchCategories = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`)
    console.log("Fetched categories:", res.data)
    categories.value = res.data.map((cat: { name: string }) => cat.name)
  } catch (err) {
    console.error('Failed to fetch categories:', err)
  }
}

const selectCategory = (category: string) => {
  selected.value = category
  emit('filter', category)
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.sidebar {
  width: 100%; /* ✅ Use full width on mobile, 180px on desktop */
  max-width: 240px;
  background-color: #f8f8f8;
  padding: 1rem;
  border-right: 1px solid #ddd;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
  height: auto;
}

@media (min-width: 769px) {
  .sidebar {
    height: calc(100vh - 60px);
  }
}


.title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 1rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 0.5rem;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 6px;
  transition: background 0.2s;
}

.category-item:hover {
  background-color: #e0e0e0;
}

.active {
  background-color: #333;
  color: white;
  font-weight: bold;
}

.clear-filter {
  margin-top: 1rem;
  font-size: 13px;
  color: #007bff;
  cursor: pointer;
}
.clear-filter:hover {
  text-decoration: underline;
}
</style>

