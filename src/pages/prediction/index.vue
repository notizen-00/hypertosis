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
            <button v-if="!isLoading" @click="predict" class="btn">🧠 PREDICT</button>
            <div v-else class="text-sm text-gray-500 flex items-center gap-2">
              <svg class="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
              </svg>
              Memproses prediksi...
            </div>
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
import MainLayout from '@/layouts/main.vue';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref(false);

const inputImage = ref(null);
const inputImageBase64 = ref(null);
const resultImage = ref(null);
const fileInput = ref(null);
const user = ref(null);
const hasil = ref(null);

onMounted(async () => {
  const { data } = await supabase.auth.getUser();
  user.value = data.user;
  console.log(user.value?.id);
});

function openImage() {
  fileInput.value.click();
}

function onFileChange(event) {
  const file = event.target.files[0];
  if (file) {
    inputImage.value = URL.createObjectURL(file);
    resultImage.value = null;

    const reader = new FileReader();
    reader.onload = () => {
      inputImageBase64.value = reader.result;
    };
    reader.readAsDataURL(file);
  }
}

function resetImage() {
  inputImage.value = null;
  resultImage.value = null;
  inputImageBase64.value = null;
}

async function predict() {
  if (!fileInput.value.files.length) {
    alert('Silakan pilih gambar terlebih dahulu.');
    return;
  }

  const file = fileInput.value.files[0];
  const formData = new FormData();
  formData.append('file', file);

  isLoading.value = true;

  try {
    const response = await fetch('https://baa2d25241c3.ngrok-free.app/predict', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();

    hasil.value = result?.hasil?.[0] || 'Tidak diketahui';

    if (result.result_image) {
      resultImage.value = `data:image/png;base64,${result.result_image}`;
    } else {
      alert('Gambar hasil tidak tersedia dari server.');
      resultImage.value = null;
    }
  } catch (error) {
    console.error('Error during prediction:', error);
    alert('Gagal melakukan prediksi!');
  } finally {
    isLoading.value = false;
  }
}

function base64ToBlob(base64Data) {
  const parts = base64Data.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const binary = atob(parts[1]);
  const array = [];
  for (let i = 0; i < binary.length; i++) {
    array.push(binary.charCodeAt(i));
  }
  return new Blob([new Uint8Array(array)], { type: mime });
}

async function uploadImageToSupabase(base64Image, user) {
  if (!base64Image || !base64Image.startsWith('data:image/')) {
    alert('Base64 gambar tidak valid!');
    return null;
  }

  if (!user?.id) {
    alert('User tidak valid atau belum login');
    return null;
  }

  const mimeMatch = base64Image.match(/^data:(image\/[^;]+);base64,/);
  if (!mimeMatch) {
    alert('Format base64 tidak dikenali');
    return null;
  }

  const mimeType = mimeMatch[1];
  const extension = mimeType.split('/')[1];
  const blob = base64ToBlob(base64Image);
  const fileName = `${user.id}/${uuidv4()}.${extension}`;

  const { data, error } = await supabase.storage
    .from('mri-images')
    .upload(fileName, blob, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error.message);
    alert('Gagal upload ke storage: ' + error.message);
    return null;
  }

  const { publicUrl } = supabase.storage
    .from('mri-images')
    .getPublicUrl(fileName).data;

  return publicUrl;
}

async function saveToHistory(user) {
  if (!resultImage.value || !inputImageBase64.value) {
    alert('Tidak ada gambar hasil atau gambar input!');
    return;
  }

  try {
    const imageUrl = await uploadImageToSupabase(resultImage.value, user);
    const oriUrl = await uploadImageToSupabase(inputImageBase64.value, user);

    const { error } = await supabase.from('mri_history').insert([
      {
        tanggal: new Date().toISOString().split('T')[0],
        mri_image: imageUrl,
        mri_ori: oriUrl,
        hasil: hasil.value,
        keterangan: 'Sesuai model prediksi',
        user_id: (await supabase.auth.getUser()).data?.user?.id ?? null,
      },
    ]);

    if (error) {
      console.error('Gagal simpan:', error);
      alert('Gagal menyimpan data ke history!');
    } else {
      alert('Data berhasil disimpan ke history.');
      router.push('/history');
    }
  } catch (e) {
    console.error(e);
    alert('Terjadi kesalahan saat upload!');
  }
}

function saveToPC() {
  if (!resultImage.value) return;
  const link = document.createElement('a');
  link.href = resultImage.value;
  link.download = 'predict_result.png';
  link.click();
}
</script>
