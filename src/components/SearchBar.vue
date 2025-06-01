<template>
  <div class="w-full">
    <input
      v-model="localSearch"
      @input="emitSearch"
      type="text"
      placeholder="Search products..."
      class="w-full p-2 border rounded"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const localSearch = ref('')
const emit = defineEmits(['search'])

const emitSearch = () => {
  emit('search', localSearch.value)
}
</script>
