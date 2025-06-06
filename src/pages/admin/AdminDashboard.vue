<!-- AdminDashboard -->
<template>
  <div class="admin-container">
    <h2>Admin Dashboard</h2>
    <!-- Category Management -->
    <div class="admin-tabs">
  <button :class="{ active: currentTab === 'add' }" @click="currentTab = 'add'">Add Product</button>
  <button :class="{ active: currentTab === 'edit' }" @click="currentTab = 'edit'">Edit Product</button>
  <button :class="{ active: currentTab === 'orders' }" @click="currentTab = 'orders'">View Orders</button>
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
        Description: <span class="info-circle" @click="showHelp = !showHelp">Ex.</span>
        <textarea v-model="newProduct.description" required></textarea>
        <div v-if="showHelp" class="html-help-box">
  <strong>Basic HTML Tips:</strong>

  <div class="tip-line">
    <code>&lt;b&gt;bold text&lt;/b&gt;</code> → <b>bold text</b>
  </div>
  <div class="tip-line">
    <code>&lt;i&gt;italic text&lt;/i&gt;</code> → <i>italic text</i>
  </div>
  <div class="tip-line">
    <code>&lt;br&gt;</code> → line break/next line
  </div>
  <div class="tip-line">
    <code>&lt;ul&gt;&lt;li&gt;item&lt;/li&gt;&lt;li&gt;item 2&lt;/li&gt;&lt;/ul&gt;</code> →
    <ul>
      <li>item</li>
      <li>item 2</li>
    </ul>
  </div>

  <div class="tip-example">
    <strong>Example:</strong>
    <pre><code>
&lt;b&gt;Blue Shirt&lt;/b&gt;&lt;br&gt;
&lt;ul&gt;
  &lt;li&gt;High quality cotton&lt;/li&gt;
  &lt;li&gt;Breathable fabric&lt;/li&gt;
&lt;/ul&gt;&lt;br&gt;
&lt;i&gt;Perfect for daily wear or formal settings&lt;/i&gt;
    </code></pre>
  </div>
</div>

      </label>

      <label>
        Sizes: (Or different variants)
        <div class="size-input">
          <input v-model="sizeInput" type="text" placeholder="e.g. S, M, L, Green, Red, 2x2, 4x4" />
          <button type="button" @click="addSize">Add</button>
        </div>
        <div class="size-list">
          <span v-for="(size, index) in newProduct.sizes" :key="index" class="size-tag">
            {{ size }} <button @click="removeSize(index)">x</button>
          </span>
        </div>
      </label>

      <label>
        Images: JPG/JPEG and PNG files ONLY
        <input type="file" @change="handleFileChange" accept="image/*" />
      </label>
      Stock:
      <input v-model.number="newProduct.stock" type="number" min="0" required />
      <button type="submit">Add Product</button>
    </form>

    <div class="product-list">
      <h3>Current Products:</h3>
      <ul>
        <li v-for="p in products" :key="p.id">{{ p.name }} - ${{ p.price }} ({{ p.category }})<button @click="deleteProduct(p.id)">Delete</button></li>
      </ul>
    </div>
    </div>
    <div v-if="currentTab === 'edit'">
  <h2>Edit Existing Products</h2>
  <!-- You can render product list with edit buttons here -->
</div>

<div v-if="currentTab === 'orders'">
  <h2>Order List</h2>
  <ul>
    <li v-for="order in orders" :key="order.id">
      {{ order.name }} - {{ order.email }} - ${{ order.total_price.toFixed(2) }}
    </li>
  </ul>
</div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { watch } from 'vue'
const currentTab = ref<'add' | 'edit' | 'orders'>('add')
const adminToken = sessionStorage.getItem('adminToken') || ''
const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } }
const newCategory = ref('')
const orders = ref<any[]>([])

const fetchOrders = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, authHeaders)
  orders.value = res.data
}

watch(currentTab, (newTab) => {
  if (newTab === 'orders' && orders.value.length === 0) {
    fetchOrders()
  }
})
const addCategory = async () => {
 if (!newCategory.value.trim()) return

await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/categories`, {
  name: newCategory.value.trim()
}, authHeaders)
  newCategory.value = ''
  await fetchCategories()
}
interface Product {
  id: number
  name: string
  price: number
  category: string
  description: string
  image_urls: string[]
}

interface Category {
  id: number
  name: string
}

const products = ref<Product[]>([])
const categories = ref<Category[]>([])

const newProduct = ref({
  name: '',
  price: 0,
  category_id: 0,
  description: '',
  sizes: [] as string[],
  stock: 0,
})
const showHelp = ref(false)
const sizeInput = ref('')
const selectedFiles = ref<FileList | null>(null)

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

const deleteCategory = async (id: number) => {
  if (!confirm("Are you sure you want to delete this category?")) return
  await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/categories/${id}`, authHeaders)
  await fetchCategories()
}
const addSize = () => {
  if (sizeInput.value.trim()) {
    newProduct.value.sizes.push(sizeInput.value.trim())
    sizeInput.value = ''
  }
}

const removeSize = (index: number) => {
  newProduct.value.sizes.splice(index, 1)
}

const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (files && files.length > 0) {
    selectedFiles.value = files
  }
}

const handleAddProduct = async () => {
  if (!selectedFiles.value || selectedFiles.value.length === 0) return

  const formData = new FormData()
  formData.append('name', newProduct.value.name)
  formData.append('price', String(newProduct.value.price))
  formData.append('description', newProduct.value.description)
  formData.append('category_id', String(newProduct.value.category_id))
  formData.append('sizes', JSON.stringify(newProduct.value.sizes))
  formData.append('stock', String(newProduct.value.stock))


  for (let i = 0; i < selectedFiles.value.length; i++) {
    formData.append('image', selectedFiles.value[i])
  }
  
  await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/products`, formData, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'multipart/form-data'
    }
  })

  await fetchProducts()
  newProduct.value = { name: '', price: 0, category_id: 0, description: '', sizes: [], stock:0 }
  selectedFiles.value = null
}

onMounted(() => {
  // Redirect if session has expired (e.g. token missing)
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

.product-list {
  margin-top: 2rem;
}

.size-input {
  display: flex;
  gap: 8px;
  margin-top: 0.5rem;
}

.size-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 0.5rem;
}

.size-tag {
  background-color: #d1fae5;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.9rem;
}
.category-section {
  margin-bottom: 2rem;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
}
.category-section input {
  margin-right: 0.5rem;
  padding: 0.3rem;
}
.info-circle {
  display: inline-block;
  background-color: #333;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 12px;
  text-align: center;
  line-height: 24px;
  margin-left: 8px;
  cursor: pointer;
  font-weight: bold;
}

.html-help-box {
  background-color: #f0f0f0;
  padding: 0.75rem;
  margin-top: 0.5rem;
  border-left: 4px solid #888;
  font-size: 14px;
}

.html-help-box code {
  background: #eee;
  padding: 2px 4px;
  font-family: monospace;
  display: inline-block;
  margin: 2px 0;
}
.admin-tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.admin-tabs button {
  padding: 8px 16px;
  border: none;
  background-color: #f3f3f3;
  cursor: pointer;
  border-radius: 6px;
  font-weight: bold;
}

.admin-tabs button.active {
  background-color: #4caf50;
  color: white;
}

</style>
