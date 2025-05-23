<script setup>

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

let val = defineModel('val')

val.value = field.default ? field.default : value

const query = ref('')

const isEnabled = () => field.type === 'foreign' && options.type === 'default' ? true : false

/*
options = {
  type, ('object' || 'default' || 'array')
  store,
  primaryKey,
  displayKey,
}
*/

let collectionStore

if (isEnabled()) {
  collectionStore = useAppStore().init()[options.store]
  await callOnce(collectionStore.fetch)
}

const emit = defineEmits(['change'])

watch(val, () => {
  // console.log('emitting at foreign', { key: field.key, value: val.value })
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
{{query}}
    <Combobox as="div" v-model="val" @update:modelValue="query=''">
      <div class="relative mt-2">
        <ComboboxInput 
          class="w-full rounded-md border-0 bg-white py-1.5 pl-3 pr-12 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
          placeholder="Please make your selection"
        />
        <ComboboxButton class="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </ComboboxButton>

        <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          <ComboboxOption 
            v-for="(item, i) in collectionStore.rows.filter(r => {
              if (query == '') { return true }
              const name = r.name.toLowerCase()
              if (name.includes(query.toLowerCase())) {
                return true
              }
              return false
            })" 
            :key="item[options.primaryKey]" 
            :value="item[options.primaryKey]" 
            as="template" 
            v-slot="{ active, selected }"
          >
            <li :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900']">
              <div class="flex">
                <span :class="['truncate', selected && 'font-semibold']">
                  {{ item[options.displayKey] }}
                </span>
                <span :class="['ml-2 truncate text-gray-500', active ? 'text-indigo-200' : 'text-gray-500']">
                  {{ item[options.primaryKey] }}
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

  </div>

</template>