<template>
  <div class="max-w-md mx-auto">
    <h1 class="text-3xl font-bold mb-6">Login</h1>
    
    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <BasefloorInput
          v-model="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          required
        />
      </div>
      
      <div>
        <BasefloorInput
          v-model="password"
          label="Password"
          type="password"
          placeholder="********"
          required
        />
      </div>
      
      <div class="flex items-center justify-between">
        <BasefloorCheckbox v-model="rememberMe" label="Remember me" />
        <a href="#" class="text-sm text-blue-600 hover:underline">Forgot password?</a>
      </div>
      
      <div>
        <BasefloorButton type="submit" class="w-full" :loading="isLoading">
          Login
        </BasefloorButton>
      </div>
      
      <div v-if="error" class="bg-red-50 p-4 rounded text-red-600 text-sm">
        {{ error }}
      </div>
    </form>
    
    <div class="mt-8 text-center">
      <p>Don't have an account? <NuxtLink to="/register" class="text-blue-600 hover:underline">Register</NuxtLink></p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const isLoading = ref(false);
const error = ref('');

async function handleLogin() {
  isLoading.value = true;
  error.value = '';
  
  try {
    await authStore.login(email.value, password.value);
    router.push('/tasks');
  } catch (e) {
    error.value = e.message || 'Failed to login. Please check your credentials.';
  } finally {
    isLoading.value = false;
  }
}
</script> 