<template>
  <main-layout>
    <template #breadcrumb>
      <nav class="text-sm text-blue-400">
        <router-link to="/">Homepage</router-link> / 
        <router-link to="/profile" class="text-blue-400">Profile</router-link> / 
        <span class="text-black">Edit Profile</span>
      </nav>
    </template>

    <div class="p-8 max-w-2xl mx-auto">
      <h2 class="text-2xl font-semibold mb-6">Edit Profile</h2>

      <form @submit.prevent="updateProfile" class="space-y-4 border p-6 rounded-md shadow bg-white">
        <div>
          <label class="font-medium block mb-1">Nama Lengkap</label>
          <input v-model="profile.username" type="text" class="input" />
        </div>

        <div>
          <label class="font-medium block mb-1">Email</label>
          <input v-model="profile.email" type="email" class="input bg-gray-100" disabled />
        </div>

        <div>
          <label class="font-medium block mb-1">Telepon</label>
          <input v-model="profile.hp" type="text" class="input" />
        </div>

        <div>
          <label class="font-medium block mb-1">Job</label>
          <select v-model="profile.job" class="input">
            <option>Dokter</option>
            <option>Radiografer</option>
            <option>Mahasiswa</option>
            <option>Lainnya</option>
          </select>
        </div>

        <div>
          <label class="font-medium block mb-1">Negara</label>
          <input v-model="profile.negara" type="text" class="input" />
        </div>

        <button type="submit" class="btn w-full">💾 Simpan Perubahan</button>
      </form>

      <p v-if="message" class="mt-4 text-green-600 font-medium">{{ message }}</p>
      <p v-if="error" class="mt-4 text-red-500">{{ error }}</p>
    </div>
  </main-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'
import MainLayout from '@/layouts/main.vue'

const profile = ref({
  username: '',
  email: '',
  hp: '',
  job: '',
  negara: '',
})

const message = ref('')
const error = ref('')
const router = useRouter()

onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    profile.value.email = user.email
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (err) {
      error.value = err.message
    } else {
      Object.assign(profile.value, data)
    }
  }
})

const updateProfile = async () => {
  message.value = ''
  error.value = ''
  const { data: { user } } = await supabase.auth.getUser()

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      username: profile.value.username,
      hp: profile.value.hp,
      job: profile.value.job,
      negara: profile.value.negara
    })
    .eq('id', user.id)

  if (updateError) {
    error.value = updateError.message
  } else {
    message.value = 'Profil berhasil diperbarui!'
    setTimeout(() => {
      router.push('/profile')
    }, 1000)
  }
}
</script>

