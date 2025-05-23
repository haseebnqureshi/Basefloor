<script setup>

const { field, value } = defineProps(['field', 'value'])

let val = defineModel('val')

const isEnabled = () => field.type == 'email'

const emit = defineEmits(['change'])

let onChange = () => {}

if (isEnabled()) {
  let defaultValue = field.default ? field.default : ''
  val.value = value ? value : defaultValue
  val.value = val.value.toLowerCase()

  onChange = (event) => {
    // console.log('emitting at email', { key: field.key, value: val.value })
    val.value = val.value.toLowerCase()
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
    <div class="mt-2">
      <input 
        :type="field.type"
        :disabled="field.disabled === true ? true : false" 
        v-model="val"
        :id="field.key + '-field'" 
        @input="onChange"
        class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
        :placeholder="field.placeholder" 
        :aria-describedby="field.key + '-hint'" />
    </div>
    <p 
      v-if="field.hint"
      class="mt-2 text-sm text-gray-500" 
      :id="field.key + '-hint'">
      {{field.hint}}
    </p>
  </div>

</template>