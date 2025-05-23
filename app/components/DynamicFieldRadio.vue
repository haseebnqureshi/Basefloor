<script setup>

const { field, value } = defineProps(['field', 'value'])

const options = field.options || {}

/*
options = {
  options: [
    { value: '', label: ''?, description: ''? },
  ]
}

*/
import { RadioGroup, RadioGroupOption } from '@headlessui/vue'

let val = defineModel('val')

const isEnabled = () => field.type === 'radio'

const emit = defineEmits(['change'])

if (isEnabled()) {
  const defaultValue = field.default ? field.default : ''
  val.value = value ? value : defaultValue

  watch(val, async () => {
    // console.log('emitting at radio', { key: field.key, value: val.value })
    emit('change', { 
      key: field.key, 
      value: val.value 
    })
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

    <fieldset class="mt-2">
      <RadioGroup v-model="val" class="-space-y-px rounded-md bg-white">
        <RadioGroupOption as="template" v-for="(option, index) in options.options" :key="index" :value="option.value || option" v-slot="{ active, checked }">
          <div :class="[index === 0 ? 'rounded-tl-md rounded-tr-md' : '', index === options.options.length - 1 ? 'rounded-bl-md rounded-br-md' : '', checked ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200', 'relative flex cursor-pointer border p-4 focus:outline-none']">
            <span :class="[checked ? 'border-transparent bg-indigo-600' : 'border-gray-300 bg-white', active ? 'ring-2 ring-indigo-600 ring-offset-2' : '', 'mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border']" aria-hidden="true">
              <span class="h-1.5 w-1.5 rounded-full bg-white" />
            </span>
            <span class="ml-3 flex flex-col">
              <span :class="[checked ? 'text-indigo-900' : 'text-gray-900', 'block text-sm font-medium']">{{ option.label || option }}</span>
              <span v-if="option.description" :class="[checked ? 'text-indigo-700' : 'text-gray-500', 'block text-sm']">{{ option.description }}</span>
            </span>
          </div>
        </RadioGroupOption>
      </RadioGroup>
    </fieldset>

    <p 
      v-if="field.hint"
      class="mt-2 text-sm text-gray-500" 
      :id="field.key + '-hint'">
      {{field.hint}}
    </p>

  </div>

</template>
