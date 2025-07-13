<template>
  <MainLayout>
    <template #breadcrumb>
      <nav class="text-sm text-blue-400">
        <a href="/">Homepage</a> / <span class="text-black">History</span>
      </nav>
    </template>

    <div class="px-6 py-8 bg-white text-gray-800">
      <h1 class="text-2xl font-bold mb-6 text-center">
        Riwayat Deteksi Hyperostosis Meningioma
      </h1>

      <!-- Filter -->
      <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="🔍 Cari hasil atau keterangan..."
          class="border px-4 py-2 rounded-md w-full md:w-1/3"
        />
        <input
          v-model="filterDate"
          type="date"
          class="border px-4 py-2 rounded-md w-full md:w-1/4"
        />
        <button @click="resetFilter" class="bg-gray-100 border px-4 py-2 rounded hover:bg-gray-200">
          🔄 Reset
        </button>
       <router-link
  to="/predict"
  class="bg-blue-500 border text-white px-4 py-2 rounded hover:bg-blue-800 inline-flex items-center gap-2"
>
  <i class="fas fa-search"></i>
  Predict
</router-link>

      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full table-auto border border-gray-400 rounded overflow-hidden">
          <thead class="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th class="border px-4 py-2 text-center">No</th>
              <th class="border px-4 py-2 text-center">Tanggal</th>
              <th class="border px-4 py-2 text-center">Citra MRI</th>
              <th class="border px-4 py-2 text-center">Hasil Deteksi</th>
              <th class="border px-4 py-2 text-center">Keterangan</th>
              <th class="border px-4 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in filteredHistory"
              :key="item.id"
              class="hover:bg-gray-50 transition"
            >
              <td class="border px-4 py-2 text-center">{{ index + 1 }}</td>
              <td class="border px-4 py-2 text-center">{{ item.tanggal }}</td>
              <td class="border px-4 py-2 text-center">
               <img
  :src="item.mri_image"
  @click="openModal(item.mri_image)"
  alt="MRI"
  class="w-24 h-24 object-contain mx-auto cursor-pointer hover:scale-105 transition"
/>

              </td>
              <td class="border px-4 py-2 text-center">{{ item.hasil == 'Hypertosis' || item.hasil == 'Meningioma' ? 'Hypertosis' :'Tanpa Hypertosis' }}</td>
              <td class="border px-4 py-2 text-center">{{ item.keterangan }}</td>
              <td class="border px-4 py-2 text-center">
                <button
                  @click="deleteItem(item.id)"
                  class="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
                >
                  ❌ Hapus
                </button>
              </td>
            </tr>
            <tr v-if="filteredHistory.length === 0">

           <td colspan="6" class="text-center py-6 text-gray-400">
  <div class="flex flex-col items-center justify-center gap-3">
    <img src="/src/assets/no-data.gif" class="w-32" alt="No Data" />
    <div class="text-sm font-medium text-gray-500">Data tidak ditemukan</div>
    <router-link to="/predict">
      <button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow cursor-pointer">
        🚀 Start Predict
      </button>
    </router-link>
  </div>
</td>

            </tr>
          </tbody>
        </table>
        <!-- Modal Popup -->
<div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
  <div class="bg-white p-4 rounded-lg shadow-lg relative max-w-3xl w-full">
    <button @click="closeModal" class="absolute top-2 right-2 text-gray-600 hover:text-black text-lg font-bold">❌</button>
    <h2 class="text-lg font-semibold mb-2 text-center">Detail Gambar MRI</h2>
    <img :src="modalImageUrl" class="max-h-[80vh] mx-auto object-contain" />
  </div>
</div>

      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/layouts/main.vue'
import { supabase } from '@/lib/supabase'

const historyList = ref([])
const searchQuery = ref('')
const filterDate = ref('')

const showModal = ref(false)
const modalImageUrl = ref(null)

function openModal(imageUrl) {
  modalImageUrl.value = imageUrl
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  modalImageUrl.value = null
}

async function fetchHistory() {
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user?.id) {
    alert('Anda belum login')
    return
  }

  const { data, error } = await supabase
    .from('mri_history')
    .select('*')
    .eq('user_id', user.user.id)
    .order('tanggal', { ascending: false })

  if (error) {
    console.error('Gagal mengambil data history:', error)
    alert('Terjadi kesalahan saat mengambil data.')
    return
  }

  historyList.value = data
}


const filteredHistory = computed(() => {
  return historyList.value.filter(item => {
    const cocokTanggal = !filterDate.value || item.tanggal === filterDate.value
    const cocokText =
      !searchQuery.value ||
      item.hasil.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.keterangan.toLowerCase().includes(searchQuery.value.toLowerCase())
    return cocokTanggal && cocokText
  })
})

function resetFilter() {
  searchQuery.value = ''
  filterDate.value = ''
}

async function deleteItem(id) {
  const konfirmasi = confirm('Yakin ingin menghapus data ini?')
  if (!konfirmasi) return

  const { error } = await supabase.from('mri_history').delete().eq('id', id)

  if (error) {
    alert('Gagal menghapus data')
    console.error(error)
  } else {
    historyList.value = historyList.value.filter(item => item.id !== id)
    alert('Data berhasil dihapus')
  }
}

onMounted(() => {
  fetchHistory()
})
</script>
