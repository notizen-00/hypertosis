<template>
  <MainLayout>
      <template #breadcrumb>
      <nav class="text-sm text-blue-400">
        Homepage
      </nav>
    </template>

    <div>
        <Hero></Hero>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/main.vue'
import Hero from '@/components/Hero.vue'

const user = ref(null)
const router = useRouter()

onMounted(async () => {
  const { data } = await supabase.auth.getUser()
  user.value = data.user
})

const logout = async () => {
  await supabase.auth.signOut()
  router.push('/login')
}
</script>
