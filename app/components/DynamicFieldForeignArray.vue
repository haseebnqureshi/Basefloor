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
const options = field.options || {}

let v = ref([''])
if (Array.isArray(value) && value.length > 0) {
  v.value = value
}

const isEnabled = () => (field.type === 'foreign' && options.type === 'array') ? true : false

let rows = ref([])

const queries = ref([])

let appStore

if (isEnabled()) {
  appStore = useAppStore()
  await options.fetch(appStore)
  rows.value = options.rows(appStore).map(r => {
    queries.value.push('')
    r.label = options.label(r, appStore)
    r.query = r.label.toLowerCase()
    return r
  })

  v.value = v.value.map(id => {
    return options.rows(appStore).find(r => {
      return options.value(r, appStore) == id
    })
  })
}

const onRemove = (index) => {
  v.value = v.value.filter((val, i) => i !== index)
}

const onAdd = (index) => {
  if (v.value.length === index+1) {
    v.value = [ ...v.value, '']
  } else {
    v.value = [ ...v.value.slice(0, index+1), '', ...v.value.slice(index+1) ]
  }
}

const emit = defineEmits(['change'])

const onChange = () => {
  // console.log('emitting at foreignarray', { key: field.key, value: v.value })
  emit('change', { 
    key: field.key, 
    value: Object.values(v.value).map(item => options.value(item, appStore)) 
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

    <div v-for="(item, index) in v" class="mt-2 rounded-md shadow-sm relative">

      <div class="z-10 pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span class="text-gray-500 text-xs sm:text-xs">{{index+1}}</span>
      </div>

      <Combobox as="div" v-model="v[index]" @update:modelValue="queries[index]">
        <div class="relative mt-2">
          <ComboboxInput 
            class="w-full rounded-md border-0 bg-white py-1.5 pl-8 pr-32 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
            placeholder="Please make your selection"
            @change="queries[index] = $event.target.value"
            @blur="() => {
              queries[index] = ''
              onChange()
            }"  
            :display-value="(item) => item.label"
          />
          <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </ComboboxButton>

          <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            <ComboboxOption 
              v-for="(item, i) in rows.filter(r => {
                const q = queries[index]
                if (q == '') { return true }
                if (r.query.includes(q.toLowerCase())) { 
                  return true 
                }
                return false
              })" 
              :key="options.value(item, appStore)" 
              :value="item" 
              as="template" 
              v-slot="{ active, selected }"

            >
              <li :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900']">
                <div class="flex">
                  <span :class="['truncate', selected && 'font-semibold']">
                    {{ options.label(item, appStore) }}
                  </span>
                  <span :class="['ml-2 truncate text-gray-500', active ? 'text-indigo-200' : 'text-gray-500']">
                    {{ options.value(item, appStore) }}
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

      <div class="absolute inset-y-0 right-6 flex items-center">
        <button @click="onAdd(index)" type="button" class="rounded bg-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 px-2 py-1 mr-2">Add</button>
        <button @click="onRemove(index)" type="button" v-if="v.length > 1" class="rounded bg-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 px-2 py-1 mr-2">Remove</button>
      </div>

    </div>

    <p v-if="field.description" class="mt-2 pr-4 text-gray-600 text-xs italic">{{field.description}}</p>

  </div>

</template>