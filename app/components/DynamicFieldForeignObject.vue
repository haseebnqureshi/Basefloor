<script setup>

// import { reactive, watch } from 'vue'

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

const isEnabled = () => field.type === 'foreign' && options.type === 'object' ? true : false


/*
options = {
  type, ('object' || 'default' || 'array')
  store,
  primaryKey,
  displayKey,
}
*/

let values = reactive([''])
let keys = reactive([''])
let collectionStore

if (isEnabled()) {
  collectionStore = useAppStore().init()[options.store]
  await callOnce(collectionStore.fetch)

  if (typeof val.value == 'object' && val.value != null && val.value != '') {
    if (Object.keys(val.value).length > 0) {
      keys = reactive(Object.keys(val.value))
      values = reactive(Object.values(val.value))
    }
  }
}

const emit = defineEmits(['change'])

const updateVal = () => {
  let obj = {}
  for (let i in keys) {
    const key = keys[i]
    const value = values[i]
    obj[key] = value
  }
  val.value = obj

  // console.log('emitting at foreignobject', { key: field.key, value: val.value })
  emit('change', { 
    key: field.key, 
    value: val.value 
  })
}

watch([keys, values], updateVal)

const onRemove = (index) => {
  keys.splice(index,1)
  values.splice(index,1)
}

const onAdd = (index) => {
  keys.splice(index+1,0,'')
  values.splice(index+1,0,'')
}

</script>

<template>

  <div v-if="isEnabled()">

    <label 
      :for="field.key + '-field'" 
      class="block text-sm font-medium leading-6 text-gray-900">
      {{field.name}}
    </label>

    <fieldset v-for="(item, index) in values">
      <div class="mt-2 -space-y-px rounded-md bg-white shadow-sm">
        <div class="relative">
          <input 
            type="text" 
            v-model="keys[index]"
            class="relative block w-full rounded-none rounded-t-md border-0 bg-transparent py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
            placeholder="Please enter name" 
          />

          <div class="absolute inset-y-0 right-0 z-20 flex items-center">
            <button @click="onAdd(index)" type="button" class="rounded bg-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 px-2 py-1 mr-2">Add</button>
            <button @click="onRemove(index)" type="button" v-if="values.length > 1" class="rounded bg-white text-xs font-semibold shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 px-2 py-1 mr-2">Remove</button>
          </div>

        </div>
        <div class="flex -space-x-px">
          <div class="min-w-0 flex-1 relative">
            <Combobox as="div" v-model="values[index]">

                <ComboboxInput 
                  class="w-full rounded-none rounded-b-md border-0 bg-white py-1.5 pl-3 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" 
                  placeholder="Please make your selection"
                />

                <ComboboxButton class="absolute inset-y-0 right-0 z-20 flex items-center rounded-r-md px-2 focus:outline-none">
                  <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
                </ComboboxButton>

                <ComboboxOptions class="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  <ComboboxOption 
                    v-for="(item, i) in collectionStore.rows" 
                    :key="item[options.primaryKey]" 
                    :value="item[options.primaryKey]" 
                    as="template" 
                    v-slot="{ active, selected }"
                  >
                    

                    <li :class="['relative cursor-default select-none py-2 pl-3 pr-9', active ? 'bg-indigo-600 text-white' : 'text-gray-900']">
                      <div>
                        <div :class="['truncate text-gray-500', active ? 'text-indigo-200' : 'text-gray-500']">
                          {{options.storeName}} {{ item[options.primaryKey] }}
                        </div>
                        <div v-for="(value, key) in item" :class="['truncate', selected && 'font-semibold']">
                          <div v-if="value != '' && key != options.primaryKey">
                            {{key}}: {{ value }}
                          </div>
                        </div>
                      </div>

                      <span v-if="selected" :class="['absolute inset-y-0 right-0 flex items-center pr-4', active ? 'text-white' : 'text-indigo-600']">
                        <CheckIcon class="h-5 w-5" aria-hidden="true" />
                      </span>

                    </li>
                  </ComboboxOption>
                </ComboboxOptions>

            </Combobox>

          </div>
        </div>
      </div>
    </fieldset>


  </div>

</template>