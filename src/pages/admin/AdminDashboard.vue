<!-- AdminDashboard.vue (updated to support multiple images per product and style) -->
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
  Product Images:
  <div v-for="(file, index) in baseImageFiles" :key="index" class="image-upload-row">
    <input type="file" @change="e => updateBaseImage(e, index)" />
    <button type="button" @click="removeBaseImage(index)">x</button>
  </div>
  <button type="button" @click="addBaseImage">+ Add Image</button>
</label>
<label>
  Product Videos:
  <div v-for="(file, index) in baseVideoFiles" :key="index" class="image-upload-row">
    <input type="file" accept="video/*" @change="e => baseVideoFiles[index] = (e.target as HTMLInputElement).files?.[0] || null" />
    <button type="button" @click="baseVideoFiles.splice(index, 1)">x</button>
  </div>
  <button type="button" @click="baseVideoFiles.push(null)">+ Add Video</button>
</label>
        <label>
          Styles:
          <div v-for="(style, index) in newProduct.styles" :key="index" class="style-row">
            <input v-model="style.name" placeholder="Style name" />
            <input v-model.number="style.price" type="number" step="0.01" placeholder="Price" />
            <input v-model.number="style.stock" type="number" placeholder="Stock" />
            <div v-for="(img, imgIdx) in styleImageFiles[index] || []" :key="imgIdx" class="image-upload-row">
  <input type="file" @change="e => updateStyleImage(e, index, imgIdx)" />
  <button type="button" @click="removeStyleImage(index, imgIdx)">x</button>
</div>
<button type="button" @click="addStyleImage(index)">+ Add Style Image</button>

            <button type="button" @click="removeStyle(index)">x</button>
          </div>
          <button type="button" @click="addStyle">Add Style</button>
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

      <!-- Current Products Render Here -->
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
            Product Name:
            <input :value="selectedProduct.name" disabled />
          </label>

          <label>
            Category:
            <select v-model="selectedProduct.category_id" disabled>
              <option v-for="cat in categories" :value="cat.id">{{ cat.name }}</option>
            </select>
          </label>

          <label>
            Stock (no style):
            <input v-model.number="selectedProduct.stock" type="number" />
          </label>

          <label>
            Styles:
            <div
              v-for="(style, index) in selectedProduct.styles"
              :key="index"
              class="style-row"
            >
              <input v-model="style.name" disabled />
              <input v-model.number="style.stock" type="number" placeholder="Stock" />
              <button type="button" @click="removeEditStyle(index)">Remove Style</button>
            </div>
          </label>

          <button type="submit">Update Stock</button>
          <button type="button" @click="selectedProduct = null">Cancel</button>
          <button type="button" @click="deleteProduct(selectedProduct.id)">Delete Product</button>
        </form>
      </div>
    </div>
  </div>
  <div v-if="currentTab === 'orders'">
  <h2>Orders</h2>
  <ul>
    <li v-for="order in orders" :key="order.id" class="order-card">
      <p>
  <strong>Order #</strong>
  {{ order.order_number || order.display_id || order.stripe_session_id }}
  · <strong>Name:</strong> {{ order.name || '—' }}
  · <strong>Email:</strong> {{ order.email }}
</p>
      <p>
        <strong>Total:</strong> ${{ order.total_price.toFixed(2) }} ·
        <strong>Created:</strong> {{ new Date(order.created_at).toLocaleString() }}
      </p>

      <div v-if="order.shipping_address" style="margin:.25rem 0">
        <strong>Ship To:</strong>
        <span>
          {{
            [
              order.shipping_address?.name,
              order.shipping_address?.address?.line1,
              order.shipping_address?.address?.line2,
              order.shipping_address?.address?.city,
              order.shipping_address?.address?.state,
              order.shipping_address?.address?.postal_code,
              order.shipping_address?.address?.country
            ].filter(Boolean).join(', ')
          }}
        </span>
      </div>

      <ul class="order-items">
        <li v-for="item in order.items" :key="item.id">
          🧸 {{ item.name }} <span v-if="item.style && item.style !== 'N/A'">({{ item.style }})</span>
          — ${{ Number(item.price).toFixed(2) }} × {{ item.quantity }}
        </li>
      </ul>

      <div class="tracking-form">
        <input v-model="order.carrier" placeholder="Carrier (e.g., USPS, UPS, FedEx)" />
        <input v-model="order.tracking_number" placeholder="Tracking Number" />
        <label>
          <input type="checkbox" v-model="order.notify" />
          Email customer tracking details
        </label>
        <button
          :disabled="!order.carrier || !order.tracking_number || submitting[order.id]"
          @click="submitTracking(order)"
        >
          {{ submitting[order.id] ? 'Sending…' : 'Submit Tracking' }}
        </button>
      </div>
    </li>
  </ul>
  <p v-if="orders.length === 0" style="opacity:.7">No orders yet.</p>
</div>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const currentTab = ref<'add' | 'edit' | 'orders'>('add')
const adminToken = sessionStorage.getItem('adminToken') || ''
const authHeaders = { headers: { Authorization: `Bearer ${adminToken}` } }
const router = useRouter()

const categories = ref<any[]>([])
const products = ref<any[]>([])
const orders = ref<any[]>([])
const selectedProduct = ref<any>(null)

