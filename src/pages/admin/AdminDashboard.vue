<!-- AdminDashboard.vue (updated with style-specific price/stock) -->
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
            <input v-model.number="style.price" type="number" step="0.01" placeholder="Price" />
            <input v-model.number="style.stock" type="number" placeholder="Stock" />
            <input type="file" @change="e => handleStyleImageChange(e, index)" />
            <button type="button" @click="removeStyle(index)">x</button>
          </div>
          <button type="button" @click="addStyle">Add Style</button>
        </label>

        <label>
          Base Image:
          <input type="file" @change="handleBaseImageChange" />
        </label>

        <label v-if="newProduct.styles.length === 0">
          Price:
          <input v-model.number="newProduct.price" type="number" step="0.01" required />
        </label>

        <label v-if="newProduct.styles.length === 0">
          Stock:
          <input v-model.number="newProduct.stock" type="number" min="0" required />
        </label>

        <button type="submit">Add Product</button>
      </form>

      <div class="product-list">
        <h3>Current Products:</h3>
        <ul>
  <li v-for="p in products" :key="p.id" style="margin-bottom: 1rem;">
    <strong>{{ p.name }}</strong> ({{ getCategoryName(p.category_id) }})

    <div v-if="Array.isArray(p.styles) && p.styles.length > 0">
      <ul style="margin-left: 1rem;">
        <li v-for="(style, idx) in p.styles" :key="idx">
          🧩 {{ style.name }} - ${{ style.price }} (stock: {{ style.stock }})
          <button @click="deleteStyle(p.id, style.name)">Delete Style</button>
        </li>
      </ul>
    </div>
    <div v-else>
      ${{ p.price.toFixed(2) }} (stock: {{ p.stock }})
    </div>

    <button @click="deleteProduct(p.id)">Delete Product</button>
  </li>
</ul>


      </div>
    </div>

    <div v-if="currentTab === 'edit'">
      <h2>Edit Existing Products</h2>
      <div class="edit-product-list">
        <div v-for="prod in products" :key="prod.id" class="product-card" @click="openEditForm(prod)">
          <img :src="prod.image_url" class="product-thumb" />
          <h4>{{ prod.name }}</h4>
          <template v-if="prod.styles?.length">
            <p v-for="s in prod.styles">{{ s.name }} - ${{ s.price }}</p>
          </template>
          <p v-else>${{ prod.price.toFixed(2) }}</p>
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
            <input v-model.number="selectedProduct.price" type="number" step="0.01" />
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
            Styles:
            <div v-for="(style, index) in selectedProduct.styles" :key="index" class="style-row">
              <input v-model="style.name" placeholder="Style name" />
              <input v-model.number="style.price" type="number" step="0.01" placeholder="Price" />
              <input v-model.number="style.stock" type="number" placeholder="Stock" />
            </div>
          </label>

          <label>
            Change Image:
            <input type="file" @change="handleEditImageChange" />
          </label>

          <button type="submit">Save Changes</button>
          <button type="button" @click="selectedProduct = null">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
interface Style {
  name: string
  price: number
  stock: number
}

interface Product {
  id: number
  name: string
  price: number
  stock: number
  category_id: number
  description: string
  image_url: string
  styles?: Style[]
}

const products = ref<Product[]>([])

const router = useRouter()
const currentTab = ref<'add' | 'edit' | 'orders'>('add')
const adminToken = sessionStorage.getItem('adminToken') || ''
const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } }
const newCategory = ref('')
const categories = ref<any[]>([])
const baseImageFile = ref<File | null>(null)
const editImageFile = ref<File | null>(null)
const selectedProduct = ref<Product | null>(null)

const openEditForm = (product: any) => {
  selectedProduct.value = JSON.parse(JSON.stringify(product))
  console.log('[EDIT] Selected Product:', selectedProduct.value)
}

const submitEdit = async () => {
  if (!selectedProduct.value) return
  const formData = new FormData()
  formData.append('name', selectedProduct.value.name)
  formData.append('price', String(selectedProduct.value.price))
  formData.append('category_id', String(selectedProduct.value.category_id))
  formData.append('description', selectedProduct.value.description)
  formData.append('stock', String(selectedProduct.value.stock))
  formData.append('styles', JSON.stringify(selectedProduct.value.styles || []))

  if (editImageFile.value) {
    formData.append('image', editImageFile.value)
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
  alert('✅ Product updated successfully!')
}
const deleteStyle = async (productId: number, styleName: string) => {
  if (!confirm(`Delete style "${styleName}" from this product?`)) return

  const product = products.value.find((p: Product) => p.id === productId)
  if (!product) return

  if (!product.styles) return
  const updatedStyles = product.styles.filter((s: any) => s.name !== styleName)

  const formData = new FormData()
  formData.append('name', product.name)
  formData.append('description', product.description)
  formData.append('category_id', String(product.category_id))
  formData.append('price', String(product.price))
  formData.append('stock', String(product.stock))
  formData.append('styles', JSON.stringify(updatedStyles))

  await axios.put(`${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}`, formData, {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'multipart/form-data'
    }
  })

  await fetchProducts()
}

const handleEditImageChange = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) editImageFile.value = file
}

onMounted(() => {
  if (!adminToken) {
    window.location.href = '/admin-login'
    return
  }
  fetchProducts()
  fetchCategories()
})

const newProduct = ref({
  name: '',
  price: 0,
  category_id: 0,
  description: '',
  styles: [] as { name: string; price: number; stock: number; image: File | null }[],
  stock: 0,
})

const addStyle = () => {
  newProduct.value.styles.push({ name: '', price: 0, stock: 0, image: null })
}

const removeStyle = (index: number) => {
  newProduct.value.styles.splice(index, 1)
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
  formData.append('description', newProduct.value.description)
  formData.append('category_id', String(newProduct.value.category_id))
  formData.append('image', baseImageFile.value)

  const stylesData = []
  for (const style of newProduct.value.styles) {
    if (style.name && style.image) {
      formData.append('style_images', style.image)
      stylesData.push({ name: style.name, price: style.price, stock: style.stock })
    }
  }

  formData.append('styles', JSON.stringify(stylesData))

  if (newProduct.value.styles.length === 0) {
    formData.append('price', String(newProduct.value.price))
    formData.append('stock', String(newProduct.value.stock))
  } else {
    formData.append('price', '0')
    formData.append('stock', '0')
  }

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
  console.log('[DEBUG] Raw products from backend:', res.data)
  products.value = res.data.map((p: any): Product => ({
  ...p,
  styles: typeof p.styles === 'string' ? JSON.parse(p.styles) : p.styles
  }))
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
.style-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 0.5rem;
}
.edit-form {
  margin-top: 2rem;
  padding: 1rem;
  background: #f3f3f3;
  border-radius: 10px;
}
.product-thumb {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
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
</style>
