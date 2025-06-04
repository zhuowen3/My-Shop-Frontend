<template>
  <div class="login-container">
    <h2>Admin Login</h2>
    <form @submit.prevent="handleLogin" class="login-form">
      <label>
        Username:
        <input v-model="username" type="text" required />
      </label>
      <label>
        Password:
        <input v-model="password" type="password" required />
      </label>
      <button type="submit">Login</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const handleLogin = async () => {
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/login`, new URLSearchParams({
      username: username.value,
      password: password.value
    }))
    localStorage.setItem('adminToken', res.data.access_token)
    router.push('/admin')
  } catch (err) {
    error.value = 'Invalid login'
  }
}

</script>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 3rem auto;
  padding: 2rem;
  background-color: #f4f4f4;
  border-radius: 10px;
}
.login-form label {
  display: block;
  margin-bottom: 1rem;
}
.login-form input {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.3rem;
}
button {
  padding: 0.5rem 1rem;
}
.error {
  color: red;
  margin-top: 1rem;
}
</style>
