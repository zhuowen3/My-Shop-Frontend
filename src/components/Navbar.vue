<template>
  <nav class="navbar">
    <!-- Left: Home Icon -->
    <a @click="goHome" class="icon-link">
      <font-awesome-icon :icon="['fas', 'house']" class="icon" />
    </a>

    <!-- Center: Search -->
    <input
      type="text"
      v-model="search"
      @input="$emit('search', search)"
      class="search-input"
      placeholder="Search..."
    />

    <!-- Right: Cart Icon -->
    <a @click="goToCart" class="cart-icon">🛒</a>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')

const goHome = () => router.push('/')
const goToCart = () => router.push('/cart')

defineEmits(['search'])
</script>

<style scoped>
.navbar {
  background-color: black;
  color: white;
  height: 60px;
  width: 100%;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  box-sizing: border-box;
}

.icon {
  font-size: 20px;
  color: white;
  cursor: pointer;
}

.search-input {
  flex-grow: 1;
  max-width: 50%;
  margin: 0 1rem;
  padding: 8px 12px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  color: black;
}

.icon-link,
.cart-icon {
  display: flex;
  align-items: center;
  color: white;
  font-size: 20px;
  cursor: pointer;
}
</style>
