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
        </div>
      </section>

      <section class="card next">
        <h3>What happens next?</h3>
        <ol>
          <li>We’re preparing your items for shipment.</li>
          <li>You’ll get tracking details by email once it ships.</li>
        </ol>
        <div class="help">
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
type CardStyle = { name: string; price: string | number; stock: number; images?: string[] }
type CardProduct = {
  id: number
  name: string
  price: number
  images: string[]
  image_url: string
  category?: string | null
  stock: number           // ProductCard likely uses this to decide the ribbon
  styles: CardStyle[]     // price must NOT be undefined
}

const recommendations = ref<CardProduct[]>([])

function toCardProduct(p: any): CardProduct {
  const images: string[] =
    Array.isArray(p.images) && p.images.length
      ? p.images
      : (p.image_url ? [p.image_url] : [])

  const styles: CardStyle[] = Array.isArray(p.styles)
    ? p.styles.map((s: any) => ({
        name: s?.name ?? '',
        price: (s?.price ?? 0) as string | number,  // ensure string | number
        stock: Number(s?.stock ?? 0),
        images: s?.images ?? []
      }))
    : []

  // If product.stock is not meaningful for styled items, sum style stock so the ribbon is correct
  const stockFromStyles = styles.reduce((sum, s) => sum + (Number.isFinite(s.stock) ? s.stock : 0), 0)
  const stock =
    Number.isFinite(p.stock) && (p.stock as number) > 0
      ? Number(p.stock)
      : (styles.length ? stockFromStyles : 0)

  return {
    id: p.id,
    name: p.name,
    price: Number(p.price) || 0,
    images,
    image_url: images[0] ?? '',
    category: p.category ?? null,
    stock,
    styles
  }
}
const cart = useCartStore()
const route = useRoute()
const router = useRouter()

const orderId = computed(() => (route.query.order as string) || (route.query.session_id as string) || '')

const eta = computed(() => {
  const today = new Date()
  const plus = (d: number) => {
    const dt = new Date(today); dt.setDate(dt.getDate() + d); return dt.toLocaleDateString()
  }
  return `${plus(4)} – ${plus(7)}`
})

type StyleLite = { name: string; price?: number; stock?: number }
type ProductForCard = {
  id: number
  name: string
  price: number
  images: string[]        // ProductCard prefers an array
  image_url: string       // keep for old paths
  category?: string | null
  stock: number
  styles: StyleLite[]
}

function sample<T>(arr: T[], k: number): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a.slice(0, Math.min(k, a.length))
}

function normalizeProducts(raw: any[]): ProductForCard[] {
  return raw.map((p: any) => {
    // try multiple shapes you might have across pages/APIs
    const images: string[] =
      p.images?.length ? p.images :
      p.product_images?.map((x: any) => x.url) ??           // if your API returns a relation
      (p.image_url ? [p.image_url] : [])

    const styles: StyleLite[] = Array.isArray(p.styles) ? p.styles : []

    // if stock is missing, assume “in stock” so ribbons don’t lie
    const stockFromStyles = styles.reduce((s, st) => s + (Number(st?.stock) || 0), 0)
    const stock = Number.isFinite(p.stock) ? Number(p.stock) : (styles.length ? stockFromStyles : 1)

    return {
      id: p.id,
      name: p.name,
      price: Number(p.price) || 0,
      images,
      image_url: images[0] ?? '',
      category: p.category ?? null,
      stock,
      styles
    }
  })
}

