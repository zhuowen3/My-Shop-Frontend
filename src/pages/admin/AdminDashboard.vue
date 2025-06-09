<!-- AdminDashboard -->
<template>
  <div class="admin-container">
    <h2>Admin Dashboard</h2>
    <!-- Category Management -->
    <div class="admin-tabs">
  <button :class="{ active: currentTab === 'add' }" @click="currentTab = 'add'">Add Product</button>
  <button :class="{ active: currentTab === 'edit' }" @click="currentTab = 'edit'">Edit Product</button>
  <button :class="{ active: currentTab === 'orders' }" @click="currentTab = 'orders'">View Orders</button>
  <button @click="handleLogout" class="logout-button">
  Logout
</button>
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
        <input type="file" @change="handleEditImageChange" />
      </label>
      Stock:
      <input v-model.number="newProduct.stock" type="number" min="0" required />
      <button type="submit">Add Product</button>
    </form>

    <div class="product-list">
      <h3>Current Products:</h3>
      <ul>
        <li v-for="p in products" :key="p.id">{{ p.name }} - ${{ p.price }} ({{ getCategoryName(p.category_id) }})<button @click="deleteProduct(p.id)">Delete</button></li>
      </ul>
    </div>
    </div>
    <div v-if="currentTab === 'edit'">
  <h2>Edit Existing Products</h2>
  <div class="edit-product-list">
  <div v-for="prod in products" :key="prod.id" class="product-card" @click="openEditForm(prod)">
    <img :src="prod.image_url" class="product-thumb" />
    <h4>{{ prod.name }}</h4>
    <p>${{ prod.price.toFixed(2) }}</p>
    <p>Stock: {{ prod.stock }}</p>
  </div>
</div>
<div v-if="selectedProduct" class="edit-form">
  <h3>Edit Product: {{ selectedProduct.name }}</h3>
  <form @submit.prevent="submitEdit">
    <label>
      Name:
      <input v-model="selectedProduct.name" />
    </label>

    <label>
      Price:
      <input v-model.number="selectedProduct.price" type="number" step="0.01"/>
    </label>

    <label>
      Stock:
      <input v-model.number="selectedProduct.stock" type="number" />
    </label>

    <label>
      Category:
      <select v-model="selectedProduct.category_id">
        <option v-for="cat in categories" :value="cat.id">{{ cat.name }}</option>
      </select>
    </label>

    <label>
      Description:
      <textarea v-model="selectedProduct.description" />
    </label>

    <label>
      Sizes (comma-separated):
      <input v-model="editingSizes" />
    </label>

    <label>
      Change Image:
      <input
  type="file"
  @change="handleEditImageChange"
/>
    </label>

    <button type="submit">Save Changes</button>
    <button type="button" @click="selectedProduct = null">Cancel</button>
  </form>
</div>

</div>

<div v-if="currentTab === 'orders'">
  <h1>Order Database stored in backend server: <a href="https://my-shop-backendapi.onrender.com/api/orders">Order API</a></h1>
  <div class="order-card" v-for="order in orders" :key="order.id">
    <h4>Order #{{ order.display_id || order.id }}</h4>
    <p><strong>Name:</strong> {{ order.name }}</p>
    <p><strong>Email:</strong> {{ order.email }}</p>
    <p><strong>Address:</strong> {{ formatAddress(order.shipping_address) }}</p>
    <p><strong>Total:</strong> ${{ order.total_price.toFixed(2) }}</p>

    <h5>Items:</h5>
    <ul>
      <li v-for="item in order.items" :key="item.id">
        {{ item.name }} - Size: {{ item.size || 'N/A' }} - Qty: {{ item.quantity }}
      </li>
    </ul>

    <div class="order-actions">
      <label>
        <input type="radio" v-model="order.carrier" value="UPS" /> UPS
      </label>
      <label>
        <input type="radio" v-model="order.carrier" value="USPS" /> USPS
      </label>
      <label>
        <input type="radio" v-model="order.carrier" value="FedEx" /> FedEx
      </label>

      <input
        v-model="order.trackingNumber"
        type="text"
        placeholder="Tracking number"
      />

      <label>
        <input type="checkbox" v-model="order.notifyCustomer" />
        Email tracking to customer
      </label>

      <button @click="markAsProcessed(order)">✅ Mark as Processed</button>
    </div>
  </div>
</div>


  </div>
</template>


<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTab = ref<'add' | 'edit' | 'orders'>('add')
function handleLogout() {
  sessionStorage.removeItem('adminToken')  // clear the token
  router.push('/')  // or redirect to '/admin-login' if preferred
  alert("You’ve been logged out.")
}

const adminToken = sessionStorage.getItem('adminToken') || ''
const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } }
const newCategory = ref('')
const orders = ref<any[]>([])
const selectedProduct = ref<Product | null>(null)
const editingSizes = ref<string>('') // for comma-separated input
const editImageFile = ref<File | null>(null)
const fetchOrders = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, authHeaders)
  orders.value = res.data
}

watch(currentTab, (newTab) => {
  if (newTab === 'orders' && orders.value.length === 0) {
    fetchOrders()
  }
})
const openEditForm = (product: Product) => {
  selectedProduct.value = { ...product }
  editingSizes.value = JSON.parse(product.sizes || '[]').join(', ')
  editImageFile.value = null
}
const getCategoryName = (id: number) => {
  const match = categories.value.find(cat => cat.id === id)
  return match?.name || 'Unknown'
}
const submitEdit = async () => {
  if (!selectedProduct.value) return
  const formData = new FormData()
  formData.append('name', selectedProduct.value.name)
  formData.append('price', String(selectedProduct.value.price))
  formData.append('category_id', String(selectedProduct.value.category_id))
  formData.append('description', selectedProduct.value.description)
  formData.append('sizes', JSON.stringify(editingSizes.value.split(',').map(s => s.trim())))
  formData.append('stock', String(selectedProduct.value.stock))
  const file = editImageFile.value
  if (file) {
    formData.append('image', file)
  }
  await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/api/products/${selectedProduct.value.id}`,
    formData,
    {
      headers: {
        ...authHeaders.headers,
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  selectedProduct.value = null
  await fetchProducts()
  await fetchProducts()
  alert('✅ Product updated successfully!')

}
const handleEditImageChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target?.files?.[0]
  if (file) {
    editImageFile.value = file
  }
}


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
  category_id: number
  description: string
  image_url: string
  sizes: string
  stock: number
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
function formatAddress(addressObj: any) {
  return `${addressObj.line1}, ${addressObj.city}, ${addressObj.state} ${addressObj.postal_code}, ${addressObj.country}`
}

const markAsProcessed = async (order: any) => {
  if (!order.carrier || !order.trackingNumber) {
    alert("Please select carrier and enter tracking number.")
    return
  }

  await axios.post(
    `${import.meta.env.VITE_API_BASE_URL}/api/orders/${order.id}/process`,
    {
      carrier: order.carrier,
      tracking_number: order.trackingNumber,
      notify: order.notifyCustomer || false,
    },
    authHeaders
  )

  // Remove processed order from list
  orders.value = orders.value.filter(o => o.id !== order.id)
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
.edit-product-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.product-card {
  border: 1px solid #ccc;
  padding: 12px;
  width: 160px;
  cursor: pointer;
  border-radius: 8px;
  background: #f9f9f9;
  text-align: center;
}

.product-thumb {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.edit-form {
  margin-top: 2rem;
  padding: 1rem;
  background: #f3f3f3;
  border-radius: 10px;
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
