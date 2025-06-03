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

    <!-- Right: Cart Icon with Badge -->
<div class="cart-wrapper" @click="goToCart">
  <span class="cart-icon">🛒</span>
  <span v-if="cart.totalCount > 0" class="cart-count">{{ cart.totalCount }}</span>
</div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'

const cart = useCartStore()
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
.cart-wrapper {
  position: relative;
  cursor: pointer;
}

.cart-count {
  position: absolute;
  top: -6px;
  right: -10px;
  background-color: red;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 50%;
}
</style>
