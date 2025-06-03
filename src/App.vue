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
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
const searchTerm = ref('')
</script>

<style scoped>
.page-container {
  padding-top: 60px; /* navbar height */
}
</style>
