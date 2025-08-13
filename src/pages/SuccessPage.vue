<template>
  <div class="success-page">
    <!-- Hero -->
    <header class="hero">
      <div class="hero-icon">
        <!-- Checkmark icon -->
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="currentColor" opacity="0.12"/>
          <path d="M7 12.5l3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1>Payment Successful</h1>
      <p class="sub">
        Thank you for your purchase<span v-if="orderId"> — Order <b>#{{ orderId }}</b></span>!
      </p>
    </header>

    <!-- Content -->
    <main class="content">
      <section class="card summary">
        <h2>Order Summary</h2>
        <ul class="list">
          <li>
            <span>Order status</span>
            <b>Confirmed</b>
          </li>
          <li>
            <span>Delivery estimate</span>
            <b>{{ eta }}</b>
          </li>
          <li>
            <span>Receipt</span>
            <b>Sent to your email</b>
          </li>
        </ul>

        <div class="cta-row">
          <router-link to="/" class="btn primary">Continue Shopping</router-link>
          <router-link to="/orders" class="btn ghost">View Orders</router-link>
        </div>
      </section>

      <section class="card next">
        <h3>What happens next?</h3>
        <ol>
          <li>We’re preparing your items for shipment.</li>
          <li>You’ll get tracking details by email once it ships.</li>
        </ol>
        <div class="help">
          <router-link to="/faq">FAQ</router-link>
          <span class="dot">•</span>
          <router-link to="/shipping-returns">Shipping & Returns</router-link>
          <span class="dot">•</span>
          <a href="mailto:support@yourstore.com">Email Support</a>
        </div>
      </section>
    </main>

    <!-- (Optional) Recommendations placeholder -->
   <section class="recs" v-if="recommendations.length">
  <h3>You might also like</h3>
  <!-- use the same grid class as Home.vue -->
  <div class="product-grid">
    <ProductCard
      v-for="p in recommendations"
      :key="p.id"
      :product="p"
    />
  </div>
</section>



    <!-- Confetti canvas (only if library is available) -->
    <canvas ref="confettiCanvas" class="confetti-canvas"></canvas>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import axios from 'axios'
import ProductCard from '@/components/ProductCard.vue'

const cart = useCartStore()
const route = useRoute()
const router = useRouter()

const orderId = computed(() => (route.query.order as string) || (route.query.session_id as string) || '')

const eta = computed(() => {
  const today = new Date()
  const plus = (d: number) => {
    const dt = new Date(today)
    dt.setDate(dt.getDate() + d)
    return dt.toLocaleDateString()
  }
  return `${plus(4)} – ${plus(7)}`
})

interface Product {
  id: number
  name: string
  price: number
  image_url?: string
  images?: string[]
  category?: string | null
}

const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`)
const all: Product[] = data.map((p: any) => ({
  id: p.id,
  name: p.name,
  price: p.price,
  // keep array + give a 1st-image fallback for old props
  images: p.images ?? (p.image_url ? [p.image_url] : []),
  image_url: p.image_url ?? (p.images?.[0] ?? ''),
  category: p.category ?? null
}))
const recommendations = ref<Product[]>([])

function sample<T>(arr: T[], k: number): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, Math.min(k, a.length))
}

onMounted(async () => {
  // block direct visits
  if (!route.query.session_id && !route.query.order) {
    return router.replace('/')
  }

  // 1) Snapshot purchased IDs BEFORE clearing cart
  const purchasedIdSet = new Set(cart.items.map(i => i.id))

  // 2) Clear cart
  cart.clear()

  // 3) Fetch products
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`)
    // normalize to exactly what ProductCard expects
    const all: Product[] = data.map((p: any) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image_url: p.image_url,
      category: p.category ?? null
    }))

    // purchased categories
    const purchasedCategories = new Set(
      all.filter(p => purchasedIdSet.has(p.id))
         .map(p => p.category)
         .filter(Boolean) as string[]
    )

    // exclude purchased
    const notPurchased = all.filter(p => !purchasedIdSet.has(p.id))

    // prioritize same-category
    const sameCategory = notPurchased.filter(p => p.category && purchasedCategories.has(p.category))
    const other = notPurchased.filter(p => !p.category || !purchasedCategories.has(p.category))

    // pick up to 3; change to `[...sameCategory, ...other]` if you want ALL
    const prioritized = [
      ...sample(sameCategory, 3),
      ...sample(other, 3 - Math.min(3, sameCategory.length))
    ]

    recommendations.value = prioritized
  } catch (e) {
    console.error('Failed to fetch recommendations', e)
    recommendations.value = []
  }

  // 4) Confetti fallback as you had
  try {
    const confettiMod = await import('canvas-confetti')
    const confetti = confettiMod.default
    const myConfetti = confetti.create(
      document.querySelector('.confetti-canvas') as HTMLCanvasElement,
      { resize: true, useWorker: true }
    )
    const opts = { particleCount: 120, spread: 75, origin: { y: 0.25 } }
    myConfetti(opts)
    setTimeout(() => myConfetti({ ...opts, scalar: 0.9 }), 300)
    setTimeout(() => myConfetti({ ...opts, scalar: 0.8 }), 700)
  } catch {
    const el = document.querySelector('.hero-icon')
    el?.classList.add('party')
    setTimeout(() => el?.classList.remove('party'), 1200)
  }
})
</script>


