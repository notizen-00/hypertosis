<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white shadow-md rounded-md px-8 py-6 w-[600px]">
      <!-- Logo dan Header -->
      <div class="text-center mb-4">
        <img src="/src/assets/logo.png" alt="Logo" class="mx-auto mb-2 h-12" />
        <h1 class="text-lg font-bold text-center bg-blue-400 text-white py-2 rounded">
          HYPEROSTOSIS MENINGIOMA IDENTIFIER
        </h1>
      </div>

      <h2 class="text-center text-lg font-medium text-gray-700 mt-4">Register</h2>

      <!-- Form -->
      <div class="mt-4 space-y-3">
        <div class="relative">
          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full border border-gray-400 rounded px-10 py-2 focus:outline-none focus:ring"
          />
          <span class="absolute left-3 top-2.5 text-gray-500">
            <i class="fas fa-envelope"></i>
          </span>
        </div>

        <div class="relative">
          <input
            v-model="username"
            type="text"
            placeholder="Username"
            class="w-full border border-gray-400 rounded px-10 py-2 focus:outline-none focus:ring"
          />
          <span class="absolute left-3 top-2.5 text-gray-500">
            <i class="fas fa-user"></i>
          </span>
        </div>

        <div class="relative">
          <input
            v-model="alamat"
            type="text"
            placeholder="Alamat"
            class="w-full border border-gray-400 rounded px-10 py-2 focus:outline-none focus:ring"
          />
          <span class="absolute left-3 top-2.5 text-gray-500">
            <i class="fas fa-map-marker-alt"></i>
          </span>
        </div>

        <div class="relative">
          <input
            v-model="hp"
            type="text"
            placeholder="Nomor HP"
            class="w-full border border-gray-400 rounded px-10 py-2 focus:outline-none focus:ring"
          />
          <span class="absolute left-3 top-2.5 text-gray-500">
            <i class="fas fa-phone"></i>
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
          @click="register"
          class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition disabled:opacity-50"
          :disabled="!email || !password || !username"
        >
          Register
        </button>

        <div class="flex justify-between items-center text-sm mt-2">
          <span></span>
          <span>
            Sudah punya akun?
            <router-link to="/login" class="text-blue-500 hover:underline">
              Login
            </router-link>
          </span>
        </div>

        <p v-if="error" class="text-red-500 text-sm text-center">{{ error }}</p>
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
const username = ref('')
const alamat = ref('')
const hp = ref('')
const error = ref('')
const router = useRouter()

const register = async () => {
  error.value = ''
  const { data, error: signUpError } = await supabase.auth.signUp({
    email: email.value,
    password: password.value,
  })

  if (signUpError) {
    error.value = signUpError.message
    return
  }

  if (data.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      username: username.value,
      alamat: alamat.value,
      hp: hp.value,
    })

    if (profileError) {
      error.value = profileError.message
      return
    }

    router.push('/dashboard')
  }
}
</script>

