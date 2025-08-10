import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import ProductDetail from '@/pages/ProductDetail.vue'
import Cart from '@/pages/CartPage.vue'
import AdminLogin from '@/pages/admin/AdminLogin.vue'

// Lazy-load larger routes
const AdminDashboard = () => import('@/pages/admin/AdminDashboard.vue')
const Checkout = () => import('@/pages/CheckoutPage.vue')
const Success = () => import('@/pages/SuccessPage.vue')

const routes = [
  { path: '/', name: 'Home', component: Home },

  // Category route used by your navbar buttons
  // Reuse Home and filter by route.params.id
  { path: '/category/:id(\\d+)', name: 'Category', component: Home, props: true },

  { path: '/product/:id(\\d+)', name: 'ProductDetail', component: ProductDetail },
  { path: '/cart', name: 'Cart', component: Cart },

  { path: '/checkout', name: 'Checkout', component: Checkout },
  { path: '/success', name: 'Success', component: Success },

  { path: '/admin-login', name: 'AdminLogin', component: AdminLogin },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAdmin: true },
  },

  // (Optional) 404
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: () => import('@/pages/NotFound.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // safer with Vite
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

// Admin guard
router.beforeEach((to, _from, next) => {
  const isAdmin = sessionStorage.getItem('adminToken') === 'secret-token-123'
  if (to.meta.requiresAdmin && !isAdmin) next('/admin-login')
  else next()
})

// Auto-reload if a lazy chunk can’t be fetched (common after a new deploy + cached HTML)
router.onError((err) => {
  const msg = String(err?.message || '')
  if (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk') // some browsers
  ) {
    window.location.reload()
  }
})

export default router
