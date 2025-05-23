<script setup>

const { field, value } = defineProps(['field', 'value'])

let val = defineModel('val')

val.value = field.default ? field.default : value

const isEnabled = () => {
	switch (field.type) {
	  case 'text':
	  case 'password':
	  case 'number':
	  // case 'url':
	  case 'month':
	  case 'week':
	  case 'time':
	  case 'search':
	    return true
	    break
	   default:
	   	return false
	}
}

const emit = defineEmits(['change'])
const onChange = (event) => {
  // console.log('emitting at text', { key: field.key, value: val.value })
  emit('change', { 
    key: field.key, 
    value: val.value 
  })
}

</script>

<template>

  <div v-if="isEnabled()">

    <label 
      :for="field.key + '-field'" 
      class="block text-sm font-medium leading-6 text-gray-900">
      {{field.name}}
    </label>
    <div class="mt-2">
      <input 
        :type="field.type"
        :disabled="field.disabled === true ? true : false" 
        :name="field.key" 
        v-model="val"
        :id="field.key + '-field'" 
        @input="onChange"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
        :placeholder="field.placeholder" 
        :aria-describedby="field.key + '-hint'" />
    </div>
    <p 
      v-if="field.description"
      class="mt-2 text-xs text-gray-600 italic" 
      :id="field.key + '-hint'">
      {{field.description}}
    </p>
  </div>

</template>