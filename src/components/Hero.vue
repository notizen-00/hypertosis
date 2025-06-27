<template>
  <section class="flex flex-col lg:flex-row items-center justify-between h-full px-6 py-12 bg-white">
    <div class="lg:w-1/2 space-y-4">
      <h1 class="text-6xl font-bold text-blue-800">Welcome to</h1>
      <h2 class="text-4xl font-extrabold">HYPEROSTOSIS MENINGIOMA IDENTIFIER</h2>
      <p class="text-gray-900 text-2xl font-light">
        Easily detect hyperostosis meningioma from brain MRI scans with our smart, web-based tool.
      </p>
      <router-link
        to="/predict"
        class="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        <i class="fas fa-search mr-2"></i> Start to Predict
      </router-link>
    </div>
    <div class="lg:w-1/2 mt-8 lg:mt-0">
      <img src="/src/assets/ct-scan.gif" alt="MRI" class="w-full max-w-lg mx-auto" />
    </div>
  </section>
</template>
