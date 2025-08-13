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

<style scoped>
.page-container {
  padding-top: 60px; /* navbar height */
}
/* Global mobile clamp */
@media (max-width: 640px) {
  html, body, #app {
    width: 100%;
    max-width: 100vw;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow-x: clip; /* modern 'hidden' that doesn't break scroll */
    background: #0f1115;
  }

  /* Common wrappers that often set a desktop min-width */
  main, .container, .page, .view, .content, .recs, .product-grid {
    width: 100%;
    max-width: 100vw;
    min-width: 0;             /* allow shrinking inside grid/flex */
    margin: 0 auto;
    padding-inline: 12px;     /* safe side padding */
    box-sizing: border-box;
  }

  /* Media should never overflow */
  img, video, canvas, svg {
    display: block;
    max-width: 100%;
    width: 100%;
    height: auto;
  }

  /* Grid/flex children may overflow if min-width isn’t reset */
  * {
    min-width: 0; /* lets text wrap; prevents child overflow in flex/grid */
  }
}
</style>