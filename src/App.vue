<!-- App.vue -->
<template>
  <div>
    <!-- Global navbar -->
    <Navbar @search="searchTerm = $event" />

    <!-- Page content area, spaced from top -->
    <div class="page-container">
      <RouterView :search-term="searchTerm" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Navbar from '@/components/Navbar.vue'

const searchTerm = ref('')
</script>

<style scoped>
.page-container {
  padding-top: 60px; /* navbar height */
}
</style>
