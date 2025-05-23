<script setup>

const { field, value } = defineProps(['field', 'value'])

let val = ref([''])

if (Array.isArray(value) && value.length > 0) {
  val.value = value
}

const isEnabled = () => field.type == 'array' ? true : false
// if (isEnabled()) { console.log({ val }) }

const emit = defineEmits(['change'])
const onChange = (event) => {
  // console.log('emitting at fieldarray', { key: field.key, value: val.value })
  emit('change', { 
    key: field.key, 
    value: val.value 
  })
}

watch(val, onChange)

const onRemove = (index) => {
  val.value = val.value.filter((val, i) => i !== index)
}

const onAdd = (index) => {
  if (val.value.length === index+1) {
    val.value.push('')
  } else {
    val.value = [ ...val.value.slice(0, index+1), '', ...val.value.slice(index+1) ]
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
    <div v-for="(item, index) in val" class="mt-2 rounded-md shadow-sm relative">

      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span class="text-gray-500 text-xs sm:text-xs">{{index+1}}</span>
      </div>
      <input 
        type="text"
        :disabled="field.disabled === true ? true : false" 
        v-model="val[index]"
        :id="field.key + '-field'" 
        @input="onChange"
        class="block w-full rounded-md border-0 py-1.5 pl-8 pr-32 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
        :placeholder="field.placeholder || 'Your input here...' " 
        :aria-describedby="field.key + '-hint'" />
      <div class="absolute inset-y-0 right-0 flex items-center">
        <button @click="onAdd(index)" type="button" class="rounded bg-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 px-2 py-1 mr-2">Add</button>
        <button @click="onRemove(index)" type="button" v-if="val.length > 1" class="rounded bg-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 px-2 py-1 mr-2">Remove</button>
      </div>
    </div>

    <p v-if="field.description" class="mt-2 pr-4 text-gray-600 text-xs italic">{{field.description}}</p>
  </div>

</template>