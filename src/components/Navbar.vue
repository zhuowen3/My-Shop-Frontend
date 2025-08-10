<template>
  <nav class="navbar">
    <!-- Left: Logo + Brand -->
    <div class="left" @click="goHome">
      <img v-if="logoSrc" :src="logoSrc" alt="Plushie House" class="logo" />
      <div class="brand">Plushie House</div>
    </div>

    <!-- Center (desktop/tablet): Home + Categories -->
    <div class="center">
      <button class="nav-link" :class="{ active: isHome }" @click="goHome">Home</button>
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="nav-link"
        @click="goCategory(cat)"
      >
        {{ cat.name }}
      </button>
    </div>

    <!-- Right: Search + Cart + Hamburger (mobile) -->
    <div class="right">
      <button class="icon-button" @click="toggleSearch" aria-label="Search">
        <font-awesome-icon :icon="['fas', 'magnifying-glass']" class="icon" />
      </button>

      <div class="cart-wrapper" @click="goToCart" aria-label="Cart">
        <font-awesome-icon :icon="['fas', 'cart-shopping']" class="icon" />
        <span v-if="cart.totalCount > 0" class="cart-count">{{ cart.totalCount }}</span>
      </div>

      <button class="icon-button hamburger" @click="toggleMenu" aria-label="Menu">
        <font-awesome-icon :icon="['fas', 'bars']" class="icon" />
      </button>
    </div>

    <!-- Search input (popover) -->
    <transition name="fade">
      <div v-if="showSearch" class="search-popover">
        <input
          type="text"
          v-model="search"
          @input="$emit('search', search)"
          class="search-input"
          placeholder="Search plushies..."
          autofocus
        />
      </div>
    </transition>
  </nav>

  <!-- Mobile drawer + overlay -->
  <transition name="fade">
    <div v-if="showMenu" class="overlay" @click="closeMenu" />
  </transition>

  <transition name="slide">
    <aside v-if="showMenu" class="drawer" role="dialog" aria-modal="true">
      <div class="drawer-header">
        <div class="drawer-title">Menu</div>
        <button class="icon-button" @click="closeMenu" aria-label="Close">
          <font-awesome-icon :icon="['fas', 'xmark']" class="icon" />
        </button>
      </div>

      <button class="drawer-link" :class="{ active: isHome }" @click="goHomeAndClose">
        Home
      </button>

      <button
        v-for="cat in categories"
        :key="cat.id"
        class="drawer-link"
        @click="goCategoryAndClose(cat)"
      >
        {{ cat.name }}
      </button>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import axios from 'axios'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
const router = useRouter()
const route = useRoute()

// Set your logo path if you have one
const logoSrc = '/logo4.png' // e.g. new URL('@/assets/logo.png', import.meta.url).href

// Search
const search = ref('')
const showSearch = ref(false)
const toggleSearch = () => (showSearch.value = !showSearch.value)

// Mobile drawer
const showMenu = ref(false)
const toggleMenu = () => (showMenu.value = !showMenu.value)
const closeMenu = () => (showMenu.value = false)

// Categories
const categories = ref<{ id: number; name: string }[]>([])
const fetchCategories = async () => {
  const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/categories`)
  categories.value = data
}
const emit = defineEmits(['search','filter'])
// Routing
const goHome = () => router.push('/')
const goHomeAndClose = () => { goHome(); closeMenu() }
const goToCart = () => router.push('/cart')
const goCategory = (cat: { id: number; name: string }) => router.push(`/category/${cat.id}`)
const goCategoryAndClose = (cat: { id: number; name: string }) => { goCategory(cat); closeMenu() }
const isHome = computed(() => route.path === '/')

// ESC to close popovers
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    showSearch.value = false
    showMenu.value = false
  }
}

onMounted(() => {
  fetchCategories()
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

/* Navbar.vue */
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Luckiest+Guy&display=swap');

.navbar {
  /* Rose-Gold palette */
  --rose: #F06292;
  --plum: #6A1B4D;
  --champagne: #F5E1E9;
  --gold: #FFD166;
  --nav: #3A3A3A;

  background: linear-gradient(180deg, var(--nav) 0%, #2F2F2F 100%);
  color: var(--champagne);
  height: 80px;
  width: 100%;
  position: fixed;
  top: 0; left: 0;
  z-index: 1000;

  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  box-sizing: border-box;
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

/* logo sits on top with no box behind it */
.logo {
  height: 80px;
  width: auto;
  display: block;
  pointer-events: none;
}

.brand {
  font-family: 'Luckiest Guy', system-ui, Arial, sans-serif;
  font-size: 28px;
  line-height: 1;
  color: var(--rose);
  /* plum outline for the cartoon feel */
  text-shadow:
    -2px -2px 0 var(--plum),
     2px -2px 0 var(--plum),
    -2px  2px 0 var(--plum),
     2px  2px 0 var(--plum);
}

.center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 14px;
  overflow-x: auto;
  scrollbar-width: none;
}
.center::-webkit-scrollbar { display: none; }

.nav-link {
  background: transparent;
  border: none;
  color: var(--champagne);
  font-weight: 600;
  font-size: 16px;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  white-space: nowrap;
}
.nav-link:hover { background: rgba(106, 27, 77, 0.18); }      /* plum haze */
.nav-link.active {
  color: #fff;
  box-shadow: inset 0 -3px 0 var(--gold);                      /* gold underline */
}

.right {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
}
.icon-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 10px;
  color: var(--champagne);
}
.icon-button:hover { background: rgba(240, 98, 146, 0.16); }   /* rose haze */
.icon { font-size: 22px; }

.cart-wrapper {
  position: relative;
  cursor: pointer;
  padding: 6px;
  border-radius: 10px;
}
.cart-wrapper:hover { background: rgba(240, 98, 146, 0.16); }
.cart-count {
  position: absolute;
  top: -4px; right: -4px;
  background-color: var(--gold);
  color: #3A3A3A;                       /* readable on gold */
  font-size: 12px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 999px;
  min-width: 20px;
  text-align: center;
}

/* Search popover */
.search-popover {
  position: absolute;
  right: 16px;
  top: 84px;
  background: #2a2a2a;
  border: 1px solid #4a2b3c;            /* muted plum border */
  padding: 10px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
  z-index: 1100;
}
.search-input {
  width: 260px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid #4a2b3c;
}
.search-input:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(240, 98, 146, .25); /* rose focus ring */
}

/* Drawer + overlay + animations unchanged */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); z-index: 1090; }
.drawer {
  position: fixed; top: 0; right: 0; bottom: 0;
  width: min(80vw, 320px);
  background: #3a3a3a;
  z-index: 1100; padding: 16px;
  box-shadow: -12px 0 30px rgba(0,0,0,0.35);
  display: flex; flex-direction: column; gap: 6px;
}
.drawer-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.drawer-title { font-weight: 700; font-size: 18px; color: var(--champagne); }
.drawer-link {
  width: 100%; text-align: left; background: transparent; border: none;
  color: var(--champagne); font-weight: 600; font-size: 16px; padding: 10px 8px;
  border-radius: 10px; cursor: pointer;
}
.drawer-link:hover { background: rgba(106,27,77,0.18); }
.drawer-link.active { box-shadow: inset 0 -3px 0 var(--gold); }

.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-enter-active, .slide-leave-active { transition: transform .2s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }

@media (max-width: 900px) {
  .navbar { grid-template-columns: auto 1fr auto; }
  .center { display: none; }
  .hamburger { display: inline-flex; }
}
@media (min-width: 901px) { .hamburger { display: none; } }
</style>

