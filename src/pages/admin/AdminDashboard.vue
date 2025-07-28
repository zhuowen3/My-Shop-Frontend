<template>
  <div class="admin-container">
    <h2>Admin Dashboard</h2>
    <div class="admin-tabs">
      <button :class="{ active: currentTab === 'add' }" @click="currentTab = 'add'">Add Product</button>
      <button :class="{ active: currentTab === 'edit' }" @click="currentTab = 'edit'">Edit Product</button>
      <button :class="{ active: currentTab === 'orders' }" @click="currentTab = 'orders'">View Orders</button>
      <button @click="handleLogout" class="logout-button">Logout</button>
    </div>

    <div v-if="currentTab === 'add'">
      <div class="category-section">
        <h3>Add New Category</h3>
        <input v-model="newCategory" type="text" placeholder="New category name" />
        <button @click="addCategory" type="button">Add Category</button>
      </div>

      <h3>Existing Categories:</h3>
      <ul>
        <li v-for="cat in categories" :key="cat.id">
          {{ cat.name }}
          <button @click="deleteCategory(cat.id)">Delete</button>
        </li>
      </ul>

      <form @submit.prevent="handleAddProduct" class="form">
        <Label><h2>Add Product</h2></Label>

        <label>
          Name:
          <input v-model="newProduct.name" type="text" required />
        </label>

        <label>
          Price:
          <input v-model.number="newProduct.price" type="number" step="0.01" required />
        </label>

        <label>
          Category:
          <select v-model="newProduct.category_id" required>
            <option disabled value="">Select a category</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </label>

        <label>
          Description:
          <textarea v-model="newProduct.description" required></textarea>
        </label>

        <label>
          Styles:
          <div v-for="(style, index) in newProduct.styles" :key="index" class="style-row">
            <input v-model="style.name" placeholder="Style name" />
            <input type="file" @change="e => handleStyleImageChange(e, index)" />
            <button type="button" @click="removeStyle(index)">x</button>
          </div>
          <button type="button" @click="addStyle">Add Style</button>
        </label>

        <label>
          Base Image:
          <input type="file" @change="handleBaseImageChange" />
        </label>

        <label>
          Stock:
          <input v-model.number="newProduct.stock" type="number" min="0" required />
        </label>

        <button type="submit">Add Product</button>
      </form>

      <div class="product-list">
        <h3>Current Products:</h3>
        <ul>
          <li v-for="p in products" :key="p.id">
            {{ p.name }} - ${{ p.price }} ({{ getCategoryName(p.category_id) }})
            <button @click="deleteProduct(p.id)">Delete</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
import axios from 'axios'

const currentTab = ref<'add' | 'edit' | 'orders'>('add')
const adminToken = sessionStorage.getItem('adminToken') || ''
const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } }
const newCategory = ref('')
const categories = ref<any[]>([])
const products = ref<any[]>([])
const baseImageFile = ref<File | null>(null)

const newProduct = ref({
  name: '',
  price: 0,
  category_id: 0,
  description: '',
  styles: [] as { name: string; image: File | null }[],
  stock: 0,
})

const addStyle = () => {
  newProduct.value.styles.push({ name: '', image: null })
}

const removeStyle = (index: number) => {
  newProduct.value.styles.splice(index, 1)
}
const handleLogout = () => {
  sessionStorage.removeItem('adminToken')
  router.push('/admin-login')
  alert("You’ve been logged out.")
}
const addCategory = async () => {
  if (!newCategory.value.trim()) return
  await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/categories`, {
    name: newCategory.value.trim()
  }, authHeaders)
  newCategory.value = ''
  await fetchCategories()
}
const deleteCategory = async (id: number) => {
  if (!confirm("Are you sure you want to delete this category?")) return
  await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/categories/${id}`, authHeaders)
  await fetchCategories()
}
const handleStyleImageChange = (e: Event, index: number) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) newProduct.value.styles[index].image = file
}

const handleBaseImageChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) baseImageFile.value = file
}

const handleAddProduct = async () => {
  if (!baseImageFile.value) return alert("Please select a base image.")

  const formData = new FormData()
  formData.append('name', newProduct.value.name)
  formData.append('price', String(newProduct.value.price))
  formData.append('description', newProduct.value.description)
  formData.append('category_id', String(newProduct.value.category_id))
  formData.append('stock', String(newProduct.value.stock))
  formData.append('base_image', baseImageFile.value)

  const stylesData = []
  for (const style of newProduct.value.styles) {
    if (style.name && style.image) {
      formData.append('style_images', style.image)
      stylesData.push({ name: style.name })
    }
  }
  formData.append('styles', JSON.stringify(stylesData))

  await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/products`, formData, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'multipart/form-data'
    }
  })

  await fetchProducts()
  newProduct.value = { name: '', price: 0, category_id: 0, description: '', styles: [], stock: 0 }
  baseImageFile.value = null
}

const fetchProducts = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`, authHeaders)
  products.value = res.data
}

const fetchCategories = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`, authHeaders)
  categories.value = res.data
}

const deleteProduct = async (id: number) => {
  if (!confirm("Are you sure you want to delete this product?")) return 
  await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`, authHeaders)
  await fetchProducts()
}

const getCategoryName = (id: number) => {
  const match = categories.value.find(cat => cat.id === id)
  return match?.name || 'Unknown'
}

onMounted(() => {
  if (!adminToken) {
    window.location.href = '/admin-login'
    return
  }
  fetchProducts()
  fetchCategories()
})
</script>

<style scoped>
.admin-container {
  padding: 2rem;
  max-width: 600px;
  margin: auto;
}

.logout-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #d33;
  color: black;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.logout-button:hover {
  background-color: #b22;
}

.form label {
  display: block;
  margin-bottom: 1rem;
}

.form input,
textarea {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.25rem;
}

button {
  padding: 0.5rem 1rem;
  margin-top: 1rem;
}

.style-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0.5rem;
}
</style>
