<template>
  <main-layout>
    <template #breadcrumb>
      <nav class="text-sm text-blue-400">
        <a href="/">Homepage</a> / <span class="text-black">Profile</span>
      </nav>
    </template>

    <div class="p-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left: User Details -->
      <div class="lg:col-span-2">
        <h1 class="text-2xl font-semibold mb-6">User Details</h1>

        <div class="border rounded-lg p-6 shadow-sm relative bg-white">
          <router-link
            to="/profile/edit"
            class="absolute top-4 right-4 btn text-blue-500 hover:underline text-sm"
          >
            <i class="fas fa-edit"></i> Edit Profile
          </router-link>

          <div class="space-y-4 text-gray-800">
            <div>
              <span class="font-semibold">Nama Lengkap</span><br />
              {{ profile.username || '-' }}
            </div>
            <div>
              <span class="font-semibold">Email</span><br />
              {{ profile.email || '-' }}
            </div>
            <div>
              <span class="font-semibold">Telepon</span><br />
              {{ profile.hp || '-' }}
            </div>
            <div>
              <span class="font-semibold">Job</span><br />
              {{ profile.job || '-' }}
            </div>
            <div>
              <span class="font-semibold">Negara</span><br />
              {{ profile.negara || '-' }}
            </div>
          </div>
        </div>

        <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
      </div>

      <!-- Right: Prediction Stats -->
      <div class="bg-white border rounded-lg shadow-sm p-6 text-center">
        <h2 class="text-lg font-semibold mb-4 text-gray-700">Total Riwayat Prediksi</h2>
        <p class="text-5xl font-bold text-blue-500">{{ totalPrediksi }}</p>
        <router-link
          to="/history"
          class="mt-4 inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Lihat Riwayat
        </router-link>
      </div>
    </div>
  </main-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import MainLayout from '@/layouts/main.vue'

const profile = ref({})
const error = ref('')
const totalPrediksi = ref(0)

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    error.value = 'User belum login.'
    return
  }

  const { data, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (fetchError) {
    error.value = fetchError.message
  } else {
    profile.value = { ...data, email: user.email }

    const { count, error: countError } = await supabase
      .from('mri_history')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      console.error('Gagal hitung prediksi:', countError.message)
    } else {
      totalPrediksi.value = count
    }
  }
})
</script>
