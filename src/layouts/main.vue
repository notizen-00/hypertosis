<template>
  <div class="flex flex-col min-h-screen">
    <AppHeader />

    <!-- Breadcrumb Section -->
    <div class="bg-gray-100 px-4 py-2 shadow-sm">
      <slot name="breadcrumb">
        <!-- Default breadcrumb (optional), bisa dikosongkan -->
        <nav class="text-sm text-blue-600">
          
        </nav>
      </slot>
    </div>

    <!-- Main content -->
    <main class="flex-grow px-4 py-6">
      <slot />
    </main>

    <AppContact />
  </div>
</template>

<script setup>
import AppHeader from '@/layouts/partials/app-header.vue'
import AppContact from '@/layouts/partials/app-footer.vue'
</script>
