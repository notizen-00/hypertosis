<template>
  <header class="bg-sky-300 flex justify-between items-center px-4 py-2 shadow relative">
    <div class="flex items-center space-x-2">
      <router-link to="/">
        <img src="/src/assets/logo.png" alt="Logo" class="h-12" />
      </router-link>
    </div>

    <div class="relative">
      <div
        class="flex items-center space-x-2 cursor-pointer"
        @click="toggleDropdown"
      >
        <div class="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
          <i class="fas fa-user"></i>
        </div>
        <span class="text-white font-semibold">
          {{ profile?.username || 'Loading...' }}
        </span>
      </div>

      <div
        v-if="showDropdown"
        class="absolute right-0 mt-2 w-40 bg-white rounded shadow-lg z-50"
      >
        <ul>
          <li
            @click="goToProfile"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            Profile
          </li>
          <li
            @click="goToHistory"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer"
          >
            History Prediksi
          </li>
          <li
            @click="logout"
            class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
          >
            Logout
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '@/lib/supabase'

const router = useRouter()
const showDropdown = ref(false)
const user = ref(null)
const profile = ref(null)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

onMounted(async () => {
  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userData?.user) {
    user.value = userData.user

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.value.id)
      .single()

    if (!profileError) {
      profile.value = profileData
    } else {
      console.error('Profile fetch error:', profileError)
    }
  } else {
    console.error('User not logged in:', userError)
  }
})

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}

const goToProfile = () => {
  router.push('/profile')
}

const goToHistory = () => {
  router.push('/history')
}
</script>
