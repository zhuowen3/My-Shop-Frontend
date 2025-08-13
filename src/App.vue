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
@media (max-width: 640px) {
  /* Only prevent horizontal overflow globally */
  html, body, #app {
    width: 100%;
    max-width: 100%;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    overflow-x: clip; /* or hidden */
  }

  /* Safe resets that won’t change look */
  img, video, canvas, svg { display:block; max-width:100%; height:auto; }
  * { min-width: 0; }  /* prevents flex/grid children from forcing overflow */
}
</style>

<style scoped>
.page-container { padding-top: 60px; }
</style>
