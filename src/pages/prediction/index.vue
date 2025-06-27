<template>
  <MainLayout>
    <template #breadcrumb>
      <nav class="text-sm text-blue-400">
        <a href="/">Homepage</a> / <span class="text-black">Prediction</span>
      </nav>
    </template>

    <div class="px-6 py-8 bg-white text-gray-800">
      <!-- Header -->
      <div class="mb-6">
        <h1 class="text-2xl font-extrabold text-gray-900 text-center">
          HYPEROSTOSIS MENINGIOMA IDENTIFIER
        </h1>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Citra Input -->
        <div class="flex flex-col items-center">
          <h2 class="mb-2 font-medium">Citra Input</h2>
          <div class="border w-64 h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
            <span v-if="!inputImage">No Image</span>
            <img v-else :src="inputImage" alt="Input" class="object-contain h-full" />
          </div>

          <div class="mt-4 flex flex-col gap-2 w-full items-center">
            <button @click="openImage" class="btn">📂 OPEN IMAGE</button>
            <button @click="resetImage" class="btn">🔄 RESET IMAGE</button>
          </div>
        </div>

        <!-- Hasil Segmentasi -->
        <div class="flex flex-col items-center">
          <h2 class="mb-2 font-medium">Hasil Segmentasi</h2>
          <div class="border w-64 h-64 bg-gray-100 flex items-center justify-center overflow-hidden">
            <span v-if="!resultImage">No Result</span>
            <img v-else :src="resultImage" alt="Segmented" class="object-contain h-full" />
          </div>

          <div class="mt-4 flex flex-col gap-2 w-full items-center">
            <button @click="predict" class="btn">🧠 PREDICT</button>
            <button @click="saveToHistory(user)" class="btn">💾 SAVE TO HISTORY</button>
          </div>
        </div>
      </div>

      <!-- Save to PC -->
      <div class="mt-6 flex justify-center">
        <button @click="saveToPC" class="btn px-8">⬇️ SAVE TO PC</button>
      </div>

      <input type="file" ref="fileInput" class="hidden" @change="onFileChange" />
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MainLayout from '@/layouts/main.vue'
import { v4 as uuidv4 } from 'uuid'
import { supabase } from '@/lib/supabase' 
import { useRouter } from 'vue-router' 
const router = useRouter()

const inputImage = ref(null)
const resultImage = ref(null)
const fileInput = ref(null)
const user = ref(null)
const hasil = ref(null)
onMounted(async()=>  {
  const { data } = await supabase.auth.getUser()
  user.value = data.user
  console.log(user.value.id)
})
function openImage() {
  fileInput.value.click()
}

function onFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    inputImage.value = URL.createObjectURL(file)
    resultImage.value = null
  }
}

function resetImage() {
  inputImage.value = null
  resultImage.value = null
}

function predict() {
  if (!inputImage.value) return

  const predictions = [
    'Hyperostosis',
    'Meningioma',
    'Normal',
    'Kalsifikasi',
    'Lesi Tulang'
  ]
  const randomResult = predictions[Math.floor(Math.random() * predictions.length)]
  hasil.value = randomResult;
  const img = new Image()
  img.crossOrigin = 'anonymous'

  img.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height

    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    const text = `Hasil Prediksi: ${randomResult}`
    const padding = 20

    ctx.font = 'bold 24px Arial'
    const textWidth = ctx.measureText(text).width
    const textHeight = 32

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(10, 10, textWidth + padding, textHeight + 10)

    ctx.fillStyle = 'white'
    ctx.fillText(text, 15, 36)

    resultImage.value = canvas.toDataURL('image/png')
  }

  img.src = inputImage.value
}


function base64ToBlob(base64Data) {
  const parts = base64Data.split(',')
  const mime = parts[0].match(/:(.*?);/)[1]
  const binary = atob(parts[1])
  const array = []
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i))
  }
  return new Blob([new Uint8Array(array)], { type: mime })
}

async function uploadImageToSupabase(base64Image, user) {
  if (!base64Image || !base64Image.startsWith('data:image/')) {
    alert('Base64 gambar tidak valid!')
    return null
  }

  if (!user?.id) {
    alert('User tidak valid atau belum login')
    return null
  }

  const mimeMatch = base64Image.match(/^data:(image\/[a-zA-Z]+);base64,/)
  if (!mimeMatch) {
    alert('Format base64 tidak dikenali')
    return null
  }

  const mimeType = mimeMatch[1]                    
  const extension = mimeType.split('/')[1]          
  const blob = base64ToBlob(base64Image)

  const fileName = `${user.id}/${uuidv4()}.${extension}`

  console.log('Uploading:', fileName, 'size:', blob.size, 'type:', mimeType)

  const { data, error } = await supabase.storage
    .from('mri-images') 
    .upload(fileName, blob, {
      contentType: mimeType,
      upsert: false
    })

  if (error) {
    console.error('Upload error:', error.message)
    alert('Gagal upload ke storage: ' + error.message)
    return null
  }

  const { publicUrl } = supabase.storage
    .from('mri-images')
    .getPublicUrl(fileName).data

  return publicUrl
}



async function saveToHistory(user) {
  if (!resultImage.value) {
    alert('Tidak ada gambar yang diprediksi!')
    return
  }

  try {
    const imageUrl = await uploadImageToSupabase(resultImage.value,user)
    const { error } = await supabase.from('mri_history').insert([
      {
        tanggal: new Date().toISOString().split('T')[0],
        mri_image: imageUrl,
        hasil: hasil.value,
        keterangan: 'Sesuai model prediksi',
        user_id: (await supabase.auth.getUser()).data?.user?.id ?? null,
      },
    ])

    if (error) {
      console.error('Gagal simpan:', error)
      alert('Gagal menyimpan data ke history!')
    } else {
      alert('Data berhasil disimpan ke history.')
      router.push('/history')
    }
  } catch (e) {
    console.error(e)
    alert('Terjadi kesalahan saat upload!')
  }
}

function saveToPC() {
  if (!resultImage.value) return
  const link = document.createElement('a')
  link.href = resultImage.value
  link.download = 'predict_result.png'
  link.click()
}
</script>

