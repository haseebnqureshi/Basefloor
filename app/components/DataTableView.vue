<script setup>

import { PlusIcon } from '@heroicons/vue/20/solid'

const { 
  labels,
  router,
  fields,
  rows,
  rowActions,
} = defineProps([
  'labels',
  'router',
  'fields',
  'rows',
  'rowActions',
])

const emit = defineEmits([
  'onChange', // ({ mode, id, data }) => {}
  'onCreate', // ({ mode, id, data }) => {}
  'onUpdate', // ({ mode, id, data }) => {}
  'onDelete', // ({ mode, id, data }) => {}
  'onRowAction',
])

const panel = usePanelStore()

let recordData = ref({})

</script>

<template>

  <div class="mb-8 border-b pb-12">
    <div class="md:flex items-center">
      <div class="md:flex-auto mb-4 md:mb-0">
        <h1 class="text-4xl text-gray-900">{{labels.plural}}</h1>
      </div>
      <div>
        <button 
          type="button" 
          class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" 
          @click="panel.init('Create', { 
            recordData, 
            labels, 
            fields,
            onSubmit: async payload => emit('onCreate', payload),
            onChange: async payload => emit('onChange', payload),
          })"
        >Add {{labels.singular}}</button>
      </div>
    </div>

    <div class="mt-8 flow-root overflow-x-auto overflow-y-hidden border border-gray-300 rounded-lg">
      <div class="-mt-2">
        <div class="inline-block min-w-full pt-4 px-2 align-middle">
          <table class="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th 
                  v-for="{ name } in fields.filter(f => f.display)" 
                  scope="col" 
                  class="sticky top-0 z-2 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 px-4 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter"
                >{{name}}</th>

                <th scope="col" class="sticky top-0 z-2 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-3 pr-4 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"></th>
              </tr>
            </thead>
            <tbody>

              <tr v-for="(row, index) in rows" :key="row._id">
                <td 
                  v-for="field in fields.filter(f => f.display)" 
                  scope="col" 
                  :class="[
                    'whitespace-nowrap py-4 text-lg font-regular text-gray-900 px-4', 
                    index < rows.length-1 ? 'border-b border-gray-300' : ''
                  ]"
                >
                  <NuxtLink :to="router ? `/app/${router.slug}/${row._id}` : ''">
                    {{field.value ? field.value(row) : row[field.key]}}
                  </NuxtLink>

                </td>

                <td :class="[
                  'text-right whitespace-nowrap py-4 text-sm font-medium text-gray-900 px-4', 
                  index < rows.length-1 ? 'border-b border-gray-300' : ''
                ]">
                  
                  <span v-if="router">
                    <NuxtLink 
                      v-if="router.slug" 
                      :to="`/app/${router.slug}/${row._id}`" 
                      class="text-indigo-600 hover:text-indigo-900 rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100 cursor mx-2"
                    >View</NuxtLink>
                  </span>

                  <button 
                    type="button" 
                    class="text-gray-600 hover:text-gray-900 rounded bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 inline-block mx-2"
                    @click="panel.init('Edit', { 
                      recordData: rows[index],
                      labels,
                      fields,
                      onSubmit: async payload => emit('onUpdate', payload),
                      onChange: async payload => emit('onChange', payload),
                    })" 
                  >Edit</button>

                  <button 
                    type="button" 
                    class="text-gray-600 hover:text-gray-900 rounded bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 inline-block mx-2"
                    @click="panel.init('Delete', { 
                      recordData: rows[index],
                      labels,
                      fields,
                      onSubmit: async payload => emit('onDelete', payload),
                      onChange: async payload => emit('onChange', payload),
                    })"
                  >Delete</button>

                  <button 
                    v-for="(label, i) in Object.keys(rowActions || {})"
                    type="button" 
                    class="text-indigo-600 hover:text-indigo-900 rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100 inline-block mx-2"
                    @click="emit('onRowAction', { id: row._id, record: row, emit: Object.values(rowActions)[i] })"
                  >{{label}}</button>

                </td>
              </tr>

              <tr v-if="rows.length == 0">
                <td class="whitespace-nowrap py-4 text-lg font-regular text-gray-400 px-4">
                  <button 
                    type="button" 
                    class="font-regular"
                    @click="panel.init('Create', { 
                      recordData, 
                      labels,
                      fields, 
                      onSubmit: async payload => emit('onCreate', payload),
                      onChange: async payload => emit('onChange', payload),
                    })" 
                  >Nothing. Go create a {{labels.singular}}.</button>
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="mt-4 pr-10 leading-relaxed text-gray-600 text-sm">
      <p><slot name="footerText"></slot></p>
    </div>

    <div class="mt-4 -mb-8">
      <slot name="footer"></slot>
    </div>

  </div>

</template>

