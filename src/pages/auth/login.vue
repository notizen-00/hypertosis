<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white shadow-md rounded-md px-8 py-6 w-[600px] relative">
      <!-- Logo dan Header -->
      <div class="text-center mb-4">
        <img src="/src/assets/logo.png" alt="Logo" class="mx-auto mb-2 h-12" />
        <h1 class="text-lg font-bold text-center bg-blue-400 text-white py-2 rounded">
          HYPEROSTOSIS MENINGIOMA IDENTIFIER
        </h1>
      </div>

      <h2 class="text-center text-lg font-medium text-gray-700 mt-4">Login</h2>

      <!-- Form -->
      <div class="mt-4 space-y-3">
        <div class="relative">
          <input
            v-model="email"
            type="email"
            placeholder="Username"
            class="w-full border border-gray-400 rounded px-10 py-2 focus:outline-none focus:ring"
          />
          <span class="absolute left-3 top-2.5 text-gray-500">
            <i class="fas fa-user"></i>
          </span>
        </div>

        <div class="relative">
          <input
            v-model="password"
            type="password"
            placeholder="Password"
            class="w-full border border-gray-400 rounded px-10 py-2 focus:outline-none focus:ring"
          />
          <span class="absolute left-3 top-2.5 text-gray-500">
            <i class="fas fa-lock"></i>
          </span>
        </div>

        <button
          @click="login"
          class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Log in
        </button>

        <div class="flex justify-between items-center text-sm mt-2">
          <span></span>
          <span>
            Belum Terdaftar?
            <router-link to="/register" class="text-blue-500 hover:underline">
              Register
            </router-link>
          </span>
        </div>

        <p v-if="error" class="text-red-500 text-sm mt-2 text-center">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const email = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

const login = async () => {
  const { error: err } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value
  })

  if (err) {
    error.value = err.message
  } else {
    router.push('/dashboard')
  }
}
</script>