<style scoped>
/* Layout */
.success-page {
  --radius: 14px;
  --shadow: 0 10px 30px rgba(0,0,0,0.08);
  --bg: #0f1115;        /* page background (dark-ish) */
  --card: #ffffff;      /* card background */
  --ink: #0e1116;       /* primary text */
  --muted: #6b7280;     /* secondary text */
  --accent: #16a34a;    /* green */
  --accent-ink: #0b5;   /* icon text on gradient */
  background: var(--bg);
  color: var(--ink);
  min-height: calc(100dvh - 180px); /* keeps a tall middle area */
  display: grid;
  grid-template-rows: auto 1fr auto;
}

/* Hero */
.hero {
  text-align: center;
  padding: 48px 16px 28px;
  color: white;
  background:
    radial-gradient(1200px 300px at 50% -10%, rgba(22,163,74,0.25), transparent 60%),
    linear-gradient(135deg, #16a34a, #10b981 40%, #22c55e 90%);
  position: relative;
}

.hero-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  color: white;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255,255,255,0.14);
  backdrop-filter: blur(6px);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.25);
}
.hero h1 {
  margin: 6px 0 6px;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0.2px;
}
.sub {
  opacity: 0.95;
}

/* Content grid */
.content {
  margin: -18px auto 0;
  max-width: 1000px;
  padding: 0 16px 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 880px) {
  .content {
    grid-template-columns: 1.2fr 1fr;
  }
}

.card {
  background: var(--card);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 20px;
}

.summary h2 {
  margin-top: 4px;
  margin-bottom: 10px;
  font-size: 20px;
  font-weight: 700;
}

.list {
  list-style: none;
  margin: 0 0 14px;
  padding: 0;
  display: grid;
  gap: 10px;
}
.list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 15px;
}
.list li span {
  color: var(--muted);
}

.cta-row {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: 10px;
  padding: 0 14px;
  font-weight: 600;
  text-decoration: none;
  transition: transform .08s ease, box-shadow .2s ease, background .2s ease;
}
.btn.primary {
  background: #111827;
  color: #fff;
  box-shadow: 0 6px 18px rgba(0,0,0,.15);
}
.btn.primary:hover { transform: translateY(-1px); }
.btn.ghost {
  background: #f3f4f6;
  color: #111827;
}
.btn.ghost:hover { background: #e5e7eb; }

/* Next steps */
.next h3 {
  margin: 2px 0 10px;
  font-size: 18px;
}
.next ol {
  margin: 0 0 12px 18px;
  color: var(--ink);
}
.help {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 14px;
}
.help a, .help .dot, .help > * { color: #2563eb; text-decoration: none; }
.help .dot { color: #9ca3af; }

/* Recs placeholder (replace with real cards later) */
.rec-card {
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  text-decoration: none;
  color: inherit;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.rec-img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.rec-info {
  padding: 10px;
}

.rec-info h4 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.rec-info p {
  color: #16a34a;
  font-weight: 500;
}

.recs {
  max-width: 1000px;
  margin: 2px auto 36px;
  padding: 0 16px;
}
.recs h3 {
  color: #fff;
  opacity: 0.95;
  font-weight: 700;
  margin: 18px 0 10px;
}
.rec-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
.name{
  /* ... */
  color: var(--champagne, #F5E1E9);
}
.price{
  /* ... */
  color: var(--champagne, #F5E1E9);
}
.product-card{
  background: linear-gradient(180deg, var(--card-bg, #2f2f2f), #262626);
  border: 1px solid var(--card-edge, #3a3a3a);
}

@media (min-width: 640px) {
  .rec-grid { grid-template-columns: repeat(3, 1fr); }
}
.rec-skeleton {
  height: 140px;
  border-radius: var(--radius);
  background: linear-gradient(90deg, #1f2937 0%, #2b3341 50%, #1f2937 100%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Confetti canvas sits on top but doesn't block clicks */
.confetti-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
}
.product-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  align-items: start;              /* keep rows aligned */
}

:deep(.product-card) {
  position: relative;              /* anchor badges */
  overflow: hidden;                /* keep ribbons inside */
  background: linear-gradient(180deg, var(--card-bg, #2f2f2f), #262626);
  border: 1px solid var(--card-edge, #3a3a3a);
}

:deep(.product-card img) {
  width: 100%;
  height: 150px;
  object-fit: cover;               /* consistent image crop */
  display: block;
}


/* Optional: tweak breakpoints if you want tighter cards on phones */
@media (max-width: 420px) {
  .product-grid {
    grid-template-columns: repeat(2, minmax(150px, 1fr));
  }
}
/* Fallback tiny celebration if canvas-confetti isn't installed */
.party { animation: pop 0.6s ease-out; }
@keyframes pop {
  0% { transform: scale(1); box-shadow: 0 0 0 rgba(255,255,255,0); }
  40% { transform: scale(1.12); box-shadow: 0 0 0 8px rgba(255,255,255,0.18); }
  100% { transform: scale(1); box-shadow: 0 0 0 rgba(255,255,255,0); }
}
/* Make Success page’s dark theme apply inside ProductCard too */
:deep(.product-card .name),
:deep(.product-card .price) {
  color: var(--champagne, #F5E1E9);
}
</style>
