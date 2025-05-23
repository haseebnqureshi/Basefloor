<script setup>
import { PlusIcon } from '@heroicons/vue/20/solid'

const { 
  labels,
  router,
  fields,
  rows,
  rowActions,
  enableRowHighlight = false,
  showAddButton = true,
  customColors = null,
  fullWidth = true,
  showBorder = false,
} = defineProps([
  'labels',
  'router',
  'fields',
  'rows',
  'rowActions',
  'enableRowHighlight',
  'showAddButton',
  'customColors',
  'fullWidth',
  'showBorder',
])

const emit = defineEmits([
  'onChange', // ({ mode, id, data }) => {}
  'onCreate', // ({ mode, id, data }) => {}
  'onUpdate', // ({ mode, id, data }) => {}
  'onDelete', // ({ mode, id, data }) => {}
  'onRowAction',
  'onRowClick',
])

const panel = usePanelStore()
let recordData = ref({})
const highlightedRowIndex = ref(null)

// Default colors for status indicators
const defaultColors = {
  complete: 'text-green-700 bg-green-50',
  pending: 'text-indigo-700 bg-indigo-50',
  incomplete: 'text-gray-600 bg-gray-100',
  no: 'text-gray-600 bg-gray-100',
}

const colors = customColors || defaultColors

const highlightRow = index => {
  if (!enableRowHighlight) return
  
  if (highlightedRowIndex.value === index) {
    highlightedRowIndex.value = null
  } else {
    highlightedRowIndex.value = index
  }
  
  emit('onRowClick', { index, row: rows[index] })
}
</script>

