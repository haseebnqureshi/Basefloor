<template>
  <div>
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-xl font-bold text-gray-900">Basefloor Example</h1>
          <nav class="flex space-x-4">
            <NuxtLink to="/" class="text-gray-600 hover:text-gray-900">Home</NuxtLink>
            <NuxtLink to="/tasks" class="text-gray-600 hover:text-gray-900">Tasks</NuxtLink>
            <NuxtLink to="/profile" class="text-gray-600 hover:text-gray-900">Profile</NuxtLink>
            <button @click="logout" v-if="isLoggedIn" class="text-gray-600 hover:text-gray-900">Logout</button>
          </nav>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);

function logout() {
  authStore.logout();
  navigateTo('/login');
}
</script> 