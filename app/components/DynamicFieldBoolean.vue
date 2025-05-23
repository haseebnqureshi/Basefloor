<script setup>

import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from '@headlessui/vue'

const { field, value } = defineProps(['field', 'value'])

let val = defineModel('val')

val.value = field.default ? field.default : value

const isEnabled = () => field.type === 'boolean' ? true : false

const emit = defineEmits(['change'])

watch(val, () => {
  // console.log('emitting at boolean', { key: field.key, value: val.value })
  emit('change', { 
    key: field.key, 
    value: val.value 
  })
})

</script>

<template>

  <div v-if="isEnabled()">
		  
	  <SwitchGroup as="div" class="flex items-center justify-between">
	    <span class="flex flex-grow flex-col">
	      <SwitchLabel as="span" class="text-sm font-medium leading-6 text-gray-900" passive>{{field.name}}</SwitchLabel>
	      <!-- <SwitchDescription as="span" class="text-sm text-gray-500"></SwitchDescription> -->
	    </span>

		  <Switch v-model="val" :class="[val ? 'bg-indigo-600' : 'bg-gray-200', 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2']">
		    <span class="sr-only">Use setting</span>
		    <span :class="[val ? 'translate-x-5' : 'translate-x-0', 'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out']">
		      <span :class="[val ? 'opacity-0 duration-100 ease-out' : 'opacity-100 duration-200 ease-in', 'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity']" aria-hidden="true">
		        <svg class="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 12 12">
		          <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
		        </svg>
		      </span>
		      <span :class="[val ? 'opacity-100 duration-200 ease-in' : 'opacity-0 duration-100 ease-out', 'absolute inset-0 flex h-full w-full items-center justify-center transition-opacity']" aria-hidden="true">
		        <svg class="h-3 w-3 text-indigo-600" fill="currentColor" viewBox="0 0 12 12">
		          <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
		        </svg>
		      </span>
		    </span>
		  </Switch>
	  </SwitchGroup>

  </div>

</template>