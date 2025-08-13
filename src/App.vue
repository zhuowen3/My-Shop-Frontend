<!-- App.vue -->
<template>
  <div>
    <Navbar @search="searchTerm = $event" />
    <div class="page-container">
      <router-view v-slot="{ Component }">
        <component :is="Component" :searchTerm="searchTerm" />
      </router-view>
    </div>
  </div>
  <Footer />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { useCartStore } from '@/stores/cart'
import Footer from '@/components/Footer.vue'

const cart = useCartStore()
const searchTerm = ref('')
</script>

<!-- App.vue -->
<style>
/* Global (UNSCOPED) mobile clamp */
@media (max-width: 640px) {
  html, body, #app {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow-x: clip; /* or hidden if you prefer */
    background: #0f1115;
  }

  /* Common wrappers */
  main, .container, .page, .view, .content, .recs, .product-grid, .page-container {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    margin: 0 auto;
    padding-inline: 12px;
    box-sizing: border-box;
  }

  /* Media sanity */
  img, video, canvas, svg { display:block; max-width:100%; width:100%; height:auto; }

  /* Prevent flex/grid children from forcing overflow */
  * { min-width: 0; }
}
</style>

<style scoped>
.page-container {
  padding-top: 60px; /* navbar height */
}
</style>
