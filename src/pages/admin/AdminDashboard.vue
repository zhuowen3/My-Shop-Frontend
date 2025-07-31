<!-- AdminDashboard.vue (fixed image key type issues) -->
<template>
  <div class="admin-container">
    <h2>Admin Dashboard</h2>
    <div class="admin-tabs">
      <button :class="{ active: currentTab === 'add' }" @click="currentTab = 'add'">Add Product</button>
      <button :class="{ active: currentTab === 'edit' }" @click="currentTab = 'edit'">Edit Product</button>
      <button :class="{ active: currentTab === 'orders' }" @click="currentTab = 'orders'">View Orders</button>
      <button @click="handleLogout" class="logout-button">Logout</button>
    </div>

    <div v-if="currentTab === 'edit'">
      <h2>Edit Existing Products</h2>
      <div class="edit-product-list">
        <div
          v-for="product in products"
          :key="product.id"
          class="product-card"
          @click="openEditForm(product)"
        >
          <img :src="product.images?.[0] || ''" class="product-thumb" />
          <h4>{{ product.name }}</h4>
          <p v-if="product.styles?.length">
            {{ product.styles.length }} style<span v-if="product.styles.length > 1">s</span>
          </p>
          <p v-else>${{ product.price }}</p>
          <p>Stock: {{ product.stock }}</p>
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
            <textarea v-model="selectedProduct.description"></textarea>
          </label>
          <label>
            Styles:
            <div v-for="(style, index) in selectedProduct.styles" :key="index" class="style-row">
              <input v-model="style.name" placeholder="Style name" />
              <input v-model.number="style.price" type="number" step="0.01" placeholder="Price" />
              <input v-model.number="style.stock" type="number" placeholder="Stock" />

              <div
                v-for="(img, imgIdx) in editStyleImages[String(style.name)] || []"
                :key="imgIdx"
                class="image-upload-row"
              >
                <input type="file" @change="e => updateEditStyleImage(e, String(style.name), imgIdx)" />
                <button type="button" @click="removeEditStyleImage(String(style.name), imgIdx)">x</button>
              </div>
              <button type="button" @click="addEditStyleImage(String(style.name))">+ Add Image</button>
              <button type="button" @click="removeEditStyle(index)">Remove</button>
            </div>
            <button type="button" @click="addEditStyle">Add Style</button>
          </label>
          <button type="submit">Save Changes</button>
          <button type="button" @click="selectedProduct = null">Cancel</button>
          <button type="button" @click="deleteProduct(selectedProduct.id)">Delete Product</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const currentTab = ref<'add' | 'edit' | 'orders'>('add')
const adminToken = sessionStorage.getItem('adminToken') || ''
const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } }
const categories = ref<any[]>([])
const products = ref<any[]>([])
const router = useRouter()
const selectedProduct = ref<any>(null)
const editStyleImages = ref<Record<string, (File | null)[]>>({})

const fetchCategories = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`, authHeaders)
  categories.value = res.data
}

const fetchProducts = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`, authHeaders)
  products.value = res.data.map((p: any) => ({
    ...p,
    styles: p.styles ?? p.style ?? []
  }))
}

const openEditForm = (product: any) => {
  selectedProduct.value = JSON.parse(JSON.stringify(product))
}

const removeEditStyle = (index: number) => {
  selectedProduct.value.styles.splice(index, 1)
}

const addEditStyle = () => {
  selectedProduct.value.styles.push({ name: '', price: 0, stock: 0, images: [] })
}

const addEditStyleImage = (styleName: string) => {
  if (!editStyleImages.value[styleName]) editStyleImages.value[styleName] = []
  editStyleImages.value[styleName].push(null)
}

const removeEditStyleImage = (styleName: string, imgIndex: number) => {
  editStyleImages.value[styleName].splice(imgIndex, 1)
}

const updateEditStyleImage = (e: Event, styleName: string, imgIndex: number) => {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  if (!editStyleImages.value[styleName]) editStyleImages.value[styleName] = []
  editStyleImages.value[styleName][imgIndex] = file
}

const deleteProduct = async (productId: number) => {
  if (!confirm("Are you sure you want to delete this product?")) return
  await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}`, authHeaders)
  selectedProduct.value = null
  await fetchProducts()
  alert("✅ Product deleted.")
}

const handleLogout = () => {
  sessionStorage.removeItem('adminToken')
  router.push('/admin-login')
  alert("You’ve been logged out.")
}

const submitEdit = async () => {
  if (!selectedProduct.value) return

  const formData = new FormData()
  formData.append('name', selectedProduct.value.name)
  formData.append('price', String(selectedProduct.value.price))
  formData.append('stock', String(selectedProduct.value.stock))
  formData.append('category_id', String(selectedProduct.value.category_id))
  formData.append('description', selectedProduct.value.description)

  const stylesData = selectedProduct.value.styles.map((style: any) => ({
    name: style.name,
    price: style.price,
    stock: style.stock,
    image_count: (editStyleImages.value[String(style.name)] || []).length
  }))
  formData.append('styles', JSON.stringify(stylesData))

  for (const [styleName, imageArray] of Object.entries(editStyleImages.value)) {
    for (const img of imageArray) {
      if (img) {
        formData.append('style_images', img)
      }
    }
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

onMounted(() => {
  if (!adminToken) {
    router.push('/admin-login')
    return
  }
  fetchCategories()
  fetchProducts()
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
.order-card {
  border: 1px solid #ccc;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 8px;
}
.order-items {
  margin: 0.5rem 0;
  padding-left: 1rem;
  list-style-type: disc;
}
.tracking-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
}
</style>
