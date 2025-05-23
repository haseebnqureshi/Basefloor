<script setup>

const { field, value } = defineProps(['field', 'value'])

const options = field.options || {}

let val = defineModel('val')

val.value = field.default ? field.default : value

const emit = defineEmits(['change'])
const onChange = (event) => {
  // console.log('emitting at dropdown', { key: field.key, value: val.value })
  emit('change', { 
    key: field.key, 
    value: val.value 
  })
}

</script>

<template>

  <div v-if="field.type === 'dropdownsimple' ? true : false">
    <label 
      :for="field.key + '-field'" 
      class="block text-sm font-medium leading-6 text-gray-900">
      {{field.name}}
    </label>
    <select 
      :id="field.key + '-field'" 
      :disabled="field.disabled === true ? true : false" 
      v-model="val"
      @input="onChange"
      class="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6">
      <option value="">Select...</option>
      <option v-for="option in options.options">{{option}}</option>
    </select>
  </div>

</template>