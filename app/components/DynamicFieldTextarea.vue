<script setup>

const { field, value } = defineProps(['field', 'value'])

let val = defineModel('val')

val.value = field.default ? field.default : value

const emit = defineEmits(['change'])
const onChange = (event) => {
  // console.log('emitting at textarea', { key: field.key, value: val.value })
  emit('change', { 
    key: field.key, 
    value: val.value 
  })
}

</script>

<template>

  <div v-if="field.type === 'textarea' ? true : false">
    <label 
      :for="field.key + '-field'" 
      class="block text-sm font-medium leading-6 text-gray-900">
      {{field.name}}
    </label>
    <div class="mt-2">
      <textarea 
        rows="4" 
        :disabled="field.disabled === true ? true : false" 
        :name="field.key"
        v-model="val"
        :id="field.key + '-field'" 
        @input="onChange"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
    </div>
    <p v-if="field.description" class="mt-2 pr-4 text-gray-600 text-xs italic">{{field.description}}</p>
  </div>

</template>