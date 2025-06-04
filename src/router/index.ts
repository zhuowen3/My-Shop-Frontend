import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import ProductDetail from '@/pages/ProductDetail.vue'
import Cart from '@/pages/CartPage.vue'
import AdminLogin from '@/pages/admin/AdminLogin.vue'
// Lazy-load admin dashboard
const AdminDashboard = () => import('@/pages/admin/AdminDashboard.vue')

// Define your routes
const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/product/:id', name: 'ProductDetail', component: ProductDetail },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: '/admin-login', name: 'AdminLogin', component: AdminLogin },
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
  },
  {
  path: '/checkout',
  name: 'Checkout',
  component: () => import('@/pages/CheckoutPage.vue'),
  },
  { path: '/success', name: 'Success', component: () => import('@/pages/SuccessPage.vue') },

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
  const isAdmin = localStorage.getItem('adminToken') === 'secret-token-123'
  if (to.meta.requiresAdmin && !isAdmin) {
    next('/admin-login')
  } else {
    next()
  }
})

export default router


