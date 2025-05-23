<script setup>

const { field, value } = defineProps(['field', 'value'])

const options = field.options || {}

let val = defineModel('val')

val.value = field.default ? field.default : value

const editingDisabled = field.disabled ? true : false

const isEnabled = () => field.type === 'code' ? true : false

const emit = defineEmits(['change'])

watch(val, () => {
  // console.log('emitting at code', { key: field.key, value: val.value })
  emit('change', { 
    key: field.key, 
    value: val.value 
  })
})

</script>

<template>

  <div v-if="isEnabled()">

    <label 
      :for="field.key + '-field'" 
      class="block text-sm font-medium leading-6 text-gray-900">
      {{field.name}}
    </label>
    <div class="mt-2 monaco-editor-container rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600">

	  	<MonacoEditor
	  		v-model="val" 
	  		:lang="options.language" 
	  		:options="{
	  			theme: 'vs-light',  
	  			minimap: {
	  				enabled: false,
	  			},
	  			readOnly: editingDisabled,
	  		}" 
	  	/>
	  </div>
  </div>

</template>