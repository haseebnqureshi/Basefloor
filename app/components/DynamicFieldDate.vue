<script setup>

import { vMaska } from 'maska/vue'

const { field, value } = defineProps(['field', 'value'])

let val = defineModel('val')

let displayValue = ref('')

const dateToDisplay = () => {
  displayValue = new Date(val.value).toLocaleDateString('en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const isEnabled = () => field.type == 'date'

const emit = defineEmits(['change'])

let onChange = () => {}

if (isEnabled()) {
  const defaultValue = field.default ? field.default : ''
  if (value) {
    const d = new Date(value)

  }

  val.value = value ? value : defaultValue

  onChange = (event) => {
    // console.log('emitting at date', { key: field.key, value: val.value })
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

      <input 
        type="text"
        :disabled="field.disabled === true ? true : false" 
        v-model="val"
        :id="field.key + '-field'" 
        @keyup="onChange"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
        v-maska="'##/##/####'"
        placeholder="MM/DD/YYYY"
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