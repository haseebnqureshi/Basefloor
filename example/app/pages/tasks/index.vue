<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">My Tasks</h1>
      <BasefloorButton @click="navigateTo('/tasks/new')">Add New Task</BasefloorButton>
    </div>
    
    <div v-if="isLoading" class="py-12 flex justify-center">
      <BasefloorLoader size="lg" />
    </div>
    
    <div v-else-if="tasks.length === 0" class="bg-white rounded-lg shadow p-6 text-center">
      <p class="text-gray-500 mb-4">You don't have any tasks yet.</p>
      <BasefloorButton @click="navigateTo('/tasks/new')">Create Your First Task</BasefloorButton>
    </div>
    
    <div v-else class="space-y-4">
      <BasefloorDataTable
        :data="tasks"
        :columns="columns"
        @row-click="viewTask"
      >
        <template #column-completed="{ row }">
          <BasefloorCheckbox
            :model-value="row.completed"
            @update:model-value="toggleTaskCompletion(row)"
            @click.stop
          />
        </template>
        
        <template #column-actions="{ row }">
          <div class="flex space-x-2" @click.stop>
            <BasefloorButton
              size="sm"
              variant="outline"
              @click="navigateTo(`/tasks/${row._id}/edit`)"
            >
              Edit
            </BasefloorButton>
            <BasefloorButton
              size="sm"
              variant="danger"
              @click="deleteTask(row._id)"
            >
              Delete
            </BasefloorButton>
          </div>
        </template>
      </BasefloorDataTable>
    </div>
  </div>
</template>

<script setup>
import { useTaskStore } from '~/stores/task';

const taskStore = useTaskStore();
const isLoading = ref(true);
const tasks = ref([]);

const columns = [
  { key: 'completed', label: 'Status', width: '60px' },
  { key: 'title', label: 'Task' },
  { key: 'dueDate', label: 'Due Date', formatter: (value) => value ? new Date(value).toLocaleDateString() : '-' },
  { key: 'actions', label: 'Actions', width: '150px' }
];

onMounted(async () => {
  try {
    tasks.value = await taskStore.fetchTasks();
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
  } finally {
    isLoading.value = false;
  }
});

function viewTask(task) {
  navigateTo(`/tasks/${task._id}`);
}

async function toggleTaskCompletion(task) {
  try {
    await taskStore.updateTask({
      ...task,
      completed: !task.completed
    });
    // Refresh the task list
    tasks.value = await taskStore.fetchTasks();
  } catch (error) {
    console.error('Failed to update task:', error);
  }
}

async function deleteTask(taskId) {
  if (!confirm('Are you sure you want to delete this task?')) return;
  
  try {
    await taskStore.deleteTask(taskId);
    // Refresh the task list
    tasks.value = await taskStore.fetchTasks();
  } catch (error) {
    console.error('Failed to delete task:', error);
  }
}
</script> 