onMounted(async () => {
  if (!route.query.session_id && !route.query.order) return router.replace('/')

  const purchasedIdSet = new Set(cart.items.map(i => i.id))
  cart.clear()

  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`)
    const all: CardProduct[] = data.map(toCardProduct)

    const purchasedCategories = new Set(
      all.filter(p => purchasedIdSet.has(p.id))
         .map(p => p.category)
         .filter(Boolean) as string[]
    )

    const notPurchased = all.filter(p => !purchasedIdSet.has(p.id))
    const sameCategory = notPurchased.filter(p => p.category && purchasedCategories.has(p.category!))
    const other = notPurchased.filter(p => !p.category || !purchasedCategories.has(p.category))

    const pick = <T,>(arr: T[], k: number) => arr.sort(() => Math.random() - 0.5).slice(0, Math.min(k, arr.length))
    recommendations.value = [...pick(sameCategory, 3), ...pick(other, 3 - Math.min(3, sameCategory.length))]
  } catch (e) {
    console.error('Failed to fetch recommendations', e)
    recommendations.value = []
  }

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
/* --- Page skeleton (safe) --- */
.success-page {
  --radius: 14px;
  --shadow: 0 10px 30px rgba(0,0,0,0.08);
  --bg: #0f1115;
  --card: #ffffff;
  --ink: #0e1116;
  --muted: #6b7280;
  --accent: #16a34a;

  background: var(--bg);
  color: var(--ink);
  min-height: 100dvh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  width: 100%;
  overflow-x: hidden;            /* prevent sideways scroll from any child */
  box-sizing: border-box;
}

/* ensure global root never creates sideways scroll + keeps dark bg */
:global(html, body, #app) {
  overflow-x: hidden;
  background: #0f1115;
}

/* --- Hero --- */
.hero {
  text-align: center;
  padding: 48px 16px 28px;
  color: white;
  background:
    radial-gradient(1200px 300px at 50% -10%, rgba(22,163,74,0.25), transparent 60%),
    linear-gradient(135deg, #16a34a, #10b981 40%, #22c55e 90%);
}
.hero-icon{
  width:56px;height:56px;margin:0 auto 12px;color:white;
  display:grid;place-items:center;border-radius:999px;
  background:rgba(255,255,255,0.14);backdrop-filter:blur(6px);
  box-shadow:inset 0 1px 0 rgba(255,255,255,0.25);
}
.hero h1{ margin:6px 0; font-size:28px; font-weight:800; letter-spacing:.2px; }
.sub{ opacity:.95; }

/* --- Content cards --- */
.content{
  margin:-18px auto 0;
  max-width:1000px;
  padding:0 16px 24px;
  display:grid;
  grid-template-columns: 1fr;
  gap:16px;
  width:100%;
  box-sizing:border-box;
}
@media (min-width: 880px){
  .content{ grid-template-columns: 1.2fr 1fr; }
}
.card{
  background:var(--card);
  border-radius:var(--radius);
  box-shadow:var(--shadow);
  padding:20px;
  min-width:0;                   /* allow shrinking in grid */
}
.summary h2{ margin:4px 0 10px; font-size:20px; font-weight:700; }
.list{ list-style:none; margin:0 0 14px; padding:0; display:grid; gap:10px; }
.list li{ display:flex; align-items:center; justify-content:space-between; gap:12px; font-size:15px; }
.list li span{ color:var(--muted); }
.cta-row{ margin-top:14px; display:flex; gap:10px; flex-wrap:wrap; }
.btn{ display:inline-flex; align-items:center; justify-content:center; height:40px; border-radius:10px; padding:0 14px; font-weight:600; text-decoration:none; }
.btn.primary{ background:#111827; color:#fff; box-shadow:0 6px 18px rgba(0,0,0,.15); }
.btn.ghost{ background:#f3f4f6; color:#111827; }

/* --- Recs section --- */
.recs{
  max-width:1000px;
  margin:2px auto 36px;
  padding:0 16px;
  width:100%;
  box-sizing:border-box;
}
.recs h3{ color:#fff; opacity:.95; font-weight:700; margin:18px 0 10px; }

/* Grid: phone=1, tablet=2, desktop=3 */
.product-grid{
  display:grid;
  gap:12px;
  grid-template-columns: 1fr;
  align-items:stretch;
  width:100%;
  max-width:100%;
}
@media (min-width:640px){
  .product-grid{ grid-template-columns: repeat(2, 1fr); }
}
@media (min-width:1024px){
  .product-grid{ grid-template-columns: repeat(3, 1fr); }
}

/* --- Hard overrides for ProductCard to prevent overflow/stretch --- */
:deep(.product-card){
  width:100% !important;
  max-width:100% !important;
  min-width:0 !important;
  box-sizing:border-box;
  display:flex;
  flex-direction:column;
  overflow:hidden;
  /* remove any fixed widths coming from internal styles */
}

/* remove the ribbon entirely if your card has one */
:deep(.ribbon){ display:none !important; }

/* keep media tidy; avoid tall rectangles */
:deep(.product-card img),
:deep(.product-card .image),
:deep(.product-card .media){
  width:100% !important;
  max-width:100%;
  display:block;
  aspect-ratio: 1 / 1;          /* square thumbnail so rows line up */
  object-fit: cover;
}

/* text shouldn’t push layout horizontally */
:deep(.product-card *){
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* Confetti canvas */
.confetti-canvas{ position:fixed; inset:0; pointer-events:none; }

/* Tiny hero fallback animation */
.party{ animation:pop .6s ease-out; }
@keyframes pop{
  0%{ transform:scale(1); box-shadow:0 0 0 rgba(255,255,255,0); }
  40%{ transform:scale(1.12); box-shadow:0 0 0 8px rgba(255,255,255,0.18); }
  100%{ transform:scale(1); box-shadow:0 0 0 rgba(255,255,255,0); }
}

/* keep dark theme inside card text on this page */
:deep(.product-card .name),
:deep(.product-card .price){
  color:#F5E1E9;
}
</style>
