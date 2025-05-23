<script setup>

//@TODO: fully test (not write, but test) change emit logic

import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/20/solid'
import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxLabel,
  ComboboxOption,
  ComboboxOptions,
} from '@headlessui/vue'


const { field, value } = defineProps(['field', 'value'])
const emit = defineEmits(['change'])

const options = field.options || {}

/*
options.rows = []
options.title = row => row.name
options.subtitle = row => row._id
options.value = row => row (or row => row._id)
*/

const isEnabled = () => (field.type === 'dropdown') ? true : false

let v = ref(value)
let rows = ref([])
const query = ref('')

if (isEnabled()) {
  rows.value = [...options.rows]
}

const onChange = () => {
  // console.log('emitting at dropdown', { key: field.key, value: v.value })
  emit('change', { 
    key: field.key, 
    value: v.value, 
  })
}

watch(v, onChange)

</script>

<template>

  <div v-if="isEnabled()">

    <label 
      :for="field.key + '-field'" 
      class="block text-sm font-medium leading-6 text-gray-900">
      {{field.name}}
    </label>

    <Combobox as="div" v-model="v" @update:modelValue="query">
      <div class="relative mt-2">
        <ComboboxInput 
          class="w-full rounded-md border-0 bg-white py-1.5 pl-4 pr-32 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
          placeholder="Please make your selection"
          @change="query = $event.target.value"
          @blur="() => {
            query = ''
            onChange()
          }"  
          :display-value="(row) => `${options.title(row)} (${options.subtitle(row)})`"
        />
        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>

        <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <ComboboxOption 
            v-for="(row, i) in rows.filter(r => {
              const titleValue = options.title(r)
              const title = titleValue ? titleValue.toLowerCase() : ''
              if (query == '') { return true }
              if (title.includes(query.toLowerCase())) { 
                return true 
              }
              return false
            })" 
            :key="i" 
            :value="options.value(row)" 
            as="template" 
            v-slot="{ active, selected }"

          >
            <li :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900']">
              <div class="flex">
                <span :class="['truncate', selected && 'font-semibold']">
                  {{ options.title(row) }}
                </span>
                <span :class="['ml-2 truncate text-gray-500', active ? 'text-indigo-200' : 'text-gray-500']">
                  {{ options.subtitle(row) }}
                </span>
              </div>

              <span v-if="selected" :class="['absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-indigo-600']">
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>

            </li>
          </ComboboxOption>
        </ComboboxOptions>
      </div>
    </Combobox>

    <p v-if="field.description" class="mt-2 pr-4 text-gray-600 text-xs italic">{{field.description}}</p>

  </div>

</template>