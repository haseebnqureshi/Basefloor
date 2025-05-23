
<script setup>

/*
TODO:

FINISHED:
- incorporate pinia state management
- ensure events bubble up and allow for api requests
- edit and delete states confused on "esc" panel
- add pending and finished states to panel's server requests (button states)
- consolidate editSlideOver into this one vue file
- make delete the same slideover as the edit -- keep the ux consistent
- enable slideover for createNew
- pending states spinner, bg from black to prop color passed
- error handling for remote hooks

*/

const { store } = defineProps(['store'])

const headers = store.fields.filter(field => field.table === true)

const slideOver = useSlideOverRecordStore()

</script>

<template>

  <div class="rounded overflow-hidden shadow-lg ring-1 ring-gray-300 rounded-lg mb-12">

    <div class="bg-white px-4 py-6 sm:px-6">
      <div class="-ml-4 -mt-2 flex flex-wrap items-center justify-between sm:flex-nowrap">
        <div class="ml-6 mt-2">
          <h3 class="text-base font-semibold leading-6 text-gray-900">
            
            <!-- <template #heading></template> -->
            <slot name="heading">{{store.labels.plural}}</slot>
          
          </h3>
        </div>
        <div class="ml-4 mt-2 flex-shrink-0">
          <button 
            type="button" 
            @click="slideOver.enableAndShow({ store, mode: 'Create' })" 
            class="relative inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">

            <!-- <template #buttonCreate></template> -->
            <slot name="buttonCreate">Create New {{store.labels.singular}}</slot>

          </button>
        </div>
      </div>
    </div>

    <div class="mx-8 mb-2 mt-4 flow-root">
      <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div class="inline-block min-w-full align-middle">
          <table class="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th v-for="(header, i) in headers" :key="header.key" :class="[i === 0 ? 'py-3.5 pl-4 pr-3 sm:pl-6 lg:pl-8' : 'px-3 py-3.5', 'text-left text-sm font-semibold text-gray-900']">
                  {{header.name}}
                </th>
                <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6 lg:pr-8">
                  <span class="sr-only">Edit</span>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr v-for="(row, i) in store.rows" :key="'row_' + headers[0].key + '_' + i">
                <td v-for="(header, c) in headers" :key="header.key + '_' + i" :class="[c === 0 ? 'py-4 pl-4 pr-3 sm:pl-6 lg:pl-8' : 'px-3 py-4 ', 'whitespace-nowrap text-sm text-gray-900']">
                  {{row[header.key]}}
                </td>
                <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 lg:pr-8">

                  <button 
                    type="button" 
                    @click="slideOver.enableAndShow({ store, mode: 'Edit', data: store.rows[i] })" 
                    class="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Edit</button>
                  
                  <button 
                    type="button" 
                    @click="slideOver.enableAndShow({ store, mode: 'Delete', data: store.rows[i] })" 
                    class="px-2.5 py-1 text-sm font-semibold text-red-700 hover:text-red-800">Delete</button>

                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

  </div>

</template>
