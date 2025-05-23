<script setup>

import { vMaska } from 'maska/vue'

const { field, value } = defineProps(['field', 'value'])

let val = defineModel('val')

const isEnabled = () => field.type == 'phone'

const emit = defineEmits(['change'])

let onChange = () => {}

if (isEnabled()) {
  const defaultValue = field.default ? field.default : ''
  val.value = value ? value : defaultValue

  onChange = (event) => {
    // console.log('emitting at phone', { key: field.key, value: val.value })
    emit('change', { 
      key: field.key, 
      value: val.value 
    })
  }
}


</script>

<template>

  <div v-if="isEnabled()">
    <label 
      :for="field.key + '-field'" 
      class="block text-sm font-medium leading-6 text-gray-900">
      {{field.name}}
    </label>
    <div class="relative mt-2 rounded-md shadow-sm">
    	<div class="absolute inset-y-0 left-0 flex items-center">
	    	<select id="country" name="country" autocomplete="country" class="h-full rounded-md border-0 bg-transparent py-0 pl-3 pr-7 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm">
	    		<option>US</option>
	    	</select>
    	</div>

      <input 
        :type="field.type"
        :disabled="field.disabled === true ? true : false" 
        v-model="val"
        :id="field.key + '-field'" 
        @keyup="onChange"
        class="block w-full rounded-md border-0 py-1.5 pl-16 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
        v-maska="'(###) ###-####'"
        :aria-describedby="field.key + '-hint'" 
      />

    </div>
    <p 
      v-if="field.hint"
      class="mt-2 text-sm text-gray-500" 
      :id="field.key + '-hint'">
      {{field.hint}}
    </p>
  </div>

</template>

<style scoped>
input:invalid {
	border: dashed 1px #0035ff;
}

</style>