<template>
  <div class="mb-8 border-b pb-10" :class="{ 'max-w-fit mx-auto': !fullWidth }">
    <div class="md:flex items-center">
      <div class="md:flex-auto mb-4 md:mb-0">
        <h1 class="text-4xl text-gray-900">{{ labels.plural }}</h1>
        <p v-if="labels.description" class="text-gray-400 text-sm mt-4">{{ labels.description }}</p>
      </div>
      <div v-if="showAddButton">
        <button 
          type="button" 
          class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" 
          @click="panel.init('Create', { 
            recordData, 
            labels, 
            fields,
            onSubmit: async payload => emit('onCreate', payload),
            onChange: async payload => emit('onChange', payload),
          })"
        >Add {{ labels.singular }}</button>
      </div>
    </div>

    <!-- Slot for custom buttons or controls above the table -->
    <div class="mt-4">
      <slot name="tableControls"></slot>
    </div>

    <!-- Slot for custom info display -->
    <div class="mt-2">
      <slot name="infoDisplay"></slot>
    </div>

    <div class="mt-8 flow-root" :class="{ 'border border-gray-300 rounded-lg overflow-hidden': showBorder }">
      <div :class="[
        showBorder ? 'overflow-x-auto' : '-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8'
      ]">
        <div :class="[
          'inline-block min-w-full -mt-3 align-middle',
          showBorder ? 'px-2 pt-4' : 'sm:px-6 lg:px-8'
        ]">
          <table class="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th 
                  v-for="(field, index) in fields.filter(f => f.display)" 
                  :key="index"
                  scope="col" 
                  :class="[
                    'whitespace-nowrap py-3.5 text-left text-sm font-semibold text-gray-900',
                    index === 0 ? (showBorder ? 'pl-4 pr-3' : 'pl-4 pr-3 sm:pl-0') : 'px-2'
                  ]"
                >
                  {{ field.name }}
                  <span v-if="field.count !== undefined">({{ field.count }})</span>
                </th>
                <th 
                  v-if="rowActions || router"
                  scope="col" 
                  class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                  :class="{ 'pr-4': showBorder }"
                ></th>
                <th 
                  v-if="$slots.actionColumn"
                  scope="col" 
                  class="whitespace-nowrap px-2 py-3.5 text-left text-sm font-semibold text-gray-900"
                  :class="{ 'pr-4 sm:pr-6': showBorder }"
                ></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 bg-white">
              <tr 
                v-for="(row, index) in rows" 
                :key="row._id || index" 
                @click="highlightRow(index)"
                :class="enableRowHighlight && index === highlightedRowIndex ? 'cursor-pointer' : ''"
              >
                <td 
                  v-for="(field, fieldIndex) in fields.filter(f => f.display)" 
                  :key="fieldIndex"
                  :class="[
                    'whitespace-nowrap py-2 text-sm',
                    fieldIndex === 0 ? (showBorder ? 'pl-4 pr-3' : 'pl-4 pr-3 sm:pl-0') : 'px-2',
                    field.centered ? 'text-center' : '',
                    field.status ? 'uppercase font-medium' : '',
                    field.status && row[field.statusKey] ? colors[row[field.statusKey]] : '',
                    enableRowHighlight && index === highlightedRowIndex ? 'bg-yellow-100' : '',
                  ]"
                >
                  <template v-if="router && fieldIndex === 0">
                    <NuxtLink :to="router ? `/app/${router.slug}/${row._id}` : ''">
                      {{ field.value ? field.value(row) : row[field.key] }}
                    </NuxtLink>
                    <div v-if="field.subtext && row[field.subtext]" class="text-xs mt-2 text-gray-400">{{ row[field.subtext] }}</div>
                  </template>
                  <template v-else>
                    <span>{{ field.value ? field.value(row) : row[field.key] }}</span>
                    <div v-if="field.subtext && row[field.subtext]" class="text-xs mt-2 text-gray-400">{{ row[field.subtext] }}</div>
                  </template>
                  
                  <!-- Field-specific action button -->
                  <button
                    v-if="field.action && field.actionCondition && field.actionCondition(row)"
                    type="button"
                    :class="field.actionClass || 'ml-2 text-gray-600 hover:text-gray-900 rounded bg-gray-50 px-4 py-0.5 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 border border-gray-300'"
                    @click.stop="field.actionHandler(row, index)"
                  >{{ field.actionLabel }}</button>
                </td>

                <!-- Standard actions column -->
                <td :class="[
                  'text-right whitespace-nowrap py-4 text-sm font-medium text-gray-900 px-4', 
                  index < rows.length-1 ? 'border-b border-gray-300' : '',
                  enableRowHighlight && index === highlightedRowIndex ? 'bg-yellow-100' : '',
                  showBorder ? 'pr-4 sm:pr-6' : ''
                ]">
                  <span v-if="router">
                    <NuxtLink 
                      v-if="router.slug" 
                      :to="`/app/${router.slug}/${row._id}`" 
                      class="text-indigo-600 hover:text-indigo-900 rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100 cursor mx-1"
                      @click.stop
                    >View</NuxtLink>
                  </span>

                  <button 
                    type="button" 
                    class="text-gray-600 hover:text-gray-900 rounded bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 inline-block mx-1"
                    @click.stop="panel.init('Edit', { 
                      recordData: rows[index],
                      labels,
                      fields,
                      onSubmit: async payload => emit('onUpdate', payload),
                      onChange: async payload => emit('onChange', payload),
                    })" 
                  >Edit</button>

                  <button 
                    type="button" 
                    class="text-gray-600 hover:text-gray-900 rounded bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-600 shadow-sm hover:bg-gray-100 inline-block mx-1"
                    @click.stop="panel.init('Delete', { 
                      recordData: rows[index],
                      labels,
                      fields,
                      onSubmit: async payload => emit('onDelete', payload),
                      onChange: async payload => emit('onChange', payload),
                    })"
                  >Delete</button>

                  <button 
                    v-for="(label, i) in Object.keys(rowActions || {})"
                    :key="i"
                    type="button" 
                    class="text-indigo-600 hover:text-indigo-900 rounded bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 shadow-sm hover:bg-indigo-100 inline-block mx-1"
                    @click.stop="emit('onRowAction', { id: row._id, record: row, emit: Object.values(rowActions)[i] })"
                  >{{ label }}</button>
                </td>

                <!-- Custom action column -->
                <td 
                  v-if="$slots.actionColumn"
                  class="whitespace-nowrap px-2 py-2 text-sm font-medium text-gray-900"
                  :class="{ 'pr-4 sm:pr-6': showBorder }"
                >
                  <slot name="actionColumn" :row="row" :index="index"></slot>
                </td>
              </tr>

              <tr v-if="rows.length === 0">
                <td 
                  :colspan="fields.filter(f => f.display).length + (rowActions || router ? 1 : 0) + ($slots.actionColumn ? 1 : 0)"
                  class="whitespace-nowrap py-4 text-sm font-regular text-gray-400 px-4 text-center"
                  :class="{ 'pl-4': showBorder }"
                >
                  <button 
                    v-if="showAddButton"
                    type="button" 
                    class="font-regular"
                    @click="panel.init('Create', { 
                      recordData, 
                      labels,
                      fields, 
                      onSubmit: async payload => emit('onCreate', payload),
                      onChange: async payload => emit('onChange', payload),
                    })" 
                  >Nothing found. Create a new {{ labels.singular }}.</button>
                  <span v-else>No data available.</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Footer slot for additional content -->
    <div class="mt-4">
      <slot name="footer"></slot>
    </div>

    <!-- Footer text slot -->
    <div class="mt-4 pr-10 leading-relaxed text-gray-600 text-sm">
      <slot name="footerText"></slot>
    </div>
  </div>
</template>

<style scoped>
.flow-root {
  /* Uncomment if you want to limit the table height
  max-height: 440px;
  overflow-y: auto;
  */
}
</style> 