<script setup>

const emit = defineEmits(['change', 'onCreate'])

const { subrows, subfields, title } = defineProps(['subrows', 'subfields', 'title'])

let recordData = ref({})

const createForm = ref()

</script>

<template>

	<div>

    <!-- <h1 class="text-5xl leading-6 text-gray-900">{{title}}</h1> -->

	  <div class="mb-12">
	    <div class="flex items-center">
	      <div class="flex-auto">
	        <h1 class="text-5xl leading-6 text-gray-900">{{title}}</h1>
	      </div>
	      <div>
	        <button type="button" class="block rounded-md bg-indigo-600 px-3 py-2 text-center text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600" @click="panel.enableAndShow({ mode: 'Create', data: recordData, store })">Add {{title}}</button>
	      </div>
	    </div>
	  </div>

    <div class="mt-8 flow-root overflow-x-auto overflow-y-hidden border border-gray-300 rounded-lg">
      <div class="-mt-2">
        <div class="inline-block min-w-full pt-4 px-2 align-middle">
          <table class="min-w-full border-separate border-spacing-0">
            <thead>
              <tr>
                <th v-for="(field) in subfields.filter(s => s.display)" scope="col" class="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 px-4 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter">{{field.name}}</th>

                <th scope="col" class="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 py-3.5 pl-3 pr-4 backdrop-blur backdrop-filter sm:pr-6 lg:pr-8"></th>
              </tr>
            </thead>
            <tbody>

              <tr v-for="(row, index) in subrows" :key="row._id">
                <td v-for="(field) in subfields.filter(s => s.display)" scope="col" :class="['whitespace-nowrap py-4 text-lg font-regular text-sm text-gray-900 px-4', index < subrows.length-1 ? 'border-b border-gray-300' : '']">
                  {{row[field.key]}}
                </td>

                <td :class="['text-right whitespace-nowrap py-4 text-sm font-medium text-gray-900 px-4', index < subrows.length-1 ? 'border-b border-gray-300' : '']">

                  <button type="button" @click="emit('onRemove', { data: subrows[index] })" class="text-red-600 hover:text-red-900 rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-100 inline-block mx-2">Remove</button>

                </td>
              </tr>

              <tr v-if="subrows.length == 0">
                <td class="whitespace-nowrap py-4 text-lg font-regular text-gray-400 px-4">
                  Nothing.
                </td>
              </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>





			<div>
			  <h2 class="text-2xl leading-6 text-gray-900">Create</h2>

				<DynamicFormTwo 
					ref="createForm"
					:data=recordData
					:fields=subfields
					:discard="false"
					@onSubmit="function(data) { 
						try {
							emit('onCreate', data)
							createForm.reset()
		          createForm.finish()
						}
						catch (err) {
		          createForm.error()
						}
					}"
				/>
			</div>

			<div>

			</div>

	</div>

</template>