import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import ProductDetail from '@/pages/ProductDetail.vue'
import Cart from '@/pages/CartPage.vue'

// Lazy-load admin dashboard
const AdminDashboard = () => import('@/pages/admin/AdminDashboard.vue')

// Define your routes
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/product/:id', name: 'ProductDetail', component: ProductDetail },
  { path: '/cart', name: 'Cart', component: Cart },
  { 
    path: '/admin', 
    name: 'AdminDashboard', 
    component: AdminDashboard,
    meta: { requiresAdmin: true } 
  },
  {
  path: '/cart',
  name: 'CartPage',
  component: () => import('@/pages/CartPage.vue')
  }

]

// Create router instance first
const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Simulated admin check
function checkAdminAuth(): boolean {
  // Example: check localStorage or a proper auth system
  return true
}

// Add navigation guard
router.beforeEach((to, from, next) => {
  next()
})


export default router


