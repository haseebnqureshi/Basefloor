<template>
  <div>
    <h1 class="text-3xl font-bold">Welcome to Basefloor Example</h1>
    
    <div v-if="!isLoggedIn" class="mt-8">
      <p class="mb-4">Please login to access your tasks.</p>
      <div class="flex space-x-4">
        <BasefloorButton @click="navigateTo('/login')">Login</BasefloorButton>
        <BasefloorButton @click="navigateTo('/register')" variant="outline">Register</BasefloorButton>
      </div>
    </div>
    
    <div v-else class="mt-8">
      <p class="mb-4">You are logged in. Go to your tasks to manage them.</p>
      <BasefloorButton @click="navigateTo('/tasks')">View Tasks</BasefloorButton>
    </div>
    
    <div class="mt-12">
      <h2 class="text-xl font-semibold mb-4">Features</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <BasefloorCard title="Authentication">
          <template #content>
            Complete user authentication system with register, login, and profile management.
          </template>
        </BasefloorCard>
        
        <BasefloorCard title="Task Management">
          <template #content>
            Create, edit, and manage your tasks with due dates and completion status.
          </template>
        </BasefloorCard>
        
        <BasefloorCard title="Beautiful UI">
          <template #content>
            Modern, responsive design built with Tailwind CSS and Basefloor components.
          </template>
        </BasefloorCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const isLoggedIn = computed(() => authStore.isLoggedIn);
</script> 