const newCategory = ref('')
const newProduct = ref({
  name: '',
  price: 0,
  stock: 0,
  category_id: 0,
  description: '',
  styles: [] as { name: string; price: number; stock: number }[]
})

const baseImageFiles = ref<(File | null)[]>([])
const styleImageFiles = ref<Record<number, (File | null)[]>>({})
const editStyleImages = ref<Record<string, (File | null)[]>>({})
const baseVideoFiles = ref<(File | null)[]>([])
const styleVideoFiles = ref<Record<number, (File | null)[]>>({})

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

const fetchOrders = async () => {
  const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/orders`, authHeaders)
  orders.value = res.data.map((o: any) => ({
    ...o,
    carrier: '',
    tracking_number: '',
    notify: true
  }))
}

const openEditForm = (product: any) => {
  selectedProduct.value = JSON.parse(JSON.stringify(product))
  selectedProduct.value.styles.forEach((style: any) => {
    style._originalName = style.name
    if (!editStyleImages.value[style.name]) editStyleImages.value[style.name] = []
  })
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

const deleteProduct = async (productId: number) => {
  if (!confirm("Are you sure you want to delete this product?")) return
  await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}`, authHeaders)
  selectedProduct.value = null
  await fetchProducts()
  alert("✅ Product deleted.")
}

const addStyle = () => {
  newProduct.value.styles.push({ name: '', price: 0, stock: 0 })
}

const removeStyle = (index: number) => {
  newProduct.value.styles.splice(index, 1)
}

const addEditStyle = () => {
  selectedProduct.value.styles.push({ name: '', price: 0, stock: 0, images: [] })
}

const removeEditStyle = (index: number) => {
  selectedProduct.value.styles.splice(index, 1)
}

const addBaseImage = () => {
  baseImageFiles.value.push(null)
}

const removeBaseImage = (index: number) => {
  baseImageFiles.value.splice(index, 1)
}

const updateBaseImage = (e: Event, index: number) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) baseImageFiles.value[index] = file
}

const addStyleImage = (styleIndex: number) => {
  if (!styleImageFiles.value[styleIndex]) styleImageFiles.value[styleIndex] = []
  styleImageFiles.value[styleIndex].push(null)
}

const removeStyleImage = (styleIndex: number, imgIndex: number) => {
  styleImageFiles.value[styleIndex].splice(imgIndex, 1)
}

const updateStyleImage = (e: Event, styleIndex: number, imgIndex: number) => {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null
  if (!styleImageFiles.value[styleIndex]) styleImageFiles.value[styleIndex] = []
  styleImageFiles.value[styleIndex][imgIndex] = file
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

const handleAddProduct = async () => {
  const formData = new FormData()
  formData.append('name', newProduct.value.name)
  formData.append('description', newProduct.value.description)
  formData.append('category_id', String(newProduct.value.category_id))

  baseImageFiles.value.forEach(file => {
    if (file) formData.append('product_images', file)
  })
  baseVideoFiles.value.forEach(file => {
    if (file) formData.append('product_videos', file)
  })
  const stylesData = []
  for (const [index, style] of newProduct.value.styles.entries()) {
  if (style.name) {
    stylesData.push({
      name: style.name,
      price: style.price,
      stock: style.stock,
      image_count: (styleImageFiles.value[index] || []).length
    })

    const imageFieldName = `style_images_${style.name}`
      for (const img of styleImageFiles.value[index] || []) {
        if (img) formData.append(imageFieldName, img)
      }
  }
}
  formData.append('styles', JSON.stringify(stylesData))
  if (stylesData.length === 0) {
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
  baseImageFiles.value = []
  styleImageFiles.value = {}
  newProduct.value = { name: '', price: 0, category_id: 0, description: '', styles: [], stock: 0 }
}

const submitEdit = async () => {
  if (!selectedProduct.value) return

  const stylesPayload = selectedProduct.value.styles.map((style: any) => ({
  name: style.name,
  stock: style.stock,
  _originalName: style._originalName || style.name  // to track renames
}))




 await axios.put(
    `${import.meta.env.VITE_API_BASE_URL}/api/products/${selectedProduct.value.id}/stock`,
    {
      stock: selectedProduct.value.stock,
      styles: stylesPayload
    },
    authHeaders
  )

  alert("✅ Stock updated.")
  selectedProduct.value = null
  await fetchProducts()
}


// in <script setup>
const submitting = ref<Record<number, boolean>>({})

const submitTracking = async (order: any) => {
  if (!order.tracking_number || !order.carrier) {
    alert("Missing tracking info")
    return
  }
  try {
    submitting.value[order.id] = true
    await axios.post(
      `${import.meta.env.VITE_API_BASE_URL}/api/orders/${order.id}/process`,
      {
        carrier: order.carrier,
        tracking_number: order.tracking_number,
        notify: order.notify, // backend emails if true
      },
      authHeaders
    )
    alert("✅ Tracking submitted")
    await fetchOrders() // order gets removed server-side, this refreshes the list
  } catch (e: any) {
    console.error(e)
    alert(e?.response?.data?.detail || e.message || "Failed to submit tracking")
  } finally {
    submitting.value[order.id] = false
  }
}


onMounted(() => {
  if (!adminToken) {
    router.push('/admin-login')
    return
  }
  fetchCategories()
  fetchProducts()
  fetchOrders()
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
