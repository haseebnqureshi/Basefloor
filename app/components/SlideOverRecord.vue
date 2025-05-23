<script setup>

import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue'

import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/vue/24/outline'

const panel = usePanelStore()

let fullscreenMode = ref(false)

</script>

<template>

  <TransitionRoot as="template" :show="panel.show">
    <Dialog as="div" class="relative z-10" @close="panel.deactivate()">

      <TransitionChild as="template" enter="ease-in-out duration-200" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in-out duration-200" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0" />

      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">

            <TransitionChild as="template" enter="transform transition ease-in-out duration-200 sm:duration-240" enter-from="translate-x-full" enter-to="translate-x-0" leave="transform transition ease-in-out duration-200 sm:duration-240" leave-from="translate-x-0" leave-to="translate-x-full">
            
              <DialogPanel :class="['pointer-events-auto w-screen', fullscreenMode == true ? '' : 'max-w-md']">
                <div class="flex h-full flex-col divide-y divide-gray-200 bg-white shadow-xl">
                  <div class="flex min-h-0 flex-1 flex-col overflow-y-scroll py-6">
                    <div class="px-4 sm:px-6">
                      <div class="flex items-start justify-between">
                        <DialogTitle class="text-2xl leading-6 text-gray-900">
                          
                          <!-- <template #headingEdit></template> -->
                          <slot v-if="panel.mode == 'Edit'" name="headingEdit">
                            Edit {{panel.labels.singular}}
                          </slot>

                          <!-- <template #headingCreate></template> -->
                          <slot v-if="panel.mode == 'Create'" name="headingCreate">
                            Create {{panel.labels.singular}}
                          </slot>

                          <!-- <template #headingDelete></template> -->
                          <slot v-if="panel.mode == 'Delete'" name="headingDelete">
                            Delete {{panel.labels.singular}}
                          </slot>

                        </DialogTitle>
                        <div class="ml-3 flex h-7 items-center">
                          <button v-if="fullscreenMode == false" type="button" class="relative top-0.5 ml-2 rounded-md bg-white text-gray-600 hover:text-gray-400 focus:outline-none ring-1 ring-gray-300 p-1 focus:ring-2 focus:ring-gray-400" @click="fullscreenMode = true">
                            <span class="absolute -inset-2.5" />
                            <span class="sr-only">Enter fullscreen</span>
                            <ArrowsPointingOutIcon class="h-6 w-6" aria-hidden="true" />
                          </button>
                          <button v-if="fullscreenMode == true" type="button" class="relative top-0.5 ml-2 rounded-md bg-white text-gray-600 hover:text-gray-400 focus:outline-none ring-1 ring-gray-300 p-1 focus:ring-2 focus:ring-gray-400" @click="fullscreenMode = false">
                            <span class="absolute -inset-2.5" />
                            <span class="sr-only">Exit fullscreen</span>
                            <ArrowsPointingInIcon class="h-6 w-6" aria-hidden="true" />
                          </button>
                          <button type="button" class="relative top-0.5 ml-2 rounded-md bg-white text-gray-600 hover:text-gray-400 focus:outline-none ring-1 ring-gray-300 p-1 focus:ring-2 focus:ring-gray-400" @click="panel.deactivate()">
                            <span class="absolute -inset-2.5" />
                            <span class="sr-only">Close panel</span>
                            <XMarkIcon class="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div class="relative mt-6 flex-1 px-4 sm:px-6">

                      <!-- FORM CONTENT START -->

                      <div v-if="panel.mode == 'Delete'">
                        <ul class="list-disc pl-4 mb-4">
                          <li><strong>{{panel.labels.display(panel.record.data)}} ({{panel.record.data[panel.fields.identifier.key]}})</strong></li>
                        </ul>
                        <p>Deleting this {{panel.labels.singular.toLowerCase()}} will remove it completely. Are you sure you want to delete it?</p>
                      </div>

                      <div 
                        v-if="panel.mode == 'Create'" 
                        v-for="(field, i) in panel.fields.all.filter(f => !f.hideForCreate)" 
                        :key="`edit_${field.key}`" 
                        class="mb-6"
                      >
                        <DynamicField 
                          :field="field" 
                          :value="panel.record.data[field.key]"
                          @change="panel.change"
                        />
                      </div>

                      <div 
                        v-if="panel.mode == 'Edit'" 
                        v-for="(field, i) in panel.fields.all.filter(f => !f.hideForEdit)" 
                        :key="`edit_${field.key}`" 
                        class="mb-6"
                      >
                        <DynamicField 
                          :field="field" 
                          :value="panel.record.data[field.key]"
                          @change="panel.change"
                        />
                      </div>

                      <!-- FORM CONTENT END -->

                    </div>
                  </div>
                  <div 
                    v-if="panel.mode == 'Edit' || panel.mode == 'Create'" 
                    class="flex flex-shrink-0 justify-end px-4 py-4"
                  >

                    <button 
                      type="button" 
                      class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400" 
                      @click="panel.deactivate()"
                    >
                      <span v-if="panel.record.changed == false">Close</span>
                      <span v-if="panel.record.changed == true">Discard Changes</span>
                    </button>

                    <button 
                      type="submit" 
                      class="ml-4 inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                      v-if="panel.record.changed == true" 
                      :disabled="panel.pending" 
                      @click="panel.submit()"
                    >
                      <ButtonSpinner v-if="panel.pending" />
                      <span v-if="panel.mode == 'Edit' && !panel.error">Save & Close</span>
                      <span v-if="panel.mode == 'Create' && !panel.error">Create</span>
                      <span v-if="panel.error">Error! Please try again.</span>
                    </button>

                  </div>

                  <div 
                    v-if="panel.mode == 'Delete'" 
                    class="flex flex-shrink-0 justify-end px-4 py-4"
                  >
                    
                    <button 
                      type="button" 
                      @click="panel.deactivate()"
                      class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:ring-gray-400"
                    >Cancel</button>

                    <button 
                      type="submit" 
                      class="ml-4 inline-flex justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                      :disabled="panel.pending" 
                      @click="panel.submit()"
                    >
                      <ButtonSpinner v-if="panel.pending" />
                      <span v-if="panel.error">Error! Please try again.</span>
                      <span v-if="!panel.error">Delete {{panel.labels.singular}}</span>
                    </button>

                  </div>

                </div>

              </DialogPanel>

            </TransitionChild>
          
          </div>

        </div>

      </div>

    </Dialog>

  </TransitionRoot>

</template>
