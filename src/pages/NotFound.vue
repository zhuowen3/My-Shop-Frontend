<template>
  <div class="nf">
    <h1>404</h1>
    <p>We couldn’t find that page.</p>
    <router-link to="/">Go home</router-link>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.nf { min-height: calc(100vh - 80px); display: grid; place-items: center; text-align: center; }
h1 { font-size: 64px; margin: 0; }
p { margin: 8px 0 16px; }
</style>
