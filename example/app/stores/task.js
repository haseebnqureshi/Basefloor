import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchTasks() {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        const { $config } = useRuntimeConfig();
        
        const response = await fetch(`${$config.public.apiUrl}/my-tasks`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch tasks');
        }
        
        this.tasks = data.data;
        return this.tasks;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchTask(taskId) {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        const { $config } = useRuntimeConfig();
        
        const response = await fetch(`${$config.public.apiUrl}/tasks/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch task');
        }
        
        return data.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async createTask(taskData) {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        const { $config } = useRuntimeConfig();
        
        const response = await fetch(`${$config.public.apiUrl}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify(taskData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to create task');
        }
        
        this.tasks.push(data.data);
        return data.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateTask(taskData) {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        const { $config } = useRuntimeConfig();
        
        const response = await fetch(`${$config.public.apiUrl}/tasks/${taskData._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authStore.token}`
          },
          body: JSON.stringify(taskData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to update task');
        }
        
        // Update task in the array
        const index = this.tasks.findIndex(task => task._id === taskData._id);
        if (index !== -1) {
          this.tasks[index] = data.data;
        }
        
        return data.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteTask(taskId) {
      this.loading = true;
      this.error = null;
      
      try {
        const authStore = useAuthStore();
        const { $config } = useRuntimeConfig();
        
        const response = await fetch(`${$config.public.apiUrl}/tasks/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to delete task');
        }
        
        // Remove task from the array
        this.tasks = this.tasks.filter(task => task._id !== taskId);
        
        return true;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
